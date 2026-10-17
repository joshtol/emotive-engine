/**
 * @fileoverview Lean 3D build: base 3D engine + ONLY the electricity elemental
 * (instanced material, GLB model config, 22 electric gestures). The other seven
 * elements (fire, water, ice, earth, nature, light, void) are not imported, so
 * rollup drops their materials, shaders and gestures.
 *
 * Entry points:
 *   - src/3d/index.js                 → base 3D (no elementals)
 *   - src/3d/index-electric.js        → base 3D + electricity only (this file)
 *   - src/3d/index-with-elementals.js → base 3D + all 8 elementals
 *
 * @module EmotiveEngine3D/Electric
 */

export * from './index.js';
export { default } from './index.js';

import './effects/ElementRegistrations-electric.js';
import '../core/gestures/elemental-gestures-electric.js';
