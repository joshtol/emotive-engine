'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import TrackSelectionModal from './TrackSelectionModal'

interface SystemControlsBarProps {
  mascot?: any
  currentShape?: string
  onAudioLoad?: (audioElement: HTMLAudioElement) => void
  onPlayStateChange?: (isPlaying: boolean) => void
  onMessage?: (type: string, content: string, duration?: number) => void
  flashMusicButton?: boolean
}

export default function SystemControlsBar({ mascot, currentShape, onAudioLoad, onPlayStateChange, onMessage, flashMusicButton }: SystemControlsBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isBlinkingEnabled, setIsBlinkingEnabled] = useState(true)
  const [isGazeTrackingEnabled, setIsGazeTrackingEnabled] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const icons = ['music','eye','eyes','random']

  // Toggle menu with animation
  const toggleMenu = useCallback(() => {
    setIsMenuExpanded(!isMenuExpanded)
  }, [isMenuExpanded])

  // Toggle mascot blinking
  const toggleBlinking = useCallback(() => {
    if (!mascot) {
      onMessage?.('warning', 'Mascot not ready', 3000)
      return
    }
    
    const newBlinkingState = !isBlinkingEnabled
    setIsBlinkingEnabled(newBlinkingState)
    
    try {
      if (mascot.renderer && mascot.renderer.setBlinkingEnabled) {
        mascot.renderer.setBlinkingEnabled(newBlinkingState)
        onMessage?.('info', `Blinking ${newBlinkingState ? 'enabled' : 'disabled'}`, 2000)
      } else {
        onMessage?.('warning', 'Blinking control not available', 3000)
      }
    } catch (error) {
      onMessage?.('error', 'Failed to toggle blinking', 4000)
    }
  }, [mascot, isBlinkingEnabled, onMessage])

  // Toggle gaze tracking
  const toggleGazeTracking = useCallback(() => {
    if (!mascot) {
      onMessage?.('warning', 'Mascot not ready', 3000)
      return
    }

    const newGazeState = !isGazeTrackingEnabled
    setIsGazeTrackingEnabled(newGazeState)

    try {
      if (newGazeState) {
        if (mascot.enableGazeTracking) {
          mascot.enableGazeTracking()
          onMessage?.('info', 'Gaze tracking enabled', 2000)
        } else {
          onMessage?.('warning', 'Gaze tracking not available', 3000)
        }
      } else {
        if (mascot.disableGazeTracking) {
          mascot.disableGazeTracking()
          onMessage?.('info', 'Gaze tracking disabled', 2000)
        } else {
          onMessage?.('warning', 'Gaze tracking not available', 3000)
        }
      }
    } catch (error) {
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
      return
    }
    
    try {
      // Select random emotion, gesture, and shape
      const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)]
      const randomGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)]
      const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
      
      // Apply the random selections
      mascot.setEmotion(randomEmotion)
      mascot.express(randomGesture)
      mascot.morphTo(randomShape)
    } catch (error) {
      // Random combo failed
    }
  }, [mascot])

  // Connect audio to mascot for audio-reactive effects
  const connectAudioToMascot = useCallback(async (audioElement: HTMLAudioElement) => {
    if (mascot && audioElement) {
      try {
        if (typeof mascot.connectAudio !== 'function') {
          return
        }
        
        // Ensure AudioContext is resumed after user gesture
        if (mascot.audioHandler && mascot.audioHandler.mascot && mascot.audioHandler.mascot.audioAnalyzer) {
          const analyzer = mascot.audioHandler.mascot.audioAnalyzer
          if (analyzer.audioContext && analyzer.audioContext.state === 'suspended') {
            await analyzer.resume()
          }
        }
        
        await mascot.connectAudio(audioElement)
      } catch (error) {
        // Audio connection failed
      }
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
        // Audio disconnection failed
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
      // Play/pause failed
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
        // Immediately update state to show pause button
        setIsPlaying(true)
      } catch (error) {
        // Auto-play failed (user interaction required)
      }
      
    } catch (error) {
      // Audio loading failed
    } finally {
      setIsLoading(false)
    }
  }, [onAudioLoad, disconnectAudioFromMascot])

  // Handle track selection from modal
  const handleTrackSelect = useCallback(async (trackPath: string) => {
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
      
      audio.src = trackPath
      setCurrentAudio(trackPath)
      
      if (onAudioLoad) {
        onAudioLoad(audio)
      }
      
      // Reset playing state when new audio is loaded
      setIsPlaying(false)
      
      // Auto-play the loaded audio
      try {
        await audio.play()
        // Immediately update state to show pause button
        setIsPlaying(true)
      } catch (error) {
        // Auto-play failed (user interaction required)
      }
      
    } catch (error) {
      onMessage?.('error', 'Failed to load track', 3000)
    } finally {
      setIsLoading(false)
    }
  }, [onAudioLoad, disconnectAudioFromMascot, onMessage])

  const handleButtonClick = useCallback((icon: string) => {
    switch (icon) {
      case 'play':
        handlePlayPause()
        break
      case 'music':
        setShowTrackModal(true)
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
      setIsPlaying(true)
      if (mascot) {
        connectAudioToMascot(audio)
      }
      if (onPlayStateChange) {
        onPlayStateChange(true)
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (mascot) {
        disconnectAudioFromMascot()
      }
      if (onPlayStateChange) {
        onPlayStateChange(false)
      }
    }

    const handleEnded = () => {
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

  // Auto-expand menu when music button should flash
  useEffect(() => {
    if (flashMusicButton) {
      setIsMenuExpanded(true)
    }
  }, [flashMusicButton])

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
              } ${icon === 'music' && flashMusicButton ? 'flash' : ''}`}
              onClick={() => handleButtonClick(icon)}
              disabled={isLoading}
              title={
                icon === 'music' 
                  ? 'Select Demo Track' 
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
      
      <TrackSelectionModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        onTrackSelect={handleTrackSelect}
      />
    </div>
  )
}


