'use client'

import Link from 'next/link'

export default function DocsHomePage() {
  return (
    <div
      className="docs-home"
      style={{
        padding: '4rem',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '900',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #667eea 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Emotive Engine Documentation
      </h1>

      <p style={{
        fontSize: '1.3rem',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '3rem',
        lineHeight: '1.8',
      }}>
        Everything you need to build emotionally intelligent interfaces with real-time particle animations.
      </p>

      {/* Quick Start Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
      }}>
        <Link
          href="/docs/guides/quick-start"
          style={{
            padding: '2rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#667eea' }}>Quick Start</h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Get up and running in 5 minutes
          </p>
        </Link>

        <Link
          href="/docs/api/constructor"
          style={{
            padding: '2rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#667eea' }}>API Reference</h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Complete API documentation
          </p>
        </Link>

        <Link
          href="/docs/examples/basic-setup"
          style={{
            padding: '2rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#667eea' }}>Examples</h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Learn by example
          </p>
        </Link>
      </div>

      {/* Key Features */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '2rem',
          color: '#ffffff',
        }}>
          Key Features
        </h2>

        <div style={{
          display: 'grid',
          gap: '1rem',
        }}>
          {[
            { icon: '🎭', title: 'Emotional States', desc: 'Joy, anger, love, fear, and more with dynamic undertones' },
            { icon: '🎨', title: 'Rich Gestures', desc: 'Bounce, spin, wave, pulse with musical timing' },
            { icon: '🎵', title: 'Audio Reactive', desc: 'Real-time beat detection and rhythm synchronization' },
            { icon: '⚡', title: '60fps Performance', desc: 'Optimized particle pooling and adaptive quality' },
            { icon: '📱', title: 'Mobile Optimized', desc: 'Touch support with performance scaling' },
            { icon: '🔧', title: 'TypeScript Ready', desc: 'Full type definitions included' },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: '#ffffff',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .docs-home {
            padding: 2rem 1.5rem !important;
          }

          .docs-home h1 {
            font-size: 2.5rem !important;
          }

          .docs-home > p {
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 480px) {
          .docs-home {
            padding: 1.5rem 1rem !important;
          }

          .docs-home h1 {
            font-size: 2rem !important;
          }

          .docs-home > p {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
