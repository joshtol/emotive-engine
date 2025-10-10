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
  const guideRef = useRef<HTMLDivElement>(null)
  const cardMascotRef = useRef<any>(null)
  const cardCanvasRef = useRef<HTMLCanvasElement>(null)

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
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
        })

        mascotRef.current = mascot

        // Set neutral emotion before starting
        if (mascot.setEmotion) {
          mascot.setEmotion('neutral', 0.7)
        }

        // Start rendering
        mascot.start()
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

  // Initialize card mascot when a phrase is selected
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedPhrase || !cardCanvasRef.current) return

    const initCardMascot = async () => {
      // Wait for EmotiveMascot to be available
      while (!window.EmotiveMascot) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const canvas = cardCanvasRef.current
      if (!canvas) return

      // Clean up existing mascot if any
      if (cardMascotRef.current) {
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
      }

      // CRITICAL: Set DPR-scaled canvas dimensions for crisp rendering
      // Get canvas dimensions and apply DPR scaling via attributes
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Set buffer dimensions with DPR scaling via attributes
      // CanvasManager will detect these DPR-scaled attributes and use them correctly
      canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
      canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

      // Clear the canvas to remove any artifacts
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      try {
        const cardMascot = new window.EmotiveMascot({
          canvasId: 'card-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: 'joy',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
        })

        cardMascotRef.current = cardMascot

        // Set emotion and gesture chain based on card
        const selected = greetings.find(g => g.english === selectedPhrase)

        // Start the mascot
        cardMascot.start()

        // Position mascot to the left of English content
        // Canvas fills full modal, mascot offset to left
        if (cardMascot.setPosition) {
          // Different positions for mobile vs desktop
          const offsetX = isMobile ? -50 : -150  // Less left offset on mobile
          const offsetY = isMobile ? -160 : -120  // Higher on mobile to align between Hello and pronunciation
          cardMascot.setPosition(offsetX, offsetY, 0)
        }

        // Wait for mascot to initialize, then trigger gestures
        setTimeout(() => {
          // Define unique gesture chains for each card
          const gestureChains: Record<string, () => void> = {
            'Hello': () => {
              // State: surprise, Chain: hula+reach > nod
              if (cardMascot.setEmotion) cardMascot.setEmotion('surprise', 0)
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('hula')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('nod')
                }, 800)
              }, 300)
            },
            'Hello (informal)': () => {
              // State: surprise, Chain: wiggle
              if (cardMascot.setEmotion) cardMascot.setEmotion('surprise', 0)
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('wiggle')
              }, 300)
            },
            'Thank you': () => {
              // State: love, Chain: glow+pulse
              if (cardMascot.setEmotion) cardMascot.setEmotion('love', 0)
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('glow')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('pulse')
                }, 500)
              }, 300)
            },
            'How are you?': () => {
              // State: neutral, Chain: point+bounce
              if (cardMascot.setEmotion) cardMascot.setEmotion('neutral', 0)
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('point')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('bounce')
                }, 600)
              }, 300)
            },
            'Good': () => {
              // State: calm, Chain: pulse+flash
              if (cardMascot.setEmotion) cardMascot.setEmotion('calm', 0)
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('pulse')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('flash')
                }, 500)
              }, 300)
            },
            'Good morning': () => {
              // State: euphoria, Core: sun, Chain: breathe
              if (cardMascot.setEmotion) cardMascot.setEmotion('euphoria', 0)
              if (cardMascot.morphTo) cardMascot.morphTo('sun')
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('breathe')
              }, 300)
            },
            '\'Til we meet again': () => {
              // State: neutral, Core: solar, Chain: groove+float
              if (cardMascot.setEmotion) cardMascot.setEmotion('neutral', 0)
              if (cardMascot.morphTo) cardMascot.morphTo('solar')
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('groove')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('float')
                }, 400)
              }, 300)
            },
            'Good night': () => {
              // State: resting, Core: moon, Chain: wiggle+shimmer
              if (cardMascot.setEmotion) cardMascot.setEmotion('resting', 0)
              if (cardMascot.morphTo) cardMascot.morphTo('moon')
              setTimeout(() => {
                if (cardMascot.express) cardMascot.express('wiggle')
                setTimeout(() => {
                  if (cardMascot.express) cardMascot.express('shimmer')
                }, 600)
              }, 300)
            }
          }

          // Trigger the appropriate gesture chain
          const gestureChain = gestureChains[selectedPhrase]
          if (gestureChain) {
            gestureChain()
          }
        }, 100) // Wait 100ms for mascot to initialize
      } catch (err) {
        console.error('Failed to initialize card mascot:', err)
      }
    }

    initCardMascot()

    // Cleanup when phrase changes or modal closes
    return () => {
      if (cardMascotRef.current) {
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
        cardMascotRef.current = null
      }
    }
  }, [selectedPhrase])

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

    // Reset touch state after handling
    setTouchStart(0)
    setTouchEnd(0)
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
      pronunciation: 'oh-s-dah sah-nah-lay-ee',
      meaning: 'Morning greeting',
      context: 'Used until midday',
      color: '#F8B739',
      bgColor: 'rgba(248,183,57,0.15)',
      borderColor: 'rgba(248,183,57,0.4)',
      emoji: '🌅'
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
      english: 'Good night',
      cherokee: 'ᎣᏍᏓ ᎤᏒᎢ',
      pronunciation: 'oh-s-dah oo-sv-ee',
      meaning: 'Evening farewell',
      context: 'Used when parting in the evening',
      color: '#9B59B6',
      bgColor: 'rgba(155,89,182,0.15)',
      borderColor: 'rgba(155,89,182,0.4)',
      emoji: '🌙'
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
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />

      {/* Full viewport mascot canvas */}
      <canvas
        ref={canvasRef}
        id="cherokee-guide-mascot"
        width="300"
        height="300"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
        <div
          ref={guideRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: 'rgba(218,165,32,0.08)',
            borderRadius: '16px',
            border: '1px solid rgba(218,165,32,0.2)',
            minHeight: '400px'
          }}
        >
          <h3 style={{
            fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
            marginBottom: '0.75rem',
            color: '#DAA520',
            fontWeight: '600'
          }}>
            ᎣᏏᏲ! Let&apos;s Learn Together
          </h3>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            opacity: 0.85,
            lineHeight: 1.5,
            maxWidth: '600px'
          }}>
            Click any greeting card below to explore its meaning, pronunciation, and cultural significance. I&apos;ll guide you through each phrase!
          </p>
          <div style={{
            marginTop: '1rem',
            fontSize: '2rem',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            👇
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
            {greetings.map((item) => (
              <div
                key={item.english}
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

        </div>

        {/* Modal for all screen sizes */}
        {selectedPhrase && (() => {
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
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: isMobile ? '2rem' : '4rem',
                paddingBottom: isMobile ? '4rem' : '6rem',
                animation: 'fadeIn 0.3s ease-out',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
              onClick={() => setSelectedPhrase(null)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: isMobile ? '500px' : '800px',
                  width: '100%',
                  background: selected.bgColor,
                  borderRadius: '20px',
                  padding: isMobile ? '2.5rem 2rem' : '3rem 2.5rem',
                  paddingBottom: isMobile ? '3rem' : '4rem',
                  border: `2px solid ${selected.borderColor}`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  flexShrink: 0
                }}
              >
                {/* Full-modal mascot canvas for free particle movement */}
                <canvas
                  ref={cardCanvasRef}
                  id="card-mascot"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1,
                    filter: 'none', // Prevent CSS filters from washing out canvas shadows
                    transform: 'translateZ(0)', // Force GPU acceleration
                    willChange: 'transform' // Optimize for animations
                  }}
                />

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
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  ×
                </button>

                {/* Cherokee glyph heading */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 'clamp(3rem, 12vw, 5rem)',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    color: selected.color,
                    fontWeight: '600'
                  }}>
                    {selected.cherokee}
                  </div>

                  {/* Mascot + English content (horizontal layout) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    {/* Left: Mascot - 1:1 aspect ratio */}
                    <div style={{
                      width: '150px',
                      height: '150px',
                      flexShrink: 0,
                      position: 'relative'
                    }} />

                    {/* Right: English content */}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: selected.color
                      }}>
                        {selected.english}
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        opacity: 0.8,
                        fontStyle: 'italic'
                      }}>
                        <strong>{selected.pronunciation}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  opacity: 0.85,
                  marginTop: '1rem',
                  padding: '1.2rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  position: 'relative',
                  zIndex: 2
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
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 2
                }}>
                  💡 <strong>Cultural Context:</strong> {selected.context}
                </div>

                {/* Navigation arrows */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  gap: '1rem',
                  position: 'relative',
                  zIndex: 2
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
                Help preserve one of America&apos;s indigenous languages spoken by over 450,000 Cherokee Nation citizens
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
            This demo showcases the Emotive Engine&apos;s potential for culturally respectful language learning.
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
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Characters react to learner&apos;s pronunciation with encouragement</div>
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
