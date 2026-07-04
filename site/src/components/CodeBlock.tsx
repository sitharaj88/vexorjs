import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TS',
  tsx: 'TSX',
  javascript: 'JS',
  jsx: 'JSX',
  bash: 'SH',
  shell: 'SH',
  json: 'JSON',
  sql: 'SQL',
  yaml: 'YAML',
  html: 'HTML',
  css: 'CSS',
};

/** Tracks the `dark` class on <html>, which the theme toggle flips */
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const isDark = useIsDark();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabel = LANGUAGE_LABELS[language] ?? language.toUpperCase();

  return (
    <div className="code-window group">
      {/* Window chrome */}
      <div className="code-window-header">
        <div className="code-window-dots" aria-hidden="true">
          <span className="bg-[#ff5f57]" />
          <span className="bg-[#febc2e]" />
          <span className="bg-[#28c840]" />
        </div>

        {filename ? (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            {filename}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono select-none">
            {languageLabel}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {filename && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 bg-slate-900/5 dark:bg-white/5 ring-1 ring-slate-900/10 dark:ring-white/10 select-none">
              {languageLabel}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/10 transition-colors"
            title="Copy code"
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        showLineNumbers={showLineNumbers}
        lineNumberStyle={{
          color: isDark ? 'rgb(71 85 105)' : 'rgb(148 163 184)',
          minWidth: '2.25em',
        }}
        customStyle={{ margin: 0, background: 'transparent' }}
        codeTagProps={{ style: { background: 'transparent' } }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
