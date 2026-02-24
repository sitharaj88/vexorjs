import CodeBlock from '../components/CodeBlock';

const installCode = `# Install globally
npm install -g @vexorjs/cli

# Or use with npx
npx @vexorjs/cli new my-app

# Verify installation
vexor --version`;

const newProjectCode = `# Interactive mode (recommended)
vexor new

# Create with name
vexor new my-app

# Use specific template
vexor new my-app --template api
vexor new my-app --template minimal
vexor new my-app --template microservice
vexor new my-app --template websocket

# Quick creation with defaults
vexor new my-app -y`;

const generateCode = `# Generate a complete module
vexor generate module users
vexor g module products

# Generate a database model
vexor generate model User name:string email:string:unique

# Generate a route handler
vexor generate route products

# Generate a migration
vexor generate migration create_posts_table`;

const addCode = `# Interactive integration selection
vexor add

# Add specific integrations
vexor add prisma      # Prisma ORM
vexor add redis       # Redis caching
vexor add vitest      # Unit testing
vexor add docker      # Docker setup
vexor add eslint      # ESLint + Prettier
vexor add github      # GitHub Actions CI/CD
vexor add swagger     # Swagger/OpenAPI docs
vexor add sentry      # Error tracking

# List all available integrations
vexor add:list`;

const dbCode = `# Run pending migrations
vexor db:migrate

# Rollback last migration
vexor db:rollback

# Rollback multiple migrations
vexor db:rollback -s 3

# Show migration status
vexor db:status

# Run database seeders
vexor db:seed

# Reset database
vexor db:reset`;

const configCode = `# List all configuration values
vexor config:list

# Get a specific value
vexor config:get defaultTemplate

# Set a value
vexor config:set defaultPackageManager pnpm

# Reset all config
vexor config:reset

# Open config in editor
vexor config:edit`;

const envCode = `# List all environment variables
vexor env:list

# Get a variable
vexor env:get DATABASE_URL

# Set a variable
vexor env:set DATABASE_URL postgres://localhost/myapp

# Create .env from .env.example
vexor env:init

# Compare .env with .env.example
vexor env:diff

# Validate required variables
vexor env:validate`;

const openapiCode = `# Generate OpenAPI spec from routes
vexor openapi

# Custom output file
vexor openapi -o api-docs.json

# YAML format
vexor openapi -f yaml

# Validate existing spec
vexor openapi:validate`;

const devCode = `# Start development server
vexor dev

# Custom port
vexor dev -p 8080

# Build for production
vexor build

# Build for edge runtime
vexor build --target edge`;

const diagnosticsCode = `# Show system information
vexor info

# Check for common issues
vexor doctor

# Show help
vexor help

# Check for updates
vexor upgrade --check`;

export default function CLIPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Vexor CLI
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400">
          A comprehensive command-line tool for project scaffolding, code generation,
          configuration management, and development utilities.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { name: 'Installation', href: '#installation' },
          { name: 'Create Project', href: '#new' },
          { name: 'Generate Code', href: '#generate' },
          { name: 'Integrations', href: '#add' },
          { name: 'Database', href: '#db' },
          { name: 'Configuration', href: '#config' },
          { name: 'Environment', href: '#env' },
          { name: 'Diagnostics', href: '#diagnostics' }
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-xs sm:text-sm text-slate-900 dark:text-white"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Installation */}
      <section id="installation">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Installation
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Install the CLI globally or use it with npx for one-off commands.
        </p>
        <CodeBlock code={installCode} language="bash" showLineNumbers />
      </section>

      {/* New Project */}
      <section id="new">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Create a New Project
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Scaffold a new Vexor project with interactive prompts or command-line options.
        </p>
        <CodeBlock code={newProjectCode} language="bash" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Available Templates
          </h3>
          <div className="space-y-2">
            {[
              { name: 'api', desc: 'Full REST API with authentication and database' },
              { name: 'minimal', desc: 'Minimal setup with just the essentials' },
              { name: 'microservice', desc: 'Health checks, tracing, and circuit breakers' },
              { name: 'websocket', desc: 'Real-time WebSocket server with rooms' }
            ].map((t) => (
              <div key={t.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <code className="text-vexor-400 text-sm font-medium">{t.name}</code>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generate */}
      <section id="generate">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Code Generation
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Generate modules, models, routes, and migrations with a single command.
        </p>
        <CodeBlock code={generateCode} language="bash" showLineNumbers />

        <div className="mt-6 p-3 sm:p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-vexor-400">Tip:</strong> Running{' '}
            <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">vexor g module users</code>{' '}
            creates a complete module with routes, service, schema, and tests.
          </p>
        </div>
      </section>

      {/* Add Integrations */}
      <section id="add">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Add Integrations
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Quickly add popular integrations with automatic package installation and configuration.
        </p>
        <CodeBlock code={addCode} language="bash" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Available Integrations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { name: 'prisma', desc: 'Prisma ORM, schema file' },
              { name: 'redis', desc: 'Redis client setup' },
              { name: 'vitest', desc: 'Testing framework' },
              { name: 'docker', desc: 'Docker configuration' },
              { name: 'eslint', desc: 'ESLint + Prettier' },
              { name: 'github', desc: 'GitHub Actions CI/CD' },
              { name: 'swagger', desc: 'Swagger UI, OpenAPI' },
              { name: 'sentry', desc: 'Error tracking' }
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <code className="text-vexor-400 text-xs sm:text-sm font-medium">{t.name}</code>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Database Commands */}
      <section id="db">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Database Commands
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Manage database migrations, seeds, and resets.
        </p>
        <CodeBlock code={dbCode} language="bash" showLineNumbers />
      </section>

      {/* Configuration */}
      <section id="config">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Configuration Management
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Manage CLI settings at both global and project level.
        </p>
        <CodeBlock code={configCode} language="bash" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Available Settings
          </h3>
          <div className="space-y-2">
            {[
              { key: 'defaultTemplate', desc: 'Default project template', def: 'api' },
              { key: 'defaultPackageManager', desc: 'Package manager to use', def: 'npm' },
              { key: 'telemetry', desc: 'Enable anonymous telemetry', def: 'true' },
              { key: 'colors', desc: 'Enable colored output', def: 'true' }
            ].map((s) => (
              <div key={s.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <code className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{s.key}</code>
                <span className="text-xs text-slate-500">{s.desc}</span>
                <span className="text-xs text-vexor-400 sm:ml-auto">default: {s.def}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environment */}
      <section id="env">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Environment Management
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Manage .env files with validation and comparison tools.
        </p>
        <CodeBlock code={envCode} language="bash" showLineNumbers />
      </section>

      {/* OpenAPI */}
      <section id="openapi">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          OpenAPI Generation
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Generate OpenAPI/Swagger documentation from your route definitions.
        </p>
        <CodeBlock code={openapiCode} language="bash" showLineNumbers />
      </section>

      {/* Development */}
      <section id="dev">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Development Commands
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Start development server and build for production.
        </p>
        <CodeBlock code={devCode} language="bash" showLineNumbers />
      </section>

      {/* Diagnostics */}
      <section id="diagnostics">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
          Diagnostics & Support
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
          Check system information, diagnose issues, and get help.
        </p>
        <CodeBlock code={diagnosticsCode} language="bash" showLineNumbers />
      </section>

      {/* Command Reference */}
      <section className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-900 dark:text-white">
          Quick Reference
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2 text-vexor-400">Project</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><code>vexor new [name]</code></li>
              <li><code>vexor generate &lt;type&gt; &lt;name&gt;</code></li>
              <li><code>vexor add [integration]</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-vexor-400">Database</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><code>vexor db:migrate</code></li>
              <li><code>vexor db:rollback</code></li>
              <li><code>vexor db:status</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-vexor-400">Config & Env</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><code>vexor config:list</code></li>
              <li><code>vexor env:init</code></li>
              <li><code>vexor env:validate</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-vexor-400">Development</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><code>vexor dev</code></li>
              <li><code>vexor build</code></li>
              <li><code>vexor doctor</code></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
