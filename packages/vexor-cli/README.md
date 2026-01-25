# @vexorjs/cli

Command-line tool for the Vexor framework - project scaffolding and code generation.

## Installation

```bash
npm install -g @vexorjs/cli
```

Or use with npx:

```bash
npx @vexorjs/cli new my-app
```

## Commands

### Create a new project

```bash
vexor new my-app
vexor new my-app --template api
vexor new my-app --template minimal
```

### Generate code

```bash
# Generate a module with routes, handlers, and services
vexor generate module users

# Generate a database model with fields
vexor generate model User name:string email:string:unique

# Generate a middleware
vexor generate middleware auth
```

### Database commands

```bash
# Run pending migrations
vexor db:migrate

# Rollback last migration
vexor db:rollback

# Generate a new migration
vexor db:generate create_posts_table
```

### Development

```bash
# Start development server with hot reload
vexor dev

# Build for production
vexor build

# Run production server
vexor start
```

### Utilities

```bash
# Generate OpenAPI specification
vexor openapi

# Run benchmarks
vexor benchmark

# Show help
vexor --help
```

## Documentation

Visit [github.com/sitharaj88/vexorjs](https://github.com/sitharaj88/vexorjs) for full documentation.

## License

MIT
