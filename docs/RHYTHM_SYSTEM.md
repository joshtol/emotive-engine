# 🎵 Emotive Engine Rhythm System

## Overview

The Rhythm System adds musical synchronization to the Emotive Engine, allowing all visual elements to dance in time with music. Built with a modular architecture, it maintains the core principle: **"Rhythm doesn't change WHAT things do, only WHEN they do it."**

## Core Components

### 1. `rhythm.js` - Central Timing Engine
The heartbeat of the system, providing:
- Beat and bar tracking at configurable BPM (20-300)
- Musical time references and subdivisions
- Pattern support (straight, swing, waltz, dubstep, breakbeat)
- Event emission for synchronization
- Adapter interface for subsystems

### 2. `rhythmIntegration.js` - Integration Layer
Bridges rhythm with existing systems:
- Reads rhythm configurations from individual files
- Applies timing modulations without changing core behavior
- Provides helper functions for musical synchronization
- Manages pattern-specific overrides

### 3. Individual File Configurations
Each emotion, gesture, and particle behavior can define its own rhythm response:
```javascript
rhythm: {
    enabled: true,
    // Custom rhythm configuration
}
```

## Architecture

```
Audio Input ──┐
              ↓
        [Rhythm Engine] ← Internal Clock
              ↓
         Beat Events
              ↓
    ┌─────────┴─────────┐
    ↓         ↓         ↓
Emotions  Gestures  Particles
(each with own rhythm config)
```

## Configuration Examples

### Emotion Rhythm (love.js)
```javascript
rhythm: {
    enabled: true,
    
    // Particle emission syncs to beat
    particleEmission: {
        syncMode: 'beat',        // Emit bursts on beat
        burstSize: 3,            // Extra particles per beat
        offBeatRate: 0.7         // Reduced emission between beats
    },
    
    // Glow pulses with rhythm
    glowSync: {
        intensityRange: [1.4, 2.0],
        syncTo: 'beat',
        attack: 0.1,             // Quick brightening
        decay: 0.6               // Gentle fade
    }
}
```

### Gesture Rhythm (float.js)
```javascript
rhythm: {
    enabled: true,
    
    // Amplitude changes with beat
    amplitudeSync: {
        onBeat: 1.5,      // Boost on beat
        offBeat: 0.8,     // Reduce off beat
        curve: 'bounce'   // Animation curve
    },
    
    // Duration in musical time
    durationSync: {
        mode: 'bars',
        bars: 2           // Float for 2 bars
    }
}
```

### Particle Behavior Rhythm (glitchy.js)
```javascript
rhythm: {
    enabled: true,
    
    // Glitch events sync to subdivisions
    glitchTiming: {
        mode: 'subdivision',
        subdivision: 'sixteenth',
        probability: 0.3,
        intensityOnBeat: 2.0
    }
}
```

## Musical Patterns

### Straight (4/4)
- Standard even timing
- Strong emphasis on beats 1 and 3
- Default pattern for most situations

### Swing
- Jazz-influenced 2:1 swing ratio (67%)
- Creates a "bouncing" feel
- Great for playful emotions

### Waltz (3/4)
- Elegant triple meter
- Strong downbeat, lighter 2 and 3
- Perfect for romantic gestures

### Dubstep
- Half-time feel with heavy beat 3 emphasis
- Creates dramatic "drops"
- Ideal for glitch and excited states

### Breakbeat
- Syncopated, broken rhythm
- Creates chaotic energy
- Works well with nervous/anxious states

## API Usage

### Starting Rhythm
```javascript
import rhythmIntegration from './src/core/rhythmIntegration.js';

// Start with default settings
rhythmIntegration.start(120, 'straight');

// Or configure first
rhythmIntegration.setBPM(140);
rhythmIntegration.setPattern('swing');
rhythmIntegration.start();
```

### Subscribing to Events
```javascript
import rhythmEngine from './src/core/rhythm.js';

// Subscribe to beat events
rhythmEngine.on('beat', (beatInfo) => {
    console.log(`Beat ${beatInfo.beat} with accent ${beatInfo.accent}`);
});

// Subscribe to bar events
rhythmEngine.on('bar', (barInfo) => {
    console.log(`New bar: ${barInfo.bar}`);
});
```

### Getting Time Information
```javascript
const adapter = rhythmEngine.getAdapter();
const timeInfo = adapter.getTimeInfo();

console.log({
    beat: timeInfo.beat,
    beatProgress: timeInfo.beatProgress,
    bpm: timeInfo.bpm,
    nextBeatIn: timeInfo.nextBeatIn
});
```

### Audio Synchronization (Future)
```javascript
// Sync to external audio source
rhythmIntegration.syncToAudio(audioContext, audioSource);
```

## Rhythm Parameters

### Timing
- **BPM**: Beats per minute (20-300)
- **Time Signature**: Numerator/denominator (e.g., 4/4, 3/4)
- **Subdivisions**: sixteenth, eighth, quarter, triplet

### Sync Modes
- **beat**: Synchronize to beats
- **bar**: Synchronize to bars/measures
- **subdivision**: Sync to smaller divisions
- **continuous**: Smooth continuous sync

### Animation Curves
- **linear**: Constant speed
- **ease**: Smooth acceleration/deceleration
- **bounce**: Elastic bouncing effect
- **pulse**: Sharp attack, gradual decay

### Modulation Types
- **Amplitude**: Scale of movement
- **Speed**: Rate of change
- **Intensity**: Overall strength
- **Probability**: Chance of events

## Demo Pages

### rhythm-demo.html
Full-featured demo with:
- BPM and pattern controls
- Visual beat indicator
- Emotion and gesture triggers
- Real-time rhythm feedback

### test-rhythm.html
Technical test interface for:
- System initialization verification
- Event subscription testing
- Modulation calculation checks
- Integration validation

## Performance Considerations

1. **Efficient Updates**: Rhythm calculations happen once per frame
2. **Lazy Evaluation**: Modulations only calculated when needed
3. **Pattern Caching**: Pattern data cached to avoid lookups
4. **Event Throttling**: Beat events limited to actual changes

## Extending the System

### Adding a New Pattern
```javascript
rhythmEngine.patterns.set('techno', {
    name: 'techno',
    description: '4-on-the-floor pattern',
    accents: [1, 0.7, 0.7, 0.7],  // Strong kick on every beat
    groove: 0
});
```

### Creating Custom Rhythm Config
```javascript
export default {
    name: 'myGesture',
    // ... gesture config ...
    
    rhythm: {
        enabled: true,
        customSync: {
            // Your custom rhythm parameters
        },
        
        // Pattern-specific overrides
        patternOverrides: {
            'techno': {
                // Techno-specific behavior
            }
        }
    }
};
```

## Best Practices

1. **Keep It Musical**: Sync to musical divisions, not arbitrary timings
2. **Respect the Beat**: Strong visual changes on strong beats
3. **Pattern Awareness**: Different patterns should feel different
4. **Maintain Identity**: Rhythm enhances but doesn't replace emotion
5. **Performance First**: Disable rhythm if performance degrades

## Troubleshooting

### Rhythm Not Starting
- Check if `rhythmIntegration.initialize()` was called
- Verify BPM is within valid range (20-300)
- Ensure pattern name is valid

### No Beat Events
- Confirm rhythm engine is running with `rhythmEngine.isPlaying`
- Check event subscriptions are properly set up
- Verify no errors in console

### Gestures Not Syncing
- Ensure gesture has `rhythm.enabled: true`
- Check if `rhythmIntegration.isEnabled()` returns true
- Verify gesture is registered with rhythm system

## Future Enhancements

- [ ] Audio beat detection from microphone/line-in
- [ ] MIDI clock synchronization
- [ ] Tap tempo detection
- [ ] Automatic BPM adjustment
- [ ] Custom subdivision patterns
- [ ] Polyrhythm support
- [ ] Rhythm recording/playback
- [ ] Visual metronome option

## License

Part of the Emotive Engine - see main LICENSE.md for details.