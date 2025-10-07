'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  return (
    <div className="emotive-header">
      <div className="emotive-logo">
        <Link href="/">
          <img src="/assets/emotive-engine-full-BW.svg" alt="Emotive Engine" className="emotive-logo-svg" />
        </Link>
      </div>
      
      {/* Navigation Links */}
      <div className="header-navigation">
        <Link 
          href="/" 
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          href="/demo" 
          className={`nav-link ${pathname === '/demo' ? 'active' : ''}`}
        >
          Demo
        </Link>
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
    </div>
  )
}


