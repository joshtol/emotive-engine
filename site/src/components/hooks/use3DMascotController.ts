'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ENGINE_3D_SCRIPT_ID = 'emotive-engine-3d-script'
const ENGINE_3D_SCRIPT_SRC = '/emotive-engine-3d.umd.js'

export interface Use3DMascotControllerOptions {
  /** Container element ID for the 3D canvas */
  containerId?: string
  /** Called when the mascot and controller are ready */
  onReady?: (payload: { mascot: any }) => void
  /** Called when initialization fails */
  onError?: (error: Error) => void
  /** Automatically start animation loop once initialized */
  autoStart?: boolean
  /** Core geometry type */
  coreGeometry?: 'crystal' | 'moon' | 'sun' | 'heart' | 'rough' | 'sphere' | 'torus' | 'icosahedron'
  /** Enable particle effects */
  enableParticles?: boolean
  /** Enable post-processing (bloom, etc.) */
  enablePostProcessing?: boolean
  /** Enable orbit controls */
  enableControls?: boolean
  /** Enable auto-rotation */
  autoRotate?: boolean
  /** Auto-rotation speed */
  autoRotateSpeed?: number
  /** Default emotion state */
  defaultEmotion?: string
  /** Maximum particles */
  maxParticles?: number
  /** Target FPS */
  targetFPS?: number
  /** Camera distance */
  cameraDistance?: number
  /** Field of view */
  fov?: number
  /** Enable blinking animation */
  enableBlinking?: boolean
  /** Enable breathing animation */
  enableBreathing?: boolean
}

interface Use3DMascotControllerResult {
  containerRef: React.RefObject<HTMLDivElement>
  mascot: any | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: Error | null
  reload: () => Promise<void>
}

declare global {
  interface Window {
    EmotiveMascot3D?: any
    __emotiveEngine3DPromise?: Promise<any>
  }
}

async function loadEngine3DScript(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot load 3D engine outside the browser environment.')
  }

  if (window.EmotiveMascot3D) {
    return window.EmotiveMascot3D
  }

  if (window.__emotiveEngine3DPromise) {
    return window.__emotiveEngine3DPromise
  }

  window.__emotiveEngine3DPromise = new Promise<any>((resolve, reject) => {
    let script = document.getElementById(ENGINE_3D_SCRIPT_ID) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = ENGINE_3D_SCRIPT_ID
      script.async = true
      script.src = ENGINE_3D_SCRIPT_SRC
      document.head.appendChild(script)
    }

    const handleLoad = () => {
      cleanup()
      if (window.EmotiveMascot3D) {
        resolve(window.EmotiveMascot3D)
      } else {
        reject(new Error('Emotive 3D engine script loaded but EmotiveMascot3D is undefined.'))
      }
    }

    const handleError = () => {
      cleanup()
      reject(new Error('Failed to load emotive 3D engine script.'))
    }

    const cleanup = () => {
      if (!script) {
        return
      }
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
  })

  try {
    const mascotCtor = await window.__emotiveEngine3DPromise
    return mascotCtor
  } finally {
    window.__emotiveEngine3DPromise = undefined
  }
}

export function use3DMascotController(options: Use3DMascotControllerOptions = {}): Use3DMascotControllerResult {
  const {
    containerId = 'mascot-3d-container',
    onReady,
    onError,
    autoStart = true,
    coreGeometry = 'crystal',
    enableParticles = true,
    enablePostProcessing = true,
    enableControls = true,
    autoRotate = true,
    autoRotateSpeed = 0.5,
    defaultEmotion = 'neutral',
    maxParticles = 200,
    targetFPS = 60,
    cameraDistance = 3,
    fov = 45,
    enableBlinking = true,
    enableBreathing = true,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<any | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)

  const teardownMascot = useCallback(() => {
    const mascot = mascotRef.current
    if (!mascot) {
      return
    }

    try {
      mascot.stop?.()
      mascot.destroy?.()
    } catch (cleanupError) {
      console.warn('3D Mascot cleanup error:', cleanupError)
    } finally {
      mascotRef.current = null
    }
  }, [])

  const initializeMascot = useCallback(async () => {
    if (status === 'loading' || status === 'ready') {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setStatus('loading')
    setError(null)

    try {
      const EmotiveMascot3D = await loadEngine3DScript()
      const container = containerRef.current ?? (containerId ? document.getElementById(containerId) as HTMLDivElement | null : null)

      if (!container) {
        throw new Error('3D Mascot container element not available during initialization.')
      }

      const mascot = new EmotiveMascot3D({
        coreGeometry,
        enableParticles,
        enablePostProcessing,
        enableControls,
        autoRotate,
        autoRotateSpeed,
        defaultEmotion,
        maxParticles,
        targetFPS,
        cameraDistance,
        fov,
        enableBlinking,
        enableBreathing,
        enableShadows: false,
        minZoom: 1.5,
        maxZoom: 10,
      })

      mascot.init(container)
      mascotRef.current = mascot

      if (autoStart) {
        mascot.start?.()
      }

      setStatus('ready')
      onReady?.({ mascot })
      return mascot
    } catch (initializationError) {
      const errorObject = initializationError instanceof Error
        ? initializationError
        : new Error(String(initializationError))
      setError(errorObject)
      setStatus('error')
      if (onError) {
        onError(errorObject)
      } else {
        console.error('3D Mascot initialization failed:', errorObject)
      }
      throw errorObject
    }
  }, [
    autoRotate,
    autoRotateSpeed,
    autoStart,
    cameraDistance,
    containerId,
    coreGeometry,
    defaultEmotion,
    enableBlinking,
    enableBreathing,
    enableControls,
    enableParticles,
    enablePostProcessing,
    fov,
    maxParticles,
    onError,
    onReady,
    targetFPS,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    let disposed = false

    initializeMascot().catch(() => {
      /* handled in initializeMascot */
    })

    const resizeHandler = () => {
      if (!disposed && mascotRef.current?.core3D?.renderer?.handleResize) {
        mascotRef.current.core3D.renderer.handleResize()
      }
    }

    window.addEventListener('resize', resizeHandler)
    window.addEventListener('orientationchange', resizeHandler)

    return () => {
      disposed = true
      window.removeEventListener('resize', resizeHandler)
      window.removeEventListener('orientationchange', resizeHandler)
      teardownMascot()
    }
  }, [initializeMascot, teardownMascot])

  useEffect(() => {
    return () => {
      teardownMascot()
    }
  }, [teardownMascot])

  const reload = useCallback(async () => {
    teardownMascot()
    setStatus('idle')
    return initializeMascot()
  }, [initializeMascot, teardownMascot])

  return useMemo(() => ({
    containerRef,
    mascot: mascotRef.current,
    status,
    error,
    reload,
  }), [error, reload, status])
}
