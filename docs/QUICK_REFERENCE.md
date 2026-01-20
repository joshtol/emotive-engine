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

Gestures are organized into **6 categories** by purpose:

| Category | Purpose | Examples |
|----------|---------|----------|
| **Idle** | Background behaviors | `breathe`, `sway`, `float` |
| **Dance** | Music-synced moves | `bounce`, `stepLeft`, `pop` |
| **Actions** | Deliberate movements | `jump`, `spin`, `bow` |
| **Reactions** | Impact responses | `oofLeft`, `recoil`, `wobble` |
| **Destruction** | Breaking effects (3D) | `shatter`, `dissolve`, `morph` |
| **Atmosphere** | Particle/glow effects | `rain`, `glow`, `fade` |

### Common Gestures

| Gesture | Category | Description |
|---------|----------|-------------|
| `bounce` | Dance | Playful up-down motion |
| `sway` | Idle | Gentle side-to-side |
| `jump` | Actions | Vertical leap |
| `spin` | Actions | Full rotation |
| `bow` | Actions | Graceful forward bow |
| `oofFront` | Reactions | Gut punch impact (3D) |
| `shatter` | Destruction | Mesh fragmentation (3D) |
| `glow` | Atmosphere | Sustained luminance |

### Directional Gestures

Many gestures have directional variants:

| Base | Variants |
|------|----------|
| `step` | `stepLeft`, `stepRight`, `stepUp`, `stepDown` |
| `float` | `floatUp`, `floatDown`, `floatLeft`, `floatRight` |
| `point` | `pointUp`, `pointDown`, `pointLeft`, `pointRight` |
| `lunge` | `lungeForward`, `lungeBack`, `lungeLeft`, `lungeRight`, `lungeUp`, `lungeDown` |
| `dissolve` | `dissolveUp`, `dissolveDown`, `dissolveLeft`, `dissolveRight`, `dissolveAway`, `dissolveToward` |

```javascript
mascot.express('bounce');
mascot.express('stepLeft');  // Directional dance move
mascot.express(['sway', 'shimmer']);  // Layered gestures
mascot.express('oofFront');  // 3D impact with mesh deformation
```

> **Full Reference:** See [GESTURES.md](./GESTURES.md) for complete gesture documentation.

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
