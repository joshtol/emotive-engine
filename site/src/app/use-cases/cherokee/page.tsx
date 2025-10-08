'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function CherokeePage() {
  const [selectedChar, setSelectedChar] = useState<string | null>(null)

  // MVP: 6 syllabary characters for Phase 1
  const syllabary = [
    { char: 'Ꭰ', name: 'a', sound: 'ah' },
    { char: 'Ꭱ', name: 'e', sound: 'eh' },
    { char: 'Ꭲ', name: 'i', sound: 'ee' },
    { char: 'Ꭳ', name: 'o', sound: 'oh' },
    { char: 'Ꭴ', name: 'u', sound: 'oo' },
    { char: 'Ꭵ', name: 'v', sound: 'uh' },
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />

      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: '2rem'
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
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#DAA520'
          }}>
            ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Cherokee Language Learning
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Interactive syllabary learning with emotional AI and cultural context.
            Experience the beauty of Cherokee script through shape-morphing animations.
          </p>
        </div>

        {/* Syllabary Grid */}
        <div style={{
          background: 'rgba(218,165,32,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
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
            Cherokee Syllabary (MVP: 6 Characters)
          </h3>
          <p style={{
            textAlign: 'center',
            opacity: 0.7,
            marginBottom: '3rem',
            fontSize: '1rem'
          }}>
            Click a character to see its pronunciation and hear the sound
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {syllabary.map((item) => (
              <div
                key={item.char}
                onClick={() => setSelectedChar(item.char)}
                style={{
                  padding: '2rem',
                  background: selectedChar === item.char
                    ? 'rgba(218,165,32,0.25)'
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: selectedChar === item.char
                    ? '2px solid rgba(218,165,32,0.6)'
                    : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  willChange: 'transform',
                  boxShadow: selectedChar === item.char
                    ? '0 12px 40px rgba(218,165,32,0.3)'
                    : '0 4px 16px rgba(31, 38, 135, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedChar !== item.char) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,165,32,0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChar !== item.char) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 38, 135, 0.1)'
                  }
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '0.5rem',
                  color: '#DAA520'
                }}>
                  {item.char}
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  opacity: 0.8,
                  marginBottom: '0.3rem'
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  opacity: 0.6,
                  fontStyle: 'italic'
                }}>
                  "{item.sound}"
                </div>
              </div>
            ))}
          </div>

          {selectedChar && (
            <div style={{
              marginTop: '2rem',
              padding: '2rem',
              background: 'rgba(218,165,32,0.1)',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(218,165,32,0.3)'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                You selected: <strong style={{ color: '#DAA520', fontSize: '2rem' }}>{selectedChar}</strong>
              </div>
              <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>
                🎵 Audio pronunciation coming in Phase 2
              </p>
              <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '0.5rem' }}>
                🎭 Shape morphing animation coming in Phase 2
              </p>
            </div>
          )}
        </div>

        {/* Cultural Context */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '3rem 2rem',
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
            gap: '2rem'
          }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                📜 History
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Created by Sequoyah in 1821, the Cherokee syllabary is one of the few
                writing systems invented by a single person. It revolutionized Cherokee
                literacy and cultural preservation.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                🎯 Structure
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                The syllabary contains 85 characters, each representing a syllable
                (consonant + vowel). It's remarkably efficient and can be learned
                in a matter of days.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                💡 Cultural Impact
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                The syllabary enabled the Cherokee Nation to achieve one of the highest
                literacy rates in the world during the 19th century and remains vital
                for language preservation today.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div style={{
          background: 'rgba(218,165,32,0.1)',
          borderRadius: '16px',
          padding: '3rem 2rem',
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
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Audio Integration</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Native speaker pronunciations</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎭</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Shape Morphing</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Character transformation animations</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Cultural Theming</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>7-clan colors and patterns</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Word Building</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Combine characters into words</div>
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
