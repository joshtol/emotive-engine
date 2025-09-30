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
  const [currentUndertone, setCurrentUndertone] = useState('clear')
  const [mascot, setMascot] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [tutorialStarted, setTutorialStarted] = useState(false)
  const [flashMusicButton, setFlashMusicButton] = useState(false)

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
      'charles': 'charleston'
      // Chain combos are handled separately below - no mapping needed
    }
    
    // Use mapped name if available, otherwise use original
    const actualGestureName = gestureMapping[gesture.toLowerCase()] || gesture.toLowerCase()
    
    // Trigger gesture on the engine if mascot is available
    if (mascot) {
      try {
        // Check if this is a chain combo (should use chain method)
        const chainCombos = ['rise', 'flow', 'burst', 'drift', 'chaos', 'morph', 'rhythm', 'spiral', 'routine', 'radiance', 'twinkle', 'stream']
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

  const handleUndertoneChange = useCallback((undertone: string | null) => {
    setCurrentUndertone(undertone || 'clear')
  }, [])

  // Tutorial effect - runs once when mascot is ready
  useEffect(() => {
    if (mascot && !tutorialStarted) {
      setTutorialStarted(true)
      
      setTimeout(() => {
        try {
          // Trigger hula and sparkle gestures
          mascot.express('hula')
          mascot.express('sparkle')
          
          // Start tutorial messages
          addMessage('info', 'Welcome to the Emotive Engine! 🎭', 4000)
          
          setTimeout(() => {
            addMessage('info', 'Try the emotion buttons and gesture controls!', 4000)
          }, 2000)
          
          setTimeout(() => {
            addMessage('info', '🎵 Check out the music demos in the system bar!', 4000)
            // Flash the music button
            console.log('🎵 Setting flashMusicButton to true')
            setFlashMusicButton(true)
            setTimeout(() => {
              console.log('🎵 Setting flashMusicButton to false')
              setFlashMusicButton(false)
            }, 3000)
          }, 4000)
          
          console.log('✨ Tutorial sequence started')
        } catch (error) {
          console.error('❌ Error starting tutorial:', error)
        }
      }, 1000) // Delay to ensure mascot is fully ready
    }
  }, [mascot, tutorialStarted, addMessage])

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
        flashMusicButton={flashMusicButton}
      />
      <div className="emotive-main">
        <div className="gesture-menus-wrapper">
          <GameSidebar onGesture={handleGesture} isPlaying={isPlaying} currentUndertone={currentUndertone} onUndertoneChange={handleUndertoneChange} />
          <GameControls onGesture={handleGesture} />
        </div>
        <GameMain engine={null} score={0} combo={0} currentUndertone={currentUndertone} onGesture={handleGesture} onMascotReady={handleMascotReady} />
      </div>
      <EmotiveFooter />
    </div>
  )
}


