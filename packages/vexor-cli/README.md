# @vexorjs/cli

A comprehensive command-line tool for the Vexor framework - project scaffolding, code generation, configuration management, and development utilities.

## Installation

```bash
npm install -g @vexorjs/cli
```

Or use with npx:

```bash
npx @vexorjs/cli new my-app
```

## Quick Start

```bash
# Create a new project (interactive mode)
vexor new

# Create with specific template
vexor new my-app -t api

# Start development
cd my-app
vexor dev
```

## Commands

### Project Creation

```bash
# Interactive project creation
vexor new

# Create with name
vexor new my-app

# Use specific template
vexor new my-app --template api          # REST API with auth & database
vexor new my-app --template minimal      # Minimal setup
vexor new my-app --template microservice # With health checks & tracing
vexor new my-app --template websocket    # Real-time WebSocket server

# Quick creation with defaults
vexor new my-app -y

# Specify package manager
vexor new my-app -p pnpm
```

### Code Generation

```bash
# Generate a complete module (routes, service, schema)
vexor generate module users
vexor g module products

# Generate a database model
vexor generate model User name:string email:string:unique

# Generate a route handler
vexor generate route products

# Generate a migration
vexor generate migration create_posts_table
```

### Add Integrations

```bash
# Interactive integration selection
vexor add

# Add specific integration
vexor add prisma      # Prisma ORM
vexor add redis       # Redis caching
vexor add vitest      # Unit testing
vexor add docker      # Docker setup
vexor add eslint      # ESLint + Prettier
vexor add github      # GitHub Actions CI/CD
vexor add swagger     # Swagger/OpenAPI docs
vexor add sentry      # Error tracking
vexor add graphql     # GraphQL endpoint + GraphiQL playground

# List available integrations (built-in + custom)
vexor add:list
```

#### Custom integrations

Extend the registry without forking the CLI. Drop a JSON file in
`.vexor/integrations/` at the project root:

```json
// .vexor/integrations/pino.json
{
  "key": "pino",
  "name": "Pino logger",
  "description": "Fast structured logger",
  "packages": { "dependencies": ["pino"] },
  "files": {
    "src/lib/logger.ts": "import pino from 'pino';\nexport const logger = pino();\n"
  },
  "scripts": { "log": "pino-pretty < server.log" }
}
```

Now `vexor add pino` works. Or register programmatically:

```ts
import { registerIntegration } from '@vexorjs/cli';

registerIntegration('pino', {
  name: 'Pino',
  description: 'Fast logger',
  packages: { dependencies: ['pino'] },
});
```

Precedence: project-local → runtime-registered → built-in.

### Database Commands

```bash
vexor db:migrate      # Run pending migrations
vexor db:rollback     # Rollback last migration
vexor db:rollback -s 3 # Rollback 3 migrations
vexor db:status       # Show migration status
vexor db:seed         # Run database seeders
vexor db:reset        # Reset database completely
```

### Configuration Management

```bash
vexor config:list              # List all config values
vexor config:list --global     # List global config only
vexor config:get <key>         # Get a specific value
vexor config:set <key> <value> # Set a value
vexor config:reset             # Reset all config
vexor config:edit              # Open in editor
vexor config:init              # Create config file
vexor config:path              # Show config file path
```

### Environment Management

```bash
vexor env:list        # List all env variables
vexor env:get <key>   # Get a variable
vexor env:set <key> <value>  # Set a variable
vexor env:remove <key>       # Remove a variable
vexor env:init        # Create .env from .env.example
vexor env:diff        # Compare .env with .env.example
vexor env:validate    # Validate required variables
vexor env:check       # Validate .env against env.schema.json
```

#### Schema-based env validation

Create `env.schema.json` at the project root:

```json
{
  "DATABASE_URL":   { "type": "url",     "required": true },
  "PORT":           { "type": "integer", "required": true, "min": 1, "max": 65535 },
  "NODE_ENV":       { "type": "enum", "values": ["development", "production", "test"], "default": "development" },
  "JWT_SECRET":     { "type": "string", "required": true, "minLength": 32 },
  "ENABLE_FEATURE": { "type": "boolean", "default": false }
}
```

Then `vexor env:check` validates your `.env` against it (types: `string`, `integer`, `number`, `boolean`, `url`, `email`, `enum`, plus `required` / `default` / `min`/`max` / `minLength`/`maxLength` / `pattern`). Exits non-zero on failure — perfect for CI gates.

### OpenAPI/Swagger

```bash
vexor openapi                     # Generate OpenAPI spec
vexor openapi -o api-docs.json    # Custom output file
vexor openapi -f yaml             # YAML format
vexor openapi:validate            # Validate existing spec
```

### Development

```bash
vexor dev                    # Start dev server with hot reload
vexor dev -p 8080            # Custom port
vexor dev -e src/server.ts   # Custom entry file

vexor build                  # Build for production
vexor build --target edge    # Build for edge runtime
vexor build --minify         # Minify output
```

### Testing

```bash
vexor test               # Run the test suite (auto-detects runner)
vexor test --watch       # Watch mode
vexor test --coverage    # Collect coverage
vexor test --ui          # Open vitest UI
vexor test users.test.ts # Pattern / file filter
```

Detection order: `vitest` → `jest` → `mocha` → `node --test` → `npm test` script. Detected from `devDependencies`, then `scripts.test`, then defaults to `node --test test/ tests/ src/`.

### Diagnostics

```bash
vexor info      # Show system and project information
vexor doctor    # Check for common issues
```

### Support

```bash
vexor help              # Show help overview
vexor help <topic>      # Detailed help (new, generate, add, config, env, db)
vexor upgrade           # Check for and install updates
vexor upgrade --check   # Only check, don't install
vexor docs              # Open documentation in browser
vexor feedback          # Report issues
vexor feedback --bug    # Report a bug
vexor changelog         # Show recent changes
```

## Configuration

The CLI supports both global and local configuration:

- **Global config**: `~/.vexorrc` - Applied to all projects
- **Local config**: `.vexorrc.json` - Project-specific settings

### Available Settings

| Key | Description | Default |
|-----|-------------|---------|
| `defaultTemplate` | Default project template | `api` |
| `defaultPackageManager` | Package manager to use | `npm` |
| `telemetry` | Enable anonymous telemetry | `true` |
| `updateCheck` | Check for CLI updates | `true` |
| `editor` | Preferred code editor | System default |
| `colors` | Enable colored output | `true` |

## Project Templates

| Template | Description |
|----------|-------------|
| `api` | Full REST API with authentication, database, validation |
| `minimal` | Minimal setup with just the essentials |
| `microservice` | With health checks, tracing, circuit breakers |
| `websocket` | Real-time WebSocket server with rooms & pub/sub |

## Integrations

Built-in:

| Integration | What it adds |
|-------------|--------------|
| `prisma` | Prisma ORM, schema file, migration scripts |
| `redis` | Redis client setup and configuration |
| `vitest` | Vitest testing framework with coverage |
| `docker` | Dockerfile, docker-compose.yml, .dockerignore |
| `eslint` | ESLint + Prettier configuration |
| `github` | GitHub Actions CI/CD workflows |
| `swagger` | Swagger UI and OpenAPI documentation |
| `sentry` | Sentry error tracking integration |
| `graphql` | GraphQL endpoint with GraphiQL playground |

Pluggable: add custom integrations by dropping JSON in `.vexor/integrations/` or by calling `registerIntegration()` — see [Add Integrations](#add-integrations) above.

## Documentation

- [Vexor Documentation](https://vexorjs.dev/docs)
- [GitHub Repository](https://github.com/sitharaj88/vexorjs)
- [Report Issues](https://github.com/sitharaj88/vexorjs/issues)

## License

MIT - Created by [Sitharaj Seenivasan](https://sitharaj.in)
