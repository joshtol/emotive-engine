# Emotive Engine Development Guide

Welcome to the Emotive Engine development team! This guide will help you get started with developing and contributing to the Emotive Engine.

## 📋 Prerequisites

- **Node.js** v16.0.0 or higher (v20.x recommended)
- **npm** v7.0.0 or higher
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/joshtol/emotive-engine.git
cd emotive-engine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Mode

```bash
# Watch mode for library development
npm run build:watch

# In another terminal, start a local server for testing
npx http-server site -p 8080
```

Open http://localhost:8080 to see the demo pages.

## 🛠️ Development Workflow

### Building

```bash
# Build production library
npm run build

# Build development version (with source maps)
npm run build:dev

# Build demo site
npm run build:demo

# Build everything
npm run build:all

# Build with bundle analysis
npm run build:analyze
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Run bundle optimization analysis
npm run optimize

# Generate documentation
npm run docs
```

## 📁 Project Structure

```
emotive-mascot/
├── src/                    # Source code
│   ├── core/              # Core systems
│   │   ├── AnimationLoopManager.js  # Central RAF loop
│   │   ├── EventManager.js          # Event listener management
│   │   ├── StateStore.js            # State management
│   │   ├── PerformanceMonitor.js    # Performance tracking
│   │   └── renderer/
│   │       ├── GradientCache.js     # Gradient caching
│   │       └── ContextStateManager.js
│   ├── emotions/          # Emotion system
│   ├── features/          # Feature modules
│   ├── plugins/           # Plugin system
│   ├── utils/             # Utilities
│   ├── EmotiveMascot.js  # Main class
│   └── index.js           # Entry point
├── site/                  # Demo site
│   ├── index.html         # Demo page
│   └── js/                # Demo scripts
├── test/                  # Test files
├── types/                 # TypeScript definitions
├── dist/                  # Built library (generated)
└── scripts/               # Build scripts
```

## 🔧 Configuration

### Build Configuration

The build is configured in `rollup.config.js`:

```javascript
// Main library build
export default {
    input: 'src/index.js',
    output: {
        file: 'dist/emotive-engine.min.js',
        format: 'umd',
        name: 'EmotiveEngine'
    }
}
```

### TypeScript Configuration

TypeScript is configured in `tsconfig.json` for type checking and declaration generation.

### Test Configuration

Tests use Vitest and are configured in `vitest.config.js`.

## 🧪 Writing Tests

Tests are located in the `test/` directory and use Vitest.

### Example Test

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationLoopManager } from '../src/core/AnimationLoopManager.js';

describe('AnimationLoopManager', () => {
    let manager;

    beforeEach(() => {
        manager = new AnimationLoopManager();
    });

    it('should register callbacks', () => {
        const callback = () => {};
        const id = manager.register(callback);
        expect(id).toBeGreaterThan(0);
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test AnimationLoopManager

# Watch mode for TDD
npm run test:watch
```

## 🎯 Key Systems

### Animation Loop Manager

Centralized animation loop that replaced 39 separate RAF calls:

```javascript
import { animationLoopManager, AnimationPriority } from './src/index.js';

const id = animationLoopManager.register(
    (deltaTime) => {
        // Your animation code
    },
    AnimationPriority.HIGH
);

// Later...
animationLoopManager.unregister(id);
```

### Event Manager

Prevents memory leaks with centralized event management:

```javascript
import { eventManager } from './src/index.js';

// Add listener
const id = eventManager.addEventListener(
    window, 'resize', handleResize, {}, 'myComponent'
);

// Remove all listeners for a component
eventManager.removeGroup('myComponent');
```

### State Store

Centralized state management with immutability:

```javascript
import { engineState } from './src/index.js';

// Set state
engineState.setState('renderer.color', '#ff0000');

// Subscribe to changes
const unsubscribe = engineState.subscribe('renderer', (state, changes) => {
    console.log('Changed:', changes);
});
```

### Performance Monitor

Track performance metrics in real-time:

```javascript
import { performanceMonitor } from './src/index.js';

// Mark performance points
performanceMonitor.mark('renderStart');
// ... render code ...
performanceMonitor.measure('render', 'renderStart');

// Get stats
const stats = performanceMonitor.getStats();
console.log(`FPS: ${stats.fps.current}`);
```

## 🐛 Debugging

### Performance Issues

1. Check the Performance Monitor:
```javascript
const stats = performanceMonitor.getStats();
console.log('Performance:', stats);
```

2. Check Animation Loop Stats:
```javascript
const loopStats = animationLoopManager.getStats();
console.log('Animation Loop:', loopStats);
```

3. Check for Memory Leaks:
```javascript
const leaks = eventManager.analyzeLeaks();
console.log('Potential Leaks:', leaks);
```

### Browser DevTools

1. **Performance Tab**: Record performance to identify bottlenecks
2. **Memory Tab**: Take heap snapshots to find memory leaks
3. **Network Tab**: Check asset loading times

## 📝 Code Style Guidelines

### General Rules

1. Use ES6+ features (arrow functions, destructuring, etc.)
2. Keep functions small and focused
3. Use meaningful variable names
4. Add JSDoc comments for public APIs
5. No console.log in production code

### Example Code

```javascript
/**
 * Calculates the distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between the points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
```

## 🚢 Deployment

### Building for Production

```bash
# Clean previous build
npm run clean

# Build optimized version
npm run build

# Check bundle size
ls -lh dist/emotive-engine.min.js
```

### Publishing

The library is published to GitHub Packages:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run publish:patch

# Minor version (1.0.0 -> 1.1.0)
npm run publish:minor

# Major version (1.0.0 -> 2.0.0)
npm run publish:major
```

## 📊 Performance Targets

The engine is optimized to meet these targets:

- **FPS**: Stable 60 FPS
- **CPU Usage**: < 10% idle, < 30% active
- **Memory**: < 50MB baseline
- **Bundle Size**: < 500KB minified
- **Load Time**: < 1 second

## 🤝 Contributing

### Branch Strategy

- `main` - Stable production code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Create a pull request to `develop`

### Commit Messages

Follow conventional commits format:

```
feat: Add new particle effect
fix: Resolve memory leak in animation loop
docs: Update API documentation
test: Add tests for gradient cache
refactor: Optimize render pipeline
```

## 🆘 Getting Help

### Resources

- [API Documentation](./API_BOUNDARIES.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Cleanup Summary](./CLEANUP_SUMMARY.md)
- [GitHub Issues](https://github.com/joshtol/emotive-engine/issues)

### Common Issues

**Q: Build fails with "module not found"**
A: Run `npm install` to ensure all dependencies are installed

**Q: Tests fail with timeout errors**
A: Increase the timeout in test configuration or check for infinite loops

**Q: Performance is poor in development**
A: Use production build (`npm run build`) for performance testing

## 📈 Monitoring

### CI/CD Pipeline

The project uses GitHub Actions for CI:

- Runs tests on Node 16.x, 18.x, and 20.x
- Builds library and demo
- Generates coverage reports
- Performs bundle analysis

### Coverage Goals

- Overall: > 80%
- Critical systems: > 90%
- New code: > 85%

## 🎉 Ready to Code!

You're all set! Start by:

1. Running `npm run build:watch` to start development mode
2. Opening `site/index.html` in your browser
3. Making changes and seeing them live
4. Running tests with `npm test`

Happy coding! 🚀

---

*Last Updated: ${new Date().toISOString()}*
*Engine Version: 2.4.0*