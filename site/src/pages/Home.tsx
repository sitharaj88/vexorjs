import { Link } from 'react-router-dom';
import { Zap, Shield, Box, Globe, Database, Terminal, ArrowRight, Sparkles, Server, Lock, Activity, Radio, Compass, Layers } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const features = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Radix tree router, JIT-compiled validation, and zero-allocation request handling deliver exceptional performance.',
    href: '/advanced/performance',
  },
  {
    icon: Shield,
    title: 'Type-Safe',
    description: 'End-to-end TypeScript inference without code generation. Catch errors at compile time, not runtime.',
    href: '/validation',
  },
  {
    icon: Globe,
    title: 'Multi-Runtime',
    description: 'Run anywhere: Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge. One codebase, all platforms.',
    href: '/advanced/adapters',
  },
  {
    icon: Database,
    title: 'Vexor ORM',
    description: 'Built-in ORM with type-safe queries, migrations, and connection pooling.',
    href: '/orm',
  },
  {
    icon: Box,
    title: 'Batteries Included',
    description: 'Authentication, logging, observability, real-time support, and more. Everything you need out of the box.',
    href: '/core-concepts',
  },
  {
    icon: Terminal,
    title: 'Powerful CLI',
    description: 'Generate modules, run migrations, scaffold projects. Developer experience comes first.',
    href: '/cli',
  },
];

const sections = [
  { icon: Layers, title: 'Core Concepts', description: 'Routing, middleware, context, and validation', href: '/core-concepts' },
  { icon: Shield, title: 'Middleware', description: 'Rate limiting, CORS, compression, uploads, and more', href: '/middleware/rate-limiting' },
  { icon: Server, title: 'Infrastructure', description: 'Caching, logging, DI, plugins, and configuration', href: '/infrastructure/caching' },
  { icon: Lock, title: 'Auth & Security', description: 'JWT, sessions, OAuth2, and security best practices', href: '/auth/authentication' },
  { icon: Activity, title: 'Observability', description: 'Metrics, tracing, and OpenAPI documentation', href: '/observability/metrics' },
  { icon: Database, title: 'Vexor ORM', description: 'Schema, queries, migrations, relations, and pooling', href: '/orm' },
  { icon: Radio, title: 'Real-Time', description: 'SSE, WebSocket, and pub/sub event bus', href: '/realtime/sse' },
  { icon: Terminal, title: 'CLI', description: 'Scaffolding, code generation, and dev tools', href: '/cli' },
  { icon: Compass, title: 'Advanced', description: 'Adapters, circuit breakers, retry, deployment, and testing', href: '/advanced/adapters' },
];

const quickStartCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Define a schema for type-safe validation
const UserSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
});

// Create a route with validation
app.post('/users', {
  body: UserSchema,
}, async (ctx) => {
  const user = ctx.body; // Fully typed!
  // Save to database using Vexor ORM
  const result = await ctx.db.insert(users).values(user).returning();
  return ctx.json(result, 201);
});

// Start the server
app.listen(3000);
console.log('Server running at http://localhost:3000');`;

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative text-center py-16 lg:py-24 -mx-6 px-6 hero-gradient grid-pattern overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 shadow-lg">
            <Sparkles className="w-4 h-4" />
            v1.0.0 — Production Ready
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            The Modern Backend Framework
            <br />
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent">
              for Node.js
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Vexor is a batteries-included, high-performance, multi-runtime framework
            with its own blazing-fast ORM. Build type-safe APIs at lightning speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link to="/getting-started" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="https://github.com/vexorjs/vexor"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3"
            >
              View on GitHub
            </a>
          </div>

          {/* Install command */}
          <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-100 font-mono text-sm border border-slate-700">
            <span className="text-slate-500">$</span>
            <span>npm create vexor@latest</span>
            <button
              className="text-slate-400 hover:text-white transition-colors"
              onClick={() => navigator.clipboard.writeText('npm create vexor@latest')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Example */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Powerful, Type-Safe
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Write clean, expressive code with full TypeScript support
          </p>
        </div>
        <CodeBlock code={quickStartCode} filename="app.ts" />
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stop piecing together dozens of packages. Vexor gives you a complete,
            integrated solution for building production-ready applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href} className="feature-card group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 mt-3 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore the Docs */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Explore the Documentation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive guides for every feature. From getting started to production deployment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.title}
              to={section.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <section.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
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

      {/* CTA Section */}
      <section className="text-center py-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">
          Get started with Vexor in minutes. Join thousands of developers
          building fast, type-safe applications.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/installation"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-white text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Install Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            to="/quick-start"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            Quick Start Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
