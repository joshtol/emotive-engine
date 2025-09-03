# Emotive Engine API Documentation

## Table of Contents
- [Constructor](#constructor)
- [Core Methods](#core-methods)
- [Emotion Control](#emotion-control)
- [Gesture System](#gesture-system)
- [Breathing API](#breathing-api)
- [Events](#events)
- [Configuration Options](#configuration-options)

## Constructor

### `new EmotiveMascot(options)`

Creates a new Emotive Engine instance.

```javascript
const mascot = new EmotiveMascot({
  canvasId: 'emotive-canvas',
  emotion: 'neutral',
  particleCount: 100
});
```

## Core Methods

### `start()`
Starts the animation loop.
```javascript
mascot.start();
```

### `stop()`
Stops the animation loop.
```javascript
mascot.stop();
```

### `destroy()`
Cleans up resources and removes event listeners.
```javascript
mascot.destroy();
```

### `resize(width, height)`
Resizes the canvas and adjusts rendering.
```javascript
mascot.resize(800, 600);
```

## Emotion Control

### `setEmotion(emotionName, intensity)`
Sets the current emotional state.

**Parameters:**
- `emotionName` (string): Name of the emotion
- `intensity` (number, optional): Emotion intensity (0-1), default: 1

**Available Emotions:**
- `neutral`, `joy`, `sadness`, `anger`, `fear`, `surprise`, `disgust`
- `love`, `curiosity`, `excitement`, `contemplation`, `determination`
- `serenity`, `pride`, `embarrassment`, `amusement`, `awe`
- `satisfaction`, `sympathy`, `triumph`, `speaking`, `suspicion`

```javascript
mascot.setEmotion('joy', 0.8);
```

### `addUndertone(undertone)`
Adds an emotional undertone that modifies the primary emotion.

**Available Undertones:**
- `calm`, `energetic`, `melancholic`, `hopeful`, `anxious`, `confident`

```javascript
mascot.addUndertone('energetic');
```

### `blendEmotions(emotions, weights)`
Blends multiple emotions together.

```javascript
mascot.blendEmotions(
  ['joy', 'excitement', 'curiosity'],
  [0.5, 0.3, 0.2]
);
```

## Gesture System

### `addGesture(gestureName, options)`
Triggers a gesture animation.

**Available Gestures:**
- `wave`, `nod`, `shake`, `bounce`, `pulse`, `expand`, `contract`
- `spin`, `wobble`, `blink`, `look_left`, `look_right`, `look_up`, `look_down`

```javascript
mascot.addGesture('wave', {
  duration: 1000,
  intensity: 0.8
});
```

### `queueGestures(gestures)`
Queues multiple gestures to play in sequence.

```javascript
mascot.queueGestures([
  { name: 'nod', duration: 500 },
  { name: 'wave', duration: 1000 },
  { name: 'pulse', duration: 500 }
]);
```

## Breathing API

### `setBreathePattern(inhale, hold1, exhale, hold2)`
Sets a custom breathing pattern.

**Parameters:**
- `inhale` (number): Inhale duration in ms
- `hold1` (number): Hold after inhale in ms
- `exhale` (number): Exhale duration in ms
- `hold2` (number): Hold after exhale in ms

```javascript
mascot.setBreathePattern(4000, 2000, 4000, 2000);
```

### `setOrbScale(scale, duration, easing)`
Sets the orb scale for breathing effects.

**Parameters:**
- `scale` (number): Target scale (1 = normal)
- `duration` (number): Transition duration in ms
- `easing` (string): Easing function ('linear', 'ease-in', 'ease-out', 'ease-in-out')

```javascript
mascot.setOrbScale(1.5, 2000, 'ease-in-out');
```

### `breathe(type)`
Starts a predefined breathing pattern.

**Preset Types:**
- `calm`: 4-2-4-2 pattern
- `anxious`: 2-0-2-1 pattern
- `meditative`: 5-3-5-3 pattern
- `deep`: 6-4-6-2 pattern
- `sleep`: 4-1-6-1 pattern

```javascript
mascot.breathe('meditative');
```

### `stopBreathing()`
Stops the current breathing animation.

```javascript
mascot.stopBreathing();
```

## Events

The mascot emits various events you can listen to:

### `stateChange`
Fired when emotional state changes.
```javascript
mascot.on('stateChange', (state) => {
  console.log(`New emotion: ${state.emotion}`);
});
```

### `gestureComplete`
Fired when a gesture animation completes.
```javascript
mascot.on('gestureComplete', (gestureName) => {
  console.log(`Completed gesture: ${gestureName}`);
});
```

### `breathePhase`
Fired during breathing animations.
```javascript
mascot.on('breathePhase', (phase) => {
  console.log(`Breathing phase: ${phase}`); // 'inhale', 'hold1', 'exhale', 'hold2'
});
```

### `particleSpawn`
Fired when new particles are created.
```javascript
mascot.on('particleSpawn', (particle) => {
  console.log('New particle spawned');
});
```

### `performanceWarning`
Fired when performance degrades.
```javascript
mascot.on('performanceWarning', (metrics) => {
  console.log(`FPS dropped to ${metrics.fps}`);
});
```

## Configuration Options

### Full Configuration Example

```javascript
const mascot = new EmotiveMascot({
  // Canvas Configuration
  canvasId: 'emotive-canvas',
  width: 400,
  height: 400,
  
  // Particle Settings
  particleCount: 150,
  particleSize: { min: 2, max: 6 },
  particleLifetime: { min: 1000, max: 3000 },
  
  // Performance
  targetFPS: 60,
  enableWorkers: true,
  adaptivePerformance: true,
  maxParticles: 500,
  
  // Visual Effects
  glowIntensity: 1.2,
  motionBlur: 0.8,
  particleTrails: true,
  
  // Core Behavior
  emotion: 'neutral',
  undertone: 'calm',
  
  // Features
  enableGestures: true,
  enablePhysics: true,
  enableAudio: false,
  
  // Interaction
  mouseTracking: true,
  touchEnabled: true,
  
  // Audio (Optional)
  audioEnabled: false,
  audioSensitivity: 0.7,
  audioFrequencyBands: 32
});
```

### Performance Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetFPS` | number | 60 | Target frame rate |
| `enableWorkers` | boolean | true | Use Web Workers for physics |
| `adaptivePerformance` | boolean | true | Auto-adjust quality |
| `maxParticles` | number | 500 | Maximum particle count |

### Visual Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `glowIntensity` | number | 1.0 | Glow effect strength |
| `motionBlur` | number | 0.5 | Motion blur amount |
| `particleTrails` | boolean | false | Enable particle trails |

## Method Chaining

Most methods return the mascot instance for chaining:

```javascript
mascot
  .setEmotion('joy')
  .addUndertone('energetic')
  .addGesture('wave')
  .breathe('calm');
```

## TypeScript Support

The package includes TypeScript definitions:

```typescript
import EmotiveMascot, { EmotionName, GestureName, UndertoneType } from 'emotive-engine';

const emotion: EmotionName = 'joy';
const gesture: GestureName = 'wave';
const undertone: UndertoneType = 'calm';

const mascot = new EmotiveMascot({
  canvasId: 'mascot',
  emotion,
  undertone
});
```