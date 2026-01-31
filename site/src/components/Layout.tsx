import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TableOfContents from './TableOfContents';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Check if we're on the home page
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:pl-72">
          {isHome ? (
            <Outlet />
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <Outlet />
            </div>
          )}
        </main>

        {/* Table of Contents - hide on home page */}
        {!isHome && <TableOfContents />}
      </div>
    </div>
  );
}
