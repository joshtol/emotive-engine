/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Type Registrations
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Registers all element types with the ElementTypeRegistry
 * @module effects/ElementRegistrations
 *
 * This file is separate from ElementTypeRegistry.js to avoid circular dependency
 * issues with the bundler. Import this file to ensure all element types are registered.
 *
 * IMPORTANT: All imports are grouped at the top to help the bundler with module
 * evaluation order. Do not interleave imports with registration calls.
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// IMPORTS (all imports must be at the top for correct bundler behavior)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { ElementTypeRegistry } from './ElementTypeRegistry.js';

import {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireArcAnimation,
    setInstancedFireGestureGlow,
    setInstancedFireCutout,
    resetCutout as resetFireCutout
} from '../materials/InstancedFireMaterial.js';

import {
    createInstancedWaterMaterial,
    updateInstancedWaterMaterial,
    setInstancedWaterArcAnimation,
    setInstancedWaterGestureGlow,
    setInstancedWaterBloomThreshold,
    setInstancedWaterCutout,
    resetCutout as resetWaterCutout
} from '../materials/InstancedWaterMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELEMENT REGISTRATIONS (after all imports are resolved)
// ═══════════════════════════════════════════════════════════════════════════════════════

ElementTypeRegistry.register('fire', {
    basePath: 'models/Elements/Fire/',
    models: [
        'flame-wisp.glb',
        'flame-tongue.glb',
        'ember-cluster.glb',
        'fire-burst.glb',
        'flame-ring.glb'
    ],
    createMaterial: createInstancedFireMaterial,
    updateMaterial: updateInstancedFireMaterial,
    setShaderAnimation: setInstancedFireArcAnimation,
    setGestureGlow: setInstancedFireGestureGlow,
    setCutout: setInstancedFireCutout,
    resetCutout: resetFireCutout,
    scaleMultiplier: 1.5
});

ElementTypeRegistry.register('water', {
    basePath: 'models/Elements/Water/',
    models: [
        'droplet-small.glb',
        'droplet-large.glb',
        'splash-ring.glb',
        'bubble-cluster.glb',
        'wave-curl.glb'
    ],
    createMaterial: createInstancedWaterMaterial,
    updateMaterial: updateInstancedWaterMaterial,
    setShaderAnimation: setInstancedWaterArcAnimation,
    setGestureGlow: setInstancedWaterGestureGlow,
    setBloomThreshold: setInstancedWaterBloomThreshold,
    setCutout: setInstancedWaterCutout,
    resetCutout: resetWaterCutout,
    scaleMultiplier: 1.2
});

// Export for explicit import (side-effect import also works)
export { ElementTypeRegistry };
