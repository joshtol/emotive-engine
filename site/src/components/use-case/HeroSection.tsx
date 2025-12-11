'use client'

import { ReactNode, CSSProperties } from 'react'

export interface HeroSectionProps {
  /** Tag label shown at top (e.g., "Cherokee Language • Cultural Learning") */
  tagLabel?: string
  /** Main title (usually in native script) */
  title: string
  /** Subtitle below main title */
  subtitle?: string
  /** Description paragraph */
  description?: string
  /** Optional callout box content */
  callout?: ReactNode
  /** Call-to-action buttons */
  actions?: ReactNode
  /** Accent color as RGB values (e.g., "218, 165, 32") */
  accentRgb?: string
  /** Accent color as hex (e.g., "#DAA520") */
  accentHex?: string
  /** Title gradient colors */
  titleGradient?: string
  /** Additional content below actions */
  children?: ReactNode
  /** Minimum height (default: 75vh) */
  minHeight?: string
}

export default function HeroSection({
  tagLabel,
  title,
  subtitle,
  description,
  callout,
  actions,
  accentRgb = '218, 165, 32',
  accentHex = '#DAA520',
  titleGradient,
  children,
  minHeight = '75vh',
}: HeroSectionProps) {
  const defaultTitleGradient = `linear-gradient(135deg, ${accentHex} 0%, #FFB347 50%, #F8B739 100%)`

  return (
    <section
      className="uc-hero"
      style={{
        minHeight,
      }}
    >
      {/* Background layers */}
      <div
        className="uc-hero-bg"
        style={{
          background: `radial-gradient(ellipse at top, rgba(${accentRgb}, 0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '100%',
          maxWidth: '800px',
          height: '400px',
          background: `radial-gradient(ellipse, rgba(${accentRgb}, 0.08) 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1000px',
          width: '100%',
          textAlign: 'center',
          paddingTop: 'clamp(8rem, 20vh, 12rem)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Tag label */}
        {tagLabel && (
          <div className="uc-tag" style={{ marginBottom: '3rem' }}>
            {tagLabel}
          </div>
        )}

        {/* Main title */}
        <h1
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
            fontWeight: '900',
            marginBottom: '2.5rem',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            background: titleGradient || defaultTitleGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: `0 0 80px rgba(${accentRgb}, 0.3)`,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <h2
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: '600',
              marginBottom: '2rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
            }}
          >
            {subtitle}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto 3rem',
            }}
          >
            {description}
          </p>
        )}

        {/* Callout box */}
        {callout && (
          <div
            style={{
              display: 'inline-block',
              padding: '1rem 1.75rem',
              background: `linear-gradient(135deg, rgba(${accentRgb}, 0.18) 0%, rgba(${accentRgb}, 0.08) 100%)`,
              border: `1px solid rgba(${accentRgb}, 0.35)`,
              borderRadius: '16px',
              marginBottom: '3rem',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.5',
              maxWidth: '650px',
              boxShadow: `0 4px 20px rgba(${accentRgb}, 0.15)`,
            }}
          >
            {callout}
          </div>
        )}

        {/* CTA Actions */}
        {actions && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2rem',
            }}
          >
            {actions}
          </div>
        )}

        {children}
      </div>

      {/* Bottom gradient fade */}
      <div className="uc-hero-gradient" />
    </section>
  )
}
