'use client'

export default function ShapeSelectorBar() {
  const shapes = ['circle','triangle','square','heart','star','sun','solar','moon','lunar']
  return (
    <div className="shape-selector-bar">
      {shapes.map((s) => (
        <button key={s} className="shape-selector-button">
          <img src={`/assets/shape-bar/${s}.svg`} alt={s} className="shape-selector-icon" />
        </button>
      ))}
    </div>
  )
}


