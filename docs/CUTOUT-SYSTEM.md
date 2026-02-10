# Cutout System

The cutout system creates organic holes and breaks in elemental geometry (fire, water, etc.) for ethereal, stylized effects. It's a GPU-driven, two-layer composable system with animated travel modes.

## Quick Start

```javascript
// In a gesture config
animation: {
    cutout: {
        strength: 0.8,
        pattern: 5,           // EMBERS
        travel: 'angular',
        travelSpeed: 2.0
    }
}

// Or programmatically
import { setCutout, CUTOUT_PATTERNS } from './materials/cores/InstancedAnimationCore.js';
setCutout(material, {
    strength: 0.8,
    pattern: CUTOUT_PATTERNS.EMBERS,
    travel: 'angular',
    travelSpeed: 2.0
});
```

## Patterns

| ID | Name | Description | Best For |
|----|------|-------------|----------|
| 0 | CELLULAR | Organic cell-like holes | Water, organic effects |
| 1 | STREAKS | Flow-aligned streak holes | Water flow, wind |
| 2 | RADIAL | Burst pattern from center | Explosions, impacts |
| 3 | VORONOI | Cracked/shattered pattern | Earth, ice, breaking |
| 4 | WAVES | Wave interference pattern | Water, energy fields |
| 5 | EMBERS | Burning ember holes with heat rise | Fire, heat effects |
| 6 | SPIRAL | Spiral arms pattern | Meditation, vortex, hypnotic |
| 7 | DISSOLVE | Edge erosion inward | Fade-outs, disintegration |
| 8 | CRACKS | Branching fracture lines | Shatter, breaking apart |

## Travel Modes

Travel modes animate how the cutout pattern moves across the geometry during a gesture.

| ID | Name | Description | Best For |
|----|------|-------------|----------|
| 0 | NONE | Static cutout | Constant effects |
| 1 | ANGULAR | Sweeps around ring geometry (Y-axis rotation) | Crown rings, halos |
| 2 | RADIAL | Expands/contracts from center | Pulses, explosions |
| 3 | SPIRAL | Rotate + expand simultaneously | Hypnotic, meditation |
| 4 | OSCILLATE | Ping-pong back and forth | Breathing, heartbeat |
| 5 | WAVE | Sine wave propagation (ripple) | Water ripples, energy |

## Travel Direction

Control which direction the travel animation runs:

| Value | Name | Description |
|-------|------|-------------|
| `'forward'` | Forward | Normal direction (0→1) |
| `'reverse'` | Reverse | Backwards (1→0) |
| `'pingpong'` | Ping-Pong | Forward then reverse |

## Strength Curves

Animate the cutout strength over the gesture lifetime:

| Value | Name | Description |
|-------|------|-------------|
| `'constant'` | Constant | Full strength throughout |
| `'fadeIn'` | Fade In | Ramps up from 0 to full |
| `'fadeOut'` | Fade Out | Ramps down from full to 0 |
| `'bell'` | Bell | Peaks at 50%, fades at ends |
| `'pulse'` | Pulse | Two pulses during gesture |

## Two-Layer Compositing

Combine two patterns for complex effects:

```javascript
cutout: {
    strength: 1.0,
    primary: { pattern: 0, scale: 1.0, weight: 1.0 },    // CELLULAR
    secondary: { pattern: 1, scale: 1.0, weight: 0.8 },  // STREAKS
    blend: 'multiply'
}
```

### Blend Modes

| Mode | Description |
|------|-------------|
| `'multiply'` | Hole where EITHER pattern has hole (more holes) |
| `'min'` | Hole only where BOTH patterns have holes (fewer holes) |
| `'max'` | Keep highest mask value (fewer holes) |
| `'add'` | Add masks together then clamp (smooth blend) |

## Per-Layer Travel

Each layer can have its own travel mode and speed:

```javascript
cutout: {
    strength: 0.8,
    primary: { pattern: 0 },                                    // Uses main travel
    secondary: { pattern: 2, travel: 'radial', travelSpeed: 0.5 }, // Own travel
    travel: 'angular',      // Primary travel mode
    travelSpeed: 2.0        // Primary travel speed
}
```

## Complete Configuration Reference

```javascript
cutout: {
    // Overall strength (0-1)
    strength: 0.8,

    // Animation phase offset
    phase: 0,

    // Single pattern (legacy format)
    pattern: 5,             // Pattern ID
    scale: 1.2,             // Pattern scale

    // OR two-layer format
    primary: {
        pattern: 0,         // CELLULAR
        scale: 1.0,
        weight: 1.0         // 0-1, how much this layer contributes
    },
    secondary: {
        pattern: 1,         // STREAKS
        scale: 1.0,
        weight: 0.8,
        travel: 'radial',   // Per-layer travel (optional)
        travelSpeed: 0.5
    },

    // Blend mode for two-layer
    blend: 'multiply',      // 'multiply'|'min'|'max'|'add'

    // Travel animation
    travel: 'angular',      // 'none'|'angular'|'radial'|'spiral'|'oscillate'|'wave'
    travelSpeed: 2.0,       // Cycles per gesture
    travelDir: 'forward',   // 'forward'|'reverse'|'pingpong'

    // Strength animation
    strengthCurve: 'bell'   // 'constant'|'fadeIn'|'fadeOut'|'bell'|'pulse'
}
```

## Examples

### Fire Crown (Majestic)
```javascript
cutout: {
    strength: 0.8,
    pattern: 5,              // EMBERS
    scale: 1.2,
    travel: 'angular',
    travelSpeed: 2.0,        // Two sweeps per gesture
    strengthCurve: 'bell'    // Peak intensity mid-gesture
}
```

### Water Crown (Flowing)
```javascript
cutout: {
    strength: 1.0,
    primary: { pattern: 0, scale: 1.0, weight: 1.0 },    // CELLULAR
    secondary: { pattern: 1, scale: 1.0, weight: 0.8 },  // STREAKS
    blend: 'multiply',
    travel: 'angular',
    travelSpeed: 1.5,
    travelDir: 'pingpong'    // Back and forth flow
}
```

### Meditation Spiral
```javascript
cutout: {
    strength: 0.9,
    pattern: 6,              // SPIRAL
    scale: 0.8,
    travel: 'spiral',        // Hypnotic spiral travel
    travelSpeed: 1.0,
    strengthCurve: 'fadeIn'  // Gradually appears
}
```

### Shatter Effect
```javascript
cutout: {
    strength: 1.0,
    primary: { pattern: 8, scale: 1.5, weight: 1.0 },    // CRACKS
    secondary: { pattern: 7, scale: 1.0, weight: 0.6 },  // DISSOLVE
    blend: 'multiply',
    travel: 'radial',
    travelSpeed: 3.0,
    strengthCurve: 'fadeIn'  // Cracks spread in
}
```

### Breathing Pulse
```javascript
cutout: {
    strength: 0.7,
    pattern: 0,              // CELLULAR
    travel: 'oscillate',     // Breathing motion
    travelSpeed: 2.0,
    strengthCurve: 'pulse'   // Pulsing intensity
}
```

### Layered Counter-Rotation
```javascript
cutout: {
    strength: 0.9,
    primary: { pattern: 6 },                                      // SPIRAL
    secondary: { pattern: 6, travel: 'angular', travelSpeed: -1.5 }, // Counter-rotate
    blend: 'multiply',
    travel: 'angular',
    travelSpeed: 1.0
}
```

## Architecture

```
InstancedAnimationCore.js    <- Single source of truth
├── CUTOUT_PATTERNS enum
├── CUTOUT_TRAVEL enum
├── CUTOUT_BLEND enum
├── ANIMATION_UNIFORMS_FRAGMENT  <- Shader uniform declarations
├── CUTOUT_PATTERN_FUNC_GLSL     <- Pattern calculation functions
├── CUTOUT_GLSL                  <- Main cutout logic
├── createAnimationUniforms()    <- Uniform object factory
└── setCutout()                  <- Runtime configuration

InstancedFireMaterial.js     <- Uses shared core
├── ${ANIMATION_UNIFORMS_FRAGMENT}
└── ...createAnimationUniforms()

InstancedWaterMaterial.js    <- Uses shared core
├── ${ANIMATION_UNIFORMS_FRAGMENT}
└── ...createAnimationUniforms()
```

Adding new features only requires editing `InstancedAnimationCore.js`.

## Performance Notes

- Cutout uses binary discard (no alpha blending) to avoid black outline artifacts
- Pattern calculations use simplex noise (snoise) which is GPU-efficient
- Travel transformations are simple matrix rotations/scales
- Two-layer compositing doubles pattern calculations but is still fast
