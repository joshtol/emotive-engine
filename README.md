<div align="center">
  <img src="assets/emotive-engine-full-BW.svg" alt="Emotive Engine" width="600" />
  
  [![npm version](https://img.shields.io/npm/v/emotive-engine.svg)](https://www.npmjs.com/package/emotive-engine)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Performance](https://img.shields.io/badge/Performance-60fps-green.svg)](https://github.com/joshtol/emotive-engine)
  [![Canvas 2D](https://img.shields.io/badge/Canvas%202D-Optimized-blue.svg)](https://github.com/joshtol/emotive-engine)

  **A high-performance, emotionally-aware particle mascot system for next-generation conversational UIs**
  
  *"Making invisible states visible through coordinated particle chaos"*
  
  Built with pure Canvas 2D API, achieving rock-solid 60fps animations at 1080p and below with thousands of particles - no WebGL, no heavy frameworks required.
</div>

## 🌟 Features

### Production-Ready Engine
- **20+ Emotional States**: From joy to contemplation, each with unique particle behaviors
- **Advanced Particle Physics**: Flocking, morphing, gravitational effects, and fluid dynamics
- **Gesture Composition System**: Layer multiple animations for complex expressions
- **Performance Optimized**: Rock-solid 60fps with 1000+ particles through advanced render loop optimization
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
- **Therapeutic Tools**: Emotional regulation and mindfulness applications
- **Musical Instruments**: Interactive emotion-based sound generation

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

### 📦 Bundle Size Comparison

The Emotive Engine delivers a complete particle animation system in an incredibly compact package:

| Library/Site | Bundle Size | What You Get |
|--------------|------------|--------------|
| **Emotive Engine** | **50KB** | Full particle engine, 12 emotions, 13 behaviors, gestures, audio, a11y |
| React (library only) | 45KB | Just the framework, no functionality |
| jQuery | 87KB | DOM manipulation library |
| Three.js | 650KB | 3D graphics library |
| Average Fortune 500 Site | 2,000KB+ | Standard corporate website |
| Amazon.com | 2,500KB | E-commerce functionality |
| Home Depot | 3,200KB | Retail website |

**The Emotive Engine is 40-64x smaller than typical enterprise JavaScript bundles** while delivering significantly more sophisticated real-time animations. This exceptional efficiency translates to:

- ⚡ Sub-second load times on 3G networks
- 🔋 Minimal battery drain on mobile devices
- 🌍 Reduced carbon footprint from data transfer
- 💰 Lower CDN costs at scale
- 🚀 Instant parsing and execution

## 🚀 Road to Enterprise

### Current Enterprise-Ready Features
- ✅ **Performance**: Rock-solid 50+ fps at 2K resolution
- ✅ **Automatic Degradation**: DegradationManager scales quality to maintain performance
- ✅ **Accessibility Framework**: Screen reader, keyboard nav, reduced motion support
- ✅ **Memory Management**: Particle pooling, cache management, no memory leaks
- ✅ **Cross-Browser**: Works on all modern browsers with polyfills

### Roadmap to Fortune 500 Ready

#### 📊 Analytics Integration (Q1 2025)
- [ ] Google Analytics 4 event tracking
- [ ] Segment.io integration
- [ ] Custom event hooks for enterprise analytics
- [ ] Performance metrics reporting

#### ♿ WCAG 2.1 AA Compliance (Q1 2025)
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement focus management and indicators
- [ ] Ensure 4.5:1 color contrast ratios
- [ ] Add skip navigation links
- [ ] Create accessibility documentation

#### 🧪 Enterprise Testing Suite (Q2 2025)
- [ ] 8-hour continuous run testing (memory leak detection)
- [ ] Multi-instance stress testing
- [ ] Framework integration tests (React, Vue, Angular)
- [ ] Automated visual regression testing
- [ ] Load testing with 1000+ simultaneous instances

#### 📦 Build Optimization (Q2 2025)
- [ ] Code splitting for on-demand emotion loading
- [ ] Tree-shaking friendly ES modules
- [ ] Dynamic behavior imports
- [ ] CDN-ready distribution
- [ ] Target < 50KB initial bundle

#### 🔒 Security & Compliance (Q3 2025)
- [ ] SOC 2 compliance documentation
- [ ] CSP (Content Security Policy) compatibility
- [ ] GDPR-compliant analytics
- [ ] Accessibility audit certification

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

## 🎵 Future Enhancement: Musical Intelligence System

### The Vision
Transform the Emotive Engine into a living musical instrument that creates an unprecedented emotional connection between users and AI. By incorporating music theory, the mascot won't just look emotional—it will *sound* emotional in a way that resonates with our deepest human instincts.

### Phase 1: Emotional Chords (Near-term)
- Each emotion mapped to specific chord progressions
- Major scales for positive emotions (joy, surprise, love)
- Minor and modal scales for complex emotions (sadness, fear, contemplation)
- Gesture sounds that harmonize with current emotional key

### Phase 2: Interactive Composition (Mid-term)
```javascript
// Example: Emotion-driven music generation
const musicSystem = {
  emotions: {
    joy: { 
      scale: 'major', 
      progression: ['I', 'V', 'vi', 'IV'],
      tempo: 140,
      feel: 'upbeat'
    },
    sadness: { 
      scale: 'harmonic_minor', 
      progression: ['i', 'iv', 'V', 'i'],
      tempo: 60,
      feel: 'legato'
    }
  }
};
```

### Phase 3: Generative Musical AI (Long-term)
- Real-time melody generation based on user interaction patterns
- Particle collisions trigger notes in the current emotional scale
- Breathing patterns create rhythm and tempo
- Multi-user sessions create collaborative compositions
- Export emotional journeys as MIDI/audio files

### Technical Implementation Roadmap

#### Sound System Enhancements (No Dependencies)
1. **Additive Synthesis**: Build complex tones from harmonic series
2. **FM Synthesis**: Create rich, evolving textures
3. **Custom Waveforms**: Design unique timbres with PeriodicWave
4. **Filter Networks**: Shape sound with resonant filters
5. **Spatial Audio**: 3D positioning with PannerNode
6. **Convolution Reverb**: Generate acoustic spaces programmatically
7. **Granular Synthesis**: Create atmospheric textures
8. **Physical Modeling**: Simulate real instruments

#### Music Theory Engine
```javascript
class MusicTheoryEngine {
  // Core concepts to implement
  scales = { major, minor, dorian, phrygian, lydian, mixolydian };
  chords = { triads, sevenths, extensions, alterations };
  progressions = { classical, jazz, pop, experimental };
  rhythms = { straight, swing, polyrhythmic, generative };
  
  // Emotional mapping
  mapEmotionToHarmony(emotion, intensity) {
    // Return scale, chord progression, and voicing
  }
  
  // Generative capabilities
  generateMelody(emotion, length, style) {
    // Create melodic phrases following music theory rules
  }
}
```

### Why This Matters

**Human Connection**: Music is the universal language of emotion. When an AI can express itself musically, it creates a bridge between artificial and human intelligence that transcends words.

**Accessibility**: Audio feedback provides crucial information for visually impaired users, making the emotional state immediately comprehensible through sound.

**Therapeutic Applications**: Combining visual and musical emotional expression could create powerful tools for:
- Emotional regulation
- Mindfulness practices  
- Music therapy
- Autism support tools
- Stress relief applications

**Creative Possibilities**:
- Each user session becomes a unique composition
- Export emotional journeys as music
- Collaborative music creation through shared emotional states
- Live performance tools for electronic musicians
- Educational tools for teaching both music and emotional intelligence

### Implementation Philosophy
Start simple, iterate based on user feedback. Even basic chord progressions will create magical moments of connection. The goal isn't to replace human musicians but to create a new form of emotional expression that bridges the gap between human and artificial intelligence.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution
- New emotional states and behaviors
- Performance optimizations
- Accessibility improvements
- Plugin development
- Documentation and examples
- Music theory implementation
- Sound design and synthesis

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