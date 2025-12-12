'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ShapeSelectorBar from './ShapeSelectorBar'
import { useMascotMode, MascotMode } from './hooks/useMascotMode'

interface GameMainProps {
  engine: any
  score: number
  combo: number
  currentUndertone: string
  onGesture: (gesture: string) => void
  onMascotReady?: (mascot: any) => void
  /** Optional: external mode control */
  externalMode?: MascotMode
  /** Optional: callback when mode changes */
  onModeChange?: (mode: MascotMode) => void
}

export default function GameMain({ currentUndertone, onGesture, onMascotReady, externalMode, onModeChange }: GameMainProps) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [currentShape, setCurrentShape] = useState('circle')
  const [, setMascot] = useState<any>(null)
  const [showStatusIndicators, setShowStatusIndicators] = useState(true)
  const [isLunarEclipseActive, setIsLunarEclipseActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const container3DRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<any>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializingRef = useRef(false)
  // Animation cancellation token - increment to cancel all running lunar animations
  const lunarAnimationTokenRef = useRef(0)

  // 2D/3D mode management
  const { mode, hasWebGL, isLoading: modeLoading, toggleMode, setMode } = useMascotMode({
    defaultMode: '3d',
    onModeChange: (newMode) => {
      // Cleanup old mascot when mode changes
      if (mascotRef.current) {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
        mascotRef.current = null
        setMascot(null)
      }
      initializingRef.current = false
      onModeChange?.(newMode)
    },
  })

  // Use external mode if provided
  useEffect(() => {
    if (externalMode && externalMode !== mode) {
      setMode(externalMode)
    }
  }, [externalMode, mode, setMode])
  
  const getUndertoneLabel = (undertone: string) => {
    const undertoneMap: { [key: string]: string } = {
      'none': 'clear',
      'nervous': 'nervous',
      'confident': 'confident',
      'tired': 'tired',
      'intense': 'intense',
      'subdued': 'subdued'
    }
    return undertoneMap[undertone] || 'clear'
  }

  // Fade-out functionality for status indicators
  const resetFadeTimer = useCallback(() => {
    setShowStatusIndicators(true)
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
    fadeTimeoutRef.current = setTimeout(() => {
      setShowStatusIndicators(false)
    }, 4000) // Fade out after 4 seconds
  }, [])

  const handleStatusHover = useCallback(() => {
    setShowStatusIndicators(true)
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  const handleStatusLeave = useCallback(() => {
    resetFadeTimer()
  }, [resetFadeTimer])
  const leftEmotionalStates = [
    { name: 'neutral', svg: 'neutral.svg' },
    { name: 'joy', svg: 'joy.svg' },
    { name: 'love', svg: 'love.svg' },
    { name: 'excited', svg: 'excited.svg' },
    { name: 'calm', svg: 'calm.svg' },
    { name: 'euphoria', svg: 'euphoria.svg' },
  ]

  const rightEmotionalStates = [
    { name: 'surprise', svg: 'surprise.svg' },
    { name: 'fear', svg: 'fear.svg' },
    { name: 'sadness', svg: 'sadness.svg' },
    { name: 'disgust', svg: 'disgust.svg' },
    { name: 'anger', svg: 'anger.svg' },
    { name: 'glitch', svg: 'glitch.svg' },
  ]

  // Initialize fade timer on mount
  useEffect(() => {
    resetFadeTimer()
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [resetFadeTimer])

  // Initialize Emotive Engine (2D or 3D based on mode)
  useEffect(() => {
    if (modeLoading) return
    if (initializingRef.current || mascotRef.current) return

    initializingRef.current = true

    const initializeEngine = async () => {
      try {
        if (mode === '3d') {
          await initialize3DEngine()
        } else {
          await initialize2DEngine()
        }
      } catch (error) {
        console.error('[GameMain] Engine initialization failed:', error)
        initializingRef.current = false
      }
    }

    const initialize2DEngine = async () => {
      if (!canvasRef.current) return

      // Measure canvas area and calculate 2x supersampling
      const canvasArea = document.querySelector('.game-canvas-area')
      if (canvasArea && canvasRef.current) {
        const areaWidth = canvasArea.clientWidth
        const areaHeight = canvasArea.clientHeight

        // Calculate 2x supersampling dimensions
        const renderWidth = areaWidth * 2
        const renderHeight = areaHeight * 2

        // Set CSS display size to match area
        canvasRef.current.style.width = '100%'
        canvasRef.current.style.height = '100%'

        // Store render dimensions for engine initialization
        ;(canvasRef.current as any).renderSize = { width: renderWidth, height: renderHeight }
      }

      // Load the engine script dynamically with cache busting
      const existingScript = document.querySelector('script[src*="/emotive-engine.js"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `/emotive-engine.js?v=${Date.now()}`
        script.async = true
        document.head.appendChild(script)
      }

      // Wait for global to be available
      const EmotiveMascot = await waitForGlobal('EmotiveMascot')
      const EmotiveMascotClass = EmotiveMascot?.default || EmotiveMascot

      if (!EmotiveMascotClass) {
        throw new Error('EmotiveMascot not found on window object')
      }

      // Get render size from canvas element
      const { renderSize } = (canvasRef.current as any) || {}

      const mascotInstance = new EmotiveMascotClass({
        canvasId: 'emotive-canvas',
        targetFPS: 60,
        enableAudio: false,
        soundEnabled: false,
        maxParticles: 50,
        defaultEmotion: 'neutral',
        enableAutoOptimization: true,
        enableGracefulDegradation: true,
        renderingStyle: 'classic',
        enableGazeTracking: false,
        enableIdleBehaviors: true,
        renderSize, // 2x supersampling
        classicConfig: {
          coreColor: '#FFFFFF',
          coreSizeDivisor: 12,
          glowMultiplier: 2.5,
          defaultGlowColor: '#14B8A6'
        }
      })

      mascotRef.current = mascotInstance
      setMascot(mascotInstance)

      // Pass mascot reference to parent component
      if (onMascotReady) {
        onMascotReady(mascotInstance)
      }

      // Initialize the engine with canvas element
      await mascotInstance.init(canvasRef.current)

      // Start the engine
      mascotInstance.start()
      initializingRef.current = false
    }

    const initialize3DEngine = async () => {
      if (!container3DRef.current) return

      // Load the 3D engine script dynamically
      const existingScript = document.querySelector('script[src*="/emotive-engine-3d"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = `/emotive-engine-3d.js?v=${Date.now()}`
        script.async = true
        document.head.appendChild(script)
      }

      // Wait for global to be available
      const EmotiveMascot3DModule = await waitForGlobal('EmotiveMascot3D')
      const EmotiveMascot3D = EmotiveMascot3DModule?.default || EmotiveMascot3DModule

      if (!EmotiveMascot3D || typeof EmotiveMascot3D !== 'function') {
        throw new Error('EmotiveMascot3D class not found in module')
      }

      const cpuCores = navigator.hardwareConcurrency || 4
      const isMobileDevice = /Android|iPhone|iPad/i.test(navigator.userAgent)
      const isLowEnd = cpuCores <= 4 || isMobileDevice

      // Default to crystal with quartz SSS preset
      const mascotInstance = new EmotiveMascot3D({
        coreGeometry: 'crystal',
        enableParticles: true,
        enablePostProcessing: true,
        enableControls: false,
        autoRotate: true,
        autoRotateSpeed: 0.3,
        defaultEmotion: 'neutral',
        maxParticles: isLowEnd ? 100 : 200,
        targetFPS: isLowEnd ? 30 : 60,
        cameraDistance: 2.5,
        fov: 35,
        minZoom: 1.5,
        maxZoom: 4.0,
        enableBlinking: true,
        enableBreathing: true,
        enableShadows: false,
      })

      mascotInstance.init(container3DRef.current)
      await mascotInstance.start()

      // Apply default SSS preset (quartz for crystal) - must be after start() completes
      if (mascotInstance.setSSSPreset) {
        mascotInstance.setSSSPreset('quartz')
      }

      mascotRef.current = mascotInstance
      setMascot(mascotInstance)

      // Pass mascot reference to parent component
      if (onMascotReady) {
        onMascotReady(mascotInstance)
      }

      initializingRef.current = false
    }

    // Helper to wait for a global variable
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

    initializeEngine()

    // Cleanup on unmount
    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop?.()
        mascotRef.current.destroy?.()
        mascotRef.current = null
      }
      initializingRef.current = false
    }
  }, [mode, modeLoading, onMascotReady])

  // Update emotion when it changes
  useEffect(() => {
    if (mascotRef.current && currentEmotion) {
      mascotRef.current.setEmotion(currentEmotion)
    }
    resetFadeTimer() // Reset fade timer when emotion changes
  }, [currentEmotion, resetFadeTimer])

  // Update undertone when it changes
  useEffect(() => {
    if (mascotRef.current) {
      const undertoneToPass = currentUndertone === 'clear' ? null : currentUndertone
      mascotRef.current.updateUndertone(undertoneToPass)
    }
    resetFadeTimer() // Reset fade timer when undertone changes
  }, [currentUndertone, resetFadeTimer])

  // Handle window resize to prevent blurry/pixelated mascot
  useEffect(() => {
    const handleResize = () => {
      if (mascotRef.current) {
        // Canvas size is fixed by attributes, just call engine resize
        if (typeof mascotRef.current.handleResize === 'function') {
          mascotRef.current.handleResize()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle gesture from parent (not used - parent handles gestures directly)
  const handleGesture = (gesture: string) => {
    // Parent component handles gestures directly via mascot reference
    // This is just a passthrough
    onGesture(gesture)
  }

  // Handle shape change (2D: morphTo, 3D: setGeometry)
  const handleShapeChange = useCallback((shape: string) => {
    if (!mascotRef.current) return

    // If already in lunar eclipse and shape is moon, do nothing (lunar button re-clicked)
    if (isLunarEclipseActive && shape === 'moon') return

    // If already on this shape, do nothing
    if (currentShape === shape) return

    // Cancel any running lunar animations
    lunarAnimationTokenRef.current++

    if (mode === '3d') {
      // Special handling for moon - use multiplexer material and set waning crescent after morph
      if (shape === 'moon') {
        // Use smooth morphTo with materialVariant option
        if (typeof mascotRef.current.morphTo === 'function') {
          mascotRef.current.morphTo('moon', {
            materialVariant: 'multiplexer',  // Use multiplexer for seamless lunar eclipse transitions
            onMaterialSwap: (info: any) => {
              // Set waning crescent phase when material is swapped (at morph midpoint, scale=0)
              // This ensures the phase is set before the moon becomes visible
              setTimeout(() => {
                const uniforms = mascotRef.current?.core3D?.customMaterial?.uniforms
                if (uniforms?.shadowOffset?.value) {
                  // Waning crescent: { x: -1.5, y: 0.0 }
                  uniforms.shadowOffset.value.set(-1.5, 0.0)
                }
              }, 50)
            }
          })
        }
      } else {
        // Other shapes: use morphTo for smooth transitions
        // Clear multiplexer variant when morphing away from moon
        if (typeof mascotRef.current.morphTo === 'function') {
          mascotRef.current.morphTo(shape, {
            materialVariant: null  // Use default material
          })
        }
      }
    } else {
      // 2D mode: use morphTo
      if (typeof mascotRef.current.morphTo === 'function') {
        mascotRef.current.morphTo(shape)
      }
    }
    setCurrentShape(shape)
    // Clear lunar eclipse state when changing shapes
    setIsLunarEclipseActive(false)
  }, [mode, isLunarEclipseActive, currentShape])

  // Handle SSS preset change (3D only)
  const handleSSSPreset = useCallback((preset: string | null) => {
    if (!mascotRef.current || mode !== '3d') return

    if (preset && typeof mascotRef.current.setSSSPreset === 'function') {
      mascotRef.current.setSSSPreset(preset)
    }
  }, [mode])

  // Handle eclipse type change (3D only)
  const handleEclipse = useCallback((eclipseType: 'solar' | 'lunar' | null) => {
    if (!mascotRef.current || mode !== '3d') return

    // If already in lunar eclipse and clicking lunar again, do nothing
    if (eclipseType === 'lunar' && isLunarEclipseActive) return

    // Cancel any running lunar animations by incrementing the token
    lunarAnimationTokenRef.current++
    const myToken = lunarAnimationTokenRef.current

    if (eclipseType === 'solar') {
      // 50/50 chance of annular or total solar eclipse
      const isAnnular = Math.random() < 0.5
      if (typeof mascotRef.current.startSolarEclipse === 'function') {
        mascotRef.current.startSolarEclipse({ type: isAnnular ? 'annular' : 'total' })
      }
    } else if (eclipseType === 'lunar') {
      // Lunar eclipse (blood moon) - requires multiplexer material variant
      // Mark as active immediately to prevent double-clicks during transition
      setIsLunarEclipseActive(true)

      // Check if we're already on moon with multiplexer material - no need to recreate
      const existingUniforms = mascotRef.current?.core3D?.customMaterial?.uniforms
      const alreadyOnMoon = currentShape === 'moon' && existingUniforms?.eclipseShadowPos

      const startEclipseAnimation = (uniforms: any) => {
        // Initialize eclipse uniforms (shadow off to the west)
        if (uniforms.eclipseShadowPos?.value) uniforms.eclipseShadowPos.value = [-2.0, 0.0]
        if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = 0.0
        if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.0
        if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0

        // Get current phase offset (may already be at waning crescent or different phase)
        const startOffset = uniforms.shadowOffset?.value?.x ?? -1.5

        // Phase 1: Animate to full moon (400ms) - MUST complete before eclipse starts
        const phaseStartTime = performance.now()
        const animateToFull = (time: number) => {
          // Check if animation was cancelled or mascot/uniforms invalid
          if (lunarAnimationTokenRef.current !== myToken) return
          if (!mascotRef.current || !uniforms.shadowOffset?.value) return
          const phaseProgress = Math.min((time - phaseStartTime) / 400, 1.0)
          const phaseEased = phaseProgress < 0.5 ? 2 * phaseProgress * phaseProgress : 1 - Math.pow(-2 * phaseProgress + 2, 2) / 2

          uniforms.shadowOffset.value.x = startOffset + ((0 - startOffset) * phaseEased)

          if (phaseProgress < 1.0) {
            requestAnimationFrame(animateToFull)
          } else {
            // Phase 2: Now animate blood moon sweep (400ms) - only starts after full moon reached
            const eclipseStartTime = performance.now()
            const animateLunarEclipse = (currentTime: number) => {
              // Check if animation was cancelled or mascot/uniforms invalid
              if (lunarAnimationTokenRef.current !== myToken) return
              if (!mascotRef.current || !uniforms.eclipseShadowPos?.value) return
              const progress = Math.min((currentTime - eclipseStartTime) / 400, 1.0)
              const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

              uniforms.eclipseShadowPos.value[0] = -2.0 + (2.0 * eased)
              if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = eased
              if (uniforms.eclipseIntensity) uniforms.eclipseIntensity.value = eased
              if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.39 * eased
              if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 1.0 - (0.47 * eased)

              if (progress < 1.0) requestAnimationFrame(animateLunarEclipse)
            }
            requestAnimationFrame(animateLunarEclipse)
          }
        }
        requestAnimationFrame(animateToFull)
      }

      if (alreadyOnMoon) {
        // Already on moon with multiplexer - just animate the eclipse
        startEclipseAnimation(existingUniforms)
      } else {
        // Morph to moon smoothly - load directly as blood moon (no entrance animation)
        if (typeof mascotRef.current.morphTo === 'function') {
          mascotRef.current.morphTo('moon', {
            materialVariant: 'multiplexer',
            onMaterialSwap: (_info: any) => {
              // Check if animation was cancelled during morph
              if (lunarAnimationTokenRef.current !== myToken) return

              // Set blood moon state immediately (at morph midpoint when scale=0)
              setTimeout(() => {
                if (lunarAnimationTokenRef.current !== myToken) return
                const uniforms = mascotRef.current?.core3D?.customMaterial?.uniforms
                if (!uniforms) return

                // Full moon phase (blood moon covers full moon)
                if (uniforms.shadowOffset?.value) uniforms.shadowOffset.value.set(0, 0)
                // Blood moon shadow centered (totality)
                if (uniforms.eclipseShadowPos?.value) uniforms.eclipseShadowPos.value = [0.0, 0.0]
                if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = 1.0
                if (uniforms.eclipseIntensity) uniforms.eclipseIntensity.value = 1.0
                if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = 0.39
                if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = 0.53
              }, 50)
            }
          })
          setCurrentShape('moon')
        }
      }
    } else {
      // Clear eclipse - animate shadow off then transition to waning crescent
      setIsLunarEclipseActive(false)
      const uniforms = mascotRef.current.core3D?.customMaterial?.uniforms
      if (uniforms && uniforms.eclipseShadowPos && uniforms.eclipseShadowPos.value[0] > -1.5) {
        // Eclipse is active, animate it off
        const startX = uniforms.eclipseShadowPos.value[0]
        const startProgress = uniforms.eclipseProgress?.value || 1.0
        const startEmissive = uniforms.emissiveStrength?.value || 0.39
        const startDarkness = uniforms.shadowDarkness?.value || 0.53
        const startTime = performance.now()

        const animateEclipseOff = (currentTime: number) => {
          // Check if animation was cancelled or mascot/uniforms invalid
          if (lunarAnimationTokenRef.current !== myToken) return
          if (!mascotRef.current || !uniforms.eclipseShadowPos?.value) return
          const progress = Math.min((currentTime - startTime) / 400, 1.0)
          const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

          // Shadow continues east (from current position to +2.0)
          uniforms.eclipseShadowPos.value[0] = startX + ((2.0 - startX) * eased)
          if (uniforms.eclipseProgress) uniforms.eclipseProgress.value = startProgress * (1 - eased)
          if (uniforms.eclipseIntensity) uniforms.eclipseIntensity.value = startProgress * (1 - eased)
          if (uniforms.emissiveStrength) uniforms.emissiveStrength.value = startEmissive * (1 - eased)
          if (uniforms.shadowDarkness) uniforms.shadowDarkness.value = startDarkness + ((1.0 - startDarkness) * eased)

          if (progress < 1.0) {
            requestAnimationFrame(animateEclipseOff)
          } else {
            // Eclipse off complete, now animate to waning crescent
            const phaseStartTime = performance.now()
            const startOffset = uniforms.shadowOffset?.value?.x ?? 0
            const targetOffset = -1.5 // Waning crescent

            const animateToCresc = (time: number) => {
              // Check if animation was cancelled or mascot/uniforms invalid
              if (lunarAnimationTokenRef.current !== myToken) return
              if (!mascotRef.current || !uniforms.shadowOffset?.value) return
              const phaseProgress = Math.min((time - phaseStartTime) / 400, 1.0)
              const phaseEased = phaseProgress < 0.5 ? 2 * phaseProgress * phaseProgress : 1 - Math.pow(-2 * phaseProgress + 2, 2) / 2

              uniforms.shadowOffset.value.x = startOffset + ((targetOffset - startOffset) * phaseEased)

              if (phaseProgress < 1.0) {
                requestAnimationFrame(animateToCresc)
              }
            }
            requestAnimationFrame(animateToCresc)
          }
        }
        requestAnimationFrame(animateEclipseOff)
      } else if (mascotRef.current && typeof mascotRef.current.stopEclipse === 'function') {
        try {
          mascotRef.current.stopEclipse()
        } catch (e) {
          // Mascot may have been destroyed
        }
      }
    }
  }, [mode, isLunarEclipseActive, currentShape])

  // Don't render until mode is determined
  if (modeLoading) {
    return (
      <div className="canvas-container" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="game-canvas-area">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#667eea' }}>
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas-container" style={{
      transform: 'translateZ(0)',
      willChange: 'transform',
    }}>
      <div className="game-canvas-area">
        {/* 2D Engine Canvas */}
        {mode === '2d' && (
          <canvas ref={canvasRef} id="emotive-canvas"></canvas>
        )}

        {/* 3D Engine Container */}
        {mode === '3d' && (
          <div
            ref={container3DRef}
            id="emotive-3d-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Shape selector bars positioned within canvas area */}
        <ShapeSelectorBar
          onShapeChange={handleShapeChange}
          currentShape={currentShape}
          mode={mode}
          onSSSPreset={handleSSSPreset}
          onEclipse={handleEclipse}
        />

        {/* Performance Monitoring */}
        <div id="fps-counter" className="fps-display">
          <span className="fps-value">60</span> FPS
        </div>

        {/* Mode Toggle Button */}
        {hasWebGL && (
          <button
            onClick={toggleMode}
            className="mode-toggle-button"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: mode === '3d' ? 'rgba(102,126,234,0.7)' : 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102,126,234,0.8)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = mode === '3d' ? 'rgba(102,126,234,0.7)' : 'rgba(0,0,0,0.5)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {mode === '3d' ? '3D' : '2D'}
          </button>
        )}

        {/* State columns inside animation frame */}
        <div className="state-column state-column-left">
          {leftEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="state-column state-column-right">
          {rightEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="text-center">
              {/* Placeholder removed - engine will render the mascot */}
        </div>

        {/* Status indicators inside animation frame */}
        <div
          className={`status-text emotion ${showStatusIndicators ? 'fade-in' : 'fade-out'}`}
          data-state={currentEmotion}
          onMouseEnter={handleStatusHover}
          onMouseLeave={handleStatusLeave}
        >
          {currentEmotion}
        </div>
        <div
          className={`status-text stability ${showStatusIndicators ? 'fade-in' : 'fade-out'}`}
          data-undertone={currentUndertone}
          onMouseEnter={handleStatusHover}
          onMouseLeave={handleStatusLeave}
        >
          {getUndertoneLabel(currentUndertone)}
        </div>
      </div>
    </div>
  )
}



