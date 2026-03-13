'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, string> = {
  '2d':  '#38bdf8',
  '3d':  '#a78bfa',
  'llm': '#67e8f9',
}

const CATEGORY_LABELS: Record<string, string> = {
  '2d':  '2D Canvas',
  '3d':  '3D WebGL',
  'llm': 'LLM',
}

interface Example {
  id: string
  title: string
  description: string
  category: '2d' | '3d' | 'llm'
  path: string
  preview?: string          // screenshot/gif path — placeholder gradient if missing
  featured?: boolean        // spans 2 columns on desktop
}

const examples: Example[] = [
  // ── 2D Canvas ──────────────────────────────────────────────
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Minimal setup — one mascot, four lines.',
    category: '2d',
    path: '/examples/2d/hello-world',
    preview: '/screenshots/examples/hello-world.gif',
  },
  {
    id: 'basic-usage',
    title: 'Basic Usage',
    description: 'Emotions, gestures, and shapes with keyboard shortcuts.',
    category: '2d',
    path: '/examples/2d/basic-usage',
    preview: '/screenshots/examples/basic-usage.gif',
  },
  {
    id: 'event-handling',
    title: 'Event Handling',
    description: 'Monitor mascot events in real-time with filtering.',
    category: '2d',
    path: '/examples/2d/event-handling',
    preview: '/screenshots/examples/event-handling.gif',
  },
  {
    id: 'rhythm-sync',
    title: 'Rhythm Sync',
    description: 'Beat-synchronized animations with tap tempo.',
    category: '2d',
    path: '/examples/2d/rhythm-sync',
    preview: '/screenshots/examples/rhythm-sync.gif',
  },
  // ── 3D WebGL ───────────────────────────────────────────────
  {
    id: '3d-showcase',
    title: '3D Showcase',
    description: 'SSS material presets, emotions, and gestures on crystal geometry.',
    category: '3d',
    path: '/examples/3d/showcase',
    preview: '/screenshots/examples/3d-showcase.gif',
    featured: true,
  },
  {
    id: '3d-elemental',
    title: '3D Elemental',
    description: 'Fire, ice, electric, and water effects firing simultaneously.',
    category: '3d',
    path: '/examples/3d/elemental-gestures',
    preview: '/screenshots/examples/3d-elemental.gif',
    featured: true,
  },
  {
    id: 'crystal-demo',
    title: 'Crystal Soul',
    description: 'Frosted crystal with inner soul glow and SSS presets.',
    category: '3d',
    path: '/examples/3d/crystal',
    preview: '/screenshots/examples/crystal.gif',
  },
  {
    id: 'moon-demo',
    title: 'Moon Phases',
    description: 'Realistic moon with 8 phases and tidal lock camera.',
    category: '3d',
    path: '/examples/3d/moon',
    preview: '/screenshots/examples/moon.gif',
  },
  {
    id: 'blood-moon',
    title: 'Blood Moon Eclipse',
    description: 'Lunar eclipse with shadow sweep and Rayleigh scattering.',
    category: '3d',
    path: '/examples/3d/blood-moon',
    preview: '/screenshots/examples/blood-moon.gif',
    featured: true,
  },
  {
    id: 'sun-demo',
    title: 'Solar Eclipse',
    description: 'Solar eclipse with corona effects and blend layers.',
    category: '3d',
    path: '/examples/3d/sun',
    preview: '/screenshots/examples/sun.gif',
  },
  {
    id: 'dual-mascot',
    title: 'Dual Mascot',
    description: 'Two independent 3D mascots running simultaneously on one page.',
    category: '3d',
    path: '/examples/3d/dual-mascot',
    preview: '/screenshots/examples/dual-mascot.gif',
  },
  // ── LLM Integration ────────────────────────────────────────
  {
    id: 'claude-haiku',
    title: 'Claude Chat',
    description: 'Emotional AI assistant with Claude Haiku integration.',
    category: 'llm',
    path: '/examples/llm/claude-chat',
    preview: '/screenshots/examples/claude-chat.gif',
  },
]

function PreviewImage({ example }: { example: Example }) {
  const [failed, setFailed] = useState(false)
  const color = CATEGORY_COLORS[example.category]

  if (!example.preview || failed) {
    // Gradient placeholder — tinted by category
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: example.featured ? '21 / 9' : '16 / 9',
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
      aspectRatio: example.featured ? '21 / 9' : '16 / 9',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
    }}>
      <img
        src={example.preview}
        alt={example.title}
        onError={() => setFailed(true)}
        loading="lazy"
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | '2d' | '3d' | 'llm'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredExamples = selectedCategory === 'all'
    ? examples
    : examples.filter(e => e.category === selectedCategory)

  const categories = ['all', '2d', '3d', 'llm'] as const

  return (
    <main style={{
      minHeight: 'calc(100vh - 80px)',
      padding: '120px 1.5rem 4rem',
      background: '#0a0a0c',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: 600, margin: '0 auto 3rem' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#F2F1F1',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Examples
        </h1>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
          color: '#888',
          lineHeight: 1.5,
        }}>
          12 examples. 2D Canvas, 3D WebGL, LLM integration.
        </p>

        {/* Category filter */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
        }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat
            const color = cat === 'all' ? '#888' : CATEGORY_COLORS[cat]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: isActive ? '#0a0a0c' : '#999',
                  background: isActive ? `${color}cc` : 'transparent',
                  border: `1px solid ${isActive ? `${color}88` : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gap: '1px',
        maxWidth: 1200,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <style>{`
          .examples-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1px;
          }
          @media (min-width: 640px) {
            .examples-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .examples-grid .card-featured {
              grid-column: span 2;
            }
          }
          @media (min-width: 1024px) {
            .examples-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}</style>
        <div className="examples-grid">
          {filteredExamples.map(example => {
            const color = CATEGORY_COLORS[example.category]
            const isHovered = hoveredId === example.id
            return (
              <Link
                key={example.id}
                href={example.path}
                className={example.featured ? 'card-featured' : undefined}
                onMouseEnter={() => setHoveredId(example.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#0a0a0c',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  boxShadow: isHovered ? `inset 0 0 0 1px ${color}44, 0 8px 32px ${color}15` : 'none',
                }}
              >
                {/* Preview image / placeholder */}
                <PreviewImage example={example} />

                {/* Card body */}
                <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                    flex: 1,
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
    </main>
  )
}
