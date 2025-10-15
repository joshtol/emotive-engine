---
title: "Emotion Control"
category: "API Reference"
order: 2
description: "Control emotional states and undertones"
---

# Emotion Control

## setEmotion(emotionName, optionsOrDuration)

Sets the current emotional state with optional transition duration.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `emotionName` | `string` | Yes | Name of the emotion |
| `optionsOrDuration` | `string \| number \| Object` | No | Undertone, duration, or options object |

### Parameter Formats

**String (Undertone):**
```javascript
mascot.setEmotion('joy', 'energetic')
```

**Number (Duration):**
```javascript
mascot.setEmotion('joy', 0) // Instant transition
mascot.setEmotion('joy', 1000) // 1 second transition
```

**Object (Full Options):**
```javascript
mascot.setEmotion('joy', {
  undertone: 'energetic',
  duration: 0
})
```

### Available Emotions

| Emotion | Description | Color Theme |
|---------|-------------|-------------|
| `neutral` | Calm, balanced state | White/Blue |
| `joy` | Happy, cheerful | Yellow/Gold |
| `sadness` | Melancholic, subdued | Blue |
| `anger` | Intense, aggressive | Red |
| `fear` | Anxious, uncertain | Purple |
| `surprise` | Shocked, amazed | Green |
| `love` | Warm, affectionate | Pink |
| `excited` | Energetic, enthusiastic | Magenta |
| `calm` | Peaceful, serene | Cyan |

### Available Undertones

| Undertone | Effect |
|-----------|--------|
| `energetic` | Faster movement, brighter colors |
| `subdued` | Slower movement, muted colors |
| `intense` | Larger particles, stronger glow |
| `nervous` | Jittery movement, erratic patterns |
| `confident` | Smooth movement, stable patterns |

### Examples

**Basic Emotion Change:**
```javascript
mascot.setEmotion('joy')
```

**Instant Transition (No Artifacts):**
```javascript
// Recommended for rapid emotion changes
mascot.setEmotion('joy', 0)
```

**Custom Transition Duration:**
```javascript
mascot.setEmotion('joy', 1500) // 1.5 second transition
```

**Emotion with Undertone:**
```javascript
mascot.setEmotion('anger', 'intense')
```

**Full Control:**
```javascript
mascot.setEmotion('love', {
  undertone: 'subdued',
  duration: 500
})
```

### Best Practices

**Prevent Particle Artifacts:**
Use instant transitions (duration: 0) when rapidly switching emotions:

```javascript
// Card carousel example
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    mascot.setEmotion(card.emotion, 0) // Instant, no artifacts
  })
})
```

**Smooth Storytelling:**
Use longer transitions for narrative experiences:

```javascript
// Gradual emotional journey
mascot.setEmotion('neutral', 2000)
setTimeout(() => mascot.setEmotion('joy', 2000), 3000)
setTimeout(() => mascot.setEmotion('love', 2000), 6000)
```

## updateUndertone(undertone)

Updates the undertone without changing the base emotion.

```javascript
mascot.updateUndertone('energetic')
mascot.updateUndertone(null) // Clear undertone
```

## See Also

- [Gesture System](/docs/api/gestures)
- [Events](/docs/api/events)
- [Examples](/docs/examples/emotion-switching)
