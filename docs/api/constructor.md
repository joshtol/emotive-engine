---
title: "Constructor"
category: "API Reference"
order: 1
description: "Create a new Emotive Engine instance"
---

# Constructor

## new EmotiveMascot(options)

Creates a new Emotive Engine instance with the specified configuration.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `Object` | Yes | Configuration options |

### Options

#### Canvas Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `canvasId` | `string \| HTMLCanvasElement` | Required | Canvas element or ID |
| `width` | `number` | Auto | Canvas width in pixels |
| `height` | `number` | Auto | Canvas height in pixels |

#### Particle Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `particleCount` | `number` | `150` | Initial particle count |
| `maxParticles` | `number` | `500` | Maximum particle count |
| `particleSize` | `Object` | `{ min: 2, max: 6 }` | Particle size range |

#### Performance

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetFPS` | `number` | `60` | Target frame rate |
| `enableAutoOptimization` | `boolean` | `true` | Auto-adjust quality |
| `enableGracefulDegradation` | `boolean` | `true` | Reduce quality on low FPS |

#### Core Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `emotion` | `string` | `'neutral'` | Initial emotion state |
| `renderingStyle` | `string` | `'classic'` | Rendering style ('classic' or 'scifi') |
| `enableGazeTracking` | `boolean` | `false` | Enable mouse tracking |
| `enableIdleBehaviors` | `boolean` | `true` | Enable idle animations |

### Example

```javascript
const mascot = new EmotiveMascot({
  canvasId: 'my-canvas',
  emotion: 'joy',
  particleCount: 200,
  targetFPS: 60,
  enableGazeTracking: true,
  renderingStyle: 'classic',
  classicConfig: {
    coreColor: '#FFFFFF',
    coreSizeDivisor: 4,
    glowMultiplier: 3.0,
    defaultGlowColor: '#667eea'
  }
})
```

### Mobile Optimization

```javascript
const isMobile = window.innerWidth < 768

const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  targetFPS: isMobile ? 30 : 60,
  maxParticles: isMobile ? 50 : 120,
  enableAutoOptimization: true,
  enableGracefulDegradation: true
})
```

## See Also

- [Core Methods](/docs/api/core-methods)
- [Emotion Control](/docs/api/emotions)
- [Configuration Examples](/docs/examples/basic-setup)
