import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, FolderPlus, Database, Play } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';

const installCode = `# Install globally
npm install -g vexor-cli

# Or use with npx
npx vexor-cli <command>

# Verify installation
vexor --version`;

const quickStartCode = `# Create a new project
vexor new my-app

# Navigate to project
cd my-app

# Install dependencies
npm install

# Start development server
vexor dev`;

const features = [
  {
    icon: FolderPlus,
    title: 'Project Scaffolding',
    description: 'Create new projects with best practices and sensible defaults.',
  },
  {
    icon: Sparkles,
    title: 'Code Generation',
    description: 'Generate modules, models, and more with a single command.',
  },
  {
    icon: Database,
    title: 'Database Tools',
    description: 'Run migrations, seed data, and manage your database schema.',
  },
  {
    icon: Play,
    title: 'Development Server',
    description: 'Hot-reload development server with built-in debugging.',
  },
];

export default function CliOverview() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="cli" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Vexor CLI
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The Vexor command-line interface for scaffolding projects, generating code,
          and managing your application.
        </p>
      </div>

      {/* Features */}
      <section>
        <h2 id="features" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="card">
              <feature.icon className="w-8 h-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Installation */}
      <section>
        <h2 id="installation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Installation
        </h2>
        <CodeBlock code={installCode} language="bash" />
      </section>

      {/* Quick Start */}
      <section>
        <h2 id="quick-start" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Start
        </h2>
        <CodeBlock code={quickStartCode} language="bash" />
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Learn More
        </h2>
        <Link to="/cli/commands" className="btn-primary">
          View All Commands <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    </div>
  );
}
