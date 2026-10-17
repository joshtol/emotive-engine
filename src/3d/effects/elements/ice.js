/**
 * @fileoverview Registers the 'ice' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-ice` entry
 * imports only this one.
 * @module effects/elements/ice
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createIceDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetAnimation as resetIceAnimation,
    setRelay as setIceRelay,
    resetRelay as resetIceRelay,
} from '../../materials/instanced/InstancedIceMaterial.js';

ElementTypeRegistry.register('ice', {
    basePath: 'models/Elements/Ice/',
    models: [
        'crystal-small.glb',
        'crystal-medium.glb',
        'crystal-cluster.glb',
        'ice-spike.glb',
        'ice-ring.glb',
        'ice-crown.glb',
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
    setRelay: setIceRelay,
    resetRelay: resetIceRelay,
    scaleMultiplier: 1.2,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createIceDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.3, 0.5, 0.3), // More vertical room for mist
            centerOffset: new THREE.Vector3(0, -0.15, 0), // Shift down — cold air sinks
        },
        billboard: true,
        strength: 0.003,
    },
    // particles: now per-gesture via atmospherics config in gesture animation objects
});

export { ElementTypeRegistry };
