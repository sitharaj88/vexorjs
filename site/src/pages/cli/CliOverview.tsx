import { Link } from 'react-router-dom';
import { ArrowRight, FolderPlus, Database, Play, Sparkles, Settings, Globe, Shield, Package, Wrench } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const installCode = `# Install globally
npm install -g @vexorjs/cli

# Or use with npx (no install required)
npx @vexorjs/cli <command>

# Verify installation
vexor --version`;

const createProjectCode = `# Interactive mode — prompts for all options
vexor new my-app

# Quick start with defaults (API template, npm, git init)
vexor new my-app --yes

# Specify template and package manager
vexor new my-app --template microservice --package-manager pnpm

# Skip git initialization and dependency install
vexor new my-app --no-git --no-install`;

const generateCode = `# Generate a complete CRUD module (routes + service + schema)
vexor generate module users

# Generate a database model with typed columns
vexor generate model Post title:string content:text authorId:integer:notNull

# Generate a timestamped migration
vexor generate migration add_posts_table

# Generate a route handler
vexor generate route health

# Generate a service class
vexor generate service notification

# Shorthand alias
vexor g module products`;

const dbCode = `# Run all pending migrations
vexor db:migrate

# Rollback the last migration
vexor db:rollback

# Check which migrations have been applied
vexor db:status

# Seed the database with test data
vexor db:seed

# Reset everything: rollback all → migrate → seed
vexor db:reset`;

const devCode = `# Start development server with hot reload
vexor dev

# Custom port and host
vexor dev --port 4000 --host 0.0.0.0

# Custom entry file
vexor dev --entry src/server.ts`;

const buildCode = `# Build for production (Node.js target)
vexor build

# Build for specific runtime
vexor build --target bun
vexor build --target edge

# Build with minification
vexor build --minify --output dist`;

const addCode = `# Interactive — pick from available integrations
vexor add

# Install a specific integration
vexor add docker
vexor add prisma
vexor add vitest

# List all available integrations
vexor add:list`;

const envCode = `# Create .env from .env.example (or generate defaults)
vexor env:init

# List all environment variables
vexor env:list

# Set a variable
vexor env:set DATABASE_URL postgres://localhost:5432/mydb

# Compare .env with .env.example
vexor env:diff

# Validate required variables and formats
vexor env:validate`;

const features = [
  {
    icon: FolderPlus,
    title: 'Project Scaffolding',
    description: 'Create production-ready projects from 4 templates: API, minimal, microservice, and WebSocket. Each template includes TypeScript config, sensible defaults, and best-practice project structure.',
    href: '/cli/commands#new',
  },
  {
    icon: Sparkles,
    title: 'Code Generation',
    description: 'Generate modules, models, migrations, routes, and services with a single command. Generated code follows Vexor conventions and includes full TypeScript types.',
    href: '/cli/commands#generate',
  },
  {
    icon: Database,
    title: 'Database Management',
    description: 'Run migrations, check status, seed data, and reset your database. Integrates directly with Vexor ORM for a seamless development workflow.',
    href: '/cli/commands#database',
  },
  {
    icon: Play,
    title: 'Dev Server & Build',
    description: 'Hot-reloading development server that auto-detects tsx, ts-node, or bun. Production builds powered by tsup with support for Node.js, Bun, and edge targets.',
    href: '/cli/commands#dev',
  },
  {
    icon: Package,
    title: 'Integrations',
    description: 'Add Docker, Prisma, Vitest, ESLint, Sentry, Swagger, GitHub Actions, and Redis to your project with one command. Each integration scaffolds config files and installs dependencies.',
    href: '/cli/commands#add',
  },
  {
    icon: Settings,
    title: 'Config & Environment',
    description: 'Manage project and global configuration, environment variables, validation, and diff tools. Keep your settings consistent across environments.',
    href: '/cli/commands#config',
  },
];

export default function CliOverview() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="cli" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Vexor CLI
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          The Vexor command-line interface is the primary tool for creating projects, generating code, managing databases, and running your application during development. It eliminates boilerplate, enforces conventions, and integrates the entire Vexor ecosystem into a single workflow.
        </p>
      </div>

      {/* Why a CLI */}
      <section>
        <h2 id="why" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Why Use the CLI
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Modern backend frameworks require significant setup: TypeScript configuration, project structure, database connections, testing frameworks, Docker files, CI pipelines, and linting rules. Doing this manually for every project is tedious and error-prone. The Vexor CLI automates all of it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you run <code className="prose-code">vexor new</code>, the CLI doesn't just copy a template — it creates a fully configured project with the right dependencies, scripts, and folder structure for your chosen architecture. When you run <code className="prose-code">vexor generate module users</code>, it creates routes, a service layer, and validation schemas that follow Vexor conventions and are immediately ready to customize.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The CLI also manages your database lifecycle (<code className="prose-code">db:migrate</code>, <code className="prose-code">db:seed</code>, <code className="prose-code">db:reset</code>), your environment variables (<code className="prose-code">env:validate</code>, <code className="prose-code">env:diff</code>), and your development server with hot reload. It's designed to be the single entry point for your entire development workflow.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 id="features" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href} className="card group hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <feature.icon className="w-8 h-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Installation */}
      <section>
        <h2 id="installation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Installation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install the CLI globally to access the <code className="prose-code">vexor</code> command from anywhere, or use <code className="prose-code">npx</code> to run it without a global install. The CLI requires Node.js 20 or later.
        </p>
        <CodeBlock code={installCode} language="bash" />
        <InfoBlock variant="tip" >
          If you use <code className="prose-code">npx</code>, the CLI is downloaded on first use and cached. This is ideal for CI environments or one-off project creation.
        </InfoBlock>
      </section>

      {/* Project Creation */}
      <section>
        <h2 id="create" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Creating a Project
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">vexor new</code> command creates a new Vexor project from one of four templates. In interactive mode (the default), it prompts you to choose a template, package manager, and whether to initialize git. You can also pass all options as flags for scripted or CI usage.
        </p>
        <CodeBlock code={createProjectCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Available Templates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Template</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Includes</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">api</code></td>
                <td className="py-3 px-4">Full-featured REST API</td>
                <td className="py-3 px-4">Auth, database, validation, user service, JWT</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">minimal</code></td>
                <td className="py-3 px-4">Bare essentials</td>
                <td className="py-3 px-4">Health check, hello endpoint</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">microservice</code></td>
                <td className="py-3 px-4">Production microservice</td>
                <td className="py-3 px-4">Health/readiness probes, tracing, circuit breaker, Dockerfile, Prometheus metrics</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">websocket</code></td>
                <td className="py-3 px-4">Real-time server</td>
                <td className="py-3 px-4">WebSocket with rooms, SSE, event bus, test client</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Code Generation */}
      <section>
        <h2 id="generation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Code Generation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">vexor generate</code> command (aliased as <code className="prose-code">vexor g</code>) scaffolds modules, models, migrations, routes, and services. Each generator creates files with full TypeScript types, follows Vexor naming conventions, and is ready to customize immediately.
        </p>
        <CodeBlock code={generateCode} language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The <strong>module</strong> generator is the most commonly used — it creates a complete CRUD feature with routes (GET, POST, PUT, DELETE), a service class with business logic methods, and a validation schema. The <strong>model</strong> generator supports all common column types including <code className="prose-code">string</code>, <code className="prose-code">text</code>, <code className="prose-code">integer</code>, <code className="prose-code">boolean</code>, <code className="prose-code">json</code>, <code className="prose-code">uuid</code>, <code className="prose-code">timestamp</code>, and more, with optional constraints like <code className="prose-code">notNull</code>, <code className="prose-code">unique</code>, and <code className="prose-code">primary</code>.
        </p>
      </section>

      {/* Database Management */}
      <section>
        <h2 id="database" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CLI provides a complete set of database commands that integrate with Vexor ORM. You can run migrations, check their status, seed test data, and reset your database — all from the command line.
        </p>
        <CodeBlock code={dbCode} language="bash" />
        <InfoBlock variant="warning" >
          The <code className="prose-code">db:reset</code> command is destructive — it rolls back all migrations, re-runs them, and seeds the database. Use it only in development.
        </InfoBlock>
      </section>

      {/* Dev & Build */}
      <section>
        <h2 id="devbuild" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Development &amp; Build
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">vexor dev</code> command starts a development server with automatic hot reload. It detects your TypeScript runner (<code className="prose-code">tsx</code>, <code className="prose-code">ts-node</code>, or <code className="prose-code">bun</code>) and handles graceful shutdown. The <code className="prose-code">vexor build</code> command creates an optimized production bundle using tsup.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Development</h3>
            <CodeBlock code={devCode} language="bash" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Production Build</h3>
            <CodeBlock code={buildCode} language="bash" />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h2 id="integrations" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Integrations
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">vexor add</code> command installs pre-configured integrations into your project. Each integration adds the necessary dependencies, creates configuration files, and adds npm scripts — so you don't need to configure anything manually.
        </p>
        <CodeBlock code={addCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Available Integrations</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Database, name: 'Prisma', desc: 'ORM with schema file, generate & studio scripts' },
            { icon: Database, name: 'Redis', desc: 'ioredis client with connection helper' },
            { icon: Shield, name: 'Vitest', desc: 'Unit testing with coverage and UI mode' },
            { icon: Package, name: 'Docker', desc: 'Multi-stage Dockerfile + docker-compose with Postgres' },
            { icon: Wrench, name: 'ESLint + Prettier', desc: 'Linting and formatting with TypeScript support' },
            { icon: Globe, name: 'GitHub Actions', desc: 'CI/CD workflows for test, lint, build, and release' },
            { icon: Globe, name: 'Swagger', desc: 'OpenAPI spec with Swagger UI endpoint' },
            { icon: Shield, name: 'Sentry', desc: 'Error tracking and monitoring integration' },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <item.icon className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Environment Management */}
      <section>
        <h2 id="environment" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CLI includes a full suite of environment variable tools. You can initialize <code className="prose-code">.env</code> files, set and remove variables, diff against <code className="prose-code">.env.example</code>, and validate that required variables are present with correct formats.
        </p>
        <CodeBlock code={envCode} language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The <code className="prose-code">env:validate</code> command checks for required variables like <code className="prose-code">NODE_ENV</code> and <code className="prose-code">PORT</code>, warns on empty values, and validates formats for sensitive patterns (e.g., <code className="prose-code">DATABASE_URL</code> must look like a connection string, <code className="prose-code">JWT_SECRET</code> must meet minimum length requirements).
        </p>
      </section>

      {/* Diagnostics */}
      <section>
        <h2 id="diagnostics" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Diagnostics &amp; Help
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CLI includes diagnostic commands to help you troubleshoot issues and keep your setup healthy.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Command</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vexor info</code></td>
                <td className="py-3 px-4">Shows OS, Node.js version, package manager, installed Vexor packages, CPU, and memory</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vexor doctor</code></td>
                <td className="py-3 px-4">Runs 9 health checks (Node version, TypeScript, tsconfig, entry file, git, etc.) with fix suggestions</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vexor upgrade</code></td>
                <td className="py-3 px-4">Checks for CLI updates and installs them. Use <code className="prose-code">--check</code> for dry run</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vexor docs [topic]</code></td>
                <td className="py-3 px-4">Opens documentation in your browser</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vexor help [topic]</code></td>
                <td className="py-3 px-4">Detailed usage help for any command group</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">vexor changelog</code></td>
                <td className="py-3 px-4">Shows recent release notes and changes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Next Steps
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          See the full command reference with all options, flags, and examples for every CLI command.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/cli/commands" className="btn-primary">
            Full Command Reference <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/getting-started" className="btn-secondary">
            Getting Started Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
