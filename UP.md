# Emotive Engine - Upgrade Path

Actionable tasks to make this library a stellar open-source project that
delights developers of all skill levels.

**Fact-checked against codebase on 2026-01-13**

---

## Already Complete (No Action Needed)

The following items from the original analysis **already exist** in the
codebase:

| Item                   | Status                            | Location                            |
| ---------------------- | --------------------------------- | ----------------------------------- |
| CHANGELOG.md           | Exists (52KB, comprehensive)      | `/CHANGELOG.md`                     |
| GitHub Issue Templates | Exists (bug, feature, question)   | `/.github/ISSUE_TEMPLATE/`          |
| PR Template            | Exists                            | `/.github/PULL_REQUEST_TEMPLATE.md` |
| SECURITY.md            | Exists (comprehensive, 333 lines) | `/SECURITY.md`                      |
| CODE_OF_CONDUCT.md     | Exists (Contributor Covenant 2.1) | `/CODE_OF_CONDUCT.md`               |
| CI/CD Workflows        | Exists (test, ci, pages, release) | `/.github/workflows/`               |

---

## Priority 1: Critical (Do First)

### 1.1 Add 5-Line Quick Start to README Top

**File**: `README.md`

**Current State**: Quick Start exists but is buried after Features and Demo
Gallery sections (around line 149+).

**Task**: Add a prominent quick start immediately after badges (before the GIF
demo):

````markdown
## 30-Second Quick Start

```javascript
import { EmotiveMascot } from '@joshtol/emotive-engine';

const mascot = new EmotiveMascot();
await mascot.init(document.getElementById('app'));
mascot.start();
mascot.feel('happy, bouncing'); // Natural language control!
```
````

[Try it on CodeSandbox →](https://codesandbox.io/s/emotive-engine-xxxxx) |
[Full Documentation](#api-reference)

````

**Why**: Developers scan READMEs top-to-bottom. Show success in 5 lines before anything else.

---

### 1.2 Create Interactive Playground Link

**File**: `README.md`

**Current State**: No CodeSandbox/StackBlitz template linked.

**Task**:
1. Create a CodeSandbox template with minimal setup
2. Add badge/link to README Quick Start section:

```markdown
[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/emotive-engine-starter-xxxxx)
````

**Why**: Developers want to try before they install. Zero-friction
experimentation.

---

## Priority 2: High (This Week)

### 2.1 Implement "Did You Mean?" Suggestions

**File**: `src/utils/suggestions.js` (new file)

**Current State**: No fuzzy matching for typos exists in the codebase (verified
via grep).

**Task**: Add Levenshtein distance-based suggestions:

```javascript
/**
 * Suggest closest match using Levenshtein distance
 * @param {string} input - User input
 * @param {string[]} validOptions - Valid options
 * @param {number} maxDistance - Maximum edit distance (default: 3)
 * @returns {string|null} Closest match or null
 */
export function suggestClosestMatch(input, validOptions, maxDistance = 3) {
    const inputLower = input.toLowerCase();
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const option of validOptions) {
        const distance = levenshteinDistance(inputLower, option.toLowerCase());
        if (distance < bestDistance && distance <= maxDistance) {
            bestDistance = distance;
            bestMatch = option;
        }
    }

    return bestMatch;
}

function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
}
```

**Integration**: Update `src/utils/validation.js` to use suggestions in error
messages:

```javascript
import { suggestClosestMatch } from './suggestions.js';

// In validateEmotion or similar:
const suggestion = suggestClosestMatch(emotion, validEmotions);
const message = suggestion
    ? `Unknown emotion '${emotion}'. Did you mean '${suggestion}'?`
    : `Unknown emotion '${emotion}'. Valid options: ${validEmotions.join(', ')}`;
```

**Why**: Typos are the #1 source of beginner frustration. Smart errors = happy
developers.

---

### 2.2 Add Documentation Links to Error Messages

**File**: `src/core/events/ErrorResponse.js` (lines 92-139)

**Current State**: Recovery actions exist but don't include documentation URLs.

**Task**: Extend `generateRecoveryActions()` with doc links:

```javascript
generateRecoveryActions(type, _context) {
  const baseUrl = 'https://github.com/joshtol/emotive-engine/blob/main/docs';

  const recoveryMap = {
    'INVALID_EMOTION': [
      'Check if emotion is one of: joy, sadness, anger, fear, surprise, disgust, love, neutral',
      'Use mascot.getAvailableEmotions() to see valid options',
      `See ${baseUrl}/QUICK_REFERENCE.md#emotions`
    ],
    'INVALID_GESTURE': [
      'Verify gesture name matches available gestures',
      'Use mascot.getAvailableGestures() to see valid options',
      `See ${baseUrl}/QUICK_REFERENCE.md#gestures`
    ],
    'CANVAS_CONTEXT_LOST': [
      'Canvas context will attempt automatic recovery',
      'Reduce canvas size if problem persists',
      `See ${baseUrl}/TROUBLESHOOTING.md#canvas-issues`
    ],
    // ... update all other error types similarly
  };
  // ...
}
```

**Why**: Don't make developers search for answers. Point them directly to
solutions.

---

### 2.3 Update SECURITY.md Supported Versions

**File**: `SECURITY.md` (line 9)

**Current State**: Shows versions 2.5.x and 2.4.x as supported, but current
version is 3.2.3.

**Task**: Update the supported versions table:

```markdown
| Version | Supported           |
| ------- | ------------------- |
| 3.x.x   | Yes (Current)       |
| 2.5.x   | Security fixes only |
| < 2.5   | No                  |
```

**Why**: Outdated version table confuses users about what's actually supported.

---

## Priority 3: Medium (This Month)

### 3.1 Refactor TypeScript Types to Direct Exports

**File**: `types/index.d.ts`

**Current State**: Uses namespace pattern
(`export = EmotiveEngine; export as namespace EmotiveEngine;`).

**Task**: Add direct exports alongside namespace for modern TypeScript usage:

```typescript
// Keep namespace for backwards compatibility
export = EmotiveEngine;
export as namespace EmotiveEngine;

declare namespace EmotiveEngine {
    // ... existing types
}

// ADD: Direct exports for modern usage
export interface EmotiveMascotConfig {
    canvas?: HTMLCanvasElement;
    canvasId?: string | HTMLCanvasElement;
    // ... copy from namespace
}

export interface FeelResult {
    success: boolean;
    error: string | null;
    parsed: ParsedIntent | null;
}

// Export class directly
export class EmotiveMascot {
    constructor(config?: EmotiveMascotConfig);
    // ... methods
}
```

**Why**: Modern TypeScript prefers direct imports. Better IDE autocomplete:

```typescript
// New way (cleaner)
import type { EmotiveMascotConfig } from '@joshtol/emotive-engine';

// Old way (still works)
import EmotiveEngine from '@joshtol/emotive-engine';
type Config = EmotiveEngine.EmotiveMascotConfig;
```

---

### 3.2 Create Plugin Development Guide

**File**: `docs/PLUGINS.md` (new file)

**Current State**: Example plugins exist in `src/plugins/` but no documentation.

**Task**: Document the plugin system:

````markdown
# Creating Plugins

Extend Emotive Engine with custom emotions, gestures, and particle behaviors.

## Plugin Types

1. **Emotion Plugins** - Add new emotional states
2. **Gesture Plugins** - Add new animations
3. **Particle Plugins** - Add new particle behaviors

## Quick Start: Custom Emotion

```javascript
// my-emotion-plugin.js
export default {
    name: 'determination',
    emoji: '💪',
    description: 'Focused and resolute',

    visual: {
        glowColor: '#ff6b35',
        particleRate: 15,
        particleBehavior: 'pulse',
        breathRate: 0.8,
        breathDepth: 0.6,
    },

    modifiers: {
        speed: 1.2,
        amplitude: 0.9,
        intensity: 1.1,
    },

    typicalGestures: ['nod', 'expand'],
};
```
````

## Registering Plugins

```javascript
import { registerEmotion } from '@joshtol/emotive-engine';
import determinationPlugin from './my-emotion-plugin';

registerEmotion(determinationPlugin);

// Now use it!
mascot.setEmotion('determination');
mascot.feel('determined'); // Also works via feel()
```

[See example plugins →](../src/plugins/)

````

**Why**: Plugin authors are power users. Empower them with clear docs.

---

## Priority 4: Low (Next Quarter)

### 4.1 Generate Searchable API Reference

**Task**: Set up automated API documentation generation.

**Implementation**:
```bash
npm install --save-dev typedoc typedoc-plugin-markdown
````

```json
// typedoc.json
{
    "entryPoints": ["src/index.js", "src/3d/index.js"],
    "out": "docs/api",
    "plugin": ["typedoc-plugin-markdown"],
    "readme": "none"
}
```

```json
// package.json scripts
{
    "docs:api": "typedoc"
}
```

**Why**: Searchable API docs are table stakes for serious libraries.

---

### 4.2 Add Performance Benchmarks

**File**: `benchmarks/` directory (new)

**Task**: Create reproducible performance benchmarks:

```javascript
// benchmarks/particle-performance.bench.js
import { bench, describe } from 'vitest';
import { ParticleSystem } from '../src/core/ParticleSystem.js';

describe('ParticleSystem Performance', () => {
    bench('spawn 100 particles', () => {
        const system = new ParticleSystem({ maxParticles: 100 });
        for (let i = 0; i < 100; i++) {
            system.spawn(Math.random() * 400, Math.random() * 400);
        }
    });

    bench('update 1000 particles', () => {
        const system = new ParticleSystem({ maxParticles: 1000 });
        for (let i = 0; i < 1000; i++) {
            system.spawn(Math.random() * 400, Math.random() * 400);
        }
        system.update(16.67);
    });
});
```

**Why**: Track performance regressions. Show users expected performance.

---

### 4.3 Create Migration Codemods

**Task**: Automate migration from v2 to v3 (if breaking changes exist).

**Tool**: [jscodeshift](https://github.com/facebook/jscodeshift)

```javascript
// codemods/v2-to-v3.js
export default function transformer(file, api) {
    const j = api.jscodeshift;

    return j(file.source)
        .find(j.CallExpression, {
            callee: { property: { name: 'setMood' } }, // old name
        })
        .forEach(path => {
            path.node.callee.property.name = 'setEmotion'; // new name
        })
        .toSource();
}
```

**Why**: Reduces friction for existing users upgrading.

---

## Checklist Summary

### Already Done (Pre-existing)

- [x] CHANGELOG.md
- [x] GitHub issue templates (bug, feature, question)
- [x] PR template
- [x] SECURITY.md
- [x] CODE_OF_CONDUCT.md
- [x] CI/CD workflows

### Completed (This Session)

- [x] Move Quick Start to top of README
- [x] Create CodeSandbox/StackBlitz template link (placeholder added)
- [x] Update SECURITY.md version table (2.x → 3.x)
- [x] Implement "did you mean?" suggestions (`src/utils/suggestions.js`)
- [x] Add documentation links to error messages
      (`src/core/events/ErrorResponse.js`)
- [x] Create PLUGINS.md guide (`docs/PLUGINS.md`)

### Completed (Second Session)

- [x] Refactor TypeScript to support direct exports (`types/index.d.ts`)
- [x] Generate searchable API reference (`typedoc.json`, `tsconfig.docs.json`)
- [x] Add performance benchmarks (`benchmarks/*.bench.js`)
- [x] Create migration codemods (`codemods/v2-to-v3.js`)

---

_Last updated: January 2026_ _Completed tasks verified with 2951 passing tests_
