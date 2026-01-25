import CodeBlock from '../../components/CodeBlock';

const constructorCode = `import { Vexor } from 'vexor';

// Basic usage
const app = new Vexor();

// With options
const app = new Vexor({
  // Enable request logging
  logger: true,

  // Custom logger instance
  logger: customPinoLogger,

  // Trust proxy headers (X-Forwarded-*)
  trustProxy: true,

  // Maximum request body size
  bodyLimit: 1024 * 1024, // 1MB

  // Custom error handler
  onError: (ctx, error) => {
    return ctx.status(500).json({ error: 'Internal error' });
  },
});`;

const routeMethodsCode = `// HTTP method shortcuts
app.get(path, options, handler);
app.post(path, options, handler);
app.put(path, options, handler);
app.delete(path, options, handler);
app.patch(path, options, handler);
app.head(path, options, handler);
app.options(path, options, handler);

// Match all methods
app.all(path, options, handler);

// Example with full options
app.post('/users', {
  body: Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
  }),
  response: {
    201: UserSchema,
    400: ErrorSchema,
  },
  preHandler: [authMiddleware],
}, async (ctx) => {
  return ctx.status(201).json(user);
});`;

const groupCode = `// Create route groups with shared prefix and middleware
const api = app.group('/api/v1', {
  preHandler: [authMiddleware],
});

// Routes are prefixed
api.get('/users', handler);    // GET /api/v1/users
api.post('/users', handler);   // POST /api/v1/users

// Nested groups
const admin = api.group('/admin', {
  preHandler: [adminOnlyMiddleware],
});

admin.get('/stats', handler);  // GET /api/v1/admin/stats`;

const hooksCode = `// Add lifecycle hooks
app.addHook('onRequest', async (ctx) => {
  // Runs for every request
});

app.addHook('preValidation', async (ctx) => {
  // Before schema validation
});

app.addHook('preHandler', async (ctx) => {
  // After validation, before handler
});

app.addHook('onSend', async (ctx, response) => {
  // Before sending response
  return response; // Must return response
});

app.addHook('onError', async (ctx, error) => {
  // When error occurs
});`;

const serverCode = `// Start the server
const server = await app.listen(3000);

// With host
const server = await app.listen(3000, '0.0.0.0');

// With callback
app.listen(3000, () => {
  console.log('Server started');
});

// Stop the server
await app.close();

// Access underlying server
const httpServer = app.server;`;

const registerCode = `// Register services
app.register('db', databaseConnection);
app.register('cache', redisClient);
app.register('mailer', emailService);

// Access in handlers via ctx.service()
app.get('/users', async (ctx) => {
  const db = ctx.service('db');
  const users = await db.query('SELECT * FROM users');
  return ctx.json(users);
});`;

export default function VexorClass() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="vexor-class" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Vexor Class
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The main application class. Create instances, define routes, register middleware, and start servers.
        </p>
      </div>

      <section>
        <h2 id="constructor" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Constructor
        </h2>
        <CodeBlock code={constructorCode} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>logger</code></td>
                <td className="py-3 px-4">boolean | Logger</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Enable logging or provide custom logger</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>trustProxy</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Trust X-Forwarded-* headers</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>bodyLimit</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">1MB</td>
                <td className="py-3 px-4">Maximum request body size in bytes</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code>onError</code></td>
                <td className="py-3 px-4">function</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Custom error handler</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="route-methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Methods
        </h2>
        <CodeBlock code={routeMethodsCode} />
      </section>

      <section>
        <h2 id="group" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          group(prefix, options?)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a route group with a shared prefix and middleware.
        </p>
        <CodeBlock code={groupCode} />
      </section>

      <section>
        <h2 id="add-hook" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          addHook(name, handler)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register lifecycle hooks for the application.
        </p>
        <CodeBlock code={hooksCode} />
      </section>

      <section>
        <h2 id="listen" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          listen(port, host?) / close()
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start and stop the HTTP server.
        </p>
        <CodeBlock code={serverCode} />
      </section>

      <section>
        <h2 id="register" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          register(name, service)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register services that can be accessed from route handlers.
        </p>
        <CodeBlock code={registerCode} />
      </section>
    </div>
  );
}
