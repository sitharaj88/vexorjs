/**
 * GraphQL Adapter
 *
 * Pure HTTP plumbing — parses requests, calls a user-supplied executor, and
 * formats responses per the GraphQL-over-HTTP spec. No hard dependency on
 * the `graphql` package: callers either pass a `schema` (we'll lazy-load
 * `graphql.execute` + `graphql.parse`), or pass an `executor` directly.
 *
 *   import { createGraphQLHandler } from '@vexorjs/core/graphql';
 *
 *   const handler = createGraphQLHandler({ schema, contextFactory });
 *   app.post('/graphql', handler);
 *   app.get('/graphql',  handler);  // GraphiQL playground if `graphiql: true`
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{ message: string; path?: (string | number)[]; extensions?: Record<string, unknown> }>;
  extensions?: Record<string, unknown>;
}

/**
 * Minimal Vexor context shape used by the handler. Compatible with
 * VexorContext but only requires what the GraphQL adapter actually uses,
 * which keeps testing and reuse simple.
 */
export interface GraphQLHTTPContext {
  method: string;
  request: Request;
  json(body: unknown, status?: number): Response | Promise<Response>;
  html?: (body: string, status?: number) => Response | Promise<Response>;
  status?: (code: number) => unknown;
}

/**
 * Schema object compatible with `graphql.execute()`.
 * Typed loosely to avoid forcing a `graphql` dependency at type-check time.
 */
export type GraphQLSchema = unknown;

/**
 * Caller-supplied executor. Receives a parsed request + the per-request
 * `contextValue` and returns the JSON response body.
 */
export type GraphQLExecutor = (
  request: GraphQLRequest,
  contextValue: unknown
) => Promise<GraphQLResponse> | GraphQLResponse;

export interface CreateGraphQLHandlerOptions {
  /**
   * Pre-built executor. Takes precedence over `schema`. Use this with
   * Yoga/Apollo or when you want full control.
   */
  executor?: GraphQLExecutor;

  /**
   * Schema object compatible with `graphql.execute()`. When provided (and
   * `executor` is not), the handler dynamically imports the `graphql`
   * package on first call and runs `parse` + `execute` against this schema.
   */
  schema?: GraphQLSchema;

  /**
   * Build the per-request context value passed to resolvers. Receives the
   * Vexor context — return whatever your resolvers need.
   */
  contextFactory?: (ctx: GraphQLHTTPContext) => unknown | Promise<unknown>;

  /**
   * Render GraphiQL on GET. Default: false.
   * Pass `true` for the bundled minimal page, or a string to use your own.
   */
  graphiql?: boolean | string;

  /**
   * Override the default endpoint URL used by GraphiQL (default: '/graphql').
   * Only relevant when `graphiql` is true.
   */
  endpoint?: string;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export type GraphQLHandler = (ctx: GraphQLHTTPContext) => Promise<Response>;

export function createGraphQLHandler(
  options: CreateGraphQLHandlerOptions
): GraphQLHandler {
  const executor = options.executor ?? buildSchemaExecutor(options.schema);

  return async (ctx: GraphQLHTTPContext): Promise<Response> => {
    const method = ctx.method.toUpperCase();

    if (method === 'GET' && options.graphiql) {
      const endpoint = options.endpoint ?? '/graphql';
      const html =
        typeof options.graphiql === 'string'
          ? options.graphiql
          : renderGraphiQL(endpoint);
      if (ctx.html) {
        return await ctx.html(html);
      }
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (method !== 'POST') {
      return await ctx.json(
        {
          errors: [{ message: 'Only POST is allowed for GraphQL operations' }],
        },
        405
      );
    }

    let body: unknown;
    try {
      body = await ctx.request.json();
    } catch (err) {
      return await ctx.json(
        {
          errors: [
            { message: `Invalid JSON body: ${(err as Error).message}` },
          ],
        },
        400
      );
    }

    const parsed = parseGraphQLRequest(body);
    if ('error' in parsed) {
      return await ctx.json(
        { errors: [{ message: parsed.error }] },
        400
      );
    }

    let contextValue: unknown = ctx;
    if (options.contextFactory) {
      try {
        contextValue = await options.contextFactory(ctx);
      } catch (err) {
        return await ctx.json(
          {
            errors: [
              {
                message: `Context factory failed: ${(err as Error).message}`,
              },
            ],
          },
          500
        );
      }
    }

    let result: GraphQLResponse;
    try {
      result = await executor(parsed.value, contextValue);
    } catch (err) {
      result = {
        errors: [{ message: (err as Error).message }],
      };
    }

    return await ctx.json(result, statusFor(result));
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseGraphQLRequest(
  body: unknown
):
  | { value: GraphQLRequest }
  | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Request body must be an object with a "query" field' };
  }
  const b = body as Record<string, unknown>;
  if (typeof b.query !== 'string' || b.query.length === 0) {
    return { error: '"query" must be a non-empty string' };
  }
  if (
    b.variables !== undefined &&
    (typeof b.variables !== 'object' || b.variables === null)
  ) {
    return { error: '"variables" must be an object when present' };
  }
  if (b.operationName !== undefined && typeof b.operationName !== 'string') {
    return { error: '"operationName" must be a string when present' };
  }
  return {
    value: {
      query: b.query,
      variables: b.variables as Record<string, unknown> | undefined,
      operationName: b.operationName as string | undefined,
    },
  };
}

/**
 * HTTP status from a GraphQL response. Per the GraphQL-over-HTTP spec, a
 * partial-success result (data + errors) is still 200; only when the
 * request itself fails to execute do we return 500.
 */
export function statusFor(response: GraphQLResponse): number {
  if (response.data !== undefined) return 200;
  if (response.errors && response.errors.length > 0) return 500;
  return 200;
}

/**
 * Build an executor backed by a schema + the `graphql` package, loaded
 * dynamically the first time the executor runs. If `graphql` isn't
 * installed we throw a clear, actionable error.
 */
function buildSchemaExecutor(
  schema: GraphQLSchema | undefined
): GraphQLExecutor {
  if (!schema) {
    return () => {
      throw new Error(
        'createGraphQLHandler requires either `executor` or `schema`'
      );
    };
  }

  // Cache the loaded module across calls to avoid the lazy-import on each request.
  let mod:
    | {
        parse(src: string): unknown;
        execute(args: unknown): Promise<{
          data?: unknown;
          errors?: Array<{ message: string; path?: (string | number)[] }>;
        }>;
      }
    | null = null;

  const loadGraphql = async () => {
    if (mod) return mod;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = await (Function('return import("graphql")')() as Promise<any>);
      mod = m;
      return mod!;
    } catch {
      throw new Error(
        'GraphQL package not installed. Run: npm install graphql'
      );
    }
  };

  return async (
    request: GraphQLRequest,
    contextValue: unknown
  ): Promise<GraphQLResponse> => {
    const m = await loadGraphql();
    let document: unknown;
    try {
      document = m.parse(request.query);
    } catch (err) {
      return {
        errors: [{ message: `Syntax error: ${(err as Error).message}` }],
      };
    }
    const result = await m.execute({
      schema,
      document,
      variableValues: request.variables,
      operationName: request.operationName,
      contextValue,
    });
    return result as GraphQLResponse;
  };
}

/**
 * Minimal GraphiQL playground. Loaded from the official CDN — keeps the
 * core package tiny.
 */
export function renderGraphiQL(endpoint: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>GraphiQL</title>
    <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
  </head>
  <body style="margin:0;height:100vh;">
    <div id="graphiql" style="height:100vh;"></div>
    <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: ${JSON.stringify(endpoint)} });
      ReactDOM.createRoot(document.getElementById('graphiql')).render(
        React.createElement(GraphiQL, { fetcher })
      );
    </script>
  </body>
</html>`;
}
