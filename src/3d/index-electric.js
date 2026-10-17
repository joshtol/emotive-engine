/**
 * @fileoverview Lean 3D build: base 3D engine + ONLY the 'electricity' elemental
 * (instanced material, GLB model config, its gestures). The other seven elements are
 * not imported, so rollup drops their materials, shaders and gestures.
 * Generated from the list in src/3d/elements.js; exported as `./3d-electric`.
 *
 * @module EmotiveEngine3D/electric
 */

export * from './index.js';
export { default } from './index.js';

import './effects/elements/electricity.js';
import '../core/gestures/elemental/electric/register.js';
