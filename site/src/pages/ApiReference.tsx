import { Link } from 'react-router-dom';
import { ArrowRight, Box, Route, Shield, FileJson } from 'lucide-react';

const apiSections = [
  {
    icon: Box,
    title: 'Vexor Class',
    description: 'The main application class. Create instances, register routes, middleware, and start servers.',
    href: '/api/vexor',
    methods: ['constructor', 'get', 'post', 'put', 'delete', 'group', 'addHook', 'listen', 'close'],
  },
  {
    icon: Route,
    title: 'Context',
    description: 'Request context passed to handlers. Access request data and build responses.',
    href: '/api/context',
    methods: ['params', 'query', 'body', 'json', 'text', 'html', 'status', 'header', 'redirect'],
  },
  {
    icon: Shield,
    title: 'Router',
    description: 'Radix tree router with high-performance route matching.',
    href: '/api/router',
    methods: ['add', 'find', 'routes', 'printTree'],
  },
  {
    icon: FileJson,
    title: 'Schema',
    description: 'Type-safe schema definitions for validation and documentation.',
    href: '/api/schema',
    methods: ['Type.String', 'Type.Number', 'Type.Object', 'Type.Array', 'Type.Union', 'Type.Optional'],
  },
];

export default function ApiReference() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="api-reference" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Complete API documentation for all Vexor modules. Each section includes
          detailed method signatures, parameters, and usage examples.
        </p>
      </div>

      {/* Version Info */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Vexor v1.0</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This documentation is for the latest stable version.
            </p>
          </div>
        </div>
      </section>

      {/* API Sections */}
      <section>
        <h2 id="modules" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Modules
        </h2>

        <div className="space-y-4">
          {apiSections.map((section) => (
            <Link
              key={section.title}
              to={section.href}
              className="block feature-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {section.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {section.methods.map((method) => (
                      <code
                        key={method}
                        className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                      >
                        {method}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TypeScript */}
      <section>
        <h2 id="typescript" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          TypeScript Support
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor is written in TypeScript and provides comprehensive type definitions.
          All exports are fully typed with JSDoc comments.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Type Inference</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Request handlers automatically infer types from your schemas.
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Generics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use generics for custom state, services, and configuration.
            </p>
          </div>
        </div>
      </section>

      {/* Related */}
      <section>
        <h2 id="related" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Related Documentation
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/orm" className="btn-secondary">
            Vexor ORM API
          </Link>
          <Link to="/cli/commands" className="btn-secondary">
            CLI Commands
          </Link>
        </div>
      </section>
    </div>
  );
}
