# 🔌 Emotive Engine Plugin System

Welcome to the plugin directory! Here you'll find **example templates** showing
how to extend the Emotive Engine with custom emotions, gestures, particles, and
more.

> **⚠️ IMPORTANT**: These are **template files** for you to copy and customize,
> not pre-built plugins to import from the package. Copy the example plugin file
> to your project, modify it for your needs, then register it with your mascot.

## 📦 Available Example Plugin Templates

### 1. **Custom Emotion Plugin** (`example-emotion-plugin.js`)

Adds new emotional states to your mascot:

- **nostalgic** - Soft purple glow with dreamy particles
- **determined** - Bright orange with focused, directional particles

### 2. **Custom Gesture Plugin** (`example-gesture-plugin.js`)

Adds new animation gestures:

- **wobble** - Jello-like wobbling motion
- **figure8** - Traces a figure-8 pattern
- **heartbeat** - Double-pulse heartbeat effect

### 3. **Custom Particle Plugin** (`example-particle-plugin.js`)

Adds new particle effects:

- **fireflies** - Magical glowing particles that blink and wander
- **snow** - Gentle falling snow with realistic drift
- **matrix** - Digital rain effect like The Matrix

## 🚀 Quick Start

**Step 1:** Copy an example plugin file to your project (e.g.,
`example-emotion-plugin.js`)

**Step 2:** Customize it for your needs (change emotions, colors, behaviors)

**Step 3:** Use it in your code:

```javascript
// If using ES6 modules in your project:
import EmotiveMascot from 'emotive-engine';
import MyCustomPlugin from './my-custom-plugin.js'; // Your copied/modified plugin

// If using UMD bundle via CDN:
// <script src="https://unpkg.com/emotive-engine/dist/emotive-engine.js"></script>
// <script src="./my-custom-plugin.js"></script>

// Get canvas element
const canvas = document.getElementById('mascot-canvas');

// Create mascot instance
const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
    targetFPS: 60,
});

// CRITICAL: Initialize with canvas element
await mascot.init(canvas);

// Register your custom plugin
mascot.registerPlugin(new MyCustomPlugin());

// Start animation
mascot.start();

// Use your custom features!
mascot.setEmotion('nostalgic'); // If your plugin adds this emotion
mascot.express('wobble'); // If your plugin adds this gesture
```

> **Note**: The example plugins in this folder are **source templates**. They
> are not exported from the emotive-engine package. Copy them to your project
> and customize them.

## 🛠️ Creating Your Own Plugin

### Plugin Structure

Every plugin must have:

1. A `type` property: `'emotion'`, `'gesture'`, `'particle'`, `'renderer'`, or
   `'behavior'`
2. Required lifecycle methods:
    - `init(api)` - Called when plugin is registered (receives pluginAPI with
      `api.mascot`)
    - `update(deltaTime, state)` - Called every frame (~60 FPS)
    - `destroy()` - Called when plugin is unregistered

Optional methods:

- `render(ctx, state)` - For custom rendering effects
- `getInfo()` - Returns plugin metadata

### Basic Plugin Template

```javascript
class MyCustomPlugin {
    constructor() {
        this.type = 'emotion'; // or 'gesture', 'particle', etc.
        this.name = 'MyCustomPlugin';
        this.version = '1.0.0';
    }

    init(api) {
        // Get mascot instance from plugin API
        this.mascot = api.mascot || api; // Support both patterns

        // Access plugin adapters for registration
        // this.mascot.Emotions.pluginAdapter.registerPluginEmotion(...)
        // this.mascot.Gestures.pluginAdapter.registerPluginGesture(...)
        // this.mascot.ParticleBehaviors.pluginAdapter.registerPluginBehavior(...)

        // Plugin initialized
    }

    update(deltaTime, state) {
        // Update logic every frame
    }

    render(ctx, state) {
        // Optional: Custom rendering
    }

    destroy() {
        // Cleanup
        // Plugin destroyed
    }

    getInfo() {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            description: 'My awesome plugin!',
        };
    }
}

export default MyCustomPlugin;
```

## 📝 Plugin Types Explained

### Emotion Plugins

- Add new emotional states
- Define colors, particles, and behaviors
- Integrate with the state machine

### Gesture Plugins

- Create custom animations
- Override or extend `triggerGesture()`
- Animate position, scale, rotation

### Particle Plugins

- Define new particle behaviors
- Control spawning, movement, rendering
- Add special effects

### Renderer Plugins

- Modify the rendering pipeline
- Add post-processing effects
- Create visual overlays

### Behavior Plugins

- Add complex behavioral patterns
- Implement AI-like responses
- Create interactive features

## 🎨 Best Practices

1. **Namespace your additions** - Prefix custom emotions/gestures to avoid
   conflicts
2. **Clean up properly** - Remove all modifications in `destroy()`
3. **Document thoroughly** - Use the awesome header format from examples
4. **Test combinations** - Ensure your plugin works with others
5. **Performance matters** - Keep update() lightweight

## 🐛 Debugging Tips

- Use debug comments in lifecycle methods to track execution
- Check `this.mascot` properties for available APIs
- Test with `mascot.getPlugins()` to verify registration
- Use browser DevTools Performance tab to profile

## 📚 API Reference

### Mascot Properties Available in Plugins

```javascript
// Core components (internal - advanced use only)
this.mascot.canvas; // Canvas element
this.mascot.renderer; // EmotiveRenderer instance
this.mascot.stateMachine; // EmotiveStateMachine instance
this.mascot.particleSystem; // ParticleSystem instance

// Recommended: Use public API methods instead of accessing internals
// Public API is stable, internal properties may change
```

### Useful Methods

```javascript
// Emotions
this.mascot.setEmotion(emotion);
this.mascot.getCurrentEmotion();

// Gestures (both methods work - express is the primary API)
this.mascot.express(gesture); // Primary method
this.mascot.triggerGesture(gesture); // Alias for compatibility

// State access
this.mascot.getState();

// Audio (if enabled)
this.mascot.audioAnalyzer; // Access audio analyzer
```

## 💡 Plugin Ideas

- **Weather System** - Rain, lightning, fog effects
- **Personality Traits** - Shy, bold, playful behaviors
- **Interactive Games** - Follow the cursor, catch particles
- **Music Visualizer** - React to audio frequencies
- **Seasonal Themes** - Holiday-specific emotions/particles
- **Physics Effects** - Gravity, magnetism, collision
- **Story Mode** - Narrative-driven emotion sequences

## 🤝 Contributing

Have you created an awesome plugin? We'd love to see it!

1. Follow the header format from examples
2. Document all public methods
3. Include usage examples
4. Test with the latest Emotive Engine version

## 📄 License

All example plugins are part of the Emotive Engine and follow the same license.

---

_Happy plugin creating! Make your mascot unique! 🎭✨_
