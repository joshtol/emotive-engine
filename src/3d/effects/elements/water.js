/**
 * @fileoverview Registers the 'water' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-water` entry
 * imports only this one.
 * @module effects/elements/water
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createWaterDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetAnimation as resetWaterAnimation,
    setRelay as setWaterRelay,
    resetRelay as resetWaterRelay,
} from '../../materials/instanced/InstancedWaterMaterial.js';

ElementTypeRegistry.register('water', {
    basePath: 'models/Elements/Water/',
    models: [
        'droplet-small.glb',
        'droplet-large.glb',
        'splash-ring.glb',
        'bubble-cluster.glb',
        'wave-curl.glb',
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
    setRelay: setWaterRelay,
    resetRelay: resetWaterRelay,
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

export { ElementTypeRegistry };
