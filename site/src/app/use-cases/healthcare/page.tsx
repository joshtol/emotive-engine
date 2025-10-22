'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import PatientIntakeSimulation from './PatientIntakeSimulation'

export default function HealthcarePage() {
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
          canvasId: 'healthcare-hero-mascot',
          targetFPS: isMobileDevice ? 30 : 60,
          enableAudio: false,
          soundEnabled: false,
          maxParticles: isMobileDevice ? 50 : 120,
          defaultEmotion: 'calm',
          enableGazeTracking: false,
          enableIdleBehaviors: true,
          transitionDuration: 600,
          emotionTransitionSpeed: 400,
          primaryColor: '#4A90E2',  // Medical blue
          secondaryColor: '#10B981', // Healing green
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
          color: '#4A90E2'
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
            mascotInstance.express('breathe')
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
            { threshold: 0, gesture: null, emotion: 'calm' },
            { threshold: heroHeight * 0.9, gesture: 'breathe', emotion: 'calm' },
            { threshold: heroHeight + 800, gesture: 'float', emotion: 'calm' },
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

      {/* Scroll-driven mascot - fades out when patient intake sections become visible */}
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
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        <canvas
          ref={canvasRef}
          id="healthcare-hero-mascot"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 40px rgba(74, 144, 226, 0.4))',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      </div>

      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}>
        {/* Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          background: 'radial-gradient(ellipse at top, rgba(74, 144, 226, 0.15) 0%, transparent 50%), linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
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
            background: 'radial-gradient(ellipse, rgba(74, 144, 226, 0.08) 0%, transparent 70%)',
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
              background: 'rgba(74, 144, 226, 0.15)',
              border: '1px solid rgba(74, 144, 226, 0.3)',
              borderRadius: '30px',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#4A90E2',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              boxShadow: '0 4px 24px rgba(74, 144, 226, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              AI-Powered Healthcare • Live Demo
            </div>

            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: '900',
              marginBottom: '2rem',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #4A90E2 0%, #60A5FA 50%, #93C5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(74, 144, 226, 0.3)',
            }}>
              Compassionate Care
            </h1>

            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em'
            }}>
              Reduce Patient Anxiety by 65%
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
              Emotive AI that detects patient stress in real-time and responds with genuine empathy, transforming medical forms from overwhelming to comforting.
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
                  }
                  setTimeout(() => {
                    if ((window as any).__openHealthcareAIChat) {
                      (window as any).__openHealthcareAIChat()
                    }
                  }, 800)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(74, 144, 226, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(74, 144, 226, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(74, 144, 226, 0.4)'
                }}
              >
                <span>🩺</span> Try Care Assistant
              </button>

              <a
                href="#features"
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
                See Features
              </a>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '2rem',
              maxWidth: '800px',
              margin: '0 auto',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(74, 144, 226, 0.2)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#4A90E2',
                  marginBottom: '0.5rem',
                  textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
                }}>
                  65%
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Less Anxiety
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#4A90E2',
                  marginBottom: '0.5rem',
                  textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
                }}>
                  92%
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Form Completion
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  color: '#4A90E2',
                  marginBottom: '0.5rem',
                  textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
                }}>
                  78%
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                }}>
                  Patient Satisfaction
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Patient Intake Experience - THE PRIMARY DEMO */}
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
            background: 'radial-gradient(ellipse at center, rgba(74, 144, 226, 0.06) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Secondary glow */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(80px)'
          }} />

          <div style={{
            maxWidth: '1600px',
            width: '100%',
            position: 'relative'
          }}>
            {/* Patient Portal Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '4rem',
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '32px',
              border: '2px solid rgba(74, 144, 226, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(74, 144, 226, 0.1)',
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
                background: 'linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent)'
              }} />

              <div style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: 'rgba(74, 144, 226, 0.15)',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                border: '2px solid rgba(74, 144, 226, 0.3)',
                marginBottom: '1.5rem',
                color: '#4A90E2',
                boxShadow: '0 4px 20px rgba(74, 144, 226, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                Live Interactive Demo
              </div>
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(3rem, 6vw, 5rem)',
                fontWeight: '900',
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #4A90E2 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(74, 144, 226, 0.3)',
              }}>
                Patient Intake Portal
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
                Experience the future of healthcare with AI that understands patient anxiety and responds with empathy. Watch how emotional intelligence transforms the patient experience.
              </p>
            </div>

            {/* Full-width Patient Portal Interface */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              borderRadius: '40px',
              border: '3px solid rgba(74, 144, 226, 0.2)',
              boxShadow: `
                0 40px 120px rgba(0, 0, 0, 0.7),
                0 0 0 1px rgba(74, 144, 226, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Top accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent)',
                zIndex: 100
              }} />

              {/* Portal header bar */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
                padding: '2rem 2.5rem',
                borderBottom: '2px solid rgba(74, 144, 226, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 4px 16px rgba(74, 144, 226, 0.5))'
                  }}>
                    🏥
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '1.4rem',
                      background: 'linear-gradient(135deg, #4A90E2 0%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '0.25rem',
                      letterSpacing: '-0.01em'
                    }}>
                      MediCare Patient Portal
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.6,
                      fontWeight: '500'
                    }}>
                      Secure Portal • AI-Powered Guidance
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.3)'
                    }} />
                    <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: '600' }}>Secure Connection</span>
                  </div>
                  <div style={{
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(74, 144, 226, 0.15)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#4A90E2',
                    border: '1px solid rgba(74, 144, 226, 0.3)',
                    boxShadow: '0 2px 12px rgba(74, 144, 226, 0.2)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    AI Active
                  </div>

                  {/* Help button will be rendered here via portal */}
                  <div id="healthcare-help-button-container" />
                </div>
              </div>

              {/* Main patient intake interface */}
              <PatientIntakeSimulation />
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
          border: '1px solid rgba(74, 144, 226, 0.15)',
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
            background: 'linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.6), transparent)'
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
              Why Healthcare Providers Choose Emotive AI
            </h2>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Transform patient anxiety into confidence with intelligent, compassionate guidance
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}>
            {[
              {
                icon: '💙',
                title: 'Real-Time Empathy Detection',
                description: 'AI analyzes patient language patterns and response times to detect anxiety and confusion instantly.',
                color: '#4A90E2'
              },
              {
                icon: '🩺',
                title: 'Conversational Guidance',
                description: 'Natural language understanding powered by Claude Haiku 4.5 for compassionate, human-like conversations.',
                color: '#60A5FA'
              },
              {
                icon: '😌',
                title: 'Anxiety Reduction',
                description: 'Mascot visually responds to patient emotions, creating genuine connection and reducing medical stress.',
                color: '#10B981'
              },
              {
                icon: '🎯',
                title: 'Intelligent Form Assistance',
                description: 'Step-by-step guidance with patience and encouragement through complex medical forms.',
                color: '#14B8A6'
              },
              {
                icon: '🔒',
                title: 'HIPAA Compliance Built-In',
                description: 'Proactive privacy reassurance and bank-level encryption for all patient data.',
                color: '#8B5CF6'
              },
              {
                icon: '📊',
                title: 'Patient Experience Analytics',
                description: 'Track anxiety patterns, completion rates, and satisfaction metrics in real-time.',
                color: '#93C5FD'
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: 'clamp(2rem, 3vw, 2.5rem)',
                  background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(74, 144, 226, 0.08) 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(74, 144, 226, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(74, 144, 226, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.2)'
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
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.18) 0%, rgba(74, 144, 226, 0.12) 100%)',
            borderRadius: '32px',
            padding: 'clamp(3rem, 5vw, 4rem)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
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
              background: 'linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.6), transparent)'
            }} />

            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              marginBottom: '1rem',
              color: '#4A90E2',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Perfect For Healthcare Platforms
            </h2>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
              opacity: 0.85,
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem auto'
            }}>
              Epic Systems • Cerner • Athenahealth • Teladoc • Patient Portals
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2rem)',
              marginTop: '2rem'
            }}>
              {[
                { icon: '📉', label: 'Reduce Form Abandonment', value: 'Increase intake completion by 45%' },
                { icon: '⭐', label: 'Improve Patient Satisfaction', value: 'Turn anxious patients into advocates' },
                { icon: '⚡', label: 'Faster Onboarding', value: 'Process new patients 35% faster' },
                { icon: '💰', label: 'ROI in 2 Months', value: '$1.8M+ annual efficiency gains' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '2rem',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: '16px',
                    border: '1px solid rgba(74, 144, 226, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = 'rgba(74, 144, 226, 0.15)'
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
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(74, 144, 226, 0.2)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(74, 144, 226, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 144, 226, 0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(74, 144, 226, 0.2)'
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
    </>
  )
}
