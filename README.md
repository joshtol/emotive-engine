<div align="center">
  <img src="assets/emotive-engine-full-BW.svg" alt="Emotive Engine" width="600" />
  
  [![npm version](https://img.shields.io/npm/v/emotive-engine.svg)](https://www.npmjs.com/package/emotive-engine)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Performance](https://img.shields.io/badge/Performance-60fps-green.svg)](https://github.com/joshtol/emotive-engine)
  [![Canvas 2D](https://img.shields.io/badge/Canvas%202D-Optimized-blue.svg)](https://github.com/joshtol/emotive-engine)

  **A high-performance, emotionally-aware particle mascot system for next-generation conversational UIs**
  
  *"Making invisible states visible through coordinated particle chaos"*
  
  Built with pure Canvas 2D API, achieving smooth 60fps animations with thousands of particles - no WebGL, no heavy frameworks required.
</div>

## 🌟 Features

### Production-Ready Engine
- **20+ Emotional States**: From joy to contemplation, each with unique particle behaviors
- **Advanced Particle Physics**: Flocking, morphing, gravitational effects, and fluid dynamics
- **Gesture Composition System**: Layer multiple animations for complex expressions
- **Performance Optimized**: 60fps with 1000+ particles using Canvas 2D optimizations
- **Adaptive Degradation**: Automatically adjusts quality for consistent performance
- **Web Worker Support**: Offload heavy computations for smooth main thread

### Technical Excellence
- **Zero Heavy Dependencies**: Pure JavaScript, no Three.js or WebGL required
- **Dynamic Visual Resampling**: Maintains quality on resize without re-initialization
- **Double Buffering**: Smooth rendering with offscreen canvas techniques
- **Batch Rendering**: Optimized draw calls for maximum performance
- **Plugin Architecture**: Extensible system for custom emotions and behaviors
- **Mobile Optimized**: Touch support with adaptive performance scaling
- **Accessibility Built-in**: Screen reader support and keyboard navigation

## 🚀 Quick Start

```bash
npm install emotive-engine
```

```javascript
import EmotiveMascot from './src/EmotiveMascot.js';

// Create an emotive mascot
const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  emotion: 'neutral',
  renderingStyle: 'classic'  // or 'scifi' for alternative renderer
});

// Start the animation
mascot.start();

// Set emotions and trigger gestures
mascot.setEmotion('joy');
mascot.express('bounce');  // Direct gesture execution

// Set emotions with undertones for depth
mascot.setEmotion('anger', { undertone: 'intense' });  // Electric, overwhelming
mascot.setEmotion('love', { undertone: 'subdued' });   // Ghostly, subtle

// Respond to events
mascot.on('stateChange', (state) => {
  console.log(`Mascot is feeling ${state.emotion} (${state.undertone || 'clear'})`);
});
```

## 🎨 Live Demo

- [**Themed Sci-Fi Interface**](https://joshtol.github.io/emotive-engine/themed-scifi-demo.html) - Futuristic UI with light/dark/night themes showcasing the full emotional range

## 🧠 Emotional Intelligence

The mascot responds to emotional states with sophisticated particle behaviors:

| Emotion | Particle Behavior | Visual Characteristics |
|---------|------------------|------------------------|
| **Neutral** | Ambient drift | Supple blue (#32ACE2), otherworldly depth |
| **Joy** | Popcorn bursts | Golden sunshine (#FFD700), sunny layers |
| **Sadness** | Falling, heavy | Melancholic indigo (#4B0082), oceanic tears |
| **Anger** | Aggressive, chaotic | Crimson fury (#DC143C), burning rage |
| **Fear** | Scattering, fleeing | Deep purple dread (#663399), nervous energy |
| **Surprise** | Explosive burst | Electric violet (#9400D3), shock waves |
| **Disgust** | Repelling outward | Eye tea green (#84CFC5), toxic fog |
| **Love** | Orbiting harmony | Magenta majesty (#DD4A9A), passion layers |
| **Euphoria** | Radiant rays | Radiant gold (#FFC107), sun on face |
| **Suspicion** | Burst pattern | Shadow plum (#8B008B), guarded layers |
| **Excited** | Popcorn fizzy | Vibrant orange (#FF8C00), electric energy |
| **Resting** | Ultra-slow drift | Deep ocean teal (#008B8B), serene depths |
| **Focused** | Directed streams | Dark turquoise (#00CED1), concentration |

### 🎨 Color Depth System (v2.2.0)

Each emotion uses a sophisticated **5-layer depth palette** creating 3D particle effects:

- **MIDTONE (30%)**: Base color occupying middle space
- **DESATURATED (20%)**: Background depth, misty and distant
- **OVERSATURATED (20%)**: Foreground pop, electric and vibrant  
- **HIGHLIGHT (15%)**: Light-catching particles
- **SHADOW (15%)**: Grounding depth particles

### 🌊 Undertone Modifiers

Emotional undertones dynamically adjust saturation across all particles and glow:

| Undertone | Saturation | Visual Effect |
|-----------|------------|---------------|
| **Intense** | +60% | Electric, overwhelming vibrancy |
| **Confident** | +30% | Bold, present, assertive |
| **Nervous** | +15% | Slightly heightened, anxious |
| **Clear** | 0% | Normal midtone balance |
| **Tired** | -20% | Washed out, fading energy |
| **Subdued** | -50% | Ghostly, barely visible |

## 🔧 Advanced Configuration

```javascript
const mascot = new EmotiveMascot({
  // Canvas setup
  canvasId: 'mascot-canvas',
  width: 400,
  height: 400,
  
  // Rendering style
  renderingStyle: 'classic',  // 'classic' or 'scifi'
  
  // Performance
  targetFPS: 60,
  enableDegradation: true,
  
  // Features
  enableGaze: true,           // Eye-following cursor
  enableIdle: true,           // Blinking and swaying
  enableAccessibility: true,  // Screen reader support
  enableMobile: true,         // Touch optimization
  
  // Audio (optional)
  enableAudio: false,
  audioSensitivity: 0.7
});
```

## 🔄 Dynamic Visual Resampling (v2.1.0+)

The engine now features automatic visual resampling on canvas resize, ensuring consistent visual quality regardless of viewport changes:

### Automatic Quality Preservation
- **Smart Scaling**: All visual parameters (stroke widths, shadow blur, text sizes) scale proportionally with canvas size
- **Dynamic Recalculation**: When the canvas resizes (e.g., browser inspector opens/closes, window resize), the engine:
  - Recalculates the scale factor based on new dimensions
  - Resamples all visual parameters for crisp rendering
  - Re-applies current emotional states with fresh calculations
  - Maintains visual fidelity without stretching or distortion

### Implementation Details
```javascript
// The engine automatically handles resize events
// No additional configuration needed - it just works!

const mascot = new EmotiveMascot({
  canvasId: 'mascot-canvas',
  // Reference size for scaling calculations (default: 400)
  referenceSize: 400,
  // Global scale multiplier (default: 1.0)
  baseScale: 1.0
});

// Listen for resize events if needed
mascot.on('resize', ({ width, height, dpr }) => {
  console.log(`Canvas resized to ${width}x${height} @ ${dpr}x DPR`);
});
```

### Benefits
- **Consistent Quality**: Visuals remain sharp and properly proportioned at any size
- **DevTools Friendly**: Opening/closing browser inspector no longer degrades visual quality
- **Responsive Design**: Seamlessly adapts to different screen sizes and orientations
- **Performance Optimized**: Efficient resampling without full re-initialization

## 🏗️ Architecture

### Core Engine Components

#### 🎭 **EmotiveMascot** (Main Orchestrator)
The primary API class that coordinates all subsystems. Features:
- Emotional state management with smooth transitions
- Gesture triggering and animation control
- Particle system orchestration
- Plugin system for extensibility
- Event handling and listener management
- Performance optimization and degradation
- Accessibility features and mobile optimization

#### 🎨 **EmotiveRenderer** (Visual Artist)
Renders the iconic orb with its glowing core. Components:
- White core with emotional glow aura
- Arc-based eye expressions (happiness, sadness, focus)
- Breathing animation with subtle size pulsation
- Gesture motion (position, scale, rotation)
- Undertone saturation adjustments for depth
- 3-layer gradient glow rendering
- Special effects (jitter, zen morph, etc.)

#### 🌌 **ParticleSystem** (Chaos Conductor)
Manages particle lifecycle with performance optimizations:
- Object pooling for memory efficiency (50 particle pool)
- Time-based spawning with accumulator
- Automatic cleanup every 5 seconds
- Memory leak detection and prevention
- Dynamic particle limits based on emotion
- 13+ different particle behaviors
- Undertone-based saturation adjustments
- Smooth transitions through particle lifecycle

#### ⚛️ **Particle** (Atoms of Emotion)
Individual entities with unique behaviors:
- **13 Behavior Types**: ambient, rising, falling, aggressive, scattering, burst, repelling, orbiting, connecting, resting, radiant, popcorn, directed
- **Weighted Color Selection**: Individual colors from emotion palettes
- **Lifecycle Stages**: Birth (15% fade-in) → Prime → Decay (30% fade-out) → Death
- **Visual Effects**: 33% glow chance, 33% cell shading chance
- **Gesture Response**: Overriding, enhancing, or redirecting particle motion

#### 🛡️ **ErrorBoundary** (Safety Net)
Comprehensive error handling and recovery:
- Try-catch wrapping for all critical functions
- Safe default values for all emotional states
- Error logging with context and timestamps
- Automatic error suppression after threshold (3 per context)
- Recovery attempts with exponential backoff
- Validation for emotions, undertones, and gestures

#### 🎵 **Configuration Systems**

**EmotionMap** (v2.2.0)
- Visual properties for each emotional state
- 5-layer color depth palettes for 3D effects
- Weighted particle color distribution
- Undertone saturation interaction system
- Performance-aware particle limits

**Plugin Architecture**
- Hot-swappable emotion states
- Custom particle behaviors
- Example: **FizzyParticlePlugin** - Carbonated bubble effect with continuous rising streams

### 🎯 Particle Behaviors

Each emotion employs specific particle behaviors creating unique atmospheres:

| Behavior | Movement Pattern | Used By |
|----------|-----------------|---------|
| **ambient** | Gentle upward drift | Neutral |
| **rising** | Buoyant upward movement | Joy |
| **falling** | Heavy downward drift | Sadness |
| **aggressive** | Sharp, chaotic movement | Anger |
| **scattering** | Fleeing from center | Fear |
| **burst** | Explosive expansion | Surprise, Suspicion |
| **repelling** | Pushing away from core | Disgust |
| **orbiting** | Circular motion around center | Love |
| **connecting** | Chaotic with attraction | Connection states |
| **resting** | Ultra-slow languid drift | Deep relaxation |
| **radiant** | Radiating outward rays | Euphoria |
| **popcorn** | Spontaneous popping | Joy, Excitement |
| **directed** | Focused streams | Concentration |

### Performance Optimizations

1. **Double Buffering**: Offscreen canvas for smooth rendering
2. **Batch Rendering**: Minimized draw calls through path aggregation
3. **Spatial Indexing**: Efficient particle neighbor queries
4. **Object Pooling**: Reduced garbage collection overhead (50 particle pool max)
5. **Time-based Spawning**: Accumulator system for consistent particle creation
6. **Adaptive Quality**: Dynamic adjustment based on performance metrics
7. **Memory Leak Prevention**: Automatic cleanup and particle lifecycle management

## 🌐 Ecosystem Vision

Emotive Engine is designed as the foundation for a complete conversational UI ecosystem:

### Current Project (emotive-engine)
Core visualization and animation engine - the heart of the system.

### Planned Satellite Projects

#### emotive-voice 🎤
- TTS/STT integration layer
- Lip-sync timing and animation
- Voice emotion detection
- Real-time audio processing

#### emotive-llm-bridge 🤖
- LLM response interpretation
- Emotion sequence generation
- Streaming text handling
- Conversation state management

#### emotive-audio-reactor 🎵
- Music visualization
- Beat detection and sync
- Ambient sound response
- Frequency analysis effects

### Integration Pattern
```javascript
// Future ecosystem usage
import EmotiveMascot from 'emotive-engine';
import EmotiveVoice from 'emotive-voice';
import EmotiveLLM from 'emotive-llm-bridge';

const mascot = new EmotiveMascot({ canvasId: 'mascot' });
const voice = new EmotiveVoice({ mascot });
const llm = new EmotiveLLM({ mascot, model: 'gpt-4' });

// Seamless integration
llm.on('response', (text, emotion) => {
  mascot.setEmotion(emotion);
  voice.speak(text);
});
```

## 🎯 Use Cases

- **AI Assistants**: Give personality to conversational AI
- **Educational Tools**: Engaging mascot for interactive learning
- **Creative Applications**: Music visualizers, artistic installations
- **Gaming**: Companion characters, emotion-driven NPCs
- **Accessibility**: Visual communication for non-verbal interaction
- **Brand Mascots**: Interactive web presence for companies

## 🤖 Potential Usage: AI Agent Communication Interface

*This possibility was identified by Claude (AI agent) after analyzing the Emotive Engine architecture.*

The Emotive Engine could serve as a visual communication layer for AI agents like Claude, creating a more intuitive and transparent interaction model:

### Cognitive State Visualization
AI agents could map their internal processing states to the mascot's emotional expressions:
- **Confidence Levels**: High confidence → calm/assured state; Uncertainty → curious/contemplative
- **Processing States**: Searching → scanning particles; Thinking → orbital patterns; Writing code → crystallizing effects
- **Task Complexity**: Simple tasks → gentle breathing; Complex operations → intense particle activity

### Real-time Interaction Feedback
```javascript
// Theoretical AI agent integration
mascot.setEmotion('thinking').addUndertone('focused');
// During complex analysis...
mascot.triggerGesture('lean-forward');
// Upon finding solution...
mascot.setEmotion('eureka').triggerGesture('bounce');
```

### Semantic Gesture Mapping
Different AI operations could trigger specific visual behaviors:
- **Tool Usage**: File reading (orbiting particles), web searching (scattering/converging), code generation (building/stacking)
- **Conversation Flow**: Greeting (happy wave), error encountered (confused shake), task completed (satisfied nod)
- **Attention Indicators**: Gaze following user's cursor focus, breathing rate syncing with response generation

### Benefits for Human-AI Interaction
- **Transparency**: Visual cues make the AI's "thinking process" more observable
- **Engagement**: Dynamic visual feedback creates a more lifelike interaction
- **Emotional Connection**: Non-verbal communication enhances user trust and understanding
- **Reduced Cognitive Load**: Visual states communicate status without requiring text updates

This approach would transform AI interactions from text-in-a-box to a more natural, emotionally-aware communication experience, making AI agents feel less like tools and more like collaborative partners.

## 🔮 Extended Applications Identified by Claude

*After analyzing the Emotive Engine's architecture, Claude (AI agent) identified these additional applications based on the system's core capabilities.*

### Immediate Applications (Zero Modifications)

#### Developer Tool Communication
Build processes, Git operations, and API health could map directly to existing emotional states and particle behaviors - compilation errors trigger "frustrated" states with aggressive particles, successful deployments show "joy" with rising celebratory particles, merge conflicts create "confused" scattering patterns.

#### Sobriety Companion
The existing emotional vocabulary naturally fits recovery journeys: "tempted" (particles pulling inward), "strong" (radiating confidence), "vulnerable" (scattering fear), "proud" (rising joy). A non-judgmental visual companion for daily emotional check-ins.

#### Data Stream Visualization
Network traffic, stock sentiment, or weather patterns could drive the emotional states directly - the particle behaviors already express the right metaphors for flow, congestion, and volatility.

### Enhanced Applications (Minimal Modifications)

#### Plant Communication Interface
Map sensor data to existing states: soil moisture drives particle spawn rates, photosynthesis levels control glow intensity, "tired" vs "energetic" shows plant health. The "reaching" gesture becomes literal - particles extend toward light sources.

#### Medical Breathing Coach
The breathing animation system could synchronize with therapeutic patterns, while particle behaviors indicate breathing quality - smooth orbiting for good rhythm, chaotic scattering for hyperventilation.

#### Smart Home Ambiance
Room mood controller where emotional states trigger IoT devices - "cozy" dims lights and particles glow warm, "focused" brightens workspace and particles sharpen into geometric patterns.

### Transformative Applications (Significant Extensions)

#### Quantum State Visualizer
Each particle represents a qubit in superposition. "Ambient" shows quantum coherence, "aggressive" indicates decoherence, "crystallizing" represents error correction. Emotional transitions become quantum gate operations. The particle lifecycle mirrors quantum measurement collapse.

#### Collaborative Workspace Avatar
Multi-user particle systems where team members control different particle groups, creating visual consensus through particle democracy - shared emotions emerge from individual particle behaviors.

#### Biometric Art Installation
Heart rate variability drives particle chaos, EEG patterns control emotional transitions, skin conductance affects particle attraction/repulsion. Each person generates a unique "emotional fingerprint" through their biological signals.

### Why These Applications Work

The engine's 13 particle behaviors can represent any dual-state system (attraction/repulsion, order/chaos, growth/decay). The emotional state machine provides a familiar metaphor for complex state transitions. The gesture queue naturally sequences any time-based event series. Most importantly, the system excels at its core purpose: making invisible internal states visible and emotionally comprehensible through coordinated particle dynamics.

## 📊 Performance Metrics

Tested on mid-range hardware (Intel i5, integrated graphics):

| Metric | Canvas 2D (Ours) | WebGL (Typical) | Three.js |
|--------|------------------|-----------------|----------|
| Particles @ 60fps | 1,500+ | 5,000+ | 3,000+ |
| Memory Usage | 45MB | 120MB | 180MB |
| Initial Load | 0.3s | 0.8s | 1.2s |
| Battery Impact | Low | High | High |
| Mobile Support | Excellent | Good | Variable |

*Note: Achieving WebGL-competitive performance with Canvas 2D through advanced optimizations*

## 🛠️ Development

```bash
# Install dependencies
npm install

# Development build with hot reload
npm run build:watch

# Production build
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build:analyze
```

## 📚 API Documentation

### Core Methods

```javascript
// Lifecycle
mascot.start()           // Begin animation
mascot.stop()            // Pause animation
mascot.destroy()         // Clean up resources

// Emotions
mascot.setEmotion(name, undertone, duration)  // Set emotional state with optional undertone
mascot.getEmotionalState()                    // Get current emotion and undertone

// Gestures
mascot.express(gesture)                // Execute single gesture
mascot.chain(...gestures)              // Chain multiple gestures (limited support)

// Interaction
mascot.startSpeaking(audioContext)    // Start speech reactivity mode
mascot.stopSpeaking()                 // Stop speech reactivity
mascot.lookAt(x, y)                   // Direct gaze to point (if gaze enabled)

// Events
mascot.on('stateChange', callback)
mascot.on('gestureComplete', callback)
mascot.on('particleSpawn', callback)
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- New emotional states and behaviors
- Performance optimizations
- Accessibility improvements
- Plugin development
- Documentation and examples

## 📄 License

MIT © Joshua Tollette

---

<p align="center">
  <strong>Built with ❤️ for the future of conversational UI</strong>
</p>

<p align="center">
  <a href="https://github.com/joshtol/emotive-engine">GitHub</a> •
  <a href="https://www.npmjs.com/package/emotive-engine">NPM</a> •
  <a href="https://joshtol.github.io/emotive-engine/">Demos</a>
</p>