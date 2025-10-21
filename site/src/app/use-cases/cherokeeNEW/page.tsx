'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function CherokeeNewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)
  const lastGestureRef = useRef<number>(-1)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const frameCountRef = useRef(0)

  // Card modal state
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const cardMascotRef = useRef<any>(null)
  const cardCanvasRef = useRef<HTMLCanvasElement>(null)

  // Detect mobile
  useEffect(() => {
    setIsClient(true)
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Cherokee Greetings Data
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
      emoji: '👋',
      emotion: 'surprise',
      intensity: 0.9,
      gestures: [
        {name: 'hula', delay: 300},
        {name: 'nod', delay: 800}
      ]
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
      emoji: '😊',
      emotion: 'surprise',
      intensity: 0.8,
      gestures: [
        {name: 'wiggle', delay: 300}
      ]
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
      emoji: '✨',
      emotion: 'calm',
      intensity: 0.7,
      gestures: [
        {name: 'drift', delay: 300}
      ]
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
      emoji: '🌅',
      emotion: 'euphoria',
      intensity: 1.0,
      shape: 'sun',
      gestures: [
        {name: 'breathe', delay: 300}
      ]
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
      emoji: '💬',
      emotion: 'neutral',
      intensity: 0.6,
      gestures: [
        {name: 'point', delay: 300},
        {name: 'bounce', delay: 600}
      ]
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
      emoji: '🙏',
      emotion: 'love',
      intensity: 1.0,
      gestures: [
        {name: 'glow', delay: 300},
        {name: 'pulse', delay: 500}
      ]
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
      emoji: '🌙',
      emotion: 'resting',
      intensity: 0.5,
      shape: 'moon',
      gestures: [
        {name: 'wiggle', delay: 300},
        {name: 'shimmer', delay: 600}
      ]
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
      emoji: '🤝',
      emotion: 'neutral',
      intensity: 0.6,
      shape: 'solar',
      gestures: [
        {name: 'groove', delay: 300},
        {name: 'float', delay: 400}
      ]
    },
  ]

  // Initialize scroll-following mascot
  useEffect(() => {
    let cancelled = false

    const initializeEngine = async () => {
      if (!canvasRef.current || cancelled) return

      if (initializedRef.current) return
      if (initializingRef.current) return
      if (mascot) return

      initializingRef.current = true

      try {
        const canvas = canvasRef.current
        const vw = window.innerWidth
        const vh = window.innerHeight
        const isMobileDevice = window.innerWidth < 768

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        // Load EmotiveMascot
        const existingScript = document.querySelector('script[src^="/emotive-engine.js"]')
        let script = existingScript as HTMLScriptElement

        if (!existingScript) {
          script = document.createElement('script')
          script.src = `/emotive-engine.js?v=${Date.now()}`
          script.async = true

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found on window object')
          return
        }

        const mascotInstance = new EmotiveMascot({
          canvasId: 'cherokee-hero-mascot',
          targetFPS: isMobileDevice ? 30 : 60,
          enableAudio: false,
          soundEnabled: false,
          maxParticles: isMobileDevice ? 50 : 120,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          transitionDuration: 600,
          emotionTransitionSpeed: 400
        })

        await mascotInstance.init(canvas)

        mascotInstance.setParticleSystemCanvasDimensions(vw, vh)

        mascotInstance.setBackdrop({
          enabled: true,
          radius: 3.5,
          intensity: 0.85,
          blendMode: 'normal',
          falloff: 'smooth',
          edgeSoftness: 0.95,
          coreTransparency: 0.3,
          responsive: true
        })

        mascotInstance.setScale({
          core: 0.8,
          particles: 1.4
        })

        const initialXOffset = isMobileDevice ? 0 : -vw * 0.38
        mascotInstance.setPosition(initialXOffset, 0, 0)

        mascotInstance.start()

        setMascot(mascotInstance)

        initializedRef.current = true
        initializingRef.current = false

        if (typeof mascotInstance.fadeIn === 'function') {
          mascotInstance.fadeIn(1500)
        }

        setTimeout(() => {
          if (typeof mascotInstance.express === 'function') {
            mascotInstance.express('wave')
          }
        }, 800)

      } catch (error) {
        console.error('Failed to initialize mascot:', error)
        initializingRef.current = false
      }
    }

    initializeEngine()

    return () => {
      cancelled = true
      if (mascot) {
        mascot.stop()
        initializedRef.current = false
        initializingRef.current = false
      }
    }
  }, [])

  // Scroll-driven animation with optimized performance
  useEffect(() => {
    if (!mascot || !containerRef.current) return

    const container = containerRef.current
    let lastOpacity = 1
    let lastZIndex = 100

    const updateMascotOnScroll = () => {
      try {
        frameCountRef.current++

        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobileDevice = viewportWidth < 768

        // Only update position every 3 frames to reduce blocking
        if (frameCountRef.current % 3 === 0 && mascot && typeof mascot.setPosition === 'function') {
          const baseXOffset = isMobileDevice ? 0 : -viewportWidth * 0.38
          const yOffset = (scrollY - viewportHeight * 0.1) * 0.5
          const wavelength = 600
          const amplitude = isMobileDevice
            ? Math.min(80, viewportWidth * 0.15)
            : Math.min(100, viewportWidth * 0.08)
          const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

          mascot.setPosition(xOffset, yOffset, 0)
        }

        // Calculate opacity and z-index based on modal state
        let opacity = selectedPhrase ? 0 : 1
        let zIndex = selectedPhrase ? 1 : 100

        // Only update DOM if values changed significantly
        if (Math.abs(opacity - lastOpacity) > 0.01 || zIndex !== lastZIndex) {
          container.style.opacity = opacity.toFixed(2)
          container.style.zIndex = String(zIndex)
          container.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
          lastOpacity = opacity
          lastZIndex = zIndex
        }

        // Gesture points (only if visible and not too frequent)
        if (opacity > 0.1) {
          const heroHeight = viewportHeight * 0.9
          const gesturePoints = [
            { threshold: 0, gesture: null, emotion: 'neutral' },
            { threshold: heroHeight * 0.9, gesture: 'wave', emotion: 'joy' },
            { threshold: heroHeight + 800, gesture: 'bounce', emotion: 'excitement' },
            { threshold: heroHeight + 2000, gesture: 'pulse', emotion: 'calm' },
          ]

          let currentZone = 0
          for (let i = gesturePoints.length - 1; i >= 0; i--) {
            if (scrollY > gesturePoints[i].threshold) {
              currentZone = i
              break
            }
          }

          if (currentZone !== lastGestureRef.current) {
            const point = gesturePoints[currentZone]

            if (mascot && typeof mascot.setEmotion === 'function') {
              mascot.setEmotion(point.emotion, 0)
            }

            if (point.gesture && mascot && typeof mascot.express === 'function') {
              mascot.express(point.gesture)
            }

            lastGestureRef.current = currentZone
          }
        }
      } catch (error) {
        console.error('Scroll update error:', error)
      } finally {
        tickingRef.current = false
      }
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        rafRef.current = requestAnimationFrame(updateMascotOnScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      tickingRef.current = false
    }
  }, [mascot, selectedPhrase])

  // Initialize card mascot when phrase is selected
  useEffect(() => {
    if (!selectedPhrase || !cardCanvasRef.current) return

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

      // Set canvas dimensions
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
      canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      const greeting = greetings.find(g => g.english === selectedPhrase)
      if (!greeting) return

      try {
        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found on window object')
          return
        }

        const cardMascot = new EmotiveMascot({
          canvasId: 'card-mascot',
          enableAudio: false,
          soundEnabled: false,
          defaultEmotion: greeting.emotion,
          enableGazeTracking: true,
          enableIdleBehaviors: true,
          transitionDuration: 400,
          emotionTransitionSpeed: 300,
        })

        cardMascotRef.current = cardMascot

        await cardMascot.init(canvas)
        cardMascot.start()

        // Position mascot
        if (cardMascot.setPosition) {
          const offsetX = isMobile ? -50 : -150
          const offsetY = isMobile ? 20 : -120
          cardMascot.setPosition(offsetX, offsetY, 0)
        }

        // Apply configuration
        setTimeout(() => {
          if (cardMascot.setEmotion) {
            cardMascot.setEmotion(greeting.emotion, greeting.intensity)
          }

          if (greeting.shape && cardMascot.morphTo) {
            cardMascot.morphTo(greeting.shape)
          }

          // Trigger gestures
          const triggerGestures = () => {
            greeting.gestures.forEach((gesture) => {
              setTimeout(() => {
                if (gesture.name === 'drift' && cardMascot.chain) {
                  cardMascot.chain('drift')
                } else if (cardMascot.express) {
                  cardMascot.express(gesture.name)
                }
              }, gesture.delay)
            })
          }

          triggerGestures()

          // Repeat gestures
          const gestureInterval = setInterval(() => {
            if (cardMascotRef.current) {
              triggerGestures()
            }
          }, 8000)

          ;(cardMascot as any)._gestureInterval = gestureInterval
        }, 200)

      } catch (err) {
        console.error('Failed to initialize card mascot:', err)
      }
    }

    initCardMascot()

    return () => {
      if (cardMascotRef.current) {
        const interval = (cardMascotRef.current as any)._gestureInterval
        if (interval) clearInterval(interval)
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
        cardMascotRef.current = null
      }
    }
  }, [selectedPhrase, isMobile, greetings])

  return (
    <>
      <EmotiveHeader />

      {/* Scroll-driven mascot */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 100,
          opacity: 1,
          willChange: 'opacity, z-index',
        }}
      >
        <canvas
          ref={canvasRef}
          id="cherokee-hero-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 40px rgba(218, 165, 32, 0.4))',
          }}
        />
      </div>

      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          background: 'radial-gradient(ellipse at top, rgba(218,165,32,0.15) 0%, transparent 50%), linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
          position: 'relative',
        }}>
          {/* Ambient light effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(218, 165, 32, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: '2rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem',
              background: 'rgba(218, 165, 32, 0.15)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              borderRadius: '30px',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#DAA520',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              boxShadow: '0 4px 24px rgba(218, 165, 32, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              Cherokee Language • Cultural Learning
            </div>

            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: '900',
              marginBottom: '2rem',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #DAA520 0%, #FFB347 50%, #F8B739 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(218, 165, 32, 0.3)',
            }}>
              ᏣᎳᎩ ᎧᏬᏂᎯᏍᏗ
            </h1>

            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em'
            }}>
              Learn Cherokee Greetings
            </h2>

            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '3rem',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
            }}>
              Discover common Cherokee phrases through interactive cards with emotional AI that responds to each greeting's unique cultural meaning.
            </p>
          </div>
        </section>

        {/* Greeting Cards Grid */}
        <section style={{
          padding: '4rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {greetings.map((greeting) => (
              <div
                key={greeting.english}
                onClick={() => setSelectedPhrase(greeting.english)}
                style={{
                  background: greeting.bgColor,
                  border: `2px solid ${greeting.borderColor}`,
                  borderRadius: '20px',
                  padding: '2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = `0 20px 60px ${greeting.borderColor.replace('0.4', '0.4')}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                }}>
                  {greeting.emoji}
                </div>
                <div style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  color: greeting.color,
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                }}>
                  {greeting.cherokee}
                </div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}>
                  {greeting.english}
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.7,
                  fontStyle: 'italic',
                }}>
                  {greeting.pronunciation}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back navigation */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(218, 165, 32, 0.2)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(218, 165, 32, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(218, 165, 32, 0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(218, 165, 32, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>

        {/* Footer Spacing */}
        <div style={{ height: '4rem' }} />
      </main>

      {/* Card Modal */}
      {selectedPhrase && (() => {
        const selected = greetings.find(g => g.english === selectedPhrase)
        if (!selected) return null

        return (
          <div
            onClick={() => setSelectedPhrase(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              overflow: 'auto',
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
              }}
            >
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
                  pointerEvents: 'auto',
                  zIndex: 1,
                  filter: 'none',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              />

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

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    flexShrink: 0,
                    position: 'relative'
                  }} />

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
                opacity: 0.7,
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 2
              }}>
                💡 <strong>Cultural Context:</strong><br />
                {selected.context}
              </div>
            </div>
          </div>
        )
      })()}

      <EmotiveFooter />
    </>
  )
}
