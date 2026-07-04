import { Link } from 'react-router-dom';
import {
  Zap,
  Shield,
  Box,
  Globe,
  Database,
  Terminal,
  ArrowRight,
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

const batteries = [
  'Auth & JWT',
  'Rate limiting',
  'CORS',
  'Static files',
  'Caching',
  'WebSocket & SSE',
  'OpenAPI',
  'Metrics & tracing',
  'Graceful shutdown',
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
    <div className="inline-flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-900 text-slate-100 font-mono text-sm ring-1 ring-slate-700/80 shadow-xl shadow-slate-950/20">
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

function BentoCard({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900/50 p-6 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-20 px-6 hero-gradient overflow-hidden">
        <div className="absolute inset-0 dot-pattern" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto text-center">
          <a
            href={`${GITHUB_URL}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="pill mb-7 hover:ring-primary-400 dark:hover:ring-primary-500 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Vexor {VERSION} — typed handlers, static files, graceful shutdown
            <ArrowRight className="w-3 h-3" />
          </a>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 text-balance leading-[1.05]">
            The backend framework
            <br />
            <span className="gradient-text">for every runtime</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed text-balance">
            Batteries-included and type-safe by inference, with its own ORM.
            Write it once — run it on Node.js, Bun, Deno, and the edge.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link to="/getting-started" className="btn-primary px-6 py-2.5">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <InstallCommand />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[13px] text-slate-500 dark:text-slate-400">
            {runtimes.map((runtime, i) => (
              <span key={runtime} className="flex items-center gap-4">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />}
                {runtime}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Code showcase */}
      <section className="max-w-5xl mx-auto px-6 -mt-2">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">
              Type-safe by inference
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Schemas that validate and type your handlers
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 text-[15px]">
              One schema powers runtime validation and compile-time types. No codegen,
              no decorators, no drift between what you declare and what you get.
            </p>
            <ul className="space-y-2.5">
              {[
                'Path params inferred from the route string',
                'Bodies validated and typed from one schema',
                'Structured 400s for invalid input',
                '405, HEAD, and CORS preflight handled for you',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 min-w-0 order-1 lg:order-2">
            <CodeBlock code={quickStartCode} filename="app.ts" />
          </div>
        </div>
      </section>

      {/* Bento grid */}
      <section className="max-w-5xl mx-auto px-6 mt-24">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Everything you need, nothing to assemble
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-[15px]">
            A complete, integrated toolkit for production applications — no plugin
            scavenger hunt.
          </p>
        </div>

        <div className="grid md:grid-cols-6 gap-4">
          {/* Multi-runtime — wide */}
          <BentoCard className="md:col-span-4">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 85% 15%, rgb(99 102 241 / 0.12), transparent 60%)',
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <Globe className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Multi-runtime</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-md">
                Built on Web Standards. The same app runs everywhere — smoke-tested on
                Node.js, Bun, and Deno in CI.
              </p>
              <div className="flex flex-wrap gap-2">
                {runtimes.map((runtime) => (
                  <span key={runtime} className="pill">{runtime}</span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Performance */}
          <BentoCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Fast by design</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Radix tree router with O(1) static lookup, LRU match cache, precompiled
              validation, and pooled request contexts.
            </p>
          </BentoCard>

          {/* ORM */}
          <BentoCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Database className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Vexor ORM</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Type-safe queries, migrations, relations without N+1, savepoints, and pooling.
            </p>
            <Link
              to="/orm"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all"
            >
              Explore the ORM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* Type safety */}
          <BentoCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">End-to-end types</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              <code className="prose-code">ctx.params</code>,{' '}
              <code className="prose-code">ctx.query</code>, and{' '}
              <code className="prose-code">ctx.body()</code> typed from your routes.
            </p>
            <Link
              to="/validation"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all"
            >
              How it works <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BentoCard>

          {/* Batteries — wide */}
          <BentoCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <Box className="w-4.5 h-4.5 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Batteries included</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {batteries.map((battery) => (
                <span
                  key={battery}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {battery}
                </span>
              ))}
            </div>
          </BentoCard>

          {/* CLI — full width strip */}
          <BentoCard className="md:col-span-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="md:w-64 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Terminal className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Powerful CLI</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Scaffold, generate, migrate, and validate — from one tool.
                </p>
              </div>
              <div className="flex-1 min-w-0 rounded-xl bg-slate-950 ring-1 ring-slate-800 p-4 font-mono text-[13px] leading-7 overflow-x-auto">
                <div><span className="text-emerald-400">❯</span> <span className="text-slate-100">vexor new my-app</span></div>
                <div><span className="text-emerald-400">❯</span> <span className="text-slate-100">vexor generate module users</span></div>
                <div><span className="text-emerald-400">❯</span> <span className="text-slate-100">vexor db:migrate</span> <span className="text-slate-500"># migrations, env checks, and more</span></div>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Explore the docs */}
      <section className="max-w-5xl mx-auto px-6 mt-24">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Explore the documentation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-[15px]">
            Comprehensive guides for every feature — from your first route to production.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.href}
              className="flex items-start gap-3.5 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary-300 dark:hover:ring-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                <section.icon className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {section.title}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 mt-24">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to build?</h2>
            <p className="text-slate-400 mb-7 max-w-md mx-auto text-[15px] text-balance">
              Install the core package, define your first typed route, and ship it to any runtime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/quick-start"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
              >
                Quick Start
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-2.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition-colors"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
