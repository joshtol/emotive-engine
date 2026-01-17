# Quick Reference Card

## Emotions

| Emotion | Description | Best For |
|---------|-------------|----------|
| `neutral` | Calm, default state | Idle, waiting |
| `joy` | Happy, uplifted | Success, celebration |
| `sadness` | Melancholy, subdued | Errors, bad news |
| `anger` | Intense, agitated | Warnings, urgency |
| `fear` | Nervous, alert | Caution, danger |
| `surprise` | Startled, wide | New info, notifications |
| `disgust` | Repulsed, turned away | Invalid input |
| `anticipation` | Eager, leaning forward | Loading, processing |
| `trust` | Open, welcoming | Onboarding, help |

```javascript
mascot.setEmotion('joy');
mascot.setEmotion('joy', 'excitement');  // With undertone
```

---

## Undertones

Modify the intensity/flavor of an emotion:

| Undertone | Effect |
|-----------|--------|
| `calm` | Subdued, gentle version |
| `excitement` | Heightened, energetic version |
| `curiosity` | Questioning, investigative |
| `determination` | Focused, resolute |
| `serenity` | Peaceful, zen-like |

```javascript
mascot.setEmotion('joy', 'excitement');  // Excited joy
mascot.setEmotion('neutral', 'curiosity');  // Curious neutral
```

---

## Gestures

### Movement Gestures
| Gesture | Description | Duration |
|---------|-------------|----------|
| `bounce` | Playful up-down | 4 beats |
| `sway` | Gentle side-to-side | 1 bar |
| `float` | Dreamy floating motion | ~2000ms |
| `wiggle` | Side-to-side shake | 2 beats |
| `nod` | Vertical acknowledgment | ~350ms |
| `shake` | Horizontal "no" | ~400ms |

### Directional Gestures (Beat-Synced)
| Gesture | Description | Duration |
|---------|-------------|----------|
| `stepLeft` | Quick weight shift left | 1 beat |
| `stepRight` | Quick weight shift right | 1 beat |
| `stepUp` | Quick weight shift up | 1 beat |
| `stepDown` | Quick weight shift down | 1 beat |
| `slideLeft` | Smooth glide left | 2 beats |
| `slideRight` | Smooth glide right | 2 beats |
| `leanLeft` | Body tilt left | 2 beats |
| `leanRight` | Body tilt right | 2 beats |
| `kickLeft` | Quick kick left | 1 beat |
| `kickRight` | Quick kick right | 1 beat |
| `spinLeft` | Rotate counter-clockwise | ~600ms |
| `spinRight` | Rotate clockwise | ~600ms |

### Directional Gestures (Storytelling)
| Gesture | Description | Duration |
|---------|-------------|----------|
| `floatUp` | Ethereal rise | ~2000ms |
| `floatDown` | Gentle sink | ~2000ms |
| `floatLeft` | Drift left | ~2000ms |
| `floatRight` | Drift right | ~2000ms |
| `pointUp` | Point upward | ~500ms |
| `pointDown` | Point downward | ~500ms |
| `pointLeft` | Point left | ~500ms |
| `pointRight` | Point right | ~500ms |

### Accent Gestures (Dance-Friendly)
| Gesture | Description | Duration |
|---------|-------------|----------|
| `pop` | Quick scale burst | ~200ms |
| `bob` | Head bob accent | ~300ms |
| `dip` | Quick dip motion | ~400ms |
| `flare` | Energetic burst | ~300ms |
| `swell` | Gradual expansion | ~500ms |
| `swagger` | Confident movement | ~600ms |

### Effect Gestures
| Gesture | Description | Duration |
|---------|-------------|----------|
| `pulse` | Rhythmic throb | ~500ms |
| `spin` | Full rotation | ~600ms |
| `flash` | Brief brightness burst | ~150ms |
| `glow` | Sustained luminance | ~800ms |
| `sparkle` | Twinkling bursts | 2 beats |
| `shimmer` | Wave-like sparkle | 1 bar |

### Transform Gestures
| Gesture | Description | Duration |
|---------|-------------|----------|
| `jump` | Vertical leap | ~400ms |
| `twist` | Rotational twist | ~500ms |
| `hula` | Hip-swaying motion | ~800ms |
| `expand` | Confident growth | ~400ms |
| `contract` | Modest shrink | ~400ms |

```javascript
mascot.gesture('bounce');
mascot.gesture('stepLeft');  // Directional dance move
mascot.gesture(['sway', 'shimmer']);  // Layered gestures
```

---

## Geometries (3D Only)

| Geometry | Description |
|----------|-------------|
| `sphere` | Default round shape |
| `heart` | Love/affection shape |
| `star` | Achievement/special shape |
| `cube` | Structured/technical shape |
| `moon` | Lunar phases support |

```javascript
mascot.morphTo('heart');
mascot.morphTo('sphere');  // Return to default
```

---

## Quick Setup

### Minimal 2D
```javascript
import EmotiveMascot from 'emotive-engine';

const mascot = new EmotiveMascot();
mascot.init(document.getElementById('container'));
mascot.start();
mascot.setEmotion('joy');
```

### Minimal 3D
```javascript
import { EmotiveMascot3D } from 'emotive-engine/3d';

const mascot = new EmotiveMascot3D();
mascot.init(document.getElementById('container'));
mascot.start();
mascot.setEmotion('joy');
```

### With Audio Sync
```javascript
const mascot = new EmotiveMascot3D();
mascot.init(container);
mascot.start();

// User must interact first (browser requirement)
button.onclick = async () => {
    await mascot.connectAudio(audioElement);
    mascot.enableRhythmSync();
    mascot.enableGroove();
    audioElement.play();
};
```

---

## Common Patterns

### Respond to User Input
```javascript
button.addEventListener('click', () => {
    mascot.setEmotion('joy');
    mascot.express('celebrate');
});
```

### Show Loading State
```javascript
async function loadData() {
    mascot.setEmotion('anticipation');
    mascot.express('pulse');

    try {
        const data = await fetch('/api/data');
        mascot.setEmotion('joy');
        mascot.express('pop');
    } catch (error) {
        mascot.setEmotion('sadness');
        mascot.express('shrink');
    }
}
```

### Natural Language (LLM Integration)
```javascript
// Use feel() for natural descriptions
mascot.feel('happy and bouncing');
mascot.feel('nervous, shaking slightly');
mascot.feel('excited celebration');
```

### Event Listening
```javascript
mascot.eventManager.on('emotion:change', ({ emotion, undertone }) => {
    console.log(`Now feeling: ${emotion}`);
});

mascot.eventManager.on('gesture:start', ({ gesture }) => {
    console.log(`Started: ${gesture}`);
});
```

---

## Method Chaining

All state methods return `this`:

```javascript
mascot
    .setEmotion('joy')
    .express('bounce')
    .morphTo('heart');
```

---

## Cleanup

Always destroy when done:

```javascript
// Before removing from DOM
mascot.destroy();

// React
useEffect(() => {
    const mascot = new EmotiveMascot3D();
    mascot.init(ref.current);
    mascot.start();
    return () => mascot.destroy();
}, []);
```

---

## Config Options (3D)

```javascript
new EmotiveMascot3D({
    // Rendering
    enablePostProcessing: true,   // Bloom/glow effects
    enableShadows: false,         // Shadow casting
    particleCount: 200,           // Particle system count

    // Camera
    enableControls: true,         // User orbit controls
    autoRotate: false,            // Automatic rotation
    cameraDistance: 1.2,          // Camera distance
    fov: 30,                      // Field of view
    minZoom: 0.5,                 // Minimum zoom
    maxZoom: 2.0,                 // Maximum zoom

    // Assets
    assetBasePath: '/assets',     // Path to textures

    // Material
    materialVariant: 'default',   // 'default', 'multiplexer', etc.
});
```

---

## Available Methods

### Both 2D & 3D
- `init(container)` - Initialize
- `start()` - Begin animation
- `stop()` - Pause animation
- `setEmotion(emotion, undertone?)` - Set emotion
- `express(gesture)` - Trigger gesture
- `chain(gestures)` - Gesture sequence
- `morphTo(geometry)` - Change shape
- `feel(description)` - Natural language
- `setPosition(x, y, z?)` - Move position
- `getAvailableEmotions()` - List emotions
- `getAvailableGestures()` - List gestures

### 3D Only
- `destroy()` - Full cleanup
- `getPosition()` - Current position
- `enableAutoRotate()` / `disableAutoRotate()`
- `setCameraPreset(preset)`
- `connectAudio(element)` / `disconnectAudio()`
- `enableRhythmSync()` / `disableRhythmSync()`
- `enableGroove()` / `disableGroove()`
- `setGroove(preset)`
- `enableParticles()` / `disableParticles()`
- `enableCrystalSoul()` / `disableCrystalSoul()`
- `getAvailableGeometries()`

---

## Links

- [Performance Tuning](./PERFORMANCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Events Reference](./EVENTS.md)
- [Migration Guide](./MIGRATION.md)
- [LLM Integration](./LLM_INTEGRATION.md)
