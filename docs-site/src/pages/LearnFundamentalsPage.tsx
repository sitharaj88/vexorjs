import CodeBlock from '../components/CodeBlock';

const httpBasicsCode = `// HTTP Methods - The verbs of the web
// GET    - Retrieve data (safe, idempotent)
// POST   - Create new resources
// PUT    - Replace entire resource (idempotent)
// PATCH  - Partially update resource
// DELETE - Remove a resource (idempotent)

// Status Codes - The language of responses
// 200 OK              - Request succeeded
// 201 Created         - Resource created successfully
// 204 No Content      - Success with no body
// 400 Bad Request     - Client sent invalid data
// 401 Unauthorized    - Authentication required
// 403 Forbidden       - Authenticated but not allowed
// 404 Not Found       - Resource doesn't exist
// 409 Conflict        - Resource state conflict
// 422 Unprocessable   - Validation failed
// 500 Internal Error  - Server-side failure`;

const tsEssentialsCode = `// Type annotations
let name: string = 'Vexor';
let port: number = 3000;
let isRunning: boolean = true;

// Interfaces - Define object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';       // Union types
  avatar?: string;               // Optional property
  readonly createdAt: Date;      // Read-only
}

// Generics - Reusable type patterns
interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
  };
}

// Type inference - TypeScript figures it out
const users: ApiResponse<User[]> = {
  data: [{ id: '1', name: 'John', email: 'john@test.com', role: 'user', createdAt: new Date() }],
  meta: { total: 1, page: 1 }
};

// Async/Await - Modern async patterns
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
}`;

const firstApiCode = `import { Vexor } from '@vexorjs/core';

// 1. Create an application instance
const app = new Vexor();

// 2. Define your first route
app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello, World!' });
});

// 3. Add a route with parameters
app.get('/greet/:name', async (ctx) => {
  const { name } = ctx.params;
  return ctx.json({ message: \`Hello, \${name}!\` });
});

// 4. Handle POST requests with body
app.post('/echo', async (ctx) => {
  const body = await ctx.body();
  return ctx.status(201).json({
    received: body,
    timestamp: new Date().toISOString()
  });
});

// 5. Start the server
app.listen(3000);
console.log('Server running at http://localhost:3000');`;

const requestResponseCode = `// The Request-Response Lifecycle in Vexor
//
// Client Request
//     |
//     v
// [1] Server receives HTTP request
//     |
//     v
// [2] Middleware chain executes (onRequest hooks)
//     |
//     v
// [3] Route matching (radix tree lookup)
//     |
//     v
// [4] Schema validation (if defined)
//     |
//     v
// [5] Route handler executes
//     |
//     v
// [6] Response sent back to client

app.get('/users/:id', async (ctx) => {
  // ctx.method   -> 'GET'
  // ctx.path     -> '/users/42'
  // ctx.params   -> { id: '42' }
  // ctx.query    -> { include: 'posts' }  (from ?include=posts)
  // ctx.headers  -> { 'content-type': '...' }

  return ctx
    .status(200)
    .header('X-Request-Id', 'abc-123')
    .json({ id: ctx.params.id, name: 'Jane' });
});`;

const jsonHandlingCode = `// Receiving JSON
app.post('/api/users', async (ctx) => {
  // Parse the JSON request body (async)
  const { name, email } = await ctx.body();

  // Process the data
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  return ctx.status(201).json(user);
});

// Sending different response types
app.get('/api/report', async (ctx) => {
  const format = ctx.query.format;

  switch (format) {
    case 'json':
      return ctx.json({ revenue: 50000, growth: 12.5 });

    case 'text':
      return ctx.text('Revenue: $50,000 | Growth: 12.5%');

    case 'html':
      return ctx.html('<h1>Revenue Report</h1><p>$50,000</p>');

    default:
      return ctx.json({ revenue: 50000, growth: 12.5 });
  }
});`;

const restfulApiCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// In-memory store (use a database in production!)
const todos: Map<string, any> = new Map();

// LIST all todos
app.get('/api/todos', async (ctx) => {
  const items = Array.from(todos.values());
  return ctx.json({ data: items, total: items.length });
});

// GET single todo
app.get('/api/todos/:id', async (ctx) => {
  const todo = todos.get(ctx.params.id);
  if (!todo) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  return ctx.json(todo);
});

// CREATE a todo
app.post('/api/todos', {
  body: Type.Object({
    title: Type.String({ minLength: 1 }),
    completed: Type.Optional(Type.Boolean())
  })
}, async (ctx) => {
  const { title, completed = false } = await ctx.body();
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed,
    createdAt: new Date().toISOString()
  };
  todos.set(todo.id, todo);
  return ctx.status(201).json(todo);
});

// UPDATE a todo
app.put('/api/todos/:id', {
  body: Type.Object({
    title: Type.Optional(Type.String({ minLength: 1 })),
    completed: Type.Optional(Type.Boolean())
  })
}, async (ctx) => {
  const todo = todos.get(ctx.params.id);
  if (!todo) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  Object.assign(todo, await ctx.body(), { updatedAt: new Date().toISOString() });
  return ctx.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', async (ctx) => {
  if (!todos.has(ctx.params.id)) {
    return ctx.status(404).json({ error: 'Todo not found' });
  }
  todos.delete(ctx.params.id);
  return ctx.empty();
});

app.listen(3000);`;

export default function LearnFundamentalsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Beginner
        </div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Fundamentals</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          Start your backend development journey. Learn the essential concepts of HTTP, TypeScript,
          and build your first API with Vexor from scratch.
        </p>
      </div>

      {/* Learning Path */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { num: '01', title: 'HTTP & REST Basics', desc: 'Understand how the web communicates', color: 'from-blue-500 to-cyan-500' },
          { num: '02', title: 'TypeScript Essentials', desc: 'Type-safe JavaScript for backends', color: 'from-purple-500 to-pink-500' },
          { num: '03', title: 'Your First API', desc: 'Build a working API in minutes', color: 'from-orange-500 to-red-500' },
          { num: '04', title: 'Request & Response', desc: 'The lifecycle of every request', color: 'from-green-500 to-emerald-500' },
          { num: '05', title: 'Working with JSON', desc: 'Parse, validate, and respond', color: 'from-indigo-500 to-violet-500' },
          { num: '06', title: 'RESTful API Design', desc: 'Build a complete CRUD API', color: 'from-vexor-400 to-vexor-600' },
        ].map((item) => (
          <div key={item.num} className="relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors">
            <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              CHAPTER {item.num}
            </span>
            <h3 className="font-semibold mt-1 text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Chapter 1: HTTP Basics */}
      <section id="http-basics">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-blue-500 mr-2">01</span> HTTP & REST Basics
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every web API communicates using <strong>HTTP</strong> (HyperText Transfer Protocol). Understanding HTTP methods
          and status codes is the foundation of backend development.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">REST Architecture</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              REST (Representational State Transfer) organizes your API around <strong>resources</strong> (nouns like users, posts, orders)
              and uses HTTP methods (verbs) to perform actions on them.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Stateless Protocol</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each HTTP request is independent. The server doesn't remember previous requests.
              Authentication tokens or session IDs must be sent with every request.
            </p>
          </div>
        </div>

        <CodeBlock code={httpBasicsCode} filename="http-reference.ts" showLineNumbers />

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-amber-600 dark:text-amber-400">Key Takeaway:</strong> Think of your API as a set of resources.
            Use <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">GET /users</code> to list users,
            <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">POST /users</code> to create one, and
            <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">GET /users/:id</code> to fetch a specific user.
          </p>
        </div>
      </section>

      {/* Chapter 2: TypeScript */}
      <section id="typescript">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-purple-500 mr-2">02</span> TypeScript Essentials
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor is built with TypeScript first. Understanding types, interfaces, and generics will help you
          build safer and more maintainable APIs.
        </p>
        <CodeBlock code={tsEssentialsCode} filename="typescript-basics.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Type Safety</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Catch bugs at compile time instead of runtime. TypeScript ensures your data shapes are correct.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Auto-Complete</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your IDE knows every property and method available. No more guessing or checking docs constantly.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Refactoring</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rename a property and TypeScript finds every usage. Change a type and see all affected code instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 3: First API */}
      <section id="first-api">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-orange-500 mr-2">03</span> Your First Vexor API
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Let's build a working API. You'll create routes, handle parameters, and respond with JSON — all in under 20 lines of code.
        </p>

        <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Prerequisites</h4>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>1. Node.js 20+ installed</p>
            <p>2. Run: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">npx @vexorjs/cli new my-first-api</code></p>
            <p>3. Navigate: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">cd my-first-api</code></p>
          </div>
        </div>

        <CodeBlock code={firstApiCode} filename="src/index.ts" showLineNumbers />

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-green-600 dark:text-green-400">Try it out:</strong> Run your server with{' '}
            <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">npm run dev</code>, then visit{' '}
            <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">http://localhost:3000</code> in your browser
            or use <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">curl http://localhost:3000/greet/Vexor</code>.
          </p>
        </div>
      </section>

      {/* Chapter 4: Request & Response */}
      <section id="request-response">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-green-500 mr-2">04</span> Request & Response Lifecycle
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every HTTP request flows through a pipeline in Vexor. Understanding this lifecycle helps you
          know where to add logic, validation, and error handling.
        </p>
        <CodeBlock code={requestResponseCode} filename="lifecycle.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">The Pipeline</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {['Receive', 'Middleware', 'Route Match', 'Validate', 'Handle', 'Respond'].map((step, i) => (
              <span key={step}>
                {i > 0 && <span className="text-slate-400 mr-2">&rarr;</span>}
                <span className={`px-3 py-1 rounded-full ${i === 4 ? 'bg-vexor-500/20 text-vexor-400 font-medium' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {step}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 5: Working with JSON */}
      <section id="json">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-indigo-500 mr-2">05</span> Working with JSON
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          JSON is the lingua franca of modern APIs. Vexor handles JSON parsing and serialization automatically,
          so you can focus on your business logic.
        </p>
        <CodeBlock code={jsonHandlingCode} filename="json-handling.ts" showLineNumbers />
      </section>

      {/* Chapter 6: RESTful CRUD */}
      <section id="restful-crud">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-vexor-500 mr-2">06</span> Building a RESTful CRUD API
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Let's put it all together. Here's a complete Todo API with Create, Read, Update, and Delete operations,
          including input validation using Vexor's schema system.
        </p>
        <CodeBlock code={restfulApiCode} filename="todo-api.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Test with cURL</h4>
            <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <p>curl localhost:3000/api/todos</p>
              <p>curl -X POST localhost:3000/api/todos -H "Content-Type: application/json" -d '{`{"title":"Learn Vexor"}`}'</p>
            </div>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">API Endpoints</h4>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p><span className="text-green-500 font-mono">GET</span> /api/todos</p>
              <p><span className="text-green-500 font-mono">GET</span> /api/todos/:id</p>
              <p><span className="text-yellow-500 font-mono">POST</span> /api/todos</p>
              <p><span className="text-blue-500 font-mono">PUT</span> /api/todos/:id</p>
              <p><span className="text-red-500 font-mono">DELETE</span> /api/todos/:id</p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-gradient-to-r from-vexor-500/10 to-purple-500/10 border border-vexor-500/20 rounded-2xl">
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Ready for More?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You've mastered the fundamentals. Next, learn how to build production-ready APIs with authentication,
          database integration, and testing.
        </p>
        <a href="/learn/building-apis" className="inline-flex items-center gap-2 px-4 py-2 bg-vexor-500 hover:bg-vexor-600 text-white rounded-lg transition-colors font-medium text-sm">
          Continue to Building APIs &rarr;
        </a>
      </section>
    </div>
  );
}
