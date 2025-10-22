'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyMascotProps {
  containerZIndex: number
  onMascotLoaded?: (mascot: any) => void
}

/**
 * Lazy-loaded mascot component that only loads the engine when:
 * 1. Component is mounted (client-side)
 * 2. Canvas is in viewport (Intersection Observer)
 * 3. User interaction detected OR after 1 second idle
 *
 * This reduces initial bundle size and improves LCP
 */
export default function LazyMascot({ containerZIndex, onMascotLoaded }: LazyMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mascot, setMascot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  // Intersection Observer to detect when canvas enters viewport
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect() // Only need to detect once
          }
        })
      },
      {
        threshold: 0.1, // Load when 10% visible
        rootMargin: '50px' // Load slightly before entering viewport
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Load mascot engine when visible OR after user interaction
  useEffect(() => {
    if (!isVisible) return
    if (initializedRef.current || initializingRef.current) return

    let cancelled = false
    initializingRef.current = true
    setIsLoading(true)

    // Defer initialization by 500ms to reduce initial script evaluation time
    const deferredLoad = setTimeout(() => {
      loadMascot()
    }, 500)

    const loadMascot = async () => {
      if (!canvasRef.current || cancelled) return

      try {
        const canvas = canvasRef.current
        const vw = window.innerWidth
        const vh = window.innerHeight
        const isMobile = window.innerWidth < 768

        // Adaptive performance: Detect device capability
        const cpuCores = navigator.hardwareConcurrency || 4
        const isLowEnd = cpuCores <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent)
        const isVeryLowEnd = cpuCores <= 2

        // Set canvas dimensions
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.setAttribute('width', Math.round(rect.width * dpr).toString())
        canvas.setAttribute('height', Math.round(rect.height * dpr).toString())

        // Dynamic import - this creates a separate chunk
        // Load the script dynamically
        const existingScript = document.querySelector('script[src*="/emotive-engine"]')
        let script = existingScript as HTMLScriptElement

        if (!existingScript) {
          script = document.createElement('script')
          script.src = `/emotive-engine-lean.js?v=${Date.now()}`
          script.async = true

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Access the global EmotiveMascot (minimal bundle exports as EmotiveMascotLean)
        const EmotiveMascot = (window as any).EmotiveMascotLean?.default || (window as any).EmotiveMascotLean || (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found')
          return
        }

        // Adaptive particle count based on device capability
        let maxParticles: number
        let targetFPS: number

        if (isVeryLowEnd) {
          maxParticles = 20   // Very low-end: minimal particles (reduced from 30)
          targetFPS = 30
        } else if (isLowEnd || isMobile) {
          maxParticles = 30   // Low-end/mobile: reduced particles (reduced from 50)
          targetFPS = 30
        } else {
          maxParticles = 80  // Desktop: reduced particles (reduced from 100)
          targetFPS = 60
        }

        // Create mascot instance with adaptive settings
        const mascotInstance = new EmotiveMascot({
          canvasId: 'hero-mascot-canvas',
          targetFPS,
          enableAudio: false,
          soundEnabled: false,
          maxParticles,
          defaultEmotion: 'neutral',
          enableGazeTracking: false,
          enableIdleBehaviors: !isVeryLowEnd, // Disable on very low-end
          transitionDuration: isLowEnd ? 400 : 600, // Faster transitions on low-end
          emotionTransitionSpeed: isLowEnd ? 300 : 400
        })

        await mascotInstance.init(canvas)
        mascotInstance.setParticleSystemCanvasDimensions(vw, vh)

        // Configure backdrop
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

        // Set scale
        mascotInstance.setScale({
          core: 0.8,
          particles: 1.4
        })

        // Set initial position
        const initialXOffset = isMobile ? 0 : -vw * 0.38
        mascotInstance.setPosition(initialXOffset, 0, 0)

        // Start engine
        mascotInstance.start()

        if (!cancelled) {
          setMascot(mascotInstance)
          initializedRef.current = true
          setIsLoading(false)
          onMascotLoaded?.(mascotInstance)
        }
      } catch (error) {
        console.error('Failed to load mascot:', error)
        setIsLoading(false)
      } finally {
        initializingRef.current = false
      }
    }

    return () => {
      cancelled = true
      clearTimeout(deferredLoad)
      if (mascot) {
        mascot.destroy?.()
      }
    }
  }, [isVisible, onMascotLoaded])

  return (
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
        opacity: containerZIndex === 1 ? 0 : 1,
        visibility: containerZIndex === 1 ? 'hidden' : 'visible',
        transition: 'opacity 0.5s ease-out, visibility 0.5s ease-out',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      <canvas
        ref={canvasRef}
        id="hero-mascot-canvas"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 10px 40px rgba(102, 126, 234, 0.4))',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      />

      {/* Loading indicator (optional) */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#667eea',
          fontSize: '14px',
          opacity: 0.6
        }}>
          Loading mascot...
        </div>
      )}
    </div>
  )
}
