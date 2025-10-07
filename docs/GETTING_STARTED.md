# Getting Started with Emotive Engine

Welcome to the Emotive Engine! This guide will help you get up and running quickly with our expressive mascot animation system.

## Table of Contents
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Common Patterns](#common-patterns)
- [Debugging](#debugging)
- [Next Steps](#next-steps)

## Quick Start

The fastest way to get started is with this minimal example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Emotive Engine Quick Start</title>
</head>
<body>
    <!-- Canvas for mascot -->
    <canvas id="mascot-canvas" width="400" height="400"></canvas>

    <!-- Load and initialize -->
    <script type="module">
        import EmotiveMascot from '@joshtol/emotive-engine';

        // Create and initialize
        const mascot = new EmotiveMascot();
        const canvas = document.getElementById('mascot-canvas');

        await mascot.init(canvas);
        mascot.start();

        // Trigger a gesture
        mascot.triggerGesture('bounce');

        // Set emotion
        mascot.setEmotion('joy');
    </script>
</body>
</html>
```
> The default export exposes the sandboxed `EmotiveMascotPublic` API. Import `{ EmotiveMascot }` when you need direct access to renderer internals.


## Installation

### Option 1: Direct Module Import

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';
```

### Option 2: Using the Build

```html
<!-- Include the bundled version -->
<script src="dist/emotive-engine.min.js"></script>
<script>
    const mascot = new EmotiveEngine.EmotiveMascot();
</script>
```

### Option 3: NPM Package (Coming Soon)

```bash
npm install emotive-engine
```

## Basic Usage

### 1. Initialization

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

// Create instance with optional configuration
const mascot = new EmotiveMascot({
    particleIntensity: 0.8,
    glowIntensity: 0.6,
    startingEmotion: 'happy',
    debugMode: false
});

// Initialize with canvas element
const canvas = document.getElementById('my-canvas');
await mascot.init(canvas);

// Start animation loop
mascot.start();
```

### 2. Triggering Gestures

```javascript
// Single gesture
mascot.triggerGesture('bounce');

// Queue multiple gestures
mascot.triggerGesture('wave');
mascot.triggerGesture('spin');
mascot.triggerGesture('pulse');

// Available gestures:
// Movement: bounce, spin, orbit, sway, jump, twist, float, wiggle, lean
// Expression: wave, nod, shake, point, tilt, reach, shrug
// Effects: pulse, glow, sparkle, shimmer, flash, flicker, vibrate
// Ambient: breathe, idle, drift
// Groove: grooveSway, grooveBob, grooveFlow, groovePulse, grooveStep
```

### 3. Setting Emotions

```javascript
// Basic emotion
mascot.setEmotion('joy');

// Emotion with undertone
mascot.setEmotion('happy', 'energetic');

// Available emotions (core registry):
// neutral, joy, sadness, anger, fear, surprise, disgust, love, suspicion, excited, resting, euphoria, focused, glitch, calm
// Undertones (renderer modifiers): energetic, subdued, intense, tired, nervous, confident


### 4. Manual Rotation and Brake Control

```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot({ canvasId: 'mascot-canvas' });

// Spin clockwise at five degrees per frame
mascot.setRotationSpeed(5);

// Brake back to upright when you are ready
await mascot.renderer.rotationBrake.brakeToUpright();

// Snap to the nearest quarter turn
await mascot.renderer.rotationBrake.brakeToNearest(90);
```

> The rotation API works in degrees per frame. Speeds between -10 and 10 feel natural, and the brake helper automatically resets `rotationSpeed` to zero when it finishes.

### 5. Recording and Playback
### 5. Recording and Playback

```javascript
// Start recording
mascot.startRecording();

// Perform actions
mascot.triggerGesture('bounce');
mascot.setEmotion('excited');
mascot.triggerGesture('spin');

// Stop and get recording
const recording = mascot.stopRecording();

// Export for storage
const exportedData = mascot.exportRecording(recording);
localStorage.setItem('mascot-recording', exportedData);

// Import and playback
const savedData = localStorage.getItem('mascot-recording');
const importedRecording = mascot.importRecording(savedData);
await mascot.playRecording(importedRecording);
```

## Configuration

### Configuration Options

```javascript
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    defaultEmotion: 'neutral',
    enableAudio: true,
    enableAutoOptimization: true,
    enableGracefulDegradation: true,
    maxParticles: 120,
    renderingStyle: 'classic',
    topOffset: 0
});
```


### URL Parameters

You can override configuration using URL parameters:

```
?debug=true              # Enable debug mode
?fps=true               # Show FPS counter
?quality=low            # Set quality (low, medium, high, ultra)
?features=rhythmSync,!particles  # Enable/disable features
```

### Environment Detection

The engine automatically detects and optimizes for:
- Development vs Production environments
- Mobile vs Desktop devices
- High DPI displays
- Browser capabilities

## Common Patterns

### Pattern 1: User Interaction

```javascript
// React to button clicks
document.getElementById('happy-btn').addEventListener('click', () => {
    mascot.setEmotion('joy');
    mascot.triggerGesture('bounce');
});

// React to mouse position
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Mascot follows cursor (if gaze tracking enabled)
    mascot.setGazeTarget(x, y);
});
```

### Pattern 2: Music Visualization

```javascript
// Connect to audio element
const audio = document.getElementById('music-player');
mascot.connectAudioSource(audio);

// Enable rhythm sync
mascot.enableRhythmSync();

// Mascot will automatically sync to the music
```

### Pattern 3: Emotional Responses

```javascript
// Create emotional response system
function respondToUserMood(userMood) {
    const responses = {
        happy: { emotion: 'excited', gesture: 'bounce' },
        sad: { emotion: 'calm', gesture: 'sway' },
        angry: { emotion: 'confused', gesture: 'shake' },
        tired: { emotion: 'sleepy', gesture: 'float' }
    };

    const response = responses[userMood] || responses.happy;
    mascot.setEmotion(response.emotion);
    mascot.triggerGesture(response.gesture);
}
```

### Pattern 4: Scheduled Animations

```javascript
// Create animation sequence
const animationSequence = [
    { time: 0, action: () => mascot.setEmotion('neutral') },
    { time: 1000, action: () => mascot.triggerGesture('wave') },
    { time: 2000, action: () => mascot.setEmotion('happy') },
    { time: 3000, action: () => mascot.triggerGesture('bounce') }
];

// Execute sequence
animationSequence.forEach(step => {
    setTimeout(step.action, step.time);
});
```

## Debugging

### Enable Debug Mode

```javascript
// Via configuration
const mascot = new EmotiveMascot({ debugMode: true });

// Via URL parameter
// Add ?debug=true to your URL

// Via localStorage
localStorage.setItem('debug', 'true');

// Via global flag
window.DEBUG = true;
```

### Performance Monitoring

```javascript
// Get performance metrics
const metrics = mascot.getPerformanceMetrics();
console.log(`FPS: ${metrics.fps}`);
console.log(`Frame Time: ${metrics.frameTime}ms`);
console.log(`Particles: ${metrics.particleCount}`);
```

### Event Monitoring

```javascript
// Listen to all events
mascot.on('gesture', (data) => {
    console.log('Gesture triggered:', data);
});

mascot.on('emotion', (data) => {
    console.log('Emotion changed:', data);
});

mascot.on('rhythm:beat', (data) => {
    console.log('Beat detected:', data);
});
```

### Common Issues and Solutions

**Issue: Mascot not appearing**
```javascript
// Check initialization
if (!mascot._initialized) {
    console.error('Mascot not initialized');
}

// Verify canvas
const canvas = document.getElementById('canvas-id');
if (!canvas) {
    console.error('Canvas not found');
}

// Check if animation started
if (!mascot.isAnimating()) {
    mascot.start();
}
```

**Issue: Poor performance**
```javascript
// Reduce quality settings
mascot.setQuality('low');

// Reduce particle count
mascot.setConfig({ maxParticles: 50 });

// Disable features
mascot.disableFeature('particles');
```

**Issue: Gestures not working**
```javascript
// Check if gesture exists
const availableGestures = mascot.getAvailableGestures();
if (!availableGestures.includes('myGesture')) {
    console.error('Gesture not found');
}

// Clear gesture queue
mascot.clearGestureQueue();
```

## Next Steps

### Learn More

- [**Gesture Guide**](./GESTURE_GUIDE.md) - Detailed gesture documentation
- [**API Reference**](../site/src/docs/PUBLIC_API.md) - Complete API documentation
- [**Events Guide**](../site/src/docs/EVENTS.md) - Event system documentation
- [**Architecture**](../site/docs/MODULE_ARCHITECTURE.md) - System architecture

### Advanced Features

1. **Custom Gestures** - Create your own gesture animations
2. **Firebase Integration** - Enable social features
3. **Rhythm Game** - Build interactive rhythm games
4. **Multi-mascot** - Control multiple mascots simultaneously

### Examples

Check out the `/examples` directory for:
- Basic usage example
- Rhythm sync demo
- Recording/playback demo
- Custom gesture creation
- Firebase integration

### Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/emotive-engine/issues)
- **Documentation**: [Full documentation](https://docs.emotive-engine.com)
- **Community**: [Join our Discord](https://discord.gg/emotive-engine)

## License

The Emotive Engine is released under the MIT License. See [LICENSE](../LICENSE) for details.

---

Happy animating! 🎭✨