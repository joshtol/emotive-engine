'use client'

import { useState } from 'react'
import UndertoneDial from './UndertoneDial'

interface GameSidebarProps {
  onGesture: (gesture: string) => void
  isPlaying: boolean
  currentUndertone: string
  onUndertoneChange: (undertone: string) => void
  activeGestures: Set<string>
}

export default function GameSidebar({ onGesture, isPlaying, currentUndertone, onUndertoneChange, activeGestures }: GameSidebarProps) {
  
  const chainCombos = [ 
    'RISE', 'FLOW', 'BURST', 'DRIFT', 'CHAOS', 'MORPH',
    'RHYTHM', 'SPIRAL', 'ROUTINE', 'RADIANCE', 'TWINKLE', 'STREAM'
  ]

  return (
    <div className="emotive-sidebar">
      <div className="mb-6">
        <UndertoneDial 
          currentUndertone={currentUndertone}
          onUndertoneChange={onUndertoneChange}
        />
      </div>

      <div className="double-fade-rule mb-6"></div>

      <div className="mb-6">
            <h2 className="section-header">COMBOS</h2>
            <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {chainCombos.map((combo) => (
            <button 
              key={combo} 
              onClick={() => onGesture(combo.toLowerCase())} 
              className={`sci-fi-btn chain-btn ${activeGestures.has(combo) ? 'active-gesture-combo' : ''}`} 
              data-chain={combo.toLowerCase()}
            >
              <span className="btn-label">{combo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


