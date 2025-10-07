# 🔌 Emotive Engine Plugin System

Welcome to the plugin directory! Here you'll find examples of how to extend the Emotive Engine with custom emotions, gestures, particles, and more.

## 📦 Available Example Plugins

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

```javascript
import EmotiveMascot from '../EmotiveMascot.js';
import CustomEmotionPlugin from './plugins/example-emotion-plugin.js';
import CustomGesturePlugin from './plugins/example-gesture-plugin.js';
import CustomParticlePlugin from './plugins/example-particle-plugin.js';

// Create mascot
const mascot = new EmotiveMascot(canvas);

// Register plugins
mascot.registerPlugin(new CustomEmotionPlugin());
mascot.registerPlugin(new CustomGesturePlugin());
mascot.registerPlugin(new CustomParticlePlugin());

// Use new features!
mascot.setEmotion('nostalgic');
mascot.triggerGesture('wobble');
mascot.setParticleBehavior('fireflies');
```

## 🛠️ Creating Your Own Plugin

### Plugin Structure

Every plugin must have:
1. A `type` property: `'emotion'`, `'gesture'`, `'particle'`, `'renderer'`, or `'behavior'`
2. Required lifecycle methods:
   - `init(mascot)` - Called when plugin is registered
   - `update(deltaTime, state)` - Called every frame
   - `destroy()` - Called when plugin is unregistered

Optional methods:
- `render(ctx, state)` - For custom rendering
- `getInfo()` - Returns plugin metadata

### Basic Plugin Template

```javascript
class MyCustomPlugin {
    constructor() {
        this.type = 'emotion';  // or 'gesture', 'particle', etc.
        this.name = 'MyCustomPlugin';
        this.version = '1.0.0';
    }
    
    init(mascot) {
        this.mascot = mascot;
        // Setup your plugin
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
            description: 'My awesome plugin!'
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

1. **Namespace your additions** - Prefix custom emotions/gestures to avoid conflicts
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
this.mascot.canvas          // Canvas element
this.mascot.renderer        // EmotiveRenderer instance
this.mascot.stateMachine    // EmotiveStateMachine instance
this.mascot.particleSystem  // ParticleSystem instance
this.mascot.animationController // AnimationController instance
```

### Useful Methods

```javascript
// Emotions
this.mascot.setEmotion(emotion)
this.mascot.getCurrentEmotion()

// Gestures
this.mascot.triggerGesture(gesture, options)

// Particles
this.mascot.particleSystem.spawn(x, y, behavior)

// Audio (if enabled)
this.mascot.soundSystem.playTone(frequency)
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

*Happy plugin creating! Make your mascot unique! 🎭✨*