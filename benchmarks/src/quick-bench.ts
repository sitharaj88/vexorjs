#!/usr/bin/env tsx
/**
 * Quick Vexor Benchmark
 *
 * Standalone benchmark that runs without external framework dependencies.
 * Tests Vexor's core performance characteristics.
 *
 * Run with: npx tsx benchmarks/src/quick-bench.ts
 */

/**
 * Measure execution time
 */
function measure<T>(name: string, fn: () => T, iterations: number = 10000): void {
  // Warmup
  for (let i = 0; i < 1000; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;

  const opsPerSec = (iterations / elapsed) * 1000;
  const avgMicros = (elapsed / iterations) * 1000;

  console.log(`  ${name.padEnd(35)} ${opsPerSec.toFixed(0).padStart(10)} ops/s  ${avgMicros.toFixed(2).padStart(8)}μs`);
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           VEXOR QUICK PERFORMANCE BENCHMARK                ║
╚════════════════════════════════════════════════════════════╝
`);

  console.log('System Info:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${process.platform} ${process.arch}`);
  console.log('');

  // ========================================
  // Framework Core Benchmarks
  // ========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FRAMEWORK CORE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Import from local packages
  const vexorCore = await import('../../packages/vexor/src/index.js');
  const vexorSchema = await import('../../packages/vexor/src/schema/index.js');
  const vexorRequest = await import('../../packages/vexor/src/core/request.js');

  const { Vexor } = vexorCore;
  const { Type } = vexorSchema;
  const { createRequest } = vexorRequest;

  // App creation
  measure('Vexor app instantiation', () => {
    new Vexor();
  }, 10000);

  // Route registration
  const app = new Vexor();
  measure('Route registration (GET)', () => {
    app.get(`/test-${Math.random()}`, {}, async () => new Response('ok'));
  }, 10000);

  // Schema creation
  measure('Type.Object schema creation', () => {
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String(),
      age: Type.Number(),
    });
  }, 50000);

  measure('Type.String with constraints', () => {
    Type.String({ minLength: 1, maxLength: 255, format: 'email' });
  }, 100000);

  // Request creation
  const mockRequest = new Request('http://localhost:3000/users/123?foo=bar');
  measure('VexorRequest creation', () => {
    createRequest(mockRequest);
  }, 50000);

  // Response building
  measure('Response.json creation', () => {
    Response.json({ id: 1, name: 'test', email: 'test@test.com' });
  }, 50000);

  // ========================================
  // Router Benchmarks
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ROUTER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vexorRouter = await import('../../packages/vexor/src/router/index.js');
  const { RadixRouter } = vexorRouter;
  const router = new RadixRouter();

  // Add routes (handlers return Response for type safety)
  const dummyHandler = async () => new Response('ok');
  router.add('GET', '/users', dummyHandler);
  router.add('GET', '/users/:id', dummyHandler);
  router.add('GET', '/users/:id/posts', dummyHandler);
  router.add('GET', '/users/:id/posts/:postId', dummyHandler);
  router.add('POST', '/users', dummyHandler);
  router.add('PUT', '/users/:id', dummyHandler);
  router.add('DELETE', '/users/:id', dummyHandler);
  router.add('GET', '/api/v1/products', dummyHandler);
  router.add('GET', '/api/v1/products/:id', dummyHandler);
  router.add('GET', '/api/v1/categories', dummyHandler);

  measure('Router - static route lookup', () => {
    router.find('GET', '/users');
  }, 100000);

  measure('Router - parametric route lookup', () => {
    router.find('GET', '/users/123');
  }, 100000);

  measure('Router - deep parametric lookup', () => {
    router.find('GET', '/users/123/posts/456');
  }, 100000);

  measure('Router - route not found', () => {
    router.find('GET', '/not/found/route');
  }, 100000);

  // ========================================
  // ORM Benchmarks
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  VEXOR ORM');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vexorOrm = await import('../../packages/vexor-orm/src/index.js');
  const { table, column, SelectBuilder, InsertBuilder, UpdateBuilder, eq } = vexorOrm;

  // Table definition
  measure('Table definition', () => {
    table('users', {
      id: column.serial().primaryKey(),
      name: column.varchar(255).notNull(),
      email: column.varchar(255).unique(),
    });
  }, 10000);

  const users = table('users', {
    id: column.serial().primaryKey(),
    name: column.varchar(255).notNull(),
    email: column.varchar(255).unique().notNull(),
    age: column.integer(),
    active: column.boolean().default(true),
  });

  measure('Column builder chain', () => {
    column.varchar(255).notNull().unique().default('test');
  }, 100000);

  measure('SELECT query builder', () => {
    new SelectBuilder(users).toSQL();
  }, 50000);

  measure('SELECT with WHERE', () => {
    new SelectBuilder(users).where(eq('id', 1)).toSQL();
  }, 50000);

  measure('SELECT complex query', () => {
    new SelectBuilder(users)
      .select('id', 'name', 'email')
      .where(eq('active', true))
      .orderBy('name', 'desc')
      .limit(10)
      .toSQL();
  }, 50000);

  measure('INSERT query builder', () => {
    new InsertBuilder(users)
      .values({ name: 'John', email: 'john@test.com', age: 30 })
      .toSQL();
  }, 50000);

  measure('UPDATE query builder', () => {
    new UpdateBuilder(users)
      .set({ name: 'Updated' })
      .where(eq('id', 1))
      .toSQL();
  }, 50000);

  // ========================================
  // Validation Benchmarks
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vexorValidation = await import('../../packages/vexor/src/validation/index.js');
  const { createValidator, validate, compile } = vexorValidation;

  const UserSchema = Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String(),
    age: Type.Optional(Type.Number({ minimum: 0 })),
  });

  const validator = createValidator(UserSchema);
  const compiledFn = compile(UserSchema);
  const validData = { name: 'John', email: 'john@test.com', age: 30 };
  const invalidData = { name: '', email: 'test' };

  measure('Compiled validator (safeParse)', () => {
    compiledFn(validData);
  }, 50000);

  measure('Validator.parse (valid)', () => {
    validator.parse(validData);
  }, 50000);

  measure('Validator.parse (invalid)', () => {
    try { validator.parse(invalidData); } catch {}
  }, 50000);

  measure('Inline validate call', () => {
    validate(UserSchema, validData);
  }, 50000);

  // ========================================
  // Serialization Benchmarks
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SERIALIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vexorSerialization = await import('../../packages/vexor/src/serialization/index.js');
  const { compileSerializer } = vexorSerialization;

  const serializer = compileSerializer(UserSchema);
  const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };

  measure('Compiled serializer', () => {
    serializer(userData);
  }, 100000);

  measure('Native JSON.stringify', () => {
    JSON.stringify(userData);
  }, 100000);

  // ========================================
  // Summary
  // ========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('  Key Performance Highlights:');
  console.log('  • Router lookups are O(1) for static routes');
  console.log('  • Schema validation is JIT-compiled for speed');
  console.log('  • ORM query builders generate SQL without string parsing');
  console.log('  • Zero-overhead type inference at runtime');
  console.log('');
  console.log('  Run full comparison with: npm run bench:compare');
  console.log('');
}

main().catch(console.error);
