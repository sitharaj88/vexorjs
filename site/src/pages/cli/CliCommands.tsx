import CodeBlock from '../../components/CodeBlock';

const newProjectCode = `# Create new project with default template
vexor new my-app

# Specify template
vexor new my-app --template api
vexor new my-app --template fullstack
vexor new my-app --template minimal

# With options
vexor new my-app --database postgres --orm
vexor new my-app --git --install`;

const generateCode = `# Generate a module (routes + handlers + schemas)
vexor generate module users
vexor g module posts

# Generate a model (table definition + migration)
vexor generate model User name:string email:string:unique
vexor g model Post title:string content:text authorId:integer:references:users

# Generate migration
vexor generate migration add_users_table

# Generate middleware
vexor generate middleware auth`;

const databaseCode = `# Run all pending migrations
vexor db:migrate

# Rollback last migration
vexor db:rollback

# Rollback all migrations
vexor db:rollback --all

# Check migration status
vexor db:status

# Generate migration from schema changes
vexor db:migration:generate

# Seed the database
vexor db:seed

# Reset database (rollback all + migrate + seed)
vexor db:reset`;

const devCode = `# Start development server
vexor dev

# With options
vexor dev --port 4000
vexor dev --host 0.0.0.0
vexor dev --debug`;

const buildCode = `# Build for production
vexor build

# Build with specific target
vexor build --target node
vexor build --target bun
vexor build --target edge`;

const openapiCode = `# Generate OpenAPI spec
vexor openapi

# Output to file
vexor openapi --output openapi.json

# Start OpenAPI UI server
vexor openapi --serve`;

export default function CliCommands() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="commands" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          CLI Commands
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Complete reference for all Vexor CLI commands.
        </p>
      </div>

      <section>
        <h2 id="new" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor new
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a new Vexor project with scaffolding.
        </p>
        <CodeBlock code={newProjectCode} language="bash" />
      </section>

      <section>
        <h2 id="generate" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor generate
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Generate code for modules, models, migrations, and more.
        </p>
        <CodeBlock code={generateCode} language="bash" />
      </section>

      <section>
        <h2 id="database" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor db:*
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Database management commands.
        </p>
        <CodeBlock code={databaseCode} language="bash" />
      </section>

      <section>
        <h2 id="dev" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor dev
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start the development server with hot reload.
        </p>
        <CodeBlock code={devCode} language="bash" />
      </section>

      <section>
        <h2 id="build" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor build
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Build the application for production.
        </p>
        <CodeBlock code={buildCode} language="bash" />
      </section>

      <section>
        <h2 id="openapi" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          vexor openapi
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Generate OpenAPI specification from your routes.
        </p>
        <CodeBlock code={openapiCode} language="bash" />
      </section>

      {/* Command Reference Table */}
      <section>
        <h2 id="reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Reference
        </h2>
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
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor new &lt;name&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Create new project</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor generate</code></td>
                <td className="py-3 px-4"><code>g</code></td>
                <td className="py-3 px-4">Generate code</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor dev</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Start dev server</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor build</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Build for production</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor db:migrate</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Run migrations</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor db:rollback</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Rollback migration</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>vexor db:seed</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Seed database</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code>vexor openapi</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Generate OpenAPI spec</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
