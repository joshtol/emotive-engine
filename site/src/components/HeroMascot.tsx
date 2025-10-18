'use client'

import { useEffect } from 'react'
import { useHeroMascotController } from './hooks/useHeroMascotController'

interface HeroMascotProps {
  onMascotReady?: (mascot: any) => void
}

export default function HeroMascot({ onMascotReady }: HeroMascotProps) {
  const { canvasRef, mascot, status, error } = useHeroMascotController({
    canvasId: 'hero-mascot-canvas',
    autoStart: true,
    renderHeightMultiplier: 3,
    onReady: ({ mascot }) => {
      // Simple top-right positioning
      if (mascot?.setOffset) {
        mascot.setOffset(200, -100, 0)
      }

      // Disable gaze tracking to prevent movement
      mascot?.setGazeTracking?.(false)

      onMascotReady?.(mascot)
    },
    onError: (err) => {
      console.error('Failed to initialize hero mascot:', err)
    },
  })

  useEffect(() => {
    if (status === 'error' && error) {
      console.error('Hero mascot error:', error)
    }
  }, [status, error])

  return (
    <div className="full-vp-mascot-area">
      <canvas
        ref={canvasRef}
        id="hero-mascot-canvas"
        className="full-vp-mascot-canvas"
      />
    </div>
  )
}
