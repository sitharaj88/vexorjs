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

# List available integrations
vexor add:list
```

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
```

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

## Documentation

- [Vexor Documentation](https://vexorjs.dev/docs)
- [GitHub Repository](https://github.com/sitharaj88/vexorjs)
- [Report Issues](https://github.com/sitharaj88/vexorjs/issues)

## License

MIT - Created by [Sitharaj Seenivasan](https://sitharaj.in)
