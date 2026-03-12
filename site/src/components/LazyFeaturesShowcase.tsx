'use client'

import { useState, useEffect, useRef } from 'react'

const FEATURES_WIDE = [
  {
    stat: '8',
    title: 'Fragment shaders',
    description: 'Ice, fire, water, electric, void, light, earth, nature. Each element has its own GLSL — Voronoi cracks, plasma arcs, fluid ripples, crystal refraction.',
    color: '#a78bfa',
  },
  {
    stat: '169',
    title: 'Gestures',
    description: 'Crown, vortex, impact, drill, helix, barrage, splash, encase... plus idle animations: breathe, sway, float, bob, drift, peek.',
    color: '#f97316',
  },
]

const FEATURES_NARROW = [
  {
    stat: '60fps',
    title: 'WebGL canvas',
    description: 'Tested at 1000+ simultaneous instanced particles. Automatic Canvas 2D fallback.',
    color: '#67e8f9',
  },
  {
    stat: 'init()',
    title: 'then express()',
    description: 'That\'s the API. Works in React, Vue, Svelte, and vanilla JS.',
    color: '#38bdf8',
  },
  {
    stat: 'TS',
    title: 'TypeScript',
    description: 'Typed throughout. All gestures, elements, and parameters have definitions.',
    color: '#818cf8',
  },
  {
    stat: 'MIT',
    title: 'License',
    description: 'Do whatever you want with it.',
    color: '#4ade80',
  },
]

export default function LazyFeaturesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) setIsVisible(true)
      },
      { threshold: 0.05, rootMargin: '120px' }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isVisible])

  return (
    <section
      ref={containerRef}
      style={{
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        minHeight: isVisible ? 'auto' : '500px',
      }}
    >
      <style>{`
        .features-bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .feature-wide { grid-column: span 2; }
        .feature-narrow { grid-column: span 1; }
        .feature-cell {
          background: #0a0a0c;
          transition: background 0.2s ease;
        }
        .feature-cell:hover { background: #0f0f12; }
        @media (max-width: 767px) {
          .features-bento { grid-template-columns: repeat(2, 1fr); }
          .feature-wide { grid-column: span 2; }
        }
        @media (max-width: 420px) {
          .features-bento { grid-template-columns: 1fr; }
          .feature-wide { grid-column: span 1; }
          .feature-narrow { grid-column: span 1; }
        }
      `}</style>

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <h2 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '700',
          marginBottom: '0.75rem',
          letterSpacing: '-0.03em',
          color: '#ffffff',
        }}>
          What's shipped.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>
          Eight shader systems, 169 gestures, one small bundle.
        </p>
      </div>

      {/* Bento grid */}
      {isVisible ? (
        <div className="features-bento">
          {/* Wide cards — top row */}
          {FEATURES_WIDE.map((f, i) => (
            <div
              key={f.stat}
              className={`feature-cell feature-wide`}
              style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}
            >
              <div style={{
                fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                fontWeight: '700',
                fontFamily: 'var(--font-primary)',
                color: f.color,
                lineHeight: 1,
                marginBottom: '0.5rem',
                letterSpacing: '-0.04em',
              }}>
                {f.stat}
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0.6rem',
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '320px',
              }}>
                {f.description}
              </p>
            </div>
          ))}

          {/* Narrow cards — bottom row */}
          {FEATURES_NARROW.map((f) => (
            <div
              key={f.stat}
              className="feature-cell feature-narrow"
              style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)' }}
            >
              <div style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                fontWeight: '700',
                fontFamily: 'var(--font-primary)',
                color: f.color,
                lineHeight: 1,
                marginBottom: '0.4rem',
                letterSpacing: '-0.03em',
              }}>
                {f.stat}
              </div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '0.35rem',
              }}>
                {f.title}
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.38)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Skeleton */
        <div className="features-bento" style={{ opacity: 0.2 }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`feature-cell ${i < 2 ? 'feature-wide' : 'feature-narrow'}`}
              style={{ height: i < 2 ? '160px' : '120px' }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
