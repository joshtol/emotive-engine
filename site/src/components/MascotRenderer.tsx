'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMascotMode, MascotMode } from './hooks/useMascotMode'

interface MascotRendererProps {
  /** Called when mascot is loaded (either 2D or 3D) */
  onMascotLoaded?: (mascot: any, mode: MascotMode) => void
  /** Called when mode changes */
  onModeChange?: (mode: MascotMode) => void
  /** Core geometry for 3D mode */
  coreGeometry?: 'crystal' | 'moon' | 'sun' | 'heart' | 'rough' | 'sphere'
  /** Enable orbit controls in 3D mode */
  enableControls?: boolean
  /** Enable auto-rotation in 3D mode */
  autoRotate?: boolean
  /** Show mode toggle button */
  showModeToggle?: boolean
  /** External ref to access the container element for scroll-driven positioning */
  externalContainerRef?: React.RefObject<HTMLDivElement>
  /** Custom container style overrides */
  containerStyle?: React.CSSProperties
}

// Hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

/**
 * Unified mascot renderer that supports both 2D and 3D modes
 * - Defaults to 3D (if WebGL supported)
 * - User can toggle to 2D mode
 * - Preserves preference in localStorage
 */
export default function MascotRenderer({
  onMascotLoaded,
  onModeChange,
  coreGeometry = 'crystal',
  enableControls = false,
  autoRotate = true,
  showModeToggle = true,
  externalContainerRef,
  containerStyle,
}: MascotRendererProps) {
  console.log('[MascotRenderer] Component mounted, coreGeometry:', coreGeometry)

  const containerRef = useRef<HTMLDivElement>(null)
  const container3DRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const initializingRef = useRef(false)
  const isMobile = useIsMobile()

  // Track mode changes to force re-initialization
  const [modeVersion, setModeVersion] = useState(0)

  const { mode, hasWebGL, isLoading: modeLoading, toggleMode } = useMascotMode({
    onModeChange: (newMode) => {
      console.log('[MascotRenderer] Mode change callback, newMode:', newMode)
      onModeChange?.(newMode)
      // Reinitialize mascot when mode changes
      destroyMascot()
      initializingRef.current = false
      // Reset container mounted state so intersection observer will re-attach
      setContainerMounted(false)
      // Increment version to force useEffect to re-run
      setModeVersion(v => v + 1)
    },
  })

  const destroyMascot = useCallback(() => {
    if (mascotRef.current) {
      try {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
      } catch (e) {
        console.warn('Mascot cleanup error:', e)
      }
      mascotRef.current = null
    }
  }, [])

  // Track when container is mounted
  const [containerMounted, setContainerMounted] = useState(false)

  // Callback ref to detect when container is mounted
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    // Also set external ref if provided (for scroll-driven positioning)
    if (externalContainerRef) {
      (externalContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    }
    if (node) {
      console.log('[MascotRenderer] Container ref attached to DOM')
      setContainerMounted(true)
      // Immediately set visible since the page is already visible
      // The intersection observer is too slow for mode switching
      setIsVisible(true)
    }
  }, [externalContainerRef])

  // Intersection Observer - runs after container is mounted
  useEffect(() => {
    console.log('[MascotRenderer] Intersection Observer useEffect, containerMounted:', containerMounted, 'containerRef:', !!containerRef.current)
    if (!containerMounted || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('[MascotRenderer] Intersection observed:', entry.isIntersecting)
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [containerMounted])

  // Load appropriate engine based on mode
  useEffect(() => {
    // Wait for container to be mounted and mode to be determined
    if (!containerMounted || modeLoading) return
    if (initializingRef.current || mascotRef.current) return

    initializingRef.current = true
    setIsLoading(true)

    const loadMascot = async () => {
      // Double-check we should still load (in case of rapid unmount/remount from Strict Mode)
      if (!initializingRef.current) return
      try {
        if (mode === '3d') {
          await load3DMascot()
        } else {
          await load2DMascot()
        }
      } catch (error) {
        console.error(`Failed to load ${mode} mascot:`, error)
      } finally {
        setIsLoading(false)
        initializingRef.current = false
      }
    }

    const load3DMascot = async () => {
      if (!container3DRef.current) {
        console.warn('[3D] No 3D container ref')
        return
      }

      console.log('[3D] Starting 3D mascot load...')

      // Wait for global to be available (handles both new and existing scripts)
      const waitForGlobal = (name: string, timeout = 10000): Promise<any> => {
        return new Promise((resolve, reject) => {
          const start = Date.now()
          const check = () => {
            const global = (window as any)[name]
            if (global) {
              console.log(`[3D] Global ${name} found`)
              resolve(global)
            } else if (Date.now() - start > timeout) {
              reject(new Error(`Timeout waiting for ${name}`))
            } else {
              setTimeout(check, 50)
            }
          }
          check()
        })
      }

      const existingScript = document.querySelector('script[src*="/emotive-engine-3d"]')
      console.log('[3D] Existing script:', !!existingScript)

      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `/emotive-engine-3d.js?v=${Date.now()}`
        script.async = true
        console.log('[3D] Loading script:', script.src)
        document.head.appendChild(script)
      }

      // Wait for the global to be available
      const EmotiveMascot3DModule = await waitForGlobal('EmotiveMascot3D')
      console.log('[3D] Module loaded, keys:', Object.keys(EmotiveMascot3DModule || {}))
      const EmotiveMascot3D = EmotiveMascot3DModule?.default || EmotiveMascot3DModule

      if (!EmotiveMascot3D || typeof EmotiveMascot3D !== 'function') {
        console.error('[3D] EmotiveMascot3D module:', EmotiveMascot3DModule)
        console.error('[3D] EmotiveMascot3D type:', typeof EmotiveMascot3D)
        throw new Error('EmotiveMascot3D class not found in module')
      }

      console.log('[3D] EmotiveMascot3D class found, type:', typeof EmotiveMascot3D)

      const cpuCores = navigator.hardwareConcurrency || 4
      const isMobileDevice = /Android|iPhone|iPad/i.test(navigator.userAgent)
      const isLowEnd = cpuCores <= 4 || isMobileDevice

      console.log('[3D] Creating mascot with geometry:', coreGeometry)
      const mascot = new EmotiveMascot3D({
        coreGeometry,
        enableParticles: true,
        // Always enable post-processing for crystal to show soul properly
        enablePostProcessing: true,
        enableControls,
        autoRotate,
        autoRotateSpeed: 0.3,
        defaultEmotion: 'neutral',
        maxParticles: isLowEnd ? 100 : 200,
        targetFPS: isLowEnd ? 30 : 60,
        // Camera settings for proper sizing in smaller container
        cameraDistance: 2.5,  // Further back for smaller crystal
        fov: 35,
        minZoom: 1.5,
        maxZoom: 4.0,
        enableBlinking: true,
        enableBreathing: true,
        enableShadows: false,
      })
      console.log('[3D] Mascot created:', mascot)

      console.log('[3D] Container dimensions:', container3DRef.current.offsetWidth, 'x', container3DRef.current.offsetHeight)
      console.log('[3D] Calling init...')
      mascot.init(container3DRef.current)
      console.log('[3D] After init - webglCanvas:', mascot.webglCanvas?.width, 'x', mascot.webglCanvas?.height)
      console.log('[3D] core3D:', mascot.core3D)
      console.log('[3D] Calling start...')
      mascot.start()
      console.log('[3D] 3D Mascot started successfully!')

      mascotRef.current = mascot
      onMascotLoaded?.(mascot, '3d')
    }

    const load2DMascot = async () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight
      const dpr = window.devicePixelRatio || 1

      canvas.setAttribute('width', Math.round(vw * dpr).toString())
      canvas.setAttribute('height', Math.round(vh * dpr).toString())

      // Wait for global to be available
      const waitForGlobal = (name: string, timeout = 10000): Promise<any> => {
        return new Promise((resolve, reject) => {
          const start = Date.now()
          const check = () => {
            const global = (window as any)[name]
            if (global) {
              resolve(global)
            } else if (Date.now() - start > timeout) {
              reject(new Error(`Timeout waiting for ${name}`))
            } else {
              setTimeout(check, 50)
            }
          }
          check()
        })
      }

      const existingScript = document.querySelector('script[src*="/emotive-engine-lean"]')

      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `/emotive-engine-lean.js?v=${Date.now()}`
        script.async = true
        document.head.appendChild(script)
      }

      // Wait for the global - try EmotiveMascotLean first (lean bundle), then EmotiveMascot
      let EmotiveMascotModule
      try {
        EmotiveMascotModule = await waitForGlobal('EmotiveMascotLean', 5000)
      } catch {
        EmotiveMascotModule = await waitForGlobal('EmotiveMascot', 5000)
      }

      const EmotiveMascot = EmotiveMascotModule?.default || EmotiveMascotModule

      if (!EmotiveMascot || typeof EmotiveMascot !== 'function') {
        console.error('EmotiveMascot module:', EmotiveMascotModule)
        throw new Error('EmotiveMascot class not found in module')
      }

      const cpuCores = navigator.hardwareConcurrency || 4
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
      const isLowEnd = cpuCores <= 4 || isMobile

      const mascot = new EmotiveMascot({
        canvasId: 'mascot-2d-canvas',
        targetFPS: isLowEnd ? 30 : 60,
        enableAudio: false,
        maxParticles: isLowEnd ? 30 : 80,
        defaultEmotion: 'neutral',
        enableGazeTracking: false,
        enableIdleBehaviors: true,
      })

      await mascot.init(canvas)
      mascot.setParticleSystemCanvasDimensions(vw, vh)
      mascot.setBackdrop({
        enabled: true,
        radius: 3.5,
        intensity: 0.85,
        blendMode: 'normal',
        falloff: 'smooth',
        edgeSoftness: 0.95,
        coreTransparency: 0.3,
        responsive: true,
      })
      mascot.setScale({ core: 0.8, particles: 1.4 })
      mascot.setPosition(isMobile ? 0 : -vw * 0.38, 0, 0)
      mascot.start()

      mascotRef.current = mascot
      onMascotLoaded?.(mascot, '2d')
    }

    // Defer load slightly
    const timer = setTimeout(loadMascot, 300)
    return () => {
      clearTimeout(timer)
      // Reset initializing flag on cleanup (important for Strict Mode double-mounting)
      initializingRef.current = false
    }
  }, [mode, modeLoading, modeVersion, containerMounted, coreGeometry, enableControls, autoRotate, onMascotLoaded])

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyMascot()
  }, [destroyMascot])

  if (modeLoading) {
    return null
  }

  // 3D container dimensions - positioned like 2D mascot
  // Both mobile and desktop: 10% larger containers
  const container3DStyle: React.CSSProperties = isMobile
    ? {
        // Mobile: centered horizontally, 18% from top (center of container)
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '440px',   // 400 * 1.1
        height: '605px',  // 550 * 1.1
        pointerEvents: enableControls ? 'auto' : 'none',
        zIndex: 100,
      }
    : {
        // Desktop: center crystal in the gap, 50% from top (vertically centered)
        // Size: 500 * 1.5 = 750, 700 * 1.5 = 1050
        position: 'fixed',
        top: '50%',
        left: 'calc(max(20px, (50vw - 500px) / 2 - 375px))',
        transform: 'translateY(-50%)',
        width: '750px',   // 500 * 1.5
        height: '1050px', // 700 * 1.5
        pointerEvents: enableControls ? 'auto' : 'none',
        zIndex: 100,
      }

  return (
    <>
      {/* 2D mode: fullscreen container */}
      {mode === '2d' && (
        <div
          ref={setContainerRef}
          id="mascot-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 100,
            opacity: 1,
            transition: 'opacity 0.5s ease-out',
            ...containerStyle,
          }}
        >
          <canvas
            ref={canvasRef}
            id="mascot-2d-canvas"
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 10px 40px rgba(102, 126, 234, 0.4))',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in',
            }}
          />
        </div>
      )}

      {/* 3D mode: sized container positioned like 2D mascot */}
      {mode === '3d' && (
        <div
          ref={(node) => {
            container3DRef.current = node
            setContainerRef(node)
          }}
          id="mascot-container-3d"
          style={{ ...container3DStyle, ...containerStyle }}
        />
      )}

      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '30%' : '50%',
            left: isMobile ? '50%' : 'calc(max(20px, (50vw - 500px) / 2 - 275px) + 275px)',
            transform: 'translate(-50%, -50%)',
            color: '#667eea',
            fontSize: '14px',
            opacity: 0.6,
            zIndex: 101,
          }}
        >
          Loading {mode === '3d' ? '3D' : '2D'} mascot...
        </div>
      )}

      {/* Mode toggle button */}
      {showModeToggle && hasWebGL && (
        <button
          onClick={toggleMode}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102,126,234,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
          }}
        >
          {mode === '3d' ? 'Switch to 2D' : 'Switch to 3D'}
        </button>
      )}
    </>
  )
}
