'use client'

interface ShapeSelectorBarProps {
  onShapeChange: (shape: string) => void
  currentShape: string
}

export default function ShapeSelectorBar({ onShapeChange, currentShape }: ShapeSelectorBarProps) {
  const shapes = ['circle','triangle','square','heart','star','sun','solar','moon','lunar']
  
  return (
    <div className="shape-selector-bar">
      {shapes.map((shape) => (
        <button 
          key={shape} 
          className={`shape-selector-button ${currentShape === shape ? 'active' : ''}`}
          onClick={() => onShapeChange(shape)}
        >
          <img src={`/assets/shape-bar/${shape}.svg`} alt={shape} className="shape-selector-icon" />
        </button>
      ))}
    </div>
  )
}


