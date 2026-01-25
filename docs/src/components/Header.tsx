import { Link } from 'react-router-dom';
import { Menu, Search, Github, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="font-semibold text-xl text-slate-900 dark:text-white">
              Vexor
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              v1.0
            </span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="w-4 h-4 mr-3" />
            <span>Search documentation...</span>
            <kbd className="ml-auto px-2 py-0.5 text-xs font-medium bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
              /
            </kbd>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <a
            href="https://github.com/vexorjs/vexor"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="max-w-2xl mx-auto mt-20 p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="flex-1 px-4 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                  ESC
                </kbd>
              </div>
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                Start typing to search...
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
