---
'@vexorjs/core': minor
'@vexorjs/orm': minor
'@vexorjs/cli': minor
'create-vexor': patch
---

Feature sprint: typed RPC client, first-class WebSockets, ORM auto-migrations, and `npm create vexor`.

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
