/**
 * WebSocket Concurrency & Hardening Tests
 *
 * Stress-style tests for the WebSocketServer with many clients and topics.
 * These exercise paths the existing unit tests don't cover:
 *
 *   - Many clients fanning out across many topics
 *   - Concurrent subscribe / unsubscribe / publish interleaving
 *   - Removing a client mid-broadcast
 *   - Topics that drain to empty as clients disconnect
 *   - Repeated subscribe/unsubscribe of the same client to the same topic
 *   - Channel groups (topic-based publish) don't leak across topics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketServer } from '../realtime/websocket.js';
import type { VexorWebSocket, WSMessage } from '../realtime/websocket.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ClientMock extends VexorWebSocket {
  sent: WSMessage[];
}

function makeClient(id: string, server: WebSocketServer): ClientMock {
  const sent: WSMessage[] = [];
  const topics = new Set<string>();
  const client: ClientMock = {
    id,
    readyState: 1,
    data: undefined,
    remoteAddress: '127.0.0.1',
    topics,
    sent,
    send: ((message: WSMessage) => {
      sent.push(message);
    }) as VexorWebSocket['send'],
    json: vi.fn(),
    close: vi.fn(),
    subscribe(topic: string) {
      topics.add(topic);
      server.addToTopic(topic, this);
    },
    unsubscribe(topic: string) {
      topics.delete(topic);
      server.removeFromTopic(topic, this);
    },
    isSubscribed(topic: string) {
      return topics.has(topic);
    },
    publish: vi.fn(),
    ping: vi.fn(),
  };
  return client;
}

// ---------------------------------------------------------------------------
// Many clients × many topics
// ---------------------------------------------------------------------------

describe('WebSocketServer — fan-out', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  it('publishes to 1000 subscribers without losing any', () => {
    const clients: ClientMock[] = [];
    for (let i = 0; i < 1000; i++) {
      const c = makeClient(`c${i}`, server);
      server.addClient(c);
      c.subscribe('news');
      clients.push(c);
    }

    server.publish('news', 'hello');

    for (const c of clients) {
      expect(c.sent).toEqual(['hello']);
    }
    expect(server.getStats().clients).toBe(1000);
    expect(server.getStats().subscriptions.get('news')).toBe(1000);
  });

  it('partitions broadcasts across distinct topics', () => {
    const a = makeClient('a', server);
    const b = makeClient('b', server);
    const both = makeClient('both', server);
    server.addClient(a);
    server.addClient(b);
    server.addClient(both);

    a.subscribe('topic-a');
    b.subscribe('topic-b');
    both.subscribe('topic-a');
    both.subscribe('topic-b');

    server.publish('topic-a', 'A1');
    server.publish('topic-b', 'B1');

    expect(a.sent).toEqual(['A1']);
    expect(b.sent).toEqual(['B1']);
    expect(both.sent).toEqual(['A1', 'B1']);
  });

  it('publishExcluding skips the originator across many subscribers', () => {
    const subs: ClientMock[] = [];
    for (let i = 0; i < 50; i++) {
      const c = makeClient(`c${i}`, server);
      server.addClient(c);
      c.subscribe('chat');
      subs.push(c);
    }
    server.publishExcluding('chat', 'msg', 'c10');

    expect(subs[10].sent).toEqual([]);
    for (const c of subs) {
      if (c.id === 'c10') continue;
      expect(c.sent).toEqual(['msg']);
    }
  });
});

// ---------------------------------------------------------------------------
// Lifecycle correctness — subscribe / unsubscribe / disconnect
// ---------------------------------------------------------------------------

describe('WebSocketServer — subscription lifecycle', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  it('idempotent subscribe leaves only one entry per (client, topic)', () => {
    const c = makeClient('a', server);
    server.addClient(c);

    c.subscribe('t');
    c.subscribe('t');
    c.subscribe('t');

    expect(server.getStats().subscriptions.get('t')).toBe(1);
    expect(server.getSubscribers('t')).toHaveLength(1);
  });

  it('unsubscribe is safe on a topic the client never joined', () => {
    const c = makeClient('a', server);
    server.addClient(c);
    expect(() => c.unsubscribe('never')).not.toThrow();
    expect(server.getStats().topics).toBe(0);
  });

  it('removing a client during broadcast does not throw — remaining clients still receive', () => {
    const a = makeClient('a', server);
    const b = makeClient('b', server);
    const c = makeClient('c', server);
    server.addClient(a);
    server.addClient(b);
    server.addClient(c);
    a.subscribe('t');
    b.subscribe('t');
    c.subscribe('t');

    // Simulate b disconnecting mid-broadcast: replace its send.
    b.send = ((_msg: WSMessage) => {
      // Disconnect happens during fan-out.
      server.removeClient('b');
    }) as VexorWebSocket['send'];

    expect(() => server.publish('t', 'msg')).not.toThrow();
    expect(a.sent).toEqual(['msg']);
    expect(c.sent).toEqual(['msg']);
    expect(server.clients.has('b')).toBe(false);
  });

  it('disconnecting the last subscriber prunes the topic entry', () => {
    const a = makeClient('a', server);
    server.addClient(a);
    a.subscribe('only-me');

    server.removeClient('a');

    expect(server.getStats().topics).toBe(0);
    expect(server.getSubscribers('only-me')).toEqual([]);
  });

  it('disconnecting one of many subscribers leaves the topic intact', () => {
    const a = makeClient('a', server);
    const b = makeClient('b', server);
    server.addClient(a);
    server.addClient(b);
    a.subscribe('shared');
    b.subscribe('shared');

    server.removeClient('a');

    expect(server.getStats().subscriptions.get('shared')).toBe(1);
    expect(server.getSubscribers('shared').map((c) => c.id)).toEqual(['b']);
  });

  it('removeClient is a no-op on unknown ids', () => {
    expect(() => server.removeClient('ghost')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Stress / interleaved operations
// ---------------------------------------------------------------------------

describe('WebSocketServer — interleaved operations', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  it('subscribe / publish / unsubscribe / publish reflect at each step', () => {
    const c = makeClient('x', server);
    server.addClient(c);

    server.publish('q', 'first'); // not subscribed yet
    c.subscribe('q');
    server.publish('q', 'second');
    c.unsubscribe('q');
    server.publish('q', 'third');

    expect(c.sent).toEqual(['second']);
  });

  it('100 random subscribe/unsubscribe ops maintain consistent state', () => {
    const clients: ClientMock[] = Array.from({ length: 20 }, (_, i) => {
      const c = makeClient(`c${i}`, server);
      server.addClient(c);
      return c;
    });
    const topics = ['t1', 't2', 't3', 't4'];

    let seed = 1;
    const rand = () => {
      // Deterministic LCG so the test is reproducible.
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed;
    };

    for (let i = 0; i < 100; i++) {
      const client = clients[rand() % clients.length];
      const topic = topics[rand() % topics.length];
      const op = rand() % 2;
      if (op === 0) client.subscribe(topic);
      else client.unsubscribe(topic);
    }

    // Invariant: server.getSubscribers(t) length === number of clients with t in their topics set
    for (const t of topics) {
      const expected = clients.filter((c) => c.topics.has(t)).length;
      expect(server.getSubscribers(t).length).toBe(expected);
    }
  });

  it('closeAll clears clients and topics atomically', () => {
    for (let i = 0; i < 10; i++) {
      const c = makeClient(`c${i}`, server);
      server.addClient(c);
      c.subscribe('shared');
    }
    server.closeAll();

    expect(server.clients.size).toBe(0);
    expect(server.getStats().topics).toBe(0);
    expect(server.getSubscribers('shared')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getSubscribers safety
// ---------------------------------------------------------------------------

describe('WebSocketServer — getSubscribers', () => {
  let server: WebSocketServer;

  beforeEach(() => {
    server = new WebSocketServer();
  });

  it('skips entries whose client no longer exists in the registry', () => {
    const a = makeClient('a', server);
    server.addClient(a);
    a.subscribe('t');

    // Simulate registry corruption: client gone but topic still references id.
    server.clients.delete('a');

    // getSubscribers should not crash; it silently skips missing clients.
    expect(server.getSubscribers('t')).toEqual([]);
  });
});
