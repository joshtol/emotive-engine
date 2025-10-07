# Rhythm Game Implementation Task List

## Overview
Transform the Emotive Engine's rhythm sync from a constraint into a skill-based scoring system that rewards timing accuracy while maintaining instant gesture response.

## Core Principles
- **Local-first performance**: Instant feedback, async persistence
- **Progressive enhancement**: Works offline, enhanced when online
- **Modular architecture**: Clean separation between engine, site, and Firebase
- **ES6 modules only**: All code uses modern ES6 module syntax
- **Dynamic imports**: Lazy loading for optional features
- **Type safety**: JSDoc types for all exports

---

## Phase 1: Core Engine Components
### Rhythm Scoring System
- [ ] Create `/src/core/RhythmScorer.js`
  - [ ] Define timing windows (perfect/great/good/miss)
  - [ ] Implement `scoreGestureTiming()` method
  - [ ] Add combo tracking logic
  - [ ] Create score multiplier system
  - [ ] Export as ES6 module: `export class RhythmScorer { ... }`

### Rhythm State Machine
- [ ] Create `/src/core/RhythmStateMachine.js`
  - [ ] Define states: idle, playing, combo, fever
  - [ ] Implement state transitions
  - [ ] Add combo break/maintain logic
  - [ ] Create fever mode triggers
  - [ ] Export: `export class RhythmStateMachine { ... }`

### Score Event System
- [ ] Create `/src/core/RhythmEvents.js`
  - [ ] Define rhythm game events
  - [ ] Create event emitter for score updates
  - [ ] Add achievement trigger system

---

## Phase 2: Site Integration Layer
### Game Controller
- [ ] Create `/site/js/game/rhythm-game-controller.js`
  - [ ] Initialize with mascot and scorer
  - [ ] Implement `onGestureInput()` with immediate execution
  - [ ] Add local stats management
  - [ ] Create Firebase update queue
  - [ ] Import BPM detection: `import { BPMDetector } from '../ui/rhythm-sync-visualizer.js'`
  - [ ] Export controller: `export class RhythmGameController { ... }`

### Local Storage Manager
- [ ] Create `/site/js/game/local-stats-manager.js`
  - [ ] Implement local stats save/load
  - [ ] Add session tracking
  - [ ] Create offline score caching
  - [ ] Handle sync status
  - [ ] Export: `export class LocalStatsManager { ... }`

### Configuration
- [ ] Create `/site/config/rhythm-game-config.js`
  - [ ] Define scoring parameters
  - [ ] Set XP curves and levels
  - [ ] Configure timing windows
  - [ ] Add feature flags
  - [ ] Export config: `export const RHYTHM_CONFIG = { ... }`

---

## Phase 3: UI Components
### Rhythm Feedback UI
- [ ] Create `/site/js/ui/rhythm-feedback-ui.js`
  - [ ] Build timing feedback display ("PERFECT!", "GOOD!")
  - [ ] Add combo counter visualization
  - [ ] Create score popup animations
  - [ ] Implement streak effects

### Stats Display
- [ ] Create `/site/js/ui/rhythm-stats-display.js`
  - [ ] Design XP bar component
  - [ ] Add level indicator
  - [ ] Create stats summary panel
  - [ ] Build achievement notifications

### Visual Indicators
- [ ] Create `/site/js/ui/rhythm-visual-effects.js`
  - [ ] Add beat pulse indicator
  - [ ] Create timing guide visualization
  - [ ] Implement combo visual effects
  - [ ] Add perfect timing particle effects

---

## Phase 4: Firebase Integration
### Game Data Manager
- [ ] Create `/site/js/firebase/game-data-manager.js`
  - [ ] Implement batched update queue
  - [ ] Add debounced sync mechanism
  - [ ] Create conflict resolution
  - [ ] Handle offline/online transitions

### Firestore Schema
- [ ] Design game stats structure
  - [ ] Define user stats document
  - [ ] Create session collection
  - [ ] Design leaderboard structure
  - [ ] Plan achievement storage

### Social Features
- [ ] Create `/site/js/firebase/social-game-manager.js`
  - [ ] Implement leaderboard updates
  - [ ] Add friend challenges system
  - [ ] Create achievement sharing
  - [ ] Build battle mode foundation

---

## Phase 5: Integration & Testing
### Gesture Controller Updates
- [ ] Convert `/site/js/controls/gesture-controller.js` to ES6
  - [ ] Change from IIFE to: `export class GestureController { ... }`
  - [ ] Import game controller: `import { RhythmGameController } from '../game/rhythm-game-controller.js'`
  - [ ] Emit timing events
  - [ ] Add game mode toggle

### App.js Integration
- [ ] Update `/site/js/core/app.js`
  - [ ] Dynamic import: `const { RhythmGame } = await import('../game/index.js')`
  - [ ] Initialize rhythm game on demand
  - [ ] Connect to existing systems
  - [ ] Add game mode configuration

### Convert Bootstrap System
- [ ] Replace `/site/js/bootstrap-loader.js` with ES6 module loader
  - [ ] Create `/site/js/main.js` as ES6 entry point
  - [ ] Use dynamic imports for code splitting
  - [ ] Add `<script type="module" src="js/main.js">` to index.html

### Testing & Polish
- [ ] Test offline functionality
- [ ] Verify Firebase sync
- [ ] Test timing accuracy across devices
- [ ] Validate score calculations
- [ ] Check UI responsiveness

---

## Phase 6: Advanced Features
### Achievement System
- [ ] Create `/site/js/game/achievement-manager.js`
  - [ ] Define achievement criteria
  - [ ] Implement unlock tracking
  - [ ] Create badge system
  - [ ] Add progress tracking

### Progression System
- [ ] Create `/site/js/game/progression-manager.js`
  - [ ] Implement XP calculations
  - [ ] Create level-up system
  - [ ] Add unlock rewards
  - [ ] Design prestige system

### Analytics
- [ ] Create `/site/js/game/rhythm-analytics.js`
  - [ ] Track timing accuracy
  - [ ] Monitor session stats
  - [ ] Analyze gesture patterns
  - [ ] Generate player insights

---

## Phase 0: ES6 Migration (Priority)
### Convert Existing Codebase
- [ ] Convert all IIFE patterns to ES6 modules
  - [ ] `/site/js/controls/*.js` - All controllers
  - [ ] `/site/js/ui/*.js` - All UI components
  - [ ] `/site/js/core/*.js` - Core modules
  - [ ] `/site/js/config/*.js` - Configuration files
- [ ] Create `/site/js/main.js` as ES6 entry point
- [ ] Update index.html to use `<script type="module">`
- [ ] Add import/export statements to all modules
- [ ] Remove all `window.ClassName` assignments

## Phase 7: Modes & Features
### DJ/Performance Mode
- [ ] Create `/site/js/game/performance-mode.js`
  - [ ] AI-choreographed sequences
  - [ ] Beat-matched animations
  - [ ] Automated performances
  - [ ] Music visualization

### Battle Mode (Future)
- [ ] Create `/site/js/game/battle-mode.js`
  - [ ] Real-time multiplayer
  - [ ] Turn-based dance-offs
  - [ ] Scoring comparison
  - [ ] Victory conditions

---

## Technical Debt & Optimization
- [ ] Code review and refactoring
- [ ] Performance optimization
- [ ] Memory leak prevention
- [ ] Bundle size optimization
- [ ] Documentation updates

---

## Success Metrics
- Instant gesture response maintained
- Scoring accuracy within 10ms
- Firebase sync under 5 seconds
- UI feedback under 16ms (60fps)
- Offline mode fully functional
- No breaking changes to existing API

---

## Notes
- Each phase can be deployed independently
- Firebase features are optional enhancements
- UI components use vanilla JS with ES6 modules
- ALL code uses ES6 module syntax - no exceptions
- Maintain separation between engine and site code
- Convert existing IIFE patterns to ES6 modules
- Use dynamic imports for optional features