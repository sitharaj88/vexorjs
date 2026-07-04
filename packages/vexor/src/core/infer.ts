/**
 * Route-level type inference.
 *
 * These types thread a route's path literal and schema into the handler's
 * context, so `ctx.params`, `ctx.query`, and `ctx.body()` are typed without
 * code generation:
 *
 *   app.get('/users/:id', (ctx) => ctx.json({ id: ctx.params.id }));
 *   //                                                       ^ string
 *
 *   app.post('/users', { schema: { body: Type.Object({ name: Type.String() }) } },
 *     async (ctx) => {
 *       const body = await ctx.body(); // { name: string }
 *       ...
 *     });
 */

import type { RouteParams, ParsedQuery, RouteSchema } from './types.js';
import type { TSchema } from '../schema/types.js';
import type { Static } from '../schema/static.js';
import type { VexorContext } from './context.js';

/**
 * Extract `:param` names from a path string literal as `{ param: string }`
 */
type ExtractPathParams<Path extends string> = Path extends `${string}:${infer Rest}`
  ? Rest extends `${infer Param}/${infer Tail}`
    ? { [K in Param]: string } & ExtractPathParams<`/${Tail}`>
    : { [K in Rest]: string }
  : {};

/**
 * Params inferred from a path literal, including the `*` catch-all
 */
export type PathParams<Path extends string> = (Path extends `${string}*${string}`
  ? { '*': string }
  : {}) &
  ExtractPathParams<Path>;

/**
 * Params type for a route: the schema's params take precedence,
 * then params parsed from the path literal, then plain RouteParams
 */
export type InferParams<Path extends string, S> = S extends { params: infer P extends TSchema }
  ? Static<P> extends RouteParams
    ? Static<P>
    : RouteParams
  : keyof PathParams<Path> extends never
    ? RouteParams
    : PathParams<Path>;

/**
 * Query type for a route: the schema's query shape, or ParsedQuery
 */
export type InferQuery<S> = S extends { query: infer Q extends TSchema } ? Static<Q> : ParsedQuery;

/**
 * Body type for a route: the schema's body shape, or unknown
 */
export type InferBody<S> = S extends { body: infer B extends TSchema } ? Static<B> : unknown;

/**
 * The fully-typed context for a route defined by its path and schema
 */
export type ContextFor<Path extends string, S extends RouteSchema | undefined = undefined> =
  VexorContext<InferParams<Path, S> & RouteParams, InferQuery<S>, InferBody<S>>;
