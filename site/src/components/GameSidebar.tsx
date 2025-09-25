'use client'

interface GameSidebarProps {
  onGesture: (gesture: string) => void
  isPlaying: boolean
}

export default function GameSidebar({ onGesture, isPlaying }: GameSidebarProps) {
  const chainCombos = [ 'BUILD', 'CASCADE', 'CELEBRATE', 'SMOOTH', 'CHAOS', 'CUSTOM' ]
  const glowEffects = [ 'SPARKLE', 'PULSE', 'GLOW', 'FLASH', 'SHIMMER', 'FLICKER' ]

  return (
    <div className="emotive-sidebar">
      <div className="mb-6">
        <h2 className="section-header">CHAIN COMBOS</h2>
        <div className="button-grid button-grid-3">
          {chainCombos.map((combo) => (
            <button key={combo} onClick={() => onGesture(combo.toLowerCase())} className="sci-fi-btn chain-btn" disabled={!isPlaying}><span className="btn-label">{combo}</span></button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="section-header">GLOW EFFECTS</h2>
        <div className="button-grid button-grid-3">
          {glowEffects.map((effect) => (
            <button key={effect} onClick={() => onGesture(effect.toLowerCase())} className="sci-fi-btn gesture-btn" disabled={!isPlaying}><span className="btn-label">{effect}</span></button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-header">UNDERTONE MODIFIER</h2>
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>SUBDUED</span><span>INTENSE</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div></div>
        </div>
        <button className="sci-fi-btn w-full gesture-btn"><span className="btn-label">CLEAR</span></button>
      </div>
    </div>
  )
}


