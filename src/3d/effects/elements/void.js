/**
 * @fileoverview Registers the 'void' element type (instanced material + GLB model
 * config) with the ElementTypeRegistry. Side-effect module: importing it registers the
 * element. ElementRegistrations.js imports all eight; the lean `./3d-void` entry
 * imports only this one.
 * @module effects/elements/void
 */

import * as THREE from 'three';
import { ElementTypeRegistry } from '../ElementTypeRegistry.js';
import { createVoidDistortionMaterial } from '../../materials/DistortionMaterials.js';

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
    resetAnimation as resetVoidAnimation,
    setRelay as setVoidRelay,
    resetRelay as resetVoidRelay,
} from '../../materials/instanced/InstancedVoidMaterial.js';

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
        'void-crown.glb',
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
    setRelay: setVoidRelay,
    resetRelay: resetVoidRelay,
    scaleMultiplier: 1.3,
    distortion: {
        geometry: () => new THREE.PlaneGeometry(1.0, 1.0),
        material: createVoidDistortionMaterial,
        transform: {
            padding: new THREE.Vector3(0.8, 0.8, 0.8), // Large — Kerr frame dragging extends far beyond event horizon
        },
        billboard: true,
        strength: 0.028,
    },
});

export { ElementTypeRegistry };
