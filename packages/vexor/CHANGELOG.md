# @vexorjs/core

## 1.3.0

### Minor Changes

- f25366f: Feature sprint: typed RPC client, first-class WebSockets, ORM auto-migrations, and `npm create vexor`.

  **@vexorjs/core**

  - **Typed RPC client** (`@vexorjs/core/client`): `createClient<typeof app>()` gives a fetch client with end-to-end types and zero codegen — paths constrained per HTTP method, `params`/`body` required and typed when the route needs them, and `res.data` typed from what the handler passed to `ctx.json()`. Pass `{ fetch: app.fetch }` to call an app in-process (tests, workers).
  - **Route type accumulation**: `Vexor` is now generic over its registered routes; verb methods accumulate `"METHOD /path"` entries at the type level (zero runtime cost).
  - **`ctx.json()` returns `TypedResponse<T>`** carrying the payload type for the client.
  - **First-class WebSockets**: `app.ws(path, handlers)` with `:params`/wildcards, per-connection context (params, query, headers), topics/pub-sub via `ws.subscribe()`/`ws.publish()`, and `app.websockets.broadcast()`. Served on Node.js through the optional `ws` package; connections drain on `app.close()`.

  **@vexorjs/orm**

  - **Auto-migrations (schema diffing)**: `snapshotSchema()`, `diffSchemas()`, `generateMigrationFromDiff()`, and the one-call `generateAutoMigration()` — compare a JSON schema snapshot against your `table()` definitions and get executable up/down SQL, with warnings for hand-review cases (SQLite column alters, NOT NULL without default).

  **@vexorjs/cli**

  - **`vexor db:diff`**: loads your schema module, diffs it against `schema.snapshot.json`, writes a timestamped migration file, and updates the snapshot. Options: `--schema`, `--out`, `--dialect`, `--name`.

  **create-vexor**

  - New package: `npm create vexor@latest my-app` scaffolds a project via the Vexor CLI's templates (api, minimal, microservice, websocket).

- 037e68e: Performance: JIT-compiled validation and a direct-write response fast path.

  - **JIT validation compiler**: schemas now compile to specialized functions via
    code generation — ~30× faster than the tree-walking interpreter on typical
    request bodies (measured 7.8M validations/sec vs 260K), with byte-identical
    issue output (verified by a parity test suite). Runtimes that forbid codegen
    (e.g. Cloudflare Workers) automatically fall back to the interpreter.
    The interpreter remains exported as `compileInterpreted`.
  - **Node adapter fast path**: responses built from in-memory bodies
    (`ctx.json()`, `ctx.text()`, `ctx.html()`) are written with a single
    `res.end(raw)` instead of pumping a ReadableStream reader per request.
    Streaming responses (SSE, static files) keep the streaming path.

## 1.2.0

### Minor Changes

- 2d418b4: Major hardening and feature release.

  **@vexorjs/core**

  - **End-to-end type inference**: `ctx.params` is now typed from the route path literal, and `ctx.body()` / `ctx.query` from the route schema — no code generation. Bare schemas (`app.post('/x', { body }, h)`) and wrapped options (`{ schema: { body } }`) both infer.
  - **Validation fixes**: properties not marked `Type.Optional(...)` are now required at runtime (matching `Static<T>` inference), and schema violations return `400` with issues instead of `500`.
  - **HTTP semantics**: automatic `405 Method Not Allowed` with an `Allow` header, `HEAD` served from `GET` handlers, hook short-circuiting (return a `Response` from any hook), and global `onRequest` hooks now run for unmatched routes so CORS preflight works everywhere.
  - **Static file serving**: new `serveStatic({ root })` / `sendFile()` with ETag/304, Cache-Control, index files, dotfile policy, and path-traversal protection.
  - **Graceful shutdown**: `new Vexor({ gracefulShutdown: true })` drains in-flight requests on SIGTERM/SIGINT; `NodeAdapter.close()` closes idle connections and force-closes after a timeout. Response writing now respects backpressure.
  - **Plugins wired in**: `app.registerPlugin()` connects the plugin registry to the app — lifecycle hooks run per request, request decorations apply, and plugin prefixes scope routes. Built-in cors/requestId/helmet plugins now actually work.
  - **Router**: trailing wildcards match their bare prefix, the match cache is truly LRU and invalidated on route registration.
  - **Typed response-header channel**: `ctx.setResponseHeader()` / `ctx.mergeResponseHeaders()` replace the internal `_corsHeaders` hack.
  - **Packaging**: removed broken `require` conditions from the exports map (the package is ESM-only).

  **@vexorjs/orm**

  - Per-query parameter numbering (`ParamContext`) replaces the module-global counter — concurrent query building can no longer corrupt placeholders; nested `sql` fragments renumber correctly.
  - Aggregate helpers: `count`, `countDistinct`, `sum`, `avg`, `min`, `max` with `selectRaw()`.
  - Savepoints (`savepoint` / `rollbackTo` / `releaseSavepoint`) are now part of the public `Transaction` interface, including the MySQL driver.
  - The MySQL driver is now actually built and published (`@vexorjs/orm/mysql` previously pointed at a missing file).
  - Removed broken `require` exports condition (ESM-only).

  **@vexorjs/cli**

  - Removed broken `require` exports condition (ESM-only).
  - Test suite is now Windows-compatible.

## 1.1.0 — 2026-04-28

### Minor Changes

- **GraphQL adapter** — `createGraphQLHandler({ schema | executor, contextFactory, graphiql })`. Pure HTTP plumbing; lazy-loads the `graphql` package only when a `schema` is provided. Includes a built-in GraphiQL playground.
- **gRPC-Web adapter** — Full gRPC-Web wire format on plain HTTP/1.1+. `GrpcService` with chainable `unary()` and `serverStream()` registration. JSON codec by default; pluggable `Codec` interface for Protobuf. Canonical status codes, `GrpcError`, header-based metadata pass-through.
- **Server-streaming gRPC** — `serverStream()` handlers return an `AsyncIterable`; each yielded value is sent as a separate frame, terminated with a `grpc-status` trailer.
- **OAuth Redis stores** — `RedisStateStore` and `RedisSessionStore` for multi-instance deployments. Compatible with `ioredis`, `node-redis` v4+, `@upstash/redis`, or any client conforming to `RedisLike`. Configurable prefix, TTL, and call style.
- **Standard Schema interop** — `toStandardSchema` / `validate` / `getErrors` helpers for compatibility with Zod, Valibot, ArkType, and other validators implementing the spec.

### Patch Changes

- WebSocket concurrency hardening — added stress tests covering 1000-subscriber fan-out, mid-broadcast disconnect, idempotent subscribe, and randomized subscribe/unsubscribe interleaving.

## 1.0.1

### Patch Changes

- Patch release: fix publish configuration and version bump
