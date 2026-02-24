import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const contextOverviewCode = `// The context object is passed to every handler and middleware
app.get('/users/:id', async (ctx) => {
  // Request data
  const id = ctx.params.id;           // URL parameters
  const page = ctx.query.page;         // Query string
  const body = ctx.body;               // Validated body
  const header = ctx.req.header('x-custom');  // Headers

  // Response helpers
  return ctx.json({ id });             // JSON response
  return ctx.text('Hello');            // Text response
  return ctx.html('<h1>Hi</h1>');      // HTML response
  return ctx.status(201).json(data);   // With status code
  return ctx.redirect('/other');       // Redirect
});`;

const requestDataCode = `// Accessing request data

app.post('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  query: Type.Object({
    include: Type.Optional(Type.String()),
  }),
  body: Type.Object({
    name: Type.String(),
    email: Type.String(),
  }),
}, async (ctx) => {
  // All these are fully typed!
  const { id } = ctx.params;
  const { include } = ctx.query;
  const { name, email } = ctx.body;

  // Access the raw request
  const method = ctx.req.method;       // 'POST'
  const path = ctx.req.path;           // '/users/123'
  const url = ctx.req.url;             // Full URL

  // Headers
  const contentType = ctx.req.header('content-type');
  const auth = ctx.req.header('authorization');

  // Cookies (if cookie parser enabled)
  const session = ctx.cookies.get('session');

  return ctx.json({ id, name, email });
});`;

const responseHelpersCode = `// JSON response
app.get('/json', async (ctx) => {
  return ctx.json({ message: 'Hello' });
  // Content-Type: application/json
});

// JSON with status code
app.post('/create', async (ctx) => {
  return ctx.status(201).json({ created: true });
});

// Text response
app.get('/text', async (ctx) => {
  return ctx.text('Hello, World!');
  // Content-Type: text/plain
});

// HTML response
app.get('/html', async (ctx) => {
  return ctx.html('<h1>Hello</h1>');
  // Content-Type: text/html
});

// Raw response with headers
app.get('/custom', async (ctx) => {
  return ctx
    .status(200)
    .header('X-Custom', 'value')
    .header('Cache-Control', 'max-age=3600')
    .json({ data: 'value' });
});

// Redirect
app.get('/old', async (ctx) => {
  return ctx.redirect('/new');           // 302 redirect
  return ctx.redirect('/new', 301);      // 301 redirect
});

// No content
app.delete('/item/:id', async (ctx) => {
  return ctx.status(204).send();
});

// Stream response
app.get('/stream', async (ctx) => {
  const stream = createReadableStream();
  return ctx.stream(stream, 'application/octet-stream');
});`;

const bodyParsingCode = `// Manual body parsing (when no schema defined)

app.post('/upload', async (ctx) => {
  // Parse as JSON
  const json = await ctx.readJson();

  // Parse as text
  const text = await ctx.readText();

  // Parse as form data
  const form = await ctx.readFormData();

  // Parse as array buffer
  const buffer = await ctx.readArrayBuffer();

  // Access raw body stream
  const stream = ctx.req.body;

  return ctx.json({ received: true });
});`;

const stateManagementCode = `// Store and retrieve request-scoped state

// Set state in middleware
app.addHook('preHandler', async (ctx) => {
  const user = await authenticateUser(ctx);
  ctx.set('user', user);
  ctx.set('requestId', crypto.randomUUID());
});

// Retrieve state in handler
app.get('/profile', async (ctx) => {
  const user = ctx.get('user');
  const requestId = ctx.get('requestId');

  return ctx.json({ user, requestId });
});

// Type-safe state with generics
interface AppState {
  user: User;
  requestId: string;
}

app.get('/profile', async (ctx) => {
  const user = ctx.get<AppState['user']>('user');
  return ctx.json({ user });
});`;

const servicesCode = `// Access registered services

const app = new Vexor();

// Register services
app.register('db', database);
app.register('cache', cacheClient);
app.register('mailer', emailService);

// Access in handlers
app.get('/users', async (ctx) => {
  const db = ctx.service('db');
  const users = await db.select().from(usersTable);
  return ctx.json({ users });
});

// With ORM integration
app.get('/users/:id', async (ctx) => {
  // ctx.db is automatically available when ORM is configured
  const user = await ctx.db
    .select()
    .from(users)
    .where(eq(users.id, ctx.params.id))
    .first();

  return ctx.json(user);
});`;

const errorResponsesCode = `// Sending error responses

app.get('/users/:id', async (ctx) => {
  const user = await findUser(ctx.params.id);

  if (!user) {
    // 404 Not Found
    return ctx.status(404).json({
      error: 'Not Found',
      message: 'User not found',
    });
  }

  if (!canAccess(ctx.get('user'), user)) {
    // 403 Forbidden
    return ctx.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this resource',
    });
  }

  return ctx.json(user);
});

// Or throw errors (caught by onError hook)
app.get('/users/:id', async (ctx) => {
  const user = await findUser(ctx.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return ctx.json(user);
});`;

export default function Context() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="context" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Context
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The context object (<code className="prose-code">ctx</code>) is the heart of every request.
          It provides access to request data, response helpers, and application services.
        </p>
      </div>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Context Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every handler and middleware receives a context object with request data and response methods.
        </p>
        <CodeBlock code={contextOverviewCode} />
      </section>

      {/* Request Data */}
      <section>
        <h2 id="request-data" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Accessing Request Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you define schemas, <code className="prose-code">ctx.params</code>,{' '}
          <code className="prose-code">ctx.query</code>, and <code className="prose-code">ctx.body</code>{' '}
          are automatically validated and typed.
        </p>
        <CodeBlock code={requestDataCode} showLineNumbers />
      </section>

      {/* Response Helpers */}
      <section>
        <h2 id="response-helpers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Response Helpers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Context provides convenient methods for building responses.
        </p>
        <CodeBlock code={responseHelpersCode} showLineNumbers />
      </section>

      {/* Body Parsing */}
      <section>
        <h2 id="body-parsing" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Manual Body Parsing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you don't define a body schema, use these methods to parse the request body.
        </p>
        <CodeBlock code={bodyParsingCode} />
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Tip:</strong> Define body schemas whenever possible. They provide automatic
              validation, type inference, and OpenAPI documentation.
            </div>
          </div>
        </div>
      </section>

      {/* State Management */}
      <section>
        <h2 id="state" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request State
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Store and retrieve data within a request using <code className="prose-code">ctx.set()</code>{' '}
          and <code className="prose-code">ctx.get()</code>.
        </p>
        <CodeBlock code={stateManagementCode} />
      </section>

      {/* Services */}
      <section>
        <h2 id="services" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Accessing Services
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Access registered services like databases, caches, and more through context.
        </p>
        <CodeBlock code={servicesCode} />
      </section>

      {/* Error Responses */}
      <section>
        <h2 id="errors" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Error Responses
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Return error responses with appropriate status codes, or throw errors
          to be handled by the error hook.
        </p>
        <CodeBlock code={errorResponsesCode} />
      </section>

      {/* Context Properties Reference */}
      <section>
        <h2 id="reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Property/Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.params</code></td>
                <td className="py-3 px-4">URL parameters (typed if schema defined)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.query</code></td>
                <td className="py-3 px-4">Query string parameters (typed if schema defined)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.body</code></td>
                <td className="py-3 px-4">Validated request body (typed if schema defined)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.req</code></td>
                <td className="py-3 px-4">Raw request object (VexorRequest)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.json(data)</code></td>
                <td className="py-3 px-4">Return JSON response</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.text(str)</code></td>
                <td className="py-3 px-4">Return text response</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.html(str)</code></td>
                <td className="py-3 px-4">Return HTML response</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.status(code)</code></td>
                <td className="py-3 px-4">Set response status code</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.header(k, v)</code></td>
                <td className="py-3 px-4">Set response header</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.redirect(url)</code></td>
                <td className="py-3 px-4">Redirect to URL</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">ctx.set(k, v)</code></td>
                <td className="py-3 px-4">Set request-scoped state</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ctx.get(k)</code></td>
                <td className="py-3 px-4">Get request-scoped state</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/validation" className="btn-primary">
            Learn about Validation <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/api/context" className="btn-secondary">
            Context API Reference
          </Link>
        </div>
      </section>
    </div>
  );
}
