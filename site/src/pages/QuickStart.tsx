import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const step1Code = `mkdir my-vexor-app
cd my-vexor-app
npm init -y`;

const step2Code = `npm install @vexorjs/core @vexorjs/orm
npm install -D typescript tsx @types/node`;

const step3Code = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}`;

const step4Code = `import { Vexor, Type } from '@vexorjs/core';

// Create the application
const app = new Vexor({
  logger: true,
});

// Define a schema for users
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  createdAt: Type.String({ format: 'date-time' }),
});

// In-memory storage for demo
const users = new Map<string, typeof UserSchema.static>();

// Health check endpoint
app.get('/health', {}, async (ctx) => {
  return ctx.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// List all users
app.get('/users', {
  response: { 200: Type.Array(UserSchema) },
}, async (ctx) => {
  return ctx.json([...users.values()]);
});

// Get user by ID
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: { 200: UserSchema },
}, async (ctx) => {
  const user = users.get(ctx.params.id);
  if (!user) {
    return ctx.status(404).json({ error: 'User not found' });
  }
  return ctx.json(user);
});

// Create new user
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' }),
  }),
  response: { 201: UserSchema },
}, async (ctx) => {
  const { name, email } = ctx.body;

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  return ctx.status(201).json(user);
});

// Update user
app.put('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String({ minLength: 1 })),
    email: Type.Optional(Type.String({ format: 'email' })),
  }),
  response: { 200: UserSchema },
}, async (ctx) => {
  const existing = users.get(ctx.params.id);
  if (!existing) {
    return ctx.status(404).json({ error: 'User not found' });
  }

  const updated = {
    ...existing,
    ...ctx.body,
  };

  users.set(ctx.params.id, updated);
  return ctx.json(updated);
});

// Delete user
app.delete('/users/:id', {
  params: Type.Object({ id: Type.String() }),
}, async (ctx) => {
  const existed = users.delete(ctx.params.id);
  if (!existed) {
    return ctx.status(404).json({ error: 'User not found' });
  }
  return ctx.status(204).send();
});

// Start the server
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT).then(() => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});`;

const step5Code = `npx tsx src/index.ts`;

const curlExamples = `# Health check
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'

# List all users
curl http://localhost:3000/users

# Get user by ID (replace <id> with actual ID)
curl http://localhost:3000/users/<id>

# Update user
curl -X PUT http://localhost:3000/users/<id> \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Jane Doe"}'

# Delete user
curl -X DELETE http://localhost:3000/users/<id>`;

const packageJsonUpdate = `{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}`;

export default function QuickStart() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="quick-start" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Start
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Build a complete REST API with Vexor in just 5 minutes. This tutorial will
          guide you through creating a user management API from scratch.
        </p>
      </div>

      {/* What we're building */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="what-were-building" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          What We're Building
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          By the end of this tutorial, you'll have a REST API with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
          <li>Full CRUD operations for users</li>
          <li>Request validation with TypeScript inference</li>
          <li>Proper HTTP status codes and error handling</li>
          <li>OpenAPI-compatible schema definitions</li>
        </ul>
      </section>

      {/* Step 1 */}
      <section>
        <h2 id="step-1" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Step 1: Create Your Project
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start by creating a new directory for your project:
        </p>
        <CodeBlock code={step1Code} language="bash" />
      </section>

      {/* Step 2 */}
      <section>
        <h2 id="step-2" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Step 2: Install Dependencies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install Vexor and the development dependencies:
        </p>
        <CodeBlock code={step2Code} language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Then update your <code className="prose-code">package.json</code> to use ES modules:
        </p>
        <CodeBlock code={packageJsonUpdate} language="json" filename="package.json" />
      </section>

      {/* Step 3 */}
      <section>
        <h2 id="step-3" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Step 3: Configure TypeScript
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a <code className="prose-code">tsconfig.json</code> file:
        </p>
        <CodeBlock code={step3Code} language="json" filename="tsconfig.json" />
      </section>

      {/* Step 4 */}
      <section>
        <h2 id="step-4" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Step 4: Create Your Application
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a <code className="prose-code">src/index.ts</code> file with your application code:
        </p>
        <CodeBlock code={step4Code} filename="src/index.ts" showLineNumbers />
      </section>

      {/* Step 5 */}
      <section>
        <h2 id="step-5" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Step 5: Run Your Application
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start the development server:
        </p>
        <CodeBlock code={step5Code} language="bash" />
        <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="text-green-800 dark:text-green-200 text-sm">
              <strong>Output:</strong> Server running at http://localhost:3000
            </div>
          </div>
        </div>
      </section>

      {/* Testing */}
      <section>
        <h2 id="testing-api" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Testing Your API
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use curl or your favorite API client to test the endpoints:
        </p>
        <CodeBlock code={curlExamples} language="bash" />
      </section>

      {/* Understanding the Code */}
      <section>
        <h2 id="understanding" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Understanding the Code
        </h2>
        <div className="space-y-6 text-slate-600 dark:text-slate-400">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Schema Definition
            </h3>
            <p>
              We use <code className="prose-code">Type.Object()</code> to define the shape of our data.
              This serves multiple purposes: runtime validation, TypeScript type inference, and
              OpenAPI documentation generation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Route Options
            </h3>
            <p>
              Each route can specify <code className="prose-code">params</code>,{' '}
              <code className="prose-code">body</code>, <code className="prose-code">query</code>,
              and <code className="prose-code">response</code> schemas. Vexor automatically
              validates incoming requests and provides fully-typed <code className="prose-code">ctx</code>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Context Object
            </h3>
            <p>
              The <code className="prose-code">ctx</code> object gives you access to request data,
              response helpers, and services. Properties like <code className="prose-code">ctx.params</code>
              and <code className="prose-code">ctx.body</code> are automatically typed based on your schemas.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Congratulations!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You've built your first Vexor API! Here's what to explore next:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/core-concepts"
            className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Core Concepts</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Learn how Vexor works
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link
            to="/orm"
            className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Vexor ORM</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect to a real database
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
