/**
 * RPC client tests: runtime behavior against an in-process app,
 * plus type-level assertions verified by tsc.
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import { Vexor } from '../core/app.js';
import { Type } from '../schema/type.js';
import { createClient } from '../client/index.js';

function makeApp() {
  const app = new Vexor()
    .get('/users/:id', (ctx) => ctx.json({ id: ctx.params.id, name: 'Ada' }))
    .get('/users', (ctx) => {
      const limit = ctx.queryParam('limit');
      return ctx.json({ users: ['a', 'b'], limit: limit ?? null });
    })
    .post(
      '/users',
      {
        body: Type.Object({
          name: Type.String({ minLength: 1 }),
          email: Type.String({ format: 'email' }),
        }),
      },
      async (ctx) => {
        const body = await ctx.body();
        return ctx.status(201).json({ created: body.name });
      }
    )
    .delete('/users/:id', (ctx) => ctx.json({ deleted: ctx.params.id }))
    .get('/assets/*', (ctx) => ctx.json({ file: ctx.params['*'] }));

  return app;
}

type App = ReturnType<typeof makeApp>;

describe('createClient runtime', () => {
  it('performs a GET with path params', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.get('/users/:id', { params: { id: '42' } });

    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: '42', name: 'Ada' });
  });

  it('sends query parameters', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.get('/users', { query: { limit: 5 } });

    expect(res.data).toEqual({ users: ['a', 'b'], limit: '5' });
  });

  it('POSTs a JSON body and returns the typed payload', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.post('/users', {
      body: { name: 'Grace', email: 'grace@example.com' },
    });

    expect(res.status).toBe(201);
    expect(res.data).toEqual({ created: 'Grace' });
  });

  it('surfaces validation failures as non-ok responses', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.post('/users', {
      body: { name: '', email: 'not-an-email' } as never,
    });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(400);
  });

  it('fills wildcard params', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.get('/assets/*', { params: { '*': 'css/site.css' } });

    expect(res.data).toEqual({ file: 'css/site.css' });
  });

  it('throws when a required path param is missing', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    await expect(
      // params intentionally missing at runtime
      api.request('GET', '/users/:id', {})
    ).rejects.toThrow(/Missing path param "id"/);
  });

  it('merges default headers with per-request headers', async () => {
    const app = new Vexor().get('/echo-header', (ctx) =>
      ctx.json({
        auth: ctx.header('authorization'),
        custom: ctx.header('x-custom'),
      })
    );
    const api = createClient<typeof app>({
      fetch: app.fetch,
      headers: () => ({ Authorization: 'Bearer token-1' }),
    });

    const res = await api.get('/echo-header', { headers: { 'X-Custom': 'yes' } });

    expect(res.data).toEqual({ auth: 'Bearer token-1', custom: 'yes' });
  });
});

describe('createClient types', () => {
  it('response data is typed from ctx.json()', async () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    const res = await api.get('/users/:id', { params: { id: '1' } });
    expectTypeOf(res.data).toEqualTypeOf<{ id: string; name: string }>();

    const created = await api.post('/users', {
      body: { name: 'x', email: 'x@y.z' },
    });
    expectTypeOf(created.data).toEqualTypeOf<{ created: string }>();
  });

  it('body input is typed from the route schema', () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    type PostOpts = Parameters<typeof api.post<'/users'>>[1];
    expectTypeOf<NonNullable<PostOpts>['body']>().toMatchTypeOf<{
      name: string;
      email: string;
      [key: string]: unknown;
    } | { name: string; email: string }>();
  });

  it('paths are constrained to registered routes per method', () => {
    const app = makeApp();
    const api = createClient<App>({ fetch: app.fetch });

    type GetPaths = Parameters<typeof api.get>[0];
    expectTypeOf<'/users/:id'>().toMatchTypeOf<GetPaths>();
    expectTypeOf<'/users'>().toMatchTypeOf<GetPaths>();

    type DeletePaths = Parameters<typeof api.delete>[0];
    expectTypeOf<'/users/:id'>().toMatchTypeOf<DeletePaths>();
  });
});
