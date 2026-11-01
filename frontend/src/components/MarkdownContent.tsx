import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isUser = false }) => {
  if (isUser) {
    return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
  }

  return (
    <div className="text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-950">{children}</strong>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 mt-3 mb-1.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mt-2.5 mb-1">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1.5 my-2 text-slate-800">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-2 my-2 text-slate-800">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-slate-500 marker:font-semibold">{children}</li>
          ),
          hr: () => (
            <hr className="my-3 border-slate-200" />
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-xs text-slate-900 font-semibold">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 my-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-slate-300 pl-3 my-2 italic text-slate-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
