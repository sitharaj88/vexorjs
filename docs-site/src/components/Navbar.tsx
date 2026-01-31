import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { href: '/docs/getting-started', label: 'Docs' },
  { href: '/docs/core', label: 'API' },
  { href: '/docs/orm', label: 'ORM' },
  { href: 'https://github.com/sitharaj88/vexorjs', label: 'GitHub', external: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white">
                V
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Vexor</span>
              <span className="hidden sm:inline text-xs bg-vexor-500/20 text-vexor-600 dark:text-vexor-400 px-2 py-0.5 rounded-full font-medium">
                v1.0.0
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-sm flex items-center gap-1"
                  >
                    {link.label === 'GitHub' && <Github className="w-4 h-4" />}
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={clsx(
                      'nav-link text-sm',
                      location.pathname.startsWith(link.href) && 'active'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* CTA Button */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/docs/getting-started" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-white dark:bg-slate-900 md:hidden overflow-y-auto">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {link.label === 'GitHub' && <Github className="w-5 h-5" />}
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={clsx(
                      'block px-4 py-3 rounded-lg transition-colors',
                      location.pathname.startsWith(link.href)
                        ? 'text-vexor-600 dark:text-vexor-400 bg-vexor-50 dark:bg-vexor-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="pt-4">
                <Link
                  to="/docs/getting-started"
                  onClick={closeMobileMenu}
                  className="block w-full btn-primary text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
