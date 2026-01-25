import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const npmInstall = `# Core framework
npm install @vexorjs/core

# With ORM (recommended)
npm install @vexorjs/core @vexorjs/orm

# With CLI (optional)
npm install -g vexor-cli`;

const yarnInstall = `# Core framework
yarn add @vexorjs/core

# With ORM (recommended)
yarn add @vexorjs/core @vexorjs/orm

# With CLI (optional)
yarn global add vexor-cli`;

const pnpmInstall = `# Core framework
pnpm add @vexorjs/core

# With ORM (recommended)
pnpm add @vexorjs/core @vexorjs/orm

# With CLI (optional)
pnpm add -g vexor-cli`;

const bunInstall = `# Core framework
bun add @vexorjs/core

# With ORM (recommended)
bun add @vexorjs/core @vexorjs/orm

# With CLI (optional)
bun add -g vexor-cli`;

const tsconfigExample = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`;

const packageJsonExample = `{
  "name": "my-vexor-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@vexorjs/core": "^1.0.0",
    "@vexorjs/orm": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.7.0",
    "@types/node": "^22.0.0"
  }
}`;

export default function Installation() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="installation" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Installation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to install Vexor and set up your development environment.
        </p>
      </div>

      {/* Requirements */}
      <section>
        <h2 id="requirements" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Requirements
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              <strong>Node.js 20+</strong> - Vexor requires Node.js version 20 or higher
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              <strong>TypeScript 5.0+</strong> - For the best developer experience
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              <strong>ESM Support</strong> - Vexor is ESM-only (no CommonJS)
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>Note:</strong> Vexor is ESM-only and does not support CommonJS (require).
              Make sure your project uses <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">"type": "module"</code> in package.json.
            </div>
          </div>
        </div>
      </section>

      {/* Package Managers */}
      <section>
        <h2 id="package-managers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Installation with Package Managers
        </h2>

        <div className="space-y-6">
          <div>
            <h3 id="npm" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              npm
            </h3>
            <CodeBlock code={npmInstall} language="bash" />
          </div>

          <div>
            <h3 id="yarn" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Yarn
            </h3>
            <CodeBlock code={yarnInstall} language="bash" />
          </div>

          <div>
            <h3 id="pnpm" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              pnpm
            </h3>
            <CodeBlock code={pnpmInstall} language="bash" />
          </div>

          <div>
            <h3 id="bun" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Bun
            </h3>
            <CodeBlock code={bunInstall} language="bash" />
          </div>
        </div>
      </section>

      {/* Project Setup */}
      <section>
        <h2 id="project-setup" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Project Setup
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          After installing the packages, you'll need to configure TypeScript for the best experience.
        </p>

        <div className="space-y-6">
          <div>
            <h3 id="tsconfig" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              TypeScript Configuration
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create a <code className="prose-code">tsconfig.json</code> file in your project root:
            </p>
            <CodeBlock code={tsconfigExample} language="json" filename="tsconfig.json" />
          </div>

          <div>
            <h3 id="package-json" className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Package.json
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your <code className="prose-code">package.json</code> should look something like this:
            </p>
            <CodeBlock code={packageJsonExample} language="json" filename="package.json" />
          </div>
        </div>
      </section>

      {/* Runtimes */}
      <section>
        <h2 id="runtimes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Runtime Support
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Vexor runs on multiple JavaScript runtimes. Here's what's supported:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Runtime</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Version</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">Node.js</td>
                <td className="py-3 px-4">20+</td>
                <td className="py-3 px-4"><span className="text-green-500">Full Support</span></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">Bun</td>
                <td className="py-3 px-4">1.0+</td>
                <td className="py-3 px-4"><span className="text-green-500">Full Support</span></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">Deno</td>
                <td className="py-3 px-4">1.40+</td>
                <td className="py-3 px-4"><span className="text-green-500">Full Support</span></td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4">Cloudflare Workers</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4"><span className="text-green-500">Full Support</span></td>
              </tr>
              <tr>
                <td className="py-3 px-4">Vercel Edge</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4"><span className="text-green-500">Full Support</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Now that you have Vexor installed, you're ready to build your first application!
        </p>
        <Link
          to="/quick-start"
          className="btn-primary"
        >
          Continue to Quick Start
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    </div>
  );
}
