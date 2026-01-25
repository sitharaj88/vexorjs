import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/getting-started' },
      { name: 'Installation', href: '/installation' },
      { name: 'Quick Start', href: '/quick-start' },
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
    title: 'API Reference',
    items: [
      { name: 'Overview', href: '/api' },
      { name: 'Vexor Class', href: '/api/vexor' },
      { name: 'Context', href: '/api/context' },
      { name: 'Router', href: '/api/router' },
      { name: 'Schema', href: '/api/schema' },
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
    title: 'Guides',
    items: [
      { name: 'Overview', href: '/guides' },
      { name: 'Authentication', href: '/guides/authentication' },
      { name: 'Real-Time', href: '/guides/realtime' },
      { name: 'Error Handling', href: '/guides/error-handling' },
      { name: 'Configuration', href: '/guides/configuration' },
      { name: 'Deployment', href: '/guides/deployment' },
      { name: 'Testing', href: '/guides/testing' },
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

        <nav className="px-4 py-6 space-y-8">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="sidebar-section">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'active' : ''}`
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
