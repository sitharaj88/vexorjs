/**
 * HTTP semantics tests: 405 Method Not Allowed, HEAD→GET fallback,
 * and hook short-circuiting (e.g. CORS preflight).
 */

import { describe, it, expect } from 'vitest';
import { Vexor } from '../core/app.js';
import { VexorRequest } from '../core/request.js';
import { Type as TypeImport } from '../schema/type.js';

function makeRequest(method: string, path: string): VexorRequest {
  const request = new Request(`http://localhost${path}`, { method });
  return new VexorRequest(request, request);
}

describe('405 Method Not Allowed', () => {
  it('returns 405 with Allow header when the path exists under other methods', async () => {
    const app = new Vexor();
    app.get('/users', async (ctx) => ctx.json({ ok: true }));
    app.post('/users', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('DELETE', '/users'));

    expect(response.status).toBe(405);
    const allow = response.headers.get('Allow')!;
    expect(allow).toContain('GET');
    expect(allow).toContain('POST');
    const body = await response.json();
    expect(body.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('includes HEAD in Allow when GET is registered', async () => {
    const app = new Vexor();
    app.get('/users', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('DELETE', '/users'));

    expect(response.headers.get('Allow')).toContain('HEAD');
  });

  it('returns 404 when no method matches the path', async () => {
    const app = new Vexor();
    app.get('/users', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('GET', '/missing'));

    expect(response.status).toBe(404);
  });

  it('returns 405 for parameterized routes too', async () => {
    const app = new Vexor();
    app.get('/users/:id', async (ctx) => ctx.json({ id: ctx.params.id }));

    const response = await app.handle(makeRequest('PUT', '/users/42'));

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toContain('GET');
  });
});

describe('HEAD → GET fallback', () => {
  it('serves HEAD from the GET handler with an empty body', async () => {
    const app = new Vexor();
    app.get('/data', async (ctx) => ctx.json({ hello: 'world' }));

    const response = await app.handle(makeRequest('HEAD', '/data'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.text()).toBe('');
  });

  it('prefers an explicit HEAD route over the GET fallback', async () => {
    const app = new Vexor();
    app.get('/data', async (ctx) => ctx.json({ from: 'get' }));
    app.head('/data', async (ctx) => ctx.status(204).empty());

    const response = await app.handle(makeRequest('HEAD', '/data'));

    expect(response.status).toBe(204);
  });
});

describe('hook short-circuiting', () => {
  it('a hook returning a Response skips the handler', async () => {
    const app = new Vexor();
    let handlerRan = false;

    app.use((ctx) => {
      if (ctx.header('x-block') === '1') {
        return new Response('blocked', { status: 403 });
      }
      return undefined;
    });
    app.get('/guarded', async (ctx) => {
      handlerRan = true;
      return ctx.json({ ok: true });
    });

    const request = new Request('http://localhost/guarded', {
      method: 'GET',
      headers: { 'x-block': '1' },
    });
    const response = await app.handle(new VexorRequest(request, request));

    expect(response.status).toBe(403);
    expect(handlerRan).toBe(false);

    const passThrough = await app.handle(makeRequest('GET', '/guarded'));
    expect(passThrough.status).toBe(200);
    expect(handlerRan).toBe(true);
  });

  it('queued response headers are applied to short-circuit responses', async () => {
    const app = new Vexor();
    app.use((ctx) => {
      ctx.setResponseHeader('X-Powered-By', 'vexor');
      if (ctx.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
      }
      return undefined;
    });
    app.get('/resource', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('OPTIONS', '/resource'));

    expect(response.status).toBe(204);
    expect(response.headers.get('X-Powered-By')).toBe('vexor');
  });
});

describe('schema validation over HTTP', () => {
  function makeApp() {
    const app = new Vexor();
    app.post(
      '/items',
      {
        schema: {
          body: TypeImport.Object({
            name: TypeImport.String({ minLength: 1 }),
            note: TypeImport.Optional(TypeImport.String()),
          }),
        },
      },
      async (ctx) => ctx.status(201).json(await ctx.body())
    );
    return app;
  }

  function jsonRequest(body: unknown): VexorRequest {
    const request = new Request('http://localhost/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return new VexorRequest(request, request);
  }

  it('accepts a valid body', async () => {
    const response = await makeApp().handle(jsonRequest({ name: 'ok' }));
    expect(response.status).toBe(201);
  });

  it('rejects constraint violations with 400, not 500', async () => {
    const response = await makeApp().handle(jsonRequest({ name: '' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.issues)).toBe(true);
  });

  it('rejects missing required properties (non-Optional means required)', async () => {
    const response = await makeApp().handle(jsonRequest({}));
    expect(response.status).toBe(400);
  });

  it('does not require Optional properties', async () => {
    const response = await makeApp().handle(jsonRequest({ name: 'ok' }));
    expect(response.status).toBe(201);
  });
});

describe('plugin registration on the app', () => {
  it('registers plugins with lifecycle hooks that run per request', async () => {
    const app = new Vexor();

    await app.registerPlugin({
      meta: { name: 'stamp' },
      register: (pluginCtx) => {
        pluginCtx.addHook('onRequest', (ctx) => {
          ctx.setResponseHeader('X-Stamped', 'yes');
        });
      },
    });
    app.get('/stamped', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('GET', '/stamped'));

    expect(response.headers.get('X-Stamped')).toBe('yes');
  });

  it('applies the plugin prefix to routes registered inside it', async () => {
    const app = new Vexor();

    await app.registerPlugin(
      {
        meta: { name: 'api' },
        register: (pluginCtx) => {
          pluginCtx.app.get('/things', async (ctx) => ctx.json({ ok: true }));
        },
      },
      { prefix: '/v1' }
    );

    const response = await app.handle(makeRequest('GET', '/v1/things'));
    expect(response.status).toBe(200);

    const unprefixed = await app.handle(makeRequest('GET', '/things'));
    expect(unprefixed.status).toBe(404);
  });
});
