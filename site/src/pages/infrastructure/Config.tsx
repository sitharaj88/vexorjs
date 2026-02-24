import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { defineConfig, loadConfig } from '@vexorjs/core';

// Define your application configuration
const config = defineConfig({
  defaults: {
    port: 3000,
    host: '0.0.0.0',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'myapp',
      pool: { min: 2, max: 10 },
    },
    redis: {
      url: 'redis://localhost:6379',
    },
    logging: {
      level: 'info',
      prettyPrint: false,
    },
  },
});

// Access configuration values
console.log(config.get('port'));                  // 3000
console.log(config.get('database.host'));         // 'localhost'
console.log(config.get('database.pool.max'));     // 10

// Check if a key exists
config.has('redis.url');                          // true
config.has('smtp.host');                          // false

// Get with a fallback default
config.getOrDefault('smtp.host', 'localhost');    // 'localhost'

// Get a required value (throws if missing)
const dbName = config.getRequired('database.name');

// Get all configuration as a plain object
const all = config.all();`;

const envVariablesCode = `import { env } from '@vexorjs/core';

// Read environment variables with type-safe helpers
const port = env.getNumber('PORT');              // number | undefined
const host = env.get('HOST');                    // string | undefined
const debug = env.getBoolean('DEBUG');           // boolean | undefined

// Required variables (throws if missing)
const secret = env.getRequired('JWT_SECRET');
// Throws: "Environment variable JWT_SECRET is required but not set"

// Variables with default fallbacks
const logLevel = env.getOrDefault('LOG_LEVEL', 'info');
const maxRetries = env.getOrDefault('MAX_RETRIES', '3');

// Check if a variable is set
if (env.has('REDIS_URL')) {
  // Connect to Redis
}

// Environment mode shortcuts
console.log(env.mode);            // 'development' | 'production' | 'test'
console.log(env.isProduction);    // false
console.log(env.isDevelopment);   // true
console.log(env.isTest);          // false

// Use in configuration
import { defineConfig } from '@vexorjs/core';

const config = defineConfig({
  env: true,                       // Enable environment variable loading
  envOptions: {
    prefix: 'APP_',               // Only load vars starting with APP_
    separator: '__',              // APP_DATABASE__HOST -> database.host
    transform: 'lowercase',      // Normalize key casing
  },
  defaults: {
    port: 3000,
    database: { host: 'localhost' },
  },
});

// APP_PORT=8080 overrides the default port
// APP_DATABASE__HOST=db.example.com overrides database.host`;

const configFilesCode = `import { loadConfig } from '@vexorjs/core';

// Load configuration from files
const config = await loadConfig({
  // Search for config files in order (first found wins)
  files: [
    'config.local.json',        // Highest priority (gitignored)
    'config.production.json',   // Environment-specific
    'config.json',              // Base configuration
  ],
  // Environment variables override file values
  env: true,
  envOptions: { prefix: 'APP_' },
  // Programmatic defaults are the lowest priority
  defaults: {
    port: 3000,
  },
});

// Priority order (highest to lowest):
// 1. Environment variables
// 2. config.local.json (if exists)
// 3. config.production.json (if exists)
// 4. config.json (if exists)
// 5. Programmatic defaults

// Supports JSON, YAML, and TOML files
const yamlConfig = await loadConfig({
  files: ['config.yml', 'config.yaml'],
});

// Load a specific file directly
const fileConfig = await loadConfig({
  files: ['./settings/app.json'],
});`;

const schemaValidationCode = `import { defineConfig, Type } from '@vexorjs/core';

// Define a schema to validate configuration
const ConfigSchema = Type.Object({
  port: Type.Number({ minimum: 1, maximum: 65535 }),
  host: Type.String(),
  database: Type.Object({
    host: Type.String(),
    port: Type.Number(),
    name: Type.String(),
    user: Type.String(),
    password: Type.String(),
    ssl: Type.Optional(Type.Boolean()),
    pool: Type.Object({
      min: Type.Number({ minimum: 0 }),
      max: Type.Number({ minimum: 1 }),
    }),
  }),
  redis: Type.Optional(Type.Object({
    url: Type.String(),
    password: Type.Optional(Type.String()),
  })),
  logging: Type.Object({
    level: Type.Union([
      Type.Literal('trace'),
      Type.Literal('debug'),
      Type.Literal('info'),
      Type.Literal('warn'),
      Type.Literal('error'),
    ]),
    prettyPrint: Type.Boolean(),
  }),
});

// Configuration is validated on load
const config = defineConfig({
  schema: ConfigSchema,
  env: true,
  envOptions: { prefix: 'APP_' },
  defaults: {
    port: 3000,
    host: '0.0.0.0',
    logging: { level: 'info', prettyPrint: false },
  },
  files: ['config.json'],
});

// If validation fails, a clear error is thrown:
// ConfigValidationError: Configuration validation failed:
//   - database.password: Required field is missing
//   - port: Expected number, received string`;

const envModesCode = `import { defineConfig, env } from '@vexorjs/core';

// Vexor reads NODE_ENV to determine the environment mode
// Available modes: 'development', 'production', 'test'

const config = defineConfig({
  env: true,
  defaults: {
    port: 3000,
    logging: { level: 'info', prettyPrint: false },
  },
  // Override defaults per environment
  overrides: {
    development: {
      logging: { level: 'debug', prettyPrint: true },
    },
    production: {
      logging: { level: 'warn', prettyPrint: false },
    },
    test: {
      port: 0,  // Random port for testing
      logging: { level: 'silent' },
    },
  },
});

// Use environment checks in application code
import { Vexor } from '@vexorjs/core';

const app = new Vexor();

if (env.isDevelopment) {
  // Enable detailed error pages
  app.addHook('onError', async (ctx, error) => {
    return ctx.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  });
}

if (env.isProduction) {
  // Enable compression and caching in production
  app.register(compression());
  app.register(cacheMiddleware({ ttl: 60_000 }));
}`;

const sourceTrackingCode = `import { loadConfig } from '@vexorjs/core';

const config = await loadConfig({
  env: true,
  envOptions: { prefix: 'APP_' },
  files: ['config.json'],
  defaults: { port: 3000, host: 'localhost' },
});

// Track where each value came from
console.log(config.getSource('port'));
// 'env'       - if APP_PORT is set
// 'file'      - if defined in config.json
// 'default'   - if using the programmatic default

console.log(config.getSource('host'));
// 'default'

// Useful for debugging configuration issues
const allEntries = config.all();
for (const [key, value] of Object.entries(allEntries)) {
  const source = config.getSource(key);
  console.log(\`\${key} = \${JSON.stringify(value)} (from \${source})\`);
}

// Output:
// port = 8080 (from env)
// host = "localhost" (from default)
// database.host = "db.example.com" (from file)
// database.port = 5432 (from file)

// Source types
type ConfigSource = 'env' | 'file' | 'object' | 'default';`;

export default function Config() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="config" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Every application needs configuration -- database connection strings, API keys, feature flags, log levels, port numbers, and dozens of other settings that vary between environments and deployments. Hardcoding these values is fragile and insecure. Scattering <code className="prose-code">process.env</code> reads throughout your codebase is hard to audit, easy to mistype, and provides no validation. Vexor's configuration system provides a unified, type-safe approach to loading, merging, validating, and accessing configuration from multiple sources.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At its core, the configuration system follows a layered merge strategy. Configuration values can come from four sources: programmatic defaults (the lowest priority), configuration files (JSON, YAML, or TOML), environment-specific overrides, and environment variables (the highest priority). Each layer is merged on top of the previous one, with higher-priority sources overriding lower-priority ones for the same keys. This means you can define sensible defaults in code, override them with a configuration file for your environment, and use environment variables for secrets and deployment-specific values that should not exist in files.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's configuration also solves the validation problem. In a typical Node.js application, a misconfigured environment variable (a string where a number was expected, a missing required field) is not discovered until the application crashes at runtime -- often minutes or hours after deployment. With schema validation, Vexor checks your entire configuration at startup against a typed schema and fails immediately with a clear error listing every validation issue. This fail-fast behavior catches configuration errors before your application serves a single request.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The configuration system also includes source tracking, which records where each value came from (environment variable, file, or default). This is invaluable for debugging configuration issues in production, where you need to understand why a particular setting has an unexpected value and which source is responsible.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's configuration system processes sources in a deterministic merge order. When you call <code className="prose-code">defineConfig</code> or <code className="prose-code">loadConfig</code>, the system builds the final configuration by starting with your programmatic defaults, layering on values from configuration files (in the order they are listed, with earlier files taking priority), applying environment-specific overrides based on <code className="prose-code">NODE_ENV</code>, and finally applying environment variables on top of everything else. At each layer, a deep merge is performed: nested objects are merged recursively, and scalar values are replaced.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Environment variable mapping uses a prefix and separator convention to convert flat environment variable names into nested configuration paths. With a prefix of <code className="prose-code">APP_</code> and a separator of <code className="prose-code">__</code>, the environment variable <code className="prose-code">APP_DATABASE__HOST</code> maps to the configuration path <code className="prose-code">database.host</code>. The prefix is stripped, the separators are replaced with dots, and the result is used as a key path into the configuration tree. Vexor also attempts type coercion: the string <code className="prose-code">"3000"</code> is converted to the number <code className="prose-code">3000</code> if the existing value at that path is a number, and <code className="prose-code">"true"</code> or <code className="prose-code">"false"</code> are converted to booleans.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After merging all sources, if a schema is provided, the merged configuration is validated against it. Vexor uses the same schema system as its route validation (based on TypeBox), which means you get the same expressive type definitions and detailed error messages. If validation fails, a <code className="prose-code">ConfigValidationError</code> is thrown with a list of every field that failed validation, including the expected type and the actual value. This allows you to fix all configuration issues at once rather than discovering them one at a time.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Once the configuration is loaded and validated, it is stored in an immutable internal structure. Access is performed through the <code className="prose-code">get</code>, <code className="prose-code">has</code>, <code className="prose-code">getOrDefault</code>, and <code className="prose-code">getRequired</code> methods, all of which support dot-notation paths for accessing nested values. The configuration object does not expose a <code className="prose-code">set</code> method -- configuration is read-only after initialization, which prevents runtime modifications that could lead to hard-to-debug state inconsistencies.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The simplest way to define configuration is with <code className="prose-code">defineConfig</code> and a defaults object. This creates a synchronous configuration instance with your default values, accessible via dot-notation paths. Every value in the defaults tree is immediately available through the <code className="prose-code">get</code> method, with support for arbitrarily nested paths like <code className="prose-code">database.pool.max</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">get</code> method returns <code className="prose-code">undefined</code> for paths that do not exist in the configuration tree, which can mask typos and missing values. For configuration that your application cannot function without, use <code className="prose-code">getRequired</code>, which throws a descriptive error if the path is missing. For optional configuration with a known fallback, use <code className="prose-code">getOrDefault</code>, which returns the fallback value when the path does not exist.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common pattern is to load configuration once at application startup and pass the config object to services that need it via dependency injection. This centralizes all configuration access and makes it clear which services depend on which settings. Avoid scattering <code className="prose-code">config.get</code> calls throughout your codebase -- instead, each service should receive the specific configuration values it needs as constructor arguments.
        </p>
        <CodeBlock code={basicUsageCode} filename="config.ts" showLineNumbers />
      </section>

      {/* Environment Variables */}
      <section>
        <h2 id="environment-variables" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Variables
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Environment variables are the standard mechanism for injecting secrets and deployment-specific values into applications. They are supported by every hosting platform, CI/CD system, and container runtime, and they keep sensitive data like API keys and database passwords out of your source code and configuration files. Vexor provides the <code className="prose-code">env</code> utility object for direct, type-safe access to environment variables, as well as automatic environment variable integration in the configuration system.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">env</code> object wraps <code className="prose-code">process.env</code> with type-safe accessors. Instead of manually parsing strings, you use <code className="prose-code">env.getNumber('PORT')</code> to get a number or <code className="prose-code">env.getBoolean('DEBUG')</code> to get a boolean. These methods handle the string-to-type conversion and return <code className="prose-code">undefined</code> when the variable is not set. For variables that must exist, <code className="prose-code">env.getRequired</code> throws an error with a message that clearly identifies the missing variable name, making it easy to diagnose startup failures.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you enable environment variable integration in <code className="prose-code">defineConfig</code> (by setting <code className="prose-code">env: true</code>), Vexor automatically maps environment variables to configuration paths based on the <code className="prose-code">envOptions</code> settings. The <code className="prose-code">prefix</code> option filters which variables are loaded (only those starting with the prefix), preventing your configuration from being polluted by unrelated system variables. The <code className="prose-code">separator</code> option defines how nested paths are encoded -- the default double underscore (<code className="prose-code">__</code>) maps <code className="prose-code">APP_DATABASE__HOST</code> to <code className="prose-code">database.host</code>. The <code className="prose-code">transform</code> option normalizes key casing.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The <code className="prose-code">env</code> object also exposes environment mode detection via <code className="prose-code">env.mode</code>, <code className="prose-code">env.isProduction</code>, <code className="prose-code">env.isDevelopment</code>, and <code className="prose-code">env.isTest</code>. These read the <code className="prose-code">NODE_ENV</code> environment variable and provide boolean flags for conditional logic. This is cleaner and more readable than scattering <code className="prose-code">process.env.NODE_ENV === 'production'</code> checks throughout your codebase.
        </p>
        <CodeBlock code={envVariablesCode} filename="env.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Never commit sensitive environment variables (API keys, database passwords) to source
          control. Use <code className="prose-code">.env</code> files for local development (and add them to <code className="prose-code">.gitignore</code>) and your
          platform's secret management for production. Vexor's configuration system treats environment variables as the highest priority source specifically because they are the recommended mechanism for injecting secrets at deployment time.
        </InfoBlock>
      </section>

      {/* Configuration Files */}
      <section>
        <h2 id="configuration-files" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration Files
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configuration files are useful for settings that are complex, deeply nested, or shared across team members. While environment variables work well for simple key-value pairs and secrets, they are awkward for structured data like database pool configuration, CORS origin lists, or nested feature flags. Configuration files let you express this structure naturally in JSON, YAML, or TOML format.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">loadConfig</code> function accepts an array of file paths in priority order. Vexor loads each file that exists, parses it according to its extension, and merges the results with earlier files taking priority over later ones. This ordering is intentional: it lets you layer configuration from most specific to least specific. A typical setup might list <code className="prose-code">config.local.json</code> first (developer-specific overrides, gitignored), then <code className="prose-code">config.production.json</code> (environment-specific settings), then <code className="prose-code">config.json</code> (base defaults shared by the whole team).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Files that do not exist are silently skipped, so you can list optional files (like <code className="prose-code">config.local.json</code>) without requiring them to exist in every environment. This is particularly useful for the local override pattern: developers who need to customize their configuration create a <code className="prose-code">config.local.json</code> file, while developers who are fine with the defaults do not need to create one at all.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Note that <code className="prose-code">loadConfig</code> is asynchronous (it reads files from disk), while <code className="prose-code">defineConfig</code> is synchronous (it only uses in-memory defaults and environment variables). If you need file-based configuration, use <code className="prose-code">loadConfig</code> with <code className="prose-code">await</code> in your application's startup sequence.
        </p>
        <CodeBlock code={configFilesCode} filename="load-config.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Use a <code className="prose-code">config.local.json</code> file (added
          to <code className="prose-code">.gitignore</code>) for developer-specific overrides
          that should not be shared with the team. This lets individual developers customize ports, database URLs, and other settings without modifying files that are committed to the repository.
        </InfoBlock>
      </section>

      {/* Schema Validation */}
      <section>
        <h2 id="schema-validation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Schema Validation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configuration errors are among the most frustrating production issues because they often manifest as cryptic runtime failures far from the actual misconfiguration. A database host that was accidentally set to a port number causes a connection error that looks like a network issue. A missing API key causes a third-party service call to fail with a generic authentication error. Schema validation eliminates this entire category of bugs by verifying your configuration structure and types at startup, before the application serves any traffic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor uses the same TypeBox-based schema system for configuration validation that it uses for route request validation. You define a schema using <code className="prose-code">Type.Object</code>, <code className="prose-code">Type.String</code>, <code className="prose-code">Type.Number</code>, <code className="prose-code">Type.Boolean</code>, <code className="prose-code">Type.Optional</code>, <code className="prose-code">Type.Union</code>, and other combinators. The schema is checked against the fully merged configuration (after all sources have been applied), and if any field fails validation, a <code className="prose-code">ConfigValidationError</code> is thrown with a detailed list of all issues.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The error messages are designed to be immediately actionable. Instead of a generic "validation failed" message, you see specific errors like "database.password: Required field is missing" or "port: Expected number between 1 and 65535, received 'abc'". This means you can fix all configuration issues in a single pass rather than discovering them one at a time through repeated startup attempts.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Schema validation also serves as living documentation for your configuration. By reading the schema, a developer can see every configuration option, its type, whether it is required or optional, and any constraints (like minimum/maximum values). This is more reliable than documentation that can drift from reality, because the schema is the actual validation logic -- if the schema says a field is required, the application will not start without it.
        </p>
        <CodeBlock code={schemaValidationCode} filename="validated-config.ts" showLineNumbers />
        <InfoBlock variant="info">
          Schema validation runs at startup. A misconfigured application fails fast with a clear
          error message rather than failing unpredictably at runtime when the bad value is first accessed. This is especially valuable in CI/CD pipelines, where a fast validation failure prevents a misconfigured application from being deployed to production.
        </InfoBlock>
      </section>

      {/* Environment Modes */}
      <section>
        <h2 id="environment-modes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Modes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Most applications behave differently in development, production, and test environments. In development, you want verbose logging, pretty-printed output, and detailed error pages. In production, you want minimal logging, compressed responses, and generic error messages. In tests, you want silent logging and random ports to avoid conflicts. Vexor's environment mode system lets you define these variations declaratively through the <code className="prose-code">overrides</code> configuration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">overrides</code> option accepts an object keyed by environment name (the value of <code className="prose-code">NODE_ENV</code>). Each override is a partial configuration that is deep-merged into the defaults when the corresponding environment is active. This is more maintainable than scattering <code className="prose-code">if (env.isProduction)</code> checks throughout your configuration setup, because all environment-specific values are co-located in one place and clearly labeled.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Override merging happens after defaults but before environment variables, so environment variables can still override environment-specific values. This ordering ensures that the most specific source (an environment variable set in the deployment platform) always wins, even over a value specified in the production override block.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          For conditional behavior beyond configuration values -- such as registering different plugins or middleware -- use the <code className="prose-code">env.isDevelopment</code>, <code className="prose-code">env.isProduction</code>, and <code className="prose-code">env.isTest</code> flags in your application startup code. These are boolean properties that read <code className="prose-code">NODE_ENV</code> once and provide a clean, readable API for environment-conditional logic.
        </p>
        <CodeBlock code={envModesCode} filename="modes.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Always set <code className="prose-code">NODE_ENV</code> explicitly in your deployment environment. If it is not set, Vexor defaults to <code className="prose-code">'development'</code>. Running a production deployment without <code className="prose-code">NODE_ENV=production</code> will activate development-mode settings (verbose logging, detailed errors), which degrades performance and may expose sensitive information.
        </InfoBlock>
      </section>

      {/* Source Tracking */}
      <section>
        <h2 id="source-tracking" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Source Tracking
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When your application has configuration coming from multiple sources -- defaults, files, environment variables, and overrides -- it can be difficult to understand where a particular value came from. Did the database host come from the config file, or is it being overridden by an environment variable? Is the port using the default value, or was it set somewhere? Source tracking answers these questions by recording the origin of every configuration value during the merge process.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">getSource</code> method returns a string indicating which source provided the value at a given path: <code className="prose-code">'env'</code> for environment variables, <code className="prose-code">'file'</code> for configuration files, <code className="prose-code">'object'</code> for programmatic overrides, and <code className="prose-code">'default'</code> for the defaults you provided in code. This is especially useful for debugging production configuration issues, where you need to understand why a setting has an unexpected value.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A recommended practice is to log all configuration values and their sources at startup in development mode. This creates a clear record of the final configuration state and immediately reveals when an environment variable is overriding a file value or when a default is being used because a higher-priority source did not provide a value. In production, you may want to log only non-default sources to keep startup output concise while still surfacing unexpected overrides.
        </p>
        <CodeBlock code={sourceTrackingCode} filename="source-tracking.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Log configuration sources at startup in development mode to quickly identify when an
          environment variable is overriding a file value, or when a default is being used unexpectedly. This simple diagnostic step can save significant time when debugging "why does my app connect to the wrong database" issues.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always define a schema for production applications.</strong> Schema validation catches configuration errors at startup rather than at runtime. The few minutes it takes to define a schema will save hours of debugging misconfiguration issues in production. The schema also serves as documentation for all available configuration options.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use environment variables for secrets, files for structure.</strong> Database passwords, API keys, and tokens should always come from environment variables or a secret management system -- never from configuration files that might be committed to source control. Use configuration files for complex, non-sensitive settings like pool sizes, feature flags, and CORS configurations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Provide defaults for everything except secrets.</strong> Every configuration value that has a reasonable default should have one. This minimizes the number of environment variables that must be set for the application to start, making it easier for new developers to get up and running and reducing the surface area for misconfiguration. Secrets (API keys, passwords) should use <code className="prose-code">getRequired</code> to fail fast if they are missing.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Load configuration once at startup.</strong> Create a single configuration object during your application's initialization phase and inject it into services via the DI container. Avoid reading configuration repeatedly during request handling -- it adds unnecessary overhead and makes it harder to trace which configuration values are in use.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Use a consistent prefix for environment variables.</strong> A prefix like <code className="prose-code">APP_</code> or <code className="prose-code">MYAPP_</code> prevents your configuration from accidentally picking up unrelated system variables. It also makes it easy to see all your application's configuration in a <code className="prose-code">env | grep APP_</code> command.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          <code className="prose-code">defineConfig(options)</code> / <code className="prose-code">loadConfig(options)</code>
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">defineConfig</code> creates a configuration synchronously from defaults and environment variables. <code className="prose-code">loadConfig</code> is the async variant that also reads from configuration files on disk. Both return a <code className="prose-code">Config</code> instance with methods for accessing, checking, and tracing configuration values.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">defaults</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, unknown&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">{'{}'}</code></td>
                <td className="py-3 px-4">The base configuration values with the lowest priority. These are used when no higher-priority source provides a value for a given key. Define defaults for every setting that has a reasonable fallback -- this minimizes required environment variables and makes your application easier to set up in new environments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">env</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">When <code className="prose-code">true</code>, enables automatic loading of configuration values from environment variables. Variables are mapped to configuration paths based on the <code className="prose-code">envOptions</code> settings. Environment variables have the highest priority and override all other sources.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">envOptions</code></td>
                <td className="py-3 px-4"><code className="prose-code">EnvOptions</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">Controls how environment variables are mapped to configuration paths. The <code className="prose-code">prefix</code> property filters which variables are loaded (e.g., <code className="prose-code">'APP_'</code>). The <code className="prose-code">separator</code> property defines how nested paths are encoded in variable names (e.g., <code className="prose-code">'__'</code> means <code className="prose-code">APP_DB__HOST</code> maps to <code className="prose-code">db.host</code>). The <code className="prose-code">transform</code> property normalizes key casing.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">files</code></td>
                <td className="py-3 px-4"><code className="prose-code">string[]</code></td>
                <td className="py-3 px-4"><code className="prose-code">[]</code></td>
                <td className="py-3 px-4">An ordered array of configuration file paths to load. Files are loaded in order, with earlier files taking priority over later ones for duplicate keys. Files that do not exist are silently skipped. Supported formats are JSON (<code className="prose-code">.json</code>), YAML (<code className="prose-code">.yml</code>, <code className="prose-code">.yaml</code>), and TOML (<code className="prose-code">.toml</code>). Only available with <code className="prose-code">loadConfig</code>, not <code className="prose-code">defineConfig</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">schema</code></td>
                <td className="py-3 px-4"><code className="prose-code">TSchema</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A TypeBox schema that the final merged configuration is validated against. If validation fails, a <code className="prose-code">ConfigValidationError</code> is thrown with a detailed list of all validation errors, including field paths, expected types, and actual values. Validation runs after all sources have been merged, ensuring the complete configuration is checked.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">overrides</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, object&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">Per-environment override objects keyed by the value of <code className="prose-code">NODE_ENV</code> (e.g., <code className="prose-code">'development'</code>, <code className="prose-code">'production'</code>, <code className="prose-code">'test'</code>). The override for the current environment is deep-merged into the defaults after file loading but before environment variable application. Only one override is applied based on the active environment.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Config Instance Methods
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Methods available on the configuration object returned by <code className="prose-code">defineConfig</code> and <code className="prose-code">loadConfig</code>. All path parameters use dot-notation to access nested values.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">get</code></td>
                <td className="py-3 px-4"><code className="prose-code">get&lt;T&gt;(path: string): T | undefined</code></td>
                <td className="py-3 px-4">Retrieves a configuration value by its dot-notation path (e.g., <code className="prose-code">'database.pool.max'</code>). Returns <code className="prose-code">undefined</code> if the path does not exist in the configuration tree. Supports both scalar values and nested objects. The type parameter provides TypeScript type safety for the return value.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">has</code></td>
                <td className="py-3 px-4"><code className="prose-code">has(path: string): boolean</code></td>
                <td className="py-3 px-4">Checks whether a configuration path exists, regardless of its value. Returns <code className="prose-code">true</code> if the path resolves to any value (including <code className="prose-code">null</code>, <code className="prose-code">0</code>, <code className="prose-code">false</code>, and empty strings), <code className="prose-code">false</code> only if the path does not exist. Use this before <code className="prose-code">get</code> when you need to distinguish between "not configured" and "configured as a falsy value".</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getOrDefault</code></td>
                <td className="py-3 px-4"><code className="prose-code">getOrDefault&lt;T&gt;(path: string, fallback: T): T</code></td>
                <td className="py-3 px-4">Retrieves a configuration value by path, returning the provided <code className="prose-code">fallback</code> value if the path does not exist. This is a convenience method equivalent to <code className="prose-code">config.get(path) ?? fallback</code>. Use for optional configuration where you want to provide a per-call default that differs from the global default.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getRequired</code></td>
                <td className="py-3 px-4"><code className="prose-code">getRequired&lt;T&gt;(path: string): T</code></td>
                <td className="py-3 px-4">Retrieves a configuration value by path, throwing a descriptive error if the path does not exist. The error message includes the path that was requested, making it easy to identify which configuration is missing. Use for configuration that the application cannot function without, such as database connection strings and API keys.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getSource</code></td>
                <td className="py-3 px-4"><code className="prose-code">getSource(path: string): ConfigSource</code></td>
                <td className="py-3 px-4">Returns the source that provided the value at the given path. Possible values are <code className="prose-code">'env'</code> (from an environment variable), <code className="prose-code">'file'</code> (from a configuration file), <code className="prose-code">'object'</code> (from a programmatic override), and <code className="prose-code">'default'</code> (from the defaults). Invaluable for debugging configuration precedence issues.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">all</code></td>
                <td className="py-3 px-4"><code className="prose-code">all(): Record&lt;string, unknown&gt;</code></td>
                <td className="py-3 px-4">Returns the entire merged configuration as a plain JavaScript object. The returned object is a deep clone -- modifying it does not affect the internal configuration state. Useful for logging the complete configuration at startup (with sensitive values redacted) or for passing the full configuration to a service that manages its own subset.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          <code className="prose-code">env</code> Object
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A utility object for direct, type-safe access to environment variables and environment mode detection. Available as a standalone import from <code className="prose-code">@vexorjs/core</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method / Property</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">get(name)</code></td>
                <td className="py-3 px-4"><code className="prose-code">string | undefined</code></td>
                <td className="py-3 px-4">Reads an environment variable by name. Returns the string value if the variable is set, or <code className="prose-code">undefined</code> if it is not. This is a thin wrapper around <code className="prose-code">process.env[name]</code> that provides a consistent API and better TypeScript ergonomics.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getRequired(name)</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">Reads a required environment variable. Returns the string value if set, or throws an error with the message "Environment variable {'{name}'} is required but not set" if the variable is missing. Use for secrets and critical settings that the application cannot start without.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getOrDefault(name, fallback)</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">Reads an environment variable, returning the provided fallback string if the variable is not set. Useful for optional settings with known defaults, like <code className="prose-code">env.getOrDefault('LOG_LEVEL', 'info')</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getNumber(name)</code></td>
                <td className="py-3 px-4"><code className="prose-code">number | undefined</code></td>
                <td className="py-3 px-4">Reads an environment variable and parses it as a number using <code className="prose-code">Number()</code>. Returns the parsed number if the variable is set and parses successfully, or <code className="prose-code">undefined</code> if the variable is not set. Returns <code className="prose-code">NaN</code> if the variable is set but is not a valid number.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getBoolean(name)</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean | undefined</code></td>
                <td className="py-3 px-4">Reads an environment variable and parses it as a boolean. The strings <code className="prose-code">'true'</code>, <code className="prose-code">'1'</code>, and <code className="prose-code">'yes'</code> resolve to <code className="prose-code">true</code>. The strings <code className="prose-code">'false'</code>, <code className="prose-code">'0'</code>, and <code className="prose-code">'no'</code> resolve to <code className="prose-code">false</code>. Returns <code className="prose-code">undefined</code> if the variable is not set.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">has(name)</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">Checks whether an environment variable is set. Returns <code className="prose-code">true</code> if the variable exists in <code className="prose-code">process.env</code> (even if its value is an empty string), <code className="prose-code">false</code> otherwise. Use for conditional logic that depends on whether a feature is configured.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">mode</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">The current value of <code className="prose-code">NODE_ENV</code>, defaulting to <code className="prose-code">'development'</code> if not set. Common values are <code className="prose-code">'development'</code>, <code className="prose-code">'production'</code>, and <code className="prose-code">'test'</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isProduction</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">Returns <code className="prose-code">true</code> when <code className="prose-code">NODE_ENV</code> is <code className="prose-code">'production'</code>. Use for enabling production-only features like response compression, caching, and security headers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isDevelopment</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">Returns <code className="prose-code">true</code> when <code className="prose-code">NODE_ENV</code> is <code className="prose-code">'development'</code> or not set. Use for enabling development-only features like detailed error pages, pretty-printed logs, and hot reloading.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isTest</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">Returns <code className="prose-code">true</code> when <code className="prose-code">NODE_ENV</code> is <code className="prose-code">'test'</code>. Use for disabling side effects (like sending emails or analytics events) during automated test execution.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          ConfigLoader Methods
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Lower-level utilities for loading configuration from individual sources. These are used internally by <code className="prose-code">loadConfig</code> and can be used directly for custom loading logic.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">load</code></td>
                <td className="py-3 px-4"><code className="prose-code">load(options): Promise&lt;Config&gt;</code></td>
                <td className="py-3 px-4">Loads and merges configuration from all specified sources (defaults, files, environment variables, overrides) and returns a fully resolved <code className="prose-code">Config</code> instance. Applies schema validation if a schema is provided. This is the method called internally by <code className="prose-code">loadConfig</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">loadFile</code></td>
                <td className="py-3 px-4"><code className="prose-code">loadFile(path: string): Promise&lt;object&gt;</code></td>
                <td className="py-3 px-4">Reads and parses a single configuration file from disk. Determines the parser based on the file extension: <code className="prose-code">.json</code> for JSON, <code className="prose-code">.yml</code> or <code className="prose-code">.yaml</code> for YAML, and <code className="prose-code">.toml</code> for TOML. Throws if the file does not exist or cannot be parsed.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">loadEnv</code></td>
                <td className="py-3 px-4"><code className="prose-code">loadEnv(options?: EnvOptions): object</code></td>
                <td className="py-3 px-4">Reads environment variables matching the configured prefix, strips the prefix, converts separator-delimited names to nested objects, and returns the result as a plain object. Applies type coercion (strings to numbers and booleans) based on context.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">validate</code></td>
                <td className="py-3 px-4"><code className="prose-code">validate(config: object, schema: TSchema): void</code></td>
                <td className="py-3 px-4">Validates a configuration object against a TypeBox schema. Throws a <code className="prose-code">ConfigValidationError</code> with a detailed list of all validation failures if the object does not conform to the schema. Used internally by <code className="prose-code">loadConfig</code> when a schema is provided, but can also be called directly for custom validation scenarios.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/auth/authentication" className="btn-primary">
            Authentication Guide <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/infrastructure/plugins" className="btn-secondary">
            Plugins
          </Link>
        </div>
      </section>
    </div>
  );
}
