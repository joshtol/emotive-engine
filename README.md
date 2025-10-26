<div align="center">
  <img src="assets/hero-banner.gif" alt="Emotive Engine" width="100%" />

[![npm version](https://img.shields.io/npm/v/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Downloads](https://img.shields.io/npm/dm/@joshtol/emotive-engine.svg)](https://www.npmjs.com/package/@joshtol/emotive-engine)

**Real-time character animation for AI interfaces**

Particle-based emotional visualization • 15 emotions • Shape morphing • Pure
Canvas 2D • TypeScript ready

[Documentation](https://github.com/joshtol/emotive-engine/wiki) •
[Examples](examples/) •
[NPM](https://www.npmjs.com/package/@joshtol/emotive-engine)

</div>

## Quick Start

```bash
npm install @joshtol/emotive-engine
```

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

<div align="center">
  <img src="assets/emotion-demo.gif" alt="Demo" width="400" />
</div>

## Features

- **15 Emotions** - Joy, calm, anger, fear, surprise, sadness, love, and more
- **Shape Morphing** - Hearts, stars, moons, circles with smooth transitions
- **Dynamic Gestures** - Bounce, spin, pulse, breathe, wave
- **Audio Reactive** - Beat detection and frequency visualization
- **TypeScript** - Full type definitions included
- **Performance** - 60 FPS on mobile, adaptive quality system

See [full documentation](https://github.com/joshtol/emotive-engine/wiki) for API
reference, advanced features, and examples.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with Emotive Engine**

This README's [hero banner](examples/hero-banner-capture.html) and
[demo GIF](examples/emotion-demo-capture.html) were created using the engine
itself.

Created by [Joshua Tollette](https://github.com/joshtol)

</div>
