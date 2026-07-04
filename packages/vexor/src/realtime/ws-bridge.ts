/**
 * WebSocket bridge: connects `app.ws(path, handlers)` registrations to a
 * real socket implementation.
 *
 * Node.js support uses the standard `ws` package (an optional peer
 * dependency) through the HTTP server's `upgrade` event. Other runtimes
 * receive a descriptive error for now.
 */

import type { Server, IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { RadixRouter } from '../router/radix.js';
import {
  WebSocketClient,
  type WebSocketServer,
  generateConnectionId,
  type WSRouteOptions,
} from './websocket.js';
import { incomingMessageToRequest } from '../adapters/node.js';
import { createRequest } from '../core/request.js';
import { VexorContext } from '../core/context.js';
import type { RouteParams } from '../core/types.js';

/**
 * Registry of WebSocket routes; supports `:params` and trailing wildcards
 * through the same radix router the HTTP routes use.
 */
export class WsRouteRegistry {
  private router = new RadixRouter();
  private routeCount = 0;

  add(path: string, options: WSRouteOptions): void {
    // The router stores handlers; wrap the options in a carrier closure
    this.router.add('GET', path, (() => options) as never);
    this.routeCount++;
  }

  get size(): number {
    return this.routeCount;
  }

  match(path: string): { options: WSRouteOptions; params: RouteParams } | null {
    const result = this.router.find('GET', path);
    if (!result) return null;
    const carrier = result.route.handler as unknown as () => WSRouteOptions;
    return { options: carrier(), params: result.params };
  }
}

/** The subset of the `ws` package we rely on */
interface RawSocket {
  readyState: number;
  send(data: unknown): void;
  close(code?: number, reason?: string): void;
  ping(data?: unknown): void;
  on(event: string, listener: (...args: never[]) => void): void;
}

/**
 * Attach upgrade handling to a Node HTTP server.
 * Loads the `ws` package lazily so it stays an optional dependency.
 */
export async function attachNodeWebSockets(
  server: Server,
  registry: WsRouteRegistry,
  wsServer: WebSocketServer
): Promise<void> {
  let wsModule: typeof import('ws');
  try {
    wsModule = await import('ws');
  } catch {
    throw new Error(
      "app.ws() on Node.js requires the 'ws' package. Install it with: npm install ws"
    );
  }

  const nodeWss = new wsModule.WebSocketServer({ noServer: true });

  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const match = registry.match(url.pathname);

    if (!match) {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    nodeWss.handleUpgrade(req, socket, head, (rawWs) => {
      handleConnection(rawWs as unknown as RawSocket, req, match, wsServer);
    });
  });
}

function handleConnection(
  rawWs: RawSocket,
  req: IncomingMessage,
  match: { options: WSRouteOptions; params: RouteParams },
  wsServer: WebSocketServer
): void {
  const { handlers } = match.options;

  // Build a context from the upgrade request so handlers can read
  // params, query, headers, and cookies like any HTTP handler
  const request = incomingMessageToRequest(req);
  const vexorRequest = createRequest(request, req);
  vexorRequest.setParams(match.params);
  const ctx = new VexorContext();
  ctx.init(vexorRequest);

  const id = generateConnectionId();
  const remoteAddress = req.socket?.remoteAddress ?? '';
  const client = new WebSocketClient(
    rawWs as unknown as WebSocket,
    id,
    remoteAddress,
    wsServer,
    {} as unknown
  );

  wsServer.addClient(client);
  void handlers.open?.(client, ctx);

  rawWs.on('message', ((data: Buffer, isBinary: boolean) => {
    let payload: unknown = data;
    if (!isBinary) {
      const text = data.toString();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }
    void handlers.message?.(client, payload, ctx);
  }) as never);

  rawWs.on('close', ((code: number, reason: Buffer) => {
    wsServer.removeClient(id);
    void handlers.close?.(client, code, reason?.toString() ?? '', ctx);
  }) as never);

  rawWs.on('error', ((error: Error) => {
    void handlers.error?.(client, error, ctx);
  }) as never);

  rawWs.on('ping', ((data: Buffer) => {
    handlers.ping?.(client, bufferToArrayBuffer(data));
  }) as never);

  rawWs.on('pong', ((data: Buffer) => {
    handlers.pong?.(client, bufferToArrayBuffer(data));
  }) as never);
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}
