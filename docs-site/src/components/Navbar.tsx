import { Link, useLocation } from 'react-router-dom';
import { Github, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { href: '/docs/getting-started', label: 'Docs' },
  { href: '/docs/cli', label: 'CLI' },
  { href: '/docs/orm', label: 'ORM' },
  { href: '/learn', label: 'Learn' },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white text-sm sm:text-base">
              V
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Vexor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  'nav-link text-sm',
                  (link.href === '/learn' ? location.pathname.startsWith('/learn') : location.pathname.startsWith(link.href)) && 'active'
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/sitharaj88/vexorjs"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link text-sm flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
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

            {/* GitHub - Mobile */}
            <a
              href="https://github.com/sitharaj88/vexorjs"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>

            {/* CTA Button - Desktop only */}
            <Link
              to="/docs/getting-started"
              className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
