# Emotive Engine 3D

**Experimental WebGL 3D rendering variant** - Custom 3D rendering without
Three.js dependency.

## Architecture

Hybrid dual-canvas rendering system:

```
┌─────────────────────────────┐
│   Canvas2D (Layer 2, Front) │  ← Particles (2D)
│  ┌─────────────────────┐    │
│  │ WebGL (Layer 1, Back│    │  ← Core geometry (3D)
│  └─────────────────────┘    │
└─────────────────────────────┘
```

## Features

- **Custom WebGL 2.0 Renderer** - Minimal rendering engine (~20KB)
- **Procedural Geometries** - Crystal, diamond, sphere (no asset loading
  required)
- **Shader-based Glow** - Fresnel effect for emotional depth
- **Procedural Animations** - Code-driven transforms (no animation files)
- **Same API as 2D** - Drop-in replacement: `setEmotion()`, `express()`,
  `morphTo()`
- **Particle Overlay** - Reuses existing Canvas2D particle system

## Bundle Size

- **ES Module**: 151KB
- **UMD**: 151KB
- **Gzipped**: ~40KB (estimated)

Compare to Three.js alternative: ~167KB (just the core library)

## Quick Start

```javascript
import { EmotiveMascot3D } from '@joshtol/emotive-engine/3d';

const mascot = new EmotiveMascot3D({
    coreGeometry: 'crystal', // 'sphere', 'diamond', 'crystal'
    enableParticles: true,
});

await mascot.init(canvas);
mascot.start();

// Same API as 2D version
mascot.setEmotion('joy');
mascot.express('bounce');
mascot.morphTo('diamond');
```

## Available Geometries

1. **Sphere** - Classic UV sphere (32x32 segments)
2. **Crystal** - Hexagonal crystal with pointed ends
3. **Diamond** - Brilliant-cut diamond with facets

## Animation System

### Emotions

Animations map to emotional states:

- `joy` - Upward scale pulse with glow
- `love` - Gentle breathing with high glow
- `curiosity` - Side-to-side wiggle
- `sadness` - Downward drift with dimmed glow
- `anger` - Rapid shake with intense glow
- `fear` - Trembling with reduced glow
- `surprise` - Sudden scale burst

### Gestures

Physical movements:

- `bounce` - Jump up and down
- `pulse` - Scale in/out
- `spin` - Full 360° rotation
- `wobble` - Figure-8 rotation
- `float` - Slow vertical drift
- `shake` - Horizontal shake
- `nod` - Head nod motion

## File Structure

```
src/3d/
├── index.js                    # Main EmotiveMascot3D class
├── Core3DManager.js            # 3D rendering orchestrator
├── animation/
│   └── ProceduralAnimator.js   # Animation system
├── geometries/
│   ├── index.js                # Geometry registry
│   ├── Sphere.js               # UV sphere generator
│   ├── Crystal.js              # Hexagonal crystal
│   └── Diamond.js              # Brilliant-cut diamond
├── renderer/
│   └── WebGLRenderer.js        # WebGL 2.0 engine
└── shaders/
    ├── core.vert               # Vertex shader
    └── core.frag               # Fragment shader (Fresnel glow)
```

## Technical Details

### WebGL Renderer

- WebGL 2.0 context with alpha, antialias, depth
- Depth testing + alpha blending
- Perspective camera with lookAt
- TRS matrix transformations
- Shader program compilation and linking
- Geometry buffer management

### Shader System

**Vertex Shader**:

- MVP matrix transformations
- Normal transformation
- World position pass-through

**Fragment Shader**:

- Fresnel-based edge glow: `pow(1 - dot(N,V), 3)`
- White core + colored glow
- Dynamic intensity control

### Animation System

- Time-based keyframe evaluation
- Cubic easing (ease-in-out)
- Animation blending (future)
- Callback system: `onUpdate`, `onComplete`

## Limitations (v3.1.0-alpha)

1. **No Asset Loading** - Only procedural geometries (no .glb/.gltf support yet)
2. **No Animation Blending** - Animations interrupt each other
3. **No Geometry Morphing** - Shape changes are instant (morph animations
   planned)
4. **Fixed Camera** - No camera controls (orbiting planned)
5. **No Shadows** - Simple lighting only

## Future Enhancements

### Phase 1: GLB Loader (Optional, Tree-shakeable)

```javascript
import { GLBLoader } from '@joshtol/emotive-engine/3d/loaders';

const loader = new GLBLoader();
const asset = await loader.load('assets/custom-mascot.glb');
mascot.setCustomGeometry(asset);
```

**Impact**: +30KB when imported

### Phase 2: Animation System

- Animation blending/crossfading
- Animation state machine
- Custom animation curves
- Multi-track animation

### Phase 3: Advanced Rendering

- Shadow mapping
- Post-processing effects
- Camera controls
- HDR environment maps

## Performance

- **Target**: 60 FPS at 1080p
- **Geometry**: 1,000-2,000 triangles per shape
- **Particles**: 300 max (Canvas2D overlay)
- **WebGL Calls**: Minimized via batching

## Browser Support

- Chrome 56+ (WebGL 2.0)
- Firefox 51+ (WebGL 2.0)
- Safari 15+ (WebGL 2.0)
- Edge 79+ (WebGL 2.0)

## Example

See [examples/3d-demo.html](../../examples/3d-demo.html) for interactive demo.

## Contributing

This is an experimental feature. Feedback welcome!

## License

MIT License - Same as Emotive Engine
