---
title: "Core Methods"
category: "API Reference"
order: 4
description: "Lifecycle and control methods"
---

# Core Methods

## Lifecycle Methods

### start()

Starts the animation loop.

```javascript
mascot.start()
```

**Returns:** `void`

**When to use:**
- After initialization
- After calling `stop()` or `pause()`
- When resuming from a paused state

---

### stop()

Stops the animation loop completely.

```javascript
mascot.stop()
```

**Returns:** `void`

**Note:** Use `pause()` instead if you plan to resume soon. `stop()` is more aggressive and clears more state.

---

### pause()

Temporarily pauses the animation.

```javascript
mascot.pause()
```

**Returns:** `void`

**Difference from stop():**
- `pause()` maintains state for smooth resumption
- `stop()` clears more internal state

---

### resume()

Resumes a paused animation.

```javascript
mascot.resume()
```

**Returns:** `void`

**Example:**
```javascript
// Pause on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    mascot.pause()
  } else {
    mascot.resume()
  }
})
```

---

### destroy()

Cleans up resources and removes event listeners.

```javascript
mascot.destroy()
```

**Returns:** `void`

**What it does:**
- Stops animation loop
- Removes event listeners
- Clears particle system
- Disconnects audio
- Frees memory

**Example:**
```javascript
// React cleanup
useEffect(() => {
  return () => {
    mascot.destroy()
  }
}, [])
```

---

## Audio Methods

### connectAudio(audioElement)

Connects an audio element for visualization.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `audioElement` | `HTMLAudioElement` | Yes | Audio element to connect |

```javascript
const audio = document.getElementById('music')
mascot.connectAudio(audio)

// Play audio
audio.play()
```

**Features enabled:**
- Real-time beat detection
- BPM tracking
- Frequency spectrum visualization
- Audio-reactive deformation

---

### disconnectAudio()

Disconnects the current audio source.

```javascript
mascot.disconnectAudio()
```

**Returns:** `void`

---

### setBPM(bpm)

Manually sets the BPM for rhythm synchronization.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bpm` | `number` | Yes | Beats per minute (40-240) |

```javascript
mascot.setBPM(120) // 120 BPM

// Gestures now sync to this tempo
mascot.express('bounce')
```

**When to use:**
- When you know the BPM of your music
- For non-audio rhythmic animations
- To override auto-detected BPM

---

### getSpectrumData()

Gets frequency spectrum data for visualization.

**Returns:** `number[]` - Array of normalized frequency values (0-1)

```javascript
const spectrum = mascot.getSpectrumData()

// Use for custom visualizations
spectrum.forEach((value, index) => {
  console.log(`Band ${index}: ${value * 100}%`)
})
```

---

## Position & Scale Methods

### setPosition(x, y, z)

Sets mascot position offset from viewport center.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `x` | `number` | Yes | - | X offset (pixels) |
| `y` | `number` | Yes | - | Y offset (pixels) |
| `z` | `number` | No | `0` | Z depth for scaling |

```javascript
// Center
mascot.setPosition(0, 0)

// Top-right corner
mascot.setPosition(200, -200)

// With depth (smaller)
mascot.setPosition(0, 0, -100)
```

---

### animateToPosition(x, y, z, duration, easing)

Animates mascot to a position with easing.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x` | `number` | Required | Target X offset |
| `y` | `number` | Required | Target Y offset |
| `z` | `number` | `0` | Target Z offset |
| `duration` | `number` | `1000` | Animation duration (ms) |
| `easing` | `string` | `'easeOutCubic'` | Easing function |

**Available Easing:**
- `linear`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInBack`, `easeOutBack`

```javascript
// Smooth float to corner
mascot.animateToPosition(200, -200, 0, 2000, 'easeOutCubic')
```

---

### setScale(options)

Sets global or independent scale.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `number \| Object` | Scale value or options object |

**Options object:**

| Property | Type | Description |
|----------|------|-------------|
| `global` | `number` | Scale both core and particles |
| `core` | `number` | Scale only core |
| `particles` | `number` | Scale only particles |

```javascript
// Global scale
mascot.setScale(0.6)

// Independent control
mascot.setScale({
  core: 0.5,
  particles: 1.2
})
```

---

### clearParticles()

Clears all particles from the system.

```javascript
mascot.clearParticles()
```

**When to use:**
- After repositioning
- When changing emotions rapidly
- To remove artifact particles

---

## Utility Methods

### getPerformanceMetrics()

Gets current performance data.

**Returns:** `Object`

```javascript
const metrics = mascot.getPerformanceMetrics()

console.log(metrics)
// {
//   fps: 60,
//   frameTime: 16.67,
//   particleCount: 150
// }
```

---

### setQuality(level)

Sets performance quality level.

**Parameters:**

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `level` | `string` | `'low'`, `'medium'`, `'high'` | Quality preset |

```javascript
// Detect and set quality
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
mascot.setQuality(isMobile ? 'low' : 'high')
```

**Quality Presets:**

| Level | Particles | FPS |
|-------|-----------|-----|
| `low` | 50 | 30 |
| `medium` | 100 | 60 |
| `high` | 200 | 60 |

---

## Event Methods

### on(event, callback)

Registers an event listener.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `event` | `string` | Event name |
| `callback` | `Function` | Handler function |

**Available Events:**
- `stateChange` - Emotion changed
- `gestureComplete` - Gesture finished
- `morphComplete` - Shape morph done
- `beatDetected` - Beat detected in audio

```javascript
mascot.on('stateChange', (state) => {
  console.log('New emotion:', state.emotion)
})

mascot.on('beatDetected', (beat) => {
  console.log('Beat at', beat.time)
})
```

---

### off(event, callback)

Removes an event listener.

```javascript
const handler = (state) => console.log(state)

mascot.on('stateChange', handler)
mascot.off('stateChange', handler)
```

---

## See Also

- [Constructor](/docs/api/constructor)
- [Emotion Control](/docs/api/emotions)
- [Events](/docs/api/events)
