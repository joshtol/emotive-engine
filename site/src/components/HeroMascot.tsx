'use client'

import { useEffect, useRef, useCallback } from 'react'

interface HeroMascotProps {
  onMascotReady?: (mascot: any) => void
}

export default function HeroMascot({ onMascotReady }: HeroMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const canvasId = 'hero-mascot-canvas'

  useEffect(() => {
    const initializeMascot = async () => {
      if (!canvasRef.current) return

      try {
        // Check if script is already loaded
        let EmotiveMascot = (window as any).EmotiveMascot
        
        if (!EmotiveMascot) {
          // Load the engine script dynamically
          const script = document.createElement('script')
          script.src = '/emotive-engine.js'
          script.async = true

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })

          EmotiveMascot = (window as any).EmotiveMascot
        }

        if (!EmotiveMascot) {
          throw new Error('EmotiveMascot not found on window object')
        }

        // Create mascot instance with full viewport render size
        const mascot = new EmotiveMascot({
          canvasId: canvasId,
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
          renderSize: { width: window.innerWidth, height: window.innerHeight }, // Full viewport
          offsetX: window.innerWidth * 0.33, // 33% from right
          offsetY: window.innerHeight * 0.33, // 33% from top
          offsetZ: 0, // No Z offset initially
          classicConfig: {
            coreColor: '#FFFFFF',
            coreSizeDivisor: 12,
            glowMultiplier: 2.5,
            defaultGlowColor: '#14B8A6'
          }
        })

        mascotRef.current = mascot
        onMascotReady?.(mascot)


        // Start animation sequence
        setTimeout(() => {
          // Try to manually start the mascot
          if (typeof mascot.start === 'function') {
            mascot.start()
          }
          
          // Set initial state
          mascot.setEmotion('neutral')
          
          // Set shape using the correct method
          if (typeof mascot.morphTo === 'function') {
            mascot.morphTo('circle')
          }
          
          setTimeout(() => {
            mascot.express('breathe')
            
            setTimeout(() => {
              mascot.express('sparkle')
            }, 2000)
          }, 1000)
        }, 500)

      } catch (error) {
        console.error('Failed to initialize hero mascot:', error)
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMascot, 100)
    return () => clearTimeout(timer)
  }, [onMascotReady])

  return (
    <div className="full-vp-mascot-area">
      <canvas 
        ref={canvasRef} 
        id={canvasId}
        className="full-vp-mascot-canvas"
      />
    </div>
  )
}
