/**
 * Node.js Adapter Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import {
  incomingMessageToRequest,
  readBody,
  writeResponse,
  NodeAdapter,
  nodeCapabilities,
  runtimeType,
} from '../adapters/node.js';
import type { IncomingMessage, ServerResponse } from 'node:http';

// ---------------------------------------------------------------------------
// Helpers – lightweight mocks for Node http objects
// ---------------------------------------------------------------------------

function createMockIncomingMessage(
  opts: {
    method?: string;
    url?: string;
    headers?: Record<string, string | string[]>;
    encrypted?: boolean;
  } = {}
): IncomingMessage {
  const emitter = new EventEmitter() as IncomingMessage & EventEmitter;
  (emitter as any).method = opts.method ?? 'GET';
  (emitter as any).url = opts.url ?? '/';
  (emitter as any).headers = opts.headers ?? {};
  (emitter as any).socket = { encrypted: opts.encrypted ?? false };
  (emitter as any).destroy = vi.fn();
  return emitter as unknown as IncomingMessage;
}

function createMockServerResponse(): ServerResponse & {
  _statusCode: number;
  _statusMessage: string;
  _headers: Record<string, string>;
  _body: Buffer[];
  _ended: boolean;
} {
  const res: any = {
    _statusCode: 200,
    _statusMessage: '',
    _headers: {} as Record<string, string>,
    _body: [] as Buffer[],
    _ended: false,

    set statusCode(code: number) {
      this._statusCode = code;
    },
    get statusCode() {
      return this._statusCode;
    },
    set statusMessage(msg: string) {
      this._statusMessage = msg;
    },
    get statusMessage() {
      return this._statusMessage;
    },
    setHeader(key: string, value: string) {
      this._headers[key] = value;
    },
    write(chunk: Uint8Array | string) {
      this._body.push(Buffer.from(chunk));
    },
    end() {
      this._ended = true;
    },
    headersSent: false,
  };
  return res;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Node Adapter', () => {
  describe('nodeCapabilities', () => {
    it('should expose expected runtime capabilities', () => {
      expect(nodeCapabilities.streaming).toBe(true);
      // The Node adapter serves HTTP/1.1 only (http.createServer)
      expect(nodeCapabilities.http2).toBe(false);
      expect(nodeCapabilities.websocket).toBe(true);
      expect(nodeCapabilities.workerThreads).toBe(true);
      expect(nodeCapabilities.fileSystem).toBe(true);
    });
  });

  describe('runtimeType', () => {
    it('should be "node"', () => {
      expect(runtimeType).toBe('node');
    });
  });

  // -----------------------------------------------------------------------
  // incomingMessageToRequest
  // -----------------------------------------------------------------------
  describe('incomingMessageToRequest', () => {
    it('should convert a basic GET request', () => {
      const msg = createMockIncomingMessage({
        method: 'GET',
        url: '/hello?foo=bar',
        headers: { host: 'example.com' },
      });

      const req = incomingMessageToRequest(msg);

      expect(req.method).toBe('GET');
      expect(req.url).toBe('http://example.com/hello?foo=bar');
      expect(req.body).toBeNull();
    });

    it('should use https when socket is encrypted', () => {
      const msg = createMockIncomingMessage({
        method: 'GET',
        url: '/secure',
        headers: { host: 'example.com' },
        encrypted: true,
      });

      const req = incomingMessageToRequest(msg);
      expect(req.url).toMatch(/^https:\/\//);
    });

    it('should default host to localhost when header is absent', () => {
      const msg = createMockIncomingMessage({ url: '/path' });
      const req = incomingMessageToRequest(msg);
      expect(req.url).toContain('localhost');
    });

    it('should convert single-value headers', () => {
      const msg = createMockIncomingMessage({
        headers: {
          host: 'example.com',
          'content-type': 'application/json',
          'x-custom': 'value',
        },
      });

      const req = incomingMessageToRequest(msg);
      expect(req.headers.get('content-type')).toBe('application/json');
      expect(req.headers.get('x-custom')).toBe('value');
    });

    it('should convert multi-value headers using append', () => {
      const msg = createMockIncomingMessage({
        headers: {
          host: 'example.com',
          'set-cookie': ['a=1', 'b=2'],
        },
      });

      const req = incomingMessageToRequest(msg);
      // Headers.append joins with ", "
      const cookie = req.headers.get('set-cookie');
      expect(cookie).toContain('a=1');
      expect(cookie).toContain('b=2');
    });

    it('should attach body for POST requests', () => {
      const msg = createMockIncomingMessage({
        method: 'POST',
        headers: { host: 'example.com' },
      });
      const body = Buffer.from('hello world');

      const req = incomingMessageToRequest(msg, body);
      expect(req.method).toBe('POST');
      // body should exist
      expect(req.body).not.toBeNull();
    });

    it('should not attach body for GET even if buffer is provided', () => {
      const msg = createMockIncomingMessage({ method: 'GET' });
      const body = Buffer.from('should be ignored');

      const req = incomingMessageToRequest(msg, body);
      expect(req.body).toBeNull();
    });

    it('should not attach body for HEAD requests', () => {
      const msg = createMockIncomingMessage({ method: 'HEAD' });
      const req = incomingMessageToRequest(msg, Buffer.from('ignored'));
      expect(req.body).toBeNull();
    });

    it('should not attach body for OPTIONS requests', () => {
      const msg = createMockIncomingMessage({ method: 'OPTIONS' });
      const req = incomingMessageToRequest(msg, Buffer.from('ignored'));
      expect(req.body).toBeNull();
    });

    it('should default url to "/" when req.url is undefined', () => {
      const msg = createMockIncomingMessage({ url: undefined as any });
      (msg as any).url = undefined;
      const req = incomingMessageToRequest(msg);
      expect(req.url).toMatch(/\/$/);
    });
  });

  // -----------------------------------------------------------------------
  // readBody
  // -----------------------------------------------------------------------
  describe('readBody', () => {
    it('should return null for GET requests', async () => {
      const msg = createMockIncomingMessage({ method: 'GET' });
      const result = await readBody(msg);
      expect(result).toBeNull();
    });

    it('should return null for HEAD requests', async () => {
      const msg = createMockIncomingMessage({ method: 'HEAD' });
      const result = await readBody(msg);
      expect(result).toBeNull();
    });

    it('should return null for OPTIONS requests', async () => {
      const msg = createMockIncomingMessage({ method: 'OPTIONS' });
      const result = await readBody(msg);
      expect(result).toBeNull();
    });

    it('should read body from POST request', async () => {
      const msg = createMockIncomingMessage({ method: 'POST' });
      const promise = readBody(msg);

      // Simulate data arriving
      (msg as unknown as EventEmitter).emit('data', Buffer.from('hello'));
      (msg as unknown as EventEmitter).emit('data', Buffer.from(' world'));
      (msg as unknown as EventEmitter).emit('end');

      const result = await promise;
      expect(result).not.toBeNull();
      expect(result!.toString()).toBe('hello world');
    });

    it('should return null when no data chunks are received', async () => {
      const msg = createMockIncomingMessage({ method: 'POST' });
      const promise = readBody(msg);

      (msg as unknown as EventEmitter).emit('end');

      const result = await promise;
      expect(result).toBeNull();
    });

    it('should reject when body exceeds max size', async () => {
      const msg = createMockIncomingMessage({ method: 'POST' });
      const promise = readBody(msg, 5); // 5 byte limit

      (msg as unknown as EventEmitter).emit('data', Buffer.from('too long body'));

      await expect(promise).rejects.toThrow('Request body too large');
    });

    it('should reject on stream error', async () => {
      const msg = createMockIncomingMessage({ method: 'POST' });
      const promise = readBody(msg);

      (msg as unknown as EventEmitter).emit('error', new Error('stream broken'));

      await expect(promise).rejects.toThrow('stream broken');
    });
  });

  // -----------------------------------------------------------------------
  // writeResponse
  // -----------------------------------------------------------------------
  describe('writeResponse', () => {
    it('should write status code and message', async () => {
      const res = createMockServerResponse();
      const response = new Response('body', { status: 201, statusText: 'Created' });

      await writeResponse(res as unknown as ServerResponse, response);

      expect(res._statusCode).toBe(201);
      expect(res._statusMessage).toBe('Created');
      expect(res._ended).toBe(true);
    });

    it('should write response headers', async () => {
      const res = createMockServerResponse();
      const response = new Response('ok', {
        headers: {
          'content-type': 'text/plain',
          'x-custom': 'value',
        },
      });

      await writeResponse(res as unknown as ServerResponse, response);

      expect(res._headers['content-type']).toBe('text/plain');
      expect(res._headers['x-custom']).toBe('value');
    });

    it('should write response body', async () => {
      const res = createMockServerResponse();
      const response = new Response('hello from vexor');

      await writeResponse(res as unknown as ServerResponse, response);

      const body = Buffer.concat(res._body).toString();
      expect(body).toBe('hello from vexor');
      expect(res._ended).toBe(true);
    });

    it('should handle empty body (null)', async () => {
      const res = createMockServerResponse();
      const response = new Response(null, { status: 204 });

      await writeResponse(res as unknown as ServerResponse, response);

      expect(res._statusCode).toBe(204);
      expect(res._body.length).toBe(0);
      expect(res._ended).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // NodeAdapter class
  // -----------------------------------------------------------------------
  describe('NodeAdapter', () => {
    it('should accept a handler in the constructor', () => {
      const handler = async () => new Response('ok');
      const adapter = new NodeAdapter(handler);
      expect(adapter).toBeDefined();
    });

    it('should accept options in the constructor', () => {
      const handler = async () => new Response('ok');
      const adapter = new NodeAdapter(handler, { port: 4000, host: '127.0.0.1' });
      expect(adapter).toBeDefined();
    });

    it('should return null from address() before listening', () => {
      const adapter = new NodeAdapter(async () => new Response('ok'));
      expect(adapter.address()).toBeNull();
    });

    it('should return undefined from getServer() before listening', () => {
      const adapter = new NodeAdapter(async () => new Response('ok'));
      expect(adapter.getServer()).toBeUndefined();
    });

    it('should resolve close() when no server is running', async () => {
      const adapter = new NodeAdapter(async () => new Response('ok'));
      await expect(adapter.close()).resolves.toBeUndefined();
    });

    it('should listen and return server, then close', async () => {
      const handler = async () => new Response('ok');
      const adapter = new NodeAdapter(handler);

      // Use port 0 to let OS pick a free port
      const server = await adapter.listen(0, '127.0.0.1');
      expect(server).toBeDefined();

      const addr = adapter.address();
      expect(addr).not.toBeNull();
      expect(addr!.port).toBeGreaterThan(0);
      expect(addr!.host).toBe('127.0.0.1');

      expect(adapter.getServer()).toBe(server);

      await adapter.close();
      expect(adapter.address()).toBeNull();
    });
  });
});
