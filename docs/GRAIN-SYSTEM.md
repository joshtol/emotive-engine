# Grain System

The grain system adds noise-based texture to elemental geometry (fire, water, etc.) for gritty, realistic, or film-like effects. It composites on top of cutout patterns but before final color output, using GPU-computed procedural noise.

## Quick Start

```javascript
// In a gesture config
animation: {
    grain: {
        strength: 0.15,
        scale: 0.5,
        speed: 1.0,
        type: 'perlin',
        blend: 'multiply'
    }
}

// Or programmatically
import { setGrain, GRAIN_TYPES } from './materials/cores/InstancedAnimationCore.js';
setGrain(material, {
    strength: 0.15,
    type: GRAIN_TYPES.PERLIN,
    scale: 0.5,
    speed: 1.0,
    blend: 'multiply'
});
```

## Grain Types

| ID | Name | Description | Best For |
|----|------|-------------|----------|
| 0 | PERLIN | Smooth, flowing noise | Water shimmer, organic grit |
| 1 | SIMPLEX | Similar to perlin, slightly different character | Fire embers, energy fields |
| 2 | WHITE | Random pixel noise (static) | Film grain, electricity |
| 3 | FILM | Perlin + white hybrid (cinematic) | Dramatic effects, vintage look |

## Blend Modes

| Mode | Description |
|------|-------------|
| `'multiply'` | Darkens - creates grit/dirt effect |
| `'add'` | Brightens - creates sparkle/shimmer effect |
| `'overlay'` | Increases contrast - dramatic texture |
| `'screen'` | Soft brightening - ethereal glow texture |

## Configuration Reference

```javascript
grain: {
    // Visibility (0-1)
    strength: 0.15,

    // Pattern scale (0.1 = fine detail, 2.0 = coarse)
    scale: 0.5,

    // Animation speed (0 = static, 1 = normal, 2 = fast)
    speed: 1.0,

    // Noise type
    type: 'perlin',     // 'perlin'|'simplex'|'white'|'film'

    // Blend mode
    blend: 'multiply'   // 'multiply'|'add'|'overlay'|'screen'
}
```

## Element Defaults

The factory functions apply sensible defaults per element type:

### Water (subtle shimmer)
```javascript
grain: {
    strength: 0.08,
    scale: 0.3,
    speed: 0.5,
    type: 'perlin',
    blend: 'multiply'
}
```

### Fire (gritty embers)
```javascript
grain: {
    strength: 0.12,
    scale: 0.6,
    speed: 1.5,
    type: 'simplex',
    blend: 'add'
}
```

## Examples

### Turbulent Water Splash
```javascript
grain: {
    strength: 0.20,
    scale: 0.4,
    speed: 2.0,
    type: 'perlin',
    blend: 'multiply'
}
```

### Crackling Fire
```javascript
grain: {
    strength: 0.18,
    scale: 0.8,
    speed: 3.0,
    type: 'simplex',
    blend: 'add'
}
```

### Calm Pool (minimal grain)
```javascript
grain: {
    strength: 0.05,
    scale: 0.2,
    speed: 0.3,
    type: 'perlin',
    blend: 'multiply'
}
```

### Dramatic Film Effect
```javascript
grain: {
    strength: 0.15,
    scale: 0.5,
    speed: 1.0,
    type: 'film',
    blend: 'overlay'
}
```

### Electric Sparkle
```javascript
grain: {
    strength: 0.25,
    scale: 0.3,
    speed: 5.0,
    type: 'white',
    blend: 'add'
}
```

## Gesture Overrides

Individual gestures can override factory defaults:

```javascript
// watersplash.js - higher grain for impact turbulence
const WATERSPLASH_CONFIG = {
    // ... other config ...
    animation: {
        grain: {
            strength: 0.18,    // Higher than water default (0.08)
            scale: 0.5,
            speed: 2.0,        // Faster animation
            type: 'perlin',
            blend: 'multiply'
        }
    }
};
```

## Architecture

```
InstancedAnimationCore.js    <- Single source of truth
├── GRAIN_TYPES enum
├── GRAIN_BLEND enum
├── GRAIN_UNIFORMS_FRAGMENT      <- Uniform declarations
├── GRAIN_GLSL                   <- Grain calculation + compositing
├── createAnimationUniforms()    <- Includes grain uniforms
├── setGrain()                   <- Runtime configuration
└── resetGrain()                 <- Reset to defaults

waterEffectFactory.js        <- Applies water grain defaults
fireEffectFactory.js         <- Applies fire grain defaults
```

## Interaction with Cutout

Grain is applied AFTER cutout but BEFORE final color output:

```
1. Fragment color calculated
2. Cutout pattern applied (may discard)
3. Trail dissolve alpha applied
4. Grain texture composited        <- GRAIN STEP
5. Final color/alpha output
```

This means grain affects the visible portion of the element after holes are cut out, creating organic texture on the remaining geometry.

## Performance Notes

- Grain uses the same simplex noise function as cutout patterns
- White noise is fastest (simple random)
- Film grain combines two noise samples (slightly more expensive)
- Grain is applied per-fragment, so performance scales with visible area
- Static grain (speed=0) can be optimized by caching noise values
