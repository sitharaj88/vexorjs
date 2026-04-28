/**
 * GraphQL Adapter Tests
 *
 * Tests the HTTP plumbing — request parsing, executor delegation, status
 * mapping, and GraphiQL rendering — against a mock VexorContext shape.
 * The schema-execution path (which lazy-loads `graphql`) is exercised via
 * an explicit `executor` since `graphql` isn't installed in this workspace.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createGraphQLHandler,
  parseGraphQLRequest,
  statusFor,
  renderGraphiQL,
  type GraphQLHTTPContext,
} from '../graphql/index.js';

// ---------------------------------------------------------------------------
// Test helpers — minimal context that satisfies GraphQLHTTPContext
// ---------------------------------------------------------------------------

function makeCtx(
  method: string,
  body: unknown,
  init: Partial<RequestInit> = {}
): GraphQLHTTPContext & {
  jsonCalls: Array<{ body: unknown; status?: number }>;
  htmlCalls: Array<{ body: string; status?: number }>;
} {
  const jsonCalls: Array<{ body: unknown; status?: number }> = [];
  const htmlCalls: Array<{ body: string; status?: number }> = [];

  return {
    method,
    request: new Request('http://localhost/graphql', {
      method,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: { 'content-type': 'application/json' },
      ...init,
    }),
    jsonCalls,
    htmlCalls,
    json(value: unknown, status?: number) {
      jsonCalls.push({ body: value, status });
      return new Response(JSON.stringify(value), {
        status: status ?? 200,
        headers: { 'content-type': 'application/json' },
      });
    },
    html(html: string, status?: number) {
      htmlCalls.push({ body: html, status });
      return new Response(html, {
        status: status ?? 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    },
  };
}

// ---------------------------------------------------------------------------
// parseGraphQLRequest
// ---------------------------------------------------------------------------

describe('parseGraphQLRequest', () => {
  it('accepts a query-only body', () => {
    const r = parseGraphQLRequest({ query: '{ hello }' });
    expect(r).toEqual({ value: { query: '{ hello }', variables: undefined, operationName: undefined } });
  });

  it('accepts query + variables + operationName', () => {
    const r = parseGraphQLRequest({
      query: 'query Q($id: ID!) { user(id: $id) { name } }',
      variables: { id: '1' },
      operationName: 'Q',
    });
    expect(r).toMatchObject({
      value: { variables: { id: '1' }, operationName: 'Q' },
    });
  });

  it('rejects non-objects', () => {
    expect(parseGraphQLRequest(null)).toMatchObject({ error: expect.any(String) });
    expect(parseGraphQLRequest('hi')).toMatchObject({ error: expect.any(String) });
  });

  it('rejects missing query', () => {
    expect(parseGraphQLRequest({})).toMatchObject({ error: expect.any(String) });
  });

  it('rejects empty query string', () => {
    expect(parseGraphQLRequest({ query: '' })).toMatchObject({ error: expect.any(String) });
  });

  it('rejects non-object variables', () => {
    expect(
      parseGraphQLRequest({ query: '{x}', variables: 'oops' })
    ).toMatchObject({ error: expect.any(String) });
  });

  it('rejects non-string operationName', () => {
    expect(
      parseGraphQLRequest({ query: '{x}', operationName: 42 })
    ).toMatchObject({ error: expect.any(String) });
  });
});

// ---------------------------------------------------------------------------
// statusFor
// ---------------------------------------------------------------------------

describe('statusFor', () => {
  it('returns 200 for normal data', () => {
    expect(statusFor({ data: { x: 1 } })).toBe(200);
  });

  it('returns 200 for partial-success (data + errors)', () => {
    expect(statusFor({ data: null, errors: [{ message: 'x' }] })).toBe(200);
  });

  it('returns 500 when only errors are present', () => {
    expect(statusFor({ errors: [{ message: 'oops' }] })).toBe(500);
  });

  it('returns 200 for empty response', () => {
    expect(statusFor({})).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// createGraphQLHandler
// ---------------------------------------------------------------------------

describe('createGraphQLHandler', () => {
  it('rejects non-POST without graphiql', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
    });
    const ctx = makeCtx('GET', undefined);
    const res = await handler(ctx);
    expect(res.status).toBe(405);
  });

  it('returns GraphiQL HTML on GET when graphiql is enabled', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
      graphiql: true,
    });
    const ctx = makeCtx('GET', undefined);
    const res = await handler(ctx);
    expect(res.status).toBe(200);
    expect(ctx.htmlCalls[0].body).toContain('GraphiQL');
  });

  it('returns custom GraphiQL HTML when graphiql is a string', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
      graphiql: '<html>custom</html>',
    });
    const ctx = makeCtx('GET', undefined);
    await handler(ctx);
    expect(ctx.htmlCalls[0].body).toBe('<html>custom</html>');
  });

  it('falls back to a Response when ctx.html is unavailable', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
      graphiql: true,
    });
    const ctx = makeCtx('GET', undefined);
    delete (ctx as { html?: unknown }).html;
    const res = await handler(ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('returns 400 on invalid JSON body', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
    });
    const ctx: GraphQLHTTPContext & {
      jsonCalls: Array<{ body: unknown; status?: number }>;
      htmlCalls: Array<{ body: string; status?: number }>;
    } = makeCtx('POST', undefined);
    // Override request with invalid JSON body
    (ctx as { request: Request }).request = new Request(
      'http://localhost/graphql',
      {
        method: 'POST',
        body: '{not json',
        headers: { 'content-type': 'application/json' },
      }
    );

    const res = await handler(ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when query field is missing', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
    });
    const ctx = makeCtx('POST', { foo: 'bar' });
    const res = await handler(ctx);
    expect(res.status).toBe(400);
  });

  it('passes request + contextValue to the executor', async () => {
    const exec = vi.fn().mockResolvedValue({ data: { hello: 'world' } });
    const contextFactory = vi.fn().mockReturnValue({ user: 'alice' });

    const handler = createGraphQLHandler({
      executor: exec,
      contextFactory,
    });

    const ctx = makeCtx('POST', {
      query: 'query Q { hello }',
      variables: { x: 1 },
      operationName: 'Q',
    });

    await handler(ctx);

    expect(contextFactory).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledWith(
      {
        query: 'query Q { hello }',
        variables: { x: 1 },
        operationName: 'Q',
      },
      { user: 'alice' }
    );
  });

  it('returns the executor response as JSON with status from statusFor', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: { hello: 'world' } }),
    });
    const ctx = makeCtx('POST', { query: '{ hello }' });

    await handler(ctx);

    expect(ctx.jsonCalls[0]).toEqual({
      body: { data: { hello: 'world' } },
      status: 200,
    });
  });

  it('returns 500 for errors-only responses', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ errors: [{ message: 'broken' }] }),
    });
    const ctx = makeCtx('POST', { query: '{ x }' });

    await handler(ctx);
    expect(ctx.jsonCalls[0].status).toBe(500);
  });

  it('catches executor exceptions and surfaces as GraphQL errors', async () => {
    const handler = createGraphQLHandler({
      executor: async () => {
        throw new Error('resolver crashed');
      },
    });
    const ctx = makeCtx('POST', { query: '{ x }' });
    await handler(ctx);
    expect(ctx.jsonCalls[0]).toMatchObject({
      body: { errors: [{ message: 'resolver crashed' }] },
      status: 500,
    });
  });

  it('reports contextFactory errors as 500', async () => {
    const handler = createGraphQLHandler({
      executor: async () => ({ data: null }),
      contextFactory: () => {
        throw new Error('no auth');
      },
    });
    const ctx = makeCtx('POST', { query: '{ x }' });
    await handler(ctx);
    expect(ctx.jsonCalls[0].status).toBe(500);
  });

  it('throws clearly when neither executor nor schema is provided', async () => {
    const handler = createGraphQLHandler({});
    const ctx = makeCtx('POST', { query: '{ x }' });
    await handler(ctx);
    // Caught and surfaced as a GraphQL error response
    expect(ctx.jsonCalls[0].body).toMatchObject({
      errors: [{ message: expect.stringContaining('executor') }],
    });
  });
});

// ---------------------------------------------------------------------------
// renderGraphiQL
// ---------------------------------------------------------------------------

describe('renderGraphiQL', () => {
  it('embeds the endpoint URL into the HTML', () => {
    const html = renderGraphiQL('/api/graphql');
    expect(html).toContain('"/api/graphql"');
    expect(html).toContain('graphiql.min.js');
  });

  it('JSON-encodes the endpoint to defeat injection', () => {
    const html = renderGraphiQL('/odd"path');
    // JSON.stringify will quote and escape the inner quote
    expect(html).toContain('"/odd\\"path"');
  });
});
