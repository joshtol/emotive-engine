/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE 3D — WITH ELEMENTALS
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Full 3D build including all elemental systems.
 * Re-exports everything from the base 3D module, plus side-effect imports
 * that register 8 element types (instanced materials + GLB models) and
 * 151+ elemental gestures.
 *
 * Entry points:
 *   - src/3d/index.js              → base 3D (no elementals)
 *   - src/3d/index-with-elementals.js → base 3D + elementals (this file)
 *
 * @module EmotiveEngine3D/Elementals
 */

// Re-export everything from the base 3D module
export * from './index.js';
export { default } from './index.js';

// ─── Side-effect imports ────────────────────────────────────────────────────────
// These register elemental content into runtime registries.
// Rollup's moduleSideEffects:false would tree-shake them without explicit import.

// 1. Register all 8 element types with instanced materials + GLB model configs
//    (fire, water, ice, electricity, earth, nature, light, void)
import './effects/ElementRegistrations.js';

// 2. Register all 151+ elemental gestures into the gesture registry
import '../core/gestures/elemental-gestures.js';
