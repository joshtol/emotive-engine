'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyMascot3DProps {
  containerRef?: React.RefObject<HTMLDivElement>
  onMascotLoaded?: (mascot: any) => void
  /** Core geometry type */
  coreGeometry?: 'crystal' | 'moon' | 'sun' | 'heart' | 'rough' | 'sphere'
  /** Enable orbit controls for user interaction */
  enableControls?: boolean
  /** Enable auto-rotation */
  autoRotate?: boolean
  /** Enable post-processing effects (bloom) */
  enablePostProcessing?: boolean
}

/**
 * Lazy-loaded 3D mascot component using WebGL/Three.js
 * Loads the 3D engine when component is visible in viewport
 */
export default function LazyMascot3D({
  containerRef: externalContainerRef,
  onMascotLoaded,
  coreGeometry = 'crystal',
  enableControls = false,
  autoRotate = true,
  enablePostProcessing = true,
}: LazyMascot3DProps) {
  const internalContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = externalContainerRef || internalContainerRef
  const [mascot, setMascot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      setHasWebGL(!!gl)
    } catch {
      setHasWebGL(false)
    }
  }, [])

  // Intersection Observer to detect when container enters viewport
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [containerRef])

  // Load 3D mascot engine when visible
  useEffect(() => {
    if (!isVisible || !hasWebGL) return
    if (initializedRef.current || initializingRef.current) return

    let cancelled = false
    initializingRef.current = true
    setIsLoading(true)

    const deferredLoad = setTimeout(() => {
      loadMascot()
    }, 300)

    const loadMascot = async () => {
      if (!containerRef.current || cancelled) return

      try {
        const container = containerRef.current

        // Adaptive performance based on device
        const cpuCores = navigator.hardwareConcurrency || 4
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
        const isLowEnd = cpuCores <= 4 || isMobile

        // Load the 3D engine script dynamically
        const existingScript = document.querySelector('script[src*="/emotive-engine-3d"]')
        let script = existingScript as HTMLScriptElement

        if (!existingScript) {
          script = document.createElement('script')
          script.src = `/emotive-engine-3d.umd.js?v=${Date.now()}`
          script.async = true

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Access global EmotiveMascot3D
        const EmotiveMascot3D = (window as any).EmotiveMascot3D?.default || (window as any).EmotiveMascot3D

        if (!EmotiveMascot3D) {
          console.error('EmotiveMascot3D not found')
          return
        }

        // Adaptive settings
        const maxParticles = isLowEnd ? 100 : 200
        const targetFPS = isLowEnd ? 30 : 60

        // Create 3D mascot instance
        const mascotInstance = new EmotiveMascot3D({
          coreGeometry,
          enableParticles: true,
          enablePostProcessing: enablePostProcessing && !isLowEnd,
          enableControls,
          autoRotate,
          autoRotateSpeed: 0.3,
          defaultEmotion: 'neutral',
          maxParticles,
          targetFPS,
          cameraDistance: 3,
          fov: 45,
          enableBlinking: true,
          enableBreathing: true,
          enableShadows: false,
          minZoom: 1.5,
          maxZoom: 10,
        })

        mascotInstance.init(container)
        mascotInstance.start()

        if (!cancelled) {
          setMascot(mascotInstance)
          initializedRef.current = true
          setIsLoading(false)
          onMascotLoaded?.(mascotInstance)
        }
      } catch (error) {
        console.error('Failed to load 3D mascot:', error)
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
  }, [isVisible, hasWebGL, coreGeometry, enableControls, autoRotate, enablePostProcessing, onMascotLoaded, containerRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mascot) {
        mascot.stop?.()
        mascot.destroy?.()
      }
    }
  }, [mascot])

  if (!hasWebGL) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        <div style={{ color: '#667eea', fontSize: '14px', opacity: 0.6 }}>
          WebGL not supported
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      id="mascot-3d-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: enableControls ? 'auto' : 'none',
        zIndex: 100,
        opacity: 1,
        transition: 'opacity 0.5s ease-out',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
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
          Loading 3D mascot...
        </div>
      )}
    </div>
  )
}
