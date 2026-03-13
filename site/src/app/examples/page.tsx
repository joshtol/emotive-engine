'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, string> = {
  '2d':  '#38bdf8',
  '3d':  '#a78bfa',
}

interface Example {
  id: string
  title: string
  description: string
  category: '2d' | '3d'
  path: string
  preview?: string          // screenshot/gif path — placeholder gradient if missing
  featured?: boolean        // spans 2 columns on desktop
  portrait?: boolean        // tall 3:4 aspect — sits next to featured cards
}

const examples: Example[] = [
  {
    id: '3d-elemental',
    title: '3D Elemental',
    description: 'Fire, ice, electric, and water effects firing simultaneously.',
    category: '3d',
    path: '/examples/3d/elemental-gestures',
    preview: '/screenshots/examples/hero-elemental-portrait.webm',
    portrait: true,
  },
  // ── 2D Canvas ──────────────────────────────────────────────
  {
    id: 'crystal-demo',
    title: 'Crystal Soul',
    description: 'Frosted crystal with inner soul glow and SSS presets.',
    category: '3d',
    path: '/examples/3d/crystal',
    preview: '/screenshots/examples/crystal.webm',
  },
  {
    id: 'basic-usage',
    title: 'Basic Usage',
    description: 'Emotions, gestures, and shapes with keyboard shortcuts.',
    category: '2d',
    path: '/examples/2d/basic-usage',
    preview: '/screenshots/examples/basic-usage.webm',
  },
  {
    id: 'sun-demo',
    title: 'Solar Eclipse',
    description: 'Solar eclipse with corona effects and blend layers.',
    category: '3d',
    path: '/examples/3d/sun',
    preview: '/screenshots/examples/sun.webm',
    featured: true,
  },
  // ── 3D WebGL ───────────────────────────────────────────────
  {
    id: '3d-showcase',
    title: '3D Showcase',
    description: 'SSS material presets, emotions, and gestures on crystal geometry.',
    category: '3d',
    path: '/examples/3d/showcase',
    preview: '/screenshots/examples/3d-showcase-portrait.webm',
    portrait: true,
  },
  {
    id: 'dual-mascot',
    title: 'Dual Mascot',
    description: 'Two independent 3D mascots running simultaneously on one page.',
    category: '3d',
    path: '/examples/3d/dual-mascot',
    preview: '/screenshots/examples/dual-mascot-portrait.webm',
    portrait: true,
  },
  {
    id: 'moon-demo',
    title: 'Moon Phases',
    description: 'Realistic moon with 8 phases and tidal lock camera.',
    category: '3d',
    path: '/examples/3d/moon',
    preview: '/screenshots/examples/moon.webm',
  },
  {
    id: 'blood-moon',
    title: 'Blood Moon Eclipse',
    description: 'Lunar eclipse with shadow sweep and Rayleigh scattering.',
    category: '3d',
    path: '/examples/3d/blood-moon',
    preview: '/screenshots/examples/blood-moon.webm',
    featured: true,
  },
  {
    id: 'groove-demo',
    title: 'Groove Demo',
    description: 'Music-reactive dance with groove modes and beat detection.',
    category: '3d',
    path: '/examples/3d/groove-demo',
    preview: '/screenshots/examples/groove-portrait.webm',
    portrait: true,
  },
  {
    id: 'rhythm-sync',
    title: 'Rhythm Sync',
    description: 'Beat-synchronized animations with tap tempo.',
    category: '2d',
    path: '/examples/2d/rhythm-sync',
    preview: '/screenshots/examples/rhythm-sync.webm',
  },
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Minimal setup — one mascot, four lines.',
    category: '2d',
    path: '/examples/2d/hello-world',
    preview: '/screenshots/examples/hello-world.webm',
  },
]

function PreviewImage({ example }: { example: Example }) {
  const [failed, setFailed] = useState(false)
  const color = CATEGORY_COLORS[example.category]

  const aspectRatio = example.portrait ? undefined : example.featured ? '21 / 9' : '16 / 9'

  if (!example.preview || failed) {
    // Gradient placeholder — tinted by category
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: aspectRatio ?? '3 / 4',
          flex: example.portrait ? 1 : undefined,
          minHeight: example.portrait ? 0 : undefined,
          background: `linear-gradient(135deg, ${color}18 0%, ${color}08 50%, ${color}18 100%)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          width: example.featured ? 80 : 56,
          height: example.featured ? 80 : 56,
          borderRadius: '50%',
          border: `1px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: `${color}66`, fontSize: example.featured ? 28 : 20 }}>
            {example.category === '2d' ? '◲' : example.category === '3d' ? '◆' : '◎'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      ...(example.portrait ? { flex: 1, minHeight: 0 } : { aspectRatio }),
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
    }}>
      <video
        src={example.preview}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  )
}

export default function ExamplesPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <main style={{
      minHeight: 'calc(100vh - 80px)',
      paddingTop: 0,
      background: '#0a0a0c',
    }}>
      {/* Cards grid */}
      <div style={{
        padding: '0 1.5rem 4rem',
      }}>
      <div style={{
        display: 'grid',
        gap: '1px',
        maxWidth: 1200,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .examples-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
            grid-auto-flow: dense;
          }
          @media (min-width: 640px) {
            .examples-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .examples-grid .card-featured {
              grid-column: span 2;
            }
            .examples-grid .card-portrait {
              grid-row: span 2;
            }
          }
          @media (min-width: 1024px) {
            .examples-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .card-hero {
            background: #0a0a0c !important;
            border: none !important;
            position: relative;
            overflow: visible !important;
            z-index: 1;
            box-shadow:
              0 0 60px 10px rgba(167,139,250,0.12),
              0 0 120px 20px rgba(56,189,248,0.06),
              0 20px 60px -10px rgba(0,0,0,0.8) !important;
            transition: box-shadow 0.4s ease, transform 0.4s ease !important;
          }
          .card-hero:hover {
            transform: scale(1.01);
            box-shadow:
              0 0 80px 15px rgba(167,139,250,0.18),
              0 0 160px 30px rgba(56,189,248,0.09),
              0 30px 80px -10px rgba(0,0,0,0.9) !important;
          }
          .card-hero .hero-body {
            position: relative;
            overflow: hidden;
          }
          .card-hero .hero-body::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              105deg,
              transparent 20%,
              rgba(167,139,250,0.07) 35%,
              rgba(255,255,255,0.10) 38%,
              rgba(56,189,248,0.07) 41%,
              transparent 55%
            );
            background-size: 250% 100%;
            animation: heroShimmer 10s linear infinite;
            pointer-events: none;
            z-index: 1;
            opacity: 0;
          }
          @keyframes heroShimmer {
            0% { background-position: 200% 0; opacity: 0; }
            5% { opacity: 1; }
            15% { opacity: 1; }
            20% { background-position: -50% 0; opacity: 0; }
            100% { background-position: -50% 0; opacity: 0; }
          }
          .card-hero::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 13px;
            background: linear-gradient(
              160deg,
              rgba(167,139,250,0.25),
              rgba(56,189,248,0.15),
              rgba(167,139,250,0.05),
              rgba(103,232,249,0.20)
            );
            z-index: -1;
            filter: blur(1px);
            opacity: 0.6;
            transition: opacity 0.4s ease;
          }
          .card-hero:hover::after {
            opacity: 1;
          }
        `}} />
        <div className="examples-grid">
          {examples.map(example => {
            const color = CATEGORY_COLORS[example.category]
            const isHovered = hoveredId === example.id
            const isHero = example.id === '3d-elemental'
            return (
              <Link
                key={example.id}
                href={example.path}
                className={[
                  example.featured ? 'card-featured' : example.portrait ? 'card-portrait' : null,
                  isHero ? 'card-hero' : null,
                ].filter(Boolean).join(' ')}
                onMouseEnter={() => setHoveredId(example.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#0a0a0c',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  boxShadow: !isHero && isHovered ? `inset 0 0 0 1px ${color}44, 0 8px 32px ${color}15` : 'none',
                }}
              >
                {/* Preview image / placeholder */}
                <PreviewImage example={example} />

                {/* Card body */}
                <div className={isHero ? 'hero-body' : undefined} style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', flexShrink: 0 }}>
                  {/* Category + title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      color: `${color}cc`,
                      background: `${color}15`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: `1px solid ${color}22`,
                    }}>
                      {example.category}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: example.featured ? 'clamp(1.125rem, 2vw, 1.375rem)' : 'clamp(1rem, 1.5vw, 1.125rem)',
                    fontWeight: 600,
                    color: '#F2F1F1',
                    marginBottom: '0.375rem',
                  }}>
                    {example.title}
                  </h3>

                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#888',
                    lineHeight: 1.5,
                  }}>
                    {example.description}
                  </p>

                  {/* Bottom arrow */}
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.8125rem',
                    color: isHovered ? `${color}cc` : 'rgba(255,255,255,0.25)',
                    marginTop: '0.75rem',
                    transition: 'color 0.2s ease',
                  }}>
                    View example →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      </div>
    </main>
  )
}
