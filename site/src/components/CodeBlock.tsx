import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <span className="text-xs text-slate-400 font-mono truncate">{filename}</span>
        ) : (
          <span className="text-xs text-slate-500 font-mono select-none">
            {LANGUAGE_LABELS[language] ?? language.toUpperCase()}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {filename && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide text-slate-400 bg-white/5 ring-1 ring-white/10 select-none">
              {LANGUAGE_LABELS[language] ?? language.toUpperCase()}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors"
            title="Copy code"
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Copied</span>
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
        style={oneDark}
        showLineNumbers={showLineNumbers}
        lineNumberStyle={{ color: 'rgb(71 85 105)', minWidth: '2.25em' }}
        customStyle={{ margin: 0, background: 'transparent' }}
        codeTagProps={{ style: { background: 'transparent' } }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
