# AI Agent Development Guide

This document outlines strategies and best practices for AI agents working on the Emotive Engine codebase.

## 🔄 Safe Refactoring Strategy: The Turn-Key Operation

When refactoring critical files (like Particle.js), use this zero-risk approach:

### The Problem
- Large files (3000+ lines) need to be modularized
- Can't break production code during refactoring
- Need ability to rollback instantly if issues arise

### The Solution: Parallel Development

1. **Keep Original Working**
   - NEVER modify the working file directly
   - Original file continues to function normally
   - All app functionality remains intact

2. **Build Modular Version Alongside**
   ```
   src/core/
   ├── Particle.js              (original, untouched, working)
   ├── Particle-modular.js      (new modular version)
   └── particles/               (extracted modules)
       ├── behaviors/
       ├── config/
       ├── utils/
       └── ...
   ```

3. **Create Drop-In Replacement**
   - New file must have EXACT SAME API
   - Export same class/functions
   - No changes needed in consuming code

4. **Test Without Risk**
   ```javascript
   // In ParticleSystem.js, temporarily change:
   import Particle from './Particle.js';
   // To:
   import Particle from './Particle-modular.js';
   ```
   - If it works: continue testing
   - If it breaks: change import back, fix issues, try again

5. **The Switchover**
   ```bash
   # When modular version is perfect:
   git add Particle.js                    # Commit original first
   git commit -m "Archive original Particle.js"
   mv Particle.js Particle-original.js    # Backup original
   mv Particle-modular.js Particle.js     # Replace with modular
   git add .
   git commit -m "Switch to modular Particle.js"
   ```

6. **Rollback if Needed**
   ```bash
   # If issues discovered later:
   mv Particle.js Particle-broken.js
   mv Particle-original.js Particle.js
   # Or just: git checkout HEAD~1 Particle.js
   ```

### Example: Particle.js Modularization

**Current Structure:** Single 3000+ line file
**Target Structure:** 
- Particle.js (thin orchestrator, ~300 lines)
- 15+ behavior files (~100 lines each)
- Utility modules
- Configuration files

**Process:**
1. Extract behaviors to `particles/behaviors/*.js`
2. Extract utilities to `particles/utils/*.js`
3. Extract config to `particles/config/*.js`
4. Create `Particle-modular.js` that imports and orchestrates
5. Test thoroughly
6. Switch files when ready

### Benefits
- ✅ **Zero downtime** - App never breaks
- ✅ **Easy rollback** - One file rename or git command
- ✅ **Safe testing** - Test in real environment
- ✅ **Git safety** - Original always in history
- ✅ **Incremental** - Can pause/resume anytime

## 📝 Documentation Standards

When modularizing code:

1. **Each Module Gets:**
   - Header with purpose
   - Visual diagrams where applicable
   - "Used by" section
   - "Recipe to modify" section

2. **Template Files:**
   - Create `_template.js` files for common patterns
   - Include clear instructions for creating new variants

3. **Registry Pattern:**
   - Use registries instead of switch statements
   - Makes adding new features trivial

## 🎯 Priorities for Agents

1. **Never Break Production**
   - Test everything
   - Use parallel development
   - Commit working code before changes

2. **Think Like a Contributor**
   - Make code approachable for junior devs
   - Add visual diagrams
   - Include modification recipes

3. **Document Everything**
   - Why decisions were made
   - How to extend/modify
   - Where to find things

## 🚀 Quick Start for New Agents

1. Read this file first
2. Check existing patterns in codebase
3. Use turn-key operation for major refactors
4. Test, test, test
5. Document your changes

---

*Last Updated: [Current Date]*
*Strategy Proven With: Particle.js modularization*