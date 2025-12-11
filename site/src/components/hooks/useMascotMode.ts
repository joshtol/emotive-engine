'use client'

import { useCallback, useEffect, useState } from 'react'

export type MascotMode = '3d' | '2d'

const STORAGE_KEY = 'emotive-mascot-mode'

/**
 * Check if WebGL is supported in the browser
 */
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return !!gl
  } catch {
    return false
  }
}

/**
 * Get stored mode preference from localStorage
 */
function getStoredMode(): MascotMode | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === '3d' || stored === '2d') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return null
}

/**
 * Store mode preference in localStorage
 */
function storeMode(mode: MascotMode): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage not available
  }
}

interface UseMascotModeOptions {
  /** Default mode if no preference stored (default: '3d') */
  defaultMode?: MascotMode
  /** Called when mode changes */
  onModeChange?: (mode: MascotMode) => void
}

interface UseMascotModeResult {
  /** Current render mode */
  mode: MascotMode
  /** Whether WebGL is supported */
  hasWebGL: boolean
  /** Whether mode is still being determined */
  isLoading: boolean
  /** Switch to 3D mode */
  setMode3D: () => void
  /** Switch to 2D mode */
  setMode2D: () => void
  /** Toggle between modes */
  toggleMode: () => void
  /** Set mode directly */
  setMode: (mode: MascotMode) => void
}

/**
 * Hook for managing 2D/3D mascot render mode
 * - Defaults to 3D if WebGL is supported
 * - Falls back to 2D if WebGL not available
 * - Persists user preference in localStorage
 */
export function useMascotMode(options: UseMascotModeOptions = {}): UseMascotModeResult {
  const { defaultMode = '3d', onModeChange } = options

  const [mode, setModeState] = useState<MascotMode>(defaultMode)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize mode on mount
  useEffect(() => {
    const webglSupported = checkWebGLSupport()
    setHasWebGL(webglSupported)

    // Check stored preference
    const storedMode = getStoredMode()

    if (storedMode) {
      // Use stored preference, but fall back to 2D if 3D requested but not supported
      if (storedMode === '3d' && !webglSupported) {
        setModeState('2d')
      } else {
        setModeState(storedMode)
      }
    } else {
      // No stored preference: default to 3D if supported, else 2D
      const finalMode = webglSupported ? '3d' : '2d'
      setModeState(finalMode)
    }

    setIsLoading(false)
  }, [])

  const setMode = useCallback((newMode: MascotMode) => {
    // Can't set 3D mode if WebGL not supported
    if (newMode === '3d' && !hasWebGL) {
      return
    }

    setModeState(newMode)
    storeMode(newMode)
    onModeChange?.(newMode)
  }, [hasWebGL, onModeChange])

  const setMode3D = useCallback(() => setMode('3d'), [setMode])
  const setMode2D = useCallback(() => setMode('2d'), [setMode])

  const toggleMode = useCallback(() => {
    setMode(mode === '3d' ? '2d' : '3d')
  }, [mode, setMode])

  return {
    mode,
    hasWebGL,
    isLoading,
    setMode3D,
    setMode2D,
    toggleMode,
    setMode,
  }
}
