'use client'

import SystemControlsBar from './SystemControlsBar'
import ShapeSelectorBar from './ShapeSelectorBar'

interface GameMainProps {
  engine: any
  score: number
  combo: number
}

export default function GameMain({ engine, score, combo }: GameMainProps) {
  const leftEmotionalStates = [
    { name: 'neutral', svg: 'neutral.svg' },
    { name: 'joy', svg: 'joy.svg' },
    { name: 'love', svg: 'love.svg' },
    { name: 'excited', svg: 'excited.svg' },
    { name: 'calm', svg: 'calm.svg' },
    { name: 'calm', svg: 'calm.svg' },
  ]

  const rightEmotionalStates = [
    { name: 'surprise', svg: 'surprise.svg' },
    { name: 'fear', svg: 'fear.svg' },
    { name: 'sadness', svg: 'sadness.svg' },
    { name: 'disgust', svg: 'disgust.svg' },
    { name: 'anger', svg: 'anger.svg' },
    { name: 'anger', svg: 'anger.svg' },
  ]

  return (
    <div className="canvas-container">
      <div className="game-canvas-area">
        {/* System Controls Bar inside animation frame */}
        <SystemControlsBar />
        
        {/* State columns inside animation frame */}
        <div className="state-column state-column-left">
          {leftEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon">
              <img src={`/assets/states/${state.svg}`} alt={state.name} className="state-icon-svg" />
            </div>
          ))}
        </div>

        <div className="state-column state-column-right">
          {rightEmotionalStates.map((state) => (
            <div key={state.name} className="state-icon">
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
        <div className="status-text emotion">emotion: neutral</div>
        <div className="status-text stability">STABLE</div>
        
        {/* Shape selector anchored to bottom of animation frame */}
        <div className="shape-selector-inside">
          <ShapeSelectorBar />
        </div>
      </div>
    </div>
  )
}


