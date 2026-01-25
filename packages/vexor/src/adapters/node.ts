/**
 * Node.js HTTP Adapter
 *
 * Converts Node.js http.IncomingMessage to VexorRequest
 * and Response to http.ServerResponse.
 */

import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'http';
import { VexorRequest, createRequest } from '../core/request.js';
import type { RuntimeCapabilities, RuntimeType } from '../core/types.js';

/**
 * Node.js runtime adapter capabilities
 */
export const nodeCapabilities: RuntimeCapabilities = {
  http2: true,
  streaming: true,
  websocket: true,
  workerThreads: true,
  fileSystem: true,
};

/**
 * Runtime type
 */
export const runtimeType: RuntimeType = 'node';

/**
 * Convert Node.js IncomingMessage to Web Standards Request
 */
export function incomingMessageToRequest(
  req: IncomingMessage,
  body?: Buffer | null
): Request {
  // Build the full URL
  const protocol = (req.socket as { encrypted?: boolean }).encrypted ? 'https' : 'http';
  const host = req.headers.host ?? 'localhost';
  const url = `${protocol}://${host}${req.url ?? '/'}`;

  // Convert headers
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else {
        headers.set(key, value);
      }
    }
  }

  // Determine if request has body
  const method = req.method ?? 'GET';
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  // Create Request options
  const init: RequestInit = {
    method,
    headers,
  };

  // Add body if present (convert Buffer to Uint8Array for Web API compatibility)
  if (hasBody && body) {
    init.body = new Uint8Array(body.buffer, body.byteOffset, body.byteLength) as BodyInit;
  }

  return new Request(url, init);
}

/**
 * Read request body from IncomingMessage
 */
export function readBody(req: IncomingMessage, maxSize = 10 * 1024 * 1024): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    // Skip body reading for methods that shouldn't have one
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method ?? 'GET')) {
      resolve(null);
      return;
    }

    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > maxSize) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : null);
    });

    req.on('error', reject);
  });
}

/**
 * Convert VexorRequest back to Node.js IncomingMessage (for raw access)
 */
export function toVexorRequest(
  req: IncomingMessage,
  body?: Buffer | null
): VexorRequest {
  const request = incomingMessageToRequest(req, body);
  return createRequest(request, req);
}

/**
 * Write Response to ServerResponse
 */
export async function writeResponse(res: ServerResponse, response: Response): Promise<void> {
  // Set status
  res.statusCode = response.status;
  res.statusMessage = response.statusText || '';

  // Set headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Write body
  if (response.body) {
    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  res.end();
}

/**
 * Request handler function type
 */
export type RequestHandler = (request: VexorRequest) => Response | Promise<Response>;

/**
 * Create a Node.js HTTP server with the given handler
 */
export function createNodeServer(handler: RequestHandler, maxBodySize?: number): Server {
  return createServer(async (req, res) => {
    try {
      // Read body
      const body = await readBody(req, maxBodySize);

      // Convert to VexorRequest
      const vexorRequest = toVexorRequest(req, body);

      // Call handler
      const response = await handler(vexorRequest);

      // Write response
      await writeResponse(res, response);
    } catch (error) {
      // Handle errors
      console.error('Request error:', error);

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal Server Error',
          code: 'INTERNAL_ERROR',
        }));
      }
    }
  });
}

/**
 * Server options
 */
export interface NodeServerOptions {
  port?: number;
  host?: string;
  maxBodySize?: number;
  keepAliveTimeout?: number;
}

/**
 * Start a Node.js HTTP server
 */
export function startNodeServer(
  handler: RequestHandler,
  options: NodeServerOptions = {}
): Promise<Server> {
  const {
    port = 3000,
    host = '0.0.0.0',
    maxBodySize,
    keepAliveTimeout = 5000,
  } = options;

  return new Promise((resolve, reject) => {
    const server = createNodeServer(handler, maxBodySize);

    server.keepAliveTimeout = keepAliveTimeout;

    server.on('error', reject);

    server.listen(port, host, () => {
      resolve(server);
    });
  });
}

/**
 * NodeAdapter class for integration with Vexor app
 */
export class NodeAdapter {
  private server?: Server;
  private handler: RequestHandler;
  private options: NodeServerOptions;

  constructor(handler: RequestHandler, options: NodeServerOptions = {}) {
    this.handler = handler;
    this.options = options;
  }

  /**
   * Start the server
   */
  async listen(port?: number, host?: string): Promise<Server> {
    const options = {
      ...this.options,
      ...(port !== undefined && { port }),
      ...(host !== undefined && { host }),
    };

    this.server = await startNodeServer(this.handler, options);
    return this.server;
  }

  /**
   * Stop the server
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get the underlying server
   */
  getServer(): Server | undefined {
    return this.server;
  }

  /**
   * Get server address
   */
  address(): { port: number; host: string } | null {
    const addr = this.server?.address();
    if (addr && typeof addr === 'object') {
      return {
        port: addr.port,
        host: addr.address,
      };
    }
    return null;
  }
}
