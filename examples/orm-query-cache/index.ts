/**
 * Query Cache Example
 *
 * Demonstrates per-query TTL caching with `wrap()`.
 *
 * Run with: npx tsx examples/orm-query-cache/index.ts
 */

import { connect, createQueryCache, buildCacheKey } from '@vexorjs/orm';

async function main() {
  const db = await connect({ driver: 'sqlite', filename: ':memory:' });
  const cache = createQueryCache({ defaultTtlMs: 5_000 });

  await db.query(
    'CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, qty INTEGER)'
  );
  await db.query(
    'INSERT INTO products (name, qty) VALUES (?, ?), (?, ?)',
    ['apple', 5, 'pear', 3]
  );

  const sql = 'SELECT * FROM products WHERE qty > ?';
  const params = [0];
  const key = buildCacheKey(sql, params);

  let dbHits = 0;

  // Wrap a query in the cache. The DB is hit on the first call and skipped
  // on subsequent calls within the TTL window.
  const fetchProducts = () =>
    cache.wrap(key, 5_000, async () => {
      dbHits++;
      const result = await db.execute<{ id: number; name: string; qty: number }>(sql, params);
      return result;
    });

  const a = await fetchProducts();
  const b = await fetchProducts();
  const c = await fetchProducts();

  console.log(`DB hits: ${dbHits}`); // → 1
  console.log('rows:', a);
  console.log('a === b:', a === b);
  console.log('a === c:', a === c);

  // Concurrent callers all share the same in-flight promise.
  await cache.delete(key);
  dbHits = 0;
  const [r1, r2, r3] = await Promise.all([fetchProducts(), fetchProducts(), fetchProducts()]);
  console.log(`Concurrent DB hits: ${dbHits}`); // → 1
  console.log('all equal:', r1 === r2 && r2 === r3);

  await db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
