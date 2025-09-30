'use client'

interface GameControlsProps {
  onGesture: (gesture: string) => void
  activeGestures: Set<string>
}

export default function GameControls({ onGesture, activeGestures }: GameControlsProps) {
  const danceGestures = [ 'HEADBOB','WIGGLE','ORBIT','GROOVE','POINT','LEAN','REACH','RUNNINGMAN','CHARLESTON' ]
  const overlayableGestures = [ 'BOUNCE','SWAY','SPIN','HULA','JUMP','TWIST','WAVE','NOD','SHAKE','TILT','BREATHE','FLOAT' ]
  const glowEffects = [ 'SPARKLE','PULSE','GLOW','FLASH','SHIMMER','FLICKER' ]

  return (
    <div className="emotive-controls">
      <div className="mb-6">
        <h2 className="section-header">DANCE</h2>
        <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {danceGestures.map((gesture) => (
            <button 
              key={gesture} 
              onClick={() => onGesture(gesture.toLowerCase())} 
              className={`sci-fi-btn gesture-btn ${
                activeGestures.has(`${gesture}_COMBO`) ? 'active-gesture-combo' : 
                activeGestures.has(gesture) ? 'active-gesture' : ''
              }`}
            >
              <span className="btn-label">{gesture}</span>
            </button>
          ))}
        </div>
        
      </div>

      <div className="mb-6">
        <h2 className="section-header">OVERLAY</h2>
        <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {overlayableGestures.map((gesture) => (
            <button 
              key={gesture} 
              onClick={() => onGesture(gesture.toLowerCase())} 
              className={`sci-fi-btn gesture-btn ${
                activeGestures.has(`${gesture}_COMBO`) ? 'active-gesture-combo' : 
                activeGestures.has(gesture) ? 'active-gesture' : ''
              }`}
            >
              <span className="btn-label">{gesture}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="section-header">GLOW</h2>
        <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {glowEffects.map((effect) => (
            <button 
              key={effect} 
              onClick={() => onGesture(effect.toLowerCase())} 
              className={`sci-fi-btn gesture-btn ${
                activeGestures.has(`${effect}_COMBO`) ? 'active-gesture-combo' : 
                activeGestures.has(effect) ? 'active-gesture' : ''
              }`}
            >
              <span className="btn-label">{effect}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


