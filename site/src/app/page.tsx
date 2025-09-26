'use client'

import { useState, useEffect, useCallback } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import GameSidebar from '@/components/GameSidebar'
import GameMain from '@/components/GameMain'
import GameControls from '@/components/GameControls'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUndertone, setCurrentUndertone] = useState('none')
  const [mascot, setMascot] = useState<any>(null)

  const handleGesture = useCallback((gesture: string) => {
    // Debug: Gesture triggered
    
    // Map button display names to actual gesture names
    const gestureMapping: { [key: string]: string } = {
      'headbob': 'headBob',
      'runman': 'runningman', 
      'charles': 'charleston'
    }
    
    // Use mapped name if available, otherwise use original
    const actualGestureName = gestureMapping[gesture.toLowerCase()] || gesture.toLowerCase()
    
    // Trigger gesture on the engine if mascot is available
    if (mascot) {
      try {
        mascot.express(actualGestureName)
        // Debug: Gesture executed
      } catch (error) {
        console.error(`Failed to trigger gesture ${actualGestureName}:`, error)
      }
    } else {
      console.warn('Mascot not ready, gesture not triggered:', actualGestureName)
    }
    
    setIsPlaying(true)
  }, [mascot])

  const handleMascotReady = useCallback((mascotInstance: any) => {
    setMascot(mascotInstance)
    // Debug: Mascot ready
  }, [])

  const handleUndertoneChange = useCallback((undertone: string) => {
    setCurrentUndertone(undertone)
  }, [])

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div className="emotive-main">
        <GameSidebar onGesture={handleGesture} isPlaying={isPlaying} currentUndertone={currentUndertone} onUndertoneChange={handleUndertoneChange} />
        <GameMain engine={null} score={0} combo={0} currentUndertone={currentUndertone} onGesture={handleGesture} onMascotReady={handleMascotReady} />
        <GameControls onGesture={handleGesture} />
      </div>
      <EmotiveFooter />
    </div>
  )
}


