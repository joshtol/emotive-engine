# Emotive Engine Events

## Overview
The Emotive Engine uses an event-driven architecture to communicate state changes and user interactions. All events are emitted through the main mascot instance and can be listened to using the `on()` method.

## Event Listening

```javascript
// Listen to an event
mascot.on('emotionChanged', (data) => {
    console.log('Emotion changed:', data);
});

// Remove event listener
mascot.off('emotionChanged', handlerFunction);
```

---

## Gesture Events

### `gestureTriggered`
Fired when a gesture animation is initiated.

**Data:**
```javascript
{
    gesture: string,        // Name of the gesture (e.g., 'bounce', 'pulse')
    timestamp: number,      // When the gesture was triggered
    options: {              // Options passed to the gesture
        intensity?: number,
        duration?: number,
        fromGroove?: boolean
    }
}
```

### `gestureQueued`
Fired when a gesture is queued for rhythm-synced execution.

**Data:**
```javascript
{
    gesture: string,        // Name of the queued gesture
    beatNumber: number,     // Beat number it will execute on
    subdivision: number     // Beat subdivision (0, 0.25, 0.5, 0.75)
}
```

### `gestureComplete`
Fired when a gesture animation finishes.

**Data:**
```javascript
{
    gesture: string,        // Name of the completed gesture
    duration: number        // How long the gesture took (ms)
}
```

### `gestureChord`
Fired when multiple gestures execute simultaneously.

**Data:**
```javascript
{
    gestures: string[],     // Array of gesture names
    isEnhancing: boolean,   // Whether this is an enhancing combination
    timestamp: number       // When the chord was triggered
}
```

---

## Rhythm Events

### `rhythmLocked`
Fired when the rhythm detection locks onto a BPM.

**Data:**
```javascript
{
    bpm: number,           // Detected beats per minute
    confidence: number,    // Confidence level (0-1)
    source: string        // Detection source ('tap', 'audio', 'manual')
}
```

### `rhythmLost`
Fired when rhythm sync loses the beat.

**Data:**
```javascript
{
    lastBpm: number,       // Last known BPM before loss
    reason: string         // Why sync was lost
}
```

### `beat`
Fired on every detected beat.

**Data:**
```javascript
{
    beatNumber: number,    // Sequential beat counter
    timestamp: number,     // Precise timestamp of beat
    bpm: number,          // Current BPM
    subdivision: number   // 0 for downbeat
}
```

### `subdivisionBeat`
Fired on beat subdivisions (quarter notes).

**Data:**
```javascript
{
    beatNumber: number,    // Current beat number
    subdivision: number,   // 0.25, 0.5, or 0.75
    timestamp: number      // Precise timestamp
}
```

### `grooveChanged`
Fired when the groove template changes.

**Data:**
```javascript
{
    from: string,          // Previous groove name
    to: string,            // New groove name
    transition: string     // Transition type ('instant', 'nextBar', 'nextPhrase')
}
```

---

## Emotion & State Events

### `emotionChanged`
Fired when the mascot's emotional state changes.

**Data:**
```javascript
{
    from: string,          // Previous emotion
    to: string,            // New emotion
    undertone: string,     // Current undertone modifier
    trigger: string        // What triggered the change
}
```

### `undertoneChanged`
Fired when the emotional undertone changes.

**Data:**
```javascript
{
    from: string,          // Previous undertone
    to: string,            // New undertone
    emotion: string        // Current base emotion
}
```

### `stateTransition`
Fired during emotion state transitions.

**Data:**
```javascript
{
    from: string,          // Starting state
    to: string,            // Target state
    progress: number,      // Transition progress (0-1)
    duration: number       // Total transition duration (ms)
}
```

### `moodShift`
Fired when overall mood changes significantly.

**Data:**
```javascript
{
    valence: number,       // Emotional valence (-1 to 1)
    arousal: number,       // Emotional arousal (0 to 1)
    dominance: number      // Emotional dominance (0 to 1)
}
```

---

## Interaction Events

### `userInteraction`
Fired on any user interaction with the mascot.

**Data:**
```javascript
{
    type: string,          // Interaction type ('click', 'tap', 'hover', 'gesture')
    x: number,             // X coordinate (normalized 0-1)
    y: number,             // Y coordinate (normalized 0-1)
    timestamp: number      // When interaction occurred
}
```

### `gazeTarget`
Fired when gaze tracking updates.

**Data:**
```javascript
{
    x: number,             // Target X position
    y: number,             // Target Y position
    tracking: boolean      // Whether actively tracking
}
```

### `proximityChange`
Fired when user proximity changes (if supported).

**Data:**
```javascript
{
    distance: number,      // Normalized distance (0-1)
    entering: boolean      // True if approaching, false if leaving
}
```

---

## Audio Events

### `audioAnalysis`
Fired with audio analysis data.

**Data:**
```javascript
{
    volume: number,        // Current volume (0-1)
    frequency: number,     // Dominant frequency (Hz)
    bass: number,          // Bass level (0-1)
    treble: number,        // Treble level (0-1)
    waveform: Float32Array // Raw waveform data
}
```

### `soundPlayed`
Fired when a sound effect plays.

**Data:**
```javascript
{
    sound: string,         // Sound identifier
    gesture: string,       // Associated gesture (if any)
    volume: number         // Playback volume
}
```

---

## System Events

### `initialized`
Fired when the engine completes initialization.

**Data:**
```javascript
{
    version: string,       // Engine version
    features: string[],    // Enabled features
    timestamp: number      // Init completion time
}
```

### `error`
Fired when an error occurs.

**Data:**
```javascript
{
    code: string,          // Error code
    message: string,       // Error message
    severity: string,      // 'warning' | 'error' | 'critical'
    context: object        // Additional context
}
```

### `performanceWarning`
Fired when performance degrades.

**Data:**
```javascript
{
    fps: number,           // Current FPS
    targetFps: number,     // Target FPS
    frameTime: number,     // Frame render time (ms)
    suggestion: string     // Performance improvement suggestion
}
```

### `configChanged`
Fired when configuration changes.

**Data:**
```javascript
{
    setting: string,       // Setting that changed
    oldValue: any,         // Previous value
    newValue: any,         // New value
    source: string         // Change source ('user', 'auto', 'system')
}
```

---

## Recording Events

### `recordingStarted`
Fired when timeline recording begins.

**Data:**
```javascript
{
    timestamp: number      // Recording start time
}
```

### `recordingStopped`
Fired when timeline recording ends.

**Data:**
```javascript
{
    duration: number,      // Total recording duration (ms)
    eventCount: number,    // Number of events recorded
    timeline: object[]     // Recorded timeline data
}
```

### `playbackStarted`
Fired when timeline playback begins.

**Data:**
```javascript
{
    duration: number,      // Playback duration (ms)
    eventCount: number     // Number of events to play
}
```

### `playbackComplete`
Fired when timeline playback finishes.

**Data:**
```javascript
{
    duration: number       // Actual playback duration
}
```

---

## Usage Examples

### Basic Event Listening
```javascript
// Listen for emotion changes
mascot.on('emotionChanged', (data) => {
    console.log(`Emotion changed from ${data.from} to ${data.to}`);
});

// Listen for rhythm events
mascot.on('rhythmLocked', (data) => {
    console.log(`Locked to ${data.bpm} BPM with ${data.confidence} confidence`);
});

// Listen for gestures
mascot.on('gestureTriggered', (data) => {
    console.log(`Gesture ${data.gesture} triggered`);
});
```

### Event Chaining
```javascript
// Chain reactions to events
mascot.on('beat', (data) => {
    if (data.beatNumber % 4 === 0) {
        mascot.express('bounce');
    }
});

// Respond to user interaction
mascot.on('userInteraction', (data) => {
    if (data.type === 'click') {
        mascot.express('wave');
    }
});
```

### Performance Monitoring
```javascript
// Monitor performance
mascot.on('performanceWarning', (data) => {
    if (data.fps < 30) {
        // Reduce quality settings
        mascot.setConfig('particleIntensity', 0.5);
    }
});
```

### Error Handling
```javascript
// Handle errors gracefully
mascot.on('error', (data) => {
    if (data.severity === 'critical') {
        // Attempt recovery
        mascot.reset();
    } else {
        console.warn('Non-critical error:', data.message);
    }
});
```

---

## Event Flow Diagram

```
User Input → Gesture Controller → gestureTriggered → Animation System
                    ↓
            Rhythm Sync Check → gestureQueued → Beat Event → Execute
                    ↓
            Direct Execute → Renderer → gestureComplete
                    ↓
            State Change → emotionChanged → Visual Update
```

---

## Notes

- All events are emitted asynchronously
- Event data objects are immutable (frozen)
- Multiple listeners can be attached to the same event
- Events bubble up from internal systems to the public API
- Some events may be throttled for performance (e.g., audioAnalysis)
- Use the `off()` method to prevent memory leaks when removing components