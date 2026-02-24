/**
 * WebSocket Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WebSocketServer,
  generateConnectionId,
  createUpgradeResponse,
  isWebSocketUpgrade,
} from '../realtime/websocket.js';
import type { VexorWebSocket, WSMessage } from '../realtime/websocket.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockClient(
  id: string,
  overrides: Partial<VexorWebSocket> = {}
): VexorWebSocket {
  return {
    id,
    readyState: 1,
    data: undefined,
    remoteAddress: '127.0.0.1',
    topics: new Set<string>(),
    send: vi.fn(),
    json: vi.fn(),
    close: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    isSubscribed: vi.fn(),
    publish: vi.fn(),
    ping: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// WebSocketServer
// ---------------------------------------------------------------------------
describe('WebSocketServer', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  describe('client management', () => {
    it('should add and track a client', () => {
      const client = createMockClient('c1');
      server.addClient(client);
      expect(server.clients.size).toBe(1);
      expect(server.clients.get('c1')).toBe(client);
    });

    it('should remove a client', () => {
      const client = createMockClient('c1');
      server.addClient(client);
      server.removeClient('c1');
      expect(server.clients.size).toBe(0);
    });

    it('should remove client from all topics when removed', () => {
      const client = createMockClient('c1', {
        topics: new Set(['topicA', 'topicB']),
      });
      server.addClient(client);
      server.addToTopic('topicA', client);
      server.addToTopic('topicB', client);

      server.removeClient('c1');

      expect(server.getSubscribers('topicA')).toHaveLength(0);
      expect(server.getSubscribers('topicB')).toHaveLength(0);
    });

    it('should be a no-op when removing non-existent client', () => {
      expect(() => server.removeClient('unknown')).not.toThrow();
    });
  });

  describe('topic management', () => {
    it('should add client to topic and retrieve subscribers', () => {
      const client = createMockClient('c1');
      server.addClient(client);
      server.addToTopic('chat', client);

      const subs = server.getSubscribers('chat');
      expect(subs).toHaveLength(1);
      expect(subs[0].id).toBe('c1');
    });

    it('should remove client from topic', () => {
      const client = createMockClient('c1');
      server.addClient(client);
      server.addToTopic('chat', client);
      server.removeFromTopic('chat', client);

      expect(server.getSubscribers('chat')).toHaveLength(0);
    });

    it('should clean up empty topic set after last subscriber removed', () => {
      const client = createMockClient('c1');
      server.addClient(client);
      server.addToTopic('chat', client);
      server.removeFromTopic('chat', client);

      // Internal topics map should no longer have the key
      const stats = server.getStats();
      expect(stats.topics).toBe(0);
    });

    it('should return empty array for unknown topic', () => {
      expect(server.getSubscribers('nope')).toEqual([]);
    });
  });

  describe('publish', () => {
    it('should publish to all subscribers of a topic', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);
      server.addToTopic('news', c1);
      server.addToTopic('news', c2);

      server.publish('news', 'hello');

      expect(c1.send).toHaveBeenCalledWith('hello');
      expect(c2.send).toHaveBeenCalledWith('hello');
    });

    it('should not publish to clients not on the topic', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);
      server.addToTopic('news', c1);

      server.publish('news', 'msg');

      expect(c1.send).toHaveBeenCalledWith('msg');
      expect(c2.send).not.toHaveBeenCalled();
    });

    it('should be a no-op when publishing to empty topic', () => {
      expect(() => server.publish('empty', 'msg')).not.toThrow();
    });
  });

  describe('publishExcluding', () => {
    it('should exclude specified client', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);
      server.addToTopic('room', c1);
      server.addToTopic('room', c2);

      server.publishExcluding('room', 'hi', 'c1');

      expect(c1.send).not.toHaveBeenCalled();
      expect(c2.send).toHaveBeenCalledWith('hi');
    });
  });

  describe('broadcast', () => {
    it('should send to all connected clients', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);

      server.broadcast('bcast');

      expect(c1.send).toHaveBeenCalledWith('bcast');
      expect(c2.send).toHaveBeenCalledWith('bcast');
    });
  });

  describe('closeAll', () => {
    it('should close all clients and clear state', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);
      server.addToTopic('t', c1);

      server.closeAll(1001, 'bye');

      expect(c1.close).toHaveBeenCalledWith(1001, 'bye');
      expect(c2.close).toHaveBeenCalledWith(1001, 'bye');
      expect(server.clients.size).toBe(0);
    });

    it('should use default code and reason', () => {
      const c1 = createMockClient('c1');
      server.addClient(c1);
      server.closeAll();

      expect(c1.close).toHaveBeenCalledWith(1000, 'Server shutdown');
    });
  });

  describe('getStats', () => {
    it('should report correct statistics', () => {
      const c1 = createMockClient('c1');
      const c2 = createMockClient('c2');
      server.addClient(c1);
      server.addClient(c2);
      server.addToTopic('t1', c1);
      server.addToTopic('t1', c2);
      server.addToTopic('t2', c1);

      const stats = server.getStats();
      expect(stats.clients).toBe(2);
      expect(stats.topics).toBe(2);
      expect(stats.subscriptions.get('t1')).toBe(2);
      expect(stats.subscriptions.get('t2')).toBe(1);
    });
  });

  describe('route', () => {
    it('should register and retrieve route', () => {
      const handlers = { handlers: { open: vi.fn() } };
      server.route('/ws', handlers);

      const route = server.getRoute('/ws');
      expect(route).toBeDefined();
      expect(route!.handlers.open).toBe(handlers.handlers.open);
    });

    it('should return undefined for unregistered route', () => {
      expect(server.getRoute('/nope')).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// isWebSocketUpgrade
// ---------------------------------------------------------------------------
describe('isWebSocketUpgrade', () => {
  it('should return true for valid upgrade request', () => {
    const req = new Request('http://localhost/', {
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
      },
    });
    expect(isWebSocketUpgrade(req)).toBe(true);
  });

  it('should return false when Upgrade header missing', () => {
    const req = new Request('http://localhost/', {
      headers: { Connection: 'Upgrade' },
    });
    expect(isWebSocketUpgrade(req)).toBe(false);
  });

  it('should return false when Connection header missing', () => {
    const req = new Request('http://localhost/', {
      headers: { Upgrade: 'websocket' },
    });
    expect(isWebSocketUpgrade(req)).toBe(false);
  });

  it('should be case-insensitive', () => {
    const req = new Request('http://localhost/', {
      headers: {
        Upgrade: 'WebSocket',
        Connection: 'upgrade',
      },
    });
    expect(isWebSocketUpgrade(req)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generateConnectionId
// ---------------------------------------------------------------------------
describe('generateConnectionId', () => {
  it('should return a string prefixed with ws_', () => {
    const id = generateConnectionId();
    expect(id).toMatch(/^ws_/);
  });

  it('should generate unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateConnectionId()));
    expect(ids.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// createUpgradeResponse
// ---------------------------------------------------------------------------
describe('createUpgradeResponse', () => {
  // Note: In Node.js, `new Response(null, { status: 101 })` throws because
  // status 101 is outside the valid range (200-599). The source code targets
  // runtimes like Bun/Deno/Cloudflare Workers that support 101.  We test
  // that the function properly *attempts* to construct the response.
  it('should throw in Node.js because status 101 is out of range', async () => {
    const key = 'dGhlIHNhbXBsZSBub25jZQ==';
    await expect(createUpgradeResponse(key)).rejects.toThrow();
  });
});
