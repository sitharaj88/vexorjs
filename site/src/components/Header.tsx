import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Github, Moon, Sun, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import searchIndex from '../data/searchIndex';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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

  // Close search on escape, open on /
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
      if (e.key === '/' && !searchOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
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

  // Group results by section
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

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-shadow">
              V
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              Vexor
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              v1.2
            </span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
            <Search className="w-4 h-4 mr-3 text-slate-400" />
            <span>Search documentation...</span>
            <kbd className="ml-auto px-2 py-0.5 text-xs font-medium bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400">
              /
            </kbd>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <a
            href="https://github.com/sitharaj88/vexorjs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="max-w-2xl mx-auto mt-12 sm:mt-24 px-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center px-5 border-b border-slate-200 dark:border-slate-700">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documentation..."
                  className="flex-1 px-4 py-5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {searchQuery.trim() === '' && (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">Start typing to search the documentation...</p>
                  </div>
                )}

                {searchQuery.trim() !== '' && searchResults.length === 0 && (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                  </div>
                )}

                {Object.entries(groupedResults).map(([section, results]) => (
                  <div key={section}>
                    <div className="px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                      {section}
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.path}
                        onClick={() => handleResultClick(result.path)}
                        className="flex flex-col w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {result.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {result.description}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {searchResults.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
