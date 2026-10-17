/**
 * @fileoverview Registers the 'fire' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-fire` entry
 * imports only this one.
 * @module effects/elements/fire
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createFireDistortionMaterial } from '../../materials/DistortionMaterials.js';

import {
    createInstancedFireMaterial,
    updateInstancedFireMaterial,
    setInstancedFireArcAnimation,
    setInstancedFireGestureGlow,
    setInstancedFireCutout,
    resetCutout as resetFireCutout,
    setGrain as setFireGrain,
    resetGrain as resetFireGrain,
    resetAnimation as resetFireAnimation,
    setRelay as setFireRelay,
    resetRelay as resetFireRelay,
} from '../../materials/instanced/InstancedFireMaterial.js';

ElementTypeRegistry.register('fire', {
    basePath: 'models/Elements/Fire/',
    models: [
        'flame-wisp.glb',
        'flame-tongue.glb',
        'ember-cluster.glb',
        'fire-burst.glb',
        'flame-ring.glb',
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
    setRelay: setFireRelay,
    resetRelay: resetFireRelay,
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

export { ElementTypeRegistry };
