# Migration Codemods

Automated code transformations to help migrate between major versions of Emotive
Engine.

## Prerequisites

Install jscodeshift globally or as a dev dependency:

```bash
npm install -g jscodeshift
# or
npm install --save-dev jscodeshift
```

## Available Codemods

### v2-to-v3.js

Migrates code from Emotive Engine v2 to v3. Handles:

1. **Import style change**

    ```javascript
    // Before (v2)
    import EmotiveMascot from '@joshtol/emotive-engine';

    // After (v3)
    import { EmotiveMascot } from '@joshtol/emotive-engine';
    ```

2. **Config property rename**

    ```javascript
    // Before (v2)
    new EmotiveMascot({ emotion: 'joy' });

    // After (v3)
    new EmotiveMascot({ defaultEmotion: 'joy' });
    ```

3. **Event name standardization** | v2 Name | v3 Name | |---------|---------| |
   `emotionChange` | `emotion:change` | | `gestureStart` | `gesture:trigger` | |
   `shapeChange` | `shape:morph` |

## Usage

Run the codemod on your source files:

```bash
# Single file
npx jscodeshift -t codemods/v2-to-v3.js src/app.js

# Directory (recursive)
npx jscodeshift -t codemods/v2-to-v3.js src/

# Dry run (preview changes without writing)
npx jscodeshift -t codemods/v2-to-v3.js --dry src/

# Print transformed output
npx jscodeshift -t codemods/v2-to-v3.js --print src/app.js
```

## After Running

1. Review the changes made by the codemod
2. Run your test suite to verify everything works
3. Check [docs/MIGRATION.md](../docs/MIGRATION.md) for any manual steps

## Writing Custom Codemods

Codemods use [jscodeshift](https://github.com/facebook/jscodeshift), a toolkit
for running codemods over JavaScript/TypeScript code.

See `v2-to-v3.js` as a template for writing your own migrations.
