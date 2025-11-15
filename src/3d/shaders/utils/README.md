# Universal Blend Modes Utility

## Overview

Universal Photoshop-style blend mode functions for GLSL shaders. Any shader can
import and use these 18 blend modes for complex color grading effects.

## Files

- **`blendModes.glsl`** - Pure GLSL reference implementation (for documentation)
- **`blendModes.js`** - JavaScript module that exports GLSL code as strings
    - Can be injected into any shader via template literals
    - Includes blend mode names for UI dropdowns

## Usage in Shaders

### Example: Simple Blend

```javascript
import { blendModesGLSL } from './utils/blendModes.js';

const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 blendColor;
  uniform float blendMode;

  // Inject universal blend modes
  ${blendModesGLSL}

  void main() {
    vec3 base = vec3(0.5, 0.5, 0.5);
    vec3 blend = vec3(0.8, 0.2, 0.1);
    int mode = int(blendMode + 0.5);

    vec3 result = applyBlendMode(base, blend, mode);
    gl_FragColor = vec4(result, 1.0);
  }
`;
```

### Example: Sequential Blend Layers

```javascript
import { blendModesGLSL, blendLayersGLSL } from './utils/blendModes.js';

const fragmentShader = `
  // Layer uniforms
  uniform float layer1Mode;
  uniform float layer1Strength;
  uniform float layer1Enabled;
  // ... layers 2-4 ...

  // Inject blend mode functions
  ${blendModesGLSL}
  ${blendLayersGLSL}

  void main() {
    vec3 finalColor = calculateBaseColor(); // Your shader logic
    vec3 blendColor = vec3(0.95, 0.45, 0.22); // Blood moon gradient

    // Apply all 4 layers sequentially
    vec3 result = applyBlendLayers(
      finalColor,
      blendColor,
      layer1Mode, layer1Strength, layer1Enabled,
      layer2Mode, layer2Strength, layer2Enabled,
      layer3Mode, layer3Strength, layer3Enabled,
      layer4Mode, layer4Strength, layer4Enabled
    );

    gl_FragColor = vec4(result, 1.0);
  }
`;
```

## Blend Mode Reference

| Index | Name         | Category    | Description                                                 |
| ----- | ------------ | ----------- | ----------------------------------------------------------- |
| 0     | Multiply     | Darkening   | Classic darkening - black stays black, white preserves base |
| 1     | Linear Burn  | Darkening   | Linear darkening with strong contrast                       |
| 2     | Color Burn   | Darkening   | Darkens base by increasing contrast (intense)               |
| 3     | Color Dodge  | Brightening | Brightens base by decreasing contrast (intense)             |
| 4     | Screen       | Brightening | Inverse multiply - brightens overall                        |
| 5     | Overlay      | Contrast    | Multiplies or screens depending on base color               |
| 6     | Add          | Brightening | Pure additive (useful for glow effects)                     |
| 7     | Soft Light   | Contrast    | Gentle diffused light effect                                |
| 8     | Hard Light   | Contrast    | Strong spotlight effect                                     |
| 9     | Vivid Light  | Contrast    | Extreme saturation boost                                    |
| 10    | Linear Light | Contrast    | Linear version of Vivid Light                               |
| 11    | Difference   | Inversion   | Subtracts blend from base (absolute value)                  |
| 12    | Exclusion    | Inversion   | Soft inversion (lower contrast)                             |
| 13    | Darken       | Comparison  | Selects darker of base and blend per channel                |
| 14    | Lighten      | Comparison  | Selects lighter of base and blend per channel               |
| 15    | Subtract     | Darkening   | Subtracts blend from base (deep shadows)                    |
| 16    | Divide       | Brightening | Divides base by blend (ethereal glow)                       |
| 17    | Pin Light    | Contrast    | Combines Darken and Lighten (posterization)                 |

## JavaScript Helper Functions

```javascript
import {
    blendModeNames,
    getBlendModeName,
    getBlendModeIndex,
} from './utils/blendModes.js';

// Get all blend mode names for dropdown UI
console.log(blendModeNames); // ['Multiply', 'Linear Burn', ...]

// Get name by index
const name = getBlendModeName(4); // 'Screen'

// Get index by name
const index = getBlendModeIndex('Multiply'); // 0
```

## Real-World Example

The moon shader with blend layers
([moonWithBlendLayers.js](../shadows/moonWithBlendLayers.js)) demonstrates:

- Injecting blend modes via template literals
- Sequential layer application
- Blood moon color grading with 4 independent layers
- UI-driven blend mode selection

## Architecture

**Universal Tools** (this directory):

- `blendModes.glsl` - Pure GLSL reference
- `blendModes.js` - JavaScript wrapper for injection

**Shader Implementations** (consume these tools):

- `moonWithBlendLayers.js` - Moon shader using blend layers
- Future: Any shader can import and use blend modes

This separation makes blend modes a **universal rendering tool** that any shader
can use, not tied to specific geometries.
