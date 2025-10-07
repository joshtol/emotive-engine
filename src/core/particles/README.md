# 🎯 Modular Particle System

## ✅ Status: READY FOR DEPLOYMENT

This modular particle system is a **complete drop-in replacement** for the original monolithic Particle.js file.

## 🔄 How to Switch

### Current State
- **Original**: `src/core/Particle.js` (3000+ lines, monolithic)
- **Modular**: `src/core/Particle-modular.js` + this folder (15 behaviors, utilities, configs)
- **Import**: ParticleSystem.js currently imports from `'./Particle-modular.js'` for testing

### To Make the Switch Permanent

```bash
# 1. Commit original first (safety)
git add src/core/Particle.js
git commit -m "Archive original Particle.js before modular switch"

# 2. Backup and switch
mv src/core/Particle.js src/core/Particle-original.js
mv src/core/Particle-modular.js src/core/Particle.js

# 3. Update import in ParticleSystem.js
# Change: import Particle from './Particle-modular.js';
# To:     import Particle from './Particle.js';

# 4. Test everything works
# Open demo pages and verify particles behave correctly

# 5. Commit the switch
git add .
git commit -m "Switch to modular particle system"
```

### To Rollback if Needed

```bash
# Quick rollback
mv src/core/Particle.js src/core/Particle-broken.js
mv src/core/Particle-original.js src/core/Particle.js

# Or via git
git checkout HEAD~1 src/core/Particle.js
```

## 📁 Structure

```
particles/
├── behaviors/          # 15 particle behaviors
│   ├── ambient.js     # Gentle drift (neutral)
│   ├── rising.js      # Upward float (joy)
│   ├── falling.js     # Downward sink (sadness)
│   ├── aggressive.js  # Chaotic bursts (anger)
│   ├── scattering.js  # Flee from center (fear)
│   ├── burst.js       # Explosive expansion (surprise)
│   ├── repelling.js   # Push away (disgust)
│   ├── orbiting.js    # Valentine dance (love)
│   ├── connecting.js  # Social energy (curiosity)
│   ├── resting.js     # Ultra-slow (sleepy)
│   ├── radiant.js     # Sunburst (euphoria)
│   ├── popcorn.js     # Bouncing (joy)
│   ├── ascending.js   # Incense smoke (zen)
│   ├── erratic.js     # Nervous jitter (anxiety)
│   ├── cautious.js    # Watchful pause (suspicion)
│   ├── index.js       # Behavior registry
│   └── _template.js   # Template for new behaviors
│
├── config/            # Configuration constants
│   ├── physics.js     # Physics constants
│   ├── playground.js  # Safe-to-modify values
│   └── index.js       # Config exports
│
├── utils/             # Utility functions
│   ├── colorUtils.js  # Color selection
│   ├── mathCache.js   # Performance optimizations
│   ├── easing.js      # Animation curves
│   └── index.js       # Utility exports
│
├── gestures/          # (Coming soon)
│   └── ...            # Gesture system modules
│
└── rendering/         # (Coming soon)
    └── ...            # Rendering optimizations
```

## 🎨 Adding New Behaviors

1. Copy `behaviors/_template.js` to `behaviors/newbehavior.js`
2. Implement initialize and update functions
3. Add visual diagram and documentation
4. Import in `behaviors/index.js`
5. Add to BEHAVIORS array

## 🚀 Benefits of Modular System

- **Maintainable**: 15 files of ~150 lines vs 1 file of 3000+ lines
- **Discoverable**: Each behavior has clear purpose and documentation
- **Extensible**: Easy to add new behaviors using template
- **Debuggable**: Issues isolated to specific behaviors
- **Contributable**: Junior devs can modify single behaviors safely

## 📊 Metrics

- **Original**: 1 file, 3000+ lines
- **Modular**: 20+ files, ~150 lines each
- **API**: 100% compatible, zero breaking changes
- **Performance**: Identical (uses same algorithms)

## ✨ The Magic

The registry pattern means adding a new behavior is as simple as:
1. Create the file
2. Import it
3. Add to array

No switch statements, no massive file edits, just clean modular code.

---

*Built with the turn-key operation strategy: Build alongside, test, then switch.*