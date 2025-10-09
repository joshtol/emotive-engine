'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

declare global {
  interface Window {
    EmotiveMascot?: any
  }
}

export default function CherokeePage() {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Initialize mascot
  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return

    const initMascot = async () => {
      // Wait for EmotiveMascot to be available
      while (!window.EmotiveMascot) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const canvas = canvasRef.current
      if (!canvas) return

      try {
        const mascot = new window.EmotiveMascot({
          canvasId: 'cherokee-guide-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'euphoria',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
        })

        mascotRef.current = mascot
        mascot.start()

        // Set euphoria emotion
        if (mascot.setEmotion) {
          mascot.setEmotion('euphoria', 0.7)
        }

        // Position mascot directly above the heading after layout is ready
        setTimeout(() => {
          if (headingRef.current && mascot.setPosition) {
            const headingRect = headingRef.current.getBoundingClientRect()
            const targetX = headingRect.left + headingRect.width / 2
            const targetY = headingRect.top - 20 // 20px above the heading

            // Calculate offsets from viewport center
            const viewportCenterX = window.innerWidth / 2
            const viewportCenterY = window.innerHeight / 2
            const offsetX = targetX - viewportCenterX
            const offsetY = targetY - viewportCenterY

            // Set position immediately (no animation)
            mascot.setPosition(offsetX, offsetY, 0)

            // Clear particles spawned at old center position
            if (mascot.clearParticles) {
              mascot.clearParticles()
            }
          }
        }, 200)
      } catch (err) {
        console.error('Failed to initialize Cherokee mascot:', err)
      }
    }

    initMascot()

    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
      }
    }
  }, [])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Scroll detection and mascot targeting
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollY = window.scrollY

      // Trigger movement after scrolling 100px
      if (scrollY > 100 && !hasScrolled) {
        setHasScrolled(true)

        // Target the first greeting card
        if (mascotRef.current && firstCardRef.current && mascotRef.current.animateToPosition) {
          const cardRect = firstCardRef.current.getBoundingClientRect()

          // Calculate absolute screen position for card center
          const targetX = cardRect.left + cardRect.width / 2
          const targetY = cardRect.top + cardRect.height / 2

          // Calculate offsets from viewport center
          const viewportCenterX = window.innerWidth / 2
          const viewportCenterY = window.innerHeight / 2
          const offsetX = targetX - viewportCenterX
          const offsetY = targetY - viewportCenterY

          // Animate to the card position over 2 seconds
          mascotRef.current.animateToPosition(offsetX, offsetY, 0, 2000, 'easeOutCubic')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (selectedPhrase && (isLeftSwipe || isRightSwipe)) {
      const currentIndex = greetings.findIndex(g => g.english === selectedPhrase)
      if (isLeftSwipe && currentIndex < greetings.length - 1) {
        setSelectedPhrase(greetings[currentIndex + 1].english)
      } else if (isRightSwipe && currentIndex > 0) {
        setSelectedPhrase(greetings[currentIndex - 1].english)
      }
    }
  }

  // Navigate to next/previous greeting
  const navigateGreeting = (direction: 'next' | 'prev') => {
    if (!selectedPhrase) return
    const currentIndex = greetings.findIndex(g => g.english === selectedPhrase)
    if (direction === 'next' && currentIndex < greetings.length - 1) {
      setSelectedPhrase(greetings[currentIndex + 1].english)
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedPhrase(greetings[currentIndex - 1].english)
    }
  }

  // Cherokee Greetings & Common Phrases
  // Verified from official Cherokee Nation sources (cherokee.org, Cherokee Nation social media)
  const greetings = [
    {
      english: 'Hello',
      cherokee: 'ᎣᏏᏲ',
      pronunciation: 'oh-see-yoh',
      meaning: 'It\'s good to see you',
      context: 'Universal greeting for all occasions',
      color: '#DAA520',
      bgColor: 'rgba(218,165,32,0.15)',
      borderColor: 'rgba(218,165,32,0.4)',
      emoji: '👋'
    },
    {
      english: 'Hello (informal)',
      cherokee: 'ᏏᏲ',
      pronunciation: 'see-yoh',
      meaning: 'Hi / Hey',
      context: 'Casual greeting among friends',
      color: '#FFB347',
      bgColor: 'rgba(255,179,71,0.15)',
      borderColor: 'rgba(255,179,71,0.4)',
      emoji: '😊'
    },
    {
      english: 'Thank you',
      cherokee: 'ᏩᏙ',
      pronunciation: 'wah-doh',
      meaning: 'Expression of gratitude',
      context: 'Shows respect and appreciation',
      color: '#98D8C8',
      bgColor: 'rgba(152,216,200,0.15)',
      borderColor: 'rgba(152,216,200,0.4)',
      emoji: '🙏'
    },
    {
      english: 'How are you?',
      cherokee: 'ᏙᎯᏧ',
      pronunciation: 'doh-hee-choo',
      meaning: 'Asking about someone\'s wellbeing',
      context: 'Common conversation starter',
      color: '#F7DC6F',
      bgColor: 'rgba(247,220,111,0.15)',
      borderColor: 'rgba(247,220,111,0.4)',
      emoji: '💬'
    },
    {
      english: 'Good',
      cherokee: 'ᎣᏍᏓ',
      pronunciation: 'oh-s-dah',
      meaning: 'Response to "How are you?"',
      context: 'Can also mean "I\'m good"',
      color: '#82C4C3',
      bgColor: 'rgba(130,196,195,0.15)',
      borderColor: 'rgba(130,196,195,0.4)',
      emoji: '✨'
    },
    {
      english: 'Good morning',
      cherokee: 'ᎣᏍᏓ ᏌᎾᎴᎢ',
      pronunciation: 'oh-s-dah sah-nah-leh-ee',
      meaning: 'Morning greeting',
      context: 'Used until midday',
      color: '#F8B739',
      bgColor: 'rgba(248,183,57,0.15)',
      borderColor: 'rgba(248,183,57,0.4)',
      emoji: '🌅'
    },
    {
      english: '\'Til we meet again',
      cherokee: 'ᏙᎾᏓᎪᎲᎢ',
      pronunciation: 'doh-nah-dah-goh-huh-ee',
      meaning: 'There is no word for "goodbye" in Cherokee',
      context: 'Reflects belief in continued connection',
      color: '#C39BD3',
      bgColor: 'rgba(195,155,211,0.15)',
      borderColor: 'rgba(195,155,211,0.4)',
      emoji: '🤝'
    },
    {
      english: 'Good night',
      cherokee: 'ᎣᏍᏓ ᏒᏃᏱ',
      pronunciation: 'oh-s-dah eh-noh-yee',
      meaning: 'Evening farewell',
      context: 'Used when parting in the evening',
      color: '#9B59B6',
      bgColor: 'rgba(155,89,182,0.15)',
      borderColor: 'rgba(155,89,182,0.4)',
      emoji: '🌙'
    },
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />

      {/* Full viewport mascot canvas */}
      <canvas
        ref={canvasRef}
        id="cherokee-guide-mascot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

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
            Cherokee Language Learning
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
            Learn essential Cherokee greetings and phrases with authentic syllabary characters and pronunciation.
            All content verified through official Cherokee Nation sources.
          </p>
        </div>

        {/* Guide Section (Mascot positioned here initially via targeting) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '3rem',
          padding: '2rem',
          background: 'rgba(218,165,32,0.08)',
          borderRadius: '16px',
          border: '1px solid rgba(218,165,32,0.2)',
          textAlign: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            maxWidth: '600px'
          }}>
            <h3
              ref={headingRef}
              style={{
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                marginBottom: '0.75rem',
                color: '#DAA520',
                fontWeight: '600'
              }}
            >
              ᎣᏏᏲ! Let's Learn Together
            </h3>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: 0.85,
              lineHeight: 1.5
            }}>
              Click any greeting card below to explore its meaning, pronunciation, and cultural significance. I'll guide you through each phrase!
            </p>
            <div style={{
              marginTop: '1rem',
              fontSize: '2rem',
              animation: 'bounce 2s ease-in-out infinite'
            }}>
              👇
            </div>
          </div>
        </div>

        {/* Cherokee Greetings Grid */}
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
            Common Cherokee Greetings
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--grid-gap)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {greetings.map((item, index) => (
              <div
                key={item.english}
                ref={index === 0 ? firstCardRef : null}
                onClick={() => setSelectedPhrase(item.english)}
                style={{
                  padding: '2rem',
                  background: selectedPhrase === item.english
                    ? item.bgColor
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: selectedPhrase === item.english
                    ? `2px solid ${item.borderColor}`
                    : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  willChange: 'transform',
                  boxShadow: selectedPhrase === item.english
                    ? `0 12px 40px ${item.borderColor}`
                    : '0 4px 16px rgba(31, 38, 135, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = item.bgColor.replace('0.15', '0.08')
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${item.borderColor}`
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 38, 135, 0.1)'
                  }
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.75rem'
                }}>
                  {item.emoji}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  opacity: 0.9
                }}>
                  {item.english}
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

          {/* Desktop: Inline detail panel */}
          {!isMobile && selectedPhrase && (() => {
            const selected = greetings.find(item => item.english === selectedPhrase)
            return selected ? (
              <div style={{
                marginTop: '2rem',
                padding: '2rem',
                background: selected.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${selected.borderColor}`,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {selected.emoji} {selected.cherokee}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: selected.color }}>
                  {selected.english}
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
                  <strong style={{ color: selected.color }}>Meaning:</strong><br />
                  {selected.meaning}
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  opacity: 0.75,
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  fontStyle: 'italic'
                }}>
                  💡 <strong>Cultural Context:</strong> {selected.context}
                </div>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '1.5rem' }}>
                  🎵 Native speaker audio pronunciation coming in Phase 2
                </p>
              </div>
            ) : null
          })()}
        </div>

        {/* Mobile: Full-screen modal */}
        {isMobile && selectedPhrase && (() => {
          const selected = greetings.find(item => item.english === selectedPhrase)
          const currentIndex = greetings.findIndex(g => g.english === selectedPhrase)

          return selected ? (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                animation: 'fadeIn 0.3s ease-out'
              }}
              onClick={() => setSelectedPhrase(null)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '500px',
                  width: '100%',
                  background: selected.bgColor,
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  border: `2px solid ${selected.borderColor}`,
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedPhrase(null)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '1.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>

                {/* Content */}
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {selected.emoji} {selected.cherokee}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.5rem', color: selected.color }}>
                  {selected.english}
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem', fontStyle: 'italic' }}>
                  Pronunciation: <strong>{selected.pronunciation}</strong>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.85,
                  marginTop: '1rem',
                  padding: '1.2rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px'
                }}>
                  <strong style={{ color: selected.color }}>Meaning:</strong><br />
                  {selected.meaning}
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.75,
                  marginTop: '1rem',
                  padding: '1.2rem',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  fontStyle: 'italic'
                }}>
                  💡 <strong>Cultural Context:</strong> {selected.context}
                </div>

                {/* Navigation arrows */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => navigateGreeting('prev')}
                    disabled={currentIndex === 0}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: currentIndex === 0 ? 'rgba(255,255,255,0.1)' : selected.bgColor,
                      color: currentIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white',
                      border: currentIndex === 0 ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${selected.borderColor}`,
                      borderRadius: '8px',
                      cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => navigateGreeting('next')}
                    disabled={currentIndex === greetings.length - 1}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: currentIndex === greetings.length - 1 ? 'rgba(255,255,255,0.1)' : selected.bgColor,
                      color: currentIndex === greetings.length - 1 ? 'rgba(255,255,255,0.3)' : 'white',
                      border: currentIndex === greetings.length - 1 ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${selected.borderColor}`,
                      borderRadius: '8px',
                      cursor: currentIndex === greetings.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next →
                  </button>
                </div>

                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '1.5rem' }}>
                  👆 Swipe left/right or use arrows to navigate
                </p>
              </div>
            </div>
          ) : null
        })()}

        {/* Why Learn Cherokee */}
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
            Why Learn Cherokee?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--grid-gap)',
            marginTop: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌍</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Cultural Preservation</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Help preserve one of America's indigenous languages spoken by over 450,000 Cherokee Nation citizens
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💡</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Unique Writing System</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Learn the syllabary created by Sequoyah in 1821—one of few writing systems invented by a single person
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Cultural Respect</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Show respect by learning greetings and phrases that honor Cherokee tradition and connection
              </div>
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
            marginBottom: '1rem',
            color: '#DAA520'
          }}>
            Coming with Cherokee Nation Partnership
          </h3>
          <p style={{
            opacity: 0.8,
            fontSize: '1rem',
            marginBottom: '2rem',
            maxWidth: '700px',
            margin: '0 auto 2rem auto'
          }}>
            This demo showcases the Emotive Engine's potential for culturally respectful language learning.
            Full implementation requires official Cherokee Nation approval and collaboration.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--grid-gap-sm)',
            marginTop: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Native Speaker Audio</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Authentic pronunciations from Cherokee Nation language department</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Emotional Feedback</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Characters react to learner's pronunciation with encouragement</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Expanded Vocabulary</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Family words, animals, nature—approved by Cherokee educators</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Interactive Conversations</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Practice full dialogues with emotionally responsive AI</div>
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
