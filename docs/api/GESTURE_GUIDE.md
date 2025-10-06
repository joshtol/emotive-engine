# Emotive Engine Gesture Guide

This guide provides detailed information about all available gestures, how to use them effectively, and how to create custom gestures.

## Table of Contents
- [Gesture Categories](#gesture-categories)
- [Movement Gestures](#movement-gestures)
- [Expression Gestures](#expression-gestures)
- [Effect Gestures](#effect-gestures)
- [Ambient Gestures](#ambient-gestures)
- [Groove Gestures](#groove-gestures)
- [Gesture Combinations](#gesture-combinations)
- [Rhythm Synchronization](#rhythm-synchronization)
- [Custom Gestures](#custom-gestures)
- [Performance Tips](#performance-tips)

## Gesture Categories

Gestures are organized into five main categories, each serving a different purpose:

| Category | Purpose | Duration | Interruptible |
|----------|---------|----------|---------------|
| **Movement** | Physical motion animations | 1-2 seconds | Yes |
| **Expression** | Emotional expressions | 0.5-1.5 seconds | Yes |
| **Effects** | Visual effects and enhancements | 0.5-2 seconds | Yes |
| **Ambient** | Continuous background animations | Infinite | No |
| **Groove** | Music-synced movements | Infinite | Yes |

## Movement Gestures

Movement gestures create physical motion animations that make the mascot appear alive and dynamic.

### bounce
**Description**: Vertical bouncing motion
```javascript
mascot.triggerGesture('bounce');
```
- **Duration**: 1000ms
- **Best for**: Excitement, happiness, energy
- **Combines well with**: `pulse`, `sparkle`

### spin
**Description**: 360-degree rotation
```javascript
mascot.triggerGesture('spin');
```
- **Duration**: 1500ms
- **Best for**: Celebration, confusion, transition
- **Combines well with**: `glow`, `shimmer`

### orbit
**Description**: Circular orbital motion
```javascript
mascot.triggerGesture('orbit');
```
- **Duration**: 2000ms
- **Best for**: Mystical, dreamy, floating
- **Combines well with**: `sparkle`, `drift`

### sway
**Description**: Gentle side-to-side swaying
```javascript
mascot.triggerGesture('sway');
```
- **Duration**: 1500ms
- **Best for**: Calm, relaxed, thinking
- **Combines well with**: `breathe`, `glow`

### jump
**Description**: Quick jumping motion with squash and stretch
```javascript
mascot.triggerGesture('jump');
```
- **Duration**: 800ms
- **Best for**: Surprise, excitement, attention
- **Combines well with**: `flash`, `bounce`

### twist
**Description**: Twisting rotation alternating directions
```javascript
mascot.triggerGesture('twist');
```
- **Duration**: 1200ms
- **Best for**: Playful, confused, energetic
- **Combines well with**: `vibrate`, `pulse`

### float
**Description**: Gentle floating up and down
```javascript
mascot.triggerGesture('float');
```
- **Duration**: 2000ms
- **Best for**: Dreamy, calm, ethereal
- **Combines well with**: `breathe`, `shimmer`

### wiggle
**Description**: Rapid small movements
```javascript
mascot.triggerGesture('wiggle');
```
- **Duration**: 600ms
- **Best for**: Excited, impatient, playful
- **Combines well with**: `vibrate`, `sparkle`

### lean
**Description**: Tilting side to side
```javascript
mascot.triggerGesture('lean');
```
- **Duration**: 1000ms
- **Best for**: Curious, questioning, examining
- **Combines well with**: `tilt`, `nod`

## Expression Gestures

Expression gestures convey emotions and reactions through recognizable movements.

### wave
**Description**: Friendly waving motion
```javascript
mascot.triggerGesture('wave');
```
- **Duration**: 1000ms
- **Best for**: Greeting, farewell, acknowledgment
- **Combines well with**: `bounce`, `happy` emotion

### nod
**Description**: Vertical nodding motion
```javascript
mascot.triggerGesture('nod');
```
- **Duration**: 800ms
- **Best for**: Agreement, understanding, yes
- **Combines well with**: `pulse`, `calm` emotion

### shake
**Description**: Horizontal shaking motion
```javascript
mascot.triggerGesture('shake');
```
- **Duration**: 800ms
- **Best for**: Disagreement, no, rejection
- **Combines well with**: `vibrate`, `confused` emotion

### point
**Description**: Pointing gesture
```javascript
mascot.triggerGesture('point');
```
- **Duration**: 1200ms
- **Best for**: Direction, attention, selection
- **Combines well with**: `flash`, `curious` emotion

### tilt
**Description**: Head tilting motion
```javascript
mascot.triggerGesture('tilt');
```
- **Duration**: 1000ms
- **Best for**: Confusion, curiosity, questioning
- **Combines well with**: `lean`, `confused` emotion

### reach
**Description**: Reaching out motion
```javascript
mascot.triggerGesture('reach');
```
- **Duration**: 1500ms
- **Best for**: Desire, request, connection
- **Combines well with**: `glow`, `love` emotion

### shrug
**Description**: Shrugging motion
```javascript
mascot.triggerGesture('shrug');
```
- **Duration**: 1000ms
- **Best for**: Uncertainty, indifference, "I don't know"
- **Combines well with**: `tilt`, `neutral` emotion

## Effect Gestures

Effect gestures add visual flair and emphasis through particle effects and visual changes.

### pulse
**Description**: Rhythmic size pulsing
```javascript
mascot.triggerGesture('pulse');
```
- **Duration**: 1000ms
- **Best for**: Heartbeat, rhythm, emphasis
- **Combines well with**: Any emotion, `glow`

### glow
**Description**: Intensified glowing effect
```javascript
mascot.triggerGesture('glow');
```
- **Duration**: 1500ms
- **Best for**: Power, magic, attention
- **Combines well with**: `happy`, `excited` emotions

### sparkle
**Description**: Sparkling particle effects
```javascript
mascot.triggerGesture('sparkle');
```
- **Duration**: 2000ms
- **Best for**: Magic, celebration, special moments
- **Particle intensive**: Yes
- **Combines well with**: `spin`, `bounce`

### shimmer
**Description**: Shimmering wave effect
```javascript
mascot.triggerGesture('shimmer');
```
- **Duration**: 1500ms
- **Best for**: Transformation, magic, dreams
- **Combines well with**: `float`, `orbit`

### flash
**Description**: Quick bright flash
```javascript
mascot.triggerGesture('flash');
```
- **Duration**: 500ms
- **Best for**: Surprise, realization, impact
- **Combines well with**: `jump`, `excited` emotion

### chromaticAberration
**Description**: Temporary red/cyan separation applied to the entire canvas for high-impact gestures.
```javascript
mascot.renderer.specialEffects.triggerChromaticAberration(0.9);
```
- **Duration**: 300-500ms fade depending on intensity
- **Auto triggers**: bounce, shake, pulse, flash, jump, slam, spin, flicker
- **Tuning tips**: Use intensities between 0.4 and 1.0; pair with sparkle or glow for highlight moments

### flicker
**Description**: Rapid opacity flickering
```javascript
mascot.triggerGesture('flicker');
```
- **Duration**: 800ms
- **Best for**: Glitch, uncertainty, transition
- **Combines well with**: `vibrate`, `confused` emotion

### vibrate
**Description**: Rapid vibration effect
```javascript
mascot.triggerGesture('vibrate');
```
- **Duration**: 600ms
- **Best for**: Alert, error, intensity
- **Combines well with**: `shake`, `angry` emotion

## Ambient Gestures

Ambient gestures run continuously in the background, providing subtle life to the mascot.

### breathe
**Description**: Natural breathing animation
```javascript
mascot.triggerGesture('breathe');
```
- **Duration**: Infinite
- **Best for**: Idle state, calm, alive
- **Subtle**: Yes
- **Can layer with**: Most other gestures

### idle
**Description**: Subtle idle movements
```javascript
mascot.triggerGesture('idle');
```
- **Duration**: Infinite
- **Best for**: Default state, waiting
- **Includes**: Small movements, occasional blinks

### drift
**Description**: Slow drifting motion
```javascript
mascot.triggerGesture('drift');
```
- **Duration**: Infinite
- **Best for**: Dreamy, floating, space
- **Can layer with**: `float`, `orbit`

## Groove Gestures

Groove gestures are rhythm-aware animations that sync with music or BPM.

### grooveSway
**Description**: Rhythmic swaying to the beat
```javascript
mascot.enableRhythmSync();
mascot.triggerGesture('grooveSway');
```
- **Duration**: Infinite (beat-synced)
- **Best BPM range**: 60-100
- **Style**: Smooth, relaxed

### grooveBob
**Description**: Head bobbing to the beat
```javascript
mascot.enableRhythmSync();
mascot.triggerGesture('grooveBob');
```
- **Duration**: Infinite (beat-synced)
- **Best BPM range**: 90-130
- **Style**: Energetic, fun

### grooveFlow
**Description**: Flowing dance movements
```javascript
mascot.enableRhythmSync();
mascot.triggerGesture('grooveFlow');
```
- **Duration**: Infinite (beat-synced)
- **Best BPM range**: 100-140
- **Style**: Smooth, continuous

### groovePulse
**Description**: Pulsing to the beat
```javascript
mascot.enableRhythmSync();
mascot.triggerGesture('groovePulse');
```
- **Duration**: Infinite (beat-synced)
- **Best BPM range**: 120-160
- **Style**: Electronic, intense

### grooveStep
**Description**: Stepping dance moves
```javascript
mascot.enableRhythmSync();
mascot.triggerGesture('grooveStep');
```
- **Duration**: Infinite (beat-synced)
- **Best BPM range**: 110-140
- **Style**: Structured, rhythmic

## Gesture Combinations

### Chaining Gestures
Queue multiple gestures for sequential execution:
```javascript
mascot.triggerGesture('wave');
mascot.triggerGesture('bounce');
mascot.triggerGesture('spin');
```

### Gesture + Emotion Combos
Combine gestures with emotions for expressive animations:
```javascript
// Happy greeting
mascot.setEmotion('happy', 'energetic');
mascot.triggerGesture('wave');
mascot.triggerGesture('bounce');

// Confused examination
mascot.setEmotion('confused');
mascot.triggerGesture('lean');
mascot.triggerGesture('tilt');
mascot.triggerGesture('shake');

// Excited celebration
mascot.setEmotion('excited', 'wild');
mascot.triggerGesture('jump');
mascot.triggerGesture('spin');
mascot.triggerGesture('sparkle');
```

### Layered Effects
Some gestures can run simultaneously:
```javascript
// Ambient + action
mascot.triggerGesture('breathe');  // Continuous
mascot.triggerGesture('wave');     // Plays over breathing

// Effect stacking
mascot.triggerGesture('glow');
mascot.triggerGesture('pulse');
```

## Rhythm Synchronization

### Basic Rhythm Sync
```javascript
// Enable rhythm sync
mascot.enableRhythmSync();

// Set specific BPM
mascot.setBPM(120);

// Trigger beat-aware gesture
mascot.triggerGesture('grooveBob');
```

### Music Integration
```javascript
// Connect to audio source
const audio = document.getElementById('music');
mascot.connectAudioSource(audio);

// Enable auto-BPM detection
mascot.enableRhythmSync();

// Gestures will now sync to detected beats
mascot.triggerGesture('groovePulse');
```

### Tap Tempo
```javascript
// User taps to set tempo
button.addEventListener('click', () => {
    mascot.tap();
});

// After 4+ taps, BPM is detected
const bpm = mascot.getCurrentBPM();
console.log(`Detected BPM: ${bpm}`);
```

### Beat-Aligned Gestures
```javascript
// Schedule gesture on next beat
mascot.triggerGestureOnBeat('bounce');

// Schedule gesture on specific beat
mascot.triggerGestureOnBeat('spin', 4); // On 4th beat
```

## Custom Gestures

### Creating a Simple Custom Gesture
```javascript
// Define custom gesture
const customGesture = {
    name: 'myGesture',
    type: 'gesture',
    category: 'movement',
    duration: 1000,
    animation: {
        x: { amplitude: 50, frequency: 2 },
        y: { amplitude: 30, frequency: 1 },
        rotation: { amplitude: 0.5, frequency: 1 }
    }
};

// Register gesture
mascot.registerGesture(customGesture);

// Use it
mascot.triggerGesture('myGesture');
```

### Complex Custom Gesture
```javascript
const complexGesture = {
    name: 'tornado',
    type: 'gesture',
    category: 'movement',
    duration: 2000,
    keyframes: [
        { time: 0, x: 0, y: 0, scale: 1, rotation: 0 },
        { time: 0.25, x: 50, y: -30, scale: 1.1, rotation: Math.PI/2 },
        { time: 0.5, x: 0, y: -50, scale: 1.2, rotation: Math.PI },
        { time: 0.75, x: -50, y: -30, scale: 1.1, rotation: Math.PI*1.5 },
        { time: 1, x: 0, y: 0, scale: 1, rotation: Math.PI*2 }
    ],
    particles: {
        enabled: true,
        count: 20,
        spread: 100,
        velocity: 200
    }
};

mascot.registerGesture(complexGesture);
```

### Composite Gestures
```javascript
// Create gesture that combines multiple effects
const compositeGesture = {
    name: 'superCelebrate',
    type: 'composite',
    sequence: [
        { gesture: 'jump', delay: 0 },
        { gesture: 'spin', delay: 500 },
        { gesture: 'sparkle', delay: 800 },
        { gesture: 'glow', delay: 1000 }
    ]
};

mascot.registerGesture(compositeGesture);
```

## Performance Tips

### Optimize for Mobile
```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const config = {
    canvasId: 'mascot-canvas',
    enableAudio: true,
    enableAutoOptimization: true,
    enableGracefulDegradation: true,
    maxParticles: isMobile() ? 50 : 140
};

const mascot = new EmotiveMascot(config);
```

### Gesture Queue Management
```javascript
// Limit queue size
mascot.setConfig({ gestureQueueSize: 5 });

// Clear queue if needed
mascot.clearGestureQueue();

// Check queue status
const queueLength = mascot.getGestureQueueLength();
```

### Performance-Aware Usage
```javascript
// Check current performance
const metrics = mascot.getPerformanceMetrics();

if (metrics.fps < 30) {
    // Reduce effects
    mascot.setQuality('low');

    // Avoid particle-heavy gestures
    // Use 'glow' instead of 'sparkle'
    mascot.triggerGesture('glow');
}
```

### Batch Operations
```javascript
// Batch multiple operations for better performance
mascot.batch(() => {
    mascot.setEmotion('happy');
    mascot.triggerGesture('bounce');
    mascot.setConfig({ particleIntensity: 0.8 });
});
```

## Best Practices

### 1. Match Gestures to Context
```javascript
// User achievement
function celebrateAchievement() {
    mascot.setEmotion('excited');
    mascot.triggerGesture('jump');
    mascot.triggerGesture('sparkle');
}

// User error
function showError() {
    mascot.setEmotion('confused');
    mascot.triggerGesture('shake');
    mascot.triggerGesture('vibrate');
}
```

### 2. Use Appropriate Timing
```javascript
// Don't spam gestures
let lastGestureTime = 0;

function safeGesture(gestureName) {
    const now = Date.now();
    if (now - lastGestureTime > 500) { // 500ms minimum gap
        mascot.triggerGesture(gestureName);
        lastGestureTime = now;
    }
}
```

### 3. Consider User Preferences
```javascript
// Respect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mascot.setConfig({
        gestureIntensity: 0.5,
        particleIntensity: 0.3
    });
}
```

### 4. Test Gesture Combinations
```javascript
// Test different combinations
const testCombinations = [
    ['wave', 'bounce'],
    ['spin', 'glow'],
    ['tilt', 'shake'],
    ['float', 'shimmer']
];

// Cycle through combinations
testCombinations.forEach((combo, index) => {
    setTimeout(() => {
        combo.forEach(gesture => mascot.triggerGesture(gesture));
    }, index * 3000);
});
```

## Troubleshooting

### Gesture Not Playing
```javascript
// Check if gesture exists
if (!mascot.hasGesture('myGesture')) {
    console.error('Gesture not found');
}

// Check if mascot is running
if (!mascot.isAnimating()) {
    mascot.start();
}

// Check queue status
if (mascot.getGestureQueueLength() > 10) {
    mascot.clearGestureQueue();
}
```

### Gesture Looks Wrong
```javascript
// Reset to defaults
mascot.resetGestureConfig();

// Check emotion influence
mascot.setEmotion('neutral'); // Remove emotion effects

// Verify configuration
const config = mascot.getConfig();
console.log('Current config:', config);
```

### Performance Issues
```javascript
// Monitor performance
mascot.on('performance:warning', (data) => {
    console.warn('Performance issue:', data);

    // Auto-adjust quality
    if (data.fps < 30) {
        mascot.setQuality('low');
    }
});
```

## Summary

The gesture system is designed to be:
- **Expressive**: Wide variety of movements and effects
- **Flexible**: Combine gestures with emotions and rhythms
- **Performant**: Optimized for smooth animation
- **Extensible**: Create your own custom gestures

Experiment with different combinations to bring your mascot to life!

---

For more information, see:
- [API Reference](../site/src/docs/PUBLIC_API.md)
- [Getting Started](./GETTING_STARTED.md)
- [Events Guide](../site/src/docs/EVENTS.md)