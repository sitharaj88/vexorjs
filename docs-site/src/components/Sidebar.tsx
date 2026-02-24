import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useEffect, useCallback } from 'react';
import {
  Box,
  Database,
  Zap,
  Cloud,
  BookOpen,
  Layers,
  Terminal,
  X,
  ChevronRight
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
    title: 'CLI',
    links: [
      { href: '/docs/cli', label: 'Overview', icon: <Terminal className="w-4 h-4" /> },
      { href: '/docs/cli#new', label: 'Create Project' },
      { href: '/docs/cli#generate', label: 'Code Generation' },
      { href: '/docs/cli#add', label: 'Add Integrations' },
      { href: '/docs/cli#db', label: 'Database Commands' },
      { href: '/docs/cli#config', label: 'Configuration' },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { href: '/docs/core', label: 'Overview', icon: <Box className="w-4 h-4" /> },
      { href: '/docs/core#routing', label: 'Routing' },
      { href: '/docs/core#context', label: 'Context' },
      { href: '/docs/core#validation', label: 'Validation' },
    ],
  },
  {
    title: 'Vexor ORM',
    links: [
      { href: '/docs/orm', label: 'Overview', icon: <Database className="w-4 h-4" /> },
      { href: '/docs/orm#schema', label: 'Schema Definition' },
      { href: '/docs/orm#queries', label: 'Query Builder' },
      { href: '/docs/orm#migrations', label: 'Migrations' },
    ],
  },
  {
    title: 'Middleware',
    links: [
      { href: '/docs/middleware', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
      { href: '/docs/middleware#cors', label: 'CORS' },
      { href: '/docs/middleware#rate-limit', label: 'Rate Limiting' },
    ],
  },
  {
    title: 'Real-time',
    links: [
      { href: '/docs/realtime', label: 'Overview', icon: <Zap className="w-4 h-4" /> },
      { href: '/docs/realtime#websocket', label: 'WebSocket' },
      { href: '/docs/realtime#sse', label: 'Server-Sent Events' },
    ],
  },
  {
    title: 'Deployment',
    links: [
      { href: '/docs/deployment', label: 'Overview', icon: <Cloud className="w-4 h-4" /> },
      { href: '/docs/deployment#node', label: 'Node.js' },
      { href: '/docs/deployment#bun', label: 'Bun' },
      { href: '/docs/deployment#lambda', label: 'AWS Lambda' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle hash navigation with scrolling
  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const [path, hash] = href.split('#');
    const currentPath = location.pathname;

    // Close mobile menu first
    onClose?.();

    if (hash) {
      if (path === currentPath) {
        // Same page, just scroll to element
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', href);
          }
        }, 100);
      } else {
        // Different page, navigate then scroll
        navigate(path);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          window.history.replaceState(null, '', href);
        }, 200);
      }
    } else {
      navigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigate, onClose]);

  // Handle initial hash on page load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [location.pathname, location.hash]);

  const sidebarContent = (
    <nav className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {sidebarSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.links.map((link) => {
              const [linkPath, linkHash] = link.href.split('#');
              const isActive = linkHash
                ? location.pathname === linkPath && location.hash === `#${linkHash}`
                : location.pathname === linkPath && !location.hash;

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                      isActive
                        ? 'text-vexor-600 bg-vexor-50 dark:text-vexor-400 dark:bg-vexor-500/10 font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                    )}
                  >
                    {link.icon && <span className="flex-shrink-0">{link.icon}</span>}
                    <span className="truncate">{link.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-14 sm:top-16 bottom-0 w-64 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800/50 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Sidebar Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sidebar Panel */}
        <aside
          className={clsx(
            'absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-out overflow-y-auto',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile Header */}
          <div className="sticky top-0 flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded flex items-center justify-center font-bold text-white text-xs">
                V
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">Documentation</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
