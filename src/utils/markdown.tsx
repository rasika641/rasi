import React, { useState } from 'react';
import { Check, Copy, Lightbulb, Terminal } from 'lucide-react';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3 leading-relaxed text-sm md:text-base ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const code = language ? lines.slice(1).join('\n') : lines.join('\n');

          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Regular block with math and formatting
        return <FormattedBlock key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/90 text-slate-100 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-1.5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-mono text-emerald-400">
          <Terminal className="h-3.5 w-3.5" />
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-slate-800 hover:text-white transition"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs md:text-sm leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-5 list-disc text-inherit marker:text-emerald-500">
          {listItems}
        </ul>
      );
    } else if (inList === 'ol') {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5 pl-5 list-decimal text-inherit marker:font-semibold marker:text-emerald-500">
          {listItems}
        </ol>
      );
    }
    inList = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // Display Math block: $$ ... $$
    if (line.startsWith('$$') && line.endsWith('$$') && line.length > 2) {
      flushList();
      const formula = line.slice(2, -2).trim();
      elements.push(
        <div
          key={`math-${i}`}
          className="my-3 flex items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-950/30 p-3 font-mono text-sm md:text-base text-indigo-700 dark:text-indigo-300 shadow-xs"
        >
          <span className="font-semibold tracking-wide">📐 {formula}</span>
        </div>
      );
      continue;
    }

    // Blockquote / Tip / Analogy callout
    if (line.startsWith('>')) {
      flushList();
      const quoteText = line.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-3 flex items-start gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/10 p-3.5 text-sm dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200"
        >
          <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1">{formatInline(quoteText)}</div>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${i}`} className="mt-4 mb-1.5 font-bold text-base md:text-lg text-slate-900 dark:text-slate-100">
          {formatInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${i}`} className="mt-5 mb-2 font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {formatInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${i}`} className="mt-6 mb-3 font-extrabold text-xl md:text-2xl text-slate-900 dark:text-slate-50">
          {formatInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^[-*•]\s+(.*)/);
    if (ulMatch) {
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
      }
      listItems.push(<li key={`li-${i}`}>{formatInline(ulMatch[1])}</li>);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
      }
      listItems.push(<li key={`oli-${i}`}>{formatInline(olMatch[2])}</li>);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
        {formatInline(line)}
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
};

// Formats inline markdown: bold, italics, inline code, inline math $...$
function formatInline(text: string): React.ReactNode {
  // Regex to match inline code `...`, inline math $...$, bold **...**, and italics *...*
  const tokenRegex = /(`[^`]+`|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded-md bg-slate-200/80 px-1.5 py-0.5 font-mono text-xs md:text-sm font-medium text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 border border-slate-300/40 dark:border-slate-700/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      return (
        <span
          key={index}
          className="mx-0.5 rounded px-1.5 py-0.5 font-mono text-xs md:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
