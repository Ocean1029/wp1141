// MarkdownRenderer component - renders Markdown content with proper styling
// Supports GitHub Flavored Markdown (GFM) features

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/MarkdownRenderer.css';

// Type definitions for react-markdown components
type MarkdownComponentProps = {
  children?: React.ReactNode;
  className?: string;
  href?: string;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different elements
          h1: ({ children }: MarkdownComponentProps) => (
            <h1 className="markdown-h1">{children}</h1>
          ),
          h2: ({ children }: MarkdownComponentProps) => (
            <h2 className="markdown-h2">{children}</h2>
          ),
          h3: ({ children }: MarkdownComponentProps) => (
            <h3 className="markdown-h3">{children}</h3>
          ),
          h4: ({ children }: MarkdownComponentProps) => (
            <h4 className="markdown-h4">{children}</h4>
          ),
          h5: ({ children }: MarkdownComponentProps) => (
            <h5 className="markdown-h5">{children}</h5>
          ),
          h6: ({ children }: MarkdownComponentProps) => (
            <h6 className="markdown-h6">{children}</h6>
          ),
          p: ({ children }: MarkdownComponentProps) => (
            <p className="markdown-p">{children}</p>
          ),
          strong: ({ children }: MarkdownComponentProps) => (
            <strong className="markdown-strong">{children}</strong>
          ),
          em: ({ children }: MarkdownComponentProps) => (
            <em className="markdown-em">{children}</em>
          ),
          u: ({ children }: MarkdownComponentProps) => (
            <u className="markdown-u">{children}</u>
          ),
          del: ({ children }: MarkdownComponentProps) => (
            <del className="markdown-del">{children}</del>
          ),
          code: ({ children, className }: MarkdownComponentProps) => {
            const isInline = !className;
            return isInline ? (
              <code className="markdown-code-inline">{children}</code>
            ) : (
              <code className="markdown-code-block">{children}</code>
            );
          },
          pre: ({ children }: MarkdownComponentProps) => (
            <pre className="markdown-pre">{children}</pre>
          ),
          blockquote: ({ children }: MarkdownComponentProps) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          ul: ({ children }: MarkdownComponentProps) => (
            <ul className="markdown-ul">{children}</ul>
          ),
          ol: ({ children }: MarkdownComponentProps) => (
            <ol className="markdown-ol">{children}</ol>
          ),
          li: ({ children }: MarkdownComponentProps) => (
            <li className="markdown-li">{children}</li>
          ),
          a: ({ children, href }: MarkdownComponentProps) => (
            <a href={href} className="markdown-a" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }: MarkdownComponentProps) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          thead: ({ children }: MarkdownComponentProps) => (
            <thead className="markdown-thead">{children}</thead>
          ),
          tbody: ({ children }: MarkdownComponentProps) => (
            <tbody className="markdown-tbody">{children}</tbody>
          ),
          tr: ({ children }: MarkdownComponentProps) => (
            <tr className="markdown-tr">{children}</tr>
          ),
          th: ({ children }: MarkdownComponentProps) => (
            <th className="markdown-th">{children}</th>
          ),
          td: ({ children }: MarkdownComponentProps) => (
            <td className="markdown-td">{children}</td>
          ),
          hr: () => (
            <hr className="markdown-hr" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
