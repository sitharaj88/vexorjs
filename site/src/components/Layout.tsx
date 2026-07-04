import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import Sidebar, { navigation } from './Sidebar';
import Header from './Header';
import TableOfContents from './TableOfContents';
import Footer from './Footer';

/** Flat, ordered list of all doc pages for breadcrumbs and prev/next */
const flatNav = navigation.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.title }))
);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';

  const { current, prev, next } = useMemo(() => {
    const index = flatNav.findIndex((item) => item.href === location.pathname);
    return {
      current: index >= 0 ? flatNav[index] : undefined,
      prev: index > 0 ? flatNav[index - 1] : undefined,
      next: index >= 0 && index < flatNav.length - 1 ? flatNav[index + 1] : undefined,
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu={!isHome} />

      <div className="flex">
        {!isHome && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <main className={`flex-1 min-w-0 ${isHome ? '' : 'lg:pl-72'}`}>
          {isHome ? (
            <>
              <Outlet />
              <Footer />
            </>
          ) : (
            <div className="flex">
              <div className="flex-1 min-w-0 max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
                {/* Breadcrumbs */}
                {current && (
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 mb-6">
                    <span>{current.section}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {current.name}
                    </span>
                  </div>
                )}

                <Outlet />

                {/* Prev / next pagination */}
                {(prev || next) && (
                  <nav className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-4">
                    {prev ? (
                      <Link
                        to={prev.href}
                        className="group flex flex-col gap-1 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all"
                      >
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <ArrowLeft className="w-3 h-3" /> Previous
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {prev.name}
                        </span>
                      </Link>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    {next && (
                      <Link
                        to={next.href}
                        className="group flex flex-col gap-1 items-end text-right p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all sm:col-start-2"
                      >
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          Next <ArrowRight className="w-3 h-3" />
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {next.name}
                        </span>
                      </Link>
                    )}
                  </nav>
                )}
              </div>

              <TableOfContents />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
