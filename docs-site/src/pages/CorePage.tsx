import CodeBlock from '../components/CodeBlock';

const vexorAppCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor({
  logging: { level: 'info' },
  trustProxy: true
});

// Define a schema for type-safe validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  role: Type.Union([Type.Literal('admin'), Type.Literal('user')])
});

// GET route with params validation
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: { 200: UserSchema }
}, async (ctx) => {
  const { id } = ctx.params;
  // Your logic here...
  return ctx.json({ id, name: 'John', email: 'john@example.com', role: 'user' });
});

// POST route with body validation
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' })
  }),
  response: { 201: UserSchema }
}, async (ctx) => {
  const { name, email } = ctx.body;
  return ctx.status(201).json({ id: '1', name, email, role: 'user' });
});

app.listen(3000);`;

const contextCode = `app.get('/example', async (ctx) => {
  // Request information
  const method = ctx.method;           // 'GET', 'POST', etc.
  const path = ctx.path;               // '/example'
  const url = ctx.url;                 // Full URL object
  const query = ctx.query;             // Parsed query parameters
  const params = ctx.params;           // Route parameters
  const headers = ctx.headers;         // Request headers
  const body = ctx.body;               // Parsed request body

  // Response methods
  return ctx
    .status(200)
    .header('X-Custom-Header', 'value')
    .cookie('session', 'abc123', { httpOnly: true })
    .json({ message: 'Hello!' });
});`;

const responseMethodsCode = `// JSON response
ctx.json({ data: 'value' });

// Text response
ctx.text('Hello, World!');

// HTML response
ctx.html('<h1>Hello, World!</h1>');

// Redirect
ctx.redirect('/new-location');
ctx.redirect('/permanent', 301);

// Send file
ctx.sendFile('/path/to/file.pdf');

// Stream response
ctx.stream(readableStream, 'application/octet-stream');

// No content
ctx.noContent();

// Custom status with chaining
ctx.status(201).json({ created: true });`;

const routingCode = `// Basic routes
app.get('/users', handler);
app.post('/users', handler);
app.put('/users/:id', handler);
app.patch('/users/:id', handler);
app.delete('/users/:id', handler);

// Route with multiple methods
app.route('/resource')
  .get(getHandler)
  .post(postHandler)
  .put(putHandler);

// Wildcard routes
app.get('/files/*', (ctx) => {
  const filepath = ctx.params['*']; // Everything after /files/
  return ctx.text(\`Requested: \${filepath}\`);
});

// Optional parameters
app.get('/users/:id?', (ctx) => {
  const id = ctx.params.id; // May be undefined
  return ctx.json({ id: id || 'all' });
});

// Route groups
app.group('/api/v1', (group) => {
  group.get('/users', listUsers);
  group.post('/users', createUser);
  group.get('/users/:id', getUser);
});`;

const schemaValidationCode = `import { Type } from '@vexorjs/core';

// String types
Type.String()                              // Any string
Type.String({ minLength: 1, maxLength: 100 }) // Length constraints
Type.String({ format: 'email' })           // Email format
Type.String({ format: 'uri' })             // URI format
Type.String({ pattern: '^[a-z]+$' })       // Regex pattern

// Number types
Type.Number()                              // Any number
Type.Number({ minimum: 0, maximum: 100 })  // Range constraints
Type.Integer()                             // Integer only
Type.Integer({ minimum: 1 })               // Positive integer

// Boolean and Null
Type.Boolean()
Type.Null()

// Literal values
Type.Literal('active')
Type.Literal(42)

// Arrays
Type.Array(Type.String())                  // Array of strings
Type.Array(Type.Number(), { minItems: 1 }) // Non-empty array

// Objects
Type.Object({
  name: Type.String(),
  age: Type.Number(),
  email: Type.Optional(Type.String())      // Optional field
})

// Unions
Type.Union([
  Type.Literal('pending'),
  Type.Literal('active'),
  Type.Literal('completed')
])

// Records (dynamic keys)
Type.Record(Type.String(), Type.Number())  // { [key: string]: number }`;

const hooksCode = `app.addHook('onRequest', async (ctx) => {
  // Runs before route matching
  console.log(\`Incoming: \${ctx.method} \${ctx.path}\`);
});

app.addHook('preValidation', async (ctx) => {
  // Runs before schema validation
  // Good for authentication checks
});

app.addHook('preHandler', async (ctx) => {
  // Runs after validation, before handler
  // Request is validated at this point
});

app.addHook('onSend', async (ctx, response) => {
  // Runs before sending response
  // Can modify the response
  return response;
});

app.addHook('onResponse', async (ctx) => {
  // Runs after response is sent
  // Good for logging, metrics
});

app.addHook('onError', async (error, ctx) => {
  // Runs when an error occurs
  console.error('Error:', error.message);
  return ctx.status(500).json({ error: 'Internal Server Error' });
});`;

const errorHandlingCode = `// Global error handler
app.setErrorHandler(async (error, ctx) => {
  // Log the error
  console.error(error);

  // Return appropriate response
  if (error.name === 'ValidationError') {
    return ctx.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }

  if (error.statusCode) {
    return ctx.status(error.statusCode).json({
      error: error.message
    });
  }

  return ctx.status(500).json({
    error: 'Internal Server Error'
  });
});

// Not found handler
app.setNotFoundHandler(async (ctx) => {
  return ctx.status(404).json({
    error: 'Not Found',
    path: ctx.path
  });
});

// Throwing errors in handlers
app.get('/protected', async (ctx) => {
  if (!ctx.headers.authorization) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
  return ctx.json({ secret: 'data' });
});`;

export default function CorePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Core Concepts</h1>
        <p className="text-lg text-slate-400">
          Learn the fundamental concepts of building applications with Vexor.
        </p>
      </div>

      {/* Application */}
      <section id="application">
        <h2 className="text-2xl font-bold mb-4">Application</h2>
        <p className="text-slate-400 mb-4">
          The <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">Vexor</code> class is the core of your application.
          It handles routing, middleware, and server lifecycle.
        </p>
        <CodeBlock code={vexorAppCode} filename="app.ts" showLineNumbers />
      </section>

      {/* Context */}
      <section id="context">
        <h2 className="text-2xl font-bold mb-4">Request Context</h2>
        <p className="text-slate-400 mb-4">
          Every route handler receives a context object (<code className="bg-slate-800 px-2 py-0.5 rounded text-sm">ctx</code>)
          that provides access to request data and response methods.
        </p>
        <CodeBlock code={contextCode} filename="context.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Response Methods</h3>
          <p className="text-slate-400 mb-4">
            Vexor provides fluent response methods for common response types:
          </p>
          <CodeBlock code={responseMethodsCode} showLineNumbers />
        </div>
      </section>

      {/* Routing */}
      <section id="routing">
        <h2 className="text-2xl font-bold mb-4">Routing</h2>
        <p className="text-slate-400 mb-4">
          Vexor uses a high-performance radix tree router for lightning-fast route matching.
        </p>
        <CodeBlock code={routingCode} filename="routes.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2">Route Parameters</h4>
            <p className="text-sm text-slate-400">
              Use <code className="bg-slate-800 px-1 rounded">:param</code> for named parameters.
              Access via <code className="bg-slate-800 px-1 rounded">ctx.params.param</code>.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2">Wildcards</h4>
            <p className="text-sm text-slate-400">
              Use <code className="bg-slate-800 px-1 rounded">*</code> to match everything.
              Access via <code className="bg-slate-800 px-1 rounded">ctx.params['*']</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Schema Validation */}
      <section id="validation">
        <h2 className="text-2xl font-bold mb-4">Schema Validation</h2>
        <p className="text-slate-400 mb-4">
          Vexor includes a TypeBox-compatible schema system for runtime validation with full TypeScript inference.
        </p>
        <CodeBlock code={schemaValidationCode} filename="schemas.ts" showLineNumbers />

        <div className="mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl">
          <p className="text-sm text-slate-300">
            <strong className="text-vexor-400">Type Inference:</strong> All schemas automatically infer TypeScript types.
            When you define a body schema, <code className="bg-slate-800 px-1 rounded">ctx.body</code> is fully typed!
          </p>
        </div>
      </section>

      {/* Hooks */}
      <section id="hooks">
        <h2 className="text-2xl font-bold mb-4">Lifecycle Hooks</h2>
        <p className="text-slate-400 mb-4">
          Hooks allow you to intercept requests at different stages of the request lifecycle.
        </p>
        <CodeBlock code={hooksCode} filename="hooks.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Hook Execution Order</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-slate-800 rounded-full">onRequest</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full">preValidation</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full">preHandler</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full">Handler</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full">onSend</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="px-3 py-1 bg-slate-800 rounded-full">onResponse</span>
          </div>
        </div>
      </section>

      {/* Error Handling */}
      <section id="error-handling">
        <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
        <p className="text-slate-400 mb-4">
          Vexor provides centralized error handling with custom error handlers.
        </p>
        <CodeBlock code={errorHandlingCode} filename="errors.ts" showLineNumbers />
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/vexorjs/docs/orm" className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1">Vexor ORM &rarr;</h3>
            <p className="text-sm text-slate-400">Learn about database operations with the built-in ORM</p>
          </a>
          <a href="/vexorjs/docs/middleware" className="block p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
            <h3 className="font-semibold mb-1">Middleware &rarr;</h3>
            <p className="text-sm text-slate-400">Explore built-in middleware for CORS, rate limiting, and more</p>
          </a>
        </div>
      </section>
    </div>
  );
}
