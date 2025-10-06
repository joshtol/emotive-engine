'use client'

import { useEffect, useRef, useCallback } from 'react'

interface HeroMascotProps {
  onMascotReady?: (mascot: any) => void
}

export default function HeroMascot({ onMascotReady }: HeroMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<any>(null)
  const canvasId = 'hero-mascot-canvas'

  // Function to calculate mascot radius for center-based positioning
  const calculateMascotRadius = useCallback(() => {
    // Use mobile viewport as baseline (iPhone 12 Pro: 390x844)
    const mobileWidth = 390
    const mobileHeight = 844
    const mobileViewport = Math.min(mobileWidth, mobileHeight) // 390

    // Calculate responsive scale factor based on current viewport
    const currentViewport = Math.min(window.innerWidth, window.innerHeight)
    const scaleFactor = currentViewport / mobileViewport

    // Apply additional scaling for desktop (larger screens)
    const isDesktop = window.innerWidth > 1024
    const desktopMultiplier = isDesktop ? 1.5 : 1

    // Base radius calculation (using mobile as reference)
    const baseRadius = (mobileViewport / 12) * scaleFactor * desktopMultiplier // coreSizeDivisor = 12
    const glowRadius = baseRadius * 2.5 // glowMultiplier = 2.5

    return glowRadius
  }, [])

  // Function to update mascot position based on .full-vp-mascot-area
  const updateMascotPosition = useCallback(() => {
    if (mascotRef.current && typeof mascotRef.current.setOffset === 'function') {
      const mascotRadius = calculateMascotRadius()

      // Get the correct mascot area dimensions
      const isParallaxPage = window.location.pathname === '/parallax'
      const mascotAreaSelector = isParallaxPage ? '.full-doc-mascot-area' : '.full-vp-mascot-area'
      const mascotArea = document.querySelector(mascotAreaSelector)
      if (!mascotArea) {
        console.warn('Mascot area not found, using viewport dimensions')
        // Fallback to viewport dimensions - center the mascot
        const newOffsetX = window.innerWidth * 0.5 - mascotRadius
        const newOffsetY = window.innerHeight * 0.5 - mascotRadius
        mascotRef.current.setOffset(newOffsetX, newOffsetY, 0)
        return
      }
      
      const areaRect = mascotArea.getBoundingClientRect()
      console.log('Mascot area dimensions:', areaRect.width, 'x', areaRect.height)
      console.log('Mascot radius:', mascotRadius)
      console.log('Viewport dimensions:', window.innerWidth, 'x', window.innerHeight)
      
        // Position mascot in center of viewport for visibility
        // Use simple center positioning
        const newOffsetX = window.innerWidth * 0.5 - mascotRadius
        const newOffsetY = window.innerHeight * 0.5 - mascotRadius
      
      console.log('Calculated center position:', newOffsetX, newOffsetY)
      console.log('Canvas element exists:', !!canvasRef.current)
      console.log('Mascot instance exists:', !!mascotRef.current)
      console.log('setOffset method exists:', typeof mascotRef.current?.setOffset === 'function')
      
      if (mascotRef.current && typeof mascotRef.current.setOffset === 'function') {
        mascotRef.current.setOffset(newOffsetX, newOffsetY, 0)
        console.log('Successfully called setOffset')
        
        // Check if mascot is actually positioned
        setTimeout(() => {
          console.log('Mascot position after setOffset:', mascotRef.current?.getPosition?.())
        }, 100)
      } else {
        console.error('Cannot call setOffset - mascot or method not available')
      }
    }
  }, [calculateMascotRadius])

  // Function to update mascot render size
  const updateMascotSize = useCallback(() => {
    if (mascotRef.current) {
      // Use larger height for homepage, normal height for other pages
      const isHomepage = window.location.pathname === '/' || window.location.pathname === '/use-cases'
      const canvasHeight = isHomepage ? window.innerHeight * 3 : window.innerHeight
      
      // Update the mascot's render size configuration
      if (mascotRef.current.canvasManager && typeof mascotRef.current.canvasManager.setRenderSize === 'function') {
        mascotRef.current.canvasManager.setRenderSize(window.innerWidth, canvasHeight)
      }
      
      // Call handleResize to trigger visual resampling with 2x scale
      if (typeof mascotRef.current.handleResize === 'function') {
        mascotRef.current.handleResize(window.innerWidth, canvasHeight, 2)
      }
    }
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Update canvas size first
      if (canvasRef.current) {
        const canvas = canvasRef.current
        
        // Use larger height for homepage, normal height for other pages
        const isHomepage = window.location.pathname === '/' || window.location.pathname === '/use-cases'
        const canvasHeight = isHomepage ? window.innerHeight * 3 : window.innerHeight
        
        // Set display size to viewport
        canvas.style.width = window.innerWidth + 'px'
        canvas.style.height = window.innerHeight + 'px'
        
        // Set buffer size to 2x scale for crisp rendering, but use larger height for homepage
        canvas.width = window.innerWidth * 2
        canvas.height = canvasHeight * 2
        
        // Scale the drawing context for crisp rendering
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(2, 2)
        }
      }
      
      // Then update mascot position and size with a small delay
      setTimeout(() => {
        updateMascotPosition()
        updateMascotSize()
      }, 50)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateMascotPosition, updateMascotSize])

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

        // Calculate initial mascot radius for center-based positioning
        // Use mobile viewport as baseline (iPhone 12 Pro: 390x844)
        const mobileWidth = 390
        const mobileHeight = 844
        const mobileViewport = Math.min(mobileWidth, mobileHeight) // 390
        
        // Calculate responsive scale factor based on current viewport
        const currentViewport = Math.min(window.innerWidth, window.innerHeight)
        const scaleFactor = currentViewport / mobileViewport
        
        // Apply additional scaling for desktop (larger screens)
        const isDesktop = window.innerWidth > 1024
        const desktopMultiplier = isDesktop ? 1.5 : 1
        
        // Base radius calculation (using mobile as reference)
        const baseRadius = (mobileViewport / 12) * scaleFactor * desktopMultiplier // coreSizeDivisor = 12
        const mascotRadius = baseRadius * 2.5 // glowMultiplier = 2.5

        // Get mascot area dimensions for render size
        const isParallaxPage = window.location.pathname === '/parallax'
        const mascotAreaSelector = isParallaxPage ? '.full-doc-mascot-area' : '.full-vp-mascot-area'
        const mascotArea = document.querySelector(mascotAreaSelector)
        let areaWidth = window.innerWidth
        let areaHeight = window.innerHeight
        
        if (mascotArea) {
          const areaRect = mascotArea.getBoundingClientRect()
          areaWidth = areaRect.width
          areaHeight = areaRect.height
        }

        // Use much larger canvas for homepage to allow particles to flow
        const isHomepage = window.location.pathname === '/' || window.location.pathname === '/use-cases'
        const canvasHeight = isHomepage ? window.innerHeight * 3 : window.innerHeight

        // Set up canvas size before creating mascot
        if (canvasRef.current) {
          const canvas = canvasRef.current
          
          // Set display size to viewport
          canvas.style.width = window.innerWidth + 'px'
          canvas.style.height = window.innerHeight + 'px'
          
          // Set buffer size to 2x scale for crisp rendering, but use larger height for homepage
          canvas.width = window.innerWidth * 2
          canvas.height = canvasHeight * 2
          
          // Scale the drawing context for crisp rendering
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.scale(2, 2)
          }
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
          renderSize: { width: window.innerWidth, height: window.innerHeight }, // Keep viewport size for rendering
          offsetX: window.innerWidth * 0.8 - mascotRadius, // Position in top right area
          offsetY: window.innerHeight * 0.2 - mascotRadius, // Position near top
          offsetZ: 0, // No Z offset initially
          classicConfig: {
            coreColor: '#FFFFFF',
            coreSizeDivisor: 12,
            glowMultiplier: 2.5,
            defaultGlowColor: '#14B8A6',
            enableGazeTracking: false
          }
        })

        mascotRef.current = mascot
        console.log('🎭 Mascot created successfully:', !!mascot)
        console.log('🎯 PositionController available:', !!mascot.positionController)
        
        // Detailed initial position tracking
        const initialPos = mascot.getPosition?.()
        console.log('📍 INITIAL POSITION:', {
          position: initialPos,
          offsetCalculated: `${window.innerWidth * 0.5 - mascotRadius}, ${window.innerHeight * 0.5 - mascotRadius}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          mascotRadius
        })
        onMascotReady?.(mascot)


        // Start animation sequence
        setTimeout(() => {
          // Try to manually start the mascot
          if (typeof mascot.start === 'function') {
            console.log('Starting mascot animation')
            mascot.start()
          } else {
            console.warn('Mascot start method not available')
          }
          
          // Set initial state - prevent movement until Element Targeting takes over
          mascot.setEmotion('neutral')
          
          // Ensure mascot starts in circle shape (not star)
          if (typeof mascot.morphTo === 'function') {
            mascot.morphTo('circle')
          }
          
          // Prevent mascot from moving initially - position stays static
          if (typeof mascot.animateOffset === 'function') {
            // Lock position in top right area - mascot stays put
            mascot.setOffset(window.innerWidth * 0.8 - mascotRadius, window.innerHeight * 0.2 - mascotRadius, 0)
            console.log('🔒 POSITION LOCKED:', {
              lockedAt: mascot.getPosition?.(),
              reason: 'Mascot positioned in top right - no movement'
            })
          }
          
        // Disable gaze tracking to test particle center fix
        if (typeof mascot.setGazeTracking === 'function') {
          mascot.setGazeTracking(false)
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
