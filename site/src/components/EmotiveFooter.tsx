'use client'

const FOOTER_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/joshtol/emotive-engine',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'npm',
    href: 'https://www.npmjs.com/package/@joshtol/emotive-engine',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4zm-12-2.4h4.8V9.6h2.4v7.2h2.4V7.2H7.2v9.6z" />
      </svg>
    ),
  },
  {
    label: 'CodePen',
    href: 'https://codepen.io/collection/RPgQNZ',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075l-.012-.025-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.03-.044-.015-.075-.015H18.98l-6.96-4.604V.25a.25.25 0 0 0-.25-.25h-1.54a.25.25 0 0 0-.25.25v3.196l-6.96 4.604H.248a.25.25 0 0 0-.25.25v7.636c0 .068.027.134.076.183l7.957 7.972c.05.05.116.077.184.077h7.57a.26.26 0 0 0 .184-.077l7.957-7.972a.258.258 0 0 0 .076-.183V8.432a.248.248 0 0 0-.002-.25zm-11.99 7.886l-1.964-1.572 1.964-1.572 1.964 1.572-1.964 1.572zm-2.664-4.699L7.38 9.195l4.97-3.291v6.465zm1.4 0V5.904l4.97 3.291-1.966 1.574-3.004-2.4zm-6.638 1.4l1.966 1.573-1.966 1.573V12.77zm1.4 2.625l4.97 3.29-1.965 1.572-3.005-2.4v-2.462zm3.57 3.29l1.965-1.572 1.965 1.572-1.965 1.573-1.965-1.573zm3.57-3.29l4.97-3.29v2.46l-3.004 2.4-1.966-1.57zm1.4-4.197l1.966-1.574v3.147l-1.966-1.573z" />
      </svg>
    ),
  },
  {
    label: 'Dev.to',
    href: 'https://dev.to/joshtol/8-glsl-shader-systems-in-6-months-building-elemental-effects-for-a-character-animation-engine-2jmb',
    icon: (
      <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
        <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.36 28.46 47.37 47.28l.01 70.93zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-62.18c-11.16.29-20.44-8.53-20.72-19.69V193.7c-.27-11.15 8.56-20.41 19.71-20.69h63.19l-.01 29.52zm103.64 115.29c-13.2 30.75-36.85 24.63-47.44 0l-38.53-144.8h32.57l29.71 113.72 29.57-113.72h32.58l-38.46 144.8z" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/EmotiveEngine',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.841L1.254 2.25H8.08l4.261 5.634 5.903-5.634zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export default function EmotiveFooter() {
  return (
    <div className="legal-footer" style={{ padding: '1.5rem clamp(1rem, 3vw, 2rem)' }}>
      <div className="footer-content" style={{ maxWidth: '1200px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="trademark">emotive ENGINE™</span>
          <span className="separator">•</span>
          <span className="copyright">© 2026 Joshua Tollette</span>
          <span className="separator">•</span>
          <a
            className="footer-link"
            href="https://github.com/joshtol/emotive-engine/blob/main/LICENSE.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
          </a>
        </div>

        <div className="footer-links">
          {FOOTER_LINKS.map(({ label, href, icon }) => (
            <a
              key={label}
              className="footer-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {icon}
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
