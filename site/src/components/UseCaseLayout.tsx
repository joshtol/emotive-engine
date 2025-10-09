'use client'

import { ReactNode } from 'react'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'
import MessageHUD from '@/components/MessageHUD'
import HeroMascot from '@/components/HeroMascot'

export interface UseCaseLayoutProps {
  children: ReactNode
  mascot: any | null
  onMascotReady: (mascotInstance: any) => void
  messages: any[]
  onMessageDismiss: (id: string) => void
  currentShape?: string
  onAudioLoad?: () => void
  onPlayStateChange?: () => void
  onMessage?: (type: string, content: string, duration?: number) => void
  flashMusicButton?: boolean
}

export default function UseCaseLayout({
  children,
  mascot,
  onMascotReady,
  messages,
  onMessageDismiss,
  currentShape = 'circle',
  onAudioLoad = () => {},
  onPlayStateChange = () => {},
  onMessage = () => {},
  flashMusicButton = false,
}: UseCaseLayoutProps) {
  return (
    <div className="emotive-container">
      <MessageHUD messages={messages} onMessageDismiss={onMessageDismiss} />
      <EmotiveHeader
        mascot={mascot}
        currentShape={currentShape}
        onAudioLoad={onAudioLoad}
        onPlayStateChange={onPlayStateChange}
        onMessage={onMessage}
        flashMusicButton={flashMusicButton}
      />

      <div className="emotive-main">
        {/* Full Viewport Mascot Canvas */}
        <div className="full-vp-mascot-area">
          <HeroMascot onMascotReady={onMascotReady} />
        </div>

        {/* Use Case Content */}
        {children}
      </div>

      <EmotiveFooter />
    </div>
  )
}
