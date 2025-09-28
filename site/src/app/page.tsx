'use client'

import { useState, useEffect, useCallback } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import GameSidebar from '@/components/GameSidebar'
import GameMain from '@/components/GameMain'
import GameControls from '@/components/GameControls'
import EmotiveFooter from '@/components/EmotiveFooter'
import MessageHUD from '@/components/MessageHUD'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUndertone, setCurrentUndertone] = useState('none')
  const [mascot, setMascot] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])

  const addMessage = useCallback((type: string, content: string, duration = 3000) => {
    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, type, content, duration, dismissible: true }])
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const handleGesture = useCallback((gesture: string) => {
    // Debug: Gesture triggered
    
    // Map button display names to actual gesture names
    const gestureMapping: { [key: string]: string } = {
      'headbob': 'headBob',
      'runman': 'runningman', 
      'charles': 'charleston',
      // Chain combo mappings
      'rise': 'expand',
      'flow': 'wave',
      'burst': 'burst',
      'drift': 'drift',
      'chaos': 'shake',
      'morph': 'morph',
      'pulse': 'pulse',
      'swirl': 'orbital',
      'dance': 'groove',
      'glow': 'glow',
      'spark': 'sparkle',
      'wave': 'wave'
    }
    
    // Use mapped name if available, otherwise use original
    const actualGestureName = gestureMapping[gesture.toLowerCase()] || gesture.toLowerCase()
    
    // Trigger gesture on the engine if mascot is available
    if (mascot) {
      try {
        // Check if this is a chain combo (should use chain method)
        const chainCombos = ['rise', 'flow', 'burst', 'drift', 'chaos', 'morph', 'rhythm', 'spiral', 'routine', 'radiance', 'shimmer', 'current']
        if (chainCombos.includes(gesture.toLowerCase())) {
          // Execute as chain combo
          mascot.chain(gesture.toLowerCase())
        } else {
          // Execute as regular gesture
          mascot.express(actualGestureName)
        }
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
  }, [])

  const handleUndertoneChange = useCallback((undertone: string) => {
    setCurrentUndertone(undertone)
  }, [])

  return (
    <div className="emotive-container">
      <MessageHUD messages={messages} onMessageDismiss={removeMessage} />
      <EmotiveHeader 
        mascot={mascot}
        currentShape="circle"
        onAudioLoad={(audioElement) => {
          console.log('Audio loaded:', audioElement)
        }}
        onPlayStateChange={(isPlaying) => {
          console.log('Play state changed:', isPlaying)
        }}
        onMessage={addMessage}
      />
      <div className="emotive-main">
        <GameSidebar onGesture={handleGesture} isPlaying={isPlaying} currentUndertone={currentUndertone} onUndertoneChange={handleUndertoneChange} />
        <GameMain engine={null} score={0} combo={0} currentUndertone={currentUndertone} onGesture={handleGesture} onMascotReady={handleMascotReady} />
        <GameControls onGesture={handleGesture} />
      </div>
      <EmotiveFooter />
    </div>
  )
}


