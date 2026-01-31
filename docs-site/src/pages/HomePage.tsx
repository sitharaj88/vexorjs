import { Link } from 'react-router-dom';
import {
  Zap,
  Database,
  Shield,
  Globe,
  Terminal,
  BarChart3,
  ArrowRight,
  Github,
  CheckCircle,
  Linkedin,
  ExternalLink
} from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const heroCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Type-safe schema validation
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' })
});

// Auto-validated routes with OpenAPI generation
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: { 200: UserSchema }
}, async (ctx) => {
  return ctx.json({
    id: ctx.params.id,
    name: 'John',
    email: 'john@example.com'
  });
});

app.listen(3000);`;

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Blazing Fast',
    description: '50K+ requests/sec with Radix tree routing and JIT-compiled validators',
    color: 'text-vexor-400',
    bg: 'bg-vexor-500/10',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Built-in ORM',
    description: 'Type-safe query builder with PostgreSQL, MySQL, and SQLite support',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Type Safe',
    description: 'End-to-end type inference from database to API response',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Multi-Runtime',
    description: 'Run on Node.js, Bun, Deno, AWS Lambda, Cloudflare Workers',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Real-time',
    description: 'WebSocket and Server-Sent Events with Pub/Sub support',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Observability',
    description: 'OpenTelemetry tracing and Prometheus metrics built-in',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
];

const stats = [
  { value: '50K+', label: 'Requests/sec' },
  { value: '<10KB', label: 'Edge Bundle' },
  { value: '100%', label: 'Type Safe' },
  { value: '5+', label: 'Runtimes' },
];

const middlewareList = [
  'CORS', 'Compression', 'Rate Limiting', 'File Upload',
  'Caching', 'Health Check', 'Versioning', 'OAuth2'
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-20 hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">Now with AWS Lambda & Edge Runtime Support</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="gradient-text">Build APIs</span>
              <br />
              <span className="text-slate-900 dark:text-white">at Lightning Speed</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A blazing-fast, batteries-included, multi-runtime Node.js backend framework with its own ORM.
              Type-safe from database to API response.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/docs/getting-started" className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/sitharaj88/vexorjs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2"
              >
                <Github className="w-5 h-5" />
                Star on GitHub
              </a>
            </div>

            {/* Code Preview */}
            <div className="max-w-3xl mx-auto text-left">
              <CodeBlock code={heroCode} filename="app.ts" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-vexor-400 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete toolkit for building production-ready APIs without the boilerplate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Middleware Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built-in Middleware</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Production-ready middleware out of the box</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {middlewareList.map((item) => (
              <div key={item} className="flex items-center gap-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-transparent rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4 text-vexor-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Build?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
            Start building production-ready APIs in minutes with Vexor
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/docs/getting-started" className="w-full sm:w-auto btn-primary">
              Get Started Now
            </Link>
            <Link to="/docs/core" className="w-full sm:w-auto btn-secondary">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs">
                  V
                </div>
                <span className="font-semibold">Vexor</span>
                <span className="text-slate-500 text-sm">© 2024</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://github.com/sitharaj88/vexorjs" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/sitharaj88" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://sitharaj.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center gap-6 text-sm">
                <Link to="/docs/getting-started" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Documentation
                </Link>
                <a href="https://github.com/sitharaj88/vexorjs" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  GitHub
                </a>
              </div>
              <div className="text-sm text-slate-500">
                Built by{' '}
                <a href="https://sitharaj.in" target="_blank" rel="noopener noreferrer" className="text-vexor-400 hover:text-vexor-300 transition-colors">
                  Sitharaj Seenivasan
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
