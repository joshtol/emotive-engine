# ES6 Module Migration Plan

## THE LAW: Everything is ES6. No exceptions. No legacy.

## Phase 1: Core Infrastructure
### 1.1 Create ES6 Entry Point
- [ ] Create `/site/js/main.js` as the single entry point
- [ ] Remove `/site/js/bootstrap-loader.js`
- [ ] Update `index.html` to use `<script type="module" src="js/main.js">`

### 1.2 Convert Controllers (10 files)
All files in `/site/js/controls/`:
- [ ] audio-controller.js - Convert class to `export class AudioController`
- [ ] dice-controller.js - Convert to `export class DiceController`
- [ ] emotion-controller.js - Convert to `export class EmotionController`
- [ ] gesture-chain-controller.js - Convert to `export class GestureChainController`
- [ ] gesture-controller.js - Convert to `export class GestureController`
- [ ] orientation-controller.js - Convert to `export class OrientationController`
- [ ] randomizer-controller.js - Convert to `export class RandomizerController`
- [ ] shape-morph-controller.js - Convert to `export class ShapeMorphController`
- [ ] system-controls-controller.js - Convert to `export class SystemControlsController`
- [ ] undertone-controller.js - Convert to `export class UndertoneController`

### 1.3 Convert UI Components
All files in `/site/js/ui/`:
- [ ] audio-visualizer.js - Convert to `export class AudioVisualizer`
- [ ] dice-roller.js - Convert to `export class DiceRoller`
- [ ] display-manager.js - Convert to `export class DisplayManager`
- [ ] dj-scratcher.js - Convert to `export class DJScratcher`
- [ ] notification-system.js - Convert to `export class NotificationSystem`
- [ ] rhythm-sync-visualizer.js - Convert to `export class RhythmSyncVisualizer`
- [ ] scrollbar-compensator.js - Convert to `export class ScrollbarCompensator`
- [ ] theme-manager.js - Convert to `export class ThemeManager`
- [ ] tooltip-system.js - Convert to `export class TooltipSystem`

### 1.4 Convert Config Files
All files in `/site/js/config/`:
- [ ] assets-config.js - Convert to `export class AssetsConfig`
- [ ] constants.js - Convert to `export const` for all constants
- [ ] footer-config.js - Convert to `export class FooterConfig`
- [ ] icons-config.js - Convert to `export const ICONS`
- [ ] production.js - Convert to ES6 module
- [ ] ui-strings.js - Convert to `export const UI_STRINGS`

### 1.5 Convert Core Modules
All files in `/site/js/core/`:
- [ ] app.js - Convert to `export class EmotiveApp`
- [ ] app-bootstrap.js - Remove, merge into main.js
- [ ] global-state.js - Convert to `export const emotiveState`
- [ ] legacy-compatibility.js - DELETE (no legacy!)
- [ ] module-loader.js - DELETE (ES6 handles this)

## Phase 2: Source Files
### 2.1 Convert `/src/` Directory
- [ ] `/src/index.js` - Make it the ES6 entry for the engine
- [ ] `/src/EmotiveMascot.js` - Convert to `export class EmotiveMascot`
- [ ] All `/src/core/*.js` - Convert to ES6 exports
- [ ] All `/src/plugins/*.js` - Convert to ES6 exports

### 2.2 Site Source Files
- [ ] `/site/src/EmotiveMascot.js` - Convert to ES6
- [ ] `/site/src/EmotiveMascotPublic.js` - Convert to ES6
- [ ] All `/site/src/core/*.js` - Convert to ES6

## Phase 3: Build System
### 3.1 Update Build Tools
- [ ] Configure Rollup/Vite for ES6 bundling
- [ ] Remove all UMD/IIFE build targets
- [ ] Create development and production builds
- [ ] Add source maps

### 3.2 Remove Old Build Artifacts
- [ ] Delete all `.min.js` files
- [ ] Delete all `.umd.js` files
- [ ] Delete bundle files
- [ ] Clean up scripts directory

## Phase 4: Firebase & Utils
### 4.1 Firebase Modules
- [ ] `/site/js/firebase/auth-manager.js` - Convert to ES6
- [ ] `/site/js/firebase/auth-ui.js` - Convert to ES6
- [ ] `/site/js/firebase/firebase-config.js` - Convert to ES6

### 4.2 Utility Modules
- [ ] `/site/js/utils/debug.js` - Convert to ES6
- [ ] `/site/js/utils/feature-flags.js` - Convert to ES6
- [ ] `/site/js/utils/logger.js` - Convert to ES6

## Phase 5: HTML Updates
- [ ] Update index.html to use `<script type="module">`
- [ ] Remove all inline scripts that rely on globals
- [ ] Update maintenance.html similarly

## Conversion Pattern

### Before (IIFE):
```javascript
(function() {
    'use strict';

    class MyController {
        // ...
    }

    window.MyController = MyController;
})();
```

### After (ES6):
```javascript
export class MyController {
    // ...
}
```

### Import Example:
```javascript
import { MyController } from './controllers/MyController.js';
import { emotiveState } from './core/global-state.js';
import { RHYTHM_CONFIG } from './config/rhythm-config.js';
```

### Dynamic Import Example:
```javascript
// Lazy load heavy features
if (userWantsFeature) {
    const { HeavyFeature } = await import('./features/HeavyFeature.js');
    new HeavyFeature();
}
```

## main.js Structure:
```javascript
// Main entry point
import { EmotiveApp } from './core/app.js';
import { emotiveState } from './core/global-state.js';

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

async function init() {
    // Initialize core
    const app = new EmotiveApp();
    await app.initialize();

    // Store for debugging (development only)
    if (import.meta.env?.DEV) {
        window.emotiveApp = app;
    }
}
```

## Benefits After Migration:
1. **Tree shaking** - Smaller bundles
2. **Type safety** - Better IDE support
3. **Cleaner imports** - No globals
4. **Dynamic loading** - Faster initial load
5. **Modern tooling** - Vite, Rollup, etc.
6. **No namespace pollution** - No window assignments
7. **Better testing** - Easier to mock/test modules

## THE MANDATE:
- NO `window.` assignments
- NO IIFE patterns
- NO legacy compatibility
- NO UMD builds
- ONLY ES6 modules
- ONLY modern JavaScript

This is the way forward. No compromises.