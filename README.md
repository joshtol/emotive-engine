<div align="center">
  <img src="assets/hero-banner.gif" alt="Emotive Engine" width="100%" />

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)

**Real-time character animation for AI interfaces**

Particle-based emotional visualization • Shape morphing • Dynamic gestures •
Pure Canvas 2D • TypeScript ready

[🎮 Live Demo](https://emotiveengine.com/demo) •
[Documentation](https://github.com/joshtol/emotive-engine/wiki) •
[Examples](examples/) •
[NPM](https://www.npmjs.com/package/@joshtol/emotive-engine)

</div>

## Quick Start

```bash
npm install @joshtol/emotive-engine
```

<table>
<tr>
<td width="50%">

```javascript
import EmotiveMascot from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot({
    canvasId: 'mascot-canvas',
});

await mascot.init();
mascot.start();

mascot.setEmotion('calm');
mascot.morphTo('moon');
mascot.express('breathe');
```

</td>
<td width="50%" align="center">

<img src="assets/emotion-demo.gif" alt="Emotion Demo" width="300" height="300" />

</td>
</tr>
</table>

## Features

- **Rich Emotions** - Joy, calm, anger, fear, surprise, sadness, love, and more
- **Shape Morphing** - Hearts, stars, moons, circles with smooth transitions
- **Dynamic Gestures** - Bounce, spin, pulse, breathe, wave, and more
- **Audio Reactive** - Beat detection and frequency visualization
- **Semantic Performances** - Context-aware emotional choreography (44 built-in)
- **TypeScript** - Full type definitions included
- **High Performance** - Smooth on mobile with adaptive quality

## Real-World Applications

Emotive Engine powers emotional AI interfaces across multiple industries:

| Industry          | Use Case                   | Live Demo                                                   | Value Proposition                                                       |
| ----------------- | -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| 🛒 **Retail**     | AI Shopping Assistant      | [View Demo](https://emotiveengine.com/use-cases/retail)     | Reduce cart abandonment with empathetic, celebratory interactions       |
| 📚 **Education**  | Cherokee Language Learning | [View Demo](https://emotiveengine.com/use-cases/cherokee)   | Cultural preservation through engaging, emotionally-responsive tutoring |
| 🏥 **Healthcare** | Patient Check-in Interface | _Coming Soon_                                               | Improve satisfaction scores with calming, empathetic avatars            |
| 🏠 **Smart Home** | Voice Assistant Avatar     | [View Demo](https://emotiveengine.com/use-cases/smart-home) | Visual feedback for voice commands with personality                     |
| 🎮 **Gaming**     | Music-Synced NPCs          | [Examples](examples/)                                       | Characters that react to soundtrack with emotional expressions          |

**Proven in Production:** Live demos at
[emotiveengine.com](https://emotiveengine.com) with 60 FPS performance on mobile
devices.

See [full documentation](https://github.com/joshtol/emotive-engine/wiki) for API
reference, advanced features, and examples.

**For Business/Acquisition Inquiries:**

- 📊 [Business Potential & Revenue Models](docs/BUSINESS_POTENTIAL.md)
- 🔬 [Technical Innovations & Patent-Eligible Systems](docs/INNOVATIONS.md)

## Examples Gallery

Explore interactive examples showing different capabilities:

| Example                                                      | Description                                                   | Demo                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------- |
| **[Interactive Playground](https://emotiveengine.com/demo)** | Full-featured demo with gestures, emotions, music, and combos | [**Try it live →**](https://emotiveengine.com/demo) |
| **[Rhythm Sync](examples/rhythm-sync-demo.html)**            | Upload music and watch the mascot dance with beat detection   | [View code](examples/rhythm-sync-demo.html)         |
| **[Basic Usage](examples/basic-usage.html)**                 | Minimal setup showing core emotion and gesture APIs           | [View code](examples/basic-usage.html)              |
| **[Breathing App](examples/breathing-app.html)**             | Guided breathing exercise with calm animations                | [View code](examples/breathing-app.html)            |
| **[Custom Gestures](examples/custom-gesture.html)**          | Create your own gesture animations                            | [View code](examples/custom-gesture.html)           |
| **[LLM Integration](examples/llm-integration/)**             | Connect to Claude AI for dynamic emotional responses          | [View code](examples/llm-integration/)              |

All examples are vanilla HTML/JS - no build tools required!

## Performance & Compatibility

### Browser Support

- **Chrome/Edge**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Mobile**: iOS Safari 14+, Chrome Android 90+ ✅

### Performance Guidelines

- **Recommended particle count**: 200-500 particles for 60fps on desktop
- **Mobile**: Automatically reduces to 100-200 particles
- **Canvas size**: Optimized for 300x300 to 800x800px
- **Adaptive quality**: Automatically scales based on device capabilities

### What's included

- Pure Canvas 2D rendering (no WebGL dependency)
- Zero framework dependencies
- Fully tree-shakeable ES modules
- TypeScript definitions included
- Source maps for debugging

## Documentation

- [API Reference](https://github.com/joshtol/emotive-engine/wiki) - Complete API
  docs
- [Examples](examples/) - Interactive code examples
- [Technical Innovations](docs/INNOVATIONS.md) - Patent-eligible systems
- [Business Potential](docs/BUSINESS_POTENTIAL.md) - Market analysis & revenue
  models
- [Changelog](CHANGELOG.md) - Version history with innovation timestamps

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Meta: Made with Emotive Engine**

The assets in this README were created using the engine itself:

- [Hero Banner Generator](examples/hero-banner-capture.html) (HTML + live code)
- [Demo GIF Generator](examples/emotion-demo-capture.html) (HTML + live code)

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
