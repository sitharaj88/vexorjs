import { Highlight, themes, type Language } from 'prism-react-renderer';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

// Map common language aliases to prism-react-renderer supported languages
const languageMap: Record<string, Language> = {
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'jsx',
  tsx: 'tsx',
  bash: 'bash',
  shell: 'bash',
  sh: 'bash',
  json: 'json',
  css: 'css',
  html: 'markup',
  xml: 'markup',
  markdown: 'markdown',
  md: 'markdown',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  python: 'python',
  py: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  diff: 'diff',
};

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Map language to prism-react-renderer language
  const prismLanguage = languageMap[language.toLowerCase()] || 'typescript';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block group relative">
      {filename && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800 border-b border-slate-700/50">
          <span className="text-xs text-slate-400 font-mono">{filename}</span>
          <button
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 text-slate-400 hover:text-white transition-colors p-1.5 rounded bg-slate-800/90 hover:bg-slate-700"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
        <Highlight theme={themes.nightOwl} code={code.trim()} language={prismLanguage}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={clsx(
                className,
                'p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed'
              )}
              style={{ ...style, backgroundColor: '#011627' }}
            >
              <code>
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line });
                  return (
                    <div key={i} {...lineProps} className={clsx(lineProps.className, 'table-row')}>
                      {showLineNumbers && (
                        <span className="table-cell w-8 sm:w-10 text-slate-500 select-none text-right pr-3 sm:pr-4 sticky left-0 bg-[#011627]">
                          {i + 1}
                        </span>
                      )}
                      <span className="table-cell">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
