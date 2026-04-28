# @vexorjs/orm

## Unreleased

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
