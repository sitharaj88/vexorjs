import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Rocket,
  Settings,
  Key,
  Users,
  Package,
  Database,
  Shield,
  TestTube,
  Github,
  ExternalLink,
} from 'lucide-react';

const navigation = [
  { name: 'Introduction', href: '/', icon: Home },
  { name: 'Getting Started', href: '/getting-started', icon: Rocket },
  { name: 'Configuration', href: '/configuration', icon: Settings },
];

const apiReference = [
  { name: 'Authentication', href: '/authentication', icon: Key },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
];

const guides = [
  { name: 'Database', href: '/database', icon: Database },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Testing', href: '/testing', icon: TestTube },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Vexor</span>
                <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">Enterprise API</span>
              </div>
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            {/* Getting Started */}
            <div className="mb-6">
              <p className="sidebar-section">Getting Started</p>
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                      end={item.href === '/'}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* API Reference */}
            <div className="mb-6">
              <p className="sidebar-section">API Reference</p>
              <ul className="space-y-1">
                {apiReference.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon size={18} />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guides */}
            <div className="mb-6">
              <p className="sidebar-section">Guides</p>
              <ul className="space-y-1">
                {guides.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon size={18} />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <a
              href="https://github.com/vexorjs/vexor"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <Github size={18} />
              GitHub
              <ExternalLink size={14} className="ml-auto opacity-50" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Version badge */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            v1.0.0
          </span>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
