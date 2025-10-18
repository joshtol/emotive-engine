'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

const CherokeeMascot = dynamic(() => import('./CherokeeMascot'), {
  ssr: false,
  loading: () => null
})

export default function CherokeePage() {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [viewedPhrases, setViewedPhrases] = useState<Set<string>>(new Set())
  const cardMascotRef = useRef<any>(null)
  const cardCanvasRef = useRef<HTMLCanvasElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    console.log('[Cherokee] Client mounted')
    setIsClient(true)
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      console.log('[Cherokee] Mobile check:', mobile, 'width:', window.innerWidth)
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track viewed phrases
  useEffect(() => {
    if (selectedPhrase && !viewedPhrases.has(selectedPhrase)) {
      setViewedPhrases(prev => new Set([...prev, selectedPhrase]))
    }
  }, [selectedPhrase, viewedPhrases])

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

  // Initialize card mascot with enhanced interactivity using public API
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedPhrase || !cardCanvasRef.current) return

    const initCardMascot = async () => {
      // Wait for EmotiveMascot to load
      let attempts = 0
      while (!(window as any).EmotiveMascot && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      const canvas = cardCanvasRef.current
      if (!canvas) return

      // Clean up existing mascot
      if (cardMascotRef.current) {
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
      }

      // Set canvas dimensions with DPR scaling - FORCE 1:1 aspect ratio
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      // Use the smaller dimension to ensure 1:1 aspect ratio
      const size = Math.min(rect.width, rect.height)
      canvas.setAttribute('width', Math.round(size * dpr).toString())
      canvas.setAttribute('height', Math.round(size * dpr).toString())

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      // Phrase configurations - using original gesture sequences
      const phraseConfigs: Record<string, {
        emotion: string
        intensity: number
        shape?: string
        gestures: Array<{name: string, delay: number}>
      }> = {
        'Hello': {
          emotion: 'surprise',
          intensity: 0.9,
          gestures: [
            {name: 'hula', delay: 300},
            {name: 'nod', delay: 800}
          ]
        },
        'Hello (informal)': {
          emotion: 'surprise',
          intensity: 0.8,
          gestures: [
            {name: 'wiggle', delay: 300}
          ]
        },
        'Thank you': {
          emotion: 'love',
          intensity: 1.0,
          gestures: [
            {name: 'glow', delay: 300},
            {name: 'pulse', delay: 500}
          ]
        },
        'How are you?': {
          emotion: 'neutral',
          intensity: 0.6,
          gestures: [
            {name: 'point', delay: 300},
            {name: 'bounce', delay: 600}
          ]
        },
        'Good': {
          emotion: 'calm',
          intensity: 0.7,
          gestures: [
            {name: 'drift', delay: 300} // Using chain combo
          ]
        },
        'Good morning': {
          emotion: 'euphoria',
          intensity: 1.0,
          shape: 'sun',
          gestures: [
            {name: 'breathe', delay: 300}
          ]
        },
        '\'Til we meet again': {
          emotion: 'neutral',
          intensity: 0.6,
          shape: 'solar',
          gestures: [
            {name: 'groove', delay: 300},
            {name: 'float', delay: 400}
          ]
        },
        'Good night': {
          emotion: 'resting',
          intensity: 0.5,
          shape: 'moon',
          gestures: [
            {name: 'wiggle', delay: 300},
            {name: 'shimmer', delay: 600}
          ]
        }
      }

      const config = phraseConfigs[selectedPhrase] || {
        emotion: 'neutral',
        intensity: 0.5,
        chain: 'drift'
      }

      try {
        // Fixed UMD access pattern
        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('[Cherokee] EmotiveMascot not found on window object')
          return
        }

        const cardMascot = new EmotiveMascot({
          canvasId: 'card-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: config.emotion,
          enableGazeTracking: true,  // Enable gaze tracking for interactive card mascot
          enableIdleBehaviors: true,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
        })

        cardMascotRef.current = cardMascot

        // Initialize and start
        await cardMascot.init(canvas)
        cardMascot.start()

        // Position mascot to the left of English content
        if (cardMascot.setPosition) {
          const offsetX = isMobile ? -50 : -150
          const offsetY = isMobile ? 20 : -120  // Mobile: lower position, Desktop: upper position
          cardMascot.setPosition(offsetX, offsetY, 0)
        }

        // Apply full configuration using public API
        setTimeout(async () => {
          // Set emotion with intensity
          if (cardMascot.setEmotion) {
            cardMascot.setEmotion(config.emotion, config.intensity)
          }

          // Morph to shape if specified
          if (config.shape && cardMascot.morphTo) {
            cardMascot.morphTo(config.shape)
          }

          // Trigger gesture sequence
          const triggerGestures = () => {
            config.gestures.forEach((gesture, index) => {
              setTimeout(() => {
                // Check if it's a chain combo (for "Good" which uses "drift")
                if (gesture.name === 'drift' && cardMascot.chain) {
                  cardMascot.chain('drift')
                } else if (cardMascot.express) {
                  cardMascot.express(gesture.name)
                }
              }, gesture.delay)
            })
          }

          // Trigger initial gesture sequence
          triggerGestures()

          // Repeat gesture sequence every 8 seconds for continuous feedback
          const gestureInterval = setInterval(() => {
            if (cardMascotRef.current) {
              triggerGestures()
            }
          }, 8000)

          // Store interval for cleanup
          ;(cardMascot as any)._gestureInterval = gestureInterval

          // Special completion animation for last card when all phrases viewed
          const isLastCard = selectedPhrase === '\'Til we meet again'
          const allPhrasesViewed = viewedPhrases.size === greetings.length

          if (isLastCard && allPhrasesViewed) {
            setTimeout(() => {
              if (cardMascot.chain) {
                cardMascot.chain('radiance') // Celebratory sparkle effect
              }
            }, 2000)
          }

        }, 200)

      } catch (err) {
        console.error('[Cherokee] Failed to initialize card mascot:', err)
      }
    }

    initCardMascot()

    // Cleanup when phrase changes or modal closes
    return () => {
      if (cardMascotRef.current) {
        // Clear gesture interval if it exists
        if ((cardMascotRef.current as any)._gestureInterval) {
          clearInterval((cardMascotRef.current as any)._gestureInterval)
        }
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
        cardMascotRef.current = null
      }
    }
  }, [selectedPhrase, isMobile])

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

  return (
    <div>
      <EmotiveHeader />

      {/* Scroll-driven mascot - Loaded dynamically */}
      <CherokeeMascot />

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <main style={{
      background: 'radial-gradient(ellipse at top, rgba(218,165,32,0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
      color: 'white',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Ambient light effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(218,165,32,0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem clamp(1.5rem, 5vw, 4rem)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(3rem, 6vw, 5rem)',
          paddingTop: '1rem'
        }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#DAA520'
              e.currentTarget.style.transform = 'translateX(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>←</span> Back to Portfolio
          </Link>
          <div style={{
            padding: '0.6rem 1.2rem',
            background: 'linear-gradient(135deg, rgba(218,165,32,0.15) 0%, rgba(218,165,32,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            border: '1px solid rgba(218,165,32,0.3)',
            boxShadow: '0 4px 24px rgba(218,165,32,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            Flagship Use Case
          </div>
        </div>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(4rem, 8vw, 6rem)'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #F0C420 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textShadow: '0 0 80px rgba(218,165,32,0.3)',
            position: 'relative'
          }}>
            ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em'
          }}>
            Cherokee Language Learning
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: '400',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            Learn essential Cherokee greetings and phrases with authentic syllabary characters and pronunciation.
            All content verified through official Cherokee Nation sources.
          </p>
        </div>

        {/* Guide Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(3rem, 6vw, 5rem)',
            padding: 'clamp(2rem, 4vw, 3rem)',
            background: 'linear-gradient(135deg, rgba(218,165,32,0.1) 0%, rgba(218,165,32,0.03) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: '24px',
            border: '1px solid rgba(218,165,32,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(218,165,32,0.5), transparent)'
          }} />

          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700',
            letterSpacing: '-0.01em'
          }}>
            ᎣᏏᏲ! Let&apos;s Learn Together
          </h3>
          <p style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
            maxWidth: '580px',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            Click any greeting card below to explore its meaning, pronunciation, and cultural significance with an animated guide!
          </p>
          <div style={{
            marginTop: '1.5rem',
            fontSize: '2.5rem',
            animation: 'bounce 2s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 8px rgba(218,165,32,0.3))'
          }}>
            👇
          </div>
        </div>

        {/* Cherokee Greetings Grid */}
        <div className="cherokee-greetings-grid" style={{
          background: 'linear-gradient(135deg, rgba(218,165,32,0.08) 0%, rgba(218,165,32,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2rem, 4vw, 3rem)',
          border: '1px solid rgba(218,165,32,0.2)',
          marginBottom: 'clamp(4rem, 8vw, 6rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top gradient line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(218,165,32,0.6), transparent)'
          }} />

          <h3 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Common Cherokee Greetings
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(1.25rem, 2.5vw, 2rem)'
          }}>
            {greetings.map((item) => (
              <div
                key={item.english}
                onClick={() => setSelectedPhrase(item.english)}
                style={{
                  padding: 'clamp(1.75rem, 3vw, 2.25rem)',
                  background: selectedPhrase === item.english
                    ? `linear-gradient(135deg, ${item.bgColor}, ${item.bgColor.replace('0.15', '0.08')})`
                    : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: selectedPhrase === item.english
                    ? `2px solid ${item.borderColor}`
                    : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: selectedPhrase === item.english
                    ? `0 20px 60px ${item.borderColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${item.bgColor.replace('0.15', '0.12')} 0%, ${item.bgColor.replace('0.15', '0.04')} 100%)`
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.borderColor = item.borderColor.replace('0.4', '0.6')
                    e.currentTarget.style.boxShadow = `0 16px 48px ${item.borderColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                  }
                }}
              >
                {/* Subtle shine effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                  transition: 'left 0.6s ease'
                }} />

                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }}>
                  {item.emoji}
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.01em'
                }}>
                  {item.english}
                </div>
                <div style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.25rem)',
                  marginBottom: '0.75rem',
                  color: item.color,
                  fontWeight: '600',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}>
                  {item.cherokee}
                </div>
                <div style={{
                  fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                  color: 'rgba(255,255,255,0.6)',
                  fontStyle: 'italic',
                  fontWeight: '400'
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
          const isLastCard = selectedPhrase === '\'Til we meet again'
          const allPhrasesViewed = viewedPhrases.size === greetings.length

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
              onMouseMove={(e) => {
                // Route mouse events to card mascot for gaze tracking
                if (cardMascotRef.current && cardCanvasRef.current) {
                  const canvas = cardCanvasRef.current
                  const rect = canvas.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top

                  // Call setGazeTarget if available
                  if (typeof cardMascotRef.current.setGazeTarget === 'function') {
                    cardMascotRef.current.setGazeTarget(x, y)
                  }
                }
              }}
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
                {/* Use aspect-ratio to maintain 1:1 regardless of content height */}
                <canvas
                  ref={cardCanvasRef}
                  id="card-mascot"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxHeight: '100%',
                    pointerEvents: 'auto',  // Enable pointer events for gaze tracking
                    zIndex: 1,
                    filter: 'none',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
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

                {/* Completion CTA - only show on last card when all phrases viewed */}
                {isLastCard && allPhrasesViewed && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    background: 'rgba(218,165,32,0.15)',
                    borderRadius: '16px',
                    border: '2px solid rgba(218,165,32,0.4)',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      color: '#DAA520'
                    }}>
                      🎉 You&apos;ve learned your first Cherokee phrases!
                    </div>
                    <p style={{
                      fontSize: '1.1rem',
                      opacity: 0.9,
                      lineHeight: 1.6,
                      marginBottom: '1.5rem'
                    }}>
                      <strong style={{ color: '#DAA520', fontSize: '1.3rem' }}>ᏙᎾᏓᎪᎲᎢ</strong> — &apos;Til we meet again.
                    </p>
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '1rem',
                      marginTop: '1.5rem'
                    }}>
                      <a
                        href="https://language.cherokee.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: '1rem 1.5rem',
                          background: 'rgba(218,165,32,0.3)',
                          border: '2px solid rgba(218,165,32,0.6)',
                          borderRadius: '8px',
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '1rem',
                          textAlign: 'center',
                          transition: 'all 0.3s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(218,165,32,0.5)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(218,165,32,0.3)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        Continue Your Cherokee Journey →
                      </a>
                      <button
                        onClick={() => {
                          setSelectedPhrase(null)
                          setTimeout(() => {
                            const greetingsSection = document.querySelector('.cherokee-greetings-grid')
                            if (greetingsSection) {
                              greetingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          }, 100)
                        }}
                        style={{
                          flex: 1,
                          padding: '1rem 1.5rem',
                          background: 'rgba(255,255,255,0.1)',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        Review These Phrases ↻
                      </button>
                    </div>
                  </div>
                )}
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

        {/* Sources & Attribution */}
        <div style={{
          background: 'rgba(218,165,32,0.08)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(218,165,32,0.2)',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#DAA520'
          }}>
            Sources & Resources
          </h3>
          <p style={{
            opacity: 0.85,
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 2rem auto'
          }}>
            All Cherokee language content on this page has been verified using official Cherokee Nation resources.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--grid-gap)',
            marginTop: '2rem'
          }}>
            <a
              href="https://visitcherokeenation.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1.5rem',
                background: 'rgba(218,165,32,0.1)',
                border: '1px solid rgba(218,165,32,0.3)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(218,165,32,0.2)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(218,165,32,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem', textAlign: 'center' }}>🌐</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#DAA520', textAlign: 'center' }}>
                Official Cherokee Nation Website
              </div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'center' }}>
                Language content and cultural information verified through visitcherokeenation.com
              </div>
            </a>
            <a
              href="https://www.youtube.com/@VisitCherokeeNation"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '1.5rem',
                background: 'rgba(218,165,32,0.1)',
                border: '1px solid rgba(218,165,32,0.3)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(218,165,32,0.2)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(218,165,32,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem', textAlign: 'center' }}>🎥</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#DAA520', textAlign: 'center' }}>
                Cherokee Nation YouTube
              </div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'center' }}>
                Pronunciations and proper usage examples from official Cherokee Nation videos
              </div>
            </a>
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

        {/* Footer Spacing */}
        <div style={{ height: 'clamp(4rem, 8vw, 6rem)' }} />
      </main>

      <EmotiveFooter />
    </div>
  )
}
