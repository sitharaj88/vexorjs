import { Link } from 'react-router-dom';
import {
  Rocket,
  Database,
  Shield,
  Key,
  Gauge,
  Code2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

const features = [
  {
    icon: Database,
    title: 'SQLite + ORM',
    description: 'Type-safe database operations with @vexorjs/orm',
  },
  {
    icon: Key,
    title: 'JWT Authentication',
    description: 'Secure access/refresh token flow',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Fine-grained permission control',
  },
  {
    icon: Gauge,
    title: 'Rate Limiting',
    description: 'Protect against abuse and DDoS',
  },
  {
    icon: Code2,
    title: 'Input Validation',
    description: 'Comprehensive request validation',
  },
  {
    icon: CheckCircle2,
    title: '46 Tests',
    description: 'Full test coverage with Vitest',
  },
];

const quickStartCode = `# Clone and navigate to the example
cd examples/enterprise-api

# Install dependencies
npm install

# Seed the database
npm run seed

# Start the server
npm start`;

const loginExample = `curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'`;

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/50 dark:to-accent-950/50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk0QUYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Production Ready
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Enterprise API
              <span className="block gradient-text">Documentation</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              A production-ready REST API built with Vexor framework featuring authentication,
              authorization, database integration, and comprehensive testing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
              >
                <Rocket size={20} />
                Get Started
              </Link>
              <Link
                to="/authentication"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                API Reference
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
          Everything you need for production
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg gradient-bg text-white mb-4">
                <feature.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Quick Start
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Get up and running in minutes with just a few commands.
              </p>
              <CodeBlock code={quickStartCode} language="bash" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Make Your First Request
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Login with the seeded admin account to get an access token.
              </p>
              <CodeBlock code={loginExample} language="bash" />
            </div>
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
            API Endpoints
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              to="/authentication"
              className="feature-card group hover:border-primary-500 dark:hover:border-primary-500"
            >
              <div className="flex items-center justify-between mb-4">
                <Key className="text-primary-500" size={24} />
                <span className="text-xs font-semibold text-slate-400">7 endpoints</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Authentication
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Register, login, refresh tokens, change password
              </p>
            </Link>

            <Link
              to="/users"
              className="feature-card group hover:border-primary-500 dark:hover:border-primary-500"
            >
              <div className="flex items-center justify-between mb-4">
                <Shield className="text-primary-500" size={24} />
                <span className="text-xs font-semibold text-slate-400">5 endpoints</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Users
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                CRUD operations with role-based access
              </p>
            </Link>

            <Link
              to="/products"
              className="feature-card group hover:border-primary-500 dark:hover:border-primary-500"
            >
              <div className="flex items-center justify-between mb-4">
                <Database className="text-primary-500" size={24} />
                <span className="text-xs font-semibold text-slate-400">7 endpoints</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Products
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Full product management with categories
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Built with</span>
              <span className="font-semibold text-slate-900 dark:text-white">Vexor</span>
              <span>framework</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              MIT License
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
