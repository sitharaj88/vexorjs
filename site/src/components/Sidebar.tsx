import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export interface NavItem {
  name: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Single source of truth for docs navigation.
 * Layout derives breadcrumbs and prev/next links from this order.
 */
export const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/getting-started' },
      { name: 'Installation', href: '/installation' },
      { name: 'Quick Start', href: '/quick-start' },
    ],
  },
  {
    title: 'Learn',
    items: [
      { name: 'Learning Path', href: '/learn' },
      { name: 'Fundamentals', href: '/learn/fundamentals' },
      { name: 'Building APIs', href: '/learn/building-apis' },
      { name: 'Architecture', href: '/learn/architecture' },
      { name: 'Production & DevOps', href: '/learn/production' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { name: 'Overview', href: '/core-concepts' },
      { name: 'Routing', href: '/routing' },
      { name: 'Middleware', href: '/middleware' },
      { name: 'Context', href: '/context' },
      { name: 'Validation', href: '/validation' },
    ],
  },
  {
    title: 'Middleware',
    items: [
      { name: 'Rate Limiting', href: '/middleware/rate-limiting' },
      { name: 'CORS', href: '/middleware/cors' },
      { name: 'Compression', href: '/middleware/compression' },
      { name: 'Static Files', href: '/middleware/static-files' },
      { name: 'File Upload', href: '/middleware/upload' },
      { name: 'Health Checks', href: '/middleware/health' },
      { name: 'API Versioning', href: '/middleware/versioning' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { name: 'Caching', href: '/infrastructure/caching' },
      { name: 'Logging', href: '/infrastructure/logging' },
      { name: 'Dependency Injection', href: '/infrastructure/dependency-injection' },
      { name: 'Plugin System', href: '/infrastructure/plugins' },
      { name: 'Configuration', href: '/infrastructure/config' },
    ],
  },
  {
    title: 'Auth & Security',
    items: [
      { name: 'Authentication', href: '/auth/authentication' },
      { name: 'Sessions', href: '/auth/sessions' },
      { name: 'OAuth2 & Social', href: '/auth/oauth' },
      { name: 'Security Practices', href: '/auth/security' },
    ],
  },
  {
    title: 'Observability',
    items: [
      { name: 'Metrics', href: '/observability/metrics' },
      { name: 'Tracing', href: '/observability/tracing' },
      { name: 'OpenAPI / Swagger', href: '/observability/openapi' },
    ],
  },
  {
    title: 'Vexor ORM',
    items: [
      { name: 'Overview', href: '/orm' },
      { name: 'Schema Definition', href: '/orm/schema' },
      { name: 'Queries', href: '/orm/queries' },
      { name: 'Migrations', href: '/orm/migrations' },
      { name: 'Relations', href: '/orm/relations' },
      { name: 'Connection Pooling', href: '/orm/pooling' },
      { name: 'Soft Deletes', href: '/orm/soft-deletes' },
      { name: 'Seeders & Factories', href: '/orm/seeders' },
    ],
  },
  {
    title: 'Real-Time & Events',
    items: [
      { name: 'Server-Sent Events', href: '/realtime/sse' },
      { name: 'WebSocket', href: '/realtime/websocket' },
      { name: 'Pub/Sub & Event Bus', href: '/realtime/pubsub' },
    ],
  },
  {
    title: 'CLI',
    items: [
      { name: 'Overview', href: '/cli' },
      { name: 'Commands', href: '/cli/commands' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { name: 'Adapters & Runtimes', href: '/advanced/adapters' },
      { name: 'Circuit Breaker', href: '/advanced/circuit-breaker' },
      { name: 'Retry Patterns', href: '/advanced/retry' },
      { name: 'Serialization', href: '/advanced/serialization' },
      { name: 'Error Handling', href: '/advanced/error-handling' },
      { name: 'Deployment', href: '/advanced/deployment' },
      { name: 'Testing', href: '/advanced/testing' },
      { name: 'Migration Guide', href: '/advanced/migration' },
      { name: 'Performance', href: '/advanced/performance' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { name: 'Overview', href: '/api' },
      { name: 'Vexor Class', href: '/api/vexor' },
      { name: 'Context', href: '/api/context' },
      { name: 'Router', href: '/api/router' },
      { name: 'Schema', href: '/api/schema' },
    ],
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 z-40 w-72 h-[calc(100vh-3.5rem)] bg-white dark:bg-slate-950 lg:bg-transparent lg:dark:bg-transparent border-r border-slate-200/70 dark:border-slate-800/70 overflow-y-auto overscroll-contain transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-6 py-7 space-y-7 text-[13.5px]">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                {section.title}
              </h3>
              <ul className="border-l border-slate-200 dark:border-slate-800">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block py-1.5 pl-4 -ml-px border-l transition-colors ${
                          isActive
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
