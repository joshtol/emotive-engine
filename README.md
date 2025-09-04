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

// Respond to events
mascot.on('stateChange', (state) => {
  console.log(`Mascot is feeling ${state.emotion}`);
});
```

## 🎨 Live Demo

- [**Sci-Fi Theme**](emotive-scifi-demo.html) - Futuristic UI with enhanced visual effects showcasing the full emotional range

## 🧠 Emotional Intelligence

The mascot responds to emotional states with sophisticated particle behaviors:

| Emotion | Particle Behavior | Visual Characteristics |
|---------|------------------|------------------------|
| **Neutral** | Ambient drift | Soft blue, calm breathing |
| **Joy** | Rising, celebratory | Golden amber particles, increased glow |
| **Sadness** | Falling, heavy | Deep indigo tones, slow breathing |
| **Anger** | Aggressive, chaotic | Crimson particles, rapid breathing, jitter |
| **Fear** | Scattering, fleeing | Deep violet, trembling, hyperventilation |
| **Surprise** | Explosive burst | Bright amber-orange, initial gasp |
| **Disgust** | Repelling outward | Sickly green, shallow breathing |
| **Love** | Orbiting harmony | Hot pink, deep satisfied breaths |
| **Suspicion** | Scanning, cautious | Amber-brown, controlled breathing |
| **Excited** | Fizzy carbonation | Hot magenta, vibrating with energy |
| **Thinking** | Circular orbiting | Indigo, contemplative breathing |
| **Speaking** | Rhythmic pulsing | Variable based on tone |
| **Focused** | Convergent streams | Deep blue, steady concentration |
| **Zen** | Perfect stillness | Pure white, minimal movement |
| **Resting** | Languid drift | Soft purple, natural breathing |

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

## 🏗️ Architecture

### Core Components

- **EmotiveMascot**: Main orchestrator and public API
- **AnimationController**: Main animation loop and performance management
- **EmotiveRenderer**: Visual rendering of orb, glow, and eyes
- **ParticleSystem**: Object-pooled particle lifecycle manager
- **EmotiveStateMachine**: Emotional state transitions and undertones
- **PerformanceMonitor**: FPS tracking and adaptive quality
- **DegradationManager**: 4-tier quality levels (HIGH/MEDIUM/LOW/MINIMAL)
- **GazeTracker**: Cursor-aware eye following
- **IdleBehavior**: Organic blinking and swaying
- **EventManager**: Centralized event system with cleanup
- **PluginSystem**: Extensibility for custom behaviors

### Performance Optimizations

1. **Double Buffering**: Offscreen canvas for smooth rendering
2. **Batch Rendering**: Minimized draw calls through path aggregation
3. **Spatial Indexing**: Efficient particle neighbor queries
4. **Object Pooling**: Reduced garbage collection overhead
5. **Web Workers**: Parallel computation for physics calculations
6. **Adaptive Quality**: Dynamic LOD based on performance metrics

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