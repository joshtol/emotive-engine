'use client'

import { useState } from 'react'
import SystemControlsBar from './SystemControlsBar'
import ShapeSelectorBar from './ShapeSelectorBar'

interface GameMainProps {
  engine: any
  score: number
  combo: number
  currentUndertone: string
}

export default function GameMain({ engine, score, combo, currentUndertone }: GameMainProps) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  
  const getUndertoneLabel = (undertone: string) => {
    const undertoneMap: { [key: string]: string } = {
      'none': 'CLEAR',
      'nervous': 'NERVOUS',
      'confident': 'CONFIDENT',
      'tired': 'TIRED',
      'intense': 'INTENSE',
      'subdued': 'SUBDUED'
    }
    return undertoneMap[undertone] || 'CLEAR'
  }
  const leftEmotionalStates = [
    { name: 'neutral', svg: 'neutral.svg' },
    { name: 'joy', svg: 'joy.svg' },
    { name: 'love', svg: 'love.svg' },
    { name: 'excited', svg: 'excited.svg' },
    { name: 'calm', svg: 'calm.svg' },
    { name: 'euphoria', svg: 'euphoria.svg' },
  ]

  const rightEmotionalStates = [
    { name: 'surprise', svg: 'surprise.svg' },
    { name: 'fear', svg: 'fear.svg' },
    { name: 'sadness', svg: 'sadness.svg' },
    { name: 'disgust', svg: 'disgust.svg' },
    { name: 'anger', svg: 'anger.svg' },
    { name: 'glitch', svg: 'glitch.svg' },
  ]

  return (
    <div className="canvas-container">
      <div className="game-canvas-area">
        {/* System Controls Bar inside animation frame */}
        <SystemControlsBar />
        
        {/* State columns inside animation frame */}
        <div className="state-column state-column-left">
          {leftEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="state-column state-column-right">
          {rightEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon" onClick={() => setCurrentEmotion(state.name)}>
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ width: 'clamp(80px, 15vw, 128px)', height: 'clamp(80px, 15vw, 128px)' }}>
            <span className="text-gray-800" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>🎵</span>
          </div>
        </div>
        
        {/* Status indicators inside animation frame */}
        <div className="status-text emotion" data-state={currentEmotion}>emotion: {currentEmotion}</div>
        <div className="status-text stability" data-undertone={currentUndertone}>{getUndertoneLabel(currentUndertone)}</div>
        
        {/* Shape selector anchored to bottom of animation frame */}
        <div className="shape-selector-inside">
          <ShapeSelectorBar />
        </div>
      </div>
    </div>
  )
}


