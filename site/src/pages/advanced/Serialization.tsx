import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { stringify } from '@vexorjs/core/serialization';

const user = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15'),
  roles: ['admin', 'user'],
};

// Drop-in replacement for JSON.stringify
// Uses fast-path optimizations for common types
const json = stringify(user);
// => {"id":1,"name":"Alice Johnson","email":"alice@example.com",...}

// Works with any serializable value
stringify(42);            // "42"
stringify('hello');       // "\\"hello\\""
stringify([1, 2, 3]);    // "[1,2,3]"
stringify(null);          // "null"
stringify(true);          // "true"`;

const schemaBasedCode = `import { compileSerializer } from '@vexorjs/core/serialization';

// Define a schema matching your data shape.
// The serializer compiles an optimized function that
// knows the exact structure ahead of time.
const serializeUser = compileSerializer({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'integer' },
    active: { type: 'boolean' },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zip: { type: 'string' },
        country: { type: 'string' },
      },
    },
  },
  required: ['id', 'name', 'email'],
});

// Use the compiled serializer
const json = serializeUser({
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 30,
  active: true,
  roles: ['admin', 'user'],
  address: {
    street: '123 Main St',
    city: 'Springfield',
    zip: '62701',
    country: 'US',
  },
});

// The compiled function is 2-5x faster than JSON.stringify
// because it knows the exact property names and types at
// compile time, avoiding dynamic type checking.`;

const performanceCode = `import { compileSerializer, stringify } from '@vexorjs/core/serialization';

// Benchmark: 10,000 serializations of a user object
const user = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 30,
  active: true,
  roles: ['admin', 'user'],
  address: {
    street: '123 Main St',
    city: 'Springfield',
    zip: '62701',
    country: 'US',
  },
};

// Compile the serializer once
const serializeUser = compileSerializer({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'integer' },
    active: { type: 'boolean' },
    roles: { type: 'array', items: { type: 'string' } },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zip: { type: 'string' },
        country: { type: 'string' },
      },
    },
  },
});

// Results (10,000 iterations on Node.js 20):
//
// JSON.stringify:        ~45ms  (baseline)
// stringify():           ~30ms  (1.5x faster)
// compileSerializer():   ~12ms  (3.7x faster)
//
// The compiled serializer wins because:
// 1. No dynamic property enumeration
// 2. No runtime type checking
// 3. Pre-computed string templates
// 4. Integer fast-path (no float detection)`;

const complexObjectsCode = `import { compileSerializer } from '@vexorjs/core/serialization';

// Nested objects with optional properties
const serializeOrder = compileSerializer({
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'string' },
    total: { type: 'number' },
    currency: { type: 'string' },
    customer: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          quantity: { type: 'integer' },
          unitPrice: { type: 'number' },
          subtotal: { type: 'number' },
        },
      },
    },
    shipping: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        trackingNumber: { type: 'string' },
        estimatedDelivery: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            line1: { type: 'string' },
            line2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            country: { type: 'string' },
          },
        },
      },
    },
    metadata: {
      type: 'object',
      additionalProperties: true, // Allow any key-value pairs
    },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'status', 'total', 'customer', 'items'],
});

const json = serializeOrder({
  id: 'ord_abc123',
  status: 'shipped',
  total: 149.97,
  currency: 'USD',
  customer: {
    id: 'cust_456',
    name: 'Bob Smith',
    email: 'bob@example.com',
  },
  items: [
    { productId: 'prod_1', name: 'Widget', quantity: 3, unitPrice: 49.99, subtotal: 149.97 },
  ],
  shipping: {
    method: 'express',
    trackingNumber: 'TRK789',
    estimatedDelivery: '2024-02-20',
    address: {
      line1: '456 Oak Ave',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'US',
    },
  },
  metadata: { source: 'web', campaign: 'spring-sale' },
  createdAt: '2024-02-15T10:30:00Z',
  updatedAt: '2024-02-16T14:22:00Z',
});`;

const arraysCode = `import { compileSerializer } from '@vexorjs/core/serialization';

// Serialize arrays of typed objects
const serializeUserList = compileSerializer({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string' },
      active: { type: 'boolean' },
    },
  },
});

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true },
];

const json = serializeUserList(users);

// Paginated response serializer
const serializePaginatedUsers = compileSerializer({
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        perPage: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
      },
    },
  },
});`;

const routeIntegrationCode = `import { Vexor } from '@vexorjs/core';
import { compileSerializer, createSerializer } from '@vexorjs/core/serialization';

const app = new Vexor();

// Pre-compile serializers for your response shapes
const serializeUser = compileSerializer({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    createdAt: { type: 'string' },
  },
});

const serializeUserList = compileSerializer({
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
        },
      },
    },
    total: { type: 'integer' },
  },
});

// Use in routes for faster JSON responses
app.get('/users/:id', async (ctx) => {
  const user = await db.findUser(ctx.params.id);
  if (!user) return ctx.status(404).json({ error: 'Not found' });

  // Use the compiled serializer directly
  const body = serializeUser(user);
  return ctx.header('Content-Type', 'application/json').body(body);
});

app.get('/users', async (ctx) => {
  const page = parseInt(ctx.query.page || '1');
  const { users, total } = await db.listUsers(page);

  const body = serializeUserList({ users, total });
  return ctx.header('Content-Type', 'application/json').body(body);
});

// Or use createSerializer with options for more control
const serializer = createSerializer({
  schema: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
  },
  rounding: 'floor',       // Round numbers down
  largeArrayMechanism: 'json-stringify',  // Fall back for very large arrays
});

app.get('/api/data', async (ctx) => {
  const data = await fetchData();
  return ctx.header('Content-Type', 'application/json')
    .body(serializer(data));
});`;

const fastJsonCode = `import { FastJSON } from '@vexorjs/core/serialization';

// FastJSON provides a high-performance JSON class
// with schema caching and automatic compilation
const json = new FastJSON();

// Register schemas once at startup
json.addSchema('user', {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    active: { type: 'boolean' },
  },
});

json.addSchema('userList', {
  type: 'array',
  items: { $ref: 'user' },
});

json.addSchema('apiResponse', {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {},  // Any type
    error: { type: 'string' },
    timestamp: { type: 'string' },
  },
});

// Serialize using schema name
const userJson = json.stringify('user', {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  active: true,
});

// Schema references work across registrations
const listJson = json.stringify('userList', [
  { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
]);

// Use in Vexor routes
app.get('/users/:id', async (ctx) => {
  const user = await db.findUser(ctx.params.id);
  return ctx.header('Content-Type', 'application/json')
    .body(json.stringify('user', user));
});`;

export default function Serialization() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="fast-serialization" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Fast JSON Serialization
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Accelerate JSON response generation with schema-based compiled serializers. By telling
          Vexor the shape of your data at build time, it generates optimized serialization functions
          that run 2-5x faster than <code className="prose-code">JSON.stringify</code>, significantly
          improving throughput for high-traffic APIs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          JSON serialization is one of the most CPU-intensive operations in a typical API server.
          For every response your application sends, the server must traverse the response object,
          determine the type of each value, escape strings, format numbers, and assemble the
          resulting character sequence into a valid JSON string. The built-in
          <code className="prose-code"> JSON.stringify</code> function does this generically -- it
          handles any JavaScript value by dynamically inspecting types at runtime, enumerating
          object keys through the prototype chain, checking for <code className="prose-code">toJSON</code> methods,
          and applying generic string escaping for every character. This generality comes at a cost.
          In benchmarks, serialization often accounts for 15-40% of total response time for JSON API
          endpoints, making it a significant bottleneck at scale.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The insight behind schema-compiled serializers is that most API responses have a known,
          fixed shape. A user endpoint always returns an object with <code className="prose-code">id</code>,
          <code className="prose-code"> name</code>, <code className="prose-code">email</code>, and a
          handful of other predictable fields. A list endpoint always returns an array of these
          objects. If the serializer knows the shape in advance, it can eliminate most of the runtime
          work: instead of enumerating keys dynamically, it accesses them directly by name; instead of
          checking whether each value is a string, number, boolean, or object, it knows the type from
          the schema; instead of building the output string character by character, it can use
          pre-computed template strings for the fixed parts (property names, colons, commas) and
          only serialize the variable parts (actual values).
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor's serialization module provides three levels of optimization. The
          <code className="prose-code"> stringify()</code> function is a drop-in replacement for
          <code className="prose-code"> JSON.stringify</code> that applies fast-path optimizations for
          common types without requiring a schema -- it is about 1.5x faster in typical benchmarks.
          The <code className="prose-code">compileSerializer()</code> function takes a JSON Schema
          definition and generates a specialized serialization function that is 2-5x faster. The
          <code className="prose-code"> FastJSON</code> class provides schema management and
          cross-referencing for applications with many response shapes.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">compileSerializer(schema)</code>, Vexor analyzes
          the schema and generates a specialized JavaScript function using <code className="prose-code">new Function()</code>.
          This compilation step is where the magic happens: the generated function is tailored to your
          exact data shape, with all property names, type checks, and structural elements baked into
          the function body at compilation time.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Consider a simple schema with three string properties. The compiled function knows at
          generation time that the output will always start with <code className="prose-code">{'{"id":"'}</code>,
          followed by the escaped value of <code className="prose-code">obj.id</code>, followed by
          <code className="prose-code">{'"name":"'}</code>, and so on. It concatenates these
          pre-computed template strings with the serialized values using simple string operations.
          There is no loop over object keys, no <code className="prose-code">typeof</code> checks, no
          <code className="prose-code"> Object.keys()</code> calls, and no prototype chain traversal.
          The result is a tight, linear function that does the absolute minimum work to produce valid
          JSON.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Type-specific optimizations further accelerate the process. For integer-typed properties,
          the compiled function uses a fast integer-to-string conversion that avoids the overhead of
          detecting whether a number is an integer or a float. For boolean properties, it emits a
          simple ternary that writes <code className="prose-code">"true"</code> or
          <code className="prose-code"> "false"</code> without any function call. For string properties,
          it uses a pre-compiled escape function that only checks for the specific characters that
          need escaping in JSON (quotes, backslashes, control characters), skipping the generic
          character-by-character scanning that <code className="prose-code">JSON.stringify</code> performs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The compilation step itself is relatively expensive (a few milliseconds), which is why
          you must call <code className="prose-code">compileSerializer</code> at module
          initialization time, outside of request handlers. The resulting function is cached and
          reused for every request, amortizing the compilation cost over the lifetime of the process.
          For a high-traffic endpoint that serializes thousands of responses per second, the upfront
          compilation cost is negligible compared to the cumulative savings.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Optional properties are handled by including a null check in the generated function. If
          a property is not in the <code className="prose-code">required</code> array, the compiled
          function checks whether the value is <code className="prose-code">undefined</code> before
          serializing it, and skips it entirely if absent. Properties marked with
          <code className="prose-code"> additionalProperties: true</code> are handled by falling
          back to <code className="prose-code">JSON.stringify</code> for that specific sub-object,
          since the schema provides no structural information for dynamic keys.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Schema-compiled serialization delivers the most value in high-throughput API endpoints
          that return responses with a known, stable shape. If an endpoint handles thousands of
          requests per second and each response is a moderately-sized JSON object (a few hundred
          bytes to a few kilobytes), the 2-5x speedup in serialization translates directly to
          measurably lower response latency and higher throughput capacity.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The benefit is most pronounced for endpoints that return lists of objects. When serializing
          an array of 100 user objects, <code className="prose-code">JSON.stringify</code> must
          enumerate keys and check types 100 times -- once per object. A compiled serializer applies
          the same pre-computed logic to each element, and because V8's JIT compiler can inline and
          optimize the hot function, the per-element cost approaches the theoretical minimum.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You should <strong className="text-slate-900 dark:text-white">not</strong> use compiled
          serialization for responses with fully dynamic shapes (like proxied responses from upstream
          APIs where you cannot predict the keys), for extremely simple responses (a single
          <code className="prose-code">{'{}'}</code> with one or two fields, where the overhead of
          <code className="prose-code"> JSON.stringify</code> is already negligible), or for
          responses that change shape frequently during development (the schema must be kept in sync
          with the actual data). In these cases, the standard <code className="prose-code">ctx.json()</code> method
          or the schema-less <code className="prose-code">stringify()</code> function is the better choice.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          A practical guideline: if your profiler shows that serialization accounts for more than
          10% of your endpoint's CPU time, compiled serialization will deliver meaningful gains. For
          endpoints where serialization is less than 5% of total time (because the handler spends
          most of its time in database queries or network calls), the improvement will be real but
          not noticeable in end-to-end measurements. Optimize the bottleneck first.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">stringify</code> function is a drop-in replacement for{' '}
          <code className="prose-code">JSON.stringify</code> that uses fast-path optimizations for
          common types. It works with any serializable value without requiring a schema definition.
          This is the easiest way to get a performance improvement with zero configuration -- simply
          replace <code className="prose-code">JSON.stringify(data)</code> with
          <code className="prose-code"> stringify(data)</code> in your existing code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Internally, <code className="prose-code">stringify()</code> uses several micro-optimizations
          compared to the native implementation. It uses faster string escaping that avoids regex
          overhead for common characters, takes a fast path for small integers (avoiding float
          conversion), and skips unnecessary intermediate allocations during object traversal.
          These optimizations are always applicable regardless of data shape, which is why it delivers
          a consistent 1.3-1.5x speedup without requiring any schema.
        </p>
        <CodeBlock code={basicUsageCode} filename="basic.ts" showLineNumbers />
        <InfoBlock variant="info" title="When to Use stringify vs compileSerializer">
          Use <code className="prose-code">stringify()</code> when you have dynamic or unknown data shapes.
          Use <code className="prose-code">compileSerializer()</code> when you know the shape ahead
          of time and need maximum performance. The compiled version is significantly faster but
          requires a schema definition and upfront compilation. For most applications, start with
          <code className="prose-code"> stringify()</code> and upgrade to compiled serialization for
          your hottest endpoints.
        </InfoBlock>
      </section>

      {/* Schema-Based Serialization */}
      <section>
        <h2 id="schema-based" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Schema-Based Serialization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For maximum performance, use <code className="prose-code">compileSerializer</code> with a
          JSON Schema definition. The compiler generates an optimized function that knows the exact
          property names and types, eliminating runtime type checking and dynamic property enumeration.
          The schema uses a subset of JSON Schema syntax, supporting <code className="prose-code">type</code>,
          <code className="prose-code"> properties</code>, <code className="prose-code">items</code>,
          <code className="prose-code"> required</code>, and <code className="prose-code">additionalProperties</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">required</code> array in the schema is not just for
          validation -- it directly affects the generated code. Properties listed as required are
          accessed unconditionally, without a null/undefined check, which saves a branch instruction
          per property per serialization. Optional properties include a check and are omitted from
          the output when absent. For best performance, list all properties that are guaranteed to
          be present in the <code className="prose-code">required</code> array.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The distinction between <code className="prose-code">integer</code> and
          <code className="prose-code"> number</code> types matters for performance. When a property
          is typed as <code className="prose-code">integer</code>, the serializer uses a fast
          integer-to-string conversion that avoids the overhead of <code className="prose-code">Number.toString()</code>.
          When typed as <code className="prose-code">number</code>, it uses the standard conversion
          that handles both integers and floating-point values correctly. Use
          <code className="prose-code"> integer</code> for fields like IDs, counts, and quantities;
          use <code className="prose-code">number</code> for prices, percentages, and measurements.
        </p>
        <CodeBlock code={schemaBasedCode} filename="schema-serializer.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Compile Once, Use Many">
          Call <code className="prose-code">compileSerializer</code> once at module initialization
          time (outside of request handlers). The compilation step is expensive, but the resulting
          function is extremely fast and can be reused for every request. Never call compileSerializer
          inside a route handler -- it would recompile on every request, completely negating the
          performance benefit.
        </InfoBlock>
      </section>

      {/* Performance Comparison */}
      <section>
        <h2 id="performance" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Performance Comparison
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The compiled serializer achieves its speed gains by generating specialized code for your
          exact data shape. It avoids the overhead of dynamic property enumeration, runtime type
          detection, and generic string escaping that <code className="prose-code">JSON.stringify</code>{' '}
          must perform on every call. The performance difference is most significant for objects
          with many properties, nested objects, and arrays of typed items.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The benchmark numbers below are representative, but actual performance depends on your
          specific data shapes, V8 version, and runtime environment. Objects with many string
          properties see larger gains because string escaping is a significant cost in generic
          serialization. Objects with deeply nested structures see gains from eliminating recursive
          type-checking overhead. Arrays of uniform objects see the largest gains because the
          per-element optimization is amplified across every item.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To put the numbers in practical context: if your API endpoint spends 5ms on database
          queries and 3ms on JSON serialization (with <code className="prose-code">JSON.stringify</code>),
          switching to a compiled serializer reduces serialization to about 0.8ms. The total
          response time drops from 8ms to 5.8ms -- a 27% improvement in end-to-end latency. For
          an endpoint that returns large lists (e.g., 100 items), the serialization portion is larger
          and the improvement is proportionally greater.
        </p>
        <CodeBlock code={performanceCode} filename="benchmark.ts" showLineNumbers />
        <InfoBlock variant="info" title="Real-World Impact">
          For a typical API endpoint returning JSON, serialization can account for 15-40% of total
          response time. A 3-4x improvement in serialization speed translates to a measurable
          improvement in overall response latency and throughput. The impact is highest on
          CPU-bound endpoints (lightweight handlers with fast database queries) and list endpoints
          that return many objects.
        </InfoBlock>
      </section>

      {/* Complex Objects */}
      <section>
        <h2 id="complex-objects" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Complex Objects
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Schemas support deeply nested objects, optional properties, and mixed types. The compiler
          recursively generates optimized code for each level of nesting, so a three-level-deep
          object with known property names at every level benefits from the same optimizations as
          a flat object.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">additionalProperties: true</code> for objects with dynamic keys
          that cannot be known at compile time, such as metadata objects or user-defined key-value
          pairs. When this flag is set, the compiler falls back to
          <code className="prose-code"> JSON.stringify</code> for that specific sub-object while
          still using compiled code for the rest of the response. Define as many properties as
          possible in the schema to maximize the performance benefit -- the more properties that
          are statically known, the less work falls through to the generic path.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For objects with many optional properties, the generated code includes conditional branches
          that check each optional property before serialization. While each branch adds a small
          overhead, it is still significantly faster than the generic <code className="prose-code">JSON.stringify</code> path
          because the property name and type are known statically. If a property is always present
          in practice, listing it in the <code className="prose-code">required</code> array eliminates
          the branch and produces the fastest possible code path.
        </p>
        <CodeBlock code={complexObjectsCode} filename="complex.ts" showLineNumbers />
        <InfoBlock variant="warning" title="additionalProperties">
          When <code className="prose-code">additionalProperties</code> is enabled, the serializer
          falls back to <code className="prose-code">JSON.stringify</code> for that specific sub-object.
          Define as many properties as possible in the schema to maximize the performance benefit. If
          only a small portion of your object has dynamic keys, isolate it into a single sub-object
          with additionalProperties while keeping the rest of the schema fully defined.
        </InfoBlock>
      </section>

      {/* Arrays */}
      <section>
        <h2 id="arrays" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Arrays
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Compile serializers for arrays of typed objects. This is especially effective for list
          endpoints that return many objects with the same shape, as the item serializer is compiled
          once and applied to every element. The performance gain scales linearly with the number of
          items -- serializing an array of 100 objects is nearly 100 times faster than serializing
          each object individually with <code className="prose-code">JSON.stringify</code> and
          joining the results.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For paginated responses that combine an array of data with pagination metadata, define a
          top-level object schema with the data array and pagination fields. The compiler generates
          optimized code for both the array elements and the pagination object, giving you the best
          of both worlds without any manual string building.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Very large arrays (over 20,000 elements) may benefit from the
          <code className="prose-code"> largeArrayMechanism</code> option, which falls back to
          <code className="prose-code"> JSON.stringify</code> for arrays that exceed a threshold. This
          avoids potential memory pressure from building an extremely long string through concatenation.
          For most API endpoints that paginate results to 50-100 items, this is not a concern.
        </p>
        <CodeBlock code={arraysCode} filename="arrays.ts" showLineNumbers />
      </section>

      {/* Integration with Routes */}
      <section>
        <h2 id="route-integration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Integration with Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pre-compile serializers at module scope and use them in your route handlers. Instead of{' '}
          <code className="prose-code">ctx.json()</code>, which uses standard{' '}
          <code className="prose-code">JSON.stringify</code> internally, set the Content-Type header
          manually and pass the pre-serialized string to <code className="prose-code">ctx.body()</code>.
          This bypasses Vexor's built-in serialization and uses your compiled serializer directly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The pattern is straightforward: define your serializers alongside your route definitions,
          compile them at import time, and call them in your handlers to produce JSON strings. The
          two extra lines of code (setting the Content-Type header and calling the serializer instead
          of <code className="prose-code">ctx.json()</code>) are the only changes needed. For error
          responses and other low-frequency paths, continue using <code className="prose-code">ctx.json()</code> --
          the optimization is only worth the extra code on hot paths.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For applications with many response schemas, the <code className="prose-code">FastJSON</code> class
          provides centralized schema management. Register all schemas at startup, and reference them
          by name throughout your application. The <code className="prose-code">$ref</code> feature
          allows schemas to reference each other, so you can define a base <code className="prose-code">user</code> schema
          once and reference it from <code className="prose-code">userList</code> and
          <code className="prose-code"> apiResponse</code> schemas without duplication.
        </p>
        <CodeBlock code={routeIntegrationCode} filename="routes.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          For applications with many schemas, use the <code className="prose-code">FastJSON</code> class
          to manage schema registrations and support cross-references between schemas. This is
          particularly useful in larger codebases where multiple route files need access to the same
          serializers, and where schema reuse reduces maintenance burden.
        </p>
        <CodeBlock code={fastJsonCode} filename="fast-json.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Schema Reuse">
          The <code className="prose-code">FastJSON</code> class supports <code className="prose-code">$ref</code>{' '}
          references between schemas, so you can define a base schema once and reference it in
          array or wrapper schemas without duplication. This keeps your schema definitions DRY and
          ensures that changes to a base type (like adding a field to the user schema) automatically
          propagate to all schemas that reference it.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Profile before optimizing.</strong>{' '}
          Measure your endpoint's serialization cost with a profiler before switching to compiled
          serialization. If serialization is less than 5% of total response time, the improvement
          will be negligible in practice. Focus compiled serialization on your highest-traffic
          endpoints where it will have the most impact.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Keep schemas in sync with your data.</strong>{' '}
          If your schema declares a property as <code className="prose-code">integer</code> but the
          actual data contains a float, the serializer will produce incorrect output (truncating the
          decimal portion). If the schema omits a property that the data contains, that property will
          be silently excluded from the output. Consider generating schemas from your TypeScript types
          or database models to ensure they stay synchronized.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Use compiled serialization for response bodies, not for logging or debugging.</strong>{' '}
          Compiled serializers are designed for producing HTTP response bodies where the shape is
          predictable. For logging, debugging, or any context where you need to serialize arbitrary
          data with unknown shapes, use the standard <code className="prose-code">JSON.stringify</code> or
          <code className="prose-code"> stringify()</code> function.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white">Mark all guaranteed fields as required.</strong>{' '}
          Every property not listed in <code className="prose-code">required</code> generates a
          conditional branch in the compiled function. Listing a property as required eliminates the
          branch, producing faster code. If a property is always present in your data (even if it
          is technically optional in your data model), list it as required in the serialization
          schema.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Functions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">compileSerializer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(schema) =&gt; (data) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Compiles a JSON Schema definition into an optimized serialization function. The compilation step analyzes the schema and generates a specialized JavaScript function using new Function(). Call once at module initialization time and reuse the returned function for every request. The compiled function returns a JSON string.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createSerializer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options) =&gt; (data) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a serializer with advanced options like rounding mode and large array handling. Wraps compileSerializer with additional configuration. Use when you need fine-grained control over edge cases like float rounding or very large arrays.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">stringify</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(value) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Schema-less fast stringify that works as a drop-in replacement for JSON.stringify. Applies generic optimizations (faster string escaping, integer fast-path, reduced allocations) without requiring a schema. About 1.3-1.5x faster than the native JSON.stringify for typical API response objects.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          FastJSON Class
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">addSchema</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(name, schema) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Registers a named schema and compiles it immediately. The name is used as a key for subsequent stringify calls and as a $ref target for other schemas. Throws if a schema with the same name is already registered. Call during application startup before handling any requests.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">stringify</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(name, data) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Serializes data using the compiled function for the named schema. Throws if no schema with the given name has been registered. The returned string is valid JSON. Performance is equivalent to calling a compileSerializer-produced function directly.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Schema Types
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">JS Equivalent</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">String value with optimized escaping. Uses a fast-path escape function that checks only for JSON-required escape characters (double quote, backslash, and control characters U+0000-U+001F). Significantly faster than generic escaping for strings without special characters.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">integer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Whole number with a fast integer-to-string conversion. Skips the float detection logic that the generic number path requires. If the actual value is a float, it will be truncated to an integer (behavior controlled by the rounding option in createSerializer). Use for IDs, counts, and quantities.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Any numeric value, including integers and floating-point numbers. Uses the standard Number-to-string conversion that correctly handles all numeric values, including NaN and Infinity (serialized as null per the JSON specification). Use for prices, percentages, and measurements.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">True or false value. Compiled as a simple ternary expression that writes the literal string "true" or "false" without any function call overhead. The fastest possible serialization for any type.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">object</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">object</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Object with statically defined properties. The compiler generates direct property access code for each defined property, avoiding Object.keys() enumeration. Supports nested objects, optional properties (with null checks), and additionalProperties for dynamic keys.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">array</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Array</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Array of typed items. The items schema defines the type of each element, and the compiler generates a loop that applies the compiled item serializer to each element. For arrays of objects, this means each object is serialized without any per-element type checking.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">null</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">null</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Null value. Compiled as the literal string "null". Primarily used in union types or as a placeholder in schemas where a property may be explicitly null.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          createSerializer Options
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">schema</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">JSONSchema</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">JSON Schema definition for the data shape. Supports the same subset as compileSerializer: type, properties, items, required, and additionalProperties. This is the primary input that the compiler uses to generate optimized code.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">rounding</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'floor' | 'ceil' | 'round'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Rounding strategy applied when a float value is serialized with an integer schema type. 'floor' truncates toward negative infinity, 'ceil' rounds toward positive infinity, 'round' uses standard rounding. When not set, floats are truncated (equivalent to Math.trunc). Only affects integer-typed fields.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">largeArrayMechanism</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'default' | 'json-stringify'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'default'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Controls how arrays with more than 20,000 elements are handled. 'default' uses the compiled serializer for all array sizes. 'json-stringify' falls back to native JSON.stringify for very large arrays to avoid memory pressure from string concatenation. Set to 'json-stringify' if your endpoints may return unbounded result sets.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/advanced/error-handling" className="btn-primary">
            Error Handling <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/retry" className="btn-secondary">
            Retry Patterns
          </Link>
        </div>
      </section>
    </div>
  );
}
