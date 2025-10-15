'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import DocsFeedback from './DocsFeedback'

interface DocsContentProps {
  title: string
  content: string
}

export default function DocsContent({ title, content }: DocsContentProps) {
  const pathname = usePathname()
  useEffect(() => {
    // Add syntax highlighting to code blocks
    const codeBlocks = document.querySelectorAll('pre code')
    codeBlocks.forEach((block) => {
      block.classList.add('hljs')
    })
  }, [content])

  return (
    <article
      className="docs-article"
      style={{
        flex: 1,
        padding: '3rem 4rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Title */}
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '700',
        marginBottom: '2rem',
        color: '#ffffff',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>

      {/* Content */}
      <div
        className="docs-content"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          fontSize: '1rem',
          lineHeight: '1.8',
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      />

      {/* Feedback Widget */}
      <DocsFeedback docPath={pathname} />

      {/* Edit on GitHub Link */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
      }}>
        <a
          href={`https://github.com/joshtol/emotive-engine/edit/main/docs${pathname.replace('/docs', '')}.md`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#667eea',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a5b4fc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#667eea'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit this page on GitHub
        </a>
      </div>

      {/* Styles for markdown content */}
      <style jsx global>{`
        .docs-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          color: #ffffff;
          letter-spacing: -0.01em;
          border-bottom: 2px solid rgba(102, 126, 234, 0.2);
        }

        .docs-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .docs-content h4 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #a5b4fc;
        }

        .docs-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .docs-content strong {
          font-weight: 700;
          color: #ffffff;
        }

        .docs-content ul,
        .docs-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .docs-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }

        .docs-content ul ul,
        .docs-content ol ol {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .docs-content a {
          color: #667eea;
          text-decoration: none;
          border-bottom: 1px solid rgba(102, 126, 234, 0.3);
          transition: all 0.2s ease;
        }

        .docs-content a:hover {
          color: #a5b4fc;
          border-bottom-color: #a5b4fc;
        }

        .docs-content code {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 4px;
          padding: 0.2rem 0.4rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #a5b4fc;
        }

        .docs-content pre {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .docs-content pre code {
          background: none;
          border: none;
          padding: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .docs-content blockquote {
          border-left: 4px solid #667eea;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }

        .docs-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2rem 0;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }

        .docs-content th,
        .docs-content td {
          padding: 1rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid rgba(102, 126, 234, 0.15);
        }

        .docs-content thead th {
          background: rgba(102, 126, 234, 0.15);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #a5b4fc;
          border-bottom: 2px solid rgba(102, 126, 234, 0.3);
        }

        .docs-content tbody tr:last-child td {
          border-bottom: none;
        }

        .docs-content tbody tr:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .docs-content td {
          color: rgba(255, 255, 255, 0.9);
          vertical-align: top;
        }

        .docs-content td:first-child {
          font-weight: 600;
          color: #ffffff;
        }

        .docs-content td code {
          background: rgba(102, 126, 234, 0.2);
          padding: 0.15rem 0.4rem;
          font-size: 0.85em;
        }

        .docs-content hr {
          border: none;
          border-top: 1px solid rgba(102, 126, 234, 0.2);
          margin: 3rem 0;
        }

        .docs-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 2rem 0;
        }

        /* Custom note boxes */
        .docs-content .note {
          background: rgba(102, 126, 234, 0.1);
          border-left: 4px solid #667eea;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          margin: 1.5rem 0;
        }

        .docs-content .warning {
          background: rgba(245, 158, 11, 0.1);
          border-left: 4px solid #F59E0B;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          margin: 1.5rem 0;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .docs-article {
            padding: 2rem 1.5rem !important;
          }

          .docs-article h1 {
            font-size: 2rem !important;
          }

          .docs-content h2 {
            font-size: 1.5rem !important;
          }

          .docs-content h3 {
            font-size: 1.25rem !important;
          }

          .docs-content h4 {
            font-size: 1.1rem !important;
          }

          .docs-content table {
            font-size: 0.85rem;
          }

          .docs-content th,
          .docs-content td {
            padding: 0.75rem 1rem !important;
          }

          .docs-content pre {
            padding: 1rem !important;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .docs-article {
            padding: 1.5rem 1rem !important;
          }

          .docs-article h1 {
            font-size: 1.75rem !important;
          }

          .docs-content table {
            font-size: 0.8rem;
            display: block;
            overflow-x: auto;
          }

          .docs-content th,
          .docs-content td {
            padding: 0.5rem 0.75rem !important;
          }
        }
      `}</style>
    </article>
  )
}
