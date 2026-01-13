# Creating Plugins

Extend Emotive Engine with custom emotions, gestures, and particle behaviors.

## Overview

The plugin system allows you to:
- Add new emotional states with custom visuals and animations
- Create custom gestures and animations
- Define new particle behaviors
- Hook into the render and update loops

## Plugin Types

| Type | Purpose | Example |
|------|---------|---------|
| `emotion` | Add new emotional states | "nostalgic", "determined" |
| `gesture` | Add new animations | "wobble", "figure8", "heartbeat" |
| `particle` | Add particle behaviors | "fizzy", "spiral" |

---

## Quick Start: Custom Emotion

Create a new emotion in about 50 lines of code:

```javascript
// my-emotion-plugin.js
class MyEmotionPlugin {
    constructor() {
        this.type = 'emotion';
        this.name = 'MyEmotionPlugin';
        this.version = '1.0.0';

        this.emotions = {
            nostalgic: {
                primaryColor: '#9B7EDE',      // Soft purple
                secondaryColor: '#C8B6E2',    // Light lavender
                glowIntensity: 0.6,
                particleRate: 8,
                particleBehavior: 'floating',
                particleSpeed: 0.3,
                breathRate: 0.7,
                breathDepth: 0.12,
                defaultGesture: 'sway'
            }
        };
    }

    init(api) {
        this.mascot = api.mascot || api;
        this.registerEmotions();
    }

    registerEmotions() {
        const emotionModule = this.mascot.Emotions || window.Emotions;
        if (!emotionModule?.pluginAdapter) return;

        const adapter = emotionModule.pluginAdapter;

        Object.entries(this.emotions).forEach(([name, config]) => {
            adapter.registerPluginEmotion(name, {
                name,
                emoji: '💭',
                color: config.primaryColor,
                energy: 'low',
                visual: {
                    primaryColor: config.primaryColor,
                    secondaryColor: config.secondaryColor,
                    particleCount: config.particleRate,
                    glowIntensity: config.glowIntensity,
                    pulseRate: config.breathRate
                },
                particles: {
                    behavior: config.particleBehavior,
                    speed: 'slow'
                },
                gestures: config.defaultGesture ? [config.defaultGesture] : []
            });
        });
    }

    destroy() {
        const emotionModule = this.mascot?.Emotions || window.Emotions;
        if (emotionModule?.pluginAdapter) {
            Object.keys(this.emotions).forEach(name => {
                emotionModule.pluginAdapter.unregisterPluginEmotion(name);
            });
        }
    }
}

export default MyEmotionPlugin;
```

### Using Your Emotion Plugin

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';
import MyEmotionPlugin from './my-emotion-plugin.js';

const mascot = new EmotiveMascot({ canvasId: 'canvas' });
mascot.registerPlugin(new MyEmotionPlugin());

await mascot.init(document.getElementById('canvas'));
mascot.start();

// Now use your custom emotion!
mascot.setEmotion('nostalgic');
mascot.feel('nostalgic');  // Also works via natural language
```

---

## Quick Start: Custom Gesture

Create custom animations:

```javascript
// my-gesture-plugin.js
class MyGesturePlugin {
    constructor() {
        this.type = 'gesture';
        this.name = 'MyGesturePlugin';
        this.version = '1.0.0';

        this.gestures = {
            wobble: {
                duration: 1000,
                easing: 'easeInOutQuad',
                amplitude: 20,
                frequency: 4,
                axis: 'horizontal'
            },
            heartbeat: {
                duration: 800,
                firstPulse: 1.15,
                secondPulse: 1.25,
                pauseBetween: 100
            }
        };

        this.activeAnimations = new Map();
    }

    init(api) {
        this.mascot = api.mascot || api;
        this.registerGestures();
    }

    registerGestures() {
        const gestureModule = this.mascot.Gestures || window.Gestures;
        if (!gestureModule?.pluginAdapter) return;

        const adapter = gestureModule.pluginAdapter;

        Object.entries(this.gestures).forEach(([name, config]) => {
            adapter.registerPluginGesture(name, {
                name,
                type: 'blending',
                emoji: name === 'wobble' ? '〰️' : '💓',
                description: `Custom ${name} animation`,
                config,
                apply: (particle, progress) => {
                    this.applyGesture(name, particle, progress, config);
                },
                cleanup: (particle) => {
                    if (particle.gestureData?.[name]) {
                        delete particle.gestureData[name];
                    }
                }
            });
        });
    }

    applyGesture(name, particle, progress, config) {
        if (name === 'wobble') {
            const offset = Math.sin(progress * Math.PI * 2 * config.frequency) *
                          config.amplitude * (1 - progress);
            particle.x += offset;
        }
        // Add more gesture logic as needed
    }

    update(deltaTime, state) {
        // Called every frame - update active animations
    }

    destroy() {
        this.activeAnimations.clear();
        const gestureModule = this.mascot?.Gestures || window.Gestures;
        if (gestureModule?.pluginAdapter) {
            Object.keys(this.gestures).forEach(name => {
                gestureModule.pluginAdapter.unregisterPluginGesture(name);
            });
        }
    }
}

export default MyGesturePlugin;
```

### Using Your Gesture Plugin

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';
import MyGesturePlugin from './my-gesture-plugin.js';

const mascot = new EmotiveMascot({ canvasId: 'canvas' });
mascot.registerPlugin(new MyGesturePlugin());

await mascot.init(document.getElementById('canvas'));
mascot.start();

// Trigger your custom gesture!
mascot.express('wobble');
mascot.express('heartbeat');
```

---

## Plugin Lifecycle

Plugins go through these lifecycle stages:

| Method | When Called | Purpose |
|--------|-------------|---------|
| `constructor()` | Plugin instantiation | Initialize plugin state |
| `init(api)` | `registerPlugin()` | Access mascot API, register features |
| `update(dt, state)` | Every frame | Update animations, react to state |
| `render(ctx, state)` | Every frame | Custom rendering (optional) |
| `destroy()` | `unregisterPlugin()` | Cleanup, unregister features |

### Lifecycle Flow

```
new Plugin() → registerPlugin() → init() → [update/render loop] → destroy()
```

---

## Plugin API Reference

### init(api)

Called when plugin is registered. The `api` object provides:

```javascript
init(api) {
    this.mascot = api.mascot || api;  // EmotiveMascot instance

    // Access emotion system
    const emotions = this.mascot.Emotions || window.Emotions;

    // Access gesture system
    const gestures = this.mascot.Gestures || window.Gestures;

    // Access renderer
    const renderer = this.mascot.renderer;
}
```

### update(deltaTime, state)

Called every animation frame:

```javascript
update(deltaTime, state) {
    // deltaTime: ms since last frame
    // state: current mascot state

    console.log(state.emotion);      // Current emotion
    console.log(state.gesture);      // Current gesture
    console.log(state.intensity);    // 0-1 intensity
}
```

### render(ctx, state)

Optional custom rendering:

```javascript
render(ctx, state) {
    // ctx: CanvasRenderingContext2D
    // state: current mascot state

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 50, 50);
    ctx.restore();
}
```

### destroy()

Cleanup when plugin is removed:

```javascript
destroy() {
    // Unregister features
    // Clear timers/intervals
    // Release resources
    this.activeAnimations.clear();
}
```

---

## Emotion Configuration Reference

Full emotion configuration options:

```javascript
{
    // Identity
    name: 'myEmotion',
    emoji: '🎭',
    description: 'My custom emotion',

    // Visual
    visual: {
        primaryColor: '#FF6B35',
        secondaryColor: '#FFD93D',
        particleCount: 15,
        particleSize: { min: 2, max: 6 },
        glowIntensity: 0.8,
        trailLength: 5,
        pulseRate: 1.0
    },

    // Particles
    particles: {
        behavior: 'ambient',     // ambient, floating, directional, burst
        density: 'medium',       // low, medium, high
        speed: 'normal'          // slow, normal, fast
    },

    // Animation modifiers
    modifiers: {
        speed: 1.0,
        amplitude: 1.0,
        intensity: 1.0,
        smoothness: 1.0
    },

    // Associated gestures
    gestures: ['sway', 'pulse'],

    // Transition settings
    transitions: {
        neutral: {
            duration: 1000,
            easing: 'ease-in-out',
            gesture: 'pulse'
        }
    }
}
```

---

## Gesture Configuration Reference

Full gesture configuration options:

```javascript
{
    // Identity
    name: 'myGesture',
    type: 'blending',            // blending, exclusive
    emoji: '✨',
    description: 'My custom gesture',

    // Timing
    config: {
        duration: 1000,          // ms
        easing: 'easeInOutQuad', // linear, easeIn, easeOut, easeInOut
        loop: false,             // Repeat animation
        delay: 0                 // Start delay in ms
    },

    // Animation function
    apply: (particle, progress, motion, dt, centerX, centerY) => {
        // particle: Individual particle object
        // progress: 0-1 animation progress
        // motion: Motion parameters
        // dt: Delta time
        // centerX, centerY: Canvas center
    },

    // Cleanup function
    cleanup: (particle) => {
        // Called when gesture ends
        // Clean up particle.gestureData
    }
}
```

---

## Best Practices

### 1. Use Namespaced Names

Prefix your emotions/gestures to avoid conflicts:

```javascript
// Good
adapter.registerPluginEmotion('myPlugin_nostalgic', config);

// Also good - use your plugin name
adapter.registerPluginEmotion('nostalgic', config);  // If unique
```

### 2. Clean Up Properly

Always implement `destroy()`:

```javascript
destroy() {
    // Clear intervals/timeouts
    clearInterval(this.updateInterval);

    // Clear animation state
    this.activeAnimations.clear();

    // Unregister features
    Object.keys(this.emotions).forEach(name => {
        adapter.unregisterPluginEmotion(name);
    });
}
```

### 3. Handle Missing APIs Gracefully

```javascript
registerEmotions() {
    const emotionModule = this.mascot?.Emotions || window.Emotions;
    if (!emotionModule?.pluginAdapter) {
        console.warn('Emotion plugin adapter not available');
        return;
    }
    // Continue registration...
}
```

### 4. Provide Plugin Info

Implement `getInfo()` for debugging:

```javascript
getInfo() {
    return {
        name: this.name,
        version: this.version,
        type: this.type,
        emotions: Object.keys(this.emotions),
        author: 'Your Name',
        description: 'What this plugin does'
    };
}
```

---

## Example Plugins

See working examples in the repository:

- [example-emotion-plugin.js](../src/plugins/example-emotion-plugin.js) - Adds "nostalgic" and "determined" emotions
- [example-gesture-plugin.js](../src/plugins/example-gesture-plugin.js) - Adds "wobble", "figure8", "heartbeat" gestures
- [example-particle-plugin.js](../src/plugins/example-particle-plugin.js) - Custom particle behaviors
- [fizzy-particle-plugin.js](../src/plugins/fizzy-particle-plugin.js) - Fizzy bubble particles

---

## Troubleshooting

### Plugin not working?

1. **Check registration order**: Register plugins before `init()`
2. **Check API availability**: Log `this.mascot.Emotions` to verify
3. **Check console**: Look for registration errors
4. **Verify names**: Emotion/gesture names are case-sensitive

### Animations not updating?

1. **Implement update()**: The engine calls this every frame
2. **Check active state**: Your animation tracking must be accurate
3. **Verify progress calculation**: `progress` should go from 0 to 1

### Custom rendering not visible?

1. **Use ctx.save()/ctx.restore()**: Don't pollute global canvas state
2. **Check render order**: Plugin renders after main mascot
3. **Verify alpha/visibility**: Check `globalAlpha` isn't 0

---

## TypeScript Support

Type definitions for plugins:

```typescript
interface PluginAPI {
    mascot: EmotiveMascot;
}

interface EmotionConfig {
    name: string;
    emoji: string;
    color: string;
    energy: 'low' | 'medium' | 'high';
    visual: VisualConfig;
    particles: ParticleConfig;
    modifiers: ModifierConfig;
    gestures: string[];
}

interface GestureConfig {
    name: string;
    type: 'blending' | 'exclusive';
    emoji: string;
    description: string;
    config: AnimationConfig;
    apply: (particle: Particle, progress: number) => void;
    cleanup: (particle: Particle) => void;
}

interface Plugin {
    type: 'emotion' | 'gesture' | 'particle';
    name: string;
    version: string;
    init(api: PluginAPI): void;
    update?(deltaTime: number, state: MascotState): void;
    render?(ctx: CanvasRenderingContext2D, state: MascotState): void;
    destroy(): void;
    getInfo(): PluginInfo;
}
```

---

## Need Help?

- [Open an issue](https://github.com/joshtol/emotive-engine/issues) for bugs
- [Discussions](https://github.com/joshtol/emotive-engine/discussions) for questions
- See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for API overview
