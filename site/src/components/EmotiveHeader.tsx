'use client'

import ThemeToggle from './ThemeToggle'
import SystemControlsBar from './SystemControlsBar'

interface EmotiveHeaderProps {
  mascot?: any
  currentShape?: string
  onAudioLoad?: (audioElement: HTMLAudioElement) => void
  onPlayStateChange?: (isPlaying: boolean) => void
  onMessage?: (type: string, content: string, duration?: number) => void
  flashMusicButton?: boolean
}

export default function EmotiveHeader({ mascot, currentShape, onAudioLoad, onPlayStateChange, onMessage, flashMusicButton }: EmotiveHeaderProps) {
  return (
    <div className="emotive-header">
      <div className="emotive-logo">
        <img src="/assets/emotive-engine-full-BW.svg" alt="Emotive Engine" className="emotive-logo-svg" />
      </div>
      
      {/* System Controls Bar in Header */}
      <div className="header-system-controls">
        <SystemControlsBar 
          mascot={mascot}
          currentShape={currentShape}
          onAudioLoad={onAudioLoad}
          onPlayStateChange={onPlayStateChange}
          onMessage={onMessage}
          flashMusicButton={flashMusicButton}
        />
      </div>
      
      <div className="user-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
      </div>
    </div>
  )
}


