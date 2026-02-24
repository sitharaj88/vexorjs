import CodeBlock from '../components/CodeBlock';

const installCode = `npm install @vexorjs/core @vexorjs/orm`;

const basicAppCode = `import { Vexor, Type, cors, rateLimit } from '@vexorjs/core';

const app = new Vexor();

// Add middleware
app.use(cors());
app.use(rateLimit({ max: 100, windowMs: 60000 }));

// Health check endpoint
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: Date.now() });
});

// Create user endpoint with validation
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    email: Type.String({ format: 'email' })
  })
}, async (ctx) => {
  const { name, email } = ctx.body;
  // Your logic here...
  return ctx.status(201).json({ id: '1', name, email });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});`;

const projectStructure = `my-api/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── products.ts
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── db/               # Database schema & queries
├── package.json
└── tsconfig.json`;

const typescriptConfig = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}`;

export default function GettingStartedPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Getting Started</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to set up and build your first Vexor application in minutes.
        </p>
      </div>

      {/* Installation */}
      <section id="installation">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Installation</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install Vexor and its ORM using npm, yarn, or pnpm:
        </p>
        <CodeBlock code={installCode} language="bash" />

        <div className="mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-vexor-400">Note:</strong> Vexor requires Node.js 18+ or Bun 1.0+.
            It also works with Deno using the npm: specifier.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Quick Start</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a new file <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">app.ts</code> and add the following code:
        </p>
        <CodeBlock code={basicAppCode} filename="app.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Run Your Application</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Use <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">tsx</code> or <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">bun</code> to run your TypeScript file directly:
          </p>
          <CodeBlock code={`# With Node.js
npx tsx app.ts

# With Bun
bun run app.ts`} language="bash" />
        </div>
      </section>

      {/* Project Structure */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Recommended Project Structure</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For larger applications, we recommend organizing your code like this:
        </p>
        <CodeBlock code={projectStructure} language="text" />
      </section>

      {/* TypeScript Configuration */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">TypeScript Configuration</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Here's a recommended <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">tsconfig.json</code> for Vexor projects:
        </p>
        <CodeBlock code={typescriptConfig} filename="tsconfig.json" language="json" />
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Next Steps</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Learn Core Concepts</strong>
              <p className="text-sm text-slate-600 dark:text-slate-400">Understand routing, context, and request handling</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Set Up Database</strong>
              <p className="text-sm text-slate-600 dark:text-slate-400">Connect to PostgreSQL, MySQL, or SQLite with Vexor ORM</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Add Authentication</strong>
              <p className="text-sm text-slate-600 dark:text-slate-400">Implement JWT or OAuth2 authentication</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-vexor-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <div>
              <strong className="text-slate-900 dark:text-white">Deploy</strong>
              <p className="text-sm text-slate-600 dark:text-slate-400">Deploy to Node.js, Bun, AWS Lambda, or Edge</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
