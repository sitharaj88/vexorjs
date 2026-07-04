import { NavLink } from 'react-router-dom';
import {
  X,
  Rocket,
  Layers,
  BookOpen,
  Database,
  Terminal,
  ChevronRight,
  Shield,
  Server,
  Lock,
  Activity,
  Radio,
  Compass,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
}

interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { name: 'Introduction', href: '/getting-started' },
      { name: 'Installation', href: '/installation' },
      { name: 'Quick Start', href: '/quick-start' },
    ],
  },
  {
    title: 'Learn',
    icon: GraduationCap,
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
    icon: Layers,
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
    icon: Shield,
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
    icon: Server,
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
    icon: Lock,
    items: [
      { name: 'Authentication', href: '/auth/authentication' },
      { name: 'Sessions', href: '/auth/sessions' },
      { name: 'OAuth2 & Social', href: '/auth/oauth' },
      { name: 'Security Practices', href: '/auth/security' },
    ],
  },
  {
    title: 'Observability',
    icon: Activity,
    items: [
      { name: 'Metrics', href: '/observability/metrics' },
      { name: 'Tracing', href: '/observability/tracing' },
      { name: 'OpenAPI / Swagger', href: '/observability/openapi' },
    ],
  },
  {
    title: 'Vexor ORM',
    icon: Database,
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
    icon: Radio,
    items: [
      { name: 'Server-Sent Events', href: '/realtime/sse' },
      { name: 'WebSocket', href: '/realtime/websocket' },
      { name: 'Pub/Sub & Event Bus', href: '/realtime/pubsub' },
    ],
  },
  {
    title: 'CLI',
    icon: Terminal,
    items: [
      { name: 'Overview', href: '/cli' },
      { name: 'Commands', href: '/cli/commands' },
    ],
  },
  {
    title: 'Advanced',
    icon: Compass,
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
    icon: BookOpen,
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-6 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-3">
                <section.icon className="w-3.5 h-3.5" />
                {section.title}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group sidebar-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <ChevronRight className={`w-3 h-3 text-slate-400 dark:text-slate-600 transition-transform group-hover:translate-x-0.5`} />
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
