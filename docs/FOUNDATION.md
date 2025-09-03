# Foundation Components

This document describes the foundation components that have been implemented for the Emotive Communication Engine.

## Overview

The foundation provides the core infrastructure needed for the emotional expression system:

- **CanvasManager**: High-DPI canvas management and rendering utilities
- **ErrorBoundary**: Comprehensive error handling and graceful degradation
- **Easing Functions**: Smooth animation transitions
- **Color Utilities**: Color interpolation and manipulation for emotional transitions
- **EmotiveMascot**: Main API class that orchestrates all subsystems

## Components

### CanvasManager (`src/core/CanvasManager.js`)

Handles canvas lifecycle, high-DPI rendering, and coordinate management.

**Key Features:**
- Automatic high-DPI scaling using `devicePixelRatio`
- Debounced resize handling
- Transform utilities for drawing operations
- Centralized canvas state management

**Usage:**
```javascript
import CanvasManager from './core/CanvasManager.js';

const canvas = document.getElementById('my-canvas');
const manager = new CanvasManager(canvas);

// Get center coordinates
const center = manager.getCenter();

// Apply transforms
manager.setTransform(center.x, center.y, 1.5, Math.PI / 4);
// ... drawing operations ...
manager.restoreTransform();
```

### ErrorBoundary (`src/core/ErrorBoundary.js`)

Provides comprehensive error handling with logging, safe defaults, and recovery mechanisms.

**Key Features:**
- Function wrapping with automatic error handling
- Input validation for emotions, gestures, and parameters
- Context-aware safe defaults
- Error frequency tracking and suppression
- Recovery mechanisms with exponential backoff

**Usage:**
```javascript
import ErrorBoundary from './core/ErrorBoundary.js';

const errorBoundary = new ErrorBoundary();

// Wrap risky operations
const safeFunction = errorBoundary.wrap(riskyFunction, 'operation-context', fallbackValue);

// Validate inputs
const validEmotion = errorBoundary.validateInput(userInput, 'emotion', 'neutral');
```

### Easing Functions (`src/utils/easing.js`)

Provides smooth animation transitions with various easing curves.

**Available Functions:**
- `linear` - No acceleration
- `easeOutQuad` - Decelerating to zero velocity
- `easeInOutCubic` - Smooth acceleration and deceleration
- `easeOutElastic` - Elastic snap effect
- `easeOutBounce` - Bouncing effect
- And more...

**Usage:**
```javascript
import { easeOutQuad, applyEasing } from './utils/easing.js';

// Direct easing
const progress = easeOutQuad(0.5); // 0.75

// Apply to value range
const value = applyEasing(0.5, 0, 100, 'easeOutQuad'); // 75
```

### Color Utilities (`src/utils/colorUtils.js`)

Handles color conversion, interpolation, and manipulation for smooth emotional transitions.

**Key Features:**
- Hex ↔ RGB ↔ HSL conversions
- HSL-based color interpolation (better for emotional transitions)
- Brightness and saturation adjustments
- Contrast ratio calculations
- Predefined emotional color palette

**Usage:**
```javascript
import { interpolateHsl, EMOTIONAL_COLORS } from './utils/colorUtils.js';

// Interpolate between emotions
const transitionColor = interpolateHsl(
    EMOTIONAL_COLORS.sadness, 
    EMOTIONAL_COLORS.joy, 
    0.5
);

// Convert colors
const rgb = hexToRgb('#FF0000'); // { r: 255, g: 0, b: 0 }
```

### EmotiveMascot (`src/EmotiveMascot.js`)

Main API class that provides the fluent interface and orchestrates all subsystems.

**Key Features:**
- Fluent API with method chaining
- Automatic error handling integration
- Performance monitoring
- Canvas lifecycle management
- Placeholder implementations for future subsystems

**Usage:**
```javascript
import EmotiveMascot from './EmotiveMascot.js';

const mascot = new EmotiveMascot({ canvasId: 'my-canvas' });

// Fluent API
mascot
    .setEmotion('joy', 'confident')
    .express('bounce')
    .chain('pulse', 'spin')
    .start();

// Performance monitoring
const metrics = mascot.getPerformanceMetrics();
console.log(`FPS: ${metrics.fps}, Errors: ${metrics.errorStats.totalErrors}`);
```

## Architecture

The foundation follows a modular architecture with clear separation of concerns:

```
EmotiveMascot (Main API)
├── CanvasManager (Canvas operations)
├── ErrorBoundary (Error handling)
├── Utils/
│   ├── easing.js (Animation curves)
│   └── colorUtils.js (Color operations)
└── [Future subsystems]
    ├── EmotiveStateMachine
    ├── ParticleSystem
    ├── GestureSystem
    └── SoundSystem
```

## Error Handling Strategy

The foundation implements comprehensive error handling:

1. **Input Validation**: All user inputs are validated against expected types and values
2. **Safe Defaults**: Invalid inputs fall back to safe default values
3. **Error Logging**: Errors are logged with context and frequency tracking
4. **Graceful Degradation**: System continues operating even when components fail
5. **Recovery Mechanisms**: Automatic retry with exponential backoff for recoverable errors

## Performance Considerations

- **High-DPI Support**: Automatic scaling for crisp rendering on all displays
- **Debounced Resize**: Prevents excessive resize calculations
- **Error Suppression**: Prevents console spam from repeated errors
- **Memory Management**: Proper cleanup and resource management
- **FPS Monitoring**: Built-in performance tracking

## Testing

The foundation includes comprehensive unit tests covering:

- Canvas management and high-DPI handling
- Error boundary functionality and input validation
- Easing function calculations
- Color conversion and interpolation
- Main API functionality and method chaining

Run tests with:
```bash
npm test
```

## Demo

A foundation demo is available at `demo/foundation-demo.html` that demonstrates:

- Basic mascot initialization and control
- Emotional state changes
- Gesture triggering
- Performance metrics display
- Foundation component testing

## Next Steps

The foundation is now ready for the implementation of the core emotional systems:

1. **EmotiveStateMachine** - Emotional state management and transitions
2. **ParticleSystem** - Emotional particle behaviors
3. **GestureSystem** - Expressive gesture execution
4. **SoundSystem** - Ambient emotional tones and effects
5. **Renderer** - 3-layer rendering system

Each system will integrate with the foundation components for error handling, canvas management, and smooth animations.