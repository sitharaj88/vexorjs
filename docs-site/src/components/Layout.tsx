import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '';
  const isDocsPage = location.pathname.startsWith('/docs');

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      {isDocsPage ? (
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-4xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      ) : (
        <main className={isHomePage ? '' : 'pt-16'}>
          <Outlet />
        </main>
      )}
    </div>
  );
}
