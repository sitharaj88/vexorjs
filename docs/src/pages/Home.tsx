import { Link } from 'react-router-dom';
import { Zap, Shield, Box, Globe, Database, Terminal, ArrowRight, Sparkles } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const features = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Radix tree router, JIT-compiled validation, and zero-allocation request handling deliver exceptional performance.',
  },
  {
    icon: Shield,
    title: 'Type-Safe',
    description: 'End-to-end TypeScript inference without code generation. Catch errors at compile time, not runtime.',
  },
  {
    icon: Globe,
    title: 'Multi-Runtime',
    description: 'Run anywhere: Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge. One codebase, all platforms.',
  },
  {
    icon: Database,
    title: 'Vexor ORM',
    description: 'Built-in ORM with type-safe queries, migrations, and connection pooling.',
  },
  {
    icon: Box,
    title: 'Batteries Included',
    description: 'Authentication, logging, observability, real-time support, and more. Everything you need out of the box.',
  },
  {
    icon: Terminal,
    title: 'Powerful CLI',
    description: 'Generate modules, run migrations, scaffold projects. Developer experience comes first.',
  },
];

const quickStartCode = `import { Vexor, Type } from 'vexor';

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
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Now in Public Beta
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          The Modern Backend Framework
          <br />
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            for Node.js
          </span>
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
          Vexor is a batteries-included, high-performance, multi-runtime framework
          with its own blazing-fast ORM. Build type-safe APIs at lightning speed.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/getting-started" className="btn-primary">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <a
            href="https://github.com/vexorjs/vexor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            View on GitHub
          </a>
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
            <div key={feature.title} className="feature-card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
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
