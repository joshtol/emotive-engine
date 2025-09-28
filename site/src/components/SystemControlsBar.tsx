'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface SystemControlsBarProps {
  mascot?: any
  currentShape?: string
  onAudioLoad?: (audioElement: HTMLAudioElement) => void
  onPlayStateChange?: (isPlaying: boolean) => void
  onMessage?: (type: string, content: string, duration?: number) => void
}

export default function SystemControlsBar({ mascot, currentShape, onAudioLoad, onPlayStateChange, onMessage }: SystemControlsBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isBlinkingEnabled, setIsBlinkingEnabled] = useState(true)
  const [isGazeTrackingEnabled, setIsGazeTrackingEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const icons = ['music','eye','eyes','random','record']

  // Toggle menu with animation
  const toggleMenu = useCallback(() => {
    console.log('🎛️ Toggling menu:', !isMenuExpanded)
    setIsMenuExpanded(!isMenuExpanded)
  }, [isMenuExpanded])

  // Toggle mascot blinking
  const toggleBlinking = useCallback(() => {
    if (!mascot) {
      console.log('⚠️ No mascot available for blinking toggle')
      onMessage?.('warning', 'Mascot not ready', 3000)
      return
    }
    
    const newBlinkingState = !isBlinkingEnabled
    setIsBlinkingEnabled(newBlinkingState)
    
    try {
      if (mascot.renderer && mascot.renderer.setBlinkingEnabled) {
        mascot.renderer.setBlinkingEnabled(newBlinkingState)
        console.log(`👁️ Blinking ${newBlinkingState ? 'enabled' : 'disabled'}`)
        onMessage?.('info', `Blinking ${newBlinkingState ? 'enabled' : 'disabled'}`, 2000)
      } else {
        console.log('⚠️ Mascot renderer does not support blinking control')
        onMessage?.('warning', 'Blinking control not available', 3000)
      }
    } catch (error) {
      console.error('❌ Error toggling blinking:', error)
      onMessage?.('error', 'Failed to toggle blinking', 4000)
    }
  }, [mascot, isBlinkingEnabled, onMessage])

  // Toggle gaze tracking
  const toggleGazeTracking = useCallback(() => {
    if (!mascot) {
      console.log('⚠️ No mascot available for gaze tracking toggle')
      onMessage?.('warning', 'Mascot not ready', 3000)
      return
    }
    
    const newGazeState = !isGazeTrackingEnabled
    setIsGazeTrackingEnabled(newGazeState)
    
    try {
      if (mascot.setGazeTracking) {
        mascot.setGazeTracking(newGazeState)
        console.log(`👀 Gaze tracking ${newGazeState ? 'enabled' : 'disabled'}`)
        onMessage?.('info', `Gaze tracking ${newGazeState ? 'enabled' : 'disabled'}`, 2000)
      } else {
        console.log('⚠️ Mascot does not support gaze tracking control')
        onMessage?.('warning', 'Gaze tracking not available', 3000)
      }
    } catch (error) {
      console.error('❌ Error toggling gaze tracking:', error)
      onMessage?.('error', 'Failed to toggle gaze tracking', 4000)
    }
  }, [mascot, isGazeTrackingEnabled, onMessage])

  // Random selection arrays
  const availableEmotions = [
    'neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 
    'love', 'suspicion', 'excited', 'resting', 'euphoria', 'focused', 'glitch', 'calm'
  ]
  
  const availableGestures = [
    'bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt', 'expand', 'contract', 
    'flash', 'drift', 'stretch', 'glow', 'flicker', 'vibrate', 'orbital', 
    'hula', 'wave', 'breathe', 'morph', 'slowBlink', 'look', 'settle', 
    'breathIn', 'breathOut', 'breathHold', 'breathHoldEmpty', 'jump', 'sway', 
    'float', 'runningman', 'charleston', 'sparkle', 'shimmer', 
    'wiggle', 'groove', 'point', 'lean', 'reach', 'headBob', 'orbit', 'twist'
  ]
  
  const availableShapes = [
    'circle', 'heart', 'star', 'sun', 'moon', 'lunar', 
    'square', 'triangle', 'solar'
  ]

  // Random selection function
  const triggerRandomCombo = useCallback(() => {
    if (!mascot) {
      console.log('⚠️ No mascot available for random combo')
      return
    }
    
    try {
      // Select random emotion, gesture, and shape
      const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)]
      const randomGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)]
      const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
      
      console.log(`🎲 Random combo: ${randomEmotion} + ${randomGesture} + ${randomShape}`)
      
      // Apply the random selections
      mascot.setEmotion(randomEmotion)
      mascot.express(randomGesture)
      mascot.morphTo(randomShape)
      
      console.log('✨ Random combo applied successfully!')
    } catch (error) {
      console.error('❌ Error applying random combo:', error)
    }
  }, [mascot])

  // Connect audio to mascot for audio-reactive effects
  const connectAudioToMascot = useCallback(async (audioElement: HTMLAudioElement) => {
    if (mascot && audioElement) {
      try {
        console.log('🎵 Attempting to connect audio to mascot...', { 
          mascot: !!mascot, 
          audioElement: !!audioElement,
          hasConnectAudio: typeof mascot.connectAudio === 'function',
          mascotMethods: Object.getOwnPropertyNames(mascot).filter(name => typeof mascot[name] === 'function')
        })
        
        if (typeof mascot.connectAudio !== 'function') {
          console.error('❌ mascot.connectAudio is not a function!')
          return
        }
        
        // Ensure AudioContext is resumed after user gesture
        if (mascot.audioHandler && mascot.audioHandler.mascot && mascot.audioHandler.mascot.audioAnalyzer) {
          const analyzer = mascot.audioHandler.mascot.audioAnalyzer
          if (analyzer.audioContext && analyzer.audioContext.state === 'suspended') {
            console.log('🎵 Resuming suspended AudioContext...')
            await analyzer.resume()
          }
        }
        
        await mascot.connectAudio(audioElement)
        console.log('✅ Audio connected successfully!')
      } catch (error) {
        console.error('❌ Failed to connect audio to mascot:', error)
      }
    } else {
      console.log('⚠️ Cannot connect audio:', { mascot: !!mascot, audioElement: !!audioElement })
    }
  }, [mascot])

  // Disconnect audio from mascot
  const disconnectAudioFromMascot = useCallback(() => {
    if (mascot) {
      try {
        mascot.disconnectAudio()
        
        // Reset shape to currently selected shape to remove any audio deformation
        if (mascot.morphTo && typeof mascot.morphTo === 'function') {
          // Use the currentShape prop or default to circle
          const shapeToReset = currentShape || 'circle'
          mascot.morphTo(shapeToReset)
        }
      } catch (error) {
        console.error('❌ Failed to disconnect audio from mascot:', error)
      }
    }
  }, [mascot, currentShape])

  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current) return
    
    try {
      setIsLoading(true)
      const audio = audioRef.current
      
      if (audio.paused) {
        await audio.play()
        // Immediately update state for better UX
        setIsPlaying(true)
        if (onPlayStateChange) {
          onPlayStateChange(true)
        }
      } else {
        audio.pause()
        // Immediately update state for better UX
        setIsPlaying(false)
        if (onPlayStateChange) {
          onPlayStateChange(false)
        }
      }
    } catch (error) {
      console.error('❌ Error handling play/pause:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onPlayStateChange])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      
      if (audioRef.current) {
        audioRef.current.pause()
        disconnectAudioFromMascot()
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio()
      audio.preload = 'auto'
      audioRef.current = audio
      
      const objectURL = URL.createObjectURL(file)
      audio.src = objectURL
      setCurrentAudio(objectURL)
      
      if (onAudioLoad) {
        onAudioLoad(audio)
      }
      
      // Reset playing state when new audio is loaded
      setIsPlaying(false)
      
      // Auto-play the loaded audio
      try {
        await audio.play()
        console.log('🎵 Auto-playing loaded audio')
        // Immediately update state to show pause button
        setIsPlaying(true)
      } catch (error) {
        console.log('⚠️ Auto-play failed (user interaction required):', error.message)
      }
      
    } catch (error) {
      console.error('❌ Error loading audio file:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onAudioLoad, disconnectAudioFromMascot])

  const handleButtonClick = useCallback((icon: string) => {
    switch (icon) {
      case 'play':
        handlePlayPause()
        break
      case 'music':
        fileInputRef.current?.click()
        break
      case 'eye':
        toggleBlinking()
        break
      case 'eyes':
        toggleGazeTracking()
        break
      case 'random':
        triggerRandomCombo()
        break
      case 'record':
        console.log('🎙️ Record button clicked')
        break
      case 'menu':
        toggleMenu()
        break
    }
  }, [handlePlayPause, toggleMenu, toggleBlinking, toggleGazeTracking, triggerRandomCombo])

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => {
      console.log('🎵 Audio play event triggered')
      setIsPlaying(true)
      if (mascot) {
        console.log('🎵 Mascot available, connecting audio...')
        connectAudioToMascot(audio)
      } else {
        console.log('⚠️ No mascot available for audio connection')
      }
      if (onPlayStateChange) {
        onPlayStateChange(true)
      }
    }

    const handlePause = () => {
      console.log('🎵 Audio pause event triggered')
      setIsPlaying(false)
      if (mascot) {
        disconnectAudioFromMascot()
      }
      if (onPlayStateChange) {
        onPlayStateChange(false)
      }
    }

    const handleEnded = () => {
      console.log('🎵 Audio ended event triggered')
      setIsPlaying(false)
      setCurrentAudio(null) // Hide play button when audio ends
      if (mascot) {
        disconnectAudioFromMascot()
      }
      if (onPlayStateChange) {
        onPlayStateChange(false)
      }
    }

    // Remove any existing listeners first
    audio.removeEventListener('play', handlePlay)
    audio.removeEventListener('pause', handlePause)
    audio.removeEventListener('ended', handleEnded)

    // Add new listeners
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [mascot, onPlayStateChange, connectAudioToMascot, disconnectAudioFromMascot, audioRef.current])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMenuExpanded && !target.closest('.system-controls-bar')) {
        setIsMenuExpanded(false)
      }
    }

    if (isMenuExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuExpanded])
    
  return (
    <div className="system-controls-bar">
      <div className="controls-container">
        {/* Show play button only when audio is loaded */}
        {currentAudio && (
          <button
            className={`sci-fi-btn ${isPlaying ? 'pause' : 'play'}`}
            onClick={() => handleButtonClick('play')}
            disabled={isLoading}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <img 
              src={`/assets/system-bar/${isPlaying ? 'pause' : 'play'}.svg`} 
              alt={isPlaying ? 'pause' : 'play'}
              className="system-control-icon"
            />
          </button>
        )}
        
        {/* Three-dot menu button */}
        <button
          className={`sci-fi-btn menu ${isMenuExpanded ? 'expanded' : ''}`}
          onClick={() => handleButtonClick('menu')}
          title="System Controls"
        >
          <img 
            src="/assets/system-bar/menu.svg" 
            alt="menu"
            className="system-control-icon"
          />
        </button>
        
        {/* Expanded menu items */}
        <div className={`expanded-menu ${isMenuExpanded ? 'show' : ''}`}>
          {icons.map((icon) => (
            <button
              key={icon}
              className={`sci-fi-btn ${icon} ${
                (icon === 'eye' && !isBlinkingEnabled) || 
                (icon === 'eyes' && isGazeTrackingEnabled) 
                  ? 'active' : ''
              }`}
              onClick={() => handleButtonClick(icon)}
              disabled={isLoading}
              title={
                icon === 'music' 
                  ? 'Upload Music' 
                  : icon === 'eye'
                  ? `Blinking ${isBlinkingEnabled ? 'Enabled' : 'Disabled'}`
                  : icon === 'eyes'
                  ? `Gaze Tracking ${isGazeTrackingEnabled ? 'Enabled' : 'Disabled'}`
                  : icon.charAt(0).toUpperCase() + icon.slice(1)
              }
            >
              <img 
                src={`/assets/system-bar/${icon}.svg`} 
                alt={icon}
                className="system-control-icon"
              />
            </button>
          ))}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      {isLoading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}


