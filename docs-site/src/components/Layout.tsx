import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHomePage = location.pathname === '/' || location.pathname === '';
  const isDocsPage = location.pathname.startsWith('/docs');

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/getting-started')) return 'Getting Started';
    if (path.includes('/cli')) return 'CLI';
    if (path.includes('/core')) return 'Core';
    if (path.includes('/orm')) return 'ORM';
    if (path.includes('/middleware')) return 'Middleware';
    if (path.includes('/realtime')) return 'Real-time';
    if (path.includes('/deployment')) return 'Deployment';
    return 'Docs';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Navbar />
      {isDocsPage ? (
        <div className="pt-14 sm:pt-16">
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-w-0">
              {/* Mobile Navigation Bar */}
              <div className="sticky top-14 sm:top-16 z-30 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>Docs</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-slate-900 dark:text-white">{getBreadcrumb()}</span>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <main className={isHomePage ? '' : 'pt-14 sm:pt-16'}>
          <Outlet />
        </main>
      )}
    </div>
  );
}
