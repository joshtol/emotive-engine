/**
 * @fileoverview Registers the 'electricity' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-electric` entry
 * imports only this one.
 * @module effects/elements/electricity
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createFireDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetFlash as resetElectricFlash,
    setRelay as setElectricRelay,
    resetRelay as resetElectricRelay,
} from '../../materials/instanced/InstancedElectricMaterial.js';

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
        'spark-spike.glb',
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
    setRelay: setElectricRelay,
    resetRelay: resetElectricRelay,
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

export { ElementTypeRegistry };
