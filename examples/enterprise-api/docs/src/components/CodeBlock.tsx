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

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-slate-900 my-4">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
          <span className="text-sm text-slate-400 font-mono">{filename}</span>
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 text-sm font-mono">
      {children}
    </code>
  );
}
