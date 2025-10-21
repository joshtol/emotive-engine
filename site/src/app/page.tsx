'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import LazyMascot from '@/components/LazyMascot'
import LazyFeaturesShowcase from '@/components/LazyFeaturesShowcase'

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
  const lastGestureRef = useRef<number>(-1)
  const [containerZIndex, setContainerZIndex] = useState(100)
  const [mascot, setMascot] = useState<any>(null)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [waitlistMessage, setWaitlistMessage] = useState('')

  // Scroll handler for mascot position and z-index
  useEffect(() => {
    if (!mascot) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const isMobile = viewportWidth < 768

      // Position calculation
      const baseXOffset = isMobile ? 0 : -viewportWidth * 0.38
      const yOffset = isMobile
        ? (scrollY - viewportHeight * 0.6) * 0.5  // Much higher up on mobile
        : (scrollY - viewportHeight * 0.1) * 0.5   // Normal on desktop
      const wavelength = 600
      const amplitude = isMobile
        ? Math.min(80, viewportWidth * 0.15)
        : Math.min(100, viewportWidth * 0.08)
      const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

      if (typeof mascot.setPosition === 'function') {
        mascot.setPosition(xOffset, yOffset, 0)
      }

      // Z-index transition
      const heroHeight = viewportHeight * 0.9
      if (scrollY < heroHeight) {
        setContainerZIndex(100)
      } else {
        setContainerZIndex(1)
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
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [mascot])

  // Handle waitlist signup
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistStatus('loading')

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(waitlistEmail)) {
        setWaitlistStatus('error')
        setWaitlistMessage('Please enter a valid email address')
        setTimeout(() => {
          setWaitlistStatus('idle')
          setWaitlistMessage('')
        }, 3000)
        return
      }

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      })

      if (response.ok) {
        setWaitlistStatus('success')
        setWaitlistMessage('Successfully joined! Check your email.')
        setWaitlistEmail('')
      } else {
        setWaitlistStatus('error')
        setWaitlistMessage('Failed to join waitlist. Please try again.')
      }
    } catch (error) {
      console.error('Waitlist error:', error)
      setWaitlistStatus('error')
      setWaitlistMessage('Failed to join waitlist. Please try again.')
    }

    setTimeout(() => {
      setWaitlistStatus('idle')
      setWaitlistMessage('')
    }, 5000)
  }

  return (
    <>
      <EmotiveHeader />

      {/* Lazy-loaded mascot with Intersection Observer */}
      <LazyMascot
        containerZIndex={containerZIndex}
        onMascotLoaded={setMascot}
      />

      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '100vw',
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
          maxWidth: '100vw',
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
            width: 'min(1000px, 90vw)',
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
                background: 'rgba(102, 126, 234, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
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
                Emotional AI • 15 Emotions • 50+ Gestures
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
                Emotional AI That Feels
              </h1>

              <p style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '3rem',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto 3rem',
              }}>
                Create emotionally responsive user experiences with real-time particle-based animations that react to sentiment, interaction, and context.
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '3rem'
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
              </div>

              {/* Waitlist Form */}
              <form onSubmit={handleWaitlistSubmit} style={{
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    disabled={waitlistStatus === 'loading'}
                    style={{
                      flex: '1',
                      minWidth: '250px',
                      padding: '0.875rem 1.5rem',
                      fontSize: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50px',
                      color: 'white',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={waitlistStatus === 'loading'}
                    style={{
                      padding: '0.875rem 2rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: waitlistStatus === 'success'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : waitlistStatus === 'error'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(102, 126, 234, 0.2)',
                      color: waitlistStatus === 'success'
                        ? '#10B981'
                        : waitlistStatus === 'error'
                        ? '#EF4444'
                        : '#a5b4fc',
                      border: `1px solid ${
                        waitlistStatus === 'success'
                          ? '#10B981'
                          : waitlistStatus === 'error'
                          ? '#EF4444'
                          : '#667eea'
                      }`,
                      borderRadius: '50px',
                      cursor: waitlistStatus === 'loading' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {waitlistStatus === 'loading'
                      ? 'Joining...'
                      : waitlistStatus === 'success'
                      ? '✓ Joined'
                      : waitlistStatus === 'error'
                      ? '✗ Error'
                      : 'Join Waitlist'}
                  </button>
                </div>
                {waitlistMessage && (
                  <p style={{
                    marginTop: '1rem',
                    fontSize: '0.9rem',
                    color: waitlistStatus === 'success' ? '#10B981' : '#EF4444',
                  }}>
                    {waitlistMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Use Cases - Bento Grid */}
        <section id="use-cases" style={{
          padding: 'clamp(2rem, 5vw, 6rem) clamp(1rem, 3vw, 2rem)',
          maxWidth: '1400px',
          width: '100%',
          margin: '1rem auto',
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'clamp(16px, 3vw, 32px)',
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
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 24px 80px rgba(245,158,11,0.4)'
              }}
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
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(139,92,246,0.3)'
              }}
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
                +25% conversion rate
              </div>
            </Link>

            {/* Adaptive Learning */}
            <Link
              href="/use-cases/education"
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
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(59,130,246,0.3)'
              }}
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
                +50% task completion
              </div>
            </Link>

            {/* Healthcare - Mental Health */}
            <Link
              href="/use-cases/healthcare"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                borderRadius: 'clamp(16px, 3vw, 20px)',
                border: '1px solid rgba(16,185,129,0.2)',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(16,185,129,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>🏥</div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: '#10B981',
                }}>
                  Mental Health Support
                </h3>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.6',
                  opacity: 0.85,
                }}>
                  Real-time emotion monitoring for therapy. Detects stress, anxiety markers, and celebrates progress.
                </p>
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                opacity: 0.6,
                fontWeight: '600',
              }}>
                +40% patient engagement
              </div>
            </Link>
          </div>
        </section>

        {/* Lazy-loaded Features Showcase */}
        <LazyFeaturesShowcase />

      </main>

      <EmotiveFooter />
    </>
  )
}
