import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const installCode = `npm install @vexorjs/core @vexorjs/orm`;

const basicExample = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello, Vexor!' });
});

app.listen(3000);`;

export default function GettingStarted() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="introduction" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Getting Started with Vexor
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Welcome to Vexor! This guide will help you understand what Vexor is,
          why you might want to use it, and how to get up and running quickly.
        </p>
      </div>

      {/* What is Vexor */}
      <section>
        <h2 id="what-is-vexor" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          What is Vexor?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Vexor is a <strong>batteries-included</strong>, <strong>high-performance</strong>,
          <strong> multi-runtime</strong> Node.js backend framework. It comes with its own
          blazing-fast ORM and is designed for developers who want the productivity of
          Rails-like frameworks with the performance of low-level libraries.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card">
            <Zap className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">High Performance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              52,000+ requests/second with radix tree routing and JIT-compiled validation.
            </p>
          </div>
          <div className="card">
            <Shield className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Type-Safe</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              End-to-end TypeScript support with automatic type inference.
            </p>
          </div>
          <div className="card">
            <Globe className="w-8 h-8 text-primary-500 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Multi-Runtime</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Works on Node.js, Bun, Deno, and Edge platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 id="key-features" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Key Features
        </h2>
        <div className="space-y-3">
          {[
            'Radix tree router with static route short-circuit (O(1) lookups)',
            'TypeBox-compatible schema system with JSON Schema support',
            'JIT-compiled validators and serializers',
            'Hook-based middleware pipeline (onRequest, preValidation, preHandler, onSend)',
            'Built-in Vexor ORM with type-safe queries and migrations',
            'WebSocket and Server-Sent Events support',
            'OpenTelemetry tracing and Prometheus metrics',
            'JWT and session authentication',
            'Circuit breakers and retry patterns',
            'Edge-optimized with tree-shaking support (<10KB core)',
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Install */}
      <section>
        <h2 id="quick-install" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Install
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install Vexor and the ORM using npm, yarn, or pnpm:
        </p>
        <CodeBlock code={installCode} language="bash" />
      </section>

      {/* Hello World */}
      <section>
        <h2 id="hello-world" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Hello World
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create your first Vexor application with just a few lines of code:
        </p>
        <CodeBlock code={basicExample} filename="app.ts" />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Run your application with <code className="prose-code">npx tsx app.ts</code> and
          visit <code className="prose-code">http://localhost:3000</code> in your browser.
        </p>
      </section>

      {/* Philosophy */}
      <section>
        <h2 id="philosophy" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Design Philosophy
        </h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-400">
          <p>
            Vexor is built on a few core principles:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Developer Experience First:</strong> Clear APIs, excellent TypeScript
              support, and helpful error messages.
            </li>
            <li>
              <strong>Performance Without Compromise:</strong> We never sacrifice speed
              for convenience. Every feature is optimized.
            </li>
            <li>
              <strong>Batteries Included:</strong> Stop configuring and start building.
              Everything you need is included and works together.
            </li>
            <li>
              <strong>Standards-Based:</strong> Built on Web Standards (Fetch API, Request,
              Response) for maximum portability.
            </li>
          </ul>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/installation"
            className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Installation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Detailed installation instructions
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link
            to="/quick-start"
            className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Quick Start</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Build your first API in 5 minutes
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
