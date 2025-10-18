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
  const [activeGestures, setActiveGestures] = useState<Set<string>>(new Set())

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
          
          // Highlight the combo button itself
          setActiveGestures(prev => new Set([...Array.from(prev), gesture.toUpperCase()]))
          setTimeout(() => {
            setActiveGestures(prev => {
              const newSet = new Set(prev)
              newSet.delete(gesture.toUpperCase())
              return newSet
            })
          }, 2000) // Highlight combo button for 2 seconds
          
          // Parse chain combo to highlight individual gestures
          const chainDefinitions: { [key: string]: string } = {
            'rise': 'breathe > sway+lean+tilt',
            'flow': 'sway > lean+tilt > spin > bounce',
            'burst': 'jump > nod > shake > flash',
            'drift': 'sway+breathe+float+drift',
            'chaos': 'shake+shake > spin+flash > bounce+pulse > twist+sparkle',
            'morph': 'expand > contract > morph+glow > expand+flash',
            'rhythm': 'pulse > pulse+sparkle > pulse+flicker',
            'spiral': 'spin > orbital > twist > orbital+sparkle',
            'routine': 'nod > bounce > spin+sparkle > sway+pulse > nod+flash',
            'radiance': 'sparkle > pulse+flicker > shimmer',
            'twinkle': 'sparkle > flash > pulse+sparkle > shimmer+flicker',
            'stream': 'wave > nod+pulse > sparkle > flash'
          }
          
          const chainDefinition = chainDefinitions[gesture.toLowerCase()]
          if (chainDefinition) {
            // Check if this is a simultaneous combo (no '>' separator)
            if (!chainDefinition.includes('>')) {
              // All gestures fire simultaneously (like DRIFT: sway+breathe+float+drift)
              const simultaneousGestures = chainDefinition
                .split('+')
                .map(g => g.trim())
                .filter(g => g.length > 0)
              
              // Highlight all gestures simultaneously in BLUE (combo style)
              setTimeout(() => {
                simultaneousGestures.forEach(gestureName => {
                  setActiveGestures(prev => new Set([...Array.from(prev), `${gestureName.toUpperCase()}_COMBO`]))
                })
                
                // Remove all gestures after 1 second
                setTimeout(() => {
                  setActiveGestures(prev => {
                    const newSet = new Set(prev)
                    simultaneousGestures.forEach(gestureName => {
                      newSet.delete(`${gestureName.toUpperCase()}_COMBO`)
                    })
                    return newSet
                  })
                }, 1000) // Highlight for 1 second
              }, 500) // Start after combo button highlight
            } else {
              // Sequential combo with groups (like CHAOS: shake+shake > spin+flash > bounce+pulse > twist+sparkle)
              const gestureGroups = chainDefinition
                .split('>')
                .map(group => group.trim())
                .filter(group => group.length > 0)
              
              // Highlight each gesture group in sequence
              gestureGroups.forEach((group, groupIndex) => {
                // Split simultaneous gestures (separated by +)
                const simultaneousGestures = group
                  .split('+')
                  .map(g => g.trim())
                  .filter(g => g.length > 0)
                
                // If only one gesture, highlight in ORANGE (individual)
                // If multiple gestures, highlight in BLUE (combo)
                const isCombo = simultaneousGestures.length > 1
                const suffix = isCombo ? '_COMBO' : ''
                
                // Highlight all gestures in this group simultaneously
                setTimeout(() => {
                  simultaneousGestures.forEach(gestureName => {
                    setActiveGestures(prev => new Set([...Array.from(prev), `${gestureName.toUpperCase()}${suffix}`]))
                  })
                  
                  // Remove all gestures in this group after 1 second
                  setTimeout(() => {
                    setActiveGestures(prev => {
                      const newSet = new Set(prev)
                      simultaneousGestures.forEach(gestureName => {
                        newSet.delete(`${gestureName.toUpperCase()}${suffix}`)
                      })
                      return newSet
                    })
                  }, 1000) // Highlight for 1 second
                }, (groupIndex + 1) * 500) // Stagger groups by 500ms, start after combo button highlight
              })
            }
          }
        } else {
          // Execute as regular gesture
          mascot.express(actualGestureName)
          
          // Highlight the individual gesture
          setActiveGestures(prev => new Set([...Array.from(prev), gesture.toUpperCase()]))
          setTimeout(() => {
            setActiveGestures(prev => {
              const newSet = new Set(prev)
              newSet.delete(gesture.toUpperCase())
              return newSet
            })
          }, 1000) // Highlight for 1 second
        }
      } catch (error) {
        // Gesture failed to trigger
      }
    } else {
      // Mascot not ready
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
          // Welcome message with music demo prompt
          addMessage('info', '🎵 Hit the music note up top to see the mascot react in real time!', 5000)
        } catch (error) {
          // Tutorial failed to start
        }
      }, 1000) // Delay to ensure mascot is fully ready
    }
  }, [mascot, tutorialStarted, addMessage])

  return (
    <div className="emotive-container">
      <MessageHUD messages={messages} onMessageDismiss={removeMessage} />
      <EmotiveHeader
        showMusicControls={true}
        mascot={mascot}
        onMessage={addMessage}
      />
      <div className="emotive-main">
        <div className="gesture-menus-wrapper">
          <GameSidebar onGesture={handleGesture} isPlaying={isPlaying} currentUndertone={currentUndertone} onUndertoneChange={handleUndertoneChange} activeGestures={activeGestures} />
          <GameControls onGesture={handleGesture} activeGestures={activeGestures} />
        </div>
        <GameMain engine={null} score={0} combo={0} currentUndertone={currentUndertone} onGesture={handleGesture} onMascotReady={handleMascotReady} />
      </div>
      <EmotiveFooter />
    </div>
  )
}


