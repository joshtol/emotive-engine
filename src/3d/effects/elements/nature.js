/**
 * @fileoverview Registers the 'nature' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-nature` entry
 * imports only this one.
 * @module effects/elements/nature
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createFireDistortionMaterial } from '../../materials/DistortionMaterials.js';

import {
    createInstancedNatureMaterial,
    updateInstancedNatureMaterial,
    setInstancedNatureArcAnimation,
    setInstancedNatureGestureGlow,
    setInstancedNatureBloomThreshold,
    setInstancedNatureCutout,
    resetCutout as resetNatureCutout,
    setGrain as setNatureGrain,
    resetGrain as resetNatureGrain,
    resetAnimation as resetNatureAnimation,
    setRelay as setNatureRelay,
    resetRelay as resetNatureRelay,
} from '../../materials/instanced/InstancedNatureMaterial.js';

ElementTypeRegistry.register('nature', {
    basePath: 'models/Elements/Nature/',
    models: [
        'vine-ring.glb',
        'nature-crown.glb',
        'vine-cluster.glb',
        's-vine.glb',
        'leaf-bunch.glb',
        'vine-twist.glb',
        'u-vine.glb',
        'thorn-curl.glb',
    ],
    createMaterial: createInstancedNatureMaterial,
    updateMaterial: updateInstancedNatureMaterial,
    setShaderAnimation: setInstancedNatureArcAnimation,
    setGestureGlow: setInstancedNatureGestureGlow,
    setBloomThreshold: setInstancedNatureBloomThreshold,
    setCutout: setInstancedNatureCutout,
    resetCutout: resetNatureCutout,
    setGrain: setNatureGrain,
    resetGrain: resetNatureGrain,
    resetShaderAnimation: resetNatureAnimation,
    setRelay: setNatureRelay,
    resetRelay: resetNatureRelay,
    scaleMultiplier: 1.2,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createFireDistortionMaterial, // Reuse fire distortion (nature has minimal distortion)
        transform: {
            padding: new THREE.Vector3(0.2, 0.3, 0.2),
        },
        billboard: true,
        strength: 0.002, // Very subtle organic shimmer
    },
});

export { ElementTypeRegistry };
