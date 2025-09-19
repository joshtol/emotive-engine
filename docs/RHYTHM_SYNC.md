# Rhythm Sync Guide

The Emotive Engine's rhythm synchronization system allows the mascot to dance and respond to music in real-time. This guide covers everything you need to know about rhythm sync features.

## Table of Contents
- [Overview](#overview)
- [Basic Setup](#basic-setup)
- [BPM Detection](#bpm-detection)
- [Audio Analysis](#audio-analysis)
- [Groove Templates](#groove-templates)
- [Beat-Aligned Actions](#beat-aligned-actions)
- [Advanced Techniques](#advanced-techniques)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

The rhythm sync system consists of three main components:

1. **RhythmEngine** - Core beat detection and timing
2. **AudioContextManager** - Audio analysis and processing
3. **GrooveTemplates** - Pre-defined dance patterns

### Key Features
- Real-time BPM detection
- Audio frequency analysis
- Beat prediction and scheduling
- Groove pattern generation
- Tap tempo support
- Multi-agent BPM consensus

## Basic Setup

### Enable Rhythm Sync

```javascript
import EmotiveMascot from './src/EmotiveMascotPublic.js';

const mascot = new EmotiveMascot();
await mascot.init(canvas);

// Enable rhythm synchronization
mascot.enableRhythmSync();

// Set a specific BPM
mascot.setBPM(120);

// Start a groove
mascot.triggerGesture('groovePulse');
```

### Connect to Audio Source

```javascript
// Option 1: HTML Audio Element
const audio = document.getElementById('music');
mascot.connectAudioSource(audio);

// Option 2: Audio Stream
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mascot.connectAudioStream(stream);
  });

// Option 3: Web Audio API
const audioContext = new AudioContext();
const source = audioContext.createBufferSource();
mascot.connectAudioNode(source);
```

## BPM Detection

### Automatic BPM Detection

The engine uses a multi-agent system for accurate BPM detection:

```javascript
// Enable auto-detection
mascot.enableRhythmSync();
mascot.setAutoDetectBPM(true);

// Listen for BPM updates
mascot.on('rhythm:bpmDetected', (data) => {
  console.log(`Detected BPM: ${data.bpm}`);
  console.log(`Confidence: ${data.confidence}`);
});

// Get current BPM
const currentBPM = mascot.getCurrentBPM();
```

### Tap Tempo

Users can manually set the tempo by tapping:

```javascript
// Create tap button
const tapButton = document.getElementById('tap');

tapButton.addEventListener('click', () => {
  mascot.tap();
});

// After 4+ taps, BPM is calculated
mascot.on('rhythm:tapTempo', (data) => {
  console.log(`Tap tempo BPM: ${data.bpm}`);
});
```

### Manual BPM Setting

```javascript
// Set specific BPM
mascot.setBPM(128);

// Set BPM range for auto-detection
mascot.setBPMRange(60, 180);

// Get BPM info
const rhythmInfo = mascot.getRhythmInfo();
console.log(rhythmInfo);
// {
//   bpm: 128,
//   confidence: 0.95,
//   isLocked: true,
//   beatInterval: 468.75,
//   lastBeatTime: 1234567890
// }
```

## Audio Analysis

### Frequency Analysis

The engine analyzes audio frequencies to enhance rhythm detection:

```javascript
// Enable frequency analysis
mascot.enableAudioAnalysis();

// Get frequency data
mascot.on('audio:frequencyUpdate', (data) => {
  const { bass, mid, treble, volume } = data;

  // React to different frequency ranges
  if (bass > 0.8) {
    mascot.triggerGesture('bounce');
  }

  if (treble > 0.7) {
    mascot.triggerGesture('sparkle');
  }
});
```

### Beat Detection Events

```javascript
// Listen for beats
mascot.on('rhythm:beat', (data) => {
  console.log(`Beat ${data.count} at ${data.time}ms`);
});

// Listen for downbeats (first beat of measure)
mascot.on('rhythm:downbeat', (data) => {
  console.log('Downbeat!');
  mascot.triggerGesture('jump');
});

// Listen for measures
mascot.on('rhythm:measure', (data) => {
  console.log(`Measure ${data.measure}`);
});
```

## Groove Templates

Groove templates are pre-defined dance patterns that adapt to the BPM:

### Available Grooves

```javascript
// Smooth swaying (60-100 BPM)
mascot.triggerGesture('grooveSway');

// Head bobbing (90-130 BPM)
mascot.triggerGesture('grooveBob');

// Flowing dance (100-140 BPM)
mascot.triggerGesture('grooveFlow');

// Pulsing rhythm (120-160 BPM)
mascot.triggerGesture('groovePulse');

// Stepping dance (110-140 BPM)
mascot.triggerGesture('grooveStep');
```

### Groove Configuration

```javascript
// Configure groove behavior
mascot.setGrooveConfig({
  intensity: 0.8,        // Movement intensity (0-1)
  variation: 0.6,        // Pattern variation (0-1)
  smoothing: 0.7,        // Transition smoothing (0-1)
  adaptiveTiming: true   // Adapt to tempo changes
});

// Set groove for specific BPM ranges
mascot.setGrooveMap({
  slow: { min: 60, max: 90, groove: 'grooveSway' },
  medium: { min: 90, max: 120, groove: 'grooveBob' },
  fast: { min: 120, max: 160, groove: 'groovePulse' }
});
```

### Custom Groove Patterns

```javascript
// Create custom groove
const customGroove = {
  name: 'customGroove',
  type: 'groove',
  bpmRange: { min: 100, max: 130 },
  pattern: [
    { beat: 1, gesture: 'bounce', intensity: 1.0 },
    { beat: 2, gesture: 'sway', intensity: 0.5 },
    { beat: 3, gesture: 'bounce', intensity: 0.7 },
    { beat: 4, gesture: 'spin', intensity: 1.0 }
  ],
  loop: true
};

mascot.registerGroove(customGroove);
mascot.triggerGesture('customGroove');
```

## Beat-Aligned Actions

### Schedule Actions on Beats

```javascript
// Trigger on next beat
mascot.triggerGestureOnBeat('bounce');

// Trigger on specific beat (1-4)
mascot.triggerGestureOnBeat('spin', 4);

// Schedule multiple actions
const sequence = [
  { beat: 1, action: () => mascot.triggerGesture('bounce') },
  { beat: 2, action: () => mascot.setEmotion('happy') },
  { beat: 3, action: () => mascot.triggerGesture('pulse') },
  { beat: 4, action: () => mascot.triggerGesture('flash') }
];

mascot.scheduleSequence(sequence);
```

### Beat Patterns

```javascript
// Create repeating pattern
mascot.setBeatPattern({
  pattern: ['bounce', 'pulse', 'sway', 'flash'],
  repeat: 4,  // Repeat 4 times
  onComplete: () => console.log('Pattern complete!')
});

// Complex pattern with timing
mascot.setBeatPattern({
  pattern: [
    { gesture: 'bounce', duration: 0.5 },  // Half beat
    { gesture: 'pulse', duration: 1 },     // Full beat
    { gesture: 'spin', duration: 2 },      // Two beats
    { rest: 1 }                           // Rest for one beat
  ]
});
```

### Fill Patterns

Generate automatic fill patterns based on BPM:

```javascript
// Get suggested fill pattern
const fills = mascot.getFillPattern(120, 'high');
// Returns array of gestures suitable for 120 BPM

// Auto-generate fills
mascot.enableAutoFills({
  threshold: 4,     // Every 4 measures
  intensity: 0.7,   // Fill intensity
  variation: 0.5    // Pattern variation
});
```

## Advanced Techniques

### Phase Locking

Keep animations in sync with the beat phase:

```javascript
// Enable phase locking
mascot.enablePhaseLock();

// Set phase offset (0-1, where 0 is on beat)
mascot.setPhaseOffset(0.25); // Quarter beat ahead

// Get current phase
const phase = mascot.getBeatPhase(); // 0.0 - 1.0
```

### Rhythm Prediction

The engine predicts upcoming beats for smoother animation:

```javascript
// Get next beat prediction
const nextBeat = mascot.getNextBeatTime();
console.log(`Next beat in ${nextBeat}ms`);

// Schedule action before beat (anticipation)
mascot.scheduleBeforeBeat(() => {
  mascot.prepareGesture('jump');
}, 100); // 100ms before beat

// Get beat window
const window = mascot.getBeatWindow(); // ±50ms typically
```

### Multi-Track Sync

Sync to different elements of the music:

```javascript
// Define rhythm tracks
mascot.defineRhythmTracks({
  kick: { frequency: [20, 100], threshold: 0.8 },
  snare: { frequency: [200, 400], threshold: 0.7 },
  hihat: { frequency: [5000, 10000], threshold: 0.6 }
});

// React to specific tracks
mascot.on('rhythm:kick', () => {
  mascot.triggerGesture('bounce');
});

mascot.on('rhythm:snare', () => {
  mascot.triggerGesture('pulse');
});
```

### Adaptive Timing

The engine adapts to tempo changes:

```javascript
// Enable adaptive timing
mascot.setAdaptiveTiming({
  enabled: true,
  smoothing: 0.8,      // How smooth tempo changes are
  threshold: 5,        // BPM change threshold
  responseTime: 2000   // Time to adapt (ms)
});

// Listen for tempo changes
mascot.on('rhythm:tempoChange', (data) => {
  console.log(`Tempo changed from ${data.oldBPM} to ${data.newBPM}`);
});
```

## Performance Optimization

### Optimize for Performance

```javascript
// Reduce rhythm processing load
mascot.setRhythmConfig({
  updateRate: 30,         // Hz (default 60)
  agentCount: 3,          // Number of BPM agents (default 5)
  fftSize: 1024,          // FFT size (default 2048)
  smoothingConstant: 0.8  // Audio smoothing
});

// Disable unused features
mascot.disableAudioAnalysis();  // If not using frequency data
mascot.disableAutoFills();       // If not using auto-fills
```

### Battery-Saving Mode

```javascript
// Enable battery saving
mascot.setBatterySaving(true);

// Custom battery config
mascot.setRhythmConfig({
  batterySaving: {
    enabled: true,
    reduceAnalysis: true,    // Less frequent analysis
    simplifyPatterns: true,  // Simpler animations
    limitFPS: 30            // Cap at 30 FPS
  }
});
```

### Memory Management

```javascript
// Clear rhythm history
mascot.clearRhythmHistory();

// Limit history size
mascot.setRhythmConfig({
  maxHistorySize: 100,  // Keep last 100 beats
  maxPatternCache: 10   // Cache 10 patterns
});

// Get memory usage
const memoryInfo = mascot.getRhythmMemoryUsage();
console.log(`Rhythm memory: ${memoryInfo.bytes} bytes`);
```

## Troubleshooting

### Common Issues

**BPM Detection Not Working**
```javascript
// Check audio connection
const audioConnected = mascot.isAudioConnected();
if (!audioConnected) {
  console.error('No audio source connected');
}

// Check audio levels
mascot.on('audio:levels', (levels) => {
  if (levels.volume < 0.1) {
    console.warn('Audio too quiet for beat detection');
  }
});

// Reset rhythm engine
mascot.resetRhythmEngine();
```

**Gestures Out of Sync**
```javascript
// Recalibrate rhythm sync
mascot.recalibrateRhythm();

// Adjust latency compensation
mascot.setLatencyCompensation(50); // ms

// Force resync
mascot.forceRhythmResync();
```

**Performance Issues**
```javascript
// Monitor rhythm performance
mascot.on('rhythm:performance', (stats) => {
  if (stats.processingTime > 10) {
    console.warn('Rhythm processing taking too long');
    // Reduce quality
    mascot.setRhythmQuality('low');
  }
});

// Disable rhythm sync if needed
if (performance.now() - lastFrame > 32) {
  mascot.disableRhythmSync();
}
```

### Debug Mode

```javascript
// Enable rhythm debug mode
mascot.setRhythmDebug(true);

// Listen to debug events
mascot.on('rhythm:debug', (data) => {
  console.log('Rhythm Debug:', data);
});

// Visualize beat detection
mascot.showBeatVisualization(true);

// Export rhythm data for analysis
const rhythmData = mascot.exportRhythmData();
console.log(JSON.stringify(rhythmData, null, 2));
```

### Testing Tools

```javascript
// Test with synthetic beats
mascot.testRhythmWithBeats({
  bpm: 120,
  duration: 10000,  // 10 seconds
  pattern: [1, 0, 0.5, 0]  // Kick, rest, snare, rest
});

// Test BPM detection accuracy
mascot.testBPMDetection(120).then(result => {
  console.log(`Accuracy: ${result.accuracy}%`);
  console.log(`Detected: ${result.detected} BPM`);
});

// Benchmark rhythm performance
const benchmark = mascot.benchmarkRhythm();
console.log(`Average processing: ${benchmark.avgTime}ms`);
```

## Best Practices

### 1. Start Simple
```javascript
// Begin with basic rhythm sync
mascot.enableRhythmSync();
mascot.setBPM(120);
mascot.triggerGesture('groovePulse');

// Add complexity gradually
```

### 2. Match Genre to Groove
```javascript
const genreGrooves = {
  pop: 'grooveBob',
  electronic: 'groovePulse',
  jazz: 'grooveSway',
  hiphop: 'grooveStep',
  ambient: 'grooveFlow'
};

function setGenreGroove(genre) {
  const groove = genreGrooves[genre] || 'grooveBob';
  mascot.triggerGesture(groove);
}
```

### 3. Provide User Control
```javascript
// Let users adjust sync
const controls = {
  bpmOffset: 0,
  phaseShift: 0,
  intensity: 1.0
};

function adjustSync(offset) {
  controls.bpmOffset = offset;
  mascot.setBPM(mascot.getCurrentBPM() + offset);
}
```

### 4. Handle Edge Cases
```javascript
// Handle silence
mascot.on('audio:silence', () => {
  mascot.triggerGesture('idle');
});

// Handle tempo extremes
mascot.on('rhythm:bpmDetected', (data) => {
  if (data.bpm < 40 || data.bpm > 200) {
    mascot.setBPM(120); // Fallback to safe BPM
  }
});
```

## Integration Examples

### Music Player Integration
```javascript
class MusicPlayerIntegration {
  constructor(mascot, player) {
    this.mascot = mascot;
    this.player = player;

    // Connect audio
    this.mascot.connectAudioSource(player.audioElement);

    // Sync with player events
    player.on('play', () => this.mascot.enableRhythmSync());
    player.on('pause', () => this.mascot.pause());
    player.on('trackChange', () => this.handleTrackChange());
  }

  handleTrackChange() {
    // Reset rhythm for new track
    this.mascot.resetRhythmEngine();
    this.mascot.enableRhythmSync();

    // Adjust for genre
    const genre = this.player.getCurrentGenre();
    this.setGrooveForGenre(genre);
  }

  setGrooveForGenre(genre) {
    // Genre-specific grooves
    const grooves = {
      electronic: 'groovePulse',
      rock: 'grooveBob',
      classical: 'grooveSway'
    };

    this.mascot.triggerGesture(grooves[genre] || 'grooveBob');
  }
}
```

### Rhythm Game Integration
```javascript
class RhythmGame {
  constructor(mascot) {
    this.mascot = mascot;
    this.score = 0;
    this.combo = 0;

    this.mascot.on('rhythm:beat', this.onBeat.bind(this));
  }

  onBeat(data) {
    // Check player input timing
    const inputTime = this.lastInputTime;
    const beatTime = data.time;
    const diff = Math.abs(inputTime - beatTime);

    if (diff < 50) {
      // Perfect timing!
      this.score += 100 * this.combo;
      this.combo++;
      this.mascot.triggerGesture('sparkle');
    } else if (diff < 100) {
      // Good timing
      this.score += 50;
      this.mascot.triggerGesture('pulse');
    } else {
      // Missed
      this.combo = 0;
      this.mascot.triggerGesture('shake');
    }
  }
}
```

## Summary

The Rhythm Sync system provides:
- **Accurate BPM detection** using multi-agent consensus
- **Real-time audio analysis** for reactive animations
- **Groove templates** for different music styles
- **Beat-aligned actions** for precise timing
- **Performance optimization** for smooth animation

Experiment with different settings and patterns to create engaging, music-reactive animations!

---

For more information:
- [Getting Started Guide](./GETTING_STARTED.md)
- [Gesture Guide](./GESTURE_GUIDE.md)
- [API Reference](../site/src/docs/PUBLIC_API.md)
- [Events Documentation](../site/src/docs/EVENTS.md)