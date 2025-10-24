'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import ScheduleModal from '@/components/ScheduleModal'
import SmartHomeSimulation from './SmartHomeSimulation'
import UseCaseNav from '@/components/UseCaseNav'

export default function SmartHomePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<any>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)
  const lastGestureRef = useRef<number>(-1)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const lastZIndexRef = useRef<number>(100)

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

  // Initialize scroll-following mascot
  useEffect(() => {
    // Wait for client-side hydration before initializing
    if (!isClient) return

    let cancelled = false

    const initializeEngine = async () => {
      if (!canvasRef.current || cancelled) return

      if (initializedRef.current) return
      if (initializingRef.current) return
      if (mascotRef.current) return

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
          script.src = `/emotive-engine.js`
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
          canvasId: 'smart-home-hero-mascot',
          targetFPS: isMobileDevice ? 30 : 60,
          enableAudio: false,
          soundEnabled: false,
          maxParticles: isMobileDevice ? 50 : 120,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          transitionDuration: 600,
          emotionTransitionSpeed: 400,
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
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
          responsive: true,
          color: '#8B5CF6'
        })

        mascotInstance.setScale({
          core: 0.8,
          particles: 1.4
        })

        const initialXOffset = isMobileDevice ? 0 : -vw * 0.38
        const initialYOffset = isMobileDevice
          ? -vh * 0.3  // Mobile: higher up to account for 75vh hero
          : -vh * 0.05   // Desktop: slightly up
        mascotInstance.setPosition(initialXOffset, initialYOffset, 0)

        mascotInstance.start()

        // Check if component is still mounted before setting state
        if (!cancelled) {
          mascotRef.current = mascotInstance
          setMascot(mascotInstance)

          initializedRef.current = true
          initializingRef.current = false

          if (typeof mascotInstance.fadeIn === 'function') {
            mascotInstance.fadeIn(1500)
          }

          setTimeout(() => {
            if (!cancelled && typeof mascotInstance.express === 'function') {
              mascotInstance.express('wave')
            }
          }, 800)
        } else {
          // Component unmounted during init, clean up immediately
          mascotInstance.stop()
          if (typeof mascotInstance.destroy === 'function') {
            mascotInstance.destroy()
          }
        }

      } catch (error) {
        console.error('Failed to initialize mascot:', error)
        initializingRef.current = false
      }
    }

    initializeEngine()

    return () => {
      cancelled = true

      // Cleanup mascot instance to prevent memory leaks
      if (mascotRef.current) {
        try {
          mascotRef.current.stop()
          if (typeof mascotRef.current.destroy === 'function') {
            mascotRef.current.destroy()
          }

          // Clear canvas to release GPU resources
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            }
          }
        } catch (error) {
          console.error('Error cleaning up mascot:', error)
        }

        mascotRef.current = null
        setMascot(null)
        initializedRef.current = false
        initializingRef.current = false
      }
    }
  }, [isClient])

  // Scroll-driven animation
  useEffect(() => {
    if (!mascot || !containerRef.current) return

    const container = containerRef.current

    const updateMascotOnScroll = () => {
      try {
        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobileDevice = viewportWidth < 768

        // Update position smoothly on every frame for consistent motion
        if (mascot && typeof mascot.setPosition === 'function') {
          const baseXOffset = isMobileDevice ? 0 : -viewportWidth * 0.38
          const yOffset = isMobileDevice
            ? (scrollY - viewportHeight * 0.6) * 0.5  // Much higher up on mobile
            : (scrollY - viewportHeight * 0.1) * 0.5   // Normal on desktop
          const wavelength = 600
          const amplitude = isMobileDevice
            ? Math.min(80, viewportWidth * 0.15)
            : Math.min(100, viewportWidth * 0.08)
          const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

          mascot.setPosition(xOffset, yOffset, 0)
        }

        // Calculate opacity and z-index
        const heroHeight = viewportHeight * 0.9
        const demoSectionStart = heroHeight + viewportHeight * 0.3
        const fadeRange = viewportHeight * 0.3

        let opacity = 1
        let zIndex = 100

        if (scrollY >= demoSectionStart) {
          const fadeProgress = Math.min((scrollY - demoSectionStart) / fadeRange, 1)
          opacity = Math.max(0, 1 - fadeProgress)
        }

        if (scrollY >= heroHeight) {
          zIndex = opacity > 0.1 ? 1 : -1
        }

        // Update z-index ONLY when it changes (threshold-based, not continuous)
        // This prevents CSS recompilation while allowing mascot to hide behind content
        if (zIndex !== lastZIndexRef.current && containerRef.current) {
          lastZIndexRef.current = zIndex
          containerRef.current.style.zIndex = String(zIndex)
        }

        // Gesture points
        if (opacity > 0.1) {
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
        // Cancel any pending RAF before scheduling new one
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(updateMascotOnScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      tickingRef.current = false
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
          zIndex: 100,
          opacity: 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          id="smart-home-hero-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 40px rgba(139, 92, 246, 0.5))',
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
        {/* Hero Section - Apple Style */}
        <section style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vh, 4rem) clamp(1rem, 3vw, 2rem)',
          background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 50%), linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
          position: 'relative',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}>
          {/* Ambient light effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: 'clamp(8rem, 20vh, 12rem)',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '30px',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#A78BFA',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              boxShadow: '0 4px 24px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              AI-Powered Home • Live Demo
            </div>

            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: '900',
              marginBottom: '2rem',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #DDD6FE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(139, 92, 246, 0.3)',
            }}>
              Smart Home Control
            </h1>

            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em'
            }}>
              Make Automation Feel Human
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
              Emotive AI that responds to device states and user actions with expressive animations, transforming cold automation into warm, intuitive experiences.
            </p>


            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '4rem',
            }}>
              <button
                onClick={() => {
                  const demoSection = document.querySelector('#demo')
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    // Scroll up a bit more to fully show the demo
                    setTimeout(() => {
                      window.scrollBy({ top: -100, behavior: 'smooth' })
                    }, 600)
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>▶️</span> See Live Demo
              </button>

              <a
                href="/docs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
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
                <span>📚</span> View Documentation
              </a>
            </div>

            {/* Stats - Emotive Engine Capabilities */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? '2rem' : '3rem',
              maxWidth: '900px',
              margin: '3rem auto 0 auto',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: '700',
                  color: '#8B5CF6',
                  marginBottom: '0.75rem',
                  textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }}>
                  35+
                </div>
                <div style={{
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Built-in Gestures
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: '700',
                  color: '#8B5CF6',
                  marginBottom: '0.75rem',
                  textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }}>
                  15
                </div>
                <div style={{
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Core Emotions
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: '700',
                  color: '#8B5CF6',
                  marginBottom: '0.75rem',
                  textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }}>
                  ∞
                </div>
                <div style={{
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Infinitely Custom
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" style={{
          padding: '2rem',
          maxWidth: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Ambient background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            maxWidth: '1600px',
            width: '100%',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '4rem',
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
              borderRadius: '32px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(139, 92, 246, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)'
              }} />

              <div style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: 'rgba(139, 92, 246, 0.15)',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                marginBottom: '1.5rem',
                color: '#A78BFA',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                Live Interactive Demo
              </div>
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: '900',
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
              }}>
                Your Smart Home Hub
              </h2>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: '900px',
                margin: '0 auto',
                lineHeight: 1.7,
                fontWeight: '500'
              }}>
                See how visual feedback brings your interface to life. The mascot morphs shapes, changes emotions, and responds with animations to every interaction. Powered by Emotive Engine.
              </p>
            </div>

            {/* Simulation */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              borderRadius: isMobile ? '20px' : '40px',
              border: '3px solid rgba(139, 92, 246, 0.2)',
              boxShadow: `
                0 40px 120px rgba(0, 0, 0, 0.7),
                0 0 0 1px rgba(139, 92, 246, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
              overflow: 'hidden',
              position: 'relative',
              height: isMobile ? 'calc(100vh - 2rem)' : 'auto',
              display: isMobile ? 'flex' : 'block',
              flexDirection: isMobile ? 'column' : undefined
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)',
                zIndex: 100
              }} />

              <SmartHomeSimulation />
            </div>
          </div>
        </section>

        {/* Features Section - Bento Grid */}
        <section id="features" style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '4rem auto 6rem auto',
          background: 'rgba(10, 10, 10, 0.95)',
          borderRadius: '32px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent)'
          }} />

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
              Emotive Engine Features
            </h2>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Real-time visual feedback that makes interfaces feel responsive and alive
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}>
            {[
              {
                icon: '✨',
                title: 'Dynamic Shape Morphing',
                description: 'Watch the mascot seamlessly transform between circles, squares, stars, and custom shapes in real-time based on user interactions.',
                color: '#8B5CF6'
              },
              {
                icon: '😊',
                title: 'Emotional Expressions',
                description: 'The mascot displays emotions like joy, calm, excitement, and surprise through particle behavior and color shifts.',
                color: '#A78BFA'
              },
              {
                icon: '🎭',
                title: 'Gesture Animations',
                description: 'Built-in gestures like wave, bounce, pulse, glow, and nod bring personality to every interaction.',
                color: '#06B6D4'
              },
              {
                icon: '💫',
                title: 'Particle Effects',
                description: 'Dynamic particle system with adjustable intensity, spread, and behavior creates mesmerizing visual feedback.',
                color: '#14B8A6'
              },
              {
                icon: '🎨',
                title: 'Customizable Appearance',
                description: 'Fully configurable colors, backdrop effects, scale, and positioning to match your brand aesthetic.',
                color: '#F59E0B'
              },
              {
                icon: '⚡',
                title: 'Performance Optimized',
                description: 'Configurable FPS targets and adaptive particle systems ensure buttery-smooth animations on any device without compromising visual quality.',
                color: '#EF4444'
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: 'clamp(2rem, 3vw, 2.5rem)',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2vw, 1.4rem)',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: feature.color,
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                  opacity: 0.8,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.85)'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Info */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '4rem auto 6rem auto',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
            borderRadius: '32px',
            padding: 'clamp(3rem, 5vw, 4rem)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent)'
            }} />

            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              marginBottom: '1rem',
              color: '#8B5CF6',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Easy Integration
            </h2>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
              opacity: 0.85,
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto'
            }}>
              Add the Emotive Engine to any web-based interface with just a few lines of code
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2rem)',
              marginTop: '2rem'
            }}>
              {[
                { icon: '📦', label: 'Simple Setup', value: 'Initialize with minimal configuration' },
                { icon: '🎨', label: 'Fully Customizable', value: 'Colors, shapes, and behaviors' },
                { icon: '📱', label: 'Responsive Design', value: 'Works on desktop and mobile' },
                { icon: '⚡', label: 'Lightweight', value: 'Optimized for performance' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '2rem',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(0,0,0,0.25)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.label}</div>
                  <div style={{ opacity: 0.7, fontSize: '0.95rem', lineHeight: 1.5 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{
          padding: '8rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            borderRadius: '32px',
            padding: 'clamp(3rem, 5vw, 5rem)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none'
            }} />

            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              marginBottom: '1.5rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              position: 'relative',
              zIndex: 1
            }}>
              Ready to Elevate Your Interface?
            </h2>

            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              opacity: 0.85,
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
              lineHeight: 1.7,
              position: 'relative',
              zIndex: 1
            }}>
              Join leading product teams using Emotive Engine to create interfaces that users love to interact with.
            </p>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <a
                href="/docs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>📚</span> Get Started
              </a>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.25rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
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
                <span>📧</span> Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Use Case Navigation */}
        <UseCaseNav currentPath="/use-cases/smart-home" />

        {/* Footer Spacing */}
        <div style={{ height: '2rem' }} />
      </main>

      <EmotiveFooter />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        calLink="emotive-engine/30min"
      />
    </>
  )
}
