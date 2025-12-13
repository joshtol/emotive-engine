/**
 * ShapeSelectorBar Component
 *
 * Shape selector for the demo page, supporting both 2D and 3D modes.
 *
 * 2D SHAPES (basic): circle, triangle, star, heart
 * 3D SHAPES (mapped):
 *   - circle → crystal (quartz SSS)
 *   - triangle → rough (amethyst SSS)
 *   - star → dodecahedron (citrine SSS)
 *   - heart → heart (ruby SSS)
 *
 * ASTRONOMICAL:
 *   - sun → sun geometry
 *   - solar → solar eclipse (50/50 annular/total)
 *   - moon → moon geometry
 *   - lunar → lunar eclipse (blood moon)
 */
'use client'

interface ShapeSelectorBarProps {
  onShapeChange: (shape: string) => void
  currentShape: string
  mode?: '2d' | '3d'
  /** Callback for SSS preset when shape changes (3D only) */
  onSSSPreset?: (preset: string | null) => void
  /** Callback for eclipse type (solar/lunar) */
  onEclipse?: (type: 'solar' | 'lunar' | null) => void
}

// 2D to 3D shape mapping with SSS presets
const SHAPE_3D_MAP: { [key: string]: { geometry: string; sssPreset?: string; eclipse?: 'solar' | 'lunar' } } = {
  circle: { geometry: 'crystal', sssPreset: 'quartz' },
  triangle: { geometry: 'rough', sssPreset: 'amethyst' },
  star: { geometry: 'star', sssPreset: 'citrine' },
  heart: { geometry: 'heart', sssPreset: 'ruby' },
  sun: { geometry: 'sun' },
  moon: { geometry: 'moon' },
  solar: { geometry: 'sun', eclipse: 'solar' },
  lunar: { geometry: 'moon', eclipse: 'lunar' },
}

export default function ShapeSelectorBar({
  onShapeChange,
  currentShape,
  mode = '2d',
  onSSSPreset,
  onEclipse,
}: ShapeSelectorBarProps) {
  // Basic shapes - square removed as it has no 3D equivalent
  const basicShapes = ['circle', 'triangle', 'star', 'heart']
  const astronomicalShapes = ['sun', 'solar', 'moon', 'lunar']

  const handleShapeClick = (shape: string) => {
    if (mode === '3d') {
      const mapping = SHAPE_3D_MAP[shape]
      if (mapping) {
        // Call shape change with 3D geometry name
        onShapeChange(mapping.geometry)

        // Apply SSS preset if available
        if (onSSSPreset) {
          onSSSPreset(mapping.sssPreset || null)
        }

        // Handle eclipse types
        if (onEclipse) {
          onEclipse(mapping.eclipse || null)
        }
      } else {
        onShapeChange(shape)
      }
    } else {
      // 2D mode - use shape name directly
      onShapeChange(shape)
    }
  }

  // Determine which shape button should be highlighted
  const getActiveShape = (shape: string) => {
    if (mode === '3d') {
      const mapping = SHAPE_3D_MAP[shape]
      return mapping?.geometry === currentShape
    }
    return currentShape === shape
  }

  return (
    <>
      {/* Top Bar - Astronomical Shapes */}
      <div className="shape-selector-bar shape-selector-bar-top">
        {astronomicalShapes.map((shape) => (
          <button
            key={shape}
            className={`shape-selector-button ${getActiveShape(shape) ? 'active' : ''}`}
            onClick={() => handleShapeClick(shape)}
          >
            <img
              src={`/assets/shape-bar/${shape}.svg`}
              alt={shape}
              className="shape-selector-icon"
            />
          </button>
        ))}
      </div>

      {/* Bottom Bar - Basic Shapes */}
      <div className="shape-selector-bar shape-selector-bar-bottom">
        {basicShapes.map((shape) => (
          <button
            key={shape}
            className={`shape-selector-button ${getActiveShape(shape) ? 'active' : ''}`}
            onClick={() => handleShapeClick(shape)}
          >
            <img
              src={`/assets/shape-bar/${shape}.svg`}
              alt={shape}
              className="shape-selector-icon"
            />
          </button>
        ))}
      </div>
    </>
  )
}
