import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, Github, Moon, Sun, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import searchIndex from '../data/searchIndex';

interface HeaderProps {
  onMenuClick: () => void;
  /** Hide the mobile hamburger on pages without a sidebar (e.g. the landing page) */
  showMenu?: boolean;
}

const navLinks = [
  { name: 'Docs', href: '/getting-started' },
  { name: 'Learn', href: '/learn' },
  { name: 'ORM', href: '/orm' },
  { name: 'API', href: '/api' },
];

export default function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Open search on / or Cmd/Ctrl+K, close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
      const typingInField =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === '/' && !searchOpen && !typingInField) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

  // Reset query when closing
  useEffect(() => {
    if (!searchOpen) setSearchQuery('');
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return searchIndex
      .map((entry) => {
        const haystack = `${entry.title} ${entry.description} ${entry.keywords.join(' ')} ${entry.section}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (entry.title.toLowerCase().includes(term)) score += 10;
          if (entry.keywords.some((k) => k.includes(term))) score += 5;
          if (entry.description.toLowerCase().includes(term)) score += 3;
          if (entry.section.toLowerCase().includes(term)) score += 1;
          if (!haystack.includes(term)) return null;
        }
        return { ...entry, score };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 12) as (typeof searchIndex[number] & { score: number })[];
  }, [searchQuery]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof searchResults> = {};
    for (const result of searchResults) {
      if (!groups[result.section]) groups[result.section] = [];
      groups[result.section].push(result);
    }
    return groups;
  }, [searchResults]);

  const handleResultClick = (path: string) => {
    setSearchOpen(false);
    navigate(path);
  };

  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');

  return (
    <header className="sticky top-0 z-50 h-14 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="flex items-center h-full px-4 sm:px-6 gap-2">
        {/* Mobile menu — only on pages that have a sidebar */}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mr-2">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/25">
            V
          </div>
          <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white">
            Vexor
          </span>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
            v1.2
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 w-56 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg ring-1 ring-transparent hover:ring-slate-300 dark:hover:ring-slate-600 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold font-mono bg-white dark:bg-slate-700 rounded ring-1 ring-slate-200 dark:ring-slate-600 text-slate-400 dark:text-slate-400">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <a
            href="https://github.com/sitharaj88/vexorjs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="w-[18px] h-[18px]" />
          </a>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="max-w-xl mx-auto mt-16 sm:mt-28 px-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
              <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="flex-1 px-3 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:block px-1.5 py-0.5 text-[10px] font-semibold font-mono bg-slate-100 dark:bg-slate-800 rounded ring-1 ring-slate-200 dark:ring-slate-700 text-slate-400 mr-2">
                  ESC
                </kbd>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="sm:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {searchQuery.trim() === '' && (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Type to search the documentation
                  </div>
                )}

                {searchQuery.trim() !== '' && searchResults.length === 0 && (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No results for "{searchQuery}"
                  </div>
                )}

                {Object.entries(groupedResults).map(([section, results]) => (
                  <div key={section}>
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {section}
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.path}
                        onClick={() => handleResultClick(result.path)}
                        className="flex flex-col w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {result.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {result.description}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
