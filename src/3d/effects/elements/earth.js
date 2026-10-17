/**
 * @fileoverview Registers the 'earth' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-earth` entry
 * imports only this one.
 * @module effects/elements/earth
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createFireDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetAnimation as resetEarthAnimation,
    setRelay as setEarthRelay,
    resetRelay as resetEarthRelay,
} from '../../materials/instanced/InstancedEarthMaterial.js';

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
        'earth-crown.glb',
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
    setRelay: setEarthRelay,
    resetRelay: resetEarthRelay,
    scaleMultiplier: 1.0,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createFireDistortionMaterial, // Reuse fire distortion (earth has ~0 strength)
        transform: {
            padding: new THREE.Vector3(0.2, 0.2, 0.2),
        },
        billboard: true,
        strength: 0.0, // Earth is solid — no distortion by default
    },
});

export { ElementTypeRegistry };
