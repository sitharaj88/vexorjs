/**
 * app.ws() end-to-end tests: real server, real WebSocket connections
 * (via the `ws` package client on Node).
 */

import { describe, it, expect, afterEach } from 'vitest';
import WebSocketClient from 'ws';
import { Vexor } from '../core/app.js';

let app: Vexor | undefined;

afterEach(async () => {
  await app?.close({ timeout: 500 });
  app = undefined;
});

async function listen(instance: Vexor): Promise<number> {
  const server = (await instance.listen(0, '127.0.0.1')) as import('http').Server;
  const address = server.address();
  if (!address || typeof address !== 'object') throw new Error('no address');
  return address.port;
}

function connect(url: string): Promise<WebSocketClient> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocketClient(url);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

function nextMessage(socket: WebSocketClient): Promise<string> {
  return new Promise((resolve) => {
    socket.once('message', (data) => resolve(data.toString()));
  });
}

describe('app.ws()', () => {
  it('echoes messages through handlers with parsed JSON', async () => {
    app = new Vexor({ logging: false });
    app.ws('/echo', {
      message(ws, data) {
        ws.json({ echo: data });
      },
    });

    const port = await listen(app);
    const socket = await connect(`ws://127.0.0.1:${port}/echo`);

    const reply = nextMessage(socket);
    socket.send(JSON.stringify({ hello: 'vexor' }));

    expect(JSON.parse(await reply)).toEqual({ echo: { hello: 'vexor' } });
    socket.close();
  });

  it('exposes route params through the context', async () => {
    app = new Vexor({ logging: false });
    app.ws('/rooms/:room', {
      open(ws, ctx) {
        ws.json({ joined: ctx.params.room });
      },
    });

    const port = await listen(app);

    // Attach the message listener before the handshake completes: the
    // server sends during `open`, which can beat a later listener
    const socket = new WebSocketClient(`ws://127.0.0.1:${port}/rooms/lobby`);
    const first = nextMessage(socket);
    await new Promise((resolve, reject) => {
      socket.once('open', resolve);
      socket.once('error', reject);
    });

    expect(JSON.parse(await first)).toEqual({ joined: 'lobby' });
    socket.close();
  });

  it('supports topics: publish reaches subscribers but not the sender', async () => {
    app = new Vexor({ logging: false });
    app.ws('/chat/:room', {
      open(ws, ctx) {
        ws.subscribe(ctx.params.room);
      },
      message(ws, data, ctx) {
        ws.publish(ctx.params.room, JSON.stringify(data));
      },
    });

    const port = await listen(app);
    const alice = await connect(`ws://127.0.0.1:${port}/chat/general`);
    const bob = await connect(`ws://127.0.0.1:${port}/chat/general`);

    const bobReceives = nextMessage(bob);
    alice.send(JSON.stringify({ from: 'alice' }));

    expect(JSON.parse(await bobReceives)).toEqual({ from: 'alice' });

    alice.close();
    bob.close();
  });

  it('rejects upgrades for unregistered paths', async () => {
    app = new Vexor({ logging: false });
    app.ws('/known', { open() {} });

    const port = await listen(app);

    await expect(connect(`ws://127.0.0.1:${port}/unknown`)).rejects.toThrow();
  });

  it('broadcast reaches all connected clients via app.websockets', async () => {
    app = new Vexor({ logging: false });
    app.ws('/feed', { open() {} });

    const port = await listen(app);
    const a = await connect(`ws://127.0.0.1:${port}/feed`);
    const b = await connect(`ws://127.0.0.1:${port}/feed`);

    const aReceives = nextMessage(a);
    const bReceives = nextMessage(b);
    app.websockets.broadcast('ping');

    expect(await aReceives).toBe('ping');
    expect(await bReceives).toBe('ping');

    a.close();
    b.close();
  });
});
