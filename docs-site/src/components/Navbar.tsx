import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navLinks = [
  { href: '/docs/getting-started', label: 'Docs' },
  { href: '/docs/core', label: 'API' },
  { href: '/docs/orm', label: 'ORM' },
  { href: 'https://github.com/sitharaj88/vexorjs', label: 'GitHub', external: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-vexor-400 to-vexor-600 rounded-lg flex items-center justify-center font-bold text-white">
              V
            </div>
            <span className="text-xl font-bold">Vexor</span>
            <span className="hidden sm:inline text-xs bg-vexor-500/20 text-vexor-400 px-2 py-0.5 rounded-full font-medium">
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

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/docs/getting-started" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-slate-400 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-slate-400 hover:text-white"
                >
                  {link.label}
                </Link>
              )
            ))}
            <Link
              to="/docs/getting-started"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full btn-primary text-center mt-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
