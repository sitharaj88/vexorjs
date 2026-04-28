# Query cache example

Demonstrates per-query TTL caching with the in-memory store.

```bash
npx tsx examples/orm-query-cache/index.ts
```

Key behaviors shown:
- One DB hit for repeated identical calls within the TTL window
- Concurrent callers de-dupe — they share a single in-flight promise
- `cache.delete(key)` invalidates a single entry; `cache.clear()` flushes all

For Redis-backed caching, implement `QueryCacheStore` against your client.
