# Emotive Engine Documentation

Welcome to the Emotive Engine documentation! This guide will help you understand the architecture, APIs, and best practices for working with the Emotive Engine.

## 📚 Documentation Index

### Architecture Documentation

- **[Gesture Animator Refactoring](./architecture/gesture-animator-refactoring.md)**
  - Complete overview of the god object refactoring
  - Design patterns and architectural decisions
  - Benefits and metrics
  - Migration guide for contributors

- **[Gesture Animator Diagram](./architecture/gesture-animator-diagram.md)**
  - Visual architecture diagrams
  - Class relationship diagrams
  - Data flow diagrams
  - Testing architecture

### API Reference

- **[Gesture Animators API](./api/gesture-animators-api.md)**
  - Complete API documentation for all 8 animator classes
  - Method signatures and parameters
  - Return value specifications
  - Usage examples and best practices

### Integration Guides

- **[LLM Integration Guide](./LLM_INTEGRATION.md)** ⭐ NEW
  - Connect Claude, GPT, Gemini, or any LLM to control the mascot
  - Natural language `feel()` API
  - System prompt templates
  - Vocabulary reference (~1400 synonyms)

### Guides

- [Testing Guide](./guides/testing.md) *(coming soon)*
- [Contributing Guide](./guides/contributing.md) *(coming soon)*
- [Performance Optimization](./guides/performance.md) *(coming soon)*

## 🏗️ Architecture Overview

The Emotive Engine uses a modular architecture with specialized components:

```
EmotiveEngine
├── EmotiveMascot (Main entry point)
├── EmotiveRenderer (Rendering pipeline)
│   ├── GestureAnimator (Animation coordinator)
│   │   ├── PhysicalGestureAnimator
│   │   ├── VisualEffectAnimator
│   │   ├── BreathGestureAnimator
│   │   ├── MovementGestureAnimator
│   │   ├── ShapeTransformAnimator
│   │   ├── ExpressionGestureAnimator
│   │   ├── DirectionalGestureAnimator
│   │   └── ComplexAnimationAnimator
│   ├── ParticleSystem
│   └── SpecialEffects
├── EmotiveStateMachine (State management)
├── ShapeMorpher (Shape morphing)
├── SoundSystem (Audio)
└── PluginSystem (Extensions)
```

## 🎯 Quick Links

### For Users
- [Getting Started](../README.md#getting-started)
- [Examples](../examples/)
- [API Overview](./api/gesture-animators-api.md)

### For Contributors
- [Architecture Overview](./architecture/gesture-animator-refactoring.md)
- [Code Structure](./architecture/gesture-animator-diagram.md)
- [Testing Guidelines](./guides/testing.md) *(coming soon)*

### For Maintainers
- [Refactoring History](./architecture/gesture-animator-refactoring.md#metrics)
- [Performance Metrics](./guides/performance.md) *(coming soon)*
- [Release Process](./guides/releases.md) *(coming soon)*

## 📊 Recent Improvements

### October 2025 - GestureAnimator Refactoring

**Major architectural refactoring** to improve code quality and maintainability:

- ✅ Extracted 8 specialized animator classes from 1,472-line god object
- ✅ Reduced GestureAnimator by 43% (1,472 → 832 lines)
- ✅ Added 187 comprehensive unit tests (100% coverage)
- ✅ Maintained 100% backward compatibility
- ✅ Improved code organization and modularity

**Key Benefits:**
- Single Responsibility Principle applied throughout
- Easier to understand, test, and extend
- Clear separation of concerns
- Better performance characteristics

[Read more about the refactoring →](./architecture/gesture-animator-refactoring.md)

## 🔧 Development Tools

### Running Tests
```bash
npm test                    # Run all tests
npm test -- AnimatorName    # Run specific test suite
npm run test:coverage       # Generate coverage report
```

### Building
```bash
npm run build              # Full build
npm run build:lean         # Lean build (no examples)
npm run build:dev          # Development build with source maps
```

### Linting
```bash
npm run lint               # Check code style
npm run lint:fix           # Auto-fix issues
```

## 📖 Code Examples

### Basic Gesture Usage

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

// Initialize mascot
const mascot = new EmotiveMascot({
  containerId: 'mascot-container',
  size: 'medium'
});

// Trigger a gesture
mascot.startGesture('bounce');

// Chain gestures
mascot.startGesture('bounce').then(() => {
  mascot.startGesture('flash');
});
```

### Custom Animation Sequence

```javascript
// Multiple gestures with timing
async function greetingSequence() {
  await mascot.startGesture('wave');
  await mascot.startGesture('nod');
  await mascot.startGesture('sparkle');
}

greetingSequence();
```

### Using Individual Animators

```javascript
// Direct access to specialized animators
const renderer = mascot.renderer;
const gestureAnimator = renderer.gestureAnimator;

// Access specific animator
const physicalAnimator = gestureAnimator.physicalGestureAnimator;

// Use animator method directly
const anim = {
  params: {
    frequency: 4,
    amplitude: 30
  }
};
const transform = physicalAnimator.applyBounce(anim, 0.5);
```

## 🧪 Testing Philosophy

The Emotive Engine follows Test-Driven Development (TDD) principles:

1. **RED**: Write failing tests first
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up and optimize

All code maintains 100% test coverage with comprehensive test suites for each component.

## 🎨 Design Principles

### SOLID Principles

- **Single Responsibility**: Each class has one well-defined purpose
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Components can be swapped for testing
- **Interface Segregation**: Minimal, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### Code Quality Standards

- **Comprehensive Testing**: 100% test coverage
- **Clear Documentation**: Every public API documented
- **Consistent Style**: ESLint enforced code style
- **Performance**: Optimized for 60fps animations
- **Accessibility**: WCAG 2.1 AA compliant

## 📈 Metrics

### Code Quality
| Metric | Value |
|--------|-------|
| Test Coverage | 100% |
| Total Tests | 2,827 |
| Test Success Rate | 100% |
| ESLint Issues | 0 |

### Performance
| Metric | Target | Actual |
|--------|--------|--------|
| Frame Rate | 60 FPS | 60 FPS ✅ |
| Bundle Size (lean) | < 100KB | ~95KB ✅ |
| Load Time | < 1s | ~800ms ✅ |

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Implement your feature
5. Ensure all tests pass
6. Submit a pull request

[Contributing Guide →](./guides/contributing.md) *(coming soon)*

## 📝 License

[View License](../LICENSE)

## 🔗 Related Resources

- [GitHub Repository](https://github.com/joshtol/emotive-engine)
- [Issue Tracker](https://github.com/joshtol/emotive-engine/issues)
- [Discussions](https://github.com/joshtol/emotive-engine/discussions)

---

## 📅 Documentation Changelog

### October 2025
- Added comprehensive gesture animator architecture documentation
- Created visual architecture diagrams
- Documented complete API for all 8 animator classes
- Added code examples and best practices

---

*Last updated: October 29, 2025*
*Documentation version: 1.0.0*
