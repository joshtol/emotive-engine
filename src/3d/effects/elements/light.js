/**
 * @fileoverview Registers the 'light' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-light` entry
 * imports only this one.
 * @module effects/elements/light
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createLightDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetAnimation as resetLightAnimation,
    setRelay as setLightRelay,
    resetRelay as resetLightRelay,
} from '../../materials/instanced/InstancedLightMaterial.js';

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
        'light-crown.glb',
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
    setRelay: setLightRelay,
    resetRelay: resetLightRelay,
    scaleMultiplier: 1.3,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createLightDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.4, 0.5, 0.4), // More vertical — light rises
        },
        billboard: true,
        strength: 0.004, // Subtle holy shimmer — between fire (0.005) and water/ice (0.003)
    },
});

export { ElementTypeRegistry };
