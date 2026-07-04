# @vexorjs/orm

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

## 1.2.1

### Patch Changes

- c2b06cf: Accept better-sqlite3 v12 in the optional peer dependency range (`^11.0.0 || ^12.0.0`). The full SQLite test suite passes against 12.x.

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

- **Relations + eager loading** — `hasOne`, `hasMany`, `belongsTo`, `belongsToMany` primitives plus `db.loadRelations(rows, relations, spec)`. Single IN-query per relation, no N+1 fan-out.
- **Soft-delete-aware relations** — Pass `softDeletable(table)` as the relation target to auto-filter `deleted_at IS NULL` (or boolean-flag equivalent) in eager loads. Custom column names supported.
- **Schema as code** — `db.createTable(tableDef)` and `db.dropTable(target)` materialize tables with declared indexes from the `index()` / `uniqueIndex()` helpers.
- **Column helpers** — `db.addColumn()` and `db.dropColumn()` for online schema changes outside the migrations workflow.
- **Query result cache** — `createQueryCache({ defaultTtlMs })` with TTL, LRU eviction, in-flight de-duplication, and a pluggable `QueryCacheStore` for Redis/etc. `db.cached(sql, params, { ttlMs })` and `db.invalidateCache(key?)` integrate with the configured cache.
- **MySQL driver wired into `Database`** — MySQL is now a first-class driver alongside Postgres and SQLite, with `$N → ?` placeholder translation across the driver, pool, and transactions.

### Patch Changes

- SQLite driver translates PostgreSQL-style `$N` placeholders to `?` so the shared query builder works against SQLite end-to-end.
- Better-sqlite3 prepared-statement cache cleared on close.

## 1.0.1

### Patch Changes

- Patch release: fix publish configuration and version bump
