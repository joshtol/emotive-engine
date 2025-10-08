'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function CherokeePage() {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)

  // Four Sacred Directions in Cherokee
  // Each direction with its Cherokee word, syllabary, sacred color, and cultural meaning
  const directions = [
    {
      direction: 'East',
      cherokee: 'ᎧᎸᎬ',
      pronunciation: 'ka-lv-gv',
      meaning: 'Success, Power, Triumph',
      color: '#C4433C',
      bgColor: 'rgba(196,67,60,0.15)',
      borderColor: 'rgba(196,67,60,0.4)',
      arrow: '→'
    },
    {
      direction: 'South',
      cherokee: 'ᎤᎦᎾᏛ',
      pronunciation: 'u-ga-na-wv',
      meaning: 'Peace, Happiness, Warmth',
      color: '#E8DCC5',
      bgColor: 'rgba(232,220,197,0.12)',
      borderColor: 'rgba(232,220,197,0.35)',
      arrow: '↓'
    },
    {
      direction: 'North',
      cherokee: 'ᎤᏴᏝ',
      pronunciation: 'u-yv-tlv',
      meaning: 'Introspection, Coldness, Challenge',
      color: '#5B8CA8',
      bgColor: 'rgba(91,140,168,0.15)',
      borderColor: 'rgba(91,140,168,0.4)',
      arrow: '↑'
    },
    {
      direction: 'West',
      cherokee: 'ᏭᏕᎵᎬ',
      pronunciation: 'wu-de-li-gv',
      meaning: 'Transformation, Endings, Death',
      color: '#888',
      bgColor: 'rgba(100,100,100,0.12)',
      borderColor: 'rgba(136,136,136,0.35)',
      arrow: '←'
    },
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />

      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: 'var(--container-padding)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            ← Back to Portfolio
          </Link>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(218,165,32,0.2)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '1px solid rgba(218,165,32,0.4)'
          }}>
            Flagship Use Case
          </div>
        </div>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#DAA520',
            letterSpacing: '-0.02em'
          }}>
            ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            marginBottom: '1rem',
            opacity: 0.9,
            letterSpacing: '-0.01em'
          }}>
            Sacred Directions & Language Learning
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            fontWeight: '400',
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Learn Cherokee through the four sacred directions—connecting language, cosmology, and cultural wisdom.
            Each direction teaches syllabary characters through their traditional meanings and symbolism.
          </p>
        </div>

        {/* Sacred Directions Grid */}
        <div style={{
          background: 'rgba(218,165,32,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(218,165,32,0.25)',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#DAA520'
          }}>
            Four Sacred Directions
          </h3>
          <p style={{
            textAlign: 'center',
            opacity: 0.7,
            marginBottom: '3rem',
            fontSize: '1rem'
          }}>
            Click any direction to learn its Cherokee word, syllabary, and cultural meaning
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--grid-gap)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {directions.map((item) => (
              <div
                key={item.direction}
                onClick={() => setSelectedDirection(item.direction)}
                style={{
                  padding: '2rem',
                  background: selectedDirection === item.direction
                    ? item.bgColor
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: selectedDirection === item.direction
                    ? `2px solid ${item.borderColor}`
                    : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  willChange: 'transform',
                  boxShadow: selectedDirection === item.direction
                    ? `0 12px 40px ${item.borderColor}`
                    : '0 4px 16px rgba(31, 38, 135, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedDirection !== item.direction) {
                    e.currentTarget.style.background = item.bgColor.replace('0.15', '0.08').replace('0.12', '0.06')
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${item.borderColor}`
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDirection !== item.direction) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 38, 135, 0.1)'
                  }
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.75rem',
                  color: item.color
                }}>
                  {item.arrow}
                </div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: item.color
                }}>
                  {item.direction}
                </div>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  color: item.color
                }}>
                  {item.cherokee}
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  {item.pronunciation}
                </div>
              </div>
            ))}
          </div>

          {selectedDirection && (() => {
            const selected = directions.find(item => item.direction === selectedDirection)
            return selected ? (
              <div style={{
                marginTop: '2rem',
                padding: '2rem',
                background: selected.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
                border: `1px solid ${selected.borderColor}`,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', color: selected.color }}>
                  {selected.arrow} {selected.cherokee}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: selected.color }}>
                  {selected.direction}
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  Pronunciation: <strong>{selected.pronunciation}</strong>
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.85,
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px'
                }}>
                  <strong style={{ color: selected.color }}>Cultural Meaning:</strong><br />
                  {selected.meaning}
                </div>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '1.5rem' }}>
                  🎵 Native speaker audio pronunciation coming in Phase 2
                </p>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  🎭 Shape-morphing animation between syllabary characters coming in Phase 2
                </p>
              </div>
            ) : null
          })()}
        </div>

        {/* Sacred Colors */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#DAA520'
          }}>
            Cherokee Sacred Colors & Directions
          </h3>
          <p style={{
            textAlign: 'center',
            opacity: 0.8,
            marginBottom: '2rem',
            fontSize: '1rem',
            maxWidth: '800px',
            margin: '0 auto 2rem auto'
          }}>
            Each character is colored according to the Cherokee sacred directions—honoring the traditional symbolism that connects language, land, and spirit.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--grid-gap)'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(196,67,60,0.12)',
              border: '1px solid rgba(196,67,60,0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#C4433C' }}>→</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#C4433C' }}>East - Red</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>Success, Power, Triumph</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(232,220,197,0.08)',
              border: '1px solid rgba(232,220,197,0.25)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#E8DCC5' }}>↓</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#E8DCC5' }}>South - White</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>Peace, Happiness, Purity</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(91,140,168,0.12)',
              border: '1px solid rgba(91,140,168,0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#5B8CA8' }}>↑</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#5B8CA8' }}>North - Blue</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>Defeat, Trouble, Introspection</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(40,40,40,0.4)',
              border: '1px solid rgba(100,100,100,0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#888' }}>←</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#AAA' }}>West - Black</div>
              <div style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.5 }}>Death, Endings, Transformation</div>
            </div>
          </div>
        </div>

        {/* Cultural Context */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            color: '#DAA520'
          }}>
            About the Cherokee Syllabary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--grid-gap)'
          }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                📜 History
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Created by Sequoyah in 1821, the Cherokee syllabary is one of the few
                writing systems invented by a single individual—revolutionizing Cherokee
                literacy and enabling unprecedented cultural preservation.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                🎯 Structure
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                The syllabary contains 85 characters, each representing a complete syllable
                (consonant + vowel). Its remarkable efficiency allows learners to achieve
                literacy in a matter of days rather than years.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                💡 Cultural Impact
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Within years of its creation, the Cherokee Nation achieved one of the highest
                literacy rates in the world. Today, the syllabary remains essential for
                preserving Cherokee language and cultural identity.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div style={{
          background: 'rgba(218,165,32,0.1)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(218,165,32,0.3)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1.5rem',
            color: '#DAA520'
          }}>
            Coming in Phase 2
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--grid-gap-sm)',
            marginTop: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Audio Integration</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Authentic native speaker pronunciations</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎭</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Shape Morphing</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Expressive character animations</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Cultural Theming</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Traditional 7-clan colors and patterns</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Word Building</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Interactive syllable combinations</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(218,165,32,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(218,165,32,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(218,165,32,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(218,165,32,0.2)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>
      </div>
    </div>

      <EmotiveFooter />
    </div>
  )
}
