'use client'

import { useState, useEffect } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import GameSidebar from '@/components/GameSidebar'
import GameMain from '@/components/GameMain'
import GameControls from '@/components/GameControls'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUndertone, setCurrentUndertone] = useState('none')

  const handleGesture = (gesture: string) => {
    // placeholder for engine hook
    console.log('gesture', gesture)
    setIsPlaying(true)
  }

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div className="emotive-main">
        <GameSidebar onGesture={handleGesture} isPlaying={isPlaying} currentUndertone={currentUndertone} onUndertoneChange={setCurrentUndertone} />
        <GameMain engine={null} score={0} combo={0} currentUndertone={currentUndertone} onGesture={handleGesture} />
        <GameControls onGesture={handleGesture} />
      </div>
      <EmotiveFooter />
    </div>
  )
}


