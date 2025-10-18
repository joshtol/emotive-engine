# Contributing to Emotive Engine

Thank you for your interest in contributing to Emotive Engine! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Search existing issues** first to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Screenshots or code samples if applicable

### Suggesting Features

1. **Check the roadmap** and existing feature requests
2. **Open an issue** with the "feature request" label
3. **Describe**:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives considered
   - Potential impact on existing features

### Pull Requests

#### Before Submitting

1. **Fork the repository** and create a branch from `main`
2. **Follow the coding standards** (see below)
3. **Write tests** for new features or bug fixes
4. **Update documentation** if needed
5. **Ensure all tests pass**: `npm test`
6. **Lint your code**: `npm run lint`

#### PR Guidelines

1. **Use descriptive commit messages**:
   ```
   feat: add rhythm-sync animation system
   fix: resolve particle memory leak in Safari
   docs: update API reference for setEmotion()
   refactor: extract emotion cache into separate module
   test: add coverage for gesture chaining
   ```

2. **Keep PRs focused**: One feature/fix per PR
3. **Reference related issues**: "Fixes #123" or "Relates to #456"
4. **Update CHANGELOG.md** under "Unreleased" section
5. **Add yourself to contributors** if it's your first PR

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/emotive-engine.git
cd emotive-engine

# Install dependencies
npm install

# Run tests
npm test

# Start development build
npm run build:dev
```

### Project Structure

```
emotive-engine/
├── src/
│   ├── core/           # Core animation systems
│   ├── emotions/       # Emotion state definitions
│   ├── gestures/       # Gesture animations
│   ├── particles/      # Particle behaviors
│   ├── utils/          # Utility functions
│   └── index.js        # Main entry point
├── test/               # Test files
├── examples/           # Example implementations
└── docs/               # Documentation
```

## Coding Standards

### JavaScript Style

- **ES6+ syntax**: Use modern JavaScript features
- **2-space indentation**
- **Semicolons**: Required
- **Single quotes**: For strings
- **Trailing commas**: In objects/arrays
- **Max line length**: 100 characters

### Naming Conventions

- **Classes**: PascalCase (`EmotiveRenderer`)
- **Functions/Methods**: camelCase (`setEmotion`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PARTICLES`)
- **Private properties**: Prefix with underscore (`_internalState`)

### Documentation

- **JSDoc comments** for all public APIs
- **Inline comments** for complex logic
- **README updates** for new features
- **API.md updates** for API changes

Example:
```javascript
/**
 * Set the emotional state of the mascot
 * @param {string} emotion - Name of the emotion ('joy', 'anger', etc.)
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.undertone] - Emotional undertone modifier
 * @param {number} [options.duration=500] - Transition duration in ms
 * @returns {Promise<void>}
 * @example
 * await mascot.setEmotion('joy', { undertone: 'energetic' });
 */
```

### Testing

- **Write unit tests** for utilities and core logic
- **Write integration tests** for workflows
- **Aim for 80%+ coverage** on new code
- **Use descriptive test names**:
  ```javascript
  describe('setEmotion()', () => {
    it('should transition to joy emotion', () => {
      // test implementation
    });

    it('should apply undertone modifiers', () => {
      // test implementation
    });
  });
  ```

### Performance

- **Avoid memory leaks**: Clean up listeners, intervals, timers
- **Use object pooling**: Reuse particles and temporary objects
- **Profile before optimizing**: Use Chrome DevTools
- **Target 60fps**: Keep frame budget under 16.67ms

## Commit Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/rhythm-sync
   ```

2. **Make commits**:
   ```bash
   git add .
   git commit -m "feat: add rhythm-sync animation system"
   ```

3. **Keep up to date**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push to your fork**:
   ```bash
   git push origin feat/rhythm-sync
   ```

5. **Open a Pull Request** on GitHub

## Pre-commit Hooks

This project uses Husky for pre-commit hooks:

- **Lint-staged**: Runs ESLint on staged files
- **Tests**: Runs related tests for changed files
- **Format**: Applies Prettier formatting

If hooks fail, fix issues before committing.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (dual MIT/Commercial). See [LICENSE.md](./LICENSE.md) for details.

## Questions?

- **Documentation**: Check [docs/](./docs/) folder
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

## Recognition

Contributors will be acknowledged in:
- CHANGELOG.md (for each release)
- README.md (contributors section)
- GitHub contributors page

Thank you for making Emotive Engine better! 🎉
