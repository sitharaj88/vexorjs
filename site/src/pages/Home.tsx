import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Box,
  Globe,
  Database,
  Terminal,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  Activity,
  Radio,
  Compass,
  Layers,
  Copy,
  Check,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const VERSION = 'v1.2';
const GITHUB_URL = 'https://github.com/sitharaj88/vexorjs';

const runtimes = ['Node.js', 'Bun', 'Deno', 'Cloudflare Workers', 'Vercel Edge', 'AWS Lambda'];

const stats = [
  { value: '2,000+', label: 'tests in CI' },
  { value: '6', label: 'runtimes' },
  { value: '0', label: 'runtime deps' },
  { value: 'MIT', label: 'licensed' },
];

const features = [
  {
    icon: Zap,
    title: 'High Performance',
    description:
      'Radix tree router with O(1) static lookup, an LRU match cache, precompiled validation, and object-pooled request contexts.',
    href: '/advanced/performance',
  },
  {
    icon: Shield,
    title: 'Type-Safe by Inference',
    description:
      'ctx.params typed from the route path, ctx.body() and ctx.query from the schema. No code generation, no decorators.',
    href: '/validation',
  },
  {
    icon: Globe,
    title: 'Multi-Runtime',
    description:
      'Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, and AWS Lambda. One codebase, smoke-tested across runtimes in CI.',
    href: '/advanced/adapters',
  },
  {
    icon: Database,
    title: 'Vexor ORM',
    description:
      'Type-safe queries, migrations, relations without N+1, transactions with savepoints, and connection pooling.',
    href: '/orm',
  },
  {
    icon: Box,
    title: 'Batteries Included',
    description:
      'Auth, rate limiting, CORS, static files, caching, observability, real-time, and graceful shutdown — out of the box.',
    href: '/core-concepts',
  },
  {
    icon: Terminal,
    title: 'Powerful CLI',
    description:
      'Scaffold projects, generate modules, run migrations, validate environments. Developer experience comes first.',
    href: '/cli',
  },
];

const sections = [
  { icon: GraduationCap, title: 'Learn', description: 'A guided path from fundamentals to production', href: '/learn' },
  { icon: Layers, title: 'Core Concepts', description: 'Routing, middleware, context, and validation', href: '/core-concepts' },
  { icon: Shield, title: 'Middleware', description: 'Rate limiting, CORS, static files, compression, uploads', href: '/middleware/rate-limiting' },
  { icon: Server, title: 'Infrastructure', description: 'Caching, logging, DI, plugins, and configuration', href: '/infrastructure/caching' },
  { icon: Lock, title: 'Auth & Security', description: 'JWT, sessions, OAuth2, and security best practices', href: '/auth/authentication' },
  { icon: Activity, title: 'Observability', description: 'Metrics, tracing, and OpenAPI documentation', href: '/observability/metrics' },
  { icon: Database, title: 'Vexor ORM', description: 'Schema, queries, migrations, relations, and pooling', href: '/orm' },
  { icon: Radio, title: 'Real-Time', description: 'SSE, WebSocket, and pub/sub event bus', href: '/realtime/sse' },
  { icon: Compass, title: 'Advanced', description: 'Adapters, circuit breakers, retry, deployment, testing', href: '/advanced/adapters' },
];

const quickStartCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Path params are inferred from the route string
app.get('/users/:id', async (ctx) => {
  return ctx.json({ id: ctx.params.id }); // { id: string }
});

// Schemas validate AND type the handler
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' }),
  }),
}, async (ctx) => {
  const user = await ctx.body(); // { name: string; email: string }
  return ctx.status(201).json(user);
});

app.listen(3000);`;

const INSTALL_COMMAND = 'npm install @vexorjs/core';

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 inline-flex items-center gap-3 pl-5 pr-3 py-3 rounded-xl bg-slate-950 dark:bg-slate-900 text-slate-100 font-mono text-sm ring-1 ring-slate-700/80 shadow-xl shadow-slate-950/20">
      <span className="text-emerald-400 select-none">❯</span>
      <span>{INSTALL_COMMAND}</span>
      <button
        onClick={copy}
        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Copy install command"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-16 sm:space-y-28 pb-16">
      {/* Hero */}
      <section className="relative text-center pt-16 pb-12 lg:pt-28 lg:pb-16 px-6 hero-gradient overflow-hidden">
        <div className="absolute inset-0 dot-pattern" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto">
          <a
            href={`${GITHUB_URL}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="pill mb-8 hover:ring-primary-400 dark:hover:ring-primary-500 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>
              Vexor {VERSION} is out — typed handlers, static files, graceful shutdown
            </span>
            <ArrowRight className="w-3 h-3" />
          </a>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
            The backend framework
            <br />
            <span className="gradient-text">for every runtime</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed text-balance">
            Batteries-included and type-safe by inference, with its own ORM.
            Write it once — run it on Node.js, Bun, Deno, and the edge.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link to="/getting-started" className="btn-primary text-base px-7 py-3">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-7 py-3"
            >
              View on GitHub
            </a>
          </div>

          <InstallCommand />

          {/* Runtimes */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {runtimes.map((runtime) => (
              <span key={runtime} className="pill">
                {runtime}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Code showcase */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Type-safe from route to response
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Schemas do double duty: they validate requests at runtime and type your
              handlers at compile time. No codegen step, no decorators, no drift.
            </p>
            <ul className="space-y-3">
              {[
                'Path params inferred from the route string',
                'Request bodies validated and typed from one schema',
                'Invalid input answered with structured 400s',
                '405, HEAD, and CORS preflight handled for you',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/validation"
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all"
            >
              Explore validation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-3 min-w-0">
            <CodeBlock code={quickStartCode} filename="app.ts" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-200 dark:bg-slate-800">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900/90 px-6 py-6 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Everything you need, nothing to assemble
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
            Stop piecing together dozens of packages. Vexor ships a complete, integrated
            toolkit for production applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href} className="feature-card group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 mt-4 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore the docs */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Explore the documentation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
            Comprehensive guides for every feature — from your first route to production
            deployment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.href}
              className="flex items-start gap-4 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary-300 dark:hover:ring-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <section.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden text-center py-14 px-6 rounded-3xl bg-slate-950 ring-1 ring-slate-800">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 90% at 50% 110%, rgb(99 102 241 / 0.35), transparent 65%)',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to build?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto text-balance">
              Install the core package, define your first typed route, and ship it to any
              runtime — all in a few minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/installation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
              >
                Install Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/quick-start"
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition-colors"
              >
                Quick Start Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
