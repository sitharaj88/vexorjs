/**
 * Type-level tests for route handler inference.
 * expectTypeOf assertions are validated by `tsc --noEmit` (the lint step);
 * the runtime assertions confirm behavior matches the declared types.
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import { Vexor } from '../core/app.js';
import { VexorRequest } from '../core/request.js';
import { Type } from '../schema/type.js';
import type { InferBody, InferQuery, PathParams } from '../core/infer.js';

function makeRequest(method: string, path: string, body?: unknown): VexorRequest {
  const request = new Request(`http://localhost${path}`, {
    method,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });
  return new VexorRequest(request, request);
}

describe('path param inference', () => {
  it('infers single and multiple params from the path literal', () => {
    expectTypeOf<PathParams<'/users/:id'>>().toEqualTypeOf<{ id: string }>();
    expectTypeOf<PathParams<'/users/:userId/posts/:postId'>>().toMatchTypeOf<{
      userId: string;
      postId: string;
    }>();
    expectTypeOf<PathParams<'/assets/*'>>().toMatchTypeOf<{ '*': string }>();
  });

  it('types ctx.params in handlers', async () => {
    const app = new Vexor();
    app.get('/users/:id/posts/:postId', (ctx) => {
      expectTypeOf(ctx.params.id).toEqualTypeOf<string>();
      expectTypeOf(ctx.params.postId).toEqualTypeOf<string>();
      return ctx.json({ id: ctx.params.id, postId: ctx.params.postId });
    });

    const response = await app.handle(makeRequest('GET', '/users/7/posts/9'));
    expect(await response.json()).toEqual({ id: '7', postId: '9' });
  });
});

describe('schema body inference', () => {
  const bodySchema = Type.Object({
    name: Type.String(),
    age: Type.Number(),
    tag: Type.Optional(Type.String()),
  });

  it('InferBody produces the Static shape', () => {
    type Body = InferBody<{ body: typeof bodySchema }>;
    expectTypeOf<Body>().toMatchTypeOf<{ name: string; age: number; tag?: string }>();
  });

  it('types ctx.body() from the route schema', async () => {
    const app = new Vexor();
    app.post('/people', { schema: { body: bodySchema } }, async (ctx) => {
      const body = await ctx.body();
      expectTypeOf(body.name).toEqualTypeOf<string>();
      expectTypeOf(body.age).toEqualTypeOf<number>();
      return ctx.status(201).json(body);
    });

    const response = await app.handle(
      makeRequest('POST', '/people', { name: 'ada', age: 36 })
    );
    expect(response.status).toBe(201);
  });
});

describe('schema query inference', () => {
  it('types ctx.query from the route schema', () => {
    const querySchema = Type.Object({ q: Type.String() });
    type Query = InferQuery<{ query: typeof querySchema }>;
    expectTypeOf<Query>().toMatchTypeOf<{ q: string }>();

    const app = new Vexor();
    app.get('/search', { schema: { query: querySchema } }, (ctx) => {
      expectTypeOf(ctx.query.q).toEqualTypeOf<string>();
      return ctx.json({ q: ctx.query.q });
    });
  });
});

describe('bare schema options (no `schema` wrapper)', () => {
  it('validates and infers when the schema is passed directly', async () => {
    const app = new Vexor();
    app.post('/direct', { body: Type.Object({ n: Type.Number() }) }, async (ctx) => {
      const body = await ctx.body();
      expectTypeOf(body.n).toEqualTypeOf<number>();
      return ctx.status(201).json(body);
    });

    const ok = await app.handle(makeRequest('POST', '/direct', { n: 5 }));
    expect(ok.status).toBe(201);

    const bad = await app.handle(makeRequest('POST', '/direct', { n: 'nope' }));
    expect(bad.status).toBe(400);
  });
});

describe('backward compatibility', () => {
  it('untyped handlers still work', async () => {
    const app = new Vexor();
    app.get('/plain', async (ctx) => ctx.json({ ok: true }));

    const response = await app.handle(makeRequest('GET', '/plain'));
    expect(response.status).toBe(200);
  });

  it('params stay Record<string, string> for non-literal paths', () => {
    const app = new Vexor();
    const dynamicPath: string = '/from/config';
    app.get(dynamicPath, (ctx) => {
      expectTypeOf(ctx.params).toMatchTypeOf<Record<string, string>>();
      return ctx.json({});
    });
  });
});
