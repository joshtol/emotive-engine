# Emotive Engine Public API

## Overview
The Emotive Engine provides a clean, simple API for integrating an expressive, animated mascot into your web applications. The engine handles all rendering, animation, and state management internally while exposing intuitive methods for control.

## Version
Current Version: **2.0.0**

---

## Quick Start

```javascript
// Get the engine
import { EmotiveMascot } from './emotive-engine.js';

// Create instance
const mascot = new EmotiveMascot();

// Initialize with canvas
const canvas = document.getElementById('mascot-canvas');
await mascot.init(canvas);

// Start animation
mascot.start();

// Express gestures
mascot.triggerGesture('bounce');

// Set emotions
mascot.setEmotion('happy', 'energetic');
```

---

## Core Methods

### Initialization

#### `init(canvas)`
Initializes the Emotive Engine with a canvas element.

**Parameters:**
- `canvas` (HTMLCanvasElement) - The canvas element to render to

**Returns:**
- `Promise<void>` - Resolves when initialization is complete

**Example:**
```javascript
const canvas = document.getElementById('emotive-canvas');
await mascot.init(canvas);
```

---

### Animation Control

#### `start()`
Starts the animation render loop.

**Returns:**
- `void`

**Example:**
```javascript
mascot.start();
```

#### `stop()`
Stops the animation render loop.

**Returns:**
- `void`

**Example:**
```javascript
mascot.stop();
```

#### `pause()`
Pauses the animation while maintaining state.

**Returns:**
- `void`

**Example:**
```javascript
mascot.pause();
```

#### `resume()`
Resumes the animation from paused state.

**Returns:**
- `void`

**Example:**
```javascript
mascot.resume();
```

---

### Gesture System

#### `triggerGesture(gestureName, timestamp)`
Triggers a gesture animation.

**Parameters:**
- `gestureName` (string) - Name of the gesture to trigger
- `timestamp` (number, optional) - Timestamp for recording mode

**Returns:**
- `void`

**Available Gestures:**
- **Movement**: `bounce`, `spin`, `orbit`, `sway`, `jump`, `twist`, `float`
- **Expression**: `wave`, `nod`, `shake`, `point`, `lean`, `tilt`, `wiggle`
- **Effects**: `pulse`, `glow`, `sparkle`, `shimmer`, `flash`
- **Ambient**: `breathe`, `idle`
- **Groove**: `grooveSway`, `grooveBob`, `grooveFlow`, `groovePulse`, `grooveStep`

**Example:**
```javascript
// Simple gesture
mascot.triggerGesture('bounce');

// With recording timestamp
mascot.triggerGesture('wave', 1000);
```

---

### Emotion System

#### `setEmotion(emotion, undertone, timestamp)`
Sets the mascot's emotional state with optional undertone.

**Parameters:**
- `emotion` (string) - Base emotion state
- `undertone` (string, optional) - Emotion modifier/undertone
- `timestamp` (number, optional) - Timestamp for recording mode

**Base Emotions:**
- `happy` - Joyful, positive state
- `sad` - Melancholic, low energy state
- `excited` - High energy, enthusiastic state
- `calm` - Peaceful, serene state
- `neutral` - Default balanced state
- `curious` - Inquisitive, attentive state
- `confused` - Puzzled, uncertain state

**Undertones:**
- `energetic` - Increases animation intensity
- `mellow` - Decreases animation intensity
- `playful` - Adds bounce to animations
- `focused` - More deliberate movements
- `dreamy` - Softer, floating movements

**Example:**
```javascript
// Simple emotion
mascot.setEmotion('happy');

// With undertone
mascot.setEmotion('excited', 'playful');

// With recording timestamp
mascot.setEmotion('calm', 'dreamy', 2000);
```

---

### State Management

#### `getState()`
Returns the current state of the mascot.

**Returns:**
```javascript
{
    emotion: string,        // Current emotion
    undertone: string,      // Current undertone
    isAnimating: boolean,   // Animation status
    isRecording: boolean,   // Recording status
    rhythm: {
        active: boolean,    // Rhythm sync status
        bpm: number        // Current BPM (if active)
    }
}
```

**Example:**
```javascript
const state = mascot.getState();
console.log(`Current emotion: ${state.emotion}`);
```

---

### Audio Integration

#### `loadAudio(source)`
Loads audio for rhythm detection and visualization.

**Parameters:**
- `source` (string|Blob) - Audio URL or Blob object

**Returns:**
- `Promise<void>` - Resolves when audio is loaded

**Example:**
```javascript
// Load from URL
await mascot.loadAudio('music.mp3');

// Load from Blob
const audioBlob = await fetch('music.mp3').then(r => r.blob());
await mascot.loadAudio(audioBlob);
```

#### `playAudio()`
Plays the loaded audio.

**Returns:**
- `void`

**Example:**
```javascript
mascot.playAudio();
```

#### `pauseAudio()`
Pauses audio playback.

**Returns:**
- `void`

#### `stopAudio()`
Stops audio playback and resets to beginning.

**Returns:**
- `void`

---

### Recording & Playback

#### `startRecording()`
Starts recording gestures and emotions to a timeline.

**Returns:**
- `void`

**Example:**
```javascript
mascot.startRecording();
// Perform gestures and emotion changes
mascot.triggerGesture('bounce');
mascot.setEmotion('happy');
const timeline = mascot.stopRecording();
```

#### `stopRecording()`
Stops recording and returns the timeline.

**Returns:**
- `Array<Object>` - Timeline of recorded events

**Timeline Event Structure:**
```javascript
{
    type: 'gesture' | 'emotion',
    name: string,           // Gesture or emotion name
    time: number,           // Timestamp in ms
    undertone?: string      // For emotion events
}
```

#### `playTimeline(timeline, options)`
Plays back a recorded timeline.

**Parameters:**
- `timeline` (Array<Object>) - Timeline array to play
- `options` (Object, optional) - Playback options
  - `loop` (boolean) - Whether to loop playback
  - `speed` (number) - Playback speed multiplier

**Returns:**
- `Promise<void>` - Resolves when playback completes

**Example:**
```javascript
const timeline = mascot.stopRecording();
await mascot.playTimeline(timeline, { loop: true, speed: 1.0 });
```

#### `stopPlayback()`
Stops timeline playback.

**Returns:**
- `void`

---

### Rhythm Integration

#### `enableRhythmSync()`
Enables rhythm synchronization for gesture timing.

**Returns:**
- `void`

**Example:**
```javascript
mascot.enableRhythmSync();
// Gestures will now sync to detected rhythm
```

#### `disableRhythmSync()`
Disables rhythm synchronization.

**Returns:**
- `void`

#### `setBPM(bpm)`
Manually sets the beats per minute for rhythm sync.

**Parameters:**
- `bpm` (number) - Beats per minute (60-200)

**Returns:**
- `void`

**Example:**
```javascript
mascot.setBPM(120);
```

---

### Configuration

#### `setConfig(key, value)`
Updates a configuration setting.

**Parameters:**
- `key` (string) - Configuration key
- `value` (any) - New value

**Available Settings:**
- `particleIntensity` (number: 0-1) - Particle effect intensity
- `glowIntensity` (number: 0-1) - Glow effect intensity
- `audioEnabled` (boolean) - Enable/disable audio
- `debugMode` (boolean) - Enable/disable debug mode

**Example:**
```javascript
mascot.setConfig('particleIntensity', 0.5);
mascot.setConfig('debugMode', true);
```

#### `getConfig(key)`
Gets a configuration value.

**Parameters:**
- `key` (string) - Configuration key

**Returns:**
- `any` - Configuration value

---

### Cleanup

#### `destroy()`
Destroys the engine and cleans up all resources.

**Returns:**
- `void`

**Example:**
```javascript
// Clean up when done
mascot.destroy();
```

---

## Advanced Usage

### Gesture Combinations
```javascript
// Trigger multiple gestures in sequence
async function gestureCombo() {
    mascot.triggerGesture('bounce');
    await delay(500);
    mascot.triggerGesture('spin');
    await delay(500);
    mascot.triggerGesture('sparkle');
}
```

### Emotion Transitions
```javascript
// Smooth emotion transitions
async function emotionFlow() {
    mascot.setEmotion('neutral');
    await delay(1000);
    mascot.setEmotion('curious', 'focused');
    await delay(2000);
    mascot.setEmotion('happy', 'energetic');
}
```

### Rhythm-Synced Performance
```javascript
// Create rhythm-synced show
mascot.enableRhythmSync();
mascot.loadAudio('music.mp3');
mascot.playAudio();

// Gestures will automatically sync to beat
mascot.triggerGesture('bounce');
setTimeout(() => mascot.triggerGesture('spin'), 1000);
```

### Recording Performances
```javascript
// Record a performance
mascot.startRecording();

// Perform sequence
mascot.setEmotion('excited');
mascot.triggerGesture('bounce');
await delay(1000);
mascot.triggerGesture('spin');
await delay(1000);
mascot.setEmotion('happy', 'playful');

// Save timeline
const performance = mascot.stopRecording();
localStorage.setItem('performance', JSON.stringify(performance));

// Later, replay it
const saved = JSON.parse(localStorage.getItem('performance'));
mascot.playTimeline(saved, { loop: true });
```

---

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Requires:
- ES6 module support
- Canvas 2D context
- Web Audio API (for audio features)
- RequestAnimationFrame

---

## Performance Considerations

### Optimization Tips
1. **Canvas Size**: Keep canvas dimensions reasonable (< 1920x1080)
2. **Particle Effects**: Reduce `particleIntensity` on lower-end devices
3. **Debug Mode**: Disable in production for better performance
4. **Gesture Frequency**: Avoid triggering gestures too rapidly (< 100ms apart)

### Resource Management
```javascript
// Always clean up when unmounting
window.addEventListener('beforeunload', () => {
    mascot.destroy();
});

// Pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        mascot.pause();
    } else {
        mascot.resume();
    }
});
```

---

## Error Handling

All methods that require initialization will throw an error if called before `init()`:

```javascript
try {
    mascot.triggerGesture('bounce');
} catch (error) {
    console.error('Engine not initialized:', error);
}
```

Async methods return promises that can be caught:

```javascript
mascot.init(canvas)
    .then(() => mascot.start())
    .catch(error => console.error('Init failed:', error));
```

---

## Migration from v1.x

### Breaking Changes
- `express()` renamed to `triggerGesture()`
- `setMood()` replaced by `setEmotion()` with undertones
- Event system moved to internal engine (use timeline recording instead)

### New Features in v2.0
- Undertone system for emotion variations
- Timeline recording and playback
- Rhythm synchronization
- Groove templates
- Enhanced gesture system

---

## Support

For issues, feature requests, or questions:
- GitHub: https://github.com/yourusername/emotive-engine
- Documentation: https://emotive-engine.dev/docs
- Discord: https://discord.gg/emotive

---

## License

MIT License - See LICENSE file for details