/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Parses text containing $...$ (inline math) and $$...$$ (block math) and renders them with KaTeX.
 * Plain text outside math delimiters is rendered as standard text.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split by block math $$...$$ first, then inline math $...$
    // Regex matches $$...$$ or $...$
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto py-1 font-serif text-current"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code key={index} className="my-1 block rounded bg-slate-100 p-2 font-mono text-xs text-rose-600">
              {math}
            </code>
          );
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5 font-serif text-current"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-rose-600">
              {math}
            </code>
          );
        }
      }

      // Plain text with line breaks preserved
      return <span key={index}>{part}</span>;
    });
  }, [content]);

  if (inline) {
    return <span className={`math-content ${className}`}>{renderedElements}</span>;
  }

  return <div className={`math-content leading-relaxed ${className}`}>{renderedElements}</div>;
};

export default MathRenderer;
