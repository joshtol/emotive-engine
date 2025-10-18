'use client'

import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    EmotiveMascot?: any
  }
}

export default function CherokeeMascot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const lastGestureRef = useRef<number>(-1)

  // Initialize guide mascot
  useEffect(() => {
    let cancelled = false

    const initializeEngine = async () => {
      console.log('[Cherokee Init] Starting mascot initialization')
      if (!canvasRef.current || cancelled) {
        console.log('[Cherokee Init] Cancelled or no canvas')
        return
      }

      if (initializedRef.current) {
        console.log('[Cherokee Init] Already initialized')
        return
      }
      if (initializingRef.current) {
        console.log('[Cherokee Init] Already initializing')
        return
      }
      if (mascot) {
        console.log('[Cherokee Init] Mascot already exists')
        return
      }

      initializingRef.current = true
      console.log('[Cherokee Init] Proceeding with initialization')

      try {
        const canvas = canvasRef.current
        const vw = window.innerWidth
        const vh = window.innerHeight
        const isMobileDevice = window.innerWidth < 768
        console.log('[Cherokee Init] Viewport:', { vw, vh, isMobileDevice })

        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

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
          canvasId: 'guide-mascot',
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
        console.log('[Cherokee Init] Mascot started')

        setMascot(mascotInstance)
        console.log('[Cherokee Init] Mascot set in state')

        initializedRef.current = true
        initializingRef.current = false

        if (typeof mascotInstance.fadeIn === 'function') {
          mascotInstance.fadeIn(1500)
          console.log('[Cherokee Init] Fade in triggered')
        }

        setTimeout(() => {
          if (typeof mascotInstance.express === 'function') {
            mascotInstance.express('pulse')
            console.log('[Cherokee Init] Pulse gesture triggered')
          }
        }, 800)

      } catch (error) {
        console.error('[Cherokee Init] Failed to initialize mascot:', error)
        initializingRef.current = false
      }
    }

    console.log('[Cherokee Init] Calling initializeEngine')
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

  // Scroll-driven animation with gestures
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrollPosition(scrollY)

      if (!mascot) {
        console.log('[Cherokee Scroll] No mascot instance yet')
        return
      }

      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const isMobileDevice = viewportWidth < 768

      const baseXOffset = isMobileDevice ? 0 : -viewportWidth * 0.38

      const yOffset = (scrollY - viewportHeight * 0.1) * 0.5

      const wavelength = 600
      const amplitude = isMobileDevice
        ? Math.min(80, viewportWidth * 0.15)
        : Math.min(100, viewportWidth * 0.08)
      const xOffset = baseXOffset + (amplitude * Math.sin(scrollY / wavelength))

      console.log('[Cherokee Scroll]', {
        scrollY,
        isMobileDevice,
        viewportWidth,
        baseXOffset,
        amplitude,
        xOffset,
        yOffset
      })

      if (typeof mascot.setPosition === 'function') {
        mascot.setPosition(xOffset, yOffset, 0)
        console.log('[Cherokee Scroll] Position set to:', xOffset, yOffset)
      } else {
        console.log('[Cherokee Scroll] setPosition not available')
      }

      // Trigger gestures at specific scroll positions
      const gesturePoints = [
        { threshold: 0, gesture: null, emotion: 'neutral' },
        { threshold: viewportHeight * 0.9, gesture: 'wave', emotion: 'joy' },
        { threshold: viewportHeight + 800, gesture: 'bounce', emotion: 'excited' },
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <canvas
        ref={canvasRef}
        id="guide-mascot"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 10px 40px rgba(102, 126, 234, 0.4))',
        }}
      />
    </div>
  )
}
