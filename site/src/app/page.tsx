'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import ScheduleModal from '@/components/ScheduleModal'
import MascotRenderer from '@/components/MascotRenderer'
import LazyFeaturesShowcase from '@/components/LazyFeaturesShowcase'
import type { MascotMode } from '@/components/hooks/useMascotMode'

/**
 * Optimized HomePage with code splitting and progressive loading
 *
 * Loading strategy:
 * 1. Critical path: HTML, CSS, hero text (instant)
 * 2. Mascot engine: Lazy loaded when canvas is in viewport (< 500ms)
 * 3. Features: Lazy loaded when scrolled into view
 * 4. Below-fold: Loaded on scroll
 *
 * Expected improvements:
 * - Initial bundle: -400KB (mascot engine deferred)
 * - Script evaluation: 652ms → ~200ms (70% reduction)
 * - LCP: Maintain < 0.2s
 * - CLS: 0.29 → < 0.1 (fixed hydration issues)
 */
export default function HomePage() {
  const router = useRouter()
  const lastGestureRef = useRef<number>(-1)
  const lastZIndexRef = useRef<number>(100)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const mascotContainerRef = useRef<HTMLDivElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [mascotMode, setMascotMode] = useState<MascotMode>('3d')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  // Scroll handler for mascot position and z-index
  useEffect(() => {
    if (!mascot) return

    const updateMascotOnScroll = () => {
      try {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const isMobile = viewportWidth < 768

      // Position calculation - apply for both 2D and 3D modes
      // Desktop: Center mascot between left screen edge and hero text
      // Mobile: Base position at 35% from top (set via CSS), scroll moves it down
      if (typeof mascot.setPosition === 'function') {
        // Calculate the center point between left edge and hero text (desktop only)
        const heroTextStart = Math.max(0, (viewportWidth - 1000) / 2)
        const gapCenter = heroTextStart / 2

        // Mobile: Base position is 25% from top. Canvas center is 50%.
        // Offset from center = 25% - 50% = -25% = -0.25 * vh
        const mobileBaseYOffset = -viewportHeight * 0.25

        if (mascotMode === '2d') {
          // 2D mode: Full viewport canvas with x/y offsets from center
          const baseXOffset = isMobile ? 0 : gapCenter - viewportWidth / 2
          const yOffset = isMobile
            ? mobileBaseYOffset + scrollY * 0.5  // Start at 35%, move down with scroll
            : (scrollY - viewportHeight * 0.1) * 0.5
          const wavelength = 600
          const amplitude = isMobile
            ? Math.min(80, viewportWidth * 0.15)
            : Math.min(100, viewportWidth * 0.08)
          const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))
          mascot.setPosition(xOffset, yOffset, 0)
        } else {
          // 3D mode: Container position set by CSS, just add scroll offset
          const yOffset = isMobile
            ? scrollY * 0.4  // Move down with scroll (base position set by CSS at 35%)
            : (scrollY - viewportHeight * 0.1) * 0.4
          const wavelength = 600
          const amplitude = isMobile
            ? Math.min(60, viewportWidth * 0.1)
            : Math.min(80, viewportWidth * 0.06)
          const xOffset = amplitude * Math.sin(scrollY / wavelength)
          mascot.setPosition(xOffset, yOffset, 0)
        }
      }

      // Z-index transition - only update if actually changed to prevent unnecessary re-renders
      // On mobile, hide mascot much earlier to prevent interference
      const heroHeight = isMobile ? viewportHeight * 0.5 : viewportHeight * 0.9
      const newZIndex = scrollY < heroHeight ? 100 : 1

      // Update z-index directly on DOM to avoid React re-renders
      if (newZIndex !== lastZIndexRef.current && mascotContainerRef.current) {
        lastZIndexRef.current = newZIndex
        mascotContainerRef.current.style.zIndex = String(newZIndex)
        mascotContainerRef.current.style.opacity = newZIndex === 1 ? '0' : '1'
        mascotContainerRef.current.style.visibility = newZIndex === 1 ? 'hidden' : 'visible'
      }

      // Gesture triggers
      const gesturePoints = [
        { threshold: 0, gesture: null, emotion: 'neutral' },
        { threshold: heroHeight * 0.9, gesture: 'wave', emotion: 'joy' },
        { threshold: heroHeight + 800, gesture: 'bounce', emotion: 'excited' },
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

        if (typeof mascot.setEmotion === 'function') {
          mascot.setEmotion(point.emotion, 0)
        }

        if (point.gesture && typeof mascot.express === 'function') {
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

  // Handle mascot loaded callback
  const handleMascotLoaded = (loadedMascot: any, mode: MascotMode) => {
    setMascot(loadedMascot)
    setMascotMode(mode)
  }


  return (
    <>
      <EmotiveHeader />

      {/* Unified mascot renderer - 3D by default, with 2D toggle */}
      <MascotRenderer
        onMascotLoaded={handleMascotLoaded}
        onModeChange={setMascotMode}
        coreGeometry="crystal"
        autoRotate={true}
        enableControls={false}
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

        {/* Hero Section - Critical Path */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vh, 4rem) clamp(1rem, 3vw, 2rem)',
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Premium gradient background layers */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top, rgba(102,126,234,0.2) 0%, transparent 50%)',
            zIndex: 0,
          }} />

          <div style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: '100%',
            maxWidth: '1000px',
            height: 'min(500px, 50vh)',
            background: 'radial-gradient(ellipse, rgba(102, 126, 234, 0.12) 0%, rgba(165, 180, 252, 0.08) 40%, transparent 70%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: 'clamp(8rem, 20vh, 12rem)',
            position: 'relative',
            zIndex: 10,
          }}>
            {/* Hero Text */}
            <div>
              <div style={{
                display: 'inline-block',
                padding: '0.6rem 1.5rem',
                background: 'rgba(102, 126, 234, 0.15)',                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '30px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                marginBottom: '2rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#a5b4fc',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                position: 'relative',
                zIndex: 10,
              }}>
                Open Source • Canvas 2D & WebGL 3D • Emotional States • Rich Gestures
              </div>

              <h1 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                fontWeight: '900',
                marginBottom: '2rem',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 30%, #a5b4fc 60%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative',
                zIndex: 10,
              }}>
                Real-Time Character Animation
              </h1>

              <p style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '3rem',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto 3rem',
              }}>
                Create expressive AI avatars with real-time WebGL 3D rendering. Crystal geometries, particle effects, 60fps performance, and emotional state system for immersive interactions.
              </p>

              {/* Branding Callout */}
              <div style={{
                display: 'inline-block',
                padding: '1rem 1.75rem',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.18) 0%, rgba(102,126,234,0.08) 100%)',
                border: '1px solid rgba(102,126,234,0.35)',
                borderRadius: '16px',
                marginBottom: '3rem',
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.5',
                maxWidth: '650px',
                boxShadow: '0 4px 20px rgba(102,126,234,0.15)',
              }}>
                <strong style={{ color: '#a5b4fc' }}>✨ MIT Licensed:</strong> Open source 3D animation engine with crystal geometries, subsurface scattering, and customizable behaviors. Built for React, Vue, vanilla JS, and TypeScript.
              </div>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '2rem'
              }}>
                <Link href="/demo" style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                }}>
                  See Live Demo
                </Link>

                <button onClick={() => setIsScheduleModalOpen(true)} style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: 'white',
                  border: '2px solid rgba(102, 126, 234, 0.5)',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  Schedule Demo
                </button>
              </div>

              {/* Quick Links - Compact horizontal layout */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                fontSize: '0.95rem',
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Open Source:</span>
                <a
                  href="https://github.com/joshtol/emotive-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#a5b4fc',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>⭐</span>
                  <span>GitHub</span>
                </a>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                <a
                  href="https://www.npmjs.com/package/@joshtol/emotive-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#f87171',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(203, 56, 55, 0.1)',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>📦</span>
                  <span>npm install</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases - Bento Grid */}
        <section id="use-cases" style={{
          padding: 'clamp(2rem, 5vw, 6rem) clamp(1rem, 3vw, 2rem)',
          maxWidth: '1400px',
          width: '100%',
          margin: '1rem auto',
          background: 'rgba(10, 10, 10, 0.85)',          borderRadius: 'clamp(16px, 3vw, 32px)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 5vw, 4rem)',
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
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              From cultural preservation to healthcare, see how emotional AI transforms experiences
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="bento-grid">
            {/* Cherokee Language - FLAGSHIP (Mobile First) */}
            <Link
              href="/use-cases/cherokee"
              prefetch={false}
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.1) 100%)',
                borderRadius: 'clamp(20px, 4vw, 24px)',
                border: '2px solid rgba(245,158,11,0.3)',
                padding: 'clamp(2rem, 5vw, 2.5rem)',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                router.prefetch('/use-cases/cherokee')
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 24px 80px rgba(245,158,11,0.4)'
              }}
              onTouchStart={() => router.prefetch('/use-cases/cherokee')}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(245,158,11,0.2)'
              }}
            >
              {/* Flagship Badge */}
              <div style={{
                position: 'absolute',
                top: 'clamp(0.75rem, 2vw, 1rem)',
                right: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                background: 'linear-gradient(135deg, rgba(245,158,11,1) 0%, rgba(217,119,6,1) 100%)',
                borderRadius: '8px',
                fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
              }}>
                ★ Flagship
              </div>

              <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', lineHeight: 1 }}>ᏣᎳᎩ</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: '800',
                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                  color: '#F59E0B',
                  letterSpacing: '-0.02em',
                }}>
                  Cherokee Language Revival
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                  lineHeight: '1.7',
                  opacity: 0.9,
                }}>
                  Preserving indigenous culture through interactive syllabary learning. Shape-morphing animations celebrate each milestone with emotional feedback that honors Cherokee heritage.
                </p>
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                opacity: 0.7,
                fontWeight: '600',
              }}>
                🎯 Cultural Preservation
              </div>
            </Link>

            {/* Retail Experience */}
            <Link
              href="/use-cases/retail"
              prefetch={false}
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
                borderRadius: 'clamp(16px, 3vw, 20px)',
                border: '1px solid rgba(139,92,246,0.2)',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                router.prefetch('/use-cases/retail')
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(139,92,246,0.3)'
              }}
              onTouchStart={() => router.prefetch('/use-cases/retail')}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>🛍️</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#8B5CF6',
                }}>
                  Smart Retail
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.6',
                  opacity: 0.85,
                }}>
                  Personalized shopping experiences. Analyzes customer emotions to optimize product recommendations and reduce cart abandonment.
                </p>
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                opacity: 0.6,
                fontWeight: '600',
              }}>
                Real-time emotion detection
              </div>
            </Link>

            {/* Smart Home */}
            <Link
              href="/use-cases/smart-home"
              prefetch={false}
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
                borderRadius: 'clamp(16px, 3vw, 20px)',
                border: '1px solid rgba(139,92,246,0.2)',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                router.prefetch('/use-cases/smart-home')
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(139,92,246,0.3)'
              }}
              onTouchStart={() => router.prefetch('/use-cases/smart-home')}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>🏠</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#8B5CF6',
                }}>
                  Smart Home AI
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.6',
                  opacity: 0.85,
                }}>
                  Context-aware home automation that learns your preferences. Emotional responses to lighting, climate, and security events.
                </p>
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                opacity: 0.6,
                fontWeight: '600',
              }}>
                Context-aware automation
              </div>
            </Link>

            {/* Adaptive Learning */}
            <Link
              href="/use-cases/education"
              prefetch={false}
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
                borderRadius: 'clamp(16px, 3vw, 20px)',
                border: '1px solid rgba(59,130,246,0.2)',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                router.prefetch('/use-cases/education')
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(59,130,246,0.3)'
              }}
              onTouchStart={() => router.prefetch('/use-cases/education')}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>🎓</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#3B82F6',
                }}>
                  Adaptive Learning
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.6',
                  opacity: 0.85,
                }}>
                  Emotion-aware tutoring that detects frustration and adjusts difficulty. Provides encouragement when students struggle.
                </p>
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                opacity: 0.6,
                fontWeight: '600',
              }}>
                Frustration detection
              </div>
            </Link>

          </div>
        </section>

        {/* Lazy-loaded Features Showcase */}
        <LazyFeaturesShowcase />

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
