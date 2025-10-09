'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const ENGINE_SCRIPT_ID = 'emotive-engine-script'
const ENGINE_SCRIPT_SRC = '/emotive-engine.js'

interface UseHeroMascotControllerOptions {
  /** Optional explicit canvas identifier; defaults to . */
  canvasId?: string
  /** Called when the mascot and controller are ready. */
  onReady?: (payload: { mascot: any }) => void
  /** Called when initialization fails. */
  onError?: (error: Error) => void
  /** Automatically call  on the mascot instance once initialized. */
  autoStart?: boolean
  /** Multiplier applied to viewport height for internal render buffer. */
  renderHeightMultiplier?: number
}

interface UseHeroMascotControllerResult {
  canvasRef: React.RefObject<HTMLCanvasElement>
  mascot: any | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: Error | null
  reload: () => Promise<void>
}

declare global {
  interface Window {
    EmotiveMascot?: any
    __emotiveEnginePromise?: Promise<any>
  }
}

async function loadEngineScript(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot load engine outside the browser environment.')
  }

  if (window.EmotiveMascot) {
    return window.EmotiveMascot
  }

  if (window.__emotiveEnginePromise) {
    return window.__emotiveEnginePromise
  }

  window.__emotiveEnginePromise = new Promise<any>((resolve, reject) => {
    let script = document.getElementById(ENGINE_SCRIPT_ID) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = ENGINE_SCRIPT_ID
      script.async = true
      script.src = ENGINE_SCRIPT_SRC
      document.head.appendChild(script)
    }

    const handleLoad = () => {
      cleanup()
      if (window.EmotiveMascot) {
        resolve(window.EmotiveMascot)
      } else {
        reject(new Error('Emotive engine script loaded but  is undefined.'))
      }
    }

    const handleError = () => {
      cleanup()
      reject(new Error('Failed to load emotive engine script.'))
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
    const mascotCtor = await window.__emotiveEnginePromise
    return mascotCtor
  } finally {
    window.__emotiveEnginePromise = undefined
  }
}

function configureCanvas(canvas: HTMLCanvasElement, renderHeightMultiplier: number): { width: number; height: number } {
  const viewportWidth = window.innerWidth || canvas.clientWidth || 1
  const viewportHeight = window.innerHeight || canvas.clientHeight || 1
  const displayHeight = viewportHeight
  const renderHeight = Math.max(displayHeight * renderHeightMultiplier, displayHeight)
  const devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1)

  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${renderHeight}px`
  canvas.width = Math.round(viewportWidth * devicePixelRatio)
  canvas.height = Math.round(renderHeight * devicePixelRatio)

  return { width: viewportWidth, height: renderHeight }
}

export function useHeroMascotController(options: UseHeroMascotControllerOptions = {}): UseHeroMascotControllerResult {
  const { canvasId = 'hero-mascot-canvas', onReady, onError, autoStart = true, renderHeightMultiplier = 3 } = options

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)

  const applyCanvasSizing = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const { width, height } = configureCanvas(canvas, renderHeightMultiplier)

    // Resize hooks for the engine when exposed
    const mascot = mascotRef.current
    const manager = mascot?.canvasManager

    if (manager?.setRenderSize) {
      manager.setRenderSize(width, height)
    }

    if (typeof mascot?.handleResize === 'function') {
      mascot.handleResize(width, height, Math.max(window.devicePixelRatio || 1, 1))
    }
  }, [renderHeightMultiplier])

  const teardownMascot = useCallback(() => {
    const mascot = mascotRef.current
    if (!mascot) {
      return
    }

    try {
      mascot.stop?.()
      mascot.destroy?.()
      mascot.pause?.()
    } catch (cleanupError) {
      console.warn('Mascot cleanup error:', cleanupError)
    } finally {
      mascotRef.current = null
    }
  }, [])

  const initializeMascot = useCallback(async () => {
    // Prevent re-initialization if already ready or loading
    if (status === 'loading' || status === 'ready') {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setStatus('loading')
    setError(null)

    try {
      const EmotiveMascot = await loadEngineScript()
      const canvas = canvasRef.current ?? (canvasId ? document.getElementById(canvasId) as HTMLCanvasElement | null : null)

      if (!canvas) {
        throw new Error('Mascot canvas element not available during initialization.')
      }

      const renderSize = configureCanvas(canvas, renderHeightMultiplier)

      const mascot = new EmotiveMascot({
        canvasId,
        targetFPS: 60,
        enableAudio: false,
        soundEnabled: false,
        maxParticles: 120,
        defaultEmotion: 'neutral',
        enableAutoOptimization: true,
        enableGracefulDegradation: true,
        renderingStyle: 'classic',
        enableGazeTracking: false,
        enableIdleBehaviors: true,
        renderSize,
        classicConfig: {
          coreColor: '#FFFFFF',
          coreSizeDivisor: 12,
          glowMultiplier: 2.5,
          defaultGlowColor: '#14B8A6',
        },
      })

      mascotRef.current = mascot

      if (autoStart) {
        mascot.start?.()
      }

      applyCanvasSizing()

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
        console.error('Hero mascot initialization failed:', errorObject)
      }
      throw errorObject
    }
  }, [applyCanvasSizing, autoStart, canvasId, onError, onReady, renderHeightMultiplier])
  // Note: 'status' intentionally removed from deps to prevent infinite loop

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    let disposed = false

    initializeMascot().catch(() => {
      /* handled in initializeMascot */
    })

    const resizeHandler = () => {
      if (!disposed) {
        applyCanvasSizing()
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
  }, [applyCanvasSizing, initializeMascot, teardownMascot])

  useEffect(() => {
    return () => {
      teardownMascot()
    }
  }, [teardownMascot])

  const reload = useCallback(async () => {
    teardownMascot()
    return initializeMascot()
  }, [initializeMascot, teardownMascot])

  return useMemo(() => ({
    canvasRef,
    mascot: mascotRef.current,
    status,
    error,
    reload,
  }), [error, reload, status])
}
