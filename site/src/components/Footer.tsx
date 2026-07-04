import { Link } from 'react-router-dom';
import { Github, Linkedin, Globe, Coffee, Heart } from 'lucide-react';

const footerLinks = {
  'Getting Started': [
    { label: 'Installation', href: '/installation' },
    { label: 'Quick Start', href: '/quick-start' },
    { label: 'Getting Started', href: '/getting-started' },
  ],
  'Framework': [
    { label: 'Routing', href: '/routing' },
    { label: 'Middleware', href: '/middleware/rate-limiting' },
    { label: 'Auth & Security', href: '/auth/authentication' },
    { label: 'Vexor ORM', href: '/orm' },
  ],
  'Resources': [
    { label: 'CLI Reference', href: '/cli' },
    { label: 'API Reference', href: '/api/vexor-class' },
    { label: 'Advanced Guides', href: '/advanced/adapters' },
    { label: 'Troubleshooting', href: '/advanced/troubleshooting' },
  ],
};

const socialLinks = [
  {
    icon: Globe,
    label: 'Website',
    href: 'https://sitharaj.in',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/sitharaj08',
  },
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/sitharaj88',
  },
  {
    icon: Coffee,
    label: 'Buy me a coffee',
    href: 'https://buymeacoffee.com/sitharaj88',
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-14">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/25">
                V
              </div>
              <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white">
                Vexor
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              A batteries-included, high-performance, multi-runtime backend framework for Node.js.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/70 dark:border-slate-800/70 pt-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {2026} Sitharaj Seenivasan. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by{' '}
              <a
                href="https://sitharaj.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sitharaj Seenivasan
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
