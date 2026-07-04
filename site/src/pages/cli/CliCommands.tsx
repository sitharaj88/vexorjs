import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

/* ── Code examples ─────────────────────────────────────────────── */

const newCode = `# The npm way — no global install needed (wraps \`vexor new\`)
npm create vexor@latest my-app

# Interactive mode (prompts for all options)
vexor new my-app

# Non-interactive with all options
vexor new my-app --template api --package-manager pnpm --yes

# Available templates
vexor new my-app --template api          # Full REST API with auth, DB, validation
vexor new my-app --template minimal      # Bare essentials, single entry point
vexor new my-app --template microservice # Health probes, tracing, circuit breaker, Docker
vexor new my-app --template websocket    # WebSocket rooms, SSE, event bus, test client

# Skip steps
vexor new my-app --no-git      # Skip git init
vexor new my-app --no-install  # Skip dependency installation`;

const generateModuleCode = `# Generate a full CRUD module
vexor generate module users

# This creates:
#   src/modules/users/users.routes.ts   — GET, POST, PUT, DELETE handlers
#   src/modules/users/users.service.ts  — Business logic (findAll, findById, create, update, delete)
#   src/modules/users/users.schema.ts   — Request/response validation schemas
#   src/modules/users/index.ts          — Barrel export

# Custom output directory
vexor generate module products --directory src/features

# Shorthand alias
vexor g module orders`;

const generateModelCode = `# Generate a model with column definitions
vexor generate model User name:string email:string:unique active:boolean:notNull

# Column format: <name>:<type>[:<option>]
# Available types:
#   string, text, number, int, integer, bigint, float, double, decimal,
#   boolean, bool, date, datetime, timestamp, json, jsonb, uuid
#
# Available options:
#   notNull, unique, primary

# More examples
vexor generate model Post title:string content:text authorId:integer:notNull
vexor generate model Setting key:string:unique value:json

# Custom directory
vexor g model Comment body:text --directory src/db`;

const generateOtherCode = `# Generate a timestamped migration
vexor generate migration add_posts_table
# Creates: src/db/migrations/1708901234567_add_posts_table.ts
# Template includes up() and down() functions with SQL placeholders

# Generate a route handler
vexor generate route health
# Creates: src/routes/health.ts with GET handler boilerplate

# Generate a service class
vexor generate service notification
# Creates: src/services/notification.service.ts
# Includes: findAll(), findById(), create(), update(), delete() methods`;

const addCode = `# Interactive selection from all integrations
vexor add

# Install a specific integration
vexor add prisma     # Prisma ORM: schema.prisma, generate/push/studio scripts
vexor add redis      # Redis: ioredis client with connection helper
vexor add vitest     # Testing: vitest config, coverage, UI mode
vexor add docker     # Docker: multi-stage Dockerfile, docker-compose with PostgreSQL
vexor add eslint     # Linting: ESLint + Prettier with TypeScript rules
vexor add github     # CI/CD: GitHub Actions workflows for test, lint, build, release
vexor add swagger    # Docs: swagger-ui-express with OpenAPI spec template
vexor add sentry     # Monitoring: Sentry error tracking with initialization

# List all available integrations
vexor add:list`;

const dbMigrateCode = `# Run all pending migrations
vexor db:migrate

# Check migration status (applied vs pending)
vexor db:status

# Example output:
# ┌─────────────────────────────────────┬──────────┐
# │ Migration                           │ Status   │
# ├─────────────────────────────────────┼──────────┤
# │ 1708901234567_create_users_table    │ Applied  │
# │ 1708901234890_add_posts_table       │ Applied  │
# │ 1708901235123_add_comments_table    │ Pending  │
# └─────────────────────────────────────┴──────────┘`;

const dbRollbackCode = `# Rollback the last migration
vexor db:rollback

# Rollback the last 3 migrations
vexor db:rollback --steps 3

# Rollback ALL migrations (returns to empty schema)
vexor db:rollback --steps 0`;

const dbSeedResetCode = `# Run all seeders from src/db/seeders/
vexor db:seed

# Reset database: rollback all → re-migrate → re-seed
vexor db:reset`;

const dbDiffCode = `# Diff your schema against the saved snapshot and generate a migration
vexor db:diff --schema src/db/schema.ts --dialect postgres

# Output:
#   ✅ Wrote 20260704120000_auto.ts (3 up statement(s))
#   ✅ Updated schema.snapshot.json — commit both files

# Name the migration and choose the output directory
vexor db:diff --name add_posts --out src/db/migrations

# SQLite and MySQL dialects
vexor db:diff --dialect sqlite
vexor db:diff --dialect mysql`;

const devCode = `# Start with defaults (port 3000, localhost, src/index.ts)
vexor dev

# Custom port and host
vexor dev --port 4000 --host 0.0.0.0

# Custom entry file
vexor dev --entry src/server.ts`;

const buildCode = `# Default: build for Node.js
vexor build

# Build for a specific runtime
vexor build --target node    # Node.js 20 (default)
vexor build --target bun     # Bun runtime
vexor build --target edge    # Edge/Cloudflare (ES2022)

# Custom output and minification
vexor build --output build --minify`;

const openapiCode = `# Generate OpenAPI spec from route definitions
vexor openapi

# Custom output file and format
vexor openapi --output api-spec.yaml --format yaml

# Override API metadata
vexor openapi --title "My API" --version 2.0.0 --server https://api.example.com

# Validate an existing spec
vexor openapi:validate openapi.json`;

const configCode = `# Initialize config file with defaults
vexor config:init

# List all config values
vexor config:list

# Get/set individual values
vexor config:get defaultTemplate
vexor config:set defaultPackageManager pnpm

# Global config (applies to all projects)
vexor config:set defaultPackageManager pnpm --global

# Reset config to defaults
vexor config:reset

# Open config in your editor
vexor config:edit`;

const envCode = `# Create .env from .env.example (or generate defaults)
vexor env:init

# Manage variables
vexor env:list
vexor env:get DATABASE_URL
vexor env:set JWT_SECRET my-secret-key
vexor env:remove OLD_VARIABLE

# Compare .env with .env.example
vexor env:diff
# Shows: missing variables, extra variables

# Validate required variables and formats
vexor env:validate
# Checks: NODE_ENV, PORT required
# Warns: empty values, short JWT_SECRET, invalid DATABASE_URL format`;

const diagnosticsCode = `# System and project information
vexor info
# Shows: OS, Node.js, npm, package manager, Vexor versions, CPU, memory

# Project health checks
vexor doctor
# Checks: Node >= 20, package manager, package.json, @vexorjs/core,
#          TypeScript, tsconfig.json, src/index.ts, .env file, git repo

# Check for CLI updates
vexor upgrade --check

# Install latest CLI version
vexor upgrade

# Open documentation
vexor docs            # Main docs
vexor docs routing    # Specific topic

# Report issues
vexor feedback
vexor feedback --bug  # Bug report template

# Release notes
vexor changelog`;

/* ── Component ─────────────────────────────────────────────────── */

export default function CliCommands() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="commands" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          CLI Commands
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Complete reference for every Vexor CLI command. Each command includes a description of what it does, all available options with defaults, and practical usage examples.
        </p>
      </div>

      {/* Quick reference */}
      <section>
        <h2 id="quick-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A summary of all top-level commands. Click any command name to jump to its detailed documentation below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Command</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Alias</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['vexor new <name>', 'create, init', 'Create a new project from a template'],
                ['vexor generate <type> <name>', 'g', 'Generate modules, models, migrations, routes, services'],
                ['vexor add [integration]', 'install', 'Add pre-configured integrations (Docker, Prisma, etc.)'],
                ['vexor dev', '—', 'Start development server with hot reload'],
                ['vexor build', '—', 'Build application for production'],
                ['vexor db:migrate', '—', 'Run pending database migrations'],
                ['vexor db:rollback', '—', 'Rollback migrations'],
                ['vexor db:status', '—', 'Show migration status'],
                ['vexor db:seed', '—', 'Run database seeders'],
                ['vexor db:reset', '—', 'Rollback all, re-migrate, re-seed'],
                ['vexor db:diff', '—', 'Generate a migration from schema changes (auto-migration)'],
                ['vexor openapi', '—', 'Generate OpenAPI spec from routes'],
                ['vexor config:*', '—', 'Manage project and global configuration'],
                ['vexor env:*', '—', 'Manage environment variables'],
                ['vexor info', '—', 'Show system and project information'],
                ['vexor doctor', '—', 'Run project health checks'],
                ['vexor upgrade', '—', 'Check for and install CLI updates'],
                ['vexor help [topic]', '—', 'Show help for a command group'],
                ['vexor docs [topic]', '—', 'Open documentation in browser'],
                ['vexor changelog', 'whatsnew', 'Show release notes'],
              ].map(([cmd, alias, desc]) => (
                <tr key={cmd} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2.5 px-4"><code className="text-xs">{cmd}</code></td>
                  <td className="py-2.5 px-4 text-slate-500"><code className="text-xs">{alias}</code></td>
                  <td className="py-2.5 px-4">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── vexor new ───────────────────────────────────────────── */}
      <section>
        <h2 id="new" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor new
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The quickest way to scaffold a project is{' '}
          <code className="prose-code">npm create vexor@latest my-app</code> — the{' '}
          <code className="prose-code">create-vexor</code> package is a thin wrapper that delegates
          to <code className="prose-code">vexor new</code>, so no global CLI install is needed and
          the templates (<code className="prose-code">api</code>, <code className="prose-code">minimal</code>,{' '}
          <code className="prose-code">microservice</code>, <code className="prose-code">websocket</code>)
          live in exactly one place. Everything after the project name is forwarded, e.g.{' '}
          <code className="prose-code">npm create vexor@latest my-app -- --template minimal</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a new Vexor project from a template. By default, the command runs in interactive mode — it prompts you to choose a project name, template, package manager, and whether to initialize git and install dependencies. All prompts can be bypassed with flags for scripted or CI usage.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CLI validates the project name (alphanumeric characters, hyphens, and underscores only, max 214 characters) and checks that the target directory doesn't already exist. After scaffolding, it substitutes template variables like <code className="prose-code">{'{{name}}'}</code> and <code className="prose-code">{'{{year}}'}</code> in generated files.
        </p>
        <CodeBlock code={newCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-t, --template</code></td>
                <td className="py-3 px-4"><code>api</code></td>
                <td className="py-3 px-4">Project template: <code>api</code>, <code>minimal</code>, <code>microservice</code>, <code>websocket</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-p, --package-manager</code></td>
                <td className="py-3 px-4">auto-detect</td>
                <td className="py-3 px-4">Package manager: <code>npm</code>, <code>yarn</code>, <code>pnpm</code>, <code>bun</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--no-git</code></td>
                <td className="py-3 px-4"><code>false</code></td>
                <td className="py-3 px-4">Skip git repository initialization</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--no-install</code></td>
                <td className="py-3 px-4"><code>false</code></td>
                <td className="py-3 px-4">Skip dependency installation</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">-y, --yes</code></td>
                <td className="py-3 px-4"><code>false</code></td>
                <td className="py-3 px-4">Skip all prompts, use defaults</td>
              </tr>
            </tbody>
          </table>
        </div>

        <InfoBlock variant="tip" >
          The CLI auto-detects your preferred package manager by looking for lock files: <code className="prose-code">bun.lockb</code>, <code className="prose-code">pnpm-lock.yaml</code>, <code className="prose-code">yarn.lock</code>, or <code className="prose-code">package-lock.json</code>. If none are found, it defaults to npm.
        </InfoBlock>
      </section>

      {/* ── vexor generate ──────────────────────────────────────── */}
      <section>
        <h2 id="generate" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor generate
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Scaffolds code for common application components. The generator creates files with full TypeScript types, follows Vexor naming conventions, and places them in the standard project directory structure. You can override the output directory with the <code className="prose-code">-d, --directory</code> flag on any generator.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Module Generator</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The module generator is the most comprehensive — it creates a complete feature with routes, service layer, and validation schemas. The generated routes include GET (list and detail), POST (create), PUT (update), and DELETE handlers. The service includes corresponding business logic methods. This is the recommended way to add new features to your application.
        </p>
        <CodeBlock code={generateModuleCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Model Generator</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The model generator creates a database model file with typed column definitions. Columns are specified using the <code className="prose-code">name:type:option</code> format. The generator maps these to Vexor ORM column types and adds the appropriate constraints. The model automatically includes <code className="prose-code">id</code>, <code className="prose-code">createdAt</code>, and <code className="prose-code">updatedAt</code> columns.
        </p>
        <CodeBlock code={generateModelCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Migration, Route &amp; Service Generators</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These generators create individual files for specific purposes. Migrations are timestamped automatically to ensure ordering. Routes include a basic GET handler. Services include CRUD method stubs.
        </p>
        <CodeBlock code={generateOtherCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Generator Types Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Files Created</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default Directory</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">module</code></td>
                <td className="py-3 px-4">routes, service, schema, index</td>
                <td className="py-3 px-4"><code>src/modules/</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">model</code></td>
                <td className="py-3 px-4">model definition with columns</td>
                <td className="py-3 px-4"><code>src/db/</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">migration</code></td>
                <td className="py-3 px-4">timestamped up/down migration</td>
                <td className="py-3 px-4"><code>src/db/migrations/</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">route</code></td>
                <td className="py-3 px-4">route handler</td>
                <td className="py-3 px-4"><code>src/routes/</code></td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">service</code></td>
                <td className="py-3 px-4">service class with CRUD stubs</td>
                <td className="py-3 px-4"><code>src/services/</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── vexor add ───────────────────────────────────────────── */}
      <section>
        <h2 id="add" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor add
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Installs pre-configured integrations into your project. Each integration adds dependencies, creates configuration files, and adds npm scripts — everything needed to start using the tool immediately. Running <code className="prose-code">vexor add</code> without an argument opens an interactive menu.
        </p>
        <CodeBlock code={addCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Integration Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Integration</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Packages Installed</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Files Created</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Scripts Added</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">prisma</code></td>
                <td className="py-3 px-4">@prisma/client, prisma</td>
                <td className="py-3 px-4">prisma/schema.prisma</td>
                <td className="py-3 px-4">db:generate, db:push, db:studio</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">redis</code></td>
                <td className="py-3 px-4">ioredis, @types/ioredis</td>
                <td className="py-3 px-4">src/lib/redis.ts</td>
                <td className="py-3 px-4">—</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">vitest</code></td>
                <td className="py-3 px-4">vitest, @vitest/coverage-v8, @vitest/ui</td>
                <td className="py-3 px-4">vitest.config.ts, example test</td>
                <td className="py-3 px-4">test, test:ui, test:coverage</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">docker</code></td>
                <td className="py-3 px-4">—</td>
                <td className="py-3 px-4">Dockerfile, .dockerignore, docker-compose.yml</td>
                <td className="py-3 px-4">docker:build, docker:run, docker:compose</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">eslint</code></td>
                <td className="py-3 px-4">eslint, @typescript-eslint/*, prettier</td>
                <td className="py-3 px-4">eslint.config.js, .prettierrc</td>
                <td className="py-3 px-4">lint, lint:fix, format</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">github</code></td>
                <td className="py-3 px-4">—</td>
                <td className="py-3 px-4">.github/workflows/ci.yml, release.yml</td>
                <td className="py-3 px-4">—</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">swagger</code></td>
                <td className="py-3 px-4">swagger-ui-express</td>
                <td className="py-3 px-4">src/openapi.ts</td>
                <td className="py-3 px-4">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">sentry</code></td>
                <td className="py-3 px-4">@sentry/node</td>
                <td className="py-3 px-4">src/lib/sentry.ts</td>
                <td className="py-3 px-4">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Database ────────────────────────────────────────────── */}
      <section>
        <h2 id="database" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Commands
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">db:*</code> commands manage your database lifecycle. They work with Vexor ORM migrations stored in <code className="prose-code">src/db/migrations/</code> and seeders in <code className="prose-code">src/db/seeders/</code>. Migrations are applied in timestamp order and tracked so the CLI knows which ones have already run.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">db:migrate &amp; db:status</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">db:migrate</code> command runs all pending migrations in order. The <code className="prose-code">db:status</code> command shows a table of all migrations with their applied/pending status, which is useful for verifying the state of your database before deploying.
        </p>
        <CodeBlock code={dbMigrateCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">db:rollback</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Rolls back applied migrations. By default, it rolls back the most recent migration. Use <code className="prose-code">--steps</code> to rollback multiple migrations at once. Setting steps to 0 rolls back all migrations, returning the database to an empty schema.
        </p>
        <CodeBlock code={dbRollbackCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">db:seed &amp; db:reset</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">db:seed</code> command runs all seeder files in <code className="prose-code">src/db/seeders/</code> to populate your database with test data. The <code className="prose-code">db:reset</code> command is a convenience that runs rollback-all, migrate, and seed in sequence — effectively rebuilding your database from scratch.
        </p>
        <CodeBlock code={dbSeedResetCode} language="bash" />
        <InfoBlock variant="danger" >
          <code className="prose-code">db:reset</code> destroys all data in your database. Only use it in development or test environments. In production, use <code className="prose-code">db:migrate</code> to apply incremental changes.
        </InfoBlock>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">db:diff</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Generates a migration <strong>automatically from schema changes</strong>. The command
          loads your schema module (any exports created with <code className="prose-code">table()</code>),
          diffs it against the saved snapshot at{' '}
          <code className="prose-code">schema.snapshot.json</code> in the migrations directory, and
          — when there are changes — writes a timestamped migration file with up/down SQL and
          updates the snapshot. On the first run (no snapshot yet) every table is generated as a{' '}
          <code className="prose-code">CREATE TABLE</code>. Commit the migration and the snapshot
          together. See <Link to="/orm/migrations" className="text-primary-600 dark:text-primary-400 hover:underline">Auto-Migrations</Link>{' '}
          for how the diffing works.
        </p>
        <CodeBlock code={dbDiffCode} language="bash" />

        <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-6 mb-3">Options</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--schema</code></td>
                <td className="py-3 px-4"><code>src/db/schema.ts</code></td>
                <td className="py-3 px-4">Schema module exporting <code className="prose-code">table()</code> definitions. Without the flag, the CLI tries <code>src/db/schema.ts</code>, <code>src/db/schema.js</code>, <code>src/schema.ts</code>, <code>src/schema.js</code> in order.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--out</code></td>
                <td className="py-3 px-4"><code>src/db/migrations</code></td>
                <td className="py-3 px-4">Migrations directory. The generated migration file and <code className="prose-code">schema.snapshot.json</code> are written here.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--dialect</code></td>
                <td className="py-3 px-4"><code>postgres</code></td>
                <td className="py-3 px-4">SQL dialect for the generated statements: <code>postgres</code>, <code>sqlite</code>, or <code>mysql</code>. SQLite column alterations cannot be generated and are emitted as warnings.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">--name</code></td>
                <td className="py-3 px-4"><code>auto</code></td>
                <td className="py-3 px-4">Migration name suffix. The file is named <code className="prose-code">&lt;timestamp&gt;_&lt;name&gt;.ts</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <InfoBlock variant="tip" >
          <code className="prose-code">db:diff</code> requires <code className="prose-code">@vexorjs/orm</code> to be installed in your project — the CLI loads the diffing engine from your project's dependency tree, not its own.
        </InfoBlock>
      </section>

      {/* ── Dev & Build ─────────────────────────────────────────── */}
      <section>
        <h2 id="dev" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor dev
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Starts a development server with automatic hot reload. The CLI auto-detects which TypeScript runner is available on your system — it tries <code className="prose-code">tsx</code> first, then <code className="prose-code">ts-node</code>, and finally <code className="prose-code">bun</code>. The server sets <code className="prose-code">NODE_ENV=development</code> and handles graceful shutdown on SIGINT and SIGTERM signals.
        </p>
        <CodeBlock code={devCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-p, --port</code></td>
                <td className="py-3 px-4"><code>3000</code></td>
                <td className="py-3 px-4">Server port number</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-H, --host</code></td>
                <td className="py-3 px-4"><code>localhost</code></td>
                <td className="py-3 px-4">Server host address</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">-e, --entry</code></td>
                <td className="py-3 px-4"><code>src/index.ts</code></td>
                <td className="py-3 px-4">Application entry file</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="build" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor build
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Builds your application for production. The CLI auto-detects your build tool — it looks for <code className="prose-code">tsup</code>, then <code className="prose-code">esbuild</code>, then <code className="prose-code">rollup</code>. If none are installed, it falls back to tsup. The build generates JavaScript output with TypeScript declarations and targets Node.js 20 by default.
        </p>
        <CodeBlock code={buildCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-o, --output</code></td>
                <td className="py-3 px-4"><code>dist</code></td>
                <td className="py-3 px-4">Output directory</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--target</code></td>
                <td className="py-3 px-4"><code>node</code></td>
                <td className="py-3 px-4">Build target: <code>node</code> (Node.js 20), <code>bun</code>, <code>edge</code> (ES2022)</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">--minify</code></td>
                <td className="py-3 px-4"><code>false</code></td>
                <td className="py-3 px-4">Minify output for smaller bundle size</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── OpenAPI ─────────────────────────────────────────────── */}
      <section>
        <h2 id="openapi" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor openapi
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Generates an OpenAPI 3.0 specification from your route definitions. The CLI scans <code className="prose-code">src/routes/</code> for route files, extracts HTTP methods and paths using pattern matching, and produces a spec with operation IDs, tags, response schemas, and a Bearer JWT security scheme. Output can be JSON or YAML.
        </p>
        <CodeBlock code={openapiCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Flag</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-o, --output</code></td>
                <td className="py-3 px-4"><code>openapi.json</code></td>
                <td className="py-3 px-4">Output file path</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">-f, --format</code></td>
                <td className="py-3 px-4"><code>json</code></td>
                <td className="py-3 px-4">Output format: <code>json</code> or <code>yaml</code></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--title</code></td>
                <td className="py-3 px-4">from package.json</td>
                <td className="py-3 px-4">API title in the spec</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">--version</code></td>
                <td className="py-3 px-4">from package.json</td>
                <td className="py-3 px-4">API version in the spec</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">--server</code></td>
                <td className="py-3 px-4">localhost:3000</td>
                <td className="py-3 px-4">Server URL to include in the spec</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The <code className="prose-code">openapi:validate</code> subcommand validates an existing OpenAPI spec file, checking for required fields (<code className="prose-code">openapi</code>, <code className="prose-code">info.title</code>, <code className="prose-code">info.version</code>), ensuring all paths have responses, and reporting version compatibility.
        </p>
      </section>

      {/* ── Config ──────────────────────────────────────────────── */}
      <section>
        <h2 id="config" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration Commands
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The CLI supports two configuration files: a <strong>local</strong> project config (<code className="prose-code">.vexorrc.json</code> in your project root) and a <strong>global</strong> config (<code className="prose-code">~/.vexorrc</code> in your home directory). Local config overrides global config. Configuration controls defaults like template choice, package manager, and CLI behavior.
        </p>
        <CodeBlock code={configCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Default Configuration</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Key</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">defaultTemplate</code></td>
                <td className="py-3 px-4"><code>api</code></td>
                <td className="py-3 px-4">Template used when <code className="prose-code">--yes</code> flag is passed</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">defaultPackageManager</code></td>
                <td className="py-3 px-4"><code>npm</code></td>
                <td className="py-3 px-4">Package manager fallback when auto-detect fails</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">telemetry</code></td>
                <td className="py-3 px-4"><code>true</code></td>
                <td className="py-3 px-4">Enable anonymous usage telemetry</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">updateCheck</code></td>
                <td className="py-3 px-4"><code>true</code></td>
                <td className="py-3 px-4">Check for CLI updates on startup</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">colors</code></td>
                <td className="py-3 px-4"><code>true</code></td>
                <td className="py-3 px-4">Enable colored CLI output</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Environment ─────────────────────────────────────────── */}
      <section>
        <h2 id="env" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Commands
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">env:*</code> commands manage your <code className="prose-code">.env</code> files. They provide a safer alternative to manually editing environment files — you can set, remove, and validate variables without risking syntax errors. The <code className="prose-code">env:diff</code> command is particularly useful for ensuring your <code className="prose-code">.env</code> stays in sync with <code className="prose-code">.env.example</code> as the project evolves.
        </p>
        <CodeBlock code={envCode} language="bash" />

        <InfoBlock variant="tip" >
          Run <code className="prose-code">vexor env:validate</code> in your CI pipeline to catch missing or malformed environment variables before deployment.
        </InfoBlock>
      </section>

      {/* ── Diagnostics ─────────────────────────────────────────── */}
      <section>
        <h2 id="diagnostics" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Diagnostics &amp; Utilities
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These commands help you troubleshoot issues, keep the CLI up to date, and access documentation. The <code className="prose-code">doctor</code> command is especially useful when setting up a project on a new machine — it verifies that all prerequisites are met and provides specific fix suggestions for any issues it finds.
        </p>
        <CodeBlock code={diagnosticsCode} language="bash" />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">Doctor Checks</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">vexor doctor</code> command runs the following health checks and reports pass/fail/warn for each:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">#</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Check</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Requirement</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ['1', 'Node.js version', '>= 20.0.0'],
                ['2', 'Package manager', 'npm, yarn, pnpm, or bun detected'],
                ['3', 'package.json', 'File exists in project root'],
                ['4', 'Vexor Core', '@vexorjs/core installed'],
                ['5', 'TypeScript', 'typescript installed'],
                ['6', 'tsconfig.json', 'TypeScript config file exists'],
                ['7', 'Entry file', 'src/index.ts exists'],
                ['8', 'Environment', '.env file exists (warns if missing)'],
                ['9', 'Git repository', 'git repo initialized (warns if not)'],
              ].map(([num, check, req]) => (
                <tr key={num} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-2.5 px-4">{num}</td>
                  <td className="py-2.5 px-4">{check}</td>
                  <td className="py-2.5 px-4">{req}</td>
                </tr>
              ))}
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
          Now that you know the CLI commands, explore the framework features they integrate with.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/getting-started" className="btn-primary">
            Getting Started <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/orm/migrations" className="btn-secondary">
            ORM Migrations
          </Link>
          <Link to="/advanced/deployment" className="btn-secondary">
            Deployment Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
