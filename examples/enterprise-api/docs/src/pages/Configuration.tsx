import { CodeBlock } from '../components/CodeBlock';
import { AlertCircle } from 'lucide-react';

const envExample = `# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=./data/enterprise.db

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json`;

const productionEnv = `NODE_ENV=production
PORT=8080
DATABASE_URL=./data/production.db
JWT_SECRET=your-super-secret-production-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn`;

interface ConfigVariable {
  name: string;
  type: string;
  default: string;
  description: string;
  required?: boolean;
}

const configVariables: ConfigVariable[] = [
  {
    name: 'NODE_ENV',
    type: 'string',
    default: 'development',
    description: 'Environment mode (development, production, test)',
  },
  {
    name: 'PORT',
    type: 'number',
    default: '3000',
    description: 'Server port number',
  },
  {
    name: 'HOST',
    type: 'string',
    default: '0.0.0.0',
    description: 'Server host address',
  },
  {
    name: 'DATABASE_URL',
    type: 'string',
    default: './data/enterprise.db',
    description: 'SQLite database file path',
  },
  {
    name: 'JWT_SECRET',
    type: 'string',
    default: '-',
    description: 'Secret key for signing JWT tokens (min 32 characters)',
    required: true,
  },
  {
    name: 'JWT_EXPIRES_IN',
    type: 'string',
    default: '1h',
    description: 'Access token expiration time (e.g., 15m, 1h, 1d)',
  },
  {
    name: 'JWT_REFRESH_EXPIRES_IN',
    type: 'string',
    default: '7d',
    description: 'Refresh token expiration time',
  },
  {
    name: 'CORS_ORIGIN',
    type: 'string',
    default: '*',
    description: 'Allowed CORS origins (use specific domains in production)',
  },
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    type: 'number',
    default: '60000',
    description: 'Rate limit time window in milliseconds',
  },
  {
    name: 'RATE_LIMIT_MAX_REQUESTS',
    type: 'number',
    default: '100',
    description: 'Maximum requests allowed per window',
  },
  {
    name: 'LOG_LEVEL',
    type: 'string',
    default: 'info',
    description: 'Logging level (debug, info, warn, error)',
  },
  {
    name: 'LOG_FORMAT',
    type: 'string',
    default: 'json',
    description: 'Log output format (json, pretty)',
  },
];

export function Configuration() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Configuration
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Configure the Enterprise API using environment variables.
      </p>

      {/* Environment File */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Environment File
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sm">.env</code> file
          in the project root with your configuration:
        </p>
        <CodeBlock code={envExample} language="bash" filename=".env" />
      </section>

      {/* Variables Table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Environment Variables
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 pr-4 font-semibold text-slate-900 dark:text-white">Variable</th>
                <th className="pb-3 pr-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="pb-3 pr-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="pb-3 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {configVariables.map((variable) => (
                <tr key={variable.name} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4">
                    <code className="text-primary-600 dark:text-primary-400 font-mono">
                      {variable.name}
                    </code>
                    {variable.required && (
                      <span className="ml-2 text-xs text-red-500">required</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-500">{variable.type}</td>
                  <td className="py-3 pr-4 font-mono text-slate-500">{variable.default}</td>
                  <td className="py-3">{variable.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Production Configuration */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Production Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For production deployments, use more restrictive settings:
        </p>
        <CodeBlock code={productionEnv} language="bash" filename=".env.production" />
      </section>

      {/* Security Notice */}
      <section className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Security Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li>• Never commit <code className="font-mono">.env</code> files to version control</li>
              <li>• Use a strong, unique <code className="font-mono">JWT_SECRET</code> (minimum 32 characters)</li>
              <li>• Restrict <code className="font-mono">CORS_ORIGIN</code> to your actual domains in production</li>
              <li>• Use shorter token expiration times in production (e.g., 15m for access tokens)</li>
              <li>• Consider using environment variables from your hosting platform instead of .env files</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
