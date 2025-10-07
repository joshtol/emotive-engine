# Emotive Engine - API Boundaries Documentation

## Architecture Overview

The Emotive project has two distinct parts with clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                      EMOTIVE ENGINE                          │
│                        /src/ directory                       │
│                                                              │
│  • Self-contained animation engine                          │
│  • No external dependencies (except browser APIs)           │
│  • Publishable as NPM package                               │
│  • Clean public API via src/index.js                        │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ IMPORTS
                              │ (One-way only)
                              │
┌─────────────────────────────────────────────────────────────┐
│                       DEMO SITE                              │
│                      /site/ directory                        │
│                                                              │
│  • Web application demonstrating engine capabilities         │
│  • UI controls and visualization                            │
│  • Firebase integration and social features                 │
│  • Imports and uses the engine                              │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Rules

### ✅ ALLOWED
- Site → Engine (site imports from engine)
- Engine → Engine (internal imports within /src/)
- Site → Site (internal imports within /site/)

### ❌ FORBIDDEN
- Engine → Site (engine MUST NOT import from site)
- Engine → Window globals (no window.* assignments in engine)
- Direct file imports (use package exports)

## Public API Surface

### Primary Export
```javascript
// Default export - simplified API
import EmotiveMascot from '../src/index.js';
const mascot = new EmotiveMascot();
```

### Named Exports
```javascript
// Core systems
import {
    EmotiveMascot,
    EmotiveMascotPublic,
    EmotiveStateMachine,
    EventManager,
    EmotiveRenderer,
    ParticleSystem,
    AnimationController
} from '../src/index.js';

// Features
import {
    getEmotion,
    getGesture,
    listEmotions,
    listGestures,
    GrooveTemplates
} from '../src/index.js';

// Utilities
import {
    PerformanceMonitor,
    ErrorBoundary,
    checkBrowserSupport
} from '../src/index.js';
```

## Engine Public Methods

### Core API
```javascript
// Initialization
await mascot.init(canvas, options);

// Lifecycle
mascot.start();
mascot.pause();
mascot.resume();
mascot.stop();
mascot.destroy();

// Expression
mascot.triggerGesture('bounce');
mascot.setEmotion('happy');
mascot.express('wave');

// Configuration
mascot.setSoundEnabled(true);
mascot.setRhythmEnabled(true);
mascot.setBPM(120);

// Events
mascot.on('gesture:complete', callback);
mascot.off('gesture:complete', callback);
```

## Site-Specific Features

These belong in `/site/` and should NOT be in the engine:

- UI controls and buttons
- Theme management
- Firebase integration
- Social features
- Debug overlays
- Demo-specific visualizations
- URL routing
- Analytics

## Migration Guide

### Before (BAD)
```javascript
// In engine code
window.rhythmIntegration = rhythmIntegration;  // ❌
window.Gestures = {...};                       // ❌

// In site code
import EmotiveMascot from '../../src/EmotiveMascot.js';  // ❌ Direct import
```

### After (GOOD)
```javascript
// In engine code
export { rhythmIntegration };  // ✅ Export instead

// In site code
import { EmotiveMascot } from '../src/index.js';  // ✅ Use index
```

## File Organization

### Engine Structure (/src/)
```
/src/
├── index.js                 # Main export file
├── EmotiveMascot.js        # Main class
├── EmotiveMascotPublic.js  # Simplified API
├── /core/                  # Core systems
│   ├── EmotiveRenderer.js
│   ├── ParticleSystem.js
│   ├── AnimationController.js
│   ├── /emotions/          # Emotion definitions
│   ├── /gestures/          # Gesture definitions
│   └── /particles/         # Particle behaviors
├── /config/                # Configuration
└── /utils/                 # Utilities
```

### Site Structure (/site/)
```
/site/
├── index.html              # Main HTML
├── /js/                    # Site JavaScript
│   ├── /core/              # Site core (app.js)
│   ├── /controls/          # UI controls
│   ├── /ui/                # UI components
│   └── /utils/             # Site utilities
├── /src/                   # Site-specific modules
│   ├── /docs/              # Documentation
│   └── /plugins/           # Plugin examples
└── /styles/                # CSS
```

## Testing Boundaries

### Engine Tests
- Unit tests for all public methods
- No dependency on site code
- Mock canvas and browser APIs
- Performance benchmarks

### Site Tests
- Integration tests with engine
- UI interaction tests
- Firebase integration tests
- End-to-end tests

## Build Configuration

### Engine Build
```json
{
  "input": "src/index.js",
  "output": {
    "file": "dist/emotive-engine.js",
    "format": "esm"
  },
  "external": []  // No external dependencies
}
```

### Site Build
```json
{
  "input": "site/js/core/app.js",
  "output": {
    "file": "dist/site.js",
    "format": "iife"
  },
  "external": ["../src/index.js"]  // Engine is external
}
```

## Common Violations & Fixes

### 1. Engine importing from site
**Violation**: `import GestureRegistry from '../site/src/core/GestureRegistry.js';`
**Fix**: Move to engine or remove dependency

### 2. Window global assignments
**Violation**: `window.GrooveTemplates = GrooveTemplates;`
**Fix**: Export from module instead

### 3. Direct file imports
**Violation**: `import EmotiveMascot from '../../src/EmotiveMascot.js';`
**Fix**: Import from index.js

### 4. Circular dependencies
**Violation**: Engine needs site config, site needs engine
**Fix**: Pass config as parameters

## Validation Checklist

- [ ] Zero imports from engine to site
- [ ] No window.* assignments in engine
- [ ] All engine exports through index.js
- [ ] Site imports only from engine index
- [ ] No circular dependencies
- [ ] Clear separation of concerns
- [ ] Engine is self-contained
- [ ] Site handles all UI concerns

## Benefits of Clean Boundaries

1. **Maintainability**: Clear ownership of code
2. **Testability**: Can test engine in isolation
3. **Reusability**: Engine can be used in other projects
4. **Performance**: Better tree-shaking and bundling
5. **Documentation**: Clear API surface
6. **Versioning**: Can version engine independently
7. **Distribution**: Can publish engine to NPM

---

*Last Updated: ${new Date().toISOString()}*
*Engine Version: 2.4.0*