'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ShapeSelectorBar from './ShapeSelectorBar'

interface GameMainProps {
  engine: any
  score: number
  combo: number
  currentUndertone: string
  onGesture: (gesture: string) => void
  onMascotReady?: (mascot: any) => void
}

export default function GameMain({ engine, score, combo, currentUndertone, onGesture, onMascotReady }: GameMainProps) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [currentShape, setCurrentShape] = useState('circle')
  const [mascot, setMascot] = useState<any>(null) // Added state for mascot
  const [showStatusIndicators, setShowStatusIndicators] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
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

  // Initialize Emotive Engine
  useEffect(() => {
    const initializeEngine = async () => {
      if (!canvasRef.current) return

      try {
        console.log('[GameMain] Starting engine initialization...')

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
        const script = document.createElement('script')
        script.src = `/emotive-engine.js?v=${Date.now()}`
        script.async = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
        
        // Access the global EmotiveMascot (UMD export with mixed exports uses .default)
        const EmotiveMascot = (window as any).EmotiveMascot?.default || (window as any).EmotiveMascot

        if (!EmotiveMascot) {
          console.error('EmotiveMascot not found on window object')
          throw new Error('EmotiveMascot not found on window object')
        }
        
        // Get render size from canvas element
        const {renderSize} = (canvasRef.current as any)
        
        const mascot = new EmotiveMascot({
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

        console.log('[GameMain] Mascot instance created')
        mascotRef.current = mascot
        setMascot(mascot) // Set mascot state

        // Pass mascot reference to parent component
        if (onMascotReady) {
          onMascotReady(mascot)
        }

        // Initialize the engine with canvas element
        await mascot.init(canvasRef.current)
        console.log('[GameMain] Mascot initialized with canvas')

        // Start the engine
        mascot.start()
        console.log('[GameMain] Engine started')

      } catch (error) {
        console.error('[GameMain] Engine initialization failed:', error)
      }
    }

    initializeEngine()

    // Cleanup on unmount
    return () => {
      if (mascotRef.current) {
        mascotRef.current.stop()
        mascotRef.current = null
      }
    }
  }, [])

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

  // Handle shape change
  const handleShapeChange = useCallback((shape: string) => {
    if (mascotRef.current && typeof mascotRef.current.morphTo === 'function') {
      mascotRef.current.morphTo(shape)
      setCurrentShape(shape)
      // Debug: Shape changed
    }
  }, [])

  return (
    <div className="canvas-container">
      <div className="game-canvas-area">
        {/* Engine Canvas - Ready for particle system */}
        <canvas ref={canvasRef} id="emotive-canvas"></canvas>
        
        {/* Shape selector bars positioned within canvas area */}
        <ShapeSelectorBar onShapeChange={handleShapeChange} currentShape={currentShape} />
        
        {/* Performance Monitoring */}
        <div id="fps-counter" className="fps-display">
          <span className="fps-value">60</span> FPS
        </div>
        
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


