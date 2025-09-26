'use client'

interface GameControlsProps {
  onGesture: (gesture: string) => void
}

export default function GameControls({ onGesture }: GameControlsProps) {
  const danceGestures = [ 'BOUNCE','SWAY','HEADBOB','WIGGLE','SPIN','HULA','ORBIT','GROOVE','JUMP','TWIST' ]
  const overlayableGestures = [ 'WAVE','POINT','NOD','SHAKE','LEAN','TILT','REACH','BREATHE','FLOAT' ]
  const additionalGestures = [ 'RAIN','RUNNINGMAN','CHARLESTON' ]

  return (
    <div className="emotive-controls">
      <div className="mb-6">
        <h2 className="section-header">DANCE</h2>
        <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {danceGestures.map((gesture) => (
            <button key={gesture} onClick={() => onGesture(gesture.toLowerCase())} className="sci-fi-btn gesture-btn"><span className="btn-label">{gesture}</span></button>
          ))}
        </div>
        
      </div>

      <div className="mb-6">
        <h2 className="section-header">OVERLAY</h2>
        <div className="single-fade-rule"></div>
        <div className="button-grid button-grid-3">
          {overlayableGestures.map((gesture) => (
            <button key={gesture} onClick={() => onGesture(gesture.toLowerCase())} className="sci-fi-btn gesture-btn"><span className="btn-label">{gesture}</span></button>
          ))}
        </div>
        <div className="mt-2">
          <div className="button-grid button-grid-3">
            {additionalGestures.map((gesture) => (
              <button key={gesture} onClick={() => onGesture(gesture.toLowerCase())} className="sci-fi-btn gesture-btn"><span className="btn-label">{gesture}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


