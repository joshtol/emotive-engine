---
title: "Events"
category: "API Reference"
order: 5
description: "Event system and listeners"
---

# Events

Listen to mascot state changes and interactions.

## Event Listeners

### on(event, callback)

Register an event listener.

```javascript
mascot.on('stateChange', (state) => {
  console.log('Emotion changed to:', state.emotion)
})
```

### off(event, callback)

Remove an event listener.

```javascript
const handler = (state) => console.log(state)
mascot.on('stateChange', handler)
mascot.off('stateChange', handler) // Unregister
```

---

## Available Events

### stateChange

Fired when emotional state changes.

**Payload:**
```javascript
{
  emotion: string,
  undertone: string | null,
  timestamp: number
}
```

**Example:**
```javascript
mascot.on('stateChange', (state) => {
  console.log(`Changed to ${state.emotion}`)

  if (state.undertone) {
    console.log(`with ${state.undertone} undertone`)
  }
})
```

---

### gestureComplete

Fired when a gesture animation completes.

**Payload:**
```javascript
{
  gestureName: string,
  duration: number,
  timestamp: number
}
```

**Example:**
```javascript
mascot.on('gestureComplete', (gesture) => {
  console.log(`${gesture.gestureName} finished`)

  // Chain another gesture
  if (gesture.gestureName === 'bounce') {
    mascot.express('spin')
  }
})
```

---

### morphComplete

Fired when shape morphing completes.

**Payload:**
```javascript
{
  fromShape: string,
  toShape: string,
  duration: number,
  timestamp: number
}
```

**Example:**
```javascript
mascot.on('morphComplete', (morph) => {
  console.log(`Morphed from ${morph.fromShape} to ${morph.toShape}`)
})
```

---

### beatDetected

Fired when a beat is detected in connected audio.

**Payload:**
```javascript
{
  time: number,
  bpm: number,
  confidence: number,
  beatNumber: number
}
```

**Example:**
```javascript
mascot.on('beatDetected', (beat) => {
  console.log(`Beat ${beat.beatNumber} at ${beat.bpm} BPM`)

  // Trigger gesture on every 4th beat
  if (beat.beatNumber % 4 === 0) {
    mascot.express('pulse')
  }
})
```

---

### performanceWarning

Fired when FPS drops below target.

**Payload:**
```javascript
{
  currentFPS: number,
  targetFPS: number,
  frameTime: number,
  particleCount: number
}
```

**Example:**
```javascript
mascot.on('performanceWarning', (metrics) => {
  console.warn(`FPS dropped to ${metrics.currentFPS}`)

  // Auto-reduce quality
  if (metrics.currentFPS < 30) {
    mascot.setQuality('low')
  }
})
```

---

### particleSpawn

Fired when new particles are created.

**Payload:**
```javascript
{
  count: number,
  totalParticles: number,
  maxParticles: number
}
```

**Example:**
```javascript
mascot.on('particleSpawn', (data) => {
  console.log(`Spawned ${data.count} particles`)
  console.log(`Total: ${data.totalParticles}/${data.maxParticles}`)
})
```

---

## Practical Examples

### Analytics Integration

Track user interactions:

```javascript
mascot.on('stateChange', (state) => {
  analytics.track('Emotion Changed', {
    emotion: state.emotion,
    undertone: state.undertone
  })
})

mascot.on('gestureComplete', (gesture) => {
  analytics.track('Gesture Performed', {
    gesture: gesture.gestureName,
    duration: gesture.duration
  })
})
```

### UI Synchronization

Update UI based on mascot state:

```javascript
const statusDisplay = document.getElementById('status')

mascot.on('stateChange', (state) => {
  statusDisplay.textContent = `Feeling ${state.emotion}`

  if (state.undertone) {
    statusDisplay.textContent += ` (${state.undertone})`
  }
})
```

### Beat-Synchronized Effects

Sync external effects to music:

```javascript
const lights = document.querySelectorAll('.light')

mascot.on('beatDetected', (beat) => {
  // Flash lights on beat
  lights.forEach(light => {
    light.classList.add('flash')
    setTimeout(() => light.classList.remove('flash'), 100)
  })
})
```

### Performance Monitoring

Auto-adjust quality based on performance:

```javascript
let warningCount = 0

mascot.on('performanceWarning', (metrics) => {
  warningCount++

  // After 3 warnings, reduce quality
  if (warningCount >= 3) {
    mascot.setQuality('low')
    console.log('Reduced quality due to performance')
    warningCount = 0
  }
})
```

### Gesture Chains

Create complex gesture sequences:

```javascript
const chain = ['bounce', 'spin', 'wave', 'pulse']
let currentIndex = 0

mascot.on('gestureComplete', (gesture) => {
  currentIndex++

  if (currentIndex < chain.length) {
    mascot.express(chain[currentIndex])
  }
})

// Start chain
mascot.express(chain[0])
```

### State Persistence

Save and restore mascot state:

```javascript
// Save state on change
mascot.on('stateChange', (state) => {
  localStorage.setItem('mascotState', JSON.stringify({
    emotion: state.emotion,
    undertone: state.undertone
  }))
})

// Restore on load
const savedState = localStorage.getItem('mascotState')
if (savedState) {
  const { emotion, undertone } = JSON.parse(savedState)
  mascot.setEmotion(emotion, undertone)
}
```

---

## Event Cleanup

Always clean up listeners when done:

```javascript
// React example
useEffect(() => {
  const handleStateChange = (state) => {
    console.log(state)
  }

  mascot.on('stateChange', handleStateChange)

  return () => {
    mascot.off('stateChange', handleStateChange)
  }
}, [mascot])
```

---

## See Also

- [Core Methods](/docs/api/core-methods)
- [Emotion Control](/docs/api/emotions)
- [Examples](/docs/examples/basic-setup)
