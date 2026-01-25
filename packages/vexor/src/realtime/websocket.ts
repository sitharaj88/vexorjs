/**
 * WebSocket Handler
 *
 * Type-safe WebSocket support with rooms, pub/sub,
 * and automatic reconnection handling.
 */

import type { VexorContext } from '../core/context.js';

/**
 * WebSocket message types
 */
export type WSMessage = string | ArrayBuffer | Uint8Array;

/**
 * WebSocket event handlers
 */
export interface WSEventHandlers<T = unknown> {
  /** Connection opened */
  open?: (ws: VexorWebSocket<T>, ctx: VexorContext) => void | Promise<void>;
  /** Message received */
  message?: (ws: VexorWebSocket<T>, data: unknown, ctx: VexorContext) => void | Promise<void>;
  /** Connection closed */
  close?: (ws: VexorWebSocket<T>, code: number, reason: string, ctx: VexorContext) => void | Promise<void>;
  /** Error occurred */
  error?: (ws: VexorWebSocket<T>, error: Error, ctx: VexorContext) => void | Promise<void>;
  /** Ping received */
  ping?: (ws: VexorWebSocket<T>, data: ArrayBuffer) => void;
  /** Pong received */
  pong?: (ws: VexorWebSocket<T>, data: ArrayBuffer) => void;
}

/**
 * WebSocket route options
 */
export interface WSRouteOptions<T = unknown> {
  /** Message schema for validation */
  messageSchema?: unknown;
  /** Maximum message size in bytes */
  maxPayloadLength?: number;
  /** Idle timeout in seconds */
  idleTimeout?: number;
  /** Compression enabled */
  compression?: boolean;
  /** Event handlers */
  handlers: WSEventHandlers<T>;
}

/**
 * WebSocket client connection
 */
export interface VexorWebSocket<T = unknown> {
  /** Unique connection ID */
  readonly id: string;
  /** Connection state */
  readonly readyState: number;
  /** Custom data attached to this connection */
  data: T;
  /** Remote address */
  readonly remoteAddress: string;
  /** Subscribed topics */
  readonly topics: Set<string>;

  /** Send a message */
  send(message: WSMessage): void;
  /** Send JSON data */
  json(data: unknown): void;
  /** Close the connection */
  close(code?: number, reason?: string): void;
  /** Subscribe to a topic */
  subscribe(topic: string): void;
  /** Unsubscribe from a topic */
  unsubscribe(topic: string): void;
  /** Check if subscribed to topic */
  isSubscribed(topic: string): boolean;
  /** Publish to a topic (excludes self) */
  publish(topic: string, message: WSMessage): void;
  /** Ping the client */
  ping(data?: ArrayBuffer): void;
}

/**
 * WebSocket server interface
 */
export interface WSServer {
  /** All connected clients */
  readonly clients: Map<string, VexorWebSocket>;
  /** Publish to all subscribers of a topic */
  publish(topic: string, message: WSMessage): void;
  /** Broadcast to all connected clients */
  broadcast(message: WSMessage): void;
  /** Get clients subscribed to a topic */
  getSubscribers(topic: string): VexorWebSocket[];
  /** Close all connections */
  closeAll(code?: number, reason?: string): void;
}

/**
 * WebSocket implementation using native WebSocket
 */
export class WebSocketClient<T = unknown> implements VexorWebSocket<T> {
  readonly id: string;
  readonly remoteAddress: string;
  readonly topics = new Set<string>();
  data: T;

  private ws: WebSocket;
  private server: WebSocketServer;

  constructor(
    ws: WebSocket,
    id: string,
    remoteAddress: string,
    server: WebSocketServer,
    data: T
  ) {
    this.ws = ws;
    this.id = id;
    this.remoteAddress = remoteAddress;
    this.server = server;
    this.data = data;
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  send(message: WSMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      if (message instanceof Uint8Array) {
        this.ws.send(message);
      } else if (message instanceof ArrayBuffer) {
        this.ws.send(new Uint8Array(message));
      } else {
        this.ws.send(message);
      }
    }
  }

  json(data: unknown): void {
    this.send(JSON.stringify(data));
  }

  close(code = 1000, reason = ''): void {
    this.ws.close(code, reason);
  }

  subscribe(topic: string): void {
    this.topics.add(topic);
    this.server.addToTopic(topic, this);
  }

  unsubscribe(topic: string): void {
    this.topics.delete(topic);
    this.server.removeFromTopic(topic, this);
  }

  isSubscribed(topic: string): boolean {
    return this.topics.has(topic);
  }

  publish(topic: string, message: WSMessage): void {
    this.server.publishExcluding(topic, message, this.id);
  }

  ping(_data?: ArrayBuffer): void {
    // Ping is handled by the WebSocket protocol automatically
    // For manual ping, we'd send a ping frame
  }
}

/**
 * WebSocket server manager
 */
export class WebSocketServer implements WSServer {
  readonly clients = new Map<string, VexorWebSocket>();
  private topics = new Map<string, Set<string>>();
  private routes = new Map<string, WSRouteOptions>();

  /**
   * Register a WebSocket route
   */
  route<T = unknown>(path: string, options: WSRouteOptions<T>): void {
    this.routes.set(path, options as WSRouteOptions);
  }

  /**
   * Get route options for a path
   */
  getRoute(path: string): WSRouteOptions | undefined {
    return this.routes.get(path);
  }

  /**
   * Add client to server
   */
  addClient(client: VexorWebSocket): void {
    this.clients.set(client.id, client);
  }

  /**
   * Remove client from server
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove from all topics
      for (const topic of client.topics) {
        this.removeFromTopic(topic, client);
      }
      this.clients.delete(clientId);
    }
  }

  /**
   * Add client to topic
   */
  addToTopic(topic: string, client: VexorWebSocket): void {
    let subscribers = this.topics.get(topic);
    if (!subscribers) {
      subscribers = new Set();
      this.topics.set(topic, subscribers);
    }
    subscribers.add(client.id);
  }

  /**
   * Remove client from topic
   */
  removeFromTopic(topic: string, client: VexorWebSocket): void {
    const subscribers = this.topics.get(topic);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.topics.delete(topic);
      }
    }
  }

  /**
   * Publish to all subscribers of a topic
   */
  publish(topic: string, message: WSMessage): void {
    const subscribers = this.topics.get(topic);
    if (!subscribers) return;

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client) {
        client.send(message);
      }
    }
  }

  /**
   * Publish excluding a specific client
   */
  publishExcluding(topic: string, message: WSMessage, excludeId: string): void {
    const subscribers = this.topics.get(topic);
    if (!subscribers) return;

    for (const clientId of subscribers) {
      if (clientId !== excludeId) {
        const client = this.clients.get(clientId);
        if (client) {
          client.send(message);
        }
      }
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(message: WSMessage): void {
    for (const client of this.clients.values()) {
      client.send(message);
    }
  }

  /**
   * Get all clients subscribed to a topic
   */
  getSubscribers(topic: string): VexorWebSocket[] {
    const subscribers = this.topics.get(topic);
    if (!subscribers) return [];

    const clients: VexorWebSocket[] = [];
    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client) {
        clients.push(client);
      }
    }
    return clients;
  }

  /**
   * Close all connections
   */
  closeAll(code = 1000, reason = 'Server shutdown'): void {
    for (const client of this.clients.values()) {
      client.close(code, reason);
    }
    this.clients.clear();
    this.topics.clear();
  }

  /**
   * Get topic statistics
   */
  getStats(): {
    clients: number;
    topics: number;
    subscriptions: Map<string, number>;
  } {
    const subscriptions = new Map<string, number>();
    for (const [topic, subscribers] of this.topics) {
      subscriptions.set(topic, subscribers.size);
    }

    return {
      clients: this.clients.size,
      topics: this.topics.size,
      subscriptions,
    };
  }
}

/**
 * Generate unique connection ID
 */
export function generateConnectionId(): string {
  return `ws_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create WebSocket upgrade response
 */
export function createUpgradeResponse(
  key: string,
  protocols?: string[],
  headers?: Record<string, string>
): Response {
  // Calculate WebSocket accept key
  const MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

  // In a real implementation, we'd compute SHA-1 hash
  // For now, this is a placeholder that would need crypto implementation
  const acceptKey = key + MAGIC_STRING; // Would be base64(sha1(key + MAGIC_STRING))

  const responseHeaders = new Headers({
    'Upgrade': 'websocket',
    'Connection': 'Upgrade',
    'Sec-WebSocket-Accept': acceptKey,
    ...headers,
  });

  if (protocols && protocols.length > 0) {
    responseHeaders.set('Sec-WebSocket-Protocol', protocols[0]);
  }

  return new Response(null, {
    status: 101,
    statusText: 'Switching Protocols',
    headers: responseHeaders,
  });
}

/**
 * Check if request is a WebSocket upgrade request
 */
export function isWebSocketUpgrade(request: Request): boolean {
  const upgrade = request.headers.get('Upgrade');
  const connection = request.headers.get('Connection');

  return Boolean(
    upgrade?.toLowerCase() === 'websocket' &&
    connection?.toLowerCase().includes('upgrade')
  );
}

/**
 * Get WebSocket key from request
 */
export function getWebSocketKey(request: Request): string | null {
  return request.headers.get('Sec-WebSocket-Key');
}

/**
 * Get requested protocols from request
 */
export function getRequestedProtocols(request: Request): string[] {
  const protocols = request.headers.get('Sec-WebSocket-Protocol');
  if (!protocols) return [];
  return protocols.split(',').map(p => p.trim());
}

/**
 * Global WebSocket server instance
 */
export const wsServer = new WebSocketServer();

/**
 * Create a WebSocket handler for use with Vexor
 */
export function createWebSocketHandler<T = unknown>(
  _options: WSRouteOptions<T>
): (ctx: VexorContext) => Promise<Response> {
  return async (ctx: VexorContext): Promise<Response> => {
    // Check if this is a WebSocket upgrade request
    if (!isWebSocketUpgrade(ctx.request)) {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const key = getWebSocketKey(ctx.request);
    if (!key) {
      return new Response('Missing Sec-WebSocket-Key', { status: 400 });
    }

    const protocols = getRequestedProtocols(ctx.request);

    // Create upgrade response
    // Note: Actual WebSocket handling depends on the runtime
    // This is the HTTP response part; the runtime adapter handles the actual connection
    return createUpgradeResponse(key, protocols);
  };
}
