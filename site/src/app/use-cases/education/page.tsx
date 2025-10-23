'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import ScheduleModal from '@/components/ScheduleModal'
import AILearningAssistant from './AILearningAssistant'
import LearningSimulation from './LearningSimulation'

export default function EducationPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)
  const lastGestureRef = useRef<number>(-1)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const frameCountRef = useRef(0)
  const lastOpacityRef = useRef(1)
  const lastZIndexRef = useRef(100)
  const lastVisibilityRef = useRef<string>('visible')

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
          canvasId: 'education-hero-mascot',
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
        const initialYOffset = isMobileDevice
          ? -vh * 0.3  // Mobile: higher up
          : -vh * 0.05   // Desktop: slightly higher
        mascotInstance.setPosition(initialXOffset, initialYOffset, 0)

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

    const updateMascotOnScroll = () => {
      try {
        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobileDevice = viewportWidth < 768

        // Update mascot position
        if (mascot && typeof mascot.setPosition === 'function') {
          const baseXOffset = isMobileDevice ? 0 : -viewportWidth * 0.38
          const yOffset = isMobileDevice
            ? (scrollY - viewportHeight * 0.6) * 0.5  // Much higher up on mobile
            : (scrollY - viewportHeight * 0.1) * 0.5  // Slightly higher on desktop
          const wavelength = 600
          const amplitude = isMobileDevice
            ? Math.min(80, viewportWidth * 0.15)
            : Math.min(100, viewportWidth * 0.08)
          const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

          mascot.setPosition(xOffset, yOffset, 0)
        }

        // Calculate opacity using CSS custom property - no z-index changes
        const heroHeight = viewportHeight * 0.9
        const demoSectionStart = heroHeight + viewportHeight * 0.3
        const fadeRange = viewportHeight * 0.3

        let opacity = 1

        if (scrollY >= demoSectionStart) {
          const fadeProgress = Math.min((scrollY - demoSectionStart) / fadeRange, 1)
          opacity = Math.max(0, 1 - fadeProgress)
        }

        // Only update opacity if changed significantly
        if (Math.abs(opacity - lastOpacityRef.current) > 0.02) {
          container.style.opacity = String(opacity)
          lastOpacityRef.current = opacity
        }

        // Gesture points (only if visible)
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
  }, [mascot])

  return (
    <>
      <EmotiveHeader />

      {/* Scroll-driven mascot - fades out when learning sections become visible */}
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
        }}
      >
        <canvas
          ref={canvasRef}
          id="education-hero-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 40px rgba(124, 58, 237, 0.4))',
          }}
        />
      </div>

      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        contain: 'layout style paint',
        willChange: 'scroll-position',
      }}>
        {/* Hero Section */}
        <section style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vh, 4rem) clamp(1rem, 3vw, 2rem)',
          background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 50%), linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
          position: 'relative',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          overflow: 'hidden',
          contentVisibility: 'auto',
          containIntrinsicSize: '0 75vh'
        }}>
          {/* Ambient light effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
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
              padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.5rem',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '30px',
              marginBottom: isMobile ? '1.5rem' : '2rem',
              fontSize: isMobile ? '0.7rem' : '0.85rem',
              fontWeight: '600',
              color: '#A78BFA',
              textTransform: 'uppercase',
              letterSpacing: isMobile ? '1px' : '1.5px',
              boxShadow: '0 4px 24px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
              whiteSpace: 'nowrap'
            }}>
              {isMobile ? 'AI Education • Live' : 'AI-Powered Education • Live Demo'}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '2.5rem' : 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: '900',
              marginBottom: isMobile ? '1.25rem' : '2rem',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(124, 58, 237, 0.3)',
              padding: isMobile ? '0 0.5rem' : '0'
            }}>
              Adaptive Learning{isMobile ? '' : ' AI'}
            </h1>

            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '1.4rem' : 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: '600',
              marginBottom: isMobile ? '1rem' : '1.5rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
              padding: isMobile ? '0 0.5rem' : '0'
            }}>
              {isMobile ? '73% More Engagement' : 'Boost Student Engagement by 73%'}
            </h2>

            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: isMobile ? '1rem' : 'clamp(1.15rem, 2.2vw, 1.4rem)',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: isMobile ? '2rem' : '3rem',
              lineHeight: '1.6',
              maxWidth: isMobile ? '100%' : '700px',
              margin: isMobile ? '0 0 2rem 0' : '0 auto 3rem auto',
              padding: isMobile ? '0 0.5rem' : '0'
            }}>
              {isMobile
                ? 'AI that detects confusion in real-time, adapting with personalized help.'
                : 'Emotive AI that detects student confusion and frustration in real-time, adapting lessons with personalized encouragement and progressive hints.'}
            </p>

            <div style={{
              display: 'flex',
              gap: isMobile ? '1rem' : '1.5rem',
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: isMobile ? '2rem' : '4rem',
              padding: isMobile ? '0 0.5rem' : '0',
              width: isMobile ? '100%' : 'auto'
            }}>
              <button
                onClick={() => {
                  // Scroll to demo section
                  const demoSection = document.querySelector('#demo')
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                  // Open AI chat after scrolling
                  setTimeout(() => {
                    if ((window as any).__openEducationAIChat) {
                      (window as any).__openEducationAIChat()
                    }
                  }, 800)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: isMobile ? '1rem 2rem' : '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  borderRadius: isMobile ? '10px' : '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(124, 58, 237, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)'
                  }
                }}
              >
                <span>🎓</span> Try AI Tutor
              </button>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: isMobile ? '1rem 2rem' : '1.25rem 2.5rem',
                  background: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: isMobile ? '10px' : '12px',
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.15rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <span>📅</span> Schedule Demo
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: isMobile ? '1.5rem' : '2rem',
              maxWidth: '800px',
              margin: '0 auto',
              paddingTop: isMobile ? '2rem' : '3rem',
              borderTop: '1px solid rgba(124, 58, 237, 0.2)',
              padding: isMobile ? '2rem 1rem 0 1rem' : '3rem 0 0 0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? '2.5rem' : 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#7C3AED',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem',
                  textShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}>
                  73%
                </div>
                <div style={{
                  fontSize: isMobile ? '0.65rem' : '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: isMobile ? '0.5px' : '1px',
                  fontWeight: '600',
                }}>
                  More Engagement
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: isMobile ? '2.5rem' : 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#7C3AED',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem',
                  textShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}>
                  92%
                </div>
                <div style={{
                  fontSize: isMobile ? '0.65rem' : '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: isMobile ? '0.5px' : '1px',
                  fontWeight: '600',
                }}>
                  Retention Rate
                </div>
              </div>
              <div style={{ textAlign: 'center', gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                <div style={{
                  fontSize: isMobile ? '2.5rem' : 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#7C3AED',
                  marginBottom: isMobile ? '0.25rem' : '0.5rem',
                  textShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}>
                  2.5x
                </div>
                <div style={{
                  fontSize: isMobile ? '0.65rem' : '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: isMobile ? '0.5px' : '1px',
                  fontWeight: '600',
                }}>
                  Faster Learning
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Learning Experience - THE PRIMARY DEMO */}
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
          contentVisibility: 'auto',
          containIntrinsicSize: '0 100vh',
        }}>
          {/* Ambient background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Secondary glow */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(80px)'
          }} />

          <div style={{
            maxWidth: '1600px',
            width: '100%',
            position: 'relative'
          }}>
            {/* Demo Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '4rem',
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(20, 184, 166, 0.05) 100%)',
              borderRadius: '32px',
              border: '2px solid rgba(124, 58, 237, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(124, 58, 237, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.8), transparent)'
              }} />

              <div style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: 'rgba(124, 58, 237, 0.15)',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                border: '2px solid rgba(124, 58, 237, 0.3)',
                marginBottom: '1.5rem',
                color: '#A78BFA',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                Live Interactive Demo
              </div>
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: '900',
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(124, 58, 237, 0.3)',
              }}>
                Adaptive Learning Terminal
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
                Experience AI that detects confusion and adapts in real-time. Watch how emotional intelligence transforms learning from frustrating to empowering.
              </p>
            </div>

            {/* Full-width Learning Interface */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              borderRadius: isMobile ? '20px' : '40px',
              border: isMobile ? '2px solid rgba(124, 58, 237, 0.2)' : '3px solid rgba(124, 58, 237, 0.2)',
              boxShadow: `
                0 40px 120px rgba(0, 0, 0, 0.7),
                0 0 0 1px rgba(124, 58, 237, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Top accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.8), transparent)',
                zIndex: 100
              }} />

              {/* Terminal header bar */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%)',
                padding: isMobile ? '1rem' : '2rem 2.5rem',
                borderBottom: '2px solid rgba(124, 58, 237, 0.2)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '1rem' : '0',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.75rem' : '1.25rem',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <div style={{
                    fontSize: isMobile ? '2rem' : '2.5rem',
                    filter: 'drop-shadow(0 4px 16px rgba(124, 58, 237, 0.5))',
                    flexShrink: 0
                  }}>
                    🎓
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '800',
                      fontSize: isMobile ? '1.1rem' : '1.4rem',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '0.25rem',
                      letterSpacing: '-0.01em',
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      lineHeight: 1.2
                    }}>
                      LearnSmart {isMobile ? '' : 'Interactive '}Lab
                    </div>
                    <div style={{
                      fontSize: isMobile ? '0.75rem' : '0.9rem',
                      opacity: 0.6,
                      fontWeight: '500'
                    }}>
                      Session 12 • AI-Adaptive
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: isMobile ? '0.5rem' : '1.25rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: isMobile ? '10px' : '12px',
                      height: isMobile ? '10px' : '12px',
                      borderRadius: '50%',
                      background: '#14B8A6',
                      boxShadow: '0 0 16px rgba(20, 184, 166, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.3)',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', opacity: 0.8, fontWeight: '600', whiteSpace: 'nowrap' }}>Learning Active</span>
                  </div>
                  <div style={{
                    padding: isMobile ? '0.5rem 0.875rem' : '0.6rem 1.25rem',
                    background: 'rgba(124, 58, 237, 0.15)',
                    borderRadius: isMobile ? '8px' : '10px',
                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                    fontWeight: '700',
                    color: '#A78BFA',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    boxShadow: '0 2px 12px rgba(124, 58, 237, 0.2)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}>
                    AI Active
                  </div>

                  {/* Help button will be rendered here via portal */}
                  <div id="help-button-container" />
                </div>
              </div>

              {/* Main learning interface */}
              <LearningSimulation />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '4rem auto 6rem auto',
          background: 'rgba(10, 10, 10, 0.95)',
          borderRadius: '32px',
          contentVisibility: 'auto',
          containIntrinsicSize: '0 800px',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Top gradient line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.6), transparent)'
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
              Why Educators Choose Emotive AI
            </h2>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Transform confusion into confidence with adaptive, empathetic tutoring
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}>
            {[
              {
                icon: '🧠',
                title: 'Real-Time Confusion Detection',
                description: 'AI analyzes response patterns and time spent to detect when students are struggling—before they give up.',
                color: '#7C3AED'
              },
              {
                icon: '💡',
                title: 'Progressive Hints System',
                description: 'Powered by Claude Haiku 4.5, delivers calibrated hints that guide without revealing, building problem-solving skills.',
                color: '#A78BFA'
              },
              {
                icon: '😊',
                title: 'Emotional Encouragement',
                description: 'Mascot visually celebrates wins and provides genuine support during challenges, creating connection and motivation.',
                color: '#14B8A6'
              },
              {
                icon: '🎯',
                title: 'Adaptive Difficulty',
                description: 'Automatically adjusts lesson difficulty based on performance and emotional state for optimal learning flow.',
                color: '#06B6D4'
              },
              {
                icon: '⚡',
                title: 'Instant Intervention',
                description: 'Detects frustration patterns and intervenes with encouragement before students disengage.',
                color: '#10B981'
              },
              {
                icon: '📊',
                title: 'Learning Analytics',
                description: 'Track engagement, confusion patterns, and emotional states to optimize curriculum and teaching methods.',
                color: '#C4B5FD'
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: 'clamp(2rem, 3vw, 2.5rem)',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(167, 139, 250, 0.08) 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)'
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

        {/* Target Market */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '4rem auto 6rem auto',
          position: 'relative',
          zIndex: 2,
          contentVisibility: 'auto',
          containIntrinsicSize: '0 600px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(167, 139, 250, 0.12) 100%)',
            borderRadius: '32px',
            padding: 'clamp(3rem, 5vw, 4rem)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
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
              background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.6), transparent)'
            }} />

            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              marginBottom: '1rem',
              color: '#7C3AED',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Perfect For EdTech Platforms
            </h2>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
              opacity: 0.85,
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto'
            }}>
              Khan Academy • Duolingo • Coursera • Udemy • Chegg • Age of Learning
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2rem)',
              marginTop: '2rem'
            }}>
              {[
                { icon: '📈', label: 'Increase Completion Rates', value: 'Students finish 2.5x more courses' },
                { icon: '⭐', label: 'Boost Satisfaction', value: 'Transform struggling into thriving' },
                { icon: '⚡', label: 'Faster Mastery', value: 'Adaptive pacing for each student' },
                { icon: '💰', label: 'ROI in 6 Months', value: 'Higher retention = recurring revenue' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '2rem',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '16px',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)'
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

        {/* Back navigation */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <Link
            href="/"
            prefetch={false}
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(124, 58, 237, 0.2)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              router.prefetch('/')
              e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onTouchStart={() => router.prefetch('/')}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>

        {/* Footer Spacing */}
        <div style={{ height: '4rem' }} />
      </main>

      <EmotiveFooter />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        calLink="emotive-engine/30min"
      />
    </>
  )
}
