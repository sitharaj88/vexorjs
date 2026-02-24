import { CodeBlock } from '../components/CodeBlock';
import { CheckCircle2, Terminal, Server, Key } from 'lucide-react';

const installCode = `# Navigate to the example directory
cd examples/enterprise-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env`;

const seedCode = `# Seed the database with sample data
npm run seed

# This creates:
# - Admin user: admin@example.com / Admin123!
# - Regular user: user@example.com / User1234!
# - Sample products in various categories`;

const startCode = `# Start the development server
npm start

# Or with hot reload
npm run dev`;

const testLoginCode = `# Test the health endpoint
curl http://localhost:3000/health

# Login with admin credentials
curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'`;

const useTokenCode = `# Use the access token for authenticated requests
curl http://localhost:3000/auth/me \\
  -H "Authorization: Bearer <your-access-token>"

# List all users (admin only)
curl http://localhost:3000/users \\
  -H "Authorization: Bearer <your-access-token>"`;

const projectStructure = `enterprise-api/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/               # Environment configuration
│   ├── db/                   # Database connection & schema
│   ├── middleware/           # CORS, logging, rate limiting
│   ├── modules/
│   │   ├── auth/            # Authentication endpoints
│   │   ├── users/           # User management
│   │   └── products/        # Product management
│   └── utils/               # Password hashing, validation
├── tests/                    # Vitest test suites
├── data/                     # SQLite database storage
├── .env.example              # Environment template
└── package.json`;

export function GettingStarted() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Getting Started
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Get the Enterprise API running locally in just a few minutes.
      </p>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Prerequisites
        </h2>
        <ul className="space-y-3">
          {[
            'Node.js 20 or later',
            'npm or yarn package manager',
            'A terminal or command prompt',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Step 1: Installation */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold">
            1
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Installation
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Clone the repository and install the dependencies.
        </p>
        <CodeBlock code={installCode} language="bash" />
      </section>

      {/* Step 2: Seed Database */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold">
            2
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Seed the Database
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Populate the database with sample users and products for testing.
        </p>
        <CodeBlock code={seedCode} language="bash" />

        <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Default Credentials
          </h4>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-amber-700 dark:text-amber-300 font-medium">Admin User</p>
              <p className="text-amber-600 dark:text-amber-400 font-mono">admin@example.com</p>
              <p className="text-amber-600 dark:text-amber-400 font-mono">Admin123!</p>
            </div>
            <div>
              <p className="text-amber-700 dark:text-amber-300 font-medium">Regular User</p>
              <p className="text-amber-600 dark:text-amber-400 font-mono">user@example.com</p>
              <p className="text-amber-600 dark:text-amber-400 font-mono">User1234!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Start Server */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold">
            3
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Start the Server
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Run the development server.
        </p>
        <CodeBlock code={startCode} language="bash" />

        <div className="mt-4 flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <Server className="text-emerald-500" size={24} />
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-200">
              Server running at
            </p>
            <code className="text-emerald-600 dark:text-emerald-400 font-mono">
              http://localhost:3000
            </code>
          </div>
        </div>
      </section>

      {/* Step 4: Test Login */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold">
            4
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Test the API
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Make your first API requests to verify everything is working.
        </p>
        <CodeBlock code={testLoginCode} language="bash" />
      </section>

      {/* Step 5: Use Token */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold">
            5
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Make Authenticated Requests
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the access token from the login response to access protected endpoints.
        </p>
        <CodeBlock code={useTokenCode} language="bash" />
      </section>

      {/* Project Structure */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Project Structure
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Understanding the codebase layout will help you navigate and extend the API.
        </p>
        <CodeBlock code={projectStructure} language="text" />
      </section>

      {/* Next Steps */}
      <section className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Terminal className="text-primary-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Explore the API Reference
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Learn about all available endpoints and their parameters.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Key className="text-primary-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Customize Configuration
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Adjust environment variables for your use case.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
