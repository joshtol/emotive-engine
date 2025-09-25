'use client'

export default function SystemControlsBar() {
  const icons = ['play','music','eye','eyes','random','record']
  return (
    <div className="system-controls-bar">
      {icons.map((name) => (
        <button key={name} className="sci-fi-btn">
          <img src={`/assets/system-bar/${name}.svg`} alt={name} className="system-control-icon" />
        </button>
      ))}
    </div>
  )
}


