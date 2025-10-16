'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const lastGestureRef = useRef<number>(-1)
  const [containerZIndex, setContainerZIndex] = useState(100)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Detect mobile on client-side only (prevents hydration mismatch)
  useEffect(() => {
    setIsClient(true)
    setIsMobileView(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize mascot engine
  useEffect(() => {
    const initializeEngine = async () => {
      if (!canvasRef.current) return

      try {
        // Set canvas size to viewport for full particle freedom
        const canvas = canvasRef.current
        const vw = window.innerWidth
        const vh = window.innerHeight
        canvas.width = vw
        canvas.height = vh

        // Load the engine script dynamically with cache busting
        const script = document.createElement('script')
        script.src = `/emotive-engine.js?v=${Date.now()}`
        script.async = true

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })

        // Access the global EmotiveMascot (UMD export with mixed exports uses .default)
        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found on window object')
          return
        }

        // Mobile detection and sizing
        const isMobile = vw < 768
        const targetMascotSize = isMobile ? 150 : 300
        const coreSizeDivisor = Math.max(4, vw / targetMascotSize)

        // Create mascot instance with mobile optimization
        const mascotInstance = new EmotiveMascot({
          canvasId: 'hero-mascot-canvas',
          targetFPS: isMobile ? 30 : 60,
          enableAudio: false,
          soundEnabled: false,
          maxParticles: isMobile ? 50 : 120,
          defaultEmotion: 'neutral',
          enableAutoOptimization: true,
          enableGracefulDegradation: true,
          renderingStyle: 'classic',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          renderSize: { width: vw, height: vh },
          classicConfig: {
            coreColor: '#FFFFFF',
            coreSizeDivisor: coreSizeDivisor,
            glowMultiplier: isMobile ? 2.0 : 3.0,
            defaultGlowColor: '#667eea'
          }
        })

        // Initialize the engine with canvas element
        await mascotInstance.init(canvas)

        // Enable backdrop for better particle visibility
        mascotInstance.setBackdrop({
          enabled: true,
          radius: 3.5,             // Smaller radius - stays near mascot, won't reach text
          intensity: 0.85,         // Slightly darker since it's smaller
          blendMode: 'normal',     // Normal mode for clean fadeout (no halo)
          falloff: 'smooth',
          edgeSoftness: 0.95,      // Very gradual falloff
          coreTransparency: 0.3,   // Transparent in center 30%
          responsive: true
        })

        // Set mascot scale - smaller for subtle presence
        mascotInstance.setScale({
          core: 0.4,       // Core at 40% of default size
          particles: 0.7   // Particles at 70% for balanced appearance
        })

        // Set initial position BEFORE starting to prevent center-spawn particles
        // Desktop: Position mascot far left, Mobile: Keep centered
        const initialXOffset = isMobile ? 0 : -vw * 0.38
        mascotInstance.setPosition(initialXOffset, 0, 0)

        // Start the engine
        mascotInstance.start()

        // Set mascot in state AFTER init and start
        setMascot(mascotInstance)

        // Fade in mascot
        if (typeof mascotInstance.fadeIn === 'function') {
          mascotInstance.fadeIn(1500)
        }

      } catch (error) {
        console.error('Failed to initialize mascot:', error)
      }
    }

    initializeEngine()

    return () => {
      if (mascot) {
        mascot.stop()
      }
    }
  }, [])

  // Scroll-driven animation with enhanced visual effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrollPosition(scrollY)

      if (!mascot) return

      // Calculate positions
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const isMobile = viewportWidth < 768

      // Desktop: Position mascot far left in empty space
      // Mobile: Keep centered
      const baseXOffset = isMobile ? 0 : -viewportWidth * 0.38 // Far left on desktop

      // Vertical offset from center: follows scroll with dampening
      const yOffset = (scrollY - viewportHeight * 0.1) * 0.5

      // Sinusoidal horizontal motion
      const wavelength = 600 // Pixels per wave
      const amplitude = isMobile
        ? Math.min(80, viewportWidth * 0.15)
        : Math.min(100, viewportWidth * 0.08) // Minimal amplitude on desktop
      const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

      // Update mascot position
      if (typeof mascot.setPosition === 'function') {
        mascot.setPosition(xOffset, yOffset, 0)
      }

      // Z-index transition: in front for hero, behind glass cards after
      const heroHeight = viewportHeight * 0.9
      if (scrollY < heroHeight) {
        setContainerZIndex(100) // In front during hero section
      } else {
        setContainerZIndex(1) // Behind glass cards (which are z-index: 2)
      }

      // Trigger gestures at specific scroll positions (tied to content sections)
      const gesturePoints = [
        { threshold: 0, gesture: null, emotion: 'neutral' }, // Initial state
        { threshold: heroHeight * 0.9, gesture: 'wave', emotion: 'joy' }, // Leaving hero
        { threshold: heroHeight + 800, gesture: 'bounce', emotion: 'excited' }, // Cherokee showcase
      ]

      // Find current zone based on scroll position
      let currentZone = 0
      for (let i = gesturePoints.length - 1; i >= 0; i--) {
        if (scrollY > gesturePoints[i].threshold) {
          currentZone = i
          break
        }
      }

      // Only trigger if zone changed
      if (currentZone !== lastGestureRef.current) {
        const point = gesturePoints[currentZone]

        if (typeof mascot.setEmotion === 'function') {
          mascot.setEmotion(point.emotion, 0)
        }

        if (point.gesture && typeof mascot.triggerGesture === 'function') {
          mascot.triggerGesture(point.gesture)
        }

        lastGestureRef.current = currentZone
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial position

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [mascot])

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
          zIndex: containerZIndex,
          transition: 'z-index 0.3s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          id="hero-mascot-canvas"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 40px rgba(102, 126, 234, 0.4))',
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
          background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
          position: 'relative',
        }}>
          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: '2rem',
          }}>
            {/* Hero Text */}
            <div>
              <div style={{
                display: 'inline-block',
                padding: '0.6rem 1.5rem',
                background: 'rgba(102, 126, 234, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '30px',
                marginBottom: '2rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#a5b4fc',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}>
                Emotional AI • 15 Emotions • 50+ Gestures
              </div>

              <h1 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                fontWeight: '900',
                marginBottom: '2rem',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 80px rgba(102, 126, 234, 0.3)',
              }}>
                Emotional AI That Feels
              </h1>

              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
                color: 'rgba(255,255,255,0.75)',
                marginBottom: '3rem',
                lineHeight: '1.7',
                maxWidth: '700px',
                margin: '0 auto 3rem auto',
              }}>
                Real-time emotion engine that creates genuine human connection.
                No uncanny valley—just authentic, responsive experiences.
              </p>

              {/* Interactive Emotion Selector */}
              <div className="emotion-selector" style={{
                maxWidth: '800px',
                margin: '0 auto 3rem auto',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '1.5rem',
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  ✨ Feel the Emotions
                </div>

                <div className="emotion-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem',
                }}>
                  {isClient && [
                    { name: 'joy', svg: 'joy.svg', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', mobile: true },
                    { name: 'sadness', svg: 'sadness.svg', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', mobile: true },
                    { name: 'anger', svg: 'anger.svg', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', mobile: true },
                    { name: 'fear', svg: 'fear.svg', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', mobile: false },
                    { name: 'excited', svg: 'excited.svg', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)', mobile: false },
                    { name: 'love', svg: 'love.svg', color: '#F472B6', bg: 'rgba(244, 114, 182, 0.15)', mobile: false },
                    { name: 'calm', svg: 'calm.svg', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', mobile: true },
                    { name: 'surprise', svg: 'surprise.svg', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', mobile: false },
                  ].filter((emotion) => {
                    // Use state variable to avoid hydration mismatch
                    if (isMobileView) {
                      return emotion.mobile;
                    }
                    // Show all emotions on desktop
                    return true;
                  }).map((emotion) => (
                    <button
                      key={emotion.name}
                      onClick={() => {
                        if (mascot && typeof mascot.setEmotion === 'function') {
                          mascot.setEmotion(emotion.name, 0) // Instant transition
                        }
                      }}
                      style={{
                        padding: '1rem',
                        background: emotion.bg,
                        border: `1px solid ${emotion.color}40`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${emotion.bg.replace('0.15', '0.25')}`
                        e.currentTarget.style.borderColor = `${emotion.color}80`
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                        e.currentTarget.style.boxShadow = `0 8px 20px ${emotion.color}40`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = emotion.bg
                        e.currentTarget.style.borderColor = `${emotion.color}40`
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <img
                        src={`/assets/states/${emotion.svg}`}
                        alt={emotion.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
                        }}
                      />
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: emotion.color,
                        textTransform: 'capitalize',
                      }}>
                        {emotion.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '4rem',
              }}>
                <Link
                  href="/demo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <span>🎵</span> Try Live Demo
                </Link>

                <a
                  href="#use-cases"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Explore Use Cases
                </a>
              </div>

              {/* Stats */}
              <div className="stats-grid" style={{
                display: 'flex',
                gap: '4rem',
                justifyContent: 'center',
                marginTop: '2rem',
                paddingTop: '3rem',
                borderTop: '1px solid rgba(102, 126, 234, 0.2)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#667eea',
                    marginBottom: '0.5rem',
                    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                  }}>
                    15
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600',
                  }}>
                    Core Emotions
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#667eea',
                    marginBottom: '0.5rem',
                    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                  }}>
                    50+
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600',
                  }}>
                    Gestures
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#667eea',
                    marginBottom: '0.5rem',
                    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                  }}>
                    0
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600',
                  }}>
                    GPU Required
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Use Cases - Bento Grid */}
        <section id="use-cases" style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '2rem auto',
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Built for Real-World Impact
            </h2>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              From cultural preservation to healthcare, see how emotional AI transforms experiences
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(3, 200px)',
            gap: '1.5rem',
          }}>
            {/* Cherokee - Large Feature (2x2) */}
            <Link
              href="/use-cases/cherokee"
              style={{
                gridColumn: 'span 2',
                gridRow: 'span 2',
                background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.05) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(218,165,32,0.3)',
                padding: '2rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(218,165,32,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(218,165,32,0.9)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Flagship
              </div>

              <div>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem',
                }}>
                  ᏣᎳᎩ
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#DAA520',
                }}>
                  Cherokee Language
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  opacity: 0.9,
                }}>
                  Interactive syllabary learning with shape-morphing animations and cultural context
                </p>
              </div>

              <div style={{
                fontSize: '0.85rem',
                opacity: 0.7,
                fontStyle: 'italic',
              }}>
                Cherokee Nation • Cultural Preservation
              </div>
            </Link>

            {/* Retail */}
            <Link
              href="/use-cases/retail"
              style={{
                gridColumn: 'span 2',
                gridRow: 'span 1',
                background: 'linear-gradient(135deg, rgba(255,107,157,0.15) 0%, rgba(255,107,157,0.05) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(255,107,157,0.2)',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'white',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,107,157,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🛒</div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.3rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#FF6B9D',
              }}>
                Retail Checkout AI
              </h3>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                opacity: 0.8,
              }}>
                Empathetic guidance through checkout
              </p>
            </Link>

            {/* Smart Home */}
            <Link
              href="/use-cases/smart-home"
              style={{
                gridColumn: 'span 2',
                gridRow: 'span 1',
                background: 'linear-gradient(135deg, rgba(78,205,196,0.15) 0%, rgba(78,205,196,0.05) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(78,205,196,0.2)',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'white',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(78,205,196,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🏠</div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.3rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#4ECDC4',
              }}>
                Smart Home Hub
              </h3>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                opacity: 0.8,
              }}>
                Context-aware IoT control
              </p>
            </Link>

            {/* Healthcare */}
            <Link
              href="/use-cases/healthcare"
              style={{
                gridColumn: 'span 1',
                gridRow: 'span 1',
                background: 'linear-gradient(135deg, rgba(150,206,180,0.15) 0%, rgba(150,206,180,0.05) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(150,206,180,0.2)',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(150,206,180,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#96CEB4',
              }}>
                Healthcare
              </h3>
            </Link>

            {/* Education */}
            <Link
              href="/use-cases/education"
              style={{
                gridColumn: 'span 1',
                gridRow: 'span 1',
                background: 'linear-gradient(135deg, rgba(69,183,209,0.15) 0%, rgba(69,183,209,0.05) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(69,183,209,0.2)',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(69,183,209,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#45B7D1',
              }}>
                Education
              </h3>
            </Link>
          </div>
        </section>

        {/* For Developers */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '4rem auto 6rem auto',
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Built for Developers
            </h2>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
            }}>
              Open source, platform-agnostic, designed for seamless integration
            </p>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}>
              <div
                style={{
                  padding: '1.2rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                📦 GitHub
              </div>

              <div
                style={{
                  padding: '1.2rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                📘 NPM
              </div>

              <div
                style={{
                  padding: '1.2rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                📖 Docs
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
            }}>
              <a
                href="https://forms.gle/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.2rem 2.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'
                }}
              >
                <span>🔔</span> Get Notified When Code is Available
              </a>
            </div>
          </div>
        </section>

        {/* Footer Spacing */}
        <div style={{ height: '4rem' }} />
      </main>

      <EmotiveFooter />

      {/* Styles */}
      <style jsx>{`
        /* Mobile Optimizations */
        @media (max-width: 768px) {
          /* Emotion selector - stack in columns */
          .emotion-selector {
            padding: 1.5rem 1rem !important;
          }

          .emotion-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.8rem !important;
          }

          /* Stats grid - reduce gap */
          .stats-grid {
            gap: 1.5rem !important;
            flex-wrap: wrap;
            padding-top: 2rem !important;
          }

          /* Use cases grid - single column */
          #use-cases {
            padding: 3rem 1rem !important;
          }

          #use-cases > div:last-child {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }

          #use-cases a {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
            min-height: 180px;
          }

          /* Hero section - adjust padding */
          .emotive-container section {
            padding: 2rem 1rem !important;
          }

          /* Reduce button padding on mobile */
          .emotive-container a {
            padding: 0.8rem 1.5rem !important;
            font-size: 1rem !important;
          }
        }

        /* Very small screens */
        @media (max-width: 480px) {
          .emotion-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
          }

          .stats-grid {
            gap: 1rem !important;
          }

          .stats-grid > div {
            min-width: 80px;
          }
        }
      `}</style>
    </>
  )
}
