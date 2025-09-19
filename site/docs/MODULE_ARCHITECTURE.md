# Emotive Engine Module Architecture

## Overview
The Emotive Engine is designed with a modular, layered architecture that separates concerns and enables clean API boundaries. This document describes the module organization, dependencies, and design patterns.

## Architecture Principles

### 1. Separation of Concerns
- **Engine Core**: Internal implementation details
- **Public API**: Safe, controlled access layer
- **Site Integration**: Application-specific features
- **Utilities**: Shared, reusable components

### 2. Dependency Flow
```
┌─────────────────────────────────────────────┐
│              Site/Application               │
├─────────────────────────────────────────────┤
│             Public API Layer                │
│         (EmotiveMascotPublic.js)           │
├─────────────────────────────────────────────┤
│              Engine Core                    │
│          (EmotiveMascot.js)                │
├─────────────────────────────────────────────┤
│            Core Components                  │
│  ├── Renderer      ├── GestureController   │
│  ├── AudioSystem   ├── RhythmEngine        │
│  └── StateManager  └── EmotionSystem       │
├─────────────────────────────────────────────┤
│              Utilities                      │
│  ├── ErrorHandler  ├── ResourceManager     │
│  ├── PerformanceMonitor └── Debug          │
└─────────────────────────────────────────────┘
```

## Module Structure

### `/site/src/` - Engine Source
```
/site/src/
├── index.js                    # Main export, version info
├── EmotiveMascotPublic.js     # Public API wrapper
├── EmotiveMascot.js            # Core engine implementation
│
├── /core/                      # Core engine components
│   ├── EmotiveRenderer.js      # Canvas rendering engine
│   ├── GestureController.js    # Gesture management
│   ├── GestureRegistry.js      # Gesture definitions
│   ├── GestureCompatibility.js # Gesture blending/timing
│   ├── AudioContextManager.js  # Web Audio API management
│   ├── RhythmEngine.js         # Beat detection/sync
│   ├── StateManager.js         # State management
│   └── /gestures/              # Gesture implementations
│       ├── basic-gestures.js
│       ├── ambient-dance.js
│       └── composite.js
│
├── /utils/                     # Utility modules
│   ├── ErrorHandler.js         # Error handling system
│   ├── ResourceManager.js      # Memory management
│   ├── PerformanceMonitor.js   # Performance tracking
│   └── debug.js                # Debug logging
│
├── /config/                    # Configuration
│   └── engine-config.js        # Central configuration
│
└── /docs/                      # Documentation
    ├── PUBLIC_API.md           # API documentation
    ├── EVENTS.md               # Event system docs
    └── MODULE_ARCHITECTURE.md   # This file
```

### `/site/js/` - Site Integration
```
/site/js/
├── /core/                      # Site core
│   ├── app.js                  # Main application
│   └── module-loader.js        # Module loading
│
├── /controls/                  # UI Controls
│   ├── gesture-controller.js   # Gesture UI bridge
│   └── gesture-chain-controller.js
│
├── /ui/                        # UI Components
│   ├── rhythm-sync-visualizer.js
│   └── control-panel.js
│
├── /integrations/              # External integrations
│   └── firebase/               # Firebase features
│       ├── firebase-config.js
│       └── social-features.js
│
└── /utils/                     # Site utilities
    └── debug.js                # Debug utilities
```

### `/test/` - Testing Infrastructure
```
/test/
├── index.html                  # Test harness UI
├── test-runner.js              # Test execution framework
├── api-tests.js                # Public API tests
├── performance-tests.js        # Performance benchmarks
└── stress-tests.js             # Stress testing
```

## Key Modules

### 1. EmotiveMascotPublic.js
**Purpose**: Public API wrapper providing safe access to engine features

**Responsibilities**:
- Input validation and sanitization
- Error boundaries with graceful fallbacks
- API stability and backward compatibility
- Recording/playback functionality
- Event emission to external consumers

**Key Methods**:
- `init(canvas)` - Initialize engine
- `triggerGesture(name)` - Execute gesture
- `setEmotion(emotion, undertone)` - Change emotional state
- `startRecording()` / `stopRecording()` - Session recording
- `on(event, callback)` / `off(event, callback)` - Event handling

### 2. EmotiveMascot.js
**Purpose**: Core engine implementation

**Responsibilities**:
- Component initialization and lifecycle
- Render loop management
- State coordination between subsystems
- Internal event bus
- Resource management

**Components**:
- `renderer` - EmotiveRenderer instance
- `gestureController` - Gesture management
- `audioSystem` - Audio processing
- `rhythmEngine` - Beat detection/sync
- `emotionSystem` - Emotion state management

### 3. EmotiveRenderer.js
**Purpose**: Canvas rendering and animation

**Responsibilities**:
- Canvas context management
- Animation frame scheduling
- Particle system rendering
- Glow and visual effects
- Shape morphing animations

**Key Features**:
- Double buffering support
- Automatic quality adjustment
- Particle pooling for performance
- Smooth interpolation system

### 4. GestureController.js
**Purpose**: Gesture queue and execution management

**Responsibilities**:
- Gesture queue management
- Timing and scheduling
- Gesture blending
- Rhythm synchronization
- Fill pattern generation

**Integration Points**:
- Receives gestures from public API
- Communicates with renderer for execution
- Syncs with RhythmEngine for beat alignment

### 5. RhythmEngine.js
**Purpose**: Musical timing and beat detection

**Responsibilities**:
- BPM detection from audio
- Beat prediction and scheduling
- Tap tempo processing
- Gesture-to-beat alignment
- Confidence scoring

**Key Algorithms**:
- Agent-based BPM detection
- Adaptive beat window
- Phase-locked loop for timing

### 6. ErrorHandler.js
**Purpose**: Centralized error handling and recovery

**Features**:
- Custom error types with codes
- Recovery strategies (retry, fallback, graceful)
- Error history tracking
- Function wrapping for automatic handling
- Scoped error contexts

### 7. ResourceManager.js
**Purpose**: Memory and resource lifecycle management

**Features**:
- Resource tracking (animations, timers, listeners)
- Automatic garbage collection
- Memory usage monitoring
- Resource limits and cleanup
- Scoped resource management

### 8. PerformanceMonitor.js
**Purpose**: Performance tracking and optimization

**Metrics**:
- FPS tracking and averaging
- Frame time measurement
- Memory usage monitoring
- Gesture performance tracking
- Automatic quality adjustment

## Design Patterns

### 1. Facade Pattern
The `EmotiveMascotPublic` class acts as a facade, providing a simplified interface to the complex engine internals.

### 2. Observer Pattern
Event system allows loose coupling between components:
```javascript
// Internal event bus
this.eventBus.emit('gesture:start', { name: 'bounce' });

// External event emission
this.emit('gesture', { gesture: 'bounce', timestamp: Date.now() });
```

### 3. Strategy Pattern
Error recovery and gesture execution use strategy patterns:
```javascript
// Error recovery strategies
const strategy = errorHandler.getRecoveryStrategy(error.code);
errorHandler.applyRecovery(error, strategy);

// Gesture rendering strategies
const renderer = this.getRendererForGesture(gestureName);
renderer.execute(gesture);
```

### 4. Singleton Pattern
Utility modules use singleton instances:
```javascript
export const performanceMonitor = new PerformanceMonitor();
export const errorHandler = new ErrorHandler();
export const resourceManager = new ResourceManager();
```

### 5. Factory Pattern
Configuration system uses factory methods:
```javascript
export function getConfig() {
    const config = { ...BASE_CONFIG };
    if (isDev) mergeDeep(config, DEV_CONFIG);
    return applyOverrides(config);
}
```

## Module Dependencies

### Dependency Rules
1. **No Circular Dependencies**: Modules must not have circular imports
2. **Upward Dependencies Only**: Lower layers cannot depend on higher layers
3. **Interface Segregation**: Modules expose minimal public interfaces
4. **Dependency Injection**: Core components receive dependencies via constructor

### Import Graph
```
EmotiveMascotPublic
    ├── EmotiveMascot
    │   ├── EmotiveRenderer
    │   ├── GestureController
    │   │   └── GestureCompatibility
    │   ├── AudioContextManager
    │   ├── RhythmEngine
    │   └── StateManager
    └── ErrorHandler

All modules can import:
    ├── /utils/*
    └── /config/*
```

## Configuration Management

### Configuration Hierarchy
1. **Default Configuration** - Base settings in `engine-config.js`
2. **Environment Overrides** - Dev/Prod specific settings
3. **URL Parameters** - Runtime overrides via query params
4. **LocalStorage** - Persistent user preferences
5. **Runtime Updates** - Dynamic configuration changes

### Configuration Flow
```javascript
// Load order
DefaultConfig
  → EnvironmentConfig
    → URLParams
      → LocalStorage
        → RuntimeConfig
```

## Performance Considerations

### 1. Lazy Loading
Components are loaded on-demand:
```javascript
// Only load rhythm engine if needed
if (config.features.rhythmSync) {
    this.rhythmEngine = new RhythmEngine();
}
```

### 2. Resource Pooling
Reusable objects are pooled:
```javascript
// Particle pooling
this.particlePool = new ObjectPool(Particle, 1000);
```

### 3. Throttling & Debouncing
High-frequency operations are throttled:
```javascript
// Throttled resize handler
this.handleResize = throttle(this._resize.bind(this), 100);
```

### 4. Memory Management
Automatic cleanup and garbage collection:
```javascript
// Resource manager tracks and cleans up
resourceManager.registerAnimation(animationId);
// ... later
resourceManager.release(resourceId);
```

## Testing Strategy

### 1. Unit Tests
- Individual module functionality
- Input validation
- Error handling

### 2. Integration Tests
- Component interaction
- Event flow
- State management

### 3. Performance Tests
- FPS maintenance
- Memory usage
- Response times

### 4. Stress Tests
- High load scenarios
- Memory leak detection
- Long-running stability

## Future Enhancements

### Planned Modules
1. **WebGL Renderer** - GPU-accelerated rendering
2. **Plugin System** - Third-party extensions
3. **Network Sync** - Multi-user synchronization
4. **AI Behaviors** - Intelligent gesture selection
5. **Audio Synthesis** - Generated sound effects

### Architecture Evolution
- **Micro-frontends**: Split into smaller, deployable units
- **Web Workers**: Offload computation to background threads
- **WebAssembly**: Performance-critical code in WASM
- **Service Workers**: Offline capability and caching

## Best Practices

### 1. Module Creation
- Single responsibility principle
- Clear public interface
- Comprehensive error handling
- Performance monitoring hooks
- Debug logging support

### 2. Code Organization
```javascript
// Standard module structure
export class ModuleName {
    constructor(options = {}) {
        // Configuration
        this.config = { ...DEFAULT_CONFIG, ...options };

        // State
        this.state = { /* ... */ };

        // Dependencies
        this.dependency = null;

        // Initialization
        this.init();
    }

    // Public methods
    publicMethod() { /* ... */ }

    // Private methods (use # prefix when available)
    _privateMethod() { /* ... */ }

    // Cleanup
    destroy() { /* ... */ }
}
```

### 3. Error Handling
```javascript
// Use ErrorHandler for all public methods
publicMethod() {
    return errorHandler.wrap(() => {
        // Method implementation
    }, { context: 'ModuleName.publicMethod' })();
}
```

### 4. Resource Management
```javascript
// Register all resources
const timerId = setTimeout(() => {}, 1000);
const resourceId = resourceManager.registerTimer(timerId);

// Clean up in destroy
destroy() {
    resourceManager.release(resourceId);
}
```

### 5. Performance Monitoring
```javascript
// Add performance marks
performanceMonitor.mark('operation-start');
// ... operation ...
performanceMonitor.measure('operation', 'operation-start', 'operation-end');
```

## Conclusion

The Emotive Engine's modular architecture provides:
- **Maintainability** through clear separation of concerns
- **Testability** via isolated, mockable components
- **Performance** with monitoring and optimization built-in
- **Reliability** through comprehensive error handling
- **Extensibility** via well-defined interfaces

This architecture supports both current requirements and future growth while maintaining code quality and performance standards.