/**
 * Smart Home Control Use Case
 *
 * This demo showcases the Emotive Engine in a smart home IoT context.
 * The mascot serves as a friendly home assistant that morphs shapes
 * and expresses emotions based on device states and automation scenes.
 *
 * Features:
 * - Interactive device controls (lights, locks, thermostat, etc.)
 * - Scene presets that trigger coordinated mascot responses
 * - Shape morphing based on device context (sun for morning, moon for night)
 * - SSS (subsurface scattering) material presets for visual variety
 * - Scroll-driven sinusoidal mascot movement
 *
 * KEY PATTERNS FOR DEVELOPERS:
 * 1. SmartHomeSimulation manages device state and mascot coordination
 * 2. Scene presets define sequences of mascot actions (morphTo, setEmotion, express)
 * 3. mascot.attachToElement() embeds mascot in the control panel
 * 4. IntersectionObserver handles scroll-based detachment
 *
 * @see https://emotive.software/docs for full API documentation
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import ScheduleModal from '@/components/ScheduleModal'
import SmartHomeSimulation from './SmartHomeSimulation'
import UseCaseNav from '@/components/UseCaseNav'
import MascotRenderer from '@/components/MascotRenderer'
import { MascotMode } from '@/components/hooks/useMascotMode'

export default function SmartHomePage() {
  const router = useRouter()
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [mascot, setMascot] = useState<any>(null)
  const [mascotMode, setMascotMode] = useState<MascotMode>('3d')
  const [isMobile, setIsMobile] = useState(false)
  const lastGestureRef = useRef<number>(-1)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)

  // Detect mobile
  useEffect(() => {
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

  // Handle mascot loaded callback
  const handleMascotLoaded = useCallback((mascotInstance: any, mode: MascotMode) => {
    setMascot(mascotInstance)
    setMascotMode(mode)

    // Initial wave gesture
    setTimeout(() => {
      if (mascotInstance && typeof mascotInstance.express === 'function') {
        mascotInstance.express('wave')
      }
    }, 800)
  }, [])

  // Scroll-driven animation with sinusoidal movement
  // Uses mascot.setPosition() API like the retail page for proper positioning
  useEffect(() => {
    if (!mascot) return

    const updateMascotOnScroll = () => {
      try {
        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobileDevice = viewportWidth < 768
        const heroHeight = viewportHeight * 0.9

        // Position calculation using mascot.setPosition() API (like retail page)
        // Skip if mascot is attached to an element (SmartHomeSimulation handles its own positioning)
        const isAttached = typeof mascot.isAttachedToElement === 'function' && mascot.isAttachedToElement()

        if (typeof mascot.setPosition === 'function' && !isAttached) {
          // Desktop: Center mascot between left screen edge and hero text
          const heroTextStart = Math.max(0, (viewportWidth - 1000) / 2)
          const gapCenter = heroTextStart / 2

          // Mobile: Base position is 18% from top. Canvas center is 50%.
          // Offset from center = 18% - 50% = -32% = -0.32 * vh
          const mobileBaseYOffset = -viewportHeight * 0.32

          if (mascotMode === '2d') {
            // 2D mode: Full viewport canvas with x/y offsets from center
            const baseXOffset = isMobileDevice ? 0 : gapCenter - viewportWidth / 2
            const yOffset = isMobileDevice
              ? mobileBaseYOffset + scrollY * 0.5  // Start at 18%, move DOWN with scroll
              : (scrollY - viewportHeight * 0.1) * 0.5
            const wavelength = 600
            const amplitude = isMobileDevice
              ? Math.min(80, viewportWidth * 0.15)
              : Math.min(100, viewportWidth * 0.08)
            const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))
            mascot.setPosition(xOffset, yOffset, 0)
          } else {
            // 3D mode: Container position set by CSS, just add scroll offset
            const yOffset = isMobileDevice
              ? scrollY * 0.4  // Move DOWN with scroll (base position set by CSS at 18%)
              : (scrollY - viewportHeight * 0.1) * 0.4
            const wavelength = 600
            const amplitude = isMobileDevice
              ? Math.min(60, viewportWidth * 0.1)
              : Math.min(80, viewportWidth * 0.06)
            const xOffset = amplitude * Math.sin(scrollY / wavelength)
            mascot.setPosition(xOffset, yOffset, 0)
          }
        }

        // Gesture points based on scroll position
        const gesturePoints = [
          { threshold: 0, gesture: null, emotion: 'neutral' },
          { threshold: heroHeight * 0.9, gesture: 'wave', emotion: 'joy' },
          { threshold: heroHeight + 800, gesture: 'bounce', emotion: 'excited' },
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
      } catch (error) {
        console.error('Scroll update error:', error)
      } finally {
        tickingRef.current = false
      }
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
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
  }, [mascot, mascotMode])

  return (
    <>
      <EmotiveHeader />

      {/* 2D/3D Mascot Renderer with mode toggle */}
      <MascotRenderer
        onMascotLoaded={handleMascotLoaded}
        onModeChange={setMascotMode}
        coreGeometry="crystal"
        enableControls={false}
        autoRotate={true}
        showModeToggle={true}
      />

      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
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
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          {/* Ambient light effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '800px',
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
          padding: isMobile ? '1rem' : '2rem',
          maxWidth: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          minHeight: isMobile ? 'auto' : '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
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
              marginBottom: isMobile ? '2rem' : '4rem',
              padding: isMobile ? '1.5rem' : '3rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
              borderRadius: isMobile ? '16px' : '32px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(139, 92, 246, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box'
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
                fontSize: 'clamp(1.5rem, 5vw, 5rem)',
                fontWeight: '900',
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
                lineHeight: 1.1,
              }}>
                Your Smart Home Hub
              </h2>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(0.95rem, 2.2vw, 1.4rem)',
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: '900px',
                margin: '0 auto',
                lineHeight: 1.7,
                fontWeight: '500'
              }}>
                See how visual feedback brings your interface to life. The mascot morphs shapes, changes emotions, and responds with animations to every interaction.
              </p>
            </div>

            {/* Simulation */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 18, 35, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              borderRadius: isMobile ? '16px' : '40px',
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

              <SmartHomeSimulation mascot={mascot} />
            </div>
          </div>
        </section>

        {/* Features Section - Bento Grid */}
        <section id="features" style={{
          padding: isMobile ? '3rem 1rem' : '6rem 2rem',
          maxWidth: '1400px',
          margin: isMobile ? '2rem auto 3rem auto' : '4rem auto 6rem auto',
          background: 'rgba(10, 10, 10, 0.95)',
          borderRadius: isMobile ? '16px' : '32px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          transform: 'translateZ(0)',
          willChange: 'transform',
          width: '100%',
          maxWidth: isMobile ? 'calc(100% - 2rem)' : '1400px',
          boxSizing: 'border-box',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
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
          padding: isMobile ? '3rem 1rem' : '6rem 2rem',
          maxWidth: '1400px',
          margin: isMobile ? '2rem auto 3rem auto' : '4rem auto 6rem auto',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: isMobile ? 'calc(100% - 2rem)' : '1400px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
            borderRadius: isMobile ? '16px' : '32px',
            padding: isMobile ? '2rem 1.5rem' : 'clamp(3rem, 5vw, 4rem)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
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
          padding: isMobile ? '4rem 1rem' : '8rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: isMobile ? 'calc(100% - 2rem)' : '1200px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            borderRadius: isMobile ? '16px' : '32px',
            padding: isMobile ? '2rem 1.5rem' : 'clamp(3rem, 5vw, 5rem)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '600px',
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
