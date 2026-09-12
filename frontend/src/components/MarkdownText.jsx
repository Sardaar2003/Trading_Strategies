import React from 'react';

/**
 * Lightweight Zero-Dependency Custom Markdown Renderer
 * Parses **bold**, *italic*, `code`, ```codeblocks```, and bullet points into styled React elements.
 */
export const MarkdownText = ({ text }) => {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();

        // Code block check
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const lastIsEnd = lines[lines.length - 1].trim().startsWith('```');
          const codeLines = lines.slice(1, lastIsEnd ? -1 : lines.length);
          const codeContent = codeLines.join('\n');

          return (
            <div key={pIdx} style={{
              background: '#090d16',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              color: '#38bdf8',
              overflowX: 'auto',
              whiteSpace: 'pre',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
              margin: '6px 0'
            }}>
              {lang && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {lang}
                </div>
              )}
              {codeContent}
            </div>
          );
        }

        // List item check
        const lines = para.split('\n');
        const isBulletList = lines.length > 0 && lines.every(l => {
          const t = l.trim();
          return !t || t.startsWith('•') || t.startsWith('- ') || t.startsWith('* ') || /^\d+\./.test(t);
        });

        if (isBulletList) {
          return (
            <ul key={pIdx} style={{ margin: '4px 0', paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lines.map((line, lIdx) => {
                if (!line.trim()) return null;
                const cleanLine = line.replace(/^[•\-\*\d\.]+\s*/, '');
                return (
                  <li key={lIdx} style={{ color: 'var(--text-main)', fontSize: '0.89rem', lineHeight: 1.6 }}>
                    {renderInlineFormatting(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Heading 3 check
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={pIdx} style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
              {renderInlineFormatting(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }

        // Heading 2 check
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={pIdx} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '12px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
              {renderInlineFormatting(trimmed.replace(/^##\s*/, ''))}
            </h3>
          );
        }

        // Standard Paragraph
        return (
          <div key={pIdx} style={{ lineHeight: 1.68, fontSize: '0.89rem', color: 'var(--text-main)' }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineFormatting(line)}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const renderInlineFormatting = (textStr) => {
  if (!textStr) return '';

  const parts = [];
  let lastIdx = 0;
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
  let match;

  while ((match = regex.exec(textStr)) !== null) {
    if (match.index > lastIdx) {
      parts.push(textStr.substring(lastIdx, match.index));
    }

    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index} style={{ fontWeight: 800, color: 'var(--text-main)' }}>{match[2]}</strong>);
    } else if (match[0].startsWith('`')) {
      parts.push(
        <code key={match.index} style={{
          background: 'rgba(0, 242, 254, 0.12)',
          color: 'var(--color-primary)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.825rem',
          border: '1px solid rgba(0, 242, 254, 0.25)'
        }}>
          {match[4]}
        </code>
      );
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={match.index} style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{match[3]}</em>);
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < textStr.length) {
    parts.push(textStr.substring(lastIdx));
  }

  return parts;
};
