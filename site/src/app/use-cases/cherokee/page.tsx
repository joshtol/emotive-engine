'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import ScheduleModal from '@/components/ScheduleModal'
import UseCaseNav from '@/components/UseCaseNav'
import { useTimeoutManager } from '@/hooks/useTimeoutManager'

export default function CherokeePage() {
  const { setTimeout: setManagedTimeout } = useTimeoutManager()
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
  const lastZIndexRef = useRef<number>(100)

  // Card modal state
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState<number | null>(null)
  const cardMascotRef = useRef<any>(null)
  const cardCanvasRef = useRef<HTMLCanvasElement>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showAudioMessage, setShowAudioMessage] = useState(false)

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

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


  // Handle feedback form submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackStatus('sending')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackForm,
          page: 'Cherokee Language Learning',
        }),
      })

      if (response.ok) {
        setFeedbackStatus('success')
        setFeedbackForm({ name: '', email: '', message: '' })
        setManagedTimeout(() => {
          setShowFeedbackModal(false)
          setFeedbackStatus('idle')
        }, 2000)
      } else {
        setFeedbackStatus('error')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      setFeedbackStatus('error')
    }
  }

  // Cherokee Greetings Data
  const greetings = [
    {
      english: 'Hello',
      cherokee: 'ᎣᏏᏲ',
      pronunciation: 'oh-see-yoh',
      meaning: 'It\'s good to see you',
      context: 'Universal greeting for all occasions',
      color: '#DAA520',
      bgColor: 'rgba(218,165,32,0.5)',
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
      bgColor: 'rgba(255,179,71,0.5)',
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
      bgColor: 'rgba(130,196,195,0.5)',
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
      bgColor: 'rgba(248,183,57,0.5)',
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
      bgColor: 'rgba(247,220,111,0.5)',
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
      bgColor: 'rgba(152,216,200,0.5)',
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
      bgColor: 'rgba(155,89,182,0.5)',
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
      bgColor: 'rgba(195,155,211,0.5)',
      borderColor: 'rgba(195,155,211,0.4)',
      emoji: '🤝',
      emotion: 'neutral',
      intensity: 0.8,
      shape: 'solar',
      gestures: [
        {name: 'wave', delay: 300},
        {name: 'shimmer', delay: 600}
      ]
    },
  ]

  // Card navigation
  const navigateCard = (direction: 'next' | 'prev') => {
    if (selectedPhraseIndex === null) return
    const newIndex = direction === 'next'
      ? (selectedPhraseIndex + 1) % greetings.length
      : (selectedPhraseIndex - 1 + greetings.length) % greetings.length
    setSelectedPhraseIndex(newIndex)
    setShowAudioMessage(false) // Reset audio message on card change
  }

  // Touch handlers for swipe
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

    if (isLeftSwipe) {
      navigateCard('next')
    }
    if (isRightSwipe) {
      navigateCard('prev')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhraseIndex === null) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        navigateCard('next')
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        navigateCard('prev')
      } else if (e.key === 'Escape') {
        setSelectedPhraseIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhraseIndex])

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

        // Access the global EmotiveMascot (full build exports as EmotiveMascot)
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
        const initialYOffset = isMobileDevice
          ? -vh * 0.3  // Mobile: (0 - vh * 0.6) * 0.5
          : -vh * 0.05   // Desktop: (0 - vh * 0.1) * 0.5
        mascotInstance.setPosition(initialXOffset, initialYOffset, 0)

        mascotInstance.start()

        // Check if component is still mounted before setting state
        if (!cancelled) {
          setMascot(mascotInstance)

          initializedRef.current = true
          initializingRef.current = false

          if (typeof mascotInstance.fadeIn === 'function') {
            mascotInstance.fadeIn(2250)
          }

          setManagedTimeout(() => {
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

    // Defer initialization by 500ms to prevent blocking initial render
    const timer = setTimeout(() => {
      initializeEngine()
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)

      // Cleanup mascot instance to prevent memory leaks
      if (mascot) {
        try {
          mascot.stop()
          if (typeof mascot.destroy === 'function') {
            mascot.destroy()
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

        setMascot(null)
        initializedRef.current = false
        initializingRef.current = false
      }
    }
  }, [])

  // Scroll-driven animation with optimized performance
  useEffect(() => {
    if (!mascot || !containerRef.current) return

    const container = containerRef.current
    let isScrolling = false
    let scrollTimeout: NodeJS.Timeout

    const updateMascotOnScroll = () => {
      try {
        const scrollY = window.scrollY
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const isMobileDevice = viewportWidth < 768

        // Update position on every scroll frame for smooth movement
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

        // Calculate opacity and z-index based on modal state and scroll position
        const opacity = selectedPhraseIndex !== null ? 0 : 1

        // After scrolling past hero section (~90% of viewport), move mascot behind content
        const heroHeight = viewportHeight * 0.9
        const isPastHero = scrollY > heroHeight

        let zIndex: number
        if (selectedPhraseIndex !== null) {
          zIndex = -1  // Hidden when modal is open
        } else if (isPastHero) {
          zIndex = -1  // Behind content when past hero
        } else {
          zIndex = 100  // In front during hero section
        }

        // Update z-index ONLY when it changes (threshold-based, not continuous)
        // This prevents CSS recompilation while allowing mascot to hide behind content
        if (zIndex !== lastZIndexRef.current && containerRef.current) {
          lastZIndexRef.current = zIndex
          containerRef.current.style.zIndex = String(zIndex)
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
        // Cancel any pending RAF before scheduling new one
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(updateMascotOnScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      clearTimeout(scrollTimeout)
      tickingRef.current = false
    }
  }, [mascot, selectedPhraseIndex])

  // Initialize card mascot when phrase is selected
  useEffect(() => {
    if (selectedPhraseIndex === null || !cardCanvasRef.current) return

    let cancelled = false
    const timeoutIds: NodeJS.Timeout[] = []
    let gestureInterval: NodeJS.Timeout | null = null

    const initCardMascot = async () => {
      // Wait for EmotiveMascot to load (full build)
      let attempts = 0
      while (!(window as any).EmotiveMascot && attempts < 50 && !cancelled) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (cancelled) return

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

      const greeting = greetings[selectedPhraseIndex]
      if (!greeting) return

      try {
        // Access the global EmotiveMascot (full build exports as EmotiveMascot)
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

        if (cancelled) {
          cardMascot.destroy?.()
          return
        }

        cardMascotRef.current = cardMascot

        await cardMascot.init(canvas)

        if (cancelled) {
          cardMascot.destroy?.()
          return
        }

        cardMascot.start()

        // Position mascot
        if (cardMascot.setPosition) {
          const offsetX = isMobile ? 0 : -200
          const offsetY = isMobile ? 50 : -120
          cardMascot.setPosition(offsetX, offsetY, 0)
        }

        // Apply configuration
        const configTimeout = setTimeout(() => {
          if (cancelled) return

          if (cardMascot.setEmotion) {
            cardMascot.setEmotion(greeting.emotion, greeting.intensity)
          }

          if (greeting.shape && cardMascot.morphTo) {
            cardMascot.morphTo(greeting.shape)
          }

          // Trigger gestures
          const triggerGestures = () => {
            if (cancelled) return
            greeting.gestures.forEach((gesture) => {
              const gestureTimeout = setTimeout(() => {
                if (cancelled) return
                if (gesture.name === 'drift' && cardMascot.chain) {
                  cardMascot.chain('drift')
                } else if (cardMascot.express) {
                  cardMascot.express(gesture.name)
                }
              }, gesture.delay)
              timeoutIds.push(gestureTimeout)
            })
          }

          triggerGestures()

          // Repeat gestures
          gestureInterval = setInterval(() => {
            if (cancelled || !cardMascotRef.current) return
            triggerGestures()
          }, 8000)
        }, 200)
        timeoutIds.push(configTimeout)

      } catch (err) {
        console.error('Failed to initialize card mascot:', err)
      }
    }

    initCardMascot()

    return () => {
      cancelled = true

      // Clear all timeouts
      timeoutIds.forEach(id => clearTimeout(id))

      // Clear interval
      if (gestureInterval) clearInterval(gestureInterval)

      // Cleanup mascot
      if (cardMascotRef.current) {
        cardMascotRef.current.stop?.()
        cardMascotRef.current.destroy?.()
        cardMascotRef.current = null
      }
    }
  }, [selectedPhraseIndex, isMobile])

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
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100,
          opacity: 1,
          transition: 'opacity 0.3s ease',
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
        background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.85) 100%)',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}>
        {/* Hero Section with Parallax */}
        <section style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          position: 'relative',
        }}>
          {/* Background layers */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top, rgba(218,165,32,0.15) 0%, transparent 50%)',
            zIndex: 0,
          }} />

          <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: '100%',
            maxWidth: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(218, 165, 32, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <div style={{
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
            paddingTop: 'clamp(8rem, 20vh, 12rem)',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Glassmorphism tag */}
            <div style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem',
              background: 'rgba(218, 165, 32, 0.15)',              border: '1px solid rgba(218, 165, 32, 0.3)',
              borderRadius: '30px',
              marginBottom: '3rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#DAA520',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              boxShadow: '0 8px 32px rgba(218, 165, 32, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
              Cherokee Language • Cultural Learning
            </div>

            <h1 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: '900',
              marginBottom: '2.5rem',
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
              marginBottom: '2rem',
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
            }}>
              Learn Cherokee Greetings
            </h2>

            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto 3rem',
            }}>
              Discover common Cherokee phrases through interactive cards with expressive character animations that respond to each greeting's unique cultural meaning.
            </p>

            {/* Branding Callout */}
            <div style={{
              display: 'inline-block',
              padding: '1rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(218,165,32,0.08) 100%)',
              border: '1px solid rgba(218,165,32,0.35)',
              borderRadius: '16px',
              marginBottom: '3rem',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.5',
              maxWidth: '650px',
              boxShadow: '0 4px 20px rgba(218,165,32,0.15)',
            }}>
              <strong style={{ color: '#FFD700' }}>✨ Fully Customizable:</strong> The mascot adapts to your brand—custom shapes, colors, animations, and logos with an emotional state system for expressive interactions.
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2rem'
            }}>
              <a
                href="/docs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(135deg, #DAA520 0%, #FFB347 100%)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(218, 165, 32, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(218, 165, 32, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(218, 165, 32, 0.4)'
                }}
              >
                <span>📚</span> View Documentation
              </a>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1.25rem 2.5rem',
                  background: 'rgba(218, 165, 32, 0.1)',
                  border: '1px solid rgba(218, 165, 32, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(218, 165, 32, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>📅</span> Schedule Demo
              </button>
            </div>

          </div>

          {/* Subtle bottom gradient - passive scroll hint */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(0deg, rgba(5,5,5,0.95) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        </section>

        {/* Bento Grid Greeting Cards */}
        <section style={{
          padding: '4rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            gridAutoRows: 'minmax(200px, auto)',
            transform: 'translateZ(0)',
          }}>
            {greetings.map((greeting, index) => (
              <div
                key={greeting.english}
                onClick={() => setSelectedPhraseIndex(index)}
                style={{
                  background: `linear-gradient(135deg, ${greeting.bgColor.replace('0.5', '0.25')}, ${greeting.bgColor.replace('0.5', '0.15')})`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: `1px solid ${greeting.borderColor.replace('0.4', '0.5')}`,
                  borderRadius: '20px',
                  padding: '2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  gridColumn: index === 0 || index === 7 ? (isMobile ? 'span 1' : 'span 2') : 'span 1',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: 'translateZ(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02) translateZ(0)'
                  e.currentTarget.style.boxShadow = `0 20px 60px ${greeting.borderColor.replace('0.4', '0.6')}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1) translateZ(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                }}>
                  {greeting.emoji}
                </div>
                <div style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  color: greeting.color,
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  textShadow: `0 0 20px ${greeting.color}40`,
                }}>
                  {greeting.cherokee}
                </div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}>
                  {greeting.english}
                </div>
                <div style={{
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                  opacity: 0.7,
                  fontStyle: 'italic',
                }}>
                  {greeting.pronunciation}
                </div>

                {/* Glassmorphism overlay on hover */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                  borderRadius: '20px',
                }} />
              </div>
            ))}
          </div>
        </section>

        {/* Why Learn Cherokee - Max Wow Factor */}
        <section style={{
          padding: '6rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(218, 165, 32, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',            borderRadius: '32px',
            padding: isMobile ? '3rem 2rem' : '4.5rem 3.5rem',
            border: '2px solid rgba(218,165,32,0.2)',
            marginBottom: '4rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Animated gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(218,165,32,0.03) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            <h3 style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#FFD700',
              fontWeight: '700',
              letterSpacing: '-0.03em',
              position: 'relative',
              zIndex: 1,
            }}>
              Why Learn Cherokee?
            </h3>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              opacity: 0.8,
              marginBottom: '4rem',
              maxWidth: '600px',
              margin: '0 auto 4rem auto',
              position: 'relative',
              zIndex: 1,
            }}>
              Join a movement to preserve and celebrate indigenous language
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '2rem',
              position: 'relative',
              zIndex: 1,
            }}>
              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.4)',
                  borderRadius: '24px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(218,165,32,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.4)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: 'clamp(3rem, 7vw, 4rem)',
                  marginBottom: '1.5rem',
                  opacity: 0.9,
                }}>🌍</div>
                <div style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.5rem)',
                  fontWeight: '600',
                  marginBottom: '1.2rem',
                  color: '#FFD700',
                }}>Cultural Preservation</div>
                <div style={{ opacity: 0.9, fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.8 }}>
                  Help preserve one of America's indigenous languages. The Cherokee Nation has over <strong style={{color: '#FFD700'}}>450,000</strong> citizens, but{' '}
                  <a
                    href="https://www.cherokeephoenix.org/news/cherokee-nation-to-host-annual-cherokee-speakers-gathering/article_85068514-2121-472c-879a-8f3a9bf4b498.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{color: '#FFD700', textDecoration: 'underline', fontWeight: '700'}}
                  >fewer than 2,000 fluent speakers remain</a>
                </div>
              </div>

              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.4)',
                  borderRadius: '24px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(218,165,32,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.4)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: 'clamp(3rem, 7vw, 4rem)',
                  marginBottom: '1.5rem',
                  opacity: 0.9,
                }}>💡</div>
                <div style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.5rem)',
                  fontWeight: '600',
                  marginBottom: '1.2rem',
                  color: '#FFD700',
                }}>Unique Writing System</div>
                <div style={{ opacity: 0.9, fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.8 }}>
                  Learn the syllabary created by <strong style={{color: '#FFD700'}}>Sequoyah in 1821</strong>—one of few writing systems invented by a single person
                </div>
              </div>

              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.4)',
                  borderRadius: '24px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(218,165,32,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.4)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: 'clamp(3rem, 7vw, 4rem)',
                  marginBottom: '1.5rem',
                  opacity: 0.9,
                }}>🤝</div>
                <div style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.5rem)',
                  fontWeight: '600',
                  marginBottom: '1.2rem',
                  color: '#FFD700',
                }}>Cultural Respect</div>
                <div style={{ opacity: 0.9, fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.8 }}>
                  Show respect by learning greetings and phrases that honor <strong style={{color: '#FFD700'}}>Cherokee tradition</strong> and connection
                </div>
              </div>
            </div>
          </div>

          {/* About the Syllabary - Bento Grid */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',            borderRadius: '32px',
            padding: isMobile ? '3rem 2rem' : '4.5rem 3.5rem',
            border: '2px solid rgba(218,165,32,0.2)',
            marginBottom: '4rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(218,165,32,0.03) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            <h3 style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              marginBottom: '3.5rem',
              textAlign: 'center',
              color: '#FFD700',
              fontWeight: '700',
              letterSpacing: '-0.03em',
              position: 'relative',
              zIndex: 1,
            }}>
              About the Cherokee Syllabary
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2rem',
              position: 'relative',
              zIndex: 1,
            }}>
              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(218,165,32,0.08) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.35)',
                  borderRadius: '24px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <h4 style={{
                  fontSize: 'clamp(1.4rem, 2.8vw, 1.75rem)',
                  marginBottom: '1.5rem',
                  color: '#FFD700',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <span style={{ fontSize: '2rem' }}>📜</span> History
                </h4>
                <p style={{
                  opacity: 0.9,
                  lineHeight: 1.8,
                  fontSize: 'clamp(1.05rem, 2vw, 1.2rem)'
                }}>
                  Created by <strong style={{color: '#FFD700'}}>Sequoyah in 1821</strong>, the Cherokee syllabary is one of the few writing systems invented by a single individual—revolutionizing Cherokee literacy and enabling unprecedented cultural preservation.
                </p>
              </div>

              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(218,165,32,0.08) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.35)',
                  borderRadius: '24px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <h4 style={{
                  fontSize: 'clamp(1.4rem, 2.8vw, 1.75rem)',
                  marginBottom: '1.5rem',
                  color: '#FFD700',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <span style={{ fontSize: '2rem' }}>🎯</span> Structure
                </h4>
                <p style={{
                  opacity: 0.9,
                  lineHeight: 1.8,
                  fontSize: 'clamp(1.05rem, 2vw, 1.2rem)'
                }}>
                  The syllabary contains <strong style={{color: '#FFD700'}}>85 characters</strong>, each representing a complete syllable (consonant + vowel). Its remarkable efficiency allows learners to achieve literacy in <strong style={{color: '#FFD700'}}>days rather than years</strong>.
                </p>
              </div>

              <div
                style={{
                  padding: '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(218,165,32,0.08) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(218,165,32,0.35)',
                  borderRadius: '24px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <h4 style={{
                  fontSize: 'clamp(1.4rem, 2.8vw, 1.75rem)',
                  marginBottom: '1.5rem',
                  color: '#FFD700',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <span style={{ fontSize: '2rem' }}>💡</span> Cultural Impact
                </h4>
                <p style={{
                  opacity: 0.9,
                  lineHeight: 1.8,
                  fontSize: 'clamp(1.05rem, 2vw, 1.2rem)'
                }}>
                  Within years of its creation, the Cherokee Nation achieved <strong style={{color: '#FFD700'}}>one of the highest literacy rates</strong> in the world. Today, the syllabary remains essential for preserving Cherokee language and cultural identity.
                </p>
              </div>
            </div>
          </div>

          {/* Sources & Attribution */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(218,165,32,0.18) 0%, rgba(218,165,32,0.08) 100%)',            borderRadius: '32px',
            padding: isMobile ? '4rem 2rem' : '5rem 4rem',
            border: '2px solid rgba(218,165,32,0.3)',
            marginBottom: '4rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* Gradient glow overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              pointerEvents: 'none',
            }} />

            <h3 style={{
              position: 'relative',
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              marginBottom: '2rem',
              textAlign: 'center',
              color: '#FFD700',
              fontWeight: '700',
              letterSpacing: '-0.03em',
            }}>
              Sources & Resources
            </h3>
            <div style={{
              position: 'relative',
              textAlign: 'center',
              maxWidth: '900px',
              margin: '0 auto 3rem auto',
            }}>
              <p style={{
                opacity: 0.95,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
                fontWeight: '400',
              }}>
                All Cherokee language content on this page has been <strong style={{color: '#FFD700', fontWeight: '700'}}>verified using official Cherokee Nation resources</strong>.
              </p>
              <p style={{
                opacity: 0.8,
                fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                color: '#D0D0D0',
              }}>
                If you notice any errors or have suggestions for improvement, please let us know.
              </p>
              <button
                onClick={() => setShowFeedbackModal(true)}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.15) 100%)',                  border: '2px solid rgba(218,165,32,0.4)',
                  borderRadius: '12px',
                  color: '#FFD700',
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(218,165,32,0.3)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.4)'
                }}
              >
                Report an Issue or Suggest Improvement
              </button>
            </div>
            <div style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
            }}>
              <a
                href="https://www.cherokeephoenix.org/news/cherokee-nation-to-host-annual-cherokee-speakers-gathering/article_85068514-2121-472c-879a-8f3a9bf4b498.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '3rem 2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',                  border: '2px solid rgba(218,165,32,0.35)',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.3) 0%, rgba(218,165,32,0.15) 100%)'
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 24px 64px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  opacity: 0.9,
                }}>📰</div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 2.8vw, 1.4rem)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#FFD700',
                  textAlign: 'center',
                }}>
                  Cherokee Phoenix
                </div>
                <div style={{
                  opacity: 0.9,
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  lineHeight: 1.7,
                  textAlign: 'center',
                }}>
                  Cherokee Nation's annual speakers gathering and language preservation efforts
                </div>
              </a>
              <a
                href="https://visitcherokeenation.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '3rem 2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',                  border: '2px solid rgba(218,165,32,0.35)',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.3) 0%, rgba(218,165,32,0.15) 100%)'
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 24px 64px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  opacity: 0.9,
                }}>🌐</div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 2.8vw, 1.4rem)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#FFD700',
                  textAlign: 'center',
                }}>
                  Official Cherokee Nation Website
                </div>
                <div style={{
                  opacity: 0.9,
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  lineHeight: 1.7,
                  textAlign: 'center',
                }}>
                  Language content and cultural information verified through visitcherokeenation.com
                </div>
              </a>
              <a
                href="https://www.youtube.com/@VisitCherokeeNation"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '3rem 2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)',                  border: '2px solid rgba(218,165,32,0.35)',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.3) 0%, rgba(218,165,32,0.15) 100%)'
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 24px 64px rgba(218,165,32,0.4), inset 0 1px 0 rgba(255,255,255,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.2) 0%, rgba(218,165,32,0.1) 100%)'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  opacity: 0.9,
                }}>🎥</div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 2.8vw, 1.4rem)',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#FFD700',
                  textAlign: 'center',
                }}>
                  Cherokee Nation YouTube
                </div>
                <div style={{
                  opacity: 0.9,
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  lineHeight: 1.7,
                  textAlign: 'center',
                }}>
                  Pronunciations and proper usage examples from official Cherokee Nation videos
                </div>
              </a>
            </div>
          </div>

          {/* Potential Future Features */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(15,15,20,0.8) 0%, rgba(10,10,15,0.9) 100%)',            borderRadius: '32px',
            padding: isMobile ? '3rem 1.5rem' : '4rem 3rem',
            border: '1px solid rgba(218,165,32,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {/* Animated gradient mesh background */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: 'radial-gradient(circle at 20% 50%, rgba(218,165,32,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(138,43,226,0.1) 0%, transparent 50%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              opacity: 0.6,
            }} />

            {/* Header area */}
            <div style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isMobile ? '2.5rem' : '3.5rem',
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                background: 'rgba(218,165,32,0.15)',
                border: '1px solid rgba(218,165,32,0.3)',
                borderRadius: '24px',
                marginBottom: '1.5rem',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                fontWeight: '600',
                color: '#DAA520',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Concept Demo
              </div>

              <h3 style={{
                fontSize: 'clamp(2.2rem, 5.5vw, 3.2rem)',
                marginBottom: '1.5rem',
                color: '#FFFFFF',
                fontWeight: '700',
                letterSpacing: '-0.04em',
                lineHeight: 1.2,
              }}>
                Potential Applications
              </h3>

              <p style={{
                opacity: 0.85,
                fontSize: 'clamp(1.05rem, 2.3vw, 1.2rem)',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: 1.7,
                color: '#E0E0E0',
              }}>
                This demo showcases the <span style={{color: '#FFD700', fontWeight: '600'}}>Emotive Engine's capabilities for culturally respectful language learning applications</span>. Real implementations would require collaboration with native speakers and cultural authorities.
              </p>
            </div>

            {/* Bento grid of features */}
            <div style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gridTemplateRows: isMobile ? 'auto' : 'repeat(2, 1fr)',
              gap: isMobile ? '1rem' : '1.25rem',
            }}>
              {/* Large card - Native Speaker Audio (spans 2 columns) */}
              <div
                style={{
                  gridColumn: isMobile ? '1' : 'span 2',
                  gridRow: isMobile ? 'auto' : '1',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem',
                  background: 'linear-gradient(135deg, rgba(218,165,32,0.12) 0%, rgba(218,165,32,0.05) 100%)',                  borderRadius: '20px',
                  border: '1px solid rgba(218,165,32,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(218,165,32,0.2)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  marginBottom: '1.25rem',
                  opacity: 0.95,
                }}>🎵</div>
                <div style={{
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)',
                  color: '#FFD700',
                  letterSpacing: '-0.02em',
                }}>Native Speaker Audio</div>
                <div style={{
                  opacity: 0.8,
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: '#D0D0D0',
                }}>Authentic pronunciations from Cherokee Nation language department</div>
              </div>
              {/* Tall card - Emotional Feedback (spans 2 rows) */}
              <div
                style={{
                  gridColumn: isMobile ? '1' : '3',
                  gridRow: isMobile ? 'auto' : 'span 2',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.12) 0%, rgba(138,43,226,0.05) 100%)',                  borderRadius: '20px',
                  border: '1px solid rgba(138,43,226,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(138,43,226,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(138,43,226,0.2)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(3rem, 6vw, 4rem)',
                  marginBottom: '1.5rem',
                  opacity: 0.95,
                  textAlign: 'center',
                }}>😊</div>
                <div style={{
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)',
                  color: '#C39BD3',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                }}>Emotional Feedback</div>
                <div style={{
                  opacity: 0.8,
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: '#D0D0D0',
                  textAlign: 'center',
                }}>Characters react to learner's pronunciation with encouragement</div>
              </div>
              {/* Tall card - Expanded Vocabulary (spans 2 rows) */}
              <div
                style={{
                  gridColumn: isMobile ? '1' : '4',
                  gridRow: isMobile ? 'auto' : 'span 2',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
                  background: 'linear-gradient(135deg, rgba(65,105,225,0.12) 0%, rgba(65,105,225,0.05) 100%)',                  borderRadius: '20px',
                  border: '1px solid rgba(65,105,225,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(65,105,225,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(65,105,225,0.2)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(3rem, 6vw, 4rem)',
                  marginBottom: '1.5rem',
                  opacity: 0.95,
                  textAlign: 'center',
                }}>📚</div>
                <div style={{
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)',
                  color: '#87CEEB',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                }}>Expanded Vocabulary</div>
                <div style={{
                  opacity: 0.8,
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: '#D0D0D0',
                  textAlign: 'center',
                }}>Family words, animals, nature—approved by Cherokee educators</div>
              </div>
              {/* Wide card - Interactive Conversations (spans 2 columns) */}
              <div
                style={{
                  gridColumn: isMobile ? '1' : 'span 2',
                  gridRow: isMobile ? 'auto' : '2',
                  padding: isMobile ? '2rem 1.5rem' : '2.5rem',
                  background: 'linear-gradient(135deg, rgba(34,139,34,0.12) 0%, rgba(34,139,34,0.05) 100%)',                  borderRadius: '20px',
                  border: '1px solid rgba(34,139,34,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(34,139,34,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(34,139,34,0.2)'
                }}
              >
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  marginBottom: '1.25rem',
                  opacity: 0.95,
                }}>📖</div>
                <div style={{
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)',
                  color: '#90EE90',
                  letterSpacing: '-0.02em',
                }}>Interactive Conversations</div>
                <div style={{
                  opacity: 0.8,
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: '#D0D0D0',
                }}>Practice full dialogues with emotionally responsive characters</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case Navigation */}
        <UseCaseNav currentPath="/use-cases/cherokee" />

        <div style={{ height: '2rem' }} />
      </main>

      {/* Card Modal with Navigation */}
      {selectedPhraseIndex !== null && (() => {
        const selected = greetings[selectedPhraseIndex]
        if (!selected) return null

        return (
          <div
            onClick={() => {
              setSelectedPhraseIndex(null)
              setShowAudioMessage(false)
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              overflow: 'auto',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: isMobile ? '500px' : '800px',
                transform: 'translateZ(0)',
                willChange: 'transform',
                width: '100%',
                background: `linear-gradient(135deg, ${selected.bgColor.replace('0.5', '0.3')}, ${selected.bgColor.replace('0.5', '0.2')})`,
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                borderRadius: '24px',
                padding: isMobile ? '2.5rem 2rem' : '3rem 2.5rem',
                paddingBottom: isMobile ? '3rem' : '4rem',
                border: `1px solid ${selected.borderColor.replace('0.4', '0.6')}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 20px 80px ${selected.borderColor.replace('0.4', '0.8')}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                }}
              />

              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedPhraseIndex(null)
                  setShowAudioMessage(false)
                }}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Previous button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateCard('prev')
                }}
                aria-label="Previous greeting"
                style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="#DAA520" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Next button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateCard('next')
                }}
                aria-label="Next greeting"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  width: '56px',
                  height: '56px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="#DAA520" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
                  fontWeight: '600',
                  textShadow: `0 0 40px ${selected.color}60`,
                }}>
                  {selected.cherokee}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2rem',
                  marginBottom: '2rem',
                  flexDirection: isMobile ? 'column' : 'row',
                }}>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    flexShrink: 0,
                    position: 'relative'
                  }} />

                  <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <div style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                      fontWeight: '700',
                      marginBottom: '0.5rem',
                      color: selected.color
                    }}>
                      {selected.english}
                    </div>
                    <div style={{
                      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                      opacity: 0.8,
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowAudioMessage(!showAudioMessage)
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: `1px solid ${selected.color}40`,
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: `0 2px 8px ${selected.color}30`,
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${selected.color}30`
                          e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        aria-label="Audio pronunciation"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" fill={selected.color} opacity="0.9"/>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke={selected.color} strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                        </svg>
                      </button>
                      <strong>{selected.pronunciation}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                opacity: 0.9,
                marginTop: '1rem',
                marginLeft: isMobile ? '0' : '4rem',
                marginRight: isMobile ? '0' : '4rem',
                padding: '1.5rem',
                background: 'rgba(0,0,0,0.3)',                borderRadius: '16px',
                position: 'relative',
                zIndex: 2,
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <strong style={{ color: selected.color, fontSize: '1.1em' }}>Meaning:</strong><br />
                {selected.meaning}
              </div>

              <div style={{
                fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                opacity: 0.6,
                marginTop: '1rem',
                marginLeft: isMobile ? '0' : '4rem',
                marginRight: isMobile ? '0' : '4rem',
                padding: '1rem 1.2rem',
                background: 'rgba(0,0,0,0.15)',                borderRadius: '12px',
                position: 'relative',
                zIndex: 2,
                border: '1px solid rgba(255,255,255,0.03)',
                fontStyle: 'italic',
              }}>
                💡 <span style={{ opacity: 0.7 }}>{selected.context}</span>
              </div>

              {/* Audio message popup - shows when speaker button clicked */}
              {showAudioMessage && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAudioMessage(false)
                  }}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: '500px',
                      width: '100%',
                      padding: '2rem 2.5rem',
                      background: `linear-gradient(135deg, ${selected.color}35, ${selected.color}15)`,
                      backdropFilter: 'blur(40px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                      borderRadius: '20px',
                      border: `1px solid ${selected.color}60`,
                      textAlign: 'center',
                      boxShadow: `0 20px 60px ${selected.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                      animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                    }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setShowAudioMessage(false)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>🎙️</div>
                    <div style={{
                      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                      color: 'rgba(255,255,255,0.95)',
                      fontWeight: '600',
                      lineHeight: 1.5,
                      marginBottom: '1rem'
                    }}>
                      Audio Pronunciation Coming Soon
                    </div>
                    <div style={{
                      fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.6,
                      marginBottom: '1rem'
                    }}>
                      Audio would be sourced from fluent native Cherokee speakers in a real application
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.7,
                      fontStyle: 'italic',
                      color: selected.color
                    }}>
                      Real implementations require authentic representation from cultural authorities
                    </div>
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
              }}>
                {greetings.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: index === selectedPhraseIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: index === selectedPhraseIndex
                        ? selected.color
                        : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedPhraseIndex(index)}
                  />
                ))}
              </div>

              {/* Keyboard hint */}
              <div style={{
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                opacity: 0.6,
                position: 'relative',
                zIndex: 2,
              }}>
                Use arrow keys or swipe to navigate
              </div>
            </div>
          </div>
        )
      })()}

      <EmotiveFooter />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(10,10,15,0.98) 100%)',              borderRadius: '24px',
              padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
              maxWidth: '600px',
              width: '100%',
              border: '1px solid rgba(218,165,32,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFeedbackModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFD700'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
            >
              ×
            </button>

            <h3 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1rem',
              color: '#FFD700',
              fontWeight: '700',
            }}>
              Report an Issue
            </h3>
            <p style={{
              opacity: 0.8,
              marginBottom: '2rem',
              color: '#D0D0D0',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.6,
            }}>
              Help us improve the accuracy and quality of this Cherokee language content.
            </p>

            {feedbackStatus === 'success' ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#90EE90',
                fontSize: '1.1rem',
              }}>
                ✓ Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#D0D0D0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}>
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(218,165,32,0.3)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#D0D0D0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}>
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(218,165,32,0.3)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)'}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#D0D0D0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                  }}>
                    Your feedback *
                  </label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(218,165,32,0.3)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)'}
                    placeholder="Describe the issue or suggestion..."
                  />
                </div>

                {feedbackStatus === 'error' && (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(220,38,38,0.1)',
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: '8px',
                    color: '#FCA5A5',
                    fontSize: '0.95rem',
                  }}>
                    Failed to submit feedback. Please try again.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#D0D0D0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackStatus === 'sending' || !feedbackForm.message.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: feedbackStatus === 'sending' || !feedbackForm.message.trim()
                        ? 'rgba(218,165,32,0.3)'
                        : 'linear-gradient(135deg, rgba(218,165,32,0.4) 0%, rgba(218,165,32,0.3) 100%)',
                      border: '1px solid rgba(218,165,32,0.5)',
                      borderRadius: '8px',
                      color: '#FFD700',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: feedbackStatus === 'sending' || !feedbackForm.message.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: feedbackStatus === 'sending' || !feedbackForm.message.trim() ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (feedbackStatus !== 'sending' && feedbackForm.message.trim()) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.5) 0%, rgba(218,165,32,0.4) 100%)'
                        e.currentTarget.style.borderColor = 'rgba(218,165,32,0.7)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (feedbackStatus !== 'sending' && feedbackForm.message.trim()) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(218,165,32,0.4) 0%, rgba(218,165,32,0.3) 100%)'
                        e.currentTarget.style.borderColor = 'rgba(218,165,32,0.5)'
                      }
                    }}
                  >
                    {feedbackStatus === 'sending' ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        calLink="emotive-engine/30min"
      />
    </>
  )
}
