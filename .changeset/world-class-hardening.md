---
'@vexorjs/core': minor
'@vexorjs/orm': minor
'@vexorjs/cli': patch
---

Major hardening and feature release.

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
