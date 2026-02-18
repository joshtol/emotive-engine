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

import * as THREE from 'three';
import { ElementTypeRegistry } from './ElementTypeRegistry.js';

import {
    createFireDistortionMaterial,
    createWaterDistortionMaterial,
    createIceDistortionMaterial,
    createVoidDistortionMaterial,
    createLightDistortionMaterial,
} from '../materials/DistortionMaterials.js';

// Smoke/mist particle materials are now imported by AtmosphericPresets.js
// (per-gesture atmospherics replaced global particle configs)

import {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireArcAnimation,
    setInstancedFireGestureGlow,
    setInstancedFireCutout,
    resetCutout as resetFireCutout,
    setGrain as setFireGrain,
    resetGrain as resetFireGrain,
    resetAnimation as resetFireAnimation
} from '../materials/InstancedFireMaterial.js';

import {
    createInstancedWaterMaterial,
    updateInstancedWaterMaterial,
    setInstancedWaterArcAnimation,
    setInstancedWaterGestureGlow,
    setInstancedWaterBloomThreshold,
    setInstancedWaterCutout,
    resetCutout as resetWaterCutout,
    setGrain as setWaterGrain,
    resetGrain as resetWaterGrain,
    resetAnimation as resetWaterAnimation
} from '../materials/InstancedWaterMaterial.js';

import {
    createInstancedIceMaterial,
    updateInstancedIceMaterial,
    setInstancedIceArcAnimation,
    setInstancedIceGestureGlow,
    setInstancedIceBloomThreshold,
    setInstancedIceCutout,
    setInstancedIceWetness,
    resetCutout as resetIceCutout,
    setGrain as setIceGrain,
    resetGrain as resetIceGrain,
    resetWetness as resetIceWetness,
    resetAnimation as resetIceAnimation
} from '../materials/InstancedIceMaterial.js';

import {
    createInstancedElectricMaterial,
    updateInstancedElectricMaterial,
    setInstancedElectricArcAnimation,
    setInstancedElectricGestureGlow,
    setInstancedElectricBloomThreshold,
    setInstancedElectricCutout,
    resetCutout as resetElectricCutout,
    setGrain as setElectricGrain,
    resetGrain as resetElectricGrain,
    resetAnimation as resetElectricAnimation,
    setFlash as setElectricFlash,
    resetFlash as resetElectricFlash
} from '../materials/InstancedElectricMaterial.js';

import {
    createInstancedVoidMaterial,
    updateInstancedVoidMaterial,
    setInstancedVoidArcAnimation,
    setInstancedVoidGestureGlow,
    setInstancedVoidBloomThreshold,
    setInstancedVoidCutout,
    resetCutout as resetVoidCutout,
    setGrain as setVoidGrain,
    resetGrain as resetVoidGrain,
    resetAnimation as resetVoidAnimation
} from '../materials/InstancedVoidMaterial.js';

import {
    createInstancedLightMaterial,
    updateInstancedLightMaterial,
    setInstancedLightArcAnimation,
    setInstancedLightGestureGlow,
    setInstancedLightBloomThreshold,
    setInstancedLightCutout,
    resetCutout as resetLightCutout,
    setGrain as setLightGrain,
    resetGrain as resetLightGrain,
    resetAnimation as resetLightAnimation
} from '../materials/InstancedLightMaterial.js';

import {
    createInstancedEarthMaterial,
    updateInstancedEarthMaterial,
    setInstancedEarthArcAnimation,
    setInstancedEarthGestureGlow,
    setInstancedEarthBloomThreshold,
    setInstancedEarthCutout,
    setInstancedEarthWetness,
    resetCutout as resetEarthCutout,
    setGrain as setEarthGrain,
    resetGrain as resetEarthGrain,
    resetWetness as resetEarthWetness,
    resetAnimation as resetEarthAnimation
} from '../materials/InstancedEarthMaterial.js';

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
    setGrain: setFireGrain,
    resetGrain: resetFireGrain,
    resetShaderAnimation: resetFireAnimation,
    scaleMultiplier: 1.5,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createFireDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.3, 0.3, 0.3), // World-unit padding beyond instance AABB
        },
        billboard: true,
        strength: 0.005,
    },
    // particles: now per-gesture via atmospherics config in gesture animation objects
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
    setGrain: setWaterGrain,
    resetGrain: resetWaterGrain,
    resetShaderAnimation: resetWaterAnimation,
    scaleMultiplier: 1.2,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createWaterDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.3, 0.3, 0.3),
        },
        billboard: true,
        strength: 0.003,
    },
});

ElementTypeRegistry.register('ice', {
    basePath: 'models/Elements/Ice/',
    models: [
        'crystal-small.glb',
        'crystal-medium.glb',
        'crystal-cluster.glb',
        'ice-spike.glb',
        'ice-ring.glb',
        'ice-crown.glb'
    ],
    createMaterial: createInstancedIceMaterial,
    updateMaterial: updateInstancedIceMaterial,
    setShaderAnimation: setInstancedIceArcAnimation,
    setGestureGlow: setInstancedIceGestureGlow,
    setBloomThreshold: setInstancedIceBloomThreshold,
    setCutout: setInstancedIceCutout,
    resetCutout: resetIceCutout,
    setGrain: setIceGrain,
    resetGrain: resetIceGrain,
    setWetness: setInstancedIceWetness,
    resetWetness: resetIceWetness,
    resetShaderAnimation: resetIceAnimation,
    scaleMultiplier: 1.2,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createIceDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.3, 0.5, 0.3),      // More vertical room for mist
            centerOffset: new THREE.Vector3(0, -0.15, 0),    // Shift down — cold air sinks
        },
        billboard: true,
        strength: 0.003,
    },
    // particles: now per-gesture via atmospherics config in gesture animation objects
});

ElementTypeRegistry.register('electricity', {
    basePath: 'models/Elements/Electricity/',
    models: [
        'arc-small.glb',
        'arc-medium.glb',
        'arc-cluster.glb',
        'spark-node.glb',
        'lightning-ring.glb',
        'plasma-ring.glb',
        'arc-ring-small.glb',
        'spark-spike.glb'
    ],
    createMaterial: createInstancedElectricMaterial,
    updateMaterial: updateInstancedElectricMaterial,
    setShaderAnimation: setInstancedElectricArcAnimation,
    setGestureGlow: setInstancedElectricGestureGlow,
    setBloomThreshold: setInstancedElectricBloomThreshold,
    setCutout: setInstancedElectricCutout,
    resetCutout: resetElectricCutout,
    setGrain: setElectricGrain,
    resetGrain: resetElectricGrain,
    setFlash: setElectricFlash,
    resetFlash: resetElectricFlash,
    resetShaderAnimation: resetElectricAnimation,
    scaleMultiplier: 1.3,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createFireDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.3, 0.3, 0.3),
        },
        billboard: true,
        strength: 0.003,
    },
});

ElementTypeRegistry.register('void', {
    basePath: 'models/Elements/Void/',
    models: [
        'void-shard.glb',
        'void-crack.glb',
        'corruption-patch.glb',
        'shadow-tendril.glb',
        'void-ring.glb',
        'void-orb.glb',
        'void-tendril-large.glb',
        'void-wrap.glb',
        'void-disk.glb',
        'void-crown.glb'
    ],
    createMaterial: createInstancedVoidMaterial,
    updateMaterial: updateInstancedVoidMaterial,
    setShaderAnimation: setInstancedVoidArcAnimation,
    setGestureGlow: setInstancedVoidGestureGlow,
    setBloomThreshold: setInstancedVoidBloomThreshold,
    setCutout: setInstancedVoidCutout,
    resetCutout: resetVoidCutout,
    setGrain: setVoidGrain,
    resetGrain: resetVoidGrain,
    resetShaderAnimation: resetVoidAnimation,
    scaleMultiplier: 1.3,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createVoidDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.8, 0.8, 0.8),  // Large — Kerr frame dragging extends far beyond event horizon
        },
        billboard: true,
        strength: 0.028,
    },
});

ElementTypeRegistry.register('light', {
    basePath: 'models/Elements/Light/',
    models: [
        'light-ray.glb',
        'light-orb.glb',
        'sparkle-star.glb',
        'prism-shard.glb',
        'light-ring.glb',
        'sun-ring.glb',
        'light-burst.glb',
        'light-crown.glb'
    ],
    createMaterial: createInstancedLightMaterial,
    updateMaterial: updateInstancedLightMaterial,
    setShaderAnimation: setInstancedLightArcAnimation,
    setGestureGlow: setInstancedLightGestureGlow,
    setBloomThreshold: setInstancedLightBloomThreshold,
    setCutout: setInstancedLightCutout,
    resetCutout: resetLightCutout,
    setGrain: setLightGrain,
    resetGrain: resetLightGrain,
    resetShaderAnimation: resetLightAnimation,
    scaleMultiplier: 1.3,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createLightDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.4, 0.5, 0.4), // More vertical — light rises
        },
        billboard: true,
        strength: 0.004,  // Subtle holy shimmer — between fire (0.005) and water/ice (0.003)
    },
});

ElementTypeRegistry.register('earth', {
    basePath: 'models/Elements/Earth/',
    models: [
        'rock-chunk-small.glb',
        'rock-chunk-medium.glb',
        'rock-cluster.glb',
        'stone-slab.glb',
        'earth-ring.glb',
        'stone-ring.glb',
        'boulder.glb',
        'stone-spike.glb',
        'earth-crown.glb'
    ],
    createMaterial: createInstancedEarthMaterial,
    updateMaterial: updateInstancedEarthMaterial,
    setShaderAnimation: setInstancedEarthArcAnimation,
    setGestureGlow: setInstancedEarthGestureGlow,
    setBloomThreshold: setInstancedEarthBloomThreshold,
    setCutout: setInstancedEarthCutout,
    resetCutout: resetEarthCutout,
    setGrain: setEarthGrain,
    resetGrain: resetEarthGrain,
    setWetness: setInstancedEarthWetness,
    resetWetness: resetEarthWetness,
    resetShaderAnimation: resetEarthAnimation,
    scaleMultiplier: 1.0,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createFireDistortionMaterial,  // Reuse fire distortion (earth has ~0 strength)
        transform: {
            padding: new THREE.Vector3(0.2, 0.2, 0.2),
        },
        billboard: true,
        strength: 0.0,  // Earth is solid — no distortion by default
    },
});

// Export for explicit import (side-effect import also works)
export { ElementTypeRegistry };
