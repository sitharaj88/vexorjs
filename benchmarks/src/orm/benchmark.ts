/**
 * ORM Benchmarks
 *
 * Performance benchmarks for Vexor ORM query building,
 * execution simulation, and comparison with other ORMs.
 */

/**
 * ORM benchmark result
 */
export interface ORMBenchmarkResult {
  name: string;
  operation: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
  memoryUsed: number;
}

/**
 * Measure execution time
 */
function measure<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}

/**
 * Measure async execution time
 */
async function measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}

/**
 * Get memory usage in bytes
 */
function getMemory(): number {
  if (typeof process !== 'undefined') {
    return process.memoryUsage().heapUsed;
  }
  return 0;
}

/**
 * Run benchmark iterations
 */
function runBenchmark(
  name: string,
  operation: string,
  fn: () => void,
  iterations: number = 10000
): ORMBenchmarkResult {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    fn();
  }

  // Force GC if available
  if (global.gc) {
    global.gc();
  }

  const memBefore = getMemory();
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const totalTime = performance.now() - start;
  const memAfter = getMemory();

  return {
    name,
    operation,
    iterations,
    totalTime,
    avgTime: totalTime / iterations,
    opsPerSecond: (iterations / totalTime) * 1000,
    memoryUsed: memAfter - memBefore,
  };
}

/**
 * Vexor ORM benchmarks
 */
export async function runVexorORMBenchmarks(): Promise<ORMBenchmarkResult[]> {
  const { table, column, SelectBuilder, InsertBuilder, UpdateBuilder, DeleteBuilder, eq } = await import('vexor-orm');

  const results: ORMBenchmarkResult[] = [];

  // Define schema
  const users = table('users', {
    id: column.serial().primaryKey(),
    name: column.varchar(255).notNull(),
    email: column.varchar(255).unique().notNull(),
    age: column.integer(),
    active: column.boolean().default(true),
    createdAt: column.timestamp().defaultNow(),
  });

  const posts = table('posts', {
    id: column.serial().primaryKey(),
    title: column.varchar(255).notNull(),
    content: column.text(),
    userId: column.integer().notNull(),
    publishedAt: column.timestamp(),
  });

  console.log('\n--- Vexor ORM Benchmarks ---\n');

  // 1. Simple SELECT query building
  results.push(runBenchmark(
    'vexor-orm',
    'SELECT simple',
    () => {
      new SelectBuilder(users).toSQL();
    },
    50000
  ));

  // 2. SELECT with WHERE clause
  results.push(runBenchmark(
    'vexor-orm',
    'SELECT with WHERE',
    () => {
      new SelectBuilder(users)
        .where(eq('id', 1))
        .toSQL();
    },
    50000
  ));

  // 3. SELECT with multiple conditions
  results.push(runBenchmark(
    'vexor-orm',
    'SELECT complex WHERE',
    () => {
      new SelectBuilder(users)
        .where(eq('active', true))
        .where(eq('age', 25))
        .orderBy('createdAt', 'desc')
        .limit(10)
        .offset(0)
        .toSQL();
    },
    50000
  ));

  // 4. SELECT with column selection
  results.push(runBenchmark(
    'vexor-orm',
    'SELECT columns',
    () => {
      new SelectBuilder(users)
        .select('id', 'name', 'email')
        .where(eq('active', true))
        .toSQL();
    },
    50000
  ));

  // 5. INSERT query building
  results.push(runBenchmark(
    'vexor-orm',
    'INSERT single',
    () => {
      new InsertBuilder(users)
        .values({ name: 'John', email: 'john@example.com', age: 30 })
        .toSQL();
    },
    50000
  ));

  // 6. INSERT multiple rows
  results.push(runBenchmark(
    'vexor-orm',
    'INSERT batch',
    () => {
      new InsertBuilder(users)
        .values([
          { name: 'John', email: 'john@example.com', age: 30 },
          { name: 'Jane', email: 'jane@example.com', age: 25 },
          { name: 'Bob', email: 'bob@example.com', age: 35 },
        ])
        .toSQL();
    },
    50000
  ));

  // 7. UPDATE query building
  results.push(runBenchmark(
    'vexor-orm',
    'UPDATE',
    () => {
      new UpdateBuilder(users)
        .set({ name: 'Updated', age: 31 })
        .where(eq('id', 1))
        .toSQL();
    },
    50000
  ));

  // 8. DELETE query building
  results.push(runBenchmark(
    'vexor-orm',
    'DELETE',
    () => {
      new DeleteBuilder(users)
        .where(eq('id', 1))
        .toSQL();
    },
    50000
  ));

  // 9. Table definition creation
  results.push(runBenchmark(
    'vexor-orm',
    'Table definition',
    () => {
      table('test_table', {
        id: column.serial().primaryKey(),
        name: column.varchar(255).notNull(),
        email: column.varchar(255).unique(),
        score: column.decimal(10, 2).default('0'),
      });
    },
    10000
  ));

  // 10. Column builder chain
  results.push(runBenchmark(
    'vexor-orm',
    'Column builder',
    () => {
      column.varchar(255).notNull().unique().default('test');
    },
    100000
  ));

  // Print results
  for (const result of results) {
    console.log(`  ${result.operation}:`);
    console.log(`    Ops/sec: ${result.opsPerSecond.toFixed(0).padStart(10)}`);
    console.log(`    Avg time: ${(result.avgTime * 1000).toFixed(2).padStart(8)}μs`);
  }

  return results;
}

/**
 * SQL generation comparison
 */
export async function runSQLGenerationBenchmarks(): Promise<ORMBenchmarkResult[]> {
  const results: ORMBenchmarkResult[] = [];

  console.log('\n--- SQL Generation Speed ---\n');

  // Raw string concatenation (baseline)
  results.push(runBenchmark(
    'raw-string',
    'SELECT generation',
    () => {
      const table = 'users';
      const columns = ['id', 'name', 'email'];
      const where = 'id = 1';
      `SELECT ${columns.join(', ')} FROM ${table} WHERE ${where}`;
    },
    100000
  ));

  // Template literal (baseline)
  results.push(runBenchmark(
    'template-literal',
    'SELECT generation',
    () => {
      const table = 'users';
      const columns = ['id', 'name', 'email'];
      const whereCol = 'id';
      const whereVal = 1;
      `SELECT ${columns.join(', ')} FROM ${table} WHERE ${whereCol} = ${whereVal}`;
    },
    100000
  ));

  // Array-based builder simulation
  results.push(runBenchmark(
    'array-builder',
    'SELECT generation',
    () => {
      const parts: string[] = [];
      parts.push('SELECT');
      parts.push('id, name, email');
      parts.push('FROM');
      parts.push('users');
      parts.push('WHERE');
      parts.push('id = $1');
      parts.join(' ');
    },
    100000
  ));

  // Print results
  for (const result of results) {
    console.log(`  ${result.name} - ${result.operation}:`);
    console.log(`    Ops/sec: ${result.opsPerSecond.toFixed(0).padStart(10)}`);
  }

  return results;
}

/**
 * Type inference overhead (compile-time, but measured at runtime for object creation)
 */
export async function runTypeInferenceBenchmarks(): Promise<ORMBenchmarkResult[]> {
  const { table, column } = await import('vexor-orm');
  const results: ORMBenchmarkResult[] = [];

  console.log('\n--- Type Inference Overhead ---\n');

  // Simple table
  results.push(runBenchmark(
    'vexor-orm',
    'Simple table (3 cols)',
    () => {
      table('simple', {
        id: column.serial().primaryKey(),
        name: column.varchar(255),
        active: column.boolean(),
      });
    },
    10000
  ));

  // Complex table
  results.push(runBenchmark(
    'vexor-orm',
    'Complex table (10 cols)',
    () => {
      table('complex', {
        id: column.serial().primaryKey(),
        name: column.varchar(255).notNull(),
        email: column.varchar(255).unique().notNull(),
        password: column.varchar(255).notNull(),
        age: column.integer(),
        score: column.decimal(10, 2).default('0'),
        active: column.boolean().default(true),
        role: column.varchar(50).default('user'),
        createdAt: column.timestamp().defaultNow(),
        updatedAt: column.timestamp(),
      });
    },
    10000
  ));

  for (const result of results) {
    console.log(`  ${result.operation}:`);
    console.log(`    Ops/sec: ${result.opsPerSecond.toFixed(0).padStart(10)}`);
  }

  return results;
}

/**
 * Run all ORM benchmarks
 */
export async function runAllORMBenchmarks(): Promise<Map<string, ORMBenchmarkResult[]>> {
  console.log('\n========================================');
  console.log('          ORM Benchmarks');
  console.log('========================================');

  const allResults = new Map<string, ORMBenchmarkResult[]>();

  allResults.set('vexor-orm', await runVexorORMBenchmarks());
  allResults.set('sql-generation', await runSQLGenerationBenchmarks());
  allResults.set('type-inference', await runTypeInferenceBenchmarks());

  return allResults;
}

/**
 * Generate ORM benchmark summary
 */
export function generateORMSummary(results: Map<string, ORMBenchmarkResult[]>): void {
  console.log('\n========================================');
  console.log('          ORM Summary');
  console.log('========================================\n');

  const vexorResults = results.get('vexor-orm') ?? [];

  console.log('Vexor ORM Performance:\n');
  console.log('  Operation                   Ops/sec      Avg Time');
  console.log('  ─────────────────────────────────────────────────────');

  for (const result of vexorResults) {
    const op = result.operation.padEnd(24);
    const ops = result.opsPerSecond.toFixed(0).padStart(10);
    const time = `${(result.avgTime * 1000).toFixed(2)}μs`.padStart(12);
    console.log(`  ${op} ${ops} ${time}`);
  }

  // Calculate overall score
  const avgOps = vexorResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / vexorResults.length;
  console.log(`\n  Average operations/sec: ${avgOps.toFixed(0)}`);

  // Highlight fast operations
  const fastOps = vexorResults.filter(r => r.opsPerSecond > 100000);
  if (fastOps.length > 0) {
    console.log(`\n  Fast operations (>100k ops/sec): ${fastOps.length}`);
    for (const op of fastOps) {
      console.log(`    - ${op.operation}: ${op.opsPerSecond.toFixed(0)} ops/sec`);
    }
  }
}
