'use client'

import { useState } from 'react'
import UndertoneDial from './UndertoneDial'

interface GameSidebarProps {
  onGesture: (gesture: string) => void
  isPlaying: boolean
  currentUndertone: string
  onUndertoneChange: (undertone: string) => void
}

export default function GameSidebar({ onGesture, isPlaying, currentUndertone, onUndertoneChange }: GameSidebarProps) {
  
  const chainCombos = [ 'BUILD', 'CASCADE', 'CELEBRATE', 'SMOOTH', 'CHAOS', 'CUSTOM' ]
  const glowEffects = [ 'SPARKLE', 'PULSE', 'GLOW', 'FLASH', 'SHIMMER', 'FLICKER' ]

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
            <button key={combo} onClick={() => onGesture(combo.toLowerCase())} className="sci-fi-btn chain-btn" disabled={!isPlaying}><span className="btn-label">{combo}</span></button>
          ))}
        </div>
      </div>

      <div className="mb-6">
            <h2 className="section-header">GLOW</h2>
            <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {glowEffects.map((effect) => (
            <button key={effect} onClick={() => onGesture(effect.toLowerCase())} className="sci-fi-btn gesture-btn" disabled={!isPlaying}><span className="btn-label">{effect}</span></button>
          ))}
        </div>
      </div>
    </div>
  )
}


