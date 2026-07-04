/**
 * Vexor RPC Client
 *
 * A fully typed HTTP client for Vexor apps. Types flow from the server's
 * route registrations — no code generation:
 *
 *   // server.ts
 *   const app = new Vexor()
 *     .get('/users/:id', (ctx) => ctx.json({ id: ctx.params.id, name: 'Ada' }))
 *     .post('/users', { body: UserSchema }, async (ctx) =>
 *       ctx.status(201).json(await ctx.body()));
 *   export type App = typeof app;
 *
 *   // client.ts
 *   import { createClient } from '@vexorjs/core/client';
 *   const api = createClient<App>({ baseUrl: 'http://localhost:3000' });
 *
 *   const user = await api.get('/users/:id', { params: { id: '42' } });
 *   user.data; // { id: string; name: string }
 *
 *   const created = await api.post('/users', { body: { name: 'Ada', email: 'a@b.c' } });
 *   created.data; // typed from the handler's ctx.json(...)
 *
 * For tests (or same-process calls), pass the app's fetch handler directly:
 *
 *   const api = createClient<App>({ fetch: app.fetch });
 */

import type { Vexor } from '../core/app.js';
import type { RouteMap, RouteTypes } from '../core/infer.js';

// ============ Type helpers ============

/**
 * Routes registered on an app type: `RoutesOf<typeof app>`
 */
export type RoutesOf<TApp> = TApp extends Vexor<infer R> ? R : RouteMap;

/** Paths registered for a given method */
type PathsFor<Routes, M extends string> = keyof Routes extends infer K
  ? K extends `${M} ${infer P}`
    ? P
    : never
  : never;

/** Route entry for a method+path key (falls back to loose types) */
type EntryFor<Routes, K> = K extends keyof Routes
  ? Routes[K] extends RouteTypes
    ? Routes[K]
    : RouteTypes
  : RouteTypes;

type QueryValue = string | number | boolean | undefined;

/** Free-form query for untyped routes, exact shape for schema-typed ones */
type QueryInput<Q> = Record<string, string | string[] | undefined> extends Q
  ? Record<string, QueryValue>
  : Q;

/** Options for one request; params/body become required when the route needs them */
export type RequestOptions<E extends RouteTypes> = ({} extends E['params']
  ? { params?: Record<string, string> }
  : { params: E['params'] }) &
  (unknown extends E['body'] ? { body?: unknown } : { body: E['body'] }) & {
    query?: QueryInput<E['query']>;
    headers?: Record<string, string>;
  };

/** The options argument is omittable when nothing in it is required */
type OptsArg<E extends RouteTypes> = {} extends RequestOptions<E>
  ? [options?: RequestOptions<E>]
  : [options: RequestOptions<E>];

/**
 * A typed client response. `data` carries the type the handler passed
 * to ctx.json(); non-JSON responses yield a string.
 */
export interface ClientResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  headers: Headers;
  raw: Response;
}

// ============ Client options ============

export interface ClientOptions {
  /** Base URL of the server, e.g. "https://api.example.com" */
  baseUrl?: string;
  /**
   * Fetch implementation. Defaults to global fetch; pass `app.fetch`
   * to call a Vexor app in-process (tests, monoliths, workers).
   */
  fetch?: (request: Request) => Response | Promise<Response>;
  /** Headers applied to every request (or a factory, e.g. for auth tokens) */
  headers?: Record<string, string> | (() => Record<string, string>);
}

// ============ Implementation ============

interface AnyRequestOptions {
  params?: Record<string, string>;
  query?: Record<string, QueryValue> | object;
  body?: unknown;
  headers?: Record<string, string>;
}

/** Substitute `:param` tokens and the trailing `*` with values */
function buildPath(path: string, params: Record<string, string> = {}): string {
  let result = path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    const value = params[name];
    if (value === undefined) {
      throw new Error(`Missing path param "${name}" for ${path}`);
    }
    return encodeURIComponent(value);
  });

  if (result.includes('*')) {
    const wildcard = params['*'] ?? '';
    // Wildcard values may contain slashes by design
    result = result.replace('*', wildcard.split('/').map(encodeURIComponent).join('/'));
  }

  return result;
}

export class VexorClient<Routes extends RouteMap = RouteMap> {
  private readonly options: ClientOptions;

  constructor(options: ClientOptions = {}) {
    this.options = options;
  }

  get<P extends PathsFor<Routes, 'GET'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `GET ${P}`>>
  ): Promise<ClientResponse<EntryFor<Routes, `GET ${P}`>['response']>> {
    return this.request('GET', path, args[0] as AnyRequestOptions | undefined);
  }

  post<P extends PathsFor<Routes, 'POST'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `POST ${P}`>>
  ): Promise<ClientResponse<EntryFor<Routes, `POST ${P}`>['response']>> {
    return this.request('POST', path, args[0] as AnyRequestOptions | undefined);
  }

  put<P extends PathsFor<Routes, 'PUT'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `PUT ${P}`>>
  ): Promise<ClientResponse<EntryFor<Routes, `PUT ${P}`>['response']>> {
    return this.request('PUT', path, args[0] as AnyRequestOptions | undefined);
  }

  patch<P extends PathsFor<Routes, 'PATCH'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `PATCH ${P}`>>
  ): Promise<ClientResponse<EntryFor<Routes, `PATCH ${P}`>['response']>> {
    return this.request('PATCH', path, args[0] as AnyRequestOptions | undefined);
  }

  delete<P extends PathsFor<Routes, 'DELETE'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `DELETE ${P}`>>
  ): Promise<ClientResponse<EntryFor<Routes, `DELETE ${P}`>['response']>> {
    return this.request('DELETE', path, args[0] as AnyRequestOptions | undefined);
  }

  head<P extends PathsFor<Routes, 'HEAD' | 'GET'> & string>(
    path: P,
    ...args: OptsArg<EntryFor<Routes, `HEAD ${P}`>>
  ): Promise<ClientResponse<unknown>> {
    return this.request('HEAD', path, args[0] as AnyRequestOptions | undefined);
  }

  /** Escape hatch: untyped request to any path */
  async request(
    method: string,
    path: string,
    options: AnyRequestOptions | undefined = {}
  ): Promise<ClientResponse<any>> {
    const url = buildPath(path, options.params);

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) searchParams.append(key, String(v));
      } else {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();

    // A dummy origin keeps Request construction valid for in-process fetch
    const base = (this.options.baseUrl ?? 'http://vexor.local').replace(/\/$/, '');
    const target = `${base}${url}${queryString ? `?${queryString}` : ''}`;

    const baseHeaders =
      typeof this.options.headers === 'function' ? this.options.headers() : this.options.headers;
    const headers = new Headers(baseHeaders);
    for (const [key, value] of Object.entries(options.headers ?? {})) {
      headers.set(key, value);
    }

    let body: string | undefined;
    if (options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      body = JSON.stringify(options.body);
    }

    const request = new Request(target, { method, headers, body });
    const fetchImpl = this.options.fetch ?? fetch;
    const response = await fetchImpl(request);

    const contentType = response.headers.get('content-type') ?? '';
    const data =
      response.status === 204 || method === 'HEAD'
        ? undefined
        : contentType.includes('application/json')
          ? await response.json()
          : await response.text();

    return {
      data,
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      raw: response,
    };
  }
}

/**
 * Create a typed client for a Vexor app:
 *
 *   const api = createClient<typeof app>({ baseUrl: 'http://localhost:3000' });
 */
export function createClient<TApp = Vexor>(options: ClientOptions = {}): VexorClient<RoutesOf<TApp>> {
  return new VexorClient<RoutesOf<TApp>>(options);
}
