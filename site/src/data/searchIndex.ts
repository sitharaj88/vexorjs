export interface SearchEntry {
  path: string;
  title: string;
  section: string;
  keywords: string[];
  description: string;
}

const searchIndex: SearchEntry[] = [
  // Getting Started
  { path: '/getting-started', title: 'Introduction', section: 'Getting Started', keywords: ['intro', 'overview', 'about', 'what is vexor'], description: 'Introduction to the Vexor framework and its core philosophy.' },
  { path: '/installation', title: 'Installation', section: 'Getting Started', keywords: ['install', 'setup', 'npm', 'yarn', 'pnpm', 'bun'], description: 'Install Vexor and set up your development environment.' },
  { path: '/quick-start', title: 'Quick Start', section: 'Getting Started', keywords: ['quickstart', 'hello world', 'first app', 'tutorial', 'beginner'], description: 'Build your first Vexor application in 5 minutes.' },

  // Learn
  { path: '/learn', title: 'Learning Path', section: 'Learn', keywords: ['learn', 'learning path', 'tutorial', 'course', 'tracks', 'beginner', 'curriculum'], description: 'A structured learning path from your first API to production-grade systems.' },
  { path: '/learn/fundamentals', title: 'Fundamentals', section: 'Learn', keywords: ['fundamentals', 'http', 'rest', 'typescript', 'first api', 'json', 'crud', 'beginner', 'basics'], description: 'HTTP, TypeScript, and building your first CRUD API with Vexor.' },
  { path: '/learn/building-apis', title: 'Building APIs', section: 'Learn', keywords: ['building apis', 'authentication', 'jwt', 'database', 'error handling', 'validation', 'file uploads', 'testing', 'intermediate'], description: 'Authentication, database patterns, error handling, validation, and testing.' },
  { path: '/learn/architecture', title: 'Architecture & System Design', section: 'Learn', keywords: ['architecture', 'system design', 'microservices', 'event driven', 'caching', 'performance', 'scalability', 'advanced'], description: 'System design, microservices, event-driven architecture, caching, and performance.' },
  { path: '/learn/production', title: 'Production & DevOps', section: 'Learn', keywords: ['production', 'devops', 'docker', 'monitoring', 'security', 'ci cd', 'scaling', 'clustering', 'graceful shutdown', 'environment config'], description: 'Docker, CI/CD, monitoring, security hardening, scaling, and configuration.' },

  // Core Concepts
  { path: '/core-concepts', title: 'Core Concepts', section: 'Core Concepts', keywords: ['concepts', 'architecture', 'fundamentals'], description: 'Understand the fundamental building blocks of Vexor.' },
  { path: '/routing', title: 'Routing', section: 'Core Concepts', keywords: ['routes', 'router', 'path', 'params', 'wildcard', 'groups', 'http methods'], description: 'Define routes, parameters, wildcards, and route groups.' },
  { path: '/middleware', title: 'Middleware & Hooks', section: 'Core Concepts', keywords: ['hooks', 'lifecycle', 'preHandler', 'postHandler', 'onRequest', 'onResponse'], description: 'The hook-based middleware lifecycle in Vexor.' },
  { path: '/context', title: 'Context', section: 'Core Concepts', keywords: ['ctx', 'request', 'response', 'json', 'headers', 'cookies', 'query'], description: 'The request context object and its API.' },
  { path: '/validation', title: 'Validation', section: 'Core Concepts', keywords: ['schema', 'validate', 'typebox', 'type', 'body', 'params', 'query validation'], description: 'Schema-based request validation with TypeBox.' },

  // Middleware
  { path: '/middleware/rate-limiting', title: 'Rate Limiting', section: 'Middleware', keywords: ['rate limit', 'throttle', 'limit', 'window', 'sliding window', 'slow down', 'ddos'], description: 'Protect your API with configurable rate limiting strategies.' },
  { path: '/middleware/cors', title: 'CORS', section: 'Middleware', keywords: ['cors', 'cross origin', 'origin', 'access control', 'preflight'], description: 'Configure Cross-Origin Resource Sharing for your API.' },
  { path: '/middleware/compression', title: 'Compression', section: 'Middleware', keywords: ['compress', 'gzip', 'brotli', 'deflate', 'encoding'], description: 'Compress HTTP responses to reduce bandwidth.' },
  { path: '/middleware/static-files', title: 'Static Files', section: 'Middleware', keywords: ['static', 'serve static', 'assets', 'files', 'sendfile', 'etag', 'cache control', 'mime', 'public directory', 'index.html'], description: 'Serve static assets from disk with ETags, Cache-Control, and streaming.' },
  { path: '/middleware/upload', title: 'File Upload', section: 'Middleware', keywords: ['upload', 'file', 'multipart', 'form data', 'image', 'document'], description: 'Handle file uploads with validation and storage.' },
  { path: '/middleware/health', title: 'Health Checks', section: 'Middleware', keywords: ['health', 'healthcheck', 'liveness', 'readiness', 'status', 'monitoring'], description: 'Add health check endpoints for monitoring and orchestration.' },
  { path: '/middleware/versioning', title: 'API Versioning', section: 'Middleware', keywords: ['version', 'api version', 'v1', 'v2', 'header', 'path', 'deprecation'], description: 'Version your API using path, header, or query strategies.' },

  // Infrastructure
  { path: '/infrastructure/caching', title: 'Caching', section: 'Infrastructure', keywords: ['cache', 'memory', 'lru', 'redis', 'ttl', 'stale while revalidate'], description: 'Response caching with memory, LRU, and Redis stores.' },
  { path: '/infrastructure/logging', title: 'Logging', section: 'Infrastructure', keywords: ['log', 'logger', 'trace', 'debug', 'info', 'warn', 'error', 'fatal', 'transport'], description: 'Structured logging with multiple transports and levels.' },
  { path: '/infrastructure/dependency-injection', title: 'Dependency Injection', section: 'Infrastructure', keywords: ['di', 'container', 'inject', 'singleton', 'transient', 'scoped', 'factory', 'ioc'], description: 'Inversion of control with a powerful DI container.' },
  { path: '/infrastructure/plugins', title: 'Plugin System', section: 'Infrastructure', keywords: ['plugin', 'register', 'decorate', 'extend', 'module'], description: 'Extend Vexor with a composable plugin architecture.' },
  { path: '/infrastructure/config', title: 'Configuration', section: 'Infrastructure', keywords: ['config', 'env', 'environment', 'dotenv', '.env', 'settings', 'loader'], description: 'Load and validate configuration from files and environment.' },

  // Auth & Security
  { path: '/auth/authentication', title: 'Authentication', section: 'Auth & Security', keywords: ['auth', 'jwt', 'token', 'bearer', 'sign', 'verify', 'decode'], description: 'JWT-based authentication with signing and verification.' },
  { path: '/auth/sessions', title: 'Session Management', section: 'Auth & Security', keywords: ['session', 'cookie', 'store', 'regenerate', 'destroy'], description: 'Server-side session management with configurable stores.' },
  { path: '/auth/oauth', title: 'OAuth2 & Social Login', section: 'Auth & Security', keywords: ['oauth', 'oauth2', 'social login', 'google', 'github', 'discord', 'twitter', 'facebook', 'provider'], description: 'OAuth2 integration with popular social providers.' },
  { path: '/auth/security', title: 'Security Best Practices', section: 'Auth & Security', keywords: ['security', 'csrf', 'xss', 'headers', 'helmet', 'best practices'], description: 'Security hardening patterns and best practices.' },

  // Observability
  { path: '/observability/metrics', title: 'Metrics', section: 'Observability', keywords: ['metrics', 'counter', 'gauge', 'histogram', 'prometheus', 'monitoring'], description: 'Instrument your application with Prometheus-compatible metrics.' },
  { path: '/observability/tracing', title: 'Tracing', section: 'Observability', keywords: ['trace', 'tracing', 'span', 'opentelemetry', 'otlp', 'distributed'], description: 'Distributed tracing with OpenTelemetry-compatible spans.' },
  { path: '/observability/openapi', title: 'OpenAPI / Swagger', section: 'Observability', keywords: ['openapi', 'swagger', 'docs', 'api docs', 'specification', 'schema'], description: 'Auto-generate OpenAPI specs from your route definitions.' },

  // Vexor ORM
  { path: '/orm', title: 'ORM Overview', section: 'Vexor ORM', keywords: ['orm', 'database', 'sql', 'postgres', 'sqlite', 'mysql'], description: 'Overview of the Vexor ORM and supported databases.' },
  { path: '/orm/schema', title: 'Schema Definition', section: 'Vexor ORM', keywords: ['schema', 'table', 'column', 'type', 'define', 'model'], description: 'Define database schemas with type-safe column definitions.' },
  { path: '/orm/queries', title: 'Queries', section: 'Vexor ORM', keywords: ['query', 'select', 'insert', 'update', 'delete', 'where', 'join', 'aggregate', 'subquery'], description: 'Build type-safe queries with the fluent query builder.' },
  { path: '/orm/migrations', title: 'Migrations', section: 'Vexor ORM', keywords: ['migration', 'migrate', 'rollback', 'alter', 'create table', 'schema change'], description: 'Manage database schema changes with versioned migrations.' },
  { path: '/orm/relations', title: 'Relations', section: 'Vexor ORM', keywords: ['relation', 'hasOne', 'hasMany', 'belongsTo', 'manyToMany', 'foreign key'], description: 'Define and query relationships between tables.' },
  { path: '/orm/pooling', title: 'Connection Pooling', section: 'Vexor ORM', keywords: ['pool', 'connection', 'pooling', 'idle', 'max connections', 'acquire'], description: 'Manage database connections with configurable pooling.' },
  { path: '/orm/soft-deletes', title: 'Soft Deletes', section: 'Vexor ORM', keywords: ['soft delete', 'trash', 'restore', 'deleted_at', 'withTrashed', 'onlyTrashed'], description: 'Soft-delete records instead of permanently removing them.' },
  { path: '/orm/seeders', title: 'Seeders & Factories', section: 'Vexor ORM', keywords: ['seed', 'seeder', 'factory', 'fake', 'fixture', 'test data', 'faker'], description: 'Generate test data with factories and seeders.' },

  // Real-Time & Events
  { path: '/realtime/sse', title: 'Server-Sent Events', section: 'Real-Time & Events', keywords: ['sse', 'server sent events', 'event stream', 'push', 'real-time'], description: 'Push real-time updates to clients over HTTP with SSE.' },
  { path: '/realtime/websocket', title: 'WebSocket', section: 'Real-Time & Events', keywords: ['websocket', 'ws', 'socket', 'bidirectional', 'real-time', 'pub sub', 'topic'], description: 'Full-duplex WebSocket communication with topic routing.' },
  { path: '/realtime/pubsub', title: 'Pub/Sub & Event Bus', section: 'Real-Time & Events', keywords: ['pubsub', 'publish', 'subscribe', 'event bus', 'channel', 'message', 'redis'], description: 'Publish/subscribe messaging with memory and Redis adapters.' },

  // CLI
  { path: '/cli', title: 'CLI Overview', section: 'CLI', keywords: ['cli', 'command line', 'vexor cli', 'scaffolding'], description: 'Overview of the Vexor CLI for project management.' },
  { path: '/cli/commands', title: 'CLI Commands', section: 'CLI', keywords: ['commands', 'new', 'generate', 'add', 'dev', 'build', 'doctor'], description: 'Complete reference for all CLI commands.' },

  // Advanced
  { path: '/advanced/adapters', title: 'Adapters & Runtimes', section: 'Advanced', keywords: ['adapter', 'runtime', 'node', 'bun', 'deno', 'cloudflare', 'vercel', 'edge'], description: 'Deploy Vexor to Node.js, Bun, Deno, Cloudflare, and Vercel.' },
  { path: '/advanced/circuit-breaker', title: 'Circuit Breaker', section: 'Advanced', keywords: ['circuit breaker', 'resilience', 'fault tolerance', 'fallback', 'half open'], description: 'Protect services from cascading failures with circuit breakers.' },
  { path: '/advanced/retry', title: 'Retry Patterns', section: 'Advanced', keywords: ['retry', 'backoff', 'exponential', 'jitter', 'resilience', 'fault tolerance'], description: 'Retry failed operations with configurable backoff strategies.' },
  { path: '/advanced/serialization', title: 'Serialization', section: 'Advanced', keywords: ['serialize', 'json', 'fast json', 'stringify', 'performance'], description: 'High-performance JSON serialization with compiled schemas.' },
  { path: '/advanced/error-handling', title: 'Error Handling', section: 'Advanced', keywords: ['error', 'exception', 'catch', 'handler', 'http error', 'status code'], description: 'Handle errors gracefully with centralized error handling.' },
  { path: '/advanced/deployment', title: 'Deployment', section: 'Advanced', keywords: ['deploy', 'production', 'docker', 'pm2', 'kubernetes', 'ci cd'], description: 'Deploy your Vexor application to production.' },
  { path: '/advanced/testing', title: 'Testing', section: 'Advanced', keywords: ['test', 'testing', 'vitest', 'jest', 'unit test', 'integration test', 'mock'], description: 'Test your Vexor application with recommended patterns.' },
  { path: '/advanced/migration', title: 'Migration from Express', section: 'Advanced', keywords: ['migrate', 'express', 'fastify', 'koa', 'hapi', 'switch', 'convert'], description: 'Migrate your existing Express or Fastify app to Vexor.' },
  { path: '/advanced/performance', title: 'Performance', section: 'Advanced', keywords: ['performance', 'optimize', 'benchmark', 'speed', 'throughput', 'latency'], description: 'Optimize your Vexor application for maximum performance.' },

  // API Reference
  { path: '/api', title: 'API Reference', section: 'API Reference', keywords: ['api', 'reference', 'docs'], description: 'Complete API reference for the Vexor framework.' },
  { path: '/api/vexor', title: 'Vexor Class', section: 'API Reference', keywords: ['vexor', 'app', 'instance', 'listen', 'use', 'route'], description: 'The main Vexor application class API.' },
  { path: '/api/context', title: 'Context API', section: 'API Reference', keywords: ['context', 'ctx', 'request', 'response', 'api'], description: 'The request context object API reference.' },
  { path: '/api/router', title: 'Router API', section: 'API Reference', keywords: ['router', 'route', 'group', 'prefix', 'api'], description: 'The router and route group API reference.' },
  { path: '/api/schema', title: 'Schema API', section: 'API Reference', keywords: ['schema', 'typebox', 'type', 'validation', 'api'], description: 'Schema definition and validation API reference.' },
];

export default searchIndex;
