import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  Box,
  Database,
  Zap,
  Cloud,
  BookOpen,
  Layers
} from 'lucide-react';

interface SidebarSection {
  title: string;
  links: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Getting Started',
    links: [
      { href: '/docs/getting-started', label: 'Introduction', icon: <BookOpen className="w-4 h-4" /> },
      { href: '/docs/getting-started#installation', label: 'Installation' },
      { href: '/docs/getting-started#quick-start', label: 'Quick Start' },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { href: '/docs/core', label: 'Overview', icon: <Box className="w-4 h-4" /> },
      { href: '/docs/core#routing', label: 'Routing' },
      { href: '/docs/core#context', label: 'Context' },
      { href: '/docs/core#validation', label: 'Validation' },
      { href: '/docs/core#authentication', label: 'Authentication' },
    ],
  },
  {
    title: 'Vexor ORM',
    links: [
      { href: '/docs/orm', label: 'Overview', icon: <Database className="w-4 h-4" /> },
      { href: '/docs/orm#schema', label: 'Schema Definition' },
      { href: '/docs/orm#queries', label: 'Query Builder' },
      { href: '/docs/orm#migrations', label: 'Migrations' },
      { href: '/docs/orm#transactions', label: 'Transactions' },
    ],
  },
  {
    title: 'Middleware',
    links: [
      { href: '/docs/middleware', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
      { href: '/docs/middleware#cors', label: 'CORS' },
      { href: '/docs/middleware#rate-limit', label: 'Rate Limiting' },
      { href: '/docs/middleware#compression', label: 'Compression' },
      { href: '/docs/middleware#upload', label: 'File Upload' },
    ],
  },
  {
    title: 'Real-time',
    links: [
      { href: '/docs/realtime', label: 'Overview', icon: <Zap className="w-4 h-4" /> },
      { href: '/docs/realtime#websocket', label: 'WebSocket' },
      { href: '/docs/realtime#sse', label: 'Server-Sent Events' },
      { href: '/docs/realtime#pubsub', label: 'Pub/Sub' },
    ],
  },
  {
    title: 'Deployment',
    links: [
      { href: '/docs/deployment', label: 'Overview', icon: <Cloud className="w-4 h-4" /> },
      { href: '/docs/deployment#node', label: 'Node.js' },
      { href: '/docs/deployment#bun', label: 'Bun' },
      { href: '/docs/deployment#lambda', label: 'AWS Lambda' },
      { href: '/docs/deployment#cloudflare', label: 'Cloudflare Workers' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900/50 border-r border-slate-800/50 overflow-y-auto scrollbar-hide">
      <nav className="p-4 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.links.map((link) => {
                const isActive = location.pathname === link.href ||
                  (location.pathname + location.hash) === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={clsx(
                        'sidebar-link flex items-center gap-2',
                        isActive && 'active'
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
