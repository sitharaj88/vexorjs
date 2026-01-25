import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    // Find all headings in the main content
    const elements = document.querySelectorAll('main h2, main h3');
    const items: TocItem[] = Array.from(elements).map((element) => ({
      id: element.id,
      text: element.textContent || '',
      level: element.tagName === 'H2' ? 2 : 3,
    }));
    setHeadings(items);
  }, [location.pathname]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24 pl-8 pr-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          On this page
        </h4>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`toc-link ${heading.level === 3 ? 'pl-6' : ''} ${
                activeId === heading.id ? 'active' : ''
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
