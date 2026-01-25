import { Link } from 'react-router-dom';
import { ArrowRight, Route, Workflow, Box, Shield } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const architectureCode = `┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│         (Your Handlers, Services, Business Logic)        │
├─────────────────────────────────────────────────────────┤
│                    Validation Layer                      │
│          (Schema validation, Type checking)              │
├─────────────────────────────────────────────────────────┤
│                    Middleware Pipeline                   │
│    (onRequest → preValidation → preHandler → onSend)    │
├─────────────────────────────────────────────────────────┤
│                      Router Layer                        │
│         (Radix tree routing, Parameter parsing)          │
├─────────────────────────────────────────────────────────┤
│                    HTTP Adapter Layer                    │
│        (Node.js, Bun, Deno, Cloudflare Workers)         │
├─────────────────────────────────────────────────────────┤
│                  Web Standards Foundation                │
│            (Request, Response, Headers, URL)             │
└─────────────────────────────────────────────────────────┘`;

const lifecycleCode = `// Request lifecycle hooks
app.addHook('onRequest', async (ctx) => {
  // Runs first for every request
  // Good for: logging, authentication
});

app.addHook('preValidation', async (ctx) => {
  // Runs before schema validation
  // Good for: content-type negotiation
});

app.addHook('preHandler', async (ctx) => {
  // Runs after validation, before handler
  // Good for: authorization, rate limiting
});

app.addHook('onSend', async (ctx, response) => {
  // Runs before sending response
  // Good for: response transformation
  return response;
});

app.addHook('onError', async (ctx, error) => {
  // Runs when an error occurs
  // Good for: error logging, custom error responses
});`;

const concepts = [
  {
    icon: Route,
    title: 'Routing',
    description: 'Radix tree router with static route short-circuit, parametric routes, and wildcards.',
    href: '/routing',
  },
  {
    icon: Workflow,
    title: 'Middleware',
    description: 'Hook-based middleware pipeline with precise lifecycle control.',
    href: '/middleware',
  },
  {
    icon: Box,
    title: 'Context',
    description: 'Request context with typed access to params, query, body, and response helpers.',
    href: '/context',
  },
  {
    icon: Shield,
    title: 'Validation',
    description: 'TypeBox-compatible schemas with JIT-compiled validators for maximum performance.',
    href: '/validation',
  },
];

export default function CoreConcepts() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="core-concepts" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Core Concepts
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Understand the fundamental concepts and architecture that power Vexor.
          This knowledge will help you build better applications.
        </p>
      </div>

      {/* Architecture Overview */}
      <section>
        <h2 id="architecture" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Architecture Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Vexor is built on a layered architecture that provides clear separation of concerns.
          Each layer has a specific responsibility, making the codebase easy to understand and extend.
        </p>
        <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre>{architectureCode}</pre>
        </div>
      </section>

      {/* Request Lifecycle */}
      <section>
        <h2 id="request-lifecycle" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request Lifecycle
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Every request in Vexor goes through a well-defined lifecycle. Understanding this
          lifecycle helps you place your code in the right hooks for optimal performance.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {['onRequest', 'preValidation', 'Validation', 'preHandler', 'Handler', 'onSend'].map((step, index, arr) => (
            <div key={step} className="flex items-center">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                step === 'Handler'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : step === 'Validation'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {step}
              </span>
              {index < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
              )}
            </div>
          ))}
        </div>

        <CodeBlock code={lifecycleCode} filename="hooks.ts" />
      </section>

      {/* Key Concepts Grid */}
      <section>
        <h2 id="key-concepts" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Key Concepts
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {concepts.map((concept) => (
            <Link
              key={concept.title}
              to={concept.href}
              className="feature-card flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <concept.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {concept.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {concept.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Web Standards */}
      <section>
        <h2 id="web-standards" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Built on Web Standards
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor is built on the Web Standards Fetch API, making it portable across runtimes.
          The core primitives are:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <code className="prose-code shrink-0">Request</code>
            <span>Standard Request object with body parsing and headers</span>
          </li>
          <li className="flex items-start gap-3">
            <code className="prose-code shrink-0">Response</code>
            <span>Standard Response object with streaming support</span>
          </li>
          <li className="flex items-start gap-3">
            <code className="prose-code shrink-0">Headers</code>
            <span>Standard Headers object for request/response headers</span>
          </li>
          <li className="flex items-start gap-3">
            <code className="prose-code shrink-0">URL</code>
            <span>Standard URL object for URL parsing</span>
          </li>
          <li className="flex items-start gap-3">
            <code className="prose-code shrink-0">ReadableStream</code>
            <span>Standard streams for response body</span>
          </li>
        </ul>
      </section>

      {/* Performance */}
      <section>
        <h2 id="performance" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Performance by Design
        </h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-400">
          <p>
            Performance is a core principle of Vexor. Here's how we achieve exceptional speed:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Radix Tree Router:</strong> O(1) lookups for static routes, highly efficient
              parameter matching
            </li>
            <li>
              <strong>JIT Compilation:</strong> Validators and serializers are compiled at startup
              for near-native performance
            </li>
            <li>
              <strong>Zero Allocation:</strong> Object pooling for request context minimizes GC pressure
            </li>
            <li>
              <strong>Lazy Parsing:</strong> Query strings, cookies, and bodies are parsed only when accessed
            </li>
            <li>
              <strong>Tree Shaking:</strong> Conditional exports allow bundlers to eliminate unused code
            </li>
          </ul>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="dive-deeper" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Dive Deeper
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Explore each concept in detail to master Vexor:
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/routing" className="btn-secondary">
            Routing <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/context" className="btn-secondary">
            Context <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/validation" className="btn-secondary">
            Validation <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
