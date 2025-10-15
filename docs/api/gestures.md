---
title: "Gesture System"
category: "API Reference"
order: 3
description: "Trigger animations and gesture chains"
---

# Gesture System

## express(gestureName)

Triggers a gesture animation.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gestureName` | `string \| string[]` | Yes | Gesture name or array of gestures |

### Available Gestures

#### Motion Gestures

| Gesture | Description | Duration |
|---------|-------------|----------|
| `bounce` | Bouncing motion | 1s |
| `pulse` | Pulsing scale effect | 0.8s |
| `shake` | Rapid side-to-side shake | 0.5s |
| `spin` | 360° rotation | 1.2s |
| `nod` | Up-down nodding motion | 0.6s |
| `sway` | Gentle side-to-side sway | 2s |
| `float` | Floating up and down | 2.5s |
| `vibrate` | Rapid vibration | 0.3s |

#### Transform Gestures

| Gesture | Description | Duration |
|---------|-------------|----------|
| `expand` | Grow in size | 0.8s |
| `contract` | Shrink in size | 0.8s |
| `morph` | Shape transformation | 1s |
| `stretch` | Vertical stretch | 0.7s |

#### Effect Gestures

| Gesture | Description | Duration |
|---------|-------------|----------|
| `flash` | Quick bright flash | 0.3s |
| `glow` | Sustained glow effect | 1.5s |
| `flicker` | Falling star particles | 2s |
| `wave` | Wave distortion | 1s |
| `breathe` | Breathing animation | 4s |

### Examples

**Single Gesture:**
```javascript
mascot.express('bounce')
```

**Chained Gestures:**
```javascript
mascot.express(['wave', 'spin', 'pulse'])
```

**User Interaction:**
```javascript
button.addEventListener('click', () => {
  mascot.express('flash')
})
```

## chain(chainName)

Executes a predefined gesture chain combo.

### Available Chains

| Chain | Definition | Description |
|-------|------------|-------------|
| `rise` | `breathe > sway+lean+tilt` | Gentle awakening |
| `flow` | `sway > lean+tilt > spin > bounce` | Smooth sequence |
| `burst` | `jump > nod > shake > flash` | Energetic combo |
| `drift` | `sway+breathe+float+drift` | Calm floating |
| `chaos` | `shake+shake > spin+flash > bounce+pulse` | Chaotic energy |
| `radiance` | `sparkle > pulse+flicker > shimmer` | Sparkling effect |
| `routine` | `nod > bounce > spin+sparkle` | Standard sequence |

### Examples

**Execute Chain:**
```javascript
mascot.chain('burst')
```

**Custom Timing:**
Chains use 500ms delay between groups. For custom timing, use `express()` with `setTimeout`:

```javascript
mascot.express('wave')
setTimeout(() => mascot.express('spin'), 1000)
setTimeout(() => mascot.express(['pulse', 'glow']), 2000)
```

## Gesture Synchronization

### Musical Timing

Gestures automatically sync to detected BPM when audio is connected:

```javascript
// Connect audio
mascot.connectAudio(audioElement)

// Gestures now sync to beat
mascot.express('bounce') // Triggers on next beat
```

### Manual BPM Control

```javascript
mascot.setBPM(120) // Set 120 BPM
mascot.express('pulse') // Syncs to 120 BPM
```

## Best Practices

**Gesture Layering:**
Combine multiple gestures for richer animations:

```javascript
mascot.express(['pulse', 'glow', 'flicker'])
```

**Context-Aware Gestures:**
Match gestures to emotions:

```javascript
mascot.setEmotion('joy', 0)
mascot.express(['bounce', 'sparkle'])

mascot.setEmotion('anger', 0)
mascot.express(['shake', 'flash'])
```

**Performance:**
Avoid triggering too many gestures simultaneously on low-end devices:

```javascript
const maxGestures = isMobile ? 2 : 5
const gestures = ['bounce', 'pulse', 'glow', 'wave', 'spin']
mascot.express(gestures.slice(0, maxGestures))
```

## See Also

- [Emotion Control](/docs/api/emotions)
- [Audio Integration](/docs/guides/audio-reactive)
- [Chain Examples](/docs/examples/gesture-chains)
