'use client'

interface ShapeSelectorBarProps {
  onShapeChange: (shape: string) => void
  currentShape: string
}

export default function ShapeSelectorBar({ onShapeChange, currentShape }: ShapeSelectorBarProps) {
  const basicShapes = ['circle', 'triangle', 'square', 'star', 'heart']
  const astronomicalShapes = ['sun', 'solar', 'moon', 'lunar']
  
  return (
    <>
      {/* Top Bar - Astronomical Shapes */}
      <div className="shape-selector-bar shape-selector-bar-top">
        {astronomicalShapes.map((shape) => (
          <button 
            key={shape} 
            className={`shape-selector-button ${currentShape === shape ? 'active' : ''}`}
            onClick={() => onShapeChange(shape)}
          >
            <img src={`/assets/shape-bar/${shape}.svg`} alt={shape} className="shape-selector-icon" />
          </button>
        ))}
      </div>
      
      {/* Bottom Bar - Basic Shapes */}
      <div className="shape-selector-bar shape-selector-bar-bottom">
        {basicShapes.map((shape) => (
          <button 
            key={shape} 
            className={`shape-selector-button ${currentShape === shape ? 'active' : ''}`}
            onClick={() => onShapeChange(shape)}
          >
            <img src={`/assets/shape-bar/${shape}.svg`} alt={shape} className="shape-selector-icon" />
          </button>
        ))}
      </div>
    </>
  )
}


