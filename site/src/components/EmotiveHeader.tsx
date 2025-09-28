'use client'

import ThemeToggle from './ThemeToggle'
import SystemControlsBar from './SystemControlsBar'

interface EmotiveHeaderProps {
  mascot?: any
  currentShape?: string
  onAudioLoad?: (audioElement: HTMLAudioElement) => void
  onPlayStateChange?: (isPlaying: boolean) => void
}

export default function EmotiveHeader({ mascot, currentShape, onAudioLoad, onPlayStateChange }: EmotiveHeaderProps) {
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
        />
      </div>
      
      <div className="user-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
        <div className="auth-pill">
          <span className="auth-guest-label">GUEST</span>
          <button className="auth-signin-btn" aria-label="Sign in">SIGN IN</button>
        </div>
      </div>
    </div>
  )
}


