'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import MascotRenderer from '@/components/MascotRenderer'
import LazyFeaturesShowcase from '@/components/LazyFeaturesShowcase'
import type { MascotMode } from '@/components/hooks/useMascotMode'

// Elements to cycle through in the hero, with a showcase gesture each
const HERO_ELEMENTS = [
  { name: 'electric',    gesture: 'electricAuraEffect', label: 'Electric',    color: '#a78bfa' },
  { name: 'fire',        gesture: 'firecrown',       label: 'Fire',        color: '#f97316' },
  { name: 'ice',         gesture: 'icecrown',        label: 'Ice',         color: '#67e8f9' },
  { name: 'water',       gesture: 'watervortex',     label: 'Water',       color: '#38bdf8' },
  { name: 'void',        gesture: 'voidvortex',      label: 'Void',        color: '#818cf8' },
  { name: 'light',       gesture: 'lightcrown',      label: 'Light',       color: '#fde68a' },
  { name: 'earth',       gesture: 'earthimpact',     label: 'Earth',       color: '#86efac' },
  { name: 'nature',      gesture: 'naturevortex',    label: 'Nature',      color: '#4ade80' },
]

const ELEMENT_INTERVAL_MS = 6000

// Ambient gestures shown when scrolled past hero — subtle, non-overwhelming
const AMBIENT_GESTURES = ['float', 'breathe', 'sway', 'bob', 'glow', 'peek', 'tilt', 'shimmer', 'drift', 'nod']
const AMBIENT_INTERVAL_MS = 9000

const ELEMENTS_GRID = [
  { name: 'fire',     label: 'Fire',        gif: '/screenshots/social/fire.gif',     color: '#f97316' },
  { name: 'ice',      label: 'Ice',         gif: '/screenshots/social/ice.gif',      color: '#67e8f9' },
  { name: 'electric', label: 'Electric',    gif: '/screenshots/social/electric.gif', color: '#a78bfa' },
  { name: 'water',    label: 'Water',       gif: '/screenshots/social/water.gif',    color: '#38bdf8' },
  { name: 'void',     label: 'Void',        gif: '/screenshots/social/void.gif',     color: '#818cf8' },
  { name: 'light',    label: 'Light',       gif: '/screenshots/social/light.gif',    color: '#fde68a' },
  { name: 'earth',    label: 'Earth',       gif: '/screenshots/social/earth.gif',    color: '#86efac' },
  { name: 'nature',   label: 'Nature',      gif: '/screenshots/social/nature.gif',   color: '#4ade80' },
]

export default function HomePage() {
  const lastZIndexRef = useRef<number>(100001)
  const mascotContainerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const isHeroZoneRef = useRef(true)

  const [mascot, setMascot] = useState<any>(null)
  const [mascotMode, setMascotMode] = useState<MascotMode>('3d')
  const [elementIndex, setElementIndex] = useState(0)
  const elementIndexRef = useRef(0)
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ambientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ambientIndexRef = useRef(0)

  // Auto-cycle hero elements
  const triggerNextElement = useCallback((mascotInstance: any) => {
    if (!mascotInstance || !isHeroZoneRef.current) return
    const next = (elementIndexRef.current + 1) % HERO_ELEMENTS.length
    elementIndexRef.current = next
    setElementIndex(next)
    const { gesture } = HERO_ELEMENTS[next]
    try { mascotInstance.express(gesture) } catch (_) {}
    cycleTimerRef.current = setTimeout(() => triggerNextElement(mascotInstance), ELEMENT_INTERVAL_MS)
  }, [])

  // Ambient cycle when scrolled past hero — subtle, non-elemental
  const triggerAmbientGesture = useCallback((mascotInstance: any) => {
    if (!mascotInstance || isHeroZoneRef.current) return
    const gesture = AMBIENT_GESTURES[ambientIndexRef.current % AMBIENT_GESTURES.length]
    ambientIndexRef.current++
    try { mascotInstance.express(gesture) } catch (_) {}
    ambientTimerRef.current = setTimeout(() => triggerAmbientGesture(mascotInstance), AMBIENT_INTERVAL_MS)
  }, [])

  // Start cycling once mascot is loaded
  useEffect(() => {
    if (!mascot) return
    // Fire first gesture immediately
    const first = HERO_ELEMENTS[0]
    try { mascot.express(first.gesture) } catch (_) {}

    cycleTimerRef.current = setTimeout(() => triggerNextElement(mascot), ELEMENT_INTERVAL_MS)

    // Pause cycles when tab hidden, resume on focus (prevents burst catch-up)
    const handleVisibility = () => {
      if (document.hidden) {
        if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current)
        if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
      } else {
        if (isHeroZoneRef.current) {
          cycleTimerRef.current = setTimeout(() => triggerNextElement(mascot), ELEMENT_INTERVAL_MS)
        } else {
          ambientTimerRef.current = setTimeout(() => triggerAmbientGesture(mascot), AMBIENT_INTERVAL_MS)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current)
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [mascot, triggerNextElement, triggerAmbientGesture])

  // Scroll handler
  useEffect(() => {
    if (!mascot) return

    const updateMascotOnScroll = () => {
      try {
        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobile = viewportWidth < 768

        if (typeof mascot.setPosition === 'function') {
          const heroTextStart = Math.max(0, (viewportWidth - 1000) / 2)
          const gapCenter = heroTextStart / 2
          const mobileBaseYOffset = -viewportHeight * 0.25

          if (mascotMode === '2d') {
            const baseXOffset = isMobile ? 0 : gapCenter - viewportWidth / 2
            const yOffset = isMobile
              ? mobileBaseYOffset + scrollY * 0.5
              : (scrollY - viewportHeight * 0.1) * 0.5
            const xOffset = baseXOffset + (Math.min(100, viewportWidth * 0.08) * Math.sin(scrollY / 600))
            mascot.setPosition(xOffset, yOffset, 0)
          } else {
            const yOffset = isMobile ? scrollY * 0.4 : (scrollY - viewportHeight * 0.1) * 0.4
            const xOffset = Math.min(80, viewportWidth * 0.06) * Math.sin(scrollY / 600)
            mascot.setPosition(xOffset, yOffset, 0)
          }
        }

        const heroHeight = isMobile ? viewportHeight * 0.5 : viewportHeight * 0.9
        const inHero = scrollY < heroHeight
        const newZIndex = inHero ? 100001 : 1

        // Drop behind content when past hero (stays visible through glass cards)
        if (newZIndex !== lastZIndexRef.current && mascotContainerRef.current) {
          lastZIndexRef.current = newZIndex
          mascotContainerRef.current.style.zIndex = String(newZIndex)
        }

        // Switch gesture cycle when crossing hero boundary
        if (inHero !== isHeroZoneRef.current) {
          isHeroZoneRef.current = inHero
          if (inHero) {
            // Returned to hero: stop ambient, restart elemental
            if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current)
            const { gesture } = HERO_ELEMENTS[elementIndexRef.current]
            try { mascot.express(gesture) } catch (_) {}
            cycleTimerRef.current = setTimeout(() => triggerNextElement(mascot), ELEMENT_INTERVAL_MS)
          } else {
            // Left hero: stop elemental, start ambient
            if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current)
            triggerAmbientGesture(mascot)
          }
        }
      } catch (_) {}
      finally { tickingRef.current = false }
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(updateMascotOnScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      tickingRef.current = false
    }
  }, [mascot, mascotMode, triggerNextElement, triggerAmbientGesture])

  const handleMascotLoaded = (loadedMascot: any, mode: MascotMode) => {
    setMascot(loadedMascot)
    setMascotMode(mode)
  }

  const activeElement = HERO_ELEMENTS[elementIndex]

  return (
    <>
      <EmotiveHeader />

      <MascotRenderer
        onMascotLoaded={handleMascotLoaded}
        onModeChange={setMascotMode}
        coreGeometry="crystal"
        autoRotate={true}
        enableControls={false}
        showModeToggle={false}
        externalContainerRef={mascotContainerRef}
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

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vh, 4rem) clamp(1rem, 3vw, 2rem)',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Ambient glow — color tracks active element */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at 30% 30%, ${activeElement.color}18 0%, transparent 55%)`,
            transition: 'background 1s ease',
            zIndex: 0, pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: 'clamp(8rem, 20vh, 12rem)',
            position: 'relative',
            zIndex: 10,
          }}>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: '700',
              marginBottom: '1.5rem',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow: `0 0 80px ${activeElement.color}44`,
              transition: 'text-shadow 1s ease',
            }}>
              Elemental Effects.<br />Expressive Characters.
            </h1>

            {/* Sub-headline */}
            <p style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto 2.5rem',
            }}>
              A JavaScript library for animated characters with elemental effects.
              8 GPU shader systems, 291 gestures, WebGL + Canvas 2D. MIT.
            </p>

            {/* Active element indicator */}
            <div style={{
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: activeElement.color,
              fontWeight: '600',
              letterSpacing: '0.5px',
              transition: 'color 0.5s ease',
              height: '1.5rem',
            }}>
              ◈ {activeElement.label}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}>
              <a
                href="https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.9rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: `${activeElement.color}cc`,
                  color: '#0a0a0a',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: `0 8px 32px ${activeElement.color}55`,
                  transition: 'transform 0.2s ease, box-shadow 0.8s ease, background 0.8s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 12px 40px ${activeElement.color}88`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 8px 32px ${activeElement.color}55`
                }}
              >
                Live Demo
              </a>

              <a
                href="https://github.com/joshtol/emotive-engine"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.9rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  border: `1px solid ${activeElement.color}55`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'border-color 0.8s ease, background 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${activeElement.color}11`
                  e.currentTarget.style.borderColor = `${activeElement.color}99`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = `${activeElement.color}55`
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>

            {/* Stats bar */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: '500',
              letterSpacing: '0.3px',
            }}>
              {[
                '8 shaders',
                '291 gestures',
                '60fps WebGL',
                'Canvas 2D fallback',
                'TypeScript',
                'MIT',
              ].map((stat, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  {i > 0 && <span style={{ color: `${activeElement.color}66`, transition: 'color 0.8s ease' }}>·</span>}
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CODE SNIPPET ─────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)',
          maxWidth: '860px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              From install to fire crown in four lines.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
              React, Vue, Svelte, vanilla JS.
            </p>
          </div>

          <div style={{
            background: 'rgba(10,10,12,0.9)',
            border: '1px solid rgba(102,126,234,0.2)',
            borderRadius: '16px',
            padding: '2rem 2.5rem',
            fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
            fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
            lineHeight: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflowX: 'auto',
          }}>
            <div><span style={{ color: '#6272a4' }}>// npm install @joshtol/emotive-engine</span></div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: '#ff79c6' }}>import</span>
              <span style={{ color: '#f8f8f2' }}> {'{ EmotiveMascot3D }'} </span>
              <span style={{ color: '#ff79c6' }}>from</span>
              <span style={{ color: '#f1fa8c' }}> '@joshtol/emotive-engine'</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span style={{ color: '#8be9fd' }}>const</span>
              <span style={{ color: '#f8f8f2' }}> mascot </span>
              <span style={{ color: '#ff79c6' }}>=</span>
              <span style={{ color: '#8be9fd' }}> new</span>
              <span style={{ color: '#50fa7b' }}> EmotiveMascot3D</span>
              <span style={{ color: '#f8f8f2' }}>{'({ element: '}</span>
              <span style={{ color: '#f1fa8c' }}>'fire'</span>
              <span style={{ color: '#f8f8f2' }}>{' })'}</span>
            </div>
            <div>
              <span style={{ color: '#f8f8f2' }}>mascot.</span>
              <span style={{ color: '#50fa7b' }}>init</span>
              <span style={{ color: '#f8f8f2' }}>{'(document.getElementById('}</span>
              <span style={{ color: '#f1fa8c' }}>'canvas'</span>
              <span style={{ color: '#f8f8f2' }}>{')).then(() => '}</span>
            </div>
            <div style={{ paddingLeft: '2rem' }}>
              <span style={{ color: '#f8f8f2' }}>mascot.</span>
              <span style={{ color: '#50fa7b' }}>express</span>
              <span style={{ color: '#f8f8f2' }}>{'('}</span>
              <span style={{ color: '#f1fa8c' }}>'firecrown'</span>
              <span style={{ color: '#f8f8f2' }}>{')'}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a
              href="https://github.com/joshtol/emotive-engine#readme"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#a5b4fc', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}
            >
              View full API docs on GitHub →
            </a>
          </div>
        </section>

        {/* ── ELEMENT SHOWCASE ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              8 Elemental Shader Systems
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Each element is a full GPU-instanced shader system with bloom, AO, and 15+ unique gestures.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {ELEMENTS_GRID.map((el) => (
              <a
                key={el.name}
                href={`https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html#${el.name}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid ${el.color}22`,
                  background: 'rgba(10,10,12,0.8)',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 16px 40px ${el.color}33`
                  e.currentTarget.style.borderColor = `${el.color}55`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = `${el.color}22`
                }}
              >
                <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: '#0a0a0c' }}>
                  <img
                    src={el.gif}
                    alt={`${el.label} elemental effect`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                </div>
                <div style={{
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: el.color }}>{el.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: '500' }}>
                    15+ gestures →
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a
              href="https://joshtol.github.io/emotive-engine/examples/3d/elemental-gestures.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              Try all 8 elements live →
            </a>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <LazyFeaturesShowcase />

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1rem, 3vw, 2rem)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
            background: 'rgba(10,10,12,0.85)',
            border: '1px solid rgba(102,126,234,0.2)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              npm install @joshtol/emotive-engine
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.95rem',
              marginBottom: '2rem',
              lineHeight: 1.6,
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
            }}>
              React, Vue, Svelte, vanilla JS. MIT.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/joshtol/emotive-engine"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.9rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: 'rgba(167,139,250,0.85)',
                  color: '#0a0a0a',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(167,139,250,0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(167,139,250,0.6)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(167,139,250,0.4)'
                }}
              >
                View on GitHub
              </a>
              <Link
                href="/examples"
                style={{
                  padding: '0.9rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(167,139,250,0.35)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(167,139,250,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.35)'
                }}
              >
                Browse Examples
              </Link>
            </div>
          </div>
        </section>

      </main>

      <EmotiveFooter />
    </>
  )
}
