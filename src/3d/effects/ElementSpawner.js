/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Spawner
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spawns 3D elemental geometry (ice crystals, rocks, vines) around mascot
 * @author Emotive Engine Team
 * @module effects/ElementSpawner
 *
 * Uses GLTFLoader to load .glb assets and MeshPhysicalMaterial for realistic rendering.
 * Ice crystals use transmission/refraction for glass-like appearance.
 * Earth rocks use PBR materials for stone appearance.
 * Nature vines use standard materials with leaf textures.
 *
 * ## Surface Spawn Configuration
 *
 * Surface mode supports detailed configuration for aesthetically pleasing placement:
 *
 * | Pattern    | Description                                      | Use Case            |
 * |------------|--------------------------------------------------|---------------------|
 * | crown      | Ring around top of mascot                        | Ice crown, halo     |
 * | shell      | Full surface coverage, evenly distributed        | Encasement, armor   |
 * | scattered  | Random organic distribution                      | Frost patches       |
 * | spikes     | Clustered formations pointing outward            | Crystalline growth  |
 * | ring       | Horizontal ring around mascot center             | Belt, barrier       |
 *
 * Configuration object:
 * ```javascript
 * spawnMode: {
 *   type: 'surface',
 *   pattern: 'shell',       // crown | shell | scattered | spikes | ring
 *   embedDepth: 0.3,        // 0-1, how deep into surface (0=on surface, 1=fully inside)
 *   cameraFacing: 0.5,      // 0=orient to normal, 1=face camera (billboard)
 *   clustering: 0.4,        // 0=evenly spread, 1=tightly clustered
 *   count: 8,               // Override default count
 *   scale: 1.5              // Scale multiplier
 * }
 * ```
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Animation system imports
import { AnimationConfig } from './animation/AnimationConfig.js';
import { AnimationState, AnimationStates } from './animation/AnimationState.js';
import {
    calculateHoldAnimations,
    calculateNonUniformScale,
    calculatePhysicsDrift,
    calculateOpacityLink
} from './animation/HoldAnimations.js';
import { TrailState } from './animation/Trail.js';

// Spawn modes
import { MascotSpatialRef } from './MascotSpatialRef.js';
import { createSpawnMode, isNewSpawnMode } from './spawn-modes/index.js';

// Procedural materials
import {
    createProceduralFireMaterial,
    updateProceduralFireMaterial,
    setProceduralFireIntensity,
    setProceduralFireTemperature
} from '../materials/ProceduralFireMaterial.js';

import {
    createProceduralWaterMaterial,
    updateProceduralWaterMaterial,
    setProceduralWaterIntensity,
    setProceduralWaterTurbulence,
    setProceduralWaterAnimation,
    WATER_ANIMATION_TYPES
} from '../materials/ProceduralWaterMaterial.js';

import {
    createProceduralPoisonMaterial,
    updateProceduralPoisonMaterial,
    setProceduralPoisonIntensity,
    setProceduralPoisonToxicity
} from '../materials/ProceduralPoisonMaterial.js';

import {
    createProceduralSmokeMaterial,
    updateProceduralSmokeMaterial,
    setProceduralSmokeIntensity,
    setProceduralSmokeDensity
} from '../materials/ProceduralSmokeMaterial.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// REUSABLE TEMP OBJECT POOL - Prevents per-frame/per-element allocations
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// These objects are reused across method calls to avoid creating garbage.
// CRITICAL: Never store references to these objects - they get overwritten!
// ═══════════════════════════════════════════════════════════════════════════════════════

const _tempPool = {
    // Vectors for surface sampling and orientation
    vec3_a: new THREE.Vector3(),
    vec3_b: new THREE.Vector3(),
    vec3_c: new THREE.Vector3(),
    vec3_d: new THREE.Vector3(),
    vec3_e: new THREE.Vector3(),
    vec3_f: new THREE.Vector3(),
    vec3_g: new THREE.Vector3(),
    // Quaternions for orientation
    quat_a: new THREE.Quaternion(),
    quat_b: new THREE.Quaternion(),
    // Matrix for basis calculation
    matrix_a: new THREE.Matrix4(),
    // Camera direction (reused across surface samples)
    cameraDir: new THREE.Vector3(),
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEBUG: MEMORY LEAK TRACKING
// ═══════════════════════════════════════════════════════════════════════════════════════
// Imported from separate file to avoid circular dependency with Trail.js
// Usage: ELEMENT_SPAWNER_STATS.report() - show table with leak detection
//        ELEMENT_SPAWNER_STATS.reset() - reset counters
import { elementSpawnerStats as _debugStats, MAX_ACTIVE_MATERIALS, MAX_TOTAL_ELEMENTS } from './ElementSpawnerStats.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHADER MATERIAL DEEP CLONE
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// THREE.ShaderMaterial.clone() does a shallow copy of uniforms - all cloned materials
// share the same uniform VALUE objects. This means updating uTime or uAnimationType
// on one mesh affects ALL meshes using clones of that material.
//
// We need to deep clone uniforms so each mesh has independent animation state.
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Deep clone a shader material's uniforms
 * Creates new objects for each uniform value so cloned materials are independent
 *
 * @param {THREE.ShaderMaterial} material - Material to clone
 * @returns {THREE.ShaderMaterial} Cloned material with independent uniforms
 */
function cloneShaderMaterialDeep(material) {
    _debugStats.materialsCloned++;

    // Warning when approaching material limit (helps debugging)
    const activeCount = _debugStats.activeMaterials;
    if (activeCount > MAX_ACTIVE_MATERIALS * 0.8 && activeCount % 10 === 0) {
        console.warn(`[ElementSpawner] Material count high: ${activeCount}/${MAX_ACTIVE_MATERIALS}`);
    }

    const cloned = material.clone();

    // Deep clone uniforms - create new { value: } objects for each uniform
    if (cloned.uniforms) {
        const newUniforms = {};
        for (const [key, uniform] of Object.entries(cloned.uniforms)) {
            // Clone the uniform object
            const value = uniform.value;
            if (value instanceof THREE.Color) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Vector2) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Vector3) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Vector4) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Matrix3) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Matrix4) {
                newUniforms[key] = { value: value.clone() };
            } else if (value instanceof THREE.Texture) {
                // Textures are shared (don't clone them)
                newUniforms[key] = { value: value };
            } else if (Array.isArray(value)) {
                // Clone arrays
                newUniforms[key] = { value: [...value] };
            } else {
                // Primitive values (number, boolean, etc.)
                newUniforms[key] = { value: value };
            }
        }
        cloned.uniforms = newUniforms;
    }

    return cloned;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO SIZING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Element sizes are defined relative to the mascot's bounding sphere radius (R)
// using Golden Ratio (φ = 1.618) based progressions for aesthetic harmony.
//
// Size Classes (as fractions of mascot radius R):
//
// | Class     | Ratio  | % of R | Use Case                          |
// |-----------|--------|--------|-----------------------------------|
// | tiny      | 1/φ⁴   | ~6.9%  | Particles, debris, frost crystals |
// | small     | 1/φ³   | ~11.1% | Small crystals, pebbles           |
// | medium    | 1/φ²   | ~18.0% | Medium crystals, rocks            |
// | large     | 1/φ    | ~29.2% | Large formations, clusters        |
// | prominent | 1/φ⁰·⁵ | ~38.2% | Focal pieces, crown jewels        |
//
// The φ-based progression ensures visually pleasing size relationships:
// - Adjacent size classes differ by factor of φ (~1.618)
// - Natural, organic-feeling scale hierarchy
// - Fibonacci-like proportions found in nature
//
// ═══════════════════════════════════════════════════════════════════════════════════════

/** Golden Ratio constant */
const PHI = 1.6180339887;

/** Size class definitions as fractions of mascot radius */
const SIZE_CLASSES = {
    tiny:      1 / Math.pow(PHI, 4),    // ~0.069 (6.9% of R)
    small:     1 / Math.pow(PHI, 3),    // ~0.111 (11.1% of R)
    medium:    1 / Math.pow(PHI, 2),    // ~0.180 (18.0% of R)
    large:     1 / PHI,                 // ~0.292 (29.2% of R)
    prominent: 1 / Math.pow(PHI, 0.5)   // ~0.382 (38.2% of R)
};

/**
 * Model size definitions using Golden Ratio size classes
 * Each model maps to a size class with optional variance
 */
const MODEL_SIZES = {
    // Ice models - smaller than earth for delicate crystalline feel
    'crystal-small':   { class: 'tiny',   variance: 0.25 }, // ~0.05R - 0.09R
    'crystal-medium':  { class: 'small',  variance: 0.2 },  // ~0.09R - 0.13R
    'crystal-cluster': { class: 'medium', variance: 0.2 },  // ~0.14R - 0.22R
    'ice-spike':       { class: 'small',  variance: 0.25 }, // ~0.08R - 0.14R

    // Earth models - chunky, substantial feel
    'rock-chunk-small':  { class: 'small',  variance: 0.25 }, // ~0.08R - 0.14R
    'rock-chunk-medium': { class: 'medium', variance: 0.2 },  // ~0.14R - 0.22R
    'rock-cluster':      { class: 'large',  variance: 0.2 },  // ~0.23R - 0.35R
    'stone-slab':        { class: 'medium', variance: 0.25 }, // ~0.14R - 0.23R

    // Nature models - organic, varied sizes
    'vine-tendril':    { class: 'medium', variance: 0.3 },  // Curving vine segment
    'vine-coil':       { class: 'medium', variance: 0.25 }, // Spiral coiled vine
    'thorn-vine':      { class: 'small',  variance: 0.3 },  // Thorny vine piece
    'leaf-single':     { class: 'tiny',   variance: 0.25 }, // Individual leaf
    'leaf-cluster':    { class: 'small',  variance: 0.3 },  // Group of leaves
    'fern-frond':      { class: 'medium', variance: 0.25 }, // Fern shape
    'flower-bud':      { class: 'tiny',   variance: 0.3 },  // Closed bud
    'flower-bloom':    { class: 'small',  variance: 0.25 }, // Open flower
    'petal-scatter':   { class: 'tiny',   variance: 0.3 },  // Loose petals
    'root-tendril':    { class: 'small',  variance: 0.3 },  // Root piece
    'moss-patch':      { class: 'tiny',   variance: 0.25 }, // Moss cluster
    'mushroom-cap':    { class: 'small',  variance: 0.3 },  // Small mushroom

    // Fire models - dynamic, rising flames
    'ember-cluster':   { class: 'tiny',   variance: 0.3 },  // Small ember particles
    'flame-wisp':      { class: 'small',  variance: 0.25 }, // Single wispy flame
    'flame-tongue':    { class: 'medium', variance: 0.25 }, // Larger flame lick
    'fire-burst':      { class: 'large',  variance: 0.2 },  // Explosive flame cluster

    // Electricity models - angular, energetic
    'arc-small':       { class: 'small',  variance: 0.25 }, // Short lightning arc
    'arc-medium':      { class: 'medium', variance: 0.2 },  // Medium arc with branch
    'arc-cluster':     { class: 'large',  variance: 0.2 },  // Branching lightning cluster
    'spark-node':      { class: 'tiny',   variance: 0.3 },  // Small spark discharge

    // Water models - flowing, organic
    'droplet-small':   { class: 'tiny',   variance: 0.25 }, // Small water droplet
    'droplet-large':   { class: 'small',  variance: 0.2 },  // Larger teardrop
    'splash-ring':     { class: 'medium', variance: 0.25 }, // Ripple splash ring
    'bubble-cluster':  { class: 'small',  variance: 0.3 },  // Group of bubbles
    'wave-curl':       { class: 'medium', variance: 0.25 }, // Curling wave shape

    // Void models - dark, corrupting
    'void-crack':      { class: 'small',  variance: 0.3 },  // Reality crack/tear
    'shadow-tendril':  { class: 'medium', variance: 0.25 }, // Dark reaching tendril
    'corruption-patch': { class: 'small', variance: 0.3 },  // Spreading dark patch
    'void-shard':      { class: 'tiny',   variance: 0.25 }, // Fragment of void

    // Light models - radiant, geometric
    'light-ray':       { class: 'medium', variance: 0.25 }, // Beam of light
    'prism-shard':     { class: 'small',  variance: 0.2 },  // Refracting crystal
    'halo-ring':       { class: 'large',  variance: 0.2 },  // Glowing ring
    'sparkle-star':    { class: 'tiny',   variance: 0.3 }   // 4-point star sparkle
};

/**
 * Model orientation definitions for surface spawning
 *
 * Orientation modes:
 * - 'outward': Points away from surface (default) - good for spikes, flowers, mushrooms
 * - 'flat': Lies parallel to surface - good for moss, fallen petals, flat leaves
 * - 'tangent': Trails along surface in random direction - good for vines, roots
 * - 'rising': Biases toward world-up - good for flames, bubbles, rising elements
 * - 'falling': Biases toward world-down - good for droplets, falling elements
 * - 'outward-flat': Faces away from surface but lies flat - good for rifts, portals
 *
 * tiltAngle: Additional tilt from base orientation (radians)
 * - For 'outward': 0 = straight out, positive = tilts away from vertical
 * - For 'flat': 0 = flush, positive = slight lift at one end
 * - For 'tangent': 0 = flush, positive = one end lifts off surface
 * - For 'outward-flat': 0 = perfectly flat, positive = slight angle off surface
 */
const MODEL_ORIENTATIONS = {
    // Ice - crystals point outward, spikes more perpendicular
    'crystal-small':   { mode: 'outward', tiltAngle: 0.15 },  // Small crystals with slight tilt
    'crystal-medium':  { mode: 'outward', tiltAngle: 0.2 },   // Medium crystals, more variety
    'crystal-cluster': { mode: 'outward', tiltAngle: 0.25 },  // Clusters spread outward
    'ice-spike':       { mode: 'outward', tiltAngle: 0.05 },  // Spikes nearly perpendicular for dramatic effect

    // Earth - chunky rocks embedded, tumbled appearance
    'rock-chunk-small':  { mode: 'outward', tiltAngle: 0.35 },  // Small rocks tumble more
    'rock-chunk-medium': { mode: 'outward', tiltAngle: 0.3 },   // Medium rocks, varied angles
    'rock-cluster':      { mode: 'outward', tiltAngle: 0.15 },  // Clusters feel grounded, less tilt
    'stone-slab':        { mode: 'flat',    tiltAngle: 0.1 },   // Slabs lie nearly flush

    // Nature - organic variety
    'vine-tendril':    { mode: 'tangent', tiltAngle: 0.2 },   // Trails along surface
    'vine-coil':       { mode: 'tangent', tiltAngle: 0.15 },  // Coils along surface
    'thorn-vine':      { mode: 'tangent', tiltAngle: 0.25 },  // Trails with thorns up
    'leaf-single':     { mode: 'flat',    tiltAngle: 0.3 },   // Lies flat, slight curl
    'leaf-cluster':    { mode: 'outward', tiltAngle: 0.4 },   // Spreads from attachment
    'fern-frond':      { mode: 'outward', tiltAngle: 0.5 },   // Arcs gracefully outward
    'flower-bud':      { mode: 'outward', tiltAngle: 0.2 },   // Points outward
    'flower-bloom':    { mode: 'outward', tiltAngle: 0.3 },   // Faces outward/camera
    'petal-scatter':   { mode: 'flat',    tiltAngle: 0.1 },   // Fallen petals lie flat
    'root-tendril':    { mode: 'tangent', tiltAngle: -0.1 },  // Digs into surface (negative = into)
    'moss-patch':      { mode: 'flat',    tiltAngle: 0 },     // Completely flush
    'mushroom-cap':    { mode: 'outward', tiltAngle: 0.15 },  // Cap faces outward

    // Fire - special 'rising' mode biases toward world-up
    'ember-cluster':   { mode: 'rising',  tiltAngle: 0.2, riseFactor: 0.6 },   // Embers drift upward
    'flame-wisp':      { mode: 'rising',  tiltAngle: 0.15, riseFactor: 0.8 },  // Strong upward bias
    'flame-tongue':    { mode: 'rising',  tiltAngle: 0.2, riseFactor: 0.75 },  // Flames lick upward
    'fire-burst':      { mode: 'rising',  tiltAngle: 0.25, riseFactor: 0.5 },  // Bursts more radial

    // Electricity - arcs follow surface tangent, sparks radiate
    'arc-small':       { mode: 'tangent', tiltAngle: 0.1 },   // Short arc along surface
    'arc-medium':      { mode: 'tangent', tiltAngle: 0.15 },  // Medium arc crawling
    'arc-cluster':     { mode: 'outward', tiltAngle: 0.3 },   // Cluster radiates outward
    'spark-node':      { mode: 'outward', tiltAngle: 0.4 },   // Sparks burst outward

    // Water - droplets fall, splashes flat, bubbles rise
    'droplet-small':   { mode: 'falling', tiltAngle: 0.1, riseFactor: -0.5 },  // Drops fall down
    'droplet-large':   { mode: 'falling', tiltAngle: 0.15, riseFactor: -0.6 }, // Larger drops fall more
    'splash-ring':     { mode: 'flat',    tiltAngle: 0.05 },  // Ripples lie flat
    'bubble-cluster':  { mode: 'rising',  tiltAngle: 0.1, riseFactor: 0.4 },   // Bubbles rise gently
    'wave-curl':       { mode: 'tangent', tiltAngle: 0.2 },   // Waves follow surface

    // Void - cracks flat, tendrils reach, patches spread
    'void-crack':      { mode: 'outward-flat', tiltAngle: 0 },  // Rifts face away, lie flat
    'shadow-tendril':  { mode: 'outward', tiltAngle: 0.4 },     // Tendrils reach outward
    'corruption-patch': { mode: 'outward-flat', tiltAngle: 0.05 },  // Patches spread flat on surface
    'void-shard':      { mode: 'outward', tiltAngle: 0.35 },    // Shards jut outward

    // Light - rays outward, prisms outward, halos flat, sparkles camera-facing
    'light-ray':       { mode: 'outward', tiltAngle: 0.1 },   // Rays beam outward
    'prism-shard':     { mode: 'outward', tiltAngle: 0.2 },   // Prisms catch light outward
    'halo-ring':       { mode: 'flat',    tiltAngle: 0 },     // Halos lie flat as rings
    'sparkle-star':    { mode: 'outward', tiltAngle: 0.5 }    // Stars face camera (high tilt = more camera facing)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODEL ALIASING - Derived elements reuse base element models with custom shaders
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Derived elements don't need their own 3D models - they reuse existing models from
// base elements and apply custom procedural shaders to achieve distinct visual identity.
//
// | Derived   | Base    | Models Used                    | Shader                    |
// |-----------|---------|--------------------------------|---------------------------|
// | poison    | water   | droplet, splash, ring, etc.   | ProceduralPoisonMaterial  |
// | smoke     | void    | crack, tendril, patch, shard  | ProceduralSmokeMaterial   |
// | steam     | water   | droplet, bubble, etc.         | ProceduralSteamMaterial   |
// | shadow    | void    | tendril, patch, shard         | ProceduralShadowMaterial  |
// | lava      | fire    | flame, ember, burst           | ProceduralLavaMaterial    |
// | blood     | water   | droplet, splash, ring         | ProceduralBloodMaterial   |
//
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Model aliases for derived elements
 * Maps derived element type to base element for model loading
 */
const MODEL_ALIASES = {
    // Active derived elements
    poison: 'water',
    smoke: 'void',
    // Future derived elements
    steam: 'water',
    shadow: 'void',
    lava: 'fire',
    blood: 'water'
};

/**
 * Resolve element type to base element for model loading
 * @param {string} elementType - Element type (may be derived)
 * @returns {string} Base element type for model lookup
 */
function resolveModelElement(elementType) {
    return MODEL_ALIASES[elementType] || elementType;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BLEND MODES - Per-element rendering modes for proper visual effect
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// | Mode     | Elements                          | Effect                             |
// |----------|-----------------------------------|------------------------------------|
// | additive | fire, electric, light, void       | Glowing, energy-based, brightens  |
// | normal   | water, ice, earth, nature, poison | Physical, opaque, realistic blend |
// | normal   | smoke                             | Translucent, depth-sorted          |
//
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Blend mode per element type
 */
const ELEMENT_BLEND_MODES = {
    // Additive: glowing, energy-based elements
    fire: 'additive',
    electricity: 'additive',
    light: 'additive',
    void: 'additive',

    // Normal: physical, opaque elements
    water: 'normal',
    ice: 'normal',
    earth: 'normal',
    nature: 'normal',
    poison: 'normal',
    smoke: 'normal',

    // Future elements
    steam: 'normal',
    shadow: 'additive',
    lava: 'additive',
    blood: 'normal'
};

/**
 * Apply blend mode to material based on element type
 * @param {THREE.Material} material - Material to configure
 * @param {string} elementType - Element type
 */
function applyBlendMode(material, elementType) {
    const mode = ELEMENT_BLEND_MODES[elementType] || 'normal';

    if (mode === 'additive') {
        material.blending = THREE.AdditiveBlending;
        material.depthWrite = false;
    } else {
        material.blending = THREE.NormalBlending;
        material.depthWrite = true;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODEL BEHAVIORS - Animation behaviors per model shape
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Different model shapes require different animations:
// - Rings expand outward and flatten
// - Droplets elongate as they fall
// - Flames stretch upward
// - Crystals grow from base
// - Patches spread along surface
//
// Behaviors include:
// - scaling: non-uniform or pulse-based scaling
// - drift: physics-aware movement (gravity, rising, outward-flat)
// - orientationOverride: override MODEL_ORIENTATIONS for dynamic orientation
// - opacityLink: link opacity to scale or flicker
//
// ═══════════════════════════════════════════════════════════════════════════════════════

const MODEL_BEHAVIORS = {
    // ═══════════════════════════════════════════════════════════════════════════════════
    // WATER MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'splash-ring': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.5 },
                y: { expand: false, rate: 0.3 },
                z: { expand: true, rate: 1.5 }
            },
            easing: 'easeOutQuad'
        },
        drift: { direction: 'outward-flat', speed: 0.03 },
        orientationOverride: 'flat',
        opacityLink: 'inverse-scale'
    },

    'droplet-small': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.8 },
                y: { expand: true, rate: 1.3 },
                z: { expand: false, rate: 0.8 }
            }
        },
        drift: { direction: 'gravity', speed: 0.02, acceleration: 0.01, adherence: 0.3 },
        orientationOverride: 'velocity'
    },

    'droplet-large': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.7 },
                y: { expand: true, rate: 1.4 },
                z: { expand: false, rate: 0.7 }
            }
        },
        drift: { direction: 'gravity', speed: 0.03, acceleration: 0.015, adherence: 0.5 },
        orientationOverride: 'velocity'
    },

    'wave-curl': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.15, frequency: 1.5 },
        drift: { direction: 'tangent', speed: 0.015, noise: 0.2 },
        rotate: { axis: 'tangent', speed: 0.02, oscillate: true, range: Math.PI / 6 },
        orientationOverride: 'tangent'
    },

    'bubble-cluster': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.1, oscillate: true },
                y: { expand: true, rate: 1.2 },
                z: { expand: true, rate: 1.1, oscillate: true }
            },
            wobbleFrequency: 3,
            wobbleAmplitude: 0.1
        },
        drift: { direction: 'rising', speed: 0.025, noise: 0.3, buoyancy: true },
        orientationOverride: 'rising'
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // FIRE MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'ember-cluster': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.2, frequency: 4 },
        drift: { direction: 'rising', speed: 0.02, noise: 0.25, buoyancy: true },
        opacityLink: 'flicker'
    },

    'flame-wisp': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.7 },
                y: { expand: true, rate: 1.6 },
                z: { expand: false, rate: 0.7 }
            }
        },
        drift: { direction: 'rising', speed: 0.03, noise: 0.15, buoyancy: true },
        orientationOverride: 'rising'
    },

    'flame-tongue': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.8, oscillate: true },
                y: { expand: true, rate: 1.4 },
                z: { expand: false, rate: 0.8, oscillate: true }
            },
            wobbleFrequency: 5,
            wobbleAmplitude: 0.15
        },
        drift: { direction: 'rising', speed: 0.025, noise: 0.2 }
    },

    'fire-burst': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.3 },
                y: { expand: true, rate: 1.5 },
                z: { expand: true, rate: 1.3 }
            }
        },
        drift: { direction: 'outward', speed: 0.04, noise: 0.1 },
        opacityLink: 'inverse-scale'
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // ICE MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'crystal-small': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.0 },
                y: { expand: true, rate: 1.4 },
                z: { expand: true, rate: 1.0 }
            },
            easing: 'easeOutQuad'
        },
        drift: null
    },

    'crystal-medium': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.1 },
                y: { expand: true, rate: 1.5 },
                z: { expand: true, rate: 1.1 }
            }
        }
    },

    'crystal-cluster': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.2 },
                y: { expand: true, rate: 1.3 },
                z: { expand: true, rate: 1.2 }
            }
        }
    },

    'ice-spike': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.9 },
                y: { expand: true, rate: 1.8 },
                z: { expand: false, rate: 0.9 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // NATURE MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'vine-tendril': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.0 },
                y: { expand: true, rate: 1.5 },
                z: { expand: true, rate: 1.0 }
            }
        },
        drift: { direction: 'tangent', speed: 0.01, adherence: 0.8 },
        orientationOverride: 'tangent'
    },

    'leaf-single': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.1, frequency: 0.5 },
        drift: { direction: 'gravity', speed: 0.01, acceleration: 0.005, noise: 0.3 },
        rotate: { axis: 'random', speed: 0.02, oscillate: true }
    },

    'fern-frond': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.2 },
                y: { expand: true, rate: 1.4 },
                z: { expand: true, rate: 1.0 }
            }
        },
        drift: { direction: 'outward', speed: 0.008 }
    },

    'flower-bloom': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.3 },
                y: { expand: true, rate: 1.1 },
                z: { expand: true, rate: 1.3 }
            }
        }
    },

    'mushroom-cap': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.2 },
                y: { expand: true, rate: 1.0 },
                z: { expand: true, rate: 1.2 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // ELECTRICITY MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'arc-small': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.2, oscillate: true },
                y: { expand: false, rate: 0.9 },
                z: { expand: true, rate: 1.2, oscillate: true }
            },
            wobbleFrequency: 8,
            wobbleAmplitude: 0.2
        },
        opacityLink: 'flicker'
    },

    'arc-medium': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.4 },
                y: { expand: true, rate: 1.1 },
                z: { expand: true, rate: 1.4 }
            },
            wobbleFrequency: 6,
            wobbleAmplitude: 0.15
        },
        orientationOverride: 'velocity',
        opacityLink: 'flicker'
    },

    'spark-node': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.3, frequency: 10 },
        drift: { direction: 'random', speed: 0.05, noise: 0.5 },
        opacityLink: 'flicker'
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // VOID MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'void-crack': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.4 },
                y: { expand: false, rate: 0.8 },
                z: { expand: true, rate: 1.4 }
            }
        },
        drift: { direction: 'outward-flat', speed: 0.02, adherence: 0.5 },
        orientationOverride: 'flat',
        opacityLink: 'inverse-scale'
    },

    'shadow-tendril': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.8 },
                y: { expand: true, rate: 1.6 },
                z: { expand: false, rate: 0.8 }
            }
        },
        drift: { direction: 'outward', speed: 0.02, noise: 0.15 }
    },

    'corruption-patch': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.3 },
                y: { expand: false, rate: 0.5 },
                z: { expand: true, rate: 1.3 }
            }
        },
        drift: { direction: 'outward-flat', speed: 0.015, adherence: 0.8 },
        orientationOverride: 'flat'
    },

    'void-shard': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.2 },
                y: { expand: true, rate: 1.4 },
                z: { expand: true, rate: 1.2 }
            }
        },
        drift: { direction: 'outward', speed: 0.015, noise: 0.1 }
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // LIGHT MODELS
    // ═══════════════════════════════════════════════════════════════════════════════════

    'light-ray': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: false, rate: 0.7 },
                y: { expand: true, rate: 2.0 },
                z: { expand: false, rate: 0.7 }
            }
        },
        drift: { direction: 'outward', speed: 0.03 },
        opacityLink: 'inverse-scale'
    },

    'prism-shard': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.1, frequency: 2 },
        rotate: { axis: 'y', speed: 0.03 }
    },

    'halo-ring': {
        scaling: {
            mode: 'non-uniform',
            axes: {
                x: { expand: true, rate: 1.4 },
                y: { expand: false, rate: 0.3 },
                z: { expand: true, rate: 1.4 }
            }
        },
        orientationOverride: 'flat',
        opacityLink: 'inverse-scale'
    },

    'sparkle-star': {
        scaling: { mode: 'uniform-pulse', amplitude: 0.25, frequency: 4 },
        opacityLink: 'flicker'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// DERIVED ELEMENT BEHAVIOR MODIFIERS
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Derived elements (poison, smoke) inherit base element behaviors but with modifications.
// These modifiers are applied on top of the base model behavior.
//
// ═══════════════════════════════════════════════════════════════════════════════════════

const DERIVED_BEHAVIOR_MODIFIERS = {
    // Poison (derived from water) - slower, more viscous, sticky
    poison: {
        driftSpeedMultiplier: 0.5,     // Half the speed of water (viscous)
        scalingRateMultiplier: 0.7,    // Slower expansion
        additionalAdherence: 0.3,      // Stickier to surfaces
        opacityLinkOverride: null      // Use base behavior
    },

    // Smoke (derived from void) - rising, billowing, dissipating
    smoke: {
        driftOverride: { direction: 'rising', speed: 0.02, noise: 0.25, buoyancy: true },
        opacityLinkOverride: 'dissipate',
        scalingMode: 'uniform-pulse',  // Billowing effect
        scalingAmplitude: 0.15,
        scalingFrequency: 1.5
    }
};

/**
 * Get behavior config for a model, with derived element modifications
 * @param {string} modelName - Name of the model
 * @param {string} [elementType] - Element type (for derived element modifiers)
 * @returns {Object|null} Model behavior config or null
 */
function getModelBehavior(modelName, elementType = null) {
    const baseBehavior = MODEL_BEHAVIORS[modelName];
    if (!baseBehavior) return null;

    // Check for derived element modifier
    const modifier = elementType ? DERIVED_BEHAVIOR_MODIFIERS[elementType] : null;
    if (!modifier) return baseBehavior;

    // Apply derived element modifications
    return applyDerivedModifier(baseBehavior, modifier);
}

/**
 * Apply derived element modifier to base behavior
 * @param {Object} base - Base model behavior
 * @param {Object} modifier - Derived element modifier
 * @returns {Object} Modified behavior
 */
function applyDerivedModifier(base, modifier) {
    const result = JSON.parse(JSON.stringify(base)); // Deep clone

    // Override drift if specified
    if (modifier.driftOverride) {
        result.drift = { ...modifier.driftOverride };
    } else if (result.drift && modifier.driftSpeedMultiplier) {
        result.drift.speed *= modifier.driftSpeedMultiplier;
    }

    // Add adherence
    if (modifier.additionalAdherence && result.drift) {
        result.drift.adherence = (result.drift.adherence || 0) + modifier.additionalAdherence;
    }

    // Override opacity link
    if (modifier.opacityLinkOverride) {
        result.opacityLink = modifier.opacityLinkOverride;
    }

    // Override scaling mode
    if (modifier.scalingMode) {
        result.scaling = {
            mode: modifier.scalingMode,
            amplitude: modifier.scalingAmplitude || 0.1,
            frequency: modifier.scalingFrequency || 2
        };
    } else if (result.scaling && modifier.scalingRateMultiplier) {
        // Modify existing scaling rates
        if (result.scaling.axes) {
            for (const axis of ['x', 'y', 'z']) {
                if (result.scaling.axes[axis]?.rate) {
                    result.scaling.axes[axis].rate *= modifier.scalingRateMultiplier;
                }
            }
        }
    }

    return result;
}

/**
 * Get orientation config for a model
 * @param {string} modelName - Name of the model
 * @returns {{ mode: string, tiltAngle: number, riseFactor?: number }}
 */
function getModelOrientation(modelName) {
    return MODEL_ORIENTATIONS[modelName] || { mode: 'outward', tiltAngle: 0.2 };
}

/**
 * Get the size for a model as a fraction of mascot radius
 * @param {string} modelName - Name of the model
 * @returns {{ base: number, min: number, max: number }} Size fractions of R
 */
function getModelSizeFraction(modelName) {
    const sizeInfo = MODEL_SIZES[modelName];
    if (!sizeInfo) {
        // Default to small size class
        const base = SIZE_CLASSES.small;
        return { base, min: base * 0.8, max: base * 1.2 };
    }

    const base = SIZE_CLASSES[sizeInfo.class];
    const variance = sizeInfo.variance || 0.2;

    return {
        base,
        min: base * (1 - variance),
        max: base * (1 + variance)
    };
}

/**
 * Create ice crystal material with realistic refraction
 * Uses MeshPhysicalMaterial's transmission for glass-like appearance
 *
 * @param {Object} options
 * @param {number} [options.tint=0x88ccff] - Ice color tint
 * @param {number} [options.roughness=0.05] - Surface roughness (0=mirror, 1=matte)
 * @param {number} [options.transmission=0.95] - Transparency (0=opaque, 1=fully transparent)
 * @param {number} [options.thickness=1.5] - Refraction depth
 * @returns {THREE.MeshPhysicalMaterial}
 */
export function createIceCrystalMaterial(options = {}) {
    const {
        tint = 0x88ddff,
        roughness = 0.15,
        opacity = 0.85
    } = options;

    // Use MeshStandardMaterial with transparency for reliable visibility
    // MeshPhysicalMaterial transmission requires envMap to show refraction
    return new THREE.MeshStandardMaterial({
        color: tint,
        metalness: 0.1,
        roughness,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        // Emissive gives ice a subtle inner glow
        emissive: 0x4488aa,
        emissiveIntensity: 0.15
    });
}

/**
 * Create earth/rock material for stone chunks
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x5a4a3a] - Stone base color
 * @param {number} [options.roughness=0.8] - Surface roughness
 * @returns {THREE.MeshStandardMaterial}
 */
export function createEarthMaterial(options = {}) {
    const {
        baseColor = 0x5a4a3a,
        roughness = 0.8
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.1,
        roughness,
        side: THREE.DoubleSide
    });
}

/**
 * Create nature/plant material for organic elements
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x2d5a1d] - Plant base color (green)
 * @param {number} [options.roughness=0.7] - Surface roughness
 * @returns {THREE.MeshStandardMaterial}
 */
export function createNatureMaterial(options = {}) {
    const {
        baseColor = 0x3a6b2a,  // Forest green
        roughness = 0.75
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.0,
        roughness,
        side: THREE.DoubleSide,
        // Subtle subsurface-like effect
        emissive: 0x1a3510,
        emissiveIntensity: 0.1
    });
}

/**
 * Create fire material with hot, glowing appearance
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0xff6600] - Fire orange color
 * @param {number} [options.emissive=0xff4400] - Hot glow color
 * @param {number} [options.emissiveIntensity=0.8] - Glow strength
 * @returns {THREE.MeshStandardMaterial}
 */
export function createFireMaterial(options = {}) {
    const {
        baseColor = 0xff6600,
        emissive = 0xff4400,
        emissiveIntensity = 0.8
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.0,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        emissive,
        emissiveIntensity
    });
}

/**
 * Create electricity material with bright, crackling appearance
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x44ffff] - Electric cyan color
 * @param {number} [options.emissive=0xaaffff] - Bright glow
 * @param {number} [options.emissiveIntensity=1.2] - Strong glow
 * @returns {THREE.MeshStandardMaterial}
 */
export function createElectricityMaterial(options = {}) {
    const {
        baseColor = 0x44ffff,
        emissive = 0xaaffff,
        emissiveIntensity = 1.2
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        emissive,
        emissiveIntensity
    });
}

/**
 * Create water material with transparent, flowing appearance
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x4488cc] - Water blue color
 * @param {number} [options.opacity=0.7] - Water transparency
 * @returns {THREE.MeshStandardMaterial}
 */
export function createWaterMaterial(options = {}) {
    const {
        baseColor = 0x4488cc,
        opacity = 0.7
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        emissive: 0x224466,
        emissiveIntensity: 0.1
    });
}

/**
 * Create void material with dark, corrupting appearance
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0x220033] - Deep void purple
 * @param {number} [options.emissive=0x440066] - Subtle dark glow
 * @returns {THREE.MeshStandardMaterial}
 */
export function createVoidMaterial(options = {}) {
    const {
        baseColor = 0x220033,
        emissive = 0x440066,
        emissiveIntensity = 0.4
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        emissive,
        emissiveIntensity
    });
}

/**
 * Create light material with radiant, glowing appearance
 *
 * @param {Object} options
 * @param {number} [options.baseColor=0xffffee] - Pure white/gold
 * @param {number} [options.emissive=0xffffff] - Maximum brightness
 * @param {number} [options.emissiveIntensity=1.5] - Very strong glow
 * @returns {THREE.MeshStandardMaterial}
 */
export function createLightMaterial(options = {}) {
    const {
        baseColor = 0xffffee,
        emissive = 0xffffff,
        emissiveIntensity = 1.5
    } = options;

    return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        emissive,
        emissiveIntensity
    });
}

/**
 * ElementSpawner - Manages loading and spawning of 3D elemental geometry
 */
export class ElementSpawner {
    /**
     * @param {Object} options
     * @param {THREE.Scene} options.scene - Three.js scene
     * @param {string} [options.assetBasePath='/assets'] - Base path for assets
     * @param {number} [options.maxElements=20] - Maximum spawned elements per type
     */
    constructor(options = {}) {
        this.scene = options.scene;

        // Store reference for emergency cleanup
        if (typeof window !== 'undefined') {
            window._elementSpawnerInstance = this;
        }
        this.assetBasePath = options.assetBasePath || '/assets';
        this.maxElements = options.maxElements || 20;

        // Loader
        this.gltfLoader = new GLTFLoader();

        // Loaded geometry cache (shared across instances)
        this.geometryCache = new Map();

        // Active spawned elements by type
        this.activeElements = {
            ice: [],
            earth: [],
            nature: [],
            fire: [],
            electricity: [],
            water: [],
            void: [],
            light: [],
            // Derived elements
            poison: [],
            smoke: []
        };

        // Spawn generation counter to detect stale spawns (race condition protection)
        this._spawnGeneration = {
            ice: 0, earth: 0, nature: 0, fire: 0, electricity: 0,
            water: 0, void: 0, light: 0, poison: 0, smoke: 0
        };

        // Spawn-in-progress flags to prevent duplicate concurrent spawns
        this._spawning = {
            ice: false, earth: false, nature: false, fire: false, electricity: false,
            water: false, void: false, light: false, poison: false, smoke: false
        };

        // Global spawn serialization - prevents race condition where multiple element
        // types spawn simultaneously, all passing the material limit check before
        // any materials are actually created
        this._spawnQueue = Promise.resolve();

        // Materials (created once, reused)
        this.iceMaterial = null;
        this.earthMaterial = null;
        this.natureMaterial = null;
        this.fireMaterial = null;
        this.electricityMaterial = null;
        this.waterMaterial = null;
        this.voidMaterial = null;
        this.lightMaterial = null;
        // Derived element materials
        this.poisonMaterial = null;
        this.smokeMaterial = null;

        // Animation state
        this.time = 0;

        // Periodic cleanup state (GPU memory protection)
        this._lastCleanupCheck = 0;
        this._cleanupCheckInterval = 3000; // Check every 3 seconds

        // Spawn configuration per element type
        this.spawnConfig = {
            ice: {
                models: ['crystal-small', 'crystal-medium', 'crystal-cluster', 'ice-spike'],
                count: { min: 5, max: 12 },
                scale: { min: 0.08, max: 0.18 },
                orbitRadius: { min: 0.7, max: 1.2 },
                heightOffset: { min: -0.3, max: 0.5 },
                rotationSpeed: { min: 0.02, max: 0.08 }  // Slow, gentle rotation
            },
            earth: {
                models: ['rock-chunk-small', 'rock-chunk-medium', 'rock-cluster', 'stone-slab'],
                count: { min: 4, max: 10 },
                scale: { min: 0.1, max: 0.2 },
                orbitRadius: { min: 0.6, max: 1.0 },
                heightOffset: { min: -0.4, max: 0.3 },
                rotationSpeed: { min: 0.01, max: 0.04 }  // Very slow, rocks barely rotate
            },
            nature: {
                models: [
                    'vine-tendril', 'vine-coil', 'thorn-vine',
                    'leaf-single', 'leaf-cluster', 'fern-frond',
                    'flower-bud', 'flower-bloom', 'petal-scatter',
                    'root-tendril', 'moss-patch', 'mushroom-cap'
                ],
                count: { min: 4, max: 10 },
                scale: { min: 0.08, max: 0.2 },
                orbitRadius: { min: 0.5, max: 0.9 },
                heightOffset: { min: -0.2, max: 0.6 },
                rotationSpeed: { min: 0.01, max: 0.05 }  // Gentle sway
            },
            fire: {
                models: ['ember-cluster', 'flame-wisp', 'flame-tongue', 'fire-burst'],
                count: { min: 4, max: 10 },
                scale: { min: 0.08, max: 0.18 },
                orbitRadius: { min: 0.5, max: 0.9 },
                heightOffset: { min: -0.1, max: 0.5 },
                rotationSpeed: { min: 0.02, max: 0.06 }  // Flickering motion
            },
            electricity: {
                models: ['arc-small', 'arc-medium', 'arc-cluster', 'spark-node'],
                count: { min: 3, max: 8 },
                scale: { min: 0.06, max: 0.15 },
                orbitRadius: { min: 0.4, max: 0.8 },
                heightOffset: { min: -0.3, max: 0.4 },
                rotationSpeed: { min: 0.05, max: 0.12 }  // Quick, erratic
            },
            water: {
                models: ['droplet-small', 'droplet-large', 'splash-ring', 'bubble-cluster', 'wave-curl'],
                count: { min: 4, max: 10 },
                scale: { min: 0.06, max: 0.14 },
                orbitRadius: { min: 0.5, max: 0.9 },
                heightOffset: { min: -0.3, max: 0.3 },
                rotationSpeed: { min: 0.01, max: 0.04 }  // Flowing, slow
            },
            void: {
                models: ['void-crack', 'shadow-tendril', 'corruption-patch', 'void-shard'],
                count: { min: 3, max: 8 },
                scale: { min: 0.08, max: 0.16 },
                orbitRadius: { min: 0.4, max: 0.7 },
                heightOffset: { min: -0.4, max: 0.2 },
                rotationSpeed: { min: 0.005, max: 0.02 }  // Ominously slow
            },
            light: {
                models: ['light-ray', 'prism-shard', 'halo-ring', 'sparkle-star'],
                count: { min: 4, max: 10 },
                scale: { min: 0.08, max: 0.18 },
                orbitRadius: { min: 0.6, max: 1.1 },
                heightOffset: { min: 0, max: 0.6 },
                rotationSpeed: { min: 0.02, max: 0.06 }  // Gentle radiance
            },

            // ═══════════════════════════════════════════════════════════════
            // DERIVED ELEMENTS - Reuse models from base elements
            // ═══════════════════════════════════════════════════════════════

            // Poison uses water models with viscous, toxic shader
            poison: {
                models: ['droplet-small', 'droplet-large', 'splash-ring', 'bubble-cluster', 'wave-curl'],
                count: { min: 3, max: 8 },
                scale: { min: 0.07, max: 0.15 },
                orbitRadius: { min: 0.4, max: 0.8 },
                heightOffset: { min: -0.4, max: 0.2 },
                rotationSpeed: { min: 0.005, max: 0.02 }  // Viscous, slow movement
            },

            // Smoke uses void models with billowing, rising shader
            smoke: {
                models: ['void-crack', 'shadow-tendril', 'corruption-patch', 'void-shard'],
                count: { min: 4, max: 10 },
                scale: { min: 0.1, max: 0.2 },
                orbitRadius: { min: 0.5, max: 1.0 },
                heightOffset: { min: 0, max: 0.6 },
                rotationSpeed: { min: 0.01, max: 0.03 }  // Billowing, rising
            }
        };

        // Parent container for all elements (attached to core mesh)
        this.container = new THREE.Group();
        this.container.name = 'ElementSpawnerContainer';

        // Reference to core mesh for positioning
        this.coreMesh = null;

        // Camera reference for facing calculations
        this.camera = null;

        // Mascot bounding sphere radius (calculated on initialize)
        // Used for Golden Ratio relative sizing
        this.mascotRadius = 1.0;  // Default fallback

        // Mascot spatial reference for landmark-based positioning
        this.spatialRef = new MascotSpatialRef();

        // Cache of active spawn mode instances
        this.spawnModeCache = new Map();
    }

    /**
     * Initialize spawner with core mesh reference
     * @param {THREE.Mesh} coreMesh - The main mascot mesh
     * @param {THREE.Camera} [camera] - Camera for facing calculations
     */
    initialize(coreMesh, camera = null) {
        this.coreMesh = coreMesh;
        this.camera = camera;

        // Calculate mascot's bounding sphere radius for Golden Ratio sizing
        this._calculateMascotRadius();

        // Initialize mascot spatial reference for landmark positioning
        this.spatialRef.initialize(coreMesh);

        // Add container to scene (not coreMesh) for reliable rendering
        // We'll sync position with coreMesh in update()
        if (this.scene && !this.container.parent) {
            this.scene.add(this.container);
        }

        // Pre-create materials
        this.iceMaterial = createIceCrystalMaterial();
        this.earthMaterial = createEarthMaterial();
        this.natureMaterial = createNatureMaterial();
        this.fireMaterial = createProceduralFireMaterial({ temperature: 0.5 });
        this.electricityMaterial = createElectricityMaterial();
        this.waterMaterial = createProceduralWaterMaterial({ turbulence: 0.5 });
        this.voidMaterial = createVoidMaterial();
        this.lightMaterial = createLightMaterial();

        // Derived element materials (use base element models with custom shaders)
        this.poisonMaterial = createProceduralPoisonMaterial({ toxicity: 0.5 });
        this.smokeMaterial = createProceduralSmokeMaterial({ density: 0.5 });

        // Debug: console.log(`[ElementSpawner] Initialized with mascot radius: ${this.mascotRadius.toFixed(3)}`);
    }

    /**
     * Set intensity for all active animation elements
     * Updates intensity scaling for dynamic effect adjustment
     * @param {number} intensity - Intensity 0-1
     */
    setIntensity(intensity) {
        const clampedIntensity = Math.max(0, Math.min(1, intensity));

        // Update all active elements with animation states
        for (const type of Object.keys(this.activeElements)) {
            for (const mesh of this.activeElements[type]) {
                if (mesh.userData.animationConfig) {
                    mesh.userData.animationConfig.setIntensity(clampedIntensity);
                }
            }
        }
    }

    /**
     * Trigger exit for all animation elements
     * Forces all elements to begin their exit animation
     */
    triggerExit() {
        for (const type of Object.keys(this.activeElements)) {
            for (const mesh of this.activeElements[type]) {
                if (mesh.userData.animationState) {
                    mesh.userData.animationState.triggerExit();
                }
            }
        }
    }

    /**
     * Update beat state for all animation elements
     * Call this when a beat occurs for beat-synced animations
     * @param {number} beatNumber - Current beat number in the gesture
     * @param {number} [bpm=120] - Beats per minute
     */
    setBeat(beatNumber, bpm = 120) {
        for (const type of Object.keys(this.activeElements)) {
            for (const mesh of this.activeElements[type]) {
                if (mesh.userData.animationState) {
                    mesh.userData.animationState.setBeat(beatNumber, bpm);
                }
            }
        }
    }

    /**
     * Calculate mascot's bounding sphere radius for relative sizing
     * @private
     */
    _calculateMascotRadius() {
        if (!this.coreMesh?.geometry) {
            console.warn('[ElementSpawner] No coreMesh geometry, using default radius');
            this.mascotRadius = 1.0;
            return;
        }

        const {geometry} = this.coreMesh;

        // Ensure bounding sphere is computed
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }

        if (geometry.boundingSphere) {
            // Use the geometry's bounding sphere radius
            this.mascotRadius = geometry.boundingSphere.radius;

            // Account for mesh scale if any
            const {scale} = this.coreMesh;
            const avgScale = (scale.x + scale.y + scale.z) / 3;
            this.mascotRadius *= avgScale;
        } else {
            // Fallback: compute from bounding box
            if (!geometry.boundingBox) {
                geometry.computeBoundingBox();
            }

            if (geometry.boundingBox) {
                const size = new THREE.Vector3();
                geometry.boundingBox.getSize(size);
                // Use half the diagonal as approximate radius
                this.mascotRadius = size.length() / 2;
            } else {
                this.mascotRadius = 1.0;
            }
        }

        // Ensure reasonable minimum
        this.mascotRadius = Math.max(0.1, this.mascotRadius);

        // Debug logging disabled for production
        // console.log(`[ElementSpawner] φ-based sizing: mascot radius R = ${this.mascotRadius.toFixed(3)}`);
        // console.log(`[ElementSpawner] Size classes: ...`);
    }

    /**
     * Load a model from disk
     * @param {string} elementType - Element type (may be derived like 'poison' or 'smoke')
     * @param {string} modelName - Model name without extension
     * @returns {Promise<THREE.BufferGeometry>}
     */
    loadModel(elementType, modelName) {
        // Resolve derived elements to their base element for model loading
        // e.g., 'poison' -> 'water', 'smoke' -> 'void'
        const modelElement = resolveModelElement(elementType);

        const cacheKey = `${modelElement}/${modelName}`;

        if (this.geometryCache.has(cacheKey)) {
            return Promise.resolve(this.geometryCache.get(cacheKey));
        }

        const path = `${this.assetBasePath}/models/Elements/${this._capitalize(modelElement)}/${modelName}.glb`;

        return new Promise((resolve, _reject) => {
            this.gltfLoader.load(
                path,
                gltf => {
                    let geometry = null;
                    const toDispose = []; // Track resources to dispose

                    gltf.scene.traverse(child => {
                        if (child.isMesh) {
                            if (child.geometry && !geometry) {
                                geometry = child.geometry.clone();
                            }
                            // Track original geometry and material for disposal
                            if (child.geometry) toDispose.push(child.geometry);
                            if (child.material) {
                                // Material might be an array
                                const materials = Array.isArray(child.material) ? child.material : [child.material];
                                materials.forEach(mat => {
                                    toDispose.push(mat);
                                    // Dispose any textures the material has
                                    if (mat.map) toDispose.push(mat.map);
                                    if (mat.normalMap) toDispose.push(mat.normalMap);
                                    if (mat.roughnessMap) toDispose.push(mat.roughnessMap);
                                    if (mat.metalnessMap) toDispose.push(mat.metalnessMap);
                                    if (mat.aoMap) toDispose.push(mat.aoMap);
                                    if (mat.emissiveMap) toDispose.push(mat.emissiveMap);
                                });
                            }
                        }
                    });

                    // CRITICAL: Dispose original GLTF resources to free GPU memory
                    // We only keep the cloned geometry, everything else is waste
                    for (const resource of toDispose) {
                        resource?.dispose?.();
                    }

                    if (geometry) {
                        // Center and normalize geometry
                        geometry.computeBoundingBox();
                        const center = new THREE.Vector3();
                        geometry.boundingBox.getCenter(center);
                        geometry.translate(-center.x, -center.y, -center.z);

                        // Compute normals if missing
                        if (!geometry.attributes.normal) {
                            geometry.computeVertexNormals();
                        }

                        this.geometryCache.set(cacheKey, geometry);
                        resolve(geometry);
                    } else {
                        console.warn(`[ElementSpawner] No mesh found in ${path}`);
                        resolve(null);
                    }
                },
                undefined,
                error => {
                    console.warn(`[ElementSpawner] Failed to load ${path}:`, error);
                    resolve(null); // Don't reject - allow graceful degradation
                }
            );
        });
    }

    /**
     * Preload all models for an element type
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     */
    async preloadModels(elementType) {
        const config = this.spawnConfig[elementType];
        if (!config?.models?.length) return;

        const promises = config.models.map(modelName =>
            this.loadModel(elementType, modelName)
        );

        await Promise.all(promises);
    }

    /**
     * Sample surface points with pattern-aware distribution
     *
     * @param {THREE.BufferGeometry} geometry - Mascot geometry
     * @param {number} count - Number of points to sample
     * @param {Object} [config] - Surface spawn configuration
     * @param {string} [config.pattern='scattered'] - Distribution pattern
     * @param {number} [config.clustering=0] - Clustering amount (0-1)
     * @param {THREE.Camera} [camera] - Camera for facing calculations
     * @returns {Array<{position: THREE.Vector3, normal: THREE.Vector3, weight: number}>}
     * @private
     */
    _sampleSurfacePoints(geometry, count, config = {}, camera = null) {
        const {
            pattern = 'scattered',
            clustering = 0,
            minDistanceFactor = 0.15  // Minimum distance as fraction of mascot radius
        } = config;

        // Calculate minimum distance between elements
        // Default: 15% of mascot radius, ensuring elements don't overlap
        const minDistance = this.mascotRadius * minDistanceFactor;

        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const vertexCount = positions.count;

        // Build weighted vertex list based on pattern and camera
        // Use temp pool vectors for calculations, only clone when storing in candidates
        const candidates = [];
        const cameraDir = _tempPool.cameraDir;
        if (camera) {
            cameraDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
        } else {
            cameraDir.set(0, 0, 1);
        }

        // Reusable temp vectors for loop - NEVER store references to these
        const tempPos = _tempPool.vec3_a;
        const tempNormal = _tempPool.vec3_b;
        const tempRadial = _tempPool.vec3_c;

        for (let i = 0; i < vertexCount; i++) {
            tempPos.set(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );

            if (normals) {
                tempNormal.set(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                ).normalize();
            } else {
                tempNormal.set(0, 1, 0);
            }

            // Calculate weight based on pattern
            let weight = 1.0;

            switch (pattern) {
            case 'crown':
                // Favor top of mascot (high Y, facing upward)
                weight = Math.max(0, tempPos.y) * 2 + Math.max(0, tempNormal.y) * 0.5;
                break;

            case 'shell':
                // Even distribution, slight camera bias for visibility
                weight = 0.5 + Math.max(0, tempNormal.dot(cameraDir)) * 0.5;
                break;

            case 'scattered':
                // Random with camera visibility weighting
                weight = 0.3 + Math.max(0, tempNormal.dot(cameraDir)) * 0.7;
                break;

            case 'spikes': {
                // Favor outward-facing normals (edges, protrusions)
                tempRadial.copy(tempPos).normalize();
                weight = Math.max(0, tempNormal.dot(tempRadial)) * 1.5;
                break;
            }

            case 'ring': {
                // Horizontal ring around center
                const horizontalness = 1 - Math.abs(tempNormal.y);
                const atCenter = 1 - Math.abs(tempPos.y) * 2;
                weight = horizontalness * 0.5 + Math.max(0, atCenter) * 0.5;
                break;
            }

            default:
                weight = 1.0;
            }

            // Apply camera-facing boost for all patterns
            const cameraDot = tempNormal.dot(cameraDir);
            if (cameraDot > 0) {
                weight *= 1 + cameraDot * 0.3;
            }

            // Only clone when storing - these are the positions/normals we need to keep
            if (weight > 0.01) {
                candidates.push({
                    position: tempPos.clone(),
                    normal: tempNormal.clone(),
                    weight,
                    index: i
                });
            }
        }

        // Sort by weight and use weighted random selection
        candidates.sort((a, b) => b.weight - a.weight);

        const samples = [];
        const usedIndices = new Set();

        // If clustering, pick cluster centers first
        const clusterCenters = [];
        if (clustering > 0 && count > 2) {
            const numClusters = Math.max(1, Math.floor(count * (1 - clustering) * 0.5));
            for (let c = 0; c < numClusters && candidates.length > 0; c++) {
                // Pick from top candidates
                const idx = Math.floor(Math.random() * Math.min(candidates.length, 10));
                clusterCenters.push(candidates[idx].position.clone());
            }
        }

        // Helper to check if a position is far enough from all selected samples
        const isFarEnough = (pos, threshold) => {
            for (const sample of samples) {
                if (pos.distanceTo(sample.position) < threshold) {
                    return false;
                }
            }
            return true;
        };

        // Track attempts to avoid infinite loops
        let consecutiveFailures = 0;
        const maxFailures = 20;
        let currentMinDistance = minDistance;

        for (let i = 0; i < count && candidates.length > 0; i++) {
            let selected = null;
            let attempts = 0;
            const maxAttempts = 30;

            while (!selected && attempts < maxAttempts) {
                attempts++;
                let candidateIdx;

                if (clustering > 0 && clusterCenters.length > 0) {
                    // Find candidates near cluster centers that meet distance requirement
                    const clusterCenter = clusterCenters[i % clusterCenters.length];
                    let bestScore = Infinity;
                    let bestIdx = -1;

                    for (let j = 0; j < Math.min(candidates.length, 50); j++) {
                        if (usedIndices.has(candidates[j].index)) continue;

                        const pos = candidates[j].position;
                        // Check minimum distance from existing samples
                        if (!isFarEnough(pos, currentMinDistance)) continue;

                        const dist = pos.distanceTo(clusterCenter);
                        const score = dist / (candidates[j].weight + 0.1);
                        if (score < bestScore) {
                            bestScore = score;
                            bestIdx = j;
                        }
                    }
                    candidateIdx = bestIdx;
                } else {
                    // Weighted random selection with distance checking
                    const poolSize = Math.min(candidates.length, Math.max(20, candidates.length * 0.4));

                    // Build list of valid candidates (not used, far enough)
                    const validCandidates = [];
                    for (let j = 0; j < poolSize; j++) {
                        if (usedIndices.has(candidates[j].index)) continue;
                        if (!isFarEnough(candidates[j].position, currentMinDistance)) continue;
                        validCandidates.push({ idx: j, weight: candidates[j].weight });
                    }

                    if (validCandidates.length > 0) {
                        // Weighted random from valid candidates
                        const totalWeight = validCandidates.reduce((sum, c) => sum + c.weight, 0);
                        let r = Math.random() * totalWeight;
                        candidateIdx = validCandidates[0].idx;

                        for (const vc of validCandidates) {
                            r -= vc.weight;
                            if (r <= 0) {
                                candidateIdx = vc.idx;
                                break;
                            }
                        }
                    } else {
                        candidateIdx = -1;
                    }
                }

                if (candidateIdx >= 0) {
                    selected = candidates[candidateIdx];
                    usedIndices.add(selected.index);
                    consecutiveFailures = 0;
                } else {
                    // No valid candidate found, reduce distance requirement
                    consecutiveFailures++;
                    if (consecutiveFailures >= maxFailures) {
                        // Significantly relax distance for remaining elements
                        currentMinDistance *= 0.5;
                        consecutiveFailures = 0;
                    }
                }
            }

            if (selected) {
                samples.push({
                    position: selected.position.clone(),
                    normal: selected.normal.clone(),
                    weight: selected.weight
                });
            }
        }

        return samples;
    }

    /**
     * Orient element based on model type and surface normal
     *
     * Supports three orientation modes:
     * - 'outward': Element points away from surface (crystals, flowers, mushrooms)
     * - 'flat': Element lies parallel to surface (moss, fallen petals)
     * - 'tangent': Element trails along surface (vines, roots)
     *
     * @param {THREE.Mesh} mesh - Mesh to orient
     * @param {THREE.Vector3} normal - Surface normal
     * @param {number} cameraFacing - 0=normal aligned, 1=camera facing
     * @param {THREE.Camera} [camera] - Camera for facing
     * @param {string} [modelName] - Model name for orientation lookup
     * @private
     */
    _orientElement(mesh, normal, cameraFacing, camera = null, modelName = null) {
        // Use temp pool to avoid per-call allocations
        const up = _tempPool.vec3_a.set(0, 1, 0);
        const tangent = _tempPool.vec3_b;
        const bitangent = _tempPool.vec3_c;
        const rotatedTangent = _tempPool.vec3_d;
        const baseQuat = _tempPool.quat_a;
        const tiltQuat = _tempPool.quat_b;

        const orientConfig = modelName ? getModelOrientation(modelName) : { mode: 'outward', tiltAngle: 0.2 };

        // Random angle for variety (used by all modes)
        const randomAngle = Math.random() * Math.PI * 2;

        // Calculate a tangent vector perpendicular to the normal
        // This gives us a direction "along" the surface
        if (Math.abs(normal.y) < 0.999) {
            tangent.crossVectors(up, normal).normalize();
        } else {
            // If normal is nearly vertical, use a different reference
            tangent.set(1, 0, 0).cross(normal).normalize();
        }

        // Calculate bitangent (perpendicular to both normal and tangent)
        bitangent.crossVectors(normal, tangent).normalize();

        // Rotate tangent by random angle around normal for variety
        rotatedTangent.copy(tangent)
            .multiplyScalar(Math.cos(randomAngle))
            .addScaledVector(bitangent, Math.sin(randomAngle));

        baseQuat.identity();

        switch (orientConfig.mode) {
        case 'flat':
            // Element lies parallel to surface
            // Up axis becomes the surface normal, forward is along tangent
            {
                const matrix = _tempPool.matrix_a;
                // X = rotated tangent (forward), Y = normal (up), Z = cross product
                const zAxis = _tempPool.vec3_e.crossVectors(rotatedTangent, normal).normalize();
                matrix.makeBasis(rotatedTangent, normal, zAxis);
                baseQuat.setFromRotationMatrix(matrix);

                // Apply tilt - rotate around tangent axis to lift one edge
                if (orientConfig.tiltAngle !== 0) {
                    tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                    baseQuat.premultiply(tiltQuat);
                }
            }
            break;

        case 'tangent':
            // Element trails along surface (vines, roots)
            // Forward axis follows surface, slight lift for natural drape
            {
                // Element's "up" is tilted between normal and tangent
                const tiltAmount = 0.3; // How much the element lifts off surface
                const elementUp = _tempPool.vec3_e.copy(normal)
                    .multiplyScalar(tiltAmount)
                    .addScaledVector(rotatedTangent, 1 - tiltAmount)
                    .normalize();

                baseQuat.setFromUnitVectors(up, elementUp);

                // Apply additional tilt (negative = digs in, positive = lifts)
                if (orientConfig.tiltAngle !== 0) {
                    const tiltAxis = _tempPool.vec3_f.crossVectors(rotatedTangent, normal).normalize();
                    tiltQuat.setFromAxisAngle(tiltAxis, orientConfig.tiltAngle);
                    baseQuat.premultiply(tiltQuat);
                }
            }
            break;

        case 'rising':
        case 'falling': {
            // Fire/bubbles rise toward world-up, water droplets fall toward world-down
            // Blends between surface normal and world direction based on riseFactor
            const riseFactor = orientConfig.riseFactor ?? 0.7;

            // For 'falling', invert the world direction (negative riseFactor in config)
            // riseFactor > 0 = bias toward world-up (fire, bubbles)
            // riseFactor < 0 = bias toward world-down (water droplets)
            const targetDir = _tempPool.vec3_e;
            if (riseFactor >= 0) {
                // Blend from surface normal toward world-up
                targetDir.copy(normal)
                    .multiplyScalar(1 - riseFactor)
                    .add(_tempPool.vec3_f.set(0, riseFactor, 0))
                    .normalize();
            } else {
                // Blend from surface normal toward world-down
                const fallFactor = Math.abs(riseFactor);
                targetDir.copy(normal)
                    .multiplyScalar(1 - fallFactor)
                    .add(_tempPool.vec3_f.set(0, -fallFactor, 0))
                    .normalize();
            }

            baseQuat.setFromUnitVectors(up, targetDir);

            // Apply tilt for variation
            if (orientConfig.tiltAngle !== 0) {
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }

            // Random spin around the target direction
            tiltQuat.setFromAxisAngle(targetDir, randomAngle);
            baseQuat.premultiply(tiltQuat);
            break;
        }

        case 'outward-flat': {
            // Element faces away from surface but lies flat (parallel to surface)
            // Perfect for rifts, portals, spreading cracks - they open up facing outward
            // but spread along the surface plane

            // First: orient so the element's "front" faces along the normal (away from surface)
            // The element's Y-up becomes perpendicular to normal (lies in surface plane)
            const forward = _tempPool.vec3_e.copy(normal);  // Element faces this direction

            // Create a basis where forward = normal, up lies in surface plane
            const matrix = _tempPool.matrix_a;

            // Pick an "up" direction that lies in the surface plane
            // Use the rotated tangent as the element's up (it lies in surface plane)
            const elementUp = _tempPool.vec3_f.copy(rotatedTangent);

            // Right vector completes the basis
            const elementRight = _tempPool.vec3_g.crossVectors(elementUp, forward).normalize();

            // Recalculate up to ensure orthogonality (reuse elementUp since it's consumed)
            const finalUp = _tempPool.vec3_f.crossVectors(forward, elementRight).normalize();

            // Build rotation matrix: X=right, Y=up (in surface plane), Z=forward (away from surface)
            matrix.makeBasis(elementRight, finalUp, forward);
            baseQuat.setFromRotationMatrix(matrix);

            // Apply tilt - slight angle off the surface for depth
            if (orientConfig.tiltAngle !== 0) {
                tiltQuat.setFromAxisAngle(elementRight, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }
            break;
        }

        case 'velocity': {
            // Orient along velocity vector (for falling droplets, moving particles)
            // Requires mesh.userData.velocity to be set
            const velocity = mesh.userData?.velocity;
            if (velocity && (velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z) > 0.0001) {
                const velDir = _tempPool.vec3_e.set(velocity.x, velocity.y, velocity.z).normalize();
                baseQuat.setFromUnitVectors(up, velDir);
            } else {
                // Fall back to 'falling' mode when stationary or no velocity
                const worldDown = _tempPool.vec3_f.set(0, -1, 0);
                const fallFactor = 0.5;
                const targetDir = _tempPool.vec3_e.copy(normal)
                    .multiplyScalar(1 - fallFactor)
                    .addScaledVector(worldDown, fallFactor)
                    .normalize();
                baseQuat.setFromUnitVectors(up, targetDir);
            }

            // Apply tilt for variation
            if (orientConfig.tiltAngle !== 0) {
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }
            break;
        }

        case 'outward':
        default: {
            // Element points away from surface (default behavior)
            baseQuat.setFromUnitVectors(up, normal);

            // Apply tilt - rotate away from straight-out for more natural look
            if (orientConfig.tiltAngle !== 0) {
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }

            // Random spin around normal (reuse tiltQuat since tilt is done)
            tiltQuat.setFromAxisAngle(normal, randomAngle);
            baseQuat.premultiply(tiltQuat);
            break;
        }
        }

        // Apply camera-facing blend if requested
        if (cameraFacing > 0 && camera && orientConfig.mode === 'outward') {
            const cameraPos = _tempPool.cameraDir.copy(camera.position);
            const meshWorldPos = mesh.getWorldPosition(_tempPool.vec3_e);
            const toCamera = cameraPos.sub(meshWorldPos).normalize();

            // Reuse tiltQuat for camera quaternion
            tiltQuat.setFromUnitVectors(up, toCamera);

            // Slerp between base orientation and camera facing
            baseQuat.slerp(tiltQuat, cameraFacing);
        }

        mesh.quaternion.copy(baseQuat);
    }

    /**
     * Spawn elements around the mascot
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {Object} options
     * @param {number} [options.intensity=1.0] - Spawn intensity (affects count)
     * @param {boolean} [options.animated=true] - Enable spawn animation
     * @param {string|Object} [options.mode='orbit'] - Spawn mode string or config object
     * @param {THREE.Camera} [options.camera] - Camera for facing calculations
     * @param {Object} [options.animation] - Animation config for gesture-synced animations
     * @param {Array} [options.elements] - Per-element choreography array
     */
    spawn(elementType, options = {}) {
        // ═══════════════════════════════════════════════════════════════════════════
        // SERIALIZE SPAWNS: Queue spawns to prevent race condition where multiple
        // element types pass material limit check simultaneously before any materials
        // are created. Each spawn waits for previous spawns to complete.
        // ═══════════════════════════════════════════════════════════════════════════
        const spawnPromise = this._spawnQueue.then(() => this._doSpawn(elementType, options));
        this._spawnQueue = spawnPromise.catch(() => {}); // Prevent queue from breaking on errors
        return spawnPromise;
    }

    /**
     * Internal spawn implementation - called by spawn() through serialized queue
     * @private
     */
    async _doSpawn(elementType, options = {}) {
        _debugStats.spawnCalls++;

        // ═══════════════════════════════════════════════════════════════════════════
        // DIAGNOSTIC: Log resource state on every spawn
        // ═══════════════════════════════════════════════════════════════════════════
        const totalElements = Object.values(this.activeElements).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`[ElementSpawner] SPAWN ${elementType}: ` +
            `elements=${totalElements}, ` +
            `materials=${_debugStats.activeMaterials}, ` +
            `meshes=${_debugStats.meshesCreated - _debugStats.meshesDisposed}`);

        // ═══════════════════════════════════════════════════════════════════════════
        // GPU MEMORY PROTECTION: Check limits before spawning
        // ═══════════════════════════════════════════════════════════════════════════
        // If too many materials OR elements are active, force cleanup before proceeding.
        // This prevents GPU memory exhaustion that causes browser compositor failure.
        if (_debugStats.activeMaterials > MAX_ACTIVE_MATERIALS || totalElements > MAX_TOTAL_ELEMENTS) {
            console.warn(`[ElementSpawner] Limit exceeded (materials=${_debugStats.activeMaterials}/${MAX_ACTIVE_MATERIALS}, elements=${totalElements}/${MAX_TOTAL_ELEMENTS}), forcing emergency cleanup`);
            this.despawnAll();
            // Give GPU a frame to process disposal
            await new Promise(resolve => requestAnimationFrame(resolve));
        }

        // Prevent duplicate concurrent spawns of same element type
        if (this._spawning[elementType]) {
            return; // Spawn already in progress
        }
        this._spawning[elementType] = true;

        try {
            // Check for elements array (choreographed sequences)
            if (options.elements && Array.isArray(options.elements)) {
                await this._spawnFromElementsArray(elementType, options);
                return;
            }
            const { intensity = 1.0, animated = true } = options;
        // Use passed camera or fall back to stored camera
        const camera = options.camera || this.camera;
        const { mode = 'orbit' } = options;

        // Extract animation config - can be in options directly OR nested in mode object
        // Core3DManager passes mode: spawnMode which contains animation inside
        const animationConfig = options.animation || (typeof mode === 'object' ? mode.animation : null);

        // Normalize mode to configuration object
        let surfaceConfig = null;
        let modeType = 'orbit';

        if (typeof mode === 'object' && mode !== null) {
            // Full configuration object
            modeType = mode.type || 'surface';
            surfaceConfig = {
                pattern: mode.pattern || 'shell',
                embedDepth: mode.embedDepth ?? 0.2,
                cameraFacing: mode.cameraFacing ?? 0.3,
                clustering: mode.clustering ?? 0,
                countOverride: mode.count || null,
                scaleMultiplier: mode.scale ?? 1.5,
                // Minimum distance between elements as fraction of mascot radius
                // Higher values = more spread out, lower = allows closer placement
                minDistanceFactor: mode.minDistance ?? 0.18,
                // Ephemeral mode for flash-in/fade-out behavior (lightning, sparks)
                // { lifetime: {min, max}, respawn: true, flashIn: 50, fadeOut: 100 }
                ephemeral: mode.ephemeral || null
            };
        } else if (typeof mode === 'string') {
            modeType = mode;
            if (mode === 'surface') {
                // Default surface config
                surfaceConfig = {
                    pattern: 'shell',
                    embedDepth: 0.2,
                    cameraFacing: 0.3,
                    clustering: 0,
                    countOverride: null,
                    scaleMultiplier: 1.5,
                    minDistanceFactor: 0.18
                };
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // Phase 13: Handle new spawn modes (axis-travel, anchor)
        // ═══════════════════════════════════════════════════════════════════════════
        if (isNewSpawnMode(modeType)) {
            await this._spawnWithNewMode(elementType, modeType, mode, options);
            return;
        }

        const config = this.spawnConfig[elementType];

        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

        // Increment spawn generation to invalidate any concurrent spawns (race condition protection)
        const currentGeneration = ++this._spawnGeneration[elementType];

        // Use gesture-specific models list if provided (can be in options or mode), otherwise use default config
        const gestureModels = options.models || (typeof mode === 'object' ? mode.models : null);
        const modelsToUse = gestureModels && gestureModels.length > 0
            ? gestureModels
            : (config.models ?? []);

        // Calculate spawn count based on intensity (or use override)
        const count = surfaceConfig?.countOverride || Math.floor(
            config.count.min + (config.count.max - config.count.min) * intensity
        );

        // Get material for this type
        const material = this._getMaterial(elementType);
        if (!material) {
            console.error(`[ElementSpawner] No material for element type: ${elementType}`);
            return;
        }

        // For surface mode, sample points from mascot geometry with pattern awareness
        let surfacePoints = null;
        if (modeType === 'surface' && this.coreMesh?.geometry) {
            surfacePoints = this._sampleSurfacePoints(
                this.coreMesh.geometry,
                count,
                surfaceConfig,
                camera
            );
        }

        // Validate models array before spawning
        if (!modelsToUse || modelsToUse.length === 0) {
            console.warn(`[ElementSpawner] No models available for element type: ${elementType}`);
            return;
        }

        for (let i = 0; i < count; i++) {
            // Select random model from gesture-specific or default list
            const modelName = modelsToUse[Math.floor(Math.random() * modelsToUse.length)];

            const geometry = await this.loadModel(elementType, modelName);

            // Check if a newer spawn has started (race condition protection)
            if (this._spawnGeneration[elementType] !== currentGeneration) {
                return; // Abort this spawn - a newer one has taken over
            }

            if (!geometry) {
                continue;
            }

            // Create mesh - ALWAYS clone material for each element
            // This ensures safe disposal (disposing one mesh's material doesn't affect others)
            // Use deep clone for shader materials to ensure independent uniforms
            let useMaterial;
            if (material.isShaderMaterial) {
                useMaterial = cloneShaderMaterialDeep(material);
            } else {
                useMaterial = material.clone();
                _debugStats.materialsCloned++;
            }
            const mesh = new THREE.Mesh(geometry, useMaterial);
            _debugStats.meshesCreated++;

            // ═══════════════════════════════════════════════════════════════════════
            // GOLDEN RATIO SIZING: Calculate scale relative to mascot radius
            // ═══════════════════════════════════════════════════════════════════════
            const modelSizeFraction = getModelSizeFraction(modelName);
            const baseScale = modelSizeFraction.min +
                Math.random() * (modelSizeFraction.max - modelSizeFraction.min);

            // Convert fraction of R to actual world units
            const mascotRelativeScale = baseScale * this.mascotRadius;

            // Apply mode-specific multiplier (surface mode elements may be larger/smaller)
            const scaleMultiplier = surfaceConfig?.scaleMultiplier ?? 1.0;
            const scale = mascotRelativeScale * scaleMultiplier;

            // Store spawn mode and config
            mesh.userData.spawnMode = modeType;
            mesh.userData.surfaceConfig = surfaceConfig;
            mesh.userData.elementType = elementType;
            mesh.userData.spawnTime = this.time;

            // Phase 11: Velocity tracking for physics-aware animations
            mesh.userData.modelName = modelName;
            mesh.userData.velocity = { x: 0, y: 0, z: 0 };
            mesh.userData.lastPosition = mesh.position.clone();
            mesh.userData.surfaceNormal = { x: 0, y: 1, z: 0 }; // Default, updated in surface mode

            // Handle ephemeral mode - flash in, hold, fade out, respawn
            if (surfaceConfig?.ephemeral) {
                const eph = surfaceConfig.ephemeral;
                // Clone material so each mesh can have independent opacity/emissive
                // Use deep clone for shader materials to ensure independent uniforms
                // IMPORTANT: Only clone if not already cloned (fire elements clone at mesh creation)
                const alreadyCloned = mesh.material !== material;
                if (!alreadyCloned) {
                    if (material.isShaderMaterial) {
                        mesh.material = cloneShaderMaterialDeep(material);
                    } else {
                        mesh.material = material.clone();
                        _debugStats.materialsCloned++;
                    }
                }
                // Store original material values for interpolation
                mesh.userData.originalOpacity = mesh.material.opacity;
                mesh.userData.originalEmissive = mesh.material.emissiveIntensity;
                // Store config reference for dynamic respawning
                mesh.userData.ephemeralConfig = eph;
                // Store spawn start time for progression calculation
                mesh.userData.spawnStartTime = this.time;
                // Calculate timing (may evolve with progression)
                const timing = this._getEphemeralTiming(eph, 0); // progress=0 at spawn
                // Store ephemeral state
                // initialDelay: wait before ANY elements appear
                // stagger: additional per-element delay (element 0 gets 0, element 1 gets stagger, etc.)
                const initialDelay = eph.initialDelay ?? 0;
                const staggerDelay = i * (eph.stagger ?? 0);
                const totalDelay = initialDelay + staggerDelay;
                mesh.userData.ephemeral = {
                    ...timing,
                    respawn: eph.respawn ?? true,
                    birthTime: this.time,
                    phase: totalDelay > 0 ? 'stagger' : 'flash-in', // Wait for delay if configured
                    staggerOffset: totalDelay
                };
                // Start invisible (will flash in after stagger delay)
                mesh.material.opacity = 0;
                mesh.material.emissiveIntensity = 0;
                // Also hide mesh during stagger phase for guaranteed invisibility
                if (totalDelay > 0) {
                    mesh.visible = false;
                }
            }

            // NEW ANIMATION SYSTEM - gesture-synced animations
            // Takes priority over ephemeral if both are present
            if (animationConfig) {
                // Clone material for independent animation control
                // Use deep clone for shader materials to ensure independent uniforms
                // IMPORTANT: Only clone if not already cloned (fire elements clone at mesh creation)
                const alreadyCloned = mesh.material !== material;
                if (!alreadyCloned) {
                    if (material.isShaderMaterial) {
                        mesh.material = cloneShaderMaterialDeep(material);
                    } else {
                        mesh.material = material.clone();
                        _debugStats.materialsCloned++;
                    }
                }
                mesh.userData.originalOpacity = mesh.material.opacity;
                mesh.userData.originalEmissive = mesh.material.emissiveIntensity;
                mesh.userData.originalScale = scale;

                // Create AnimationConfig and AnimationState for this element
                const gestureDuration = options.gestureDuration ?? 1000;
                const animConfig = new AnimationConfig(animationConfig, gestureDuration);
                const animState = new AnimationState(animConfig, i);
                _debugStats.animationStatesCreated++;

                // Apply rendering settings from config
                this._applyRenderSettings(mesh, animConfig.rendering);

                // Initialize with current time
                animState.initialize(this.time);

                // Store on mesh
                mesh.userData.animationState = animState;
                mesh.userData.animationConfig = animConfig;

                // Fire-specific: Store base flame height for animation
                if (elementType === 'fire' && mesh.material?.uniforms?.uFlameHeight) {
                    mesh.userData.baseFlameHeight = mesh.material.uniforms.uFlameHeight.value;
                }

                // Water-specific: Apply shader animation from modelOverrides
                if (elementType === 'water' && mesh.material?.uniforms?.uAnimationType) {
                    const modelOverrides = options.animation?.modelOverrides;
                    const shaderAnim = modelOverrides?.[modelName]?.shaderAnimation;
                    if (shaderAnim) {
                        setProceduralWaterAnimation(mesh.material, shaderAnim.type, shaderAnim);
                    }
                }

                // Create trail if configured
                if (animConfig.rendering.trail) {
                    const trailState = new TrailState(animConfig.rendering.trail);
                    _debugStats.trailsCreated++;
                    const parent = modeType === 'surface' && this.coreMesh
                        ? this.coreMesh : this.container;
                    trailState.initialize(mesh, parent);
                    mesh.userData.trailState = trailState;
                }

                // Start invisible (animation system controls visibility)
                mesh.material.opacity = 0;
                mesh.material.emissiveIntensity = 0;
                mesh.visible = false;
            }

            if (modeType === 'surface' && surfacePoints && surfacePoints[i]) {
                // SURFACE MODE: Attach to mascot surface with configurable depth and orientation
                const sample = surfacePoints[i];

                // Phase 11: Store surface normal for physics drift
                mesh.userData.surfaceNormal = {
                    x: sample.normal.x,
                    y: sample.normal.y,
                    z: sample.normal.z
                };

                // Calculate embed depth: negative offset moves into the mesh
                const embedDepth = surfaceConfig?.embedDepth ?? 0.2;
                // offset = (1 - embedDepth) * scale * 0.5 - embedDepth * scale * 0.3
                // At embedDepth=0: sits on surface with slight outward offset
                // At embedDepth=1: embedded mostly inside
                const outwardOffset = (1 - embedDepth) * scale * 0.4;
                const inwardOffset = embedDepth * scale * 0.3;
                const netOffset = outwardOffset - inwardOffset;

                const offset = sample.normal.clone().multiplyScalar(netOffset);
                mesh.position.copy(sample.position).add(offset);

                // Hybrid orientation: blend normal-aligned with camera-facing
                // Uses model-specific orientation (flat, tangent, outward)
                const cameraFacing = surfaceConfig?.cameraFacing ?? 0.3;
                this._orientElement(mesh, sample.normal, cameraFacing, camera, modelName);

                // Store surface data for animation
                mesh.userData.surfaceNormal = sample.normal.clone();
                mesh.userData.surfacePosition = sample.position.clone();
                mesh.userData.embedDepth = embedDepth;
                mesh.userData.growthOffset = 0;
                mesh.userData.targetGrowthOffset = netOffset;

            } else {
                // ORBIT MODE (default): Elements orbit around mascot
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                const radius = config.orbitRadius.min +
                    Math.random() * (config.orbitRadius.max - config.orbitRadius.min);
                const height = config.heightOffset.min +
                    Math.random() * (config.heightOffset.max - config.heightOffset.min);

                mesh.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );

                // Random rotation
                mesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                mesh.userData.orbitAngle = angle;
                mesh.userData.orbitRadius = radius;
                mesh.userData.heightOffset = height;
                mesh.userData.rotationSpeed = config.rotationSpeed.min +
                    Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min);
            }

            // Spawn animation - start small and grow
            // Store final scale for pulse animation
            mesh.userData.finalScale = scale;

            if (animated) {
                mesh.userData.targetScale = scale;
                mesh.scale.setScalar(0.01);
            } else {
                mesh.scale.setScalar(scale);
            }

            // ATOMIC: Add to scene and tracking together
            const isSurfaceMode = modeType === 'surface';
            if (!this._registerElement(mesh, elementType, isSurfaceMode)) {
                // Registration failed - dispose resources to prevent leak
                if (mesh.userData.trailState) {
                    mesh.userData.trailState.dispose();
                    _debugStats.trailsDisposed++;
                }
                // Dispose material (geometry is cached/shared, don't dispose)
                if (mesh.material) {
                    mesh.material.dispose();
                    _debugStats.materialsDisposed++;
                }
                continue;
            }
        }

        } catch (error) {
            console.error(`[ElementSpawner] SPAWN ERROR for ${elementType}:`, error);
            console.error('[ElementSpawner] Stack:', error.stack);
        } finally {
            // Always clear spawning flag
            this._spawning[elementType] = false;

            // Log post-spawn state
            const postElements = Object.values(this.activeElements).reduce((sum, arr) => sum + arr.length, 0);
            console.log(`[ElementSpawner] SPAWN DONE ${elementType}: ` +
                `elements=${postElements}, ` +
                `materials=${_debugStats.activeMaterials}, ` +
                `meshes=${_debugStats.meshesCreated - _debugStats.meshesDisposed}`);
        }
    }

    /**
     * Despawn all elements of a type
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {boolean} [animated=true] - Enable despawn animation
     */
    despawn(elementType, animated = true) {
        _debugStats.despawnCalls++;
        const elements = this.activeElements[elementType];
        if (!elements) return;

        for (const mesh of elements) {
            if (animated) {
                mesh.userData.despawning = true;
                mesh.userData.despawnStart = this.time;
            } else {
                // Dispose trail if present
                if (mesh.userData.trailState) {
                    mesh.userData.trailState.dispose();
                    _debugStats.trailsDisposed++;
                }

                // Surface mode elements are attached to coreMesh
                if (mesh.userData.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else {
                    this.container.remove(mesh);
                }

                // Dispose material (geometry is cached and shared, disposed with spawner)
                // NOTE: DO NOT dispose geometry here - it's shared across all elements of this type
                if (mesh.material) {
                    mesh.material.dispose();
                    _debugStats.materialsDisposed++;
                    mesh.material = null;
                }
                mesh.geometry = null; // Clear reference but don't dispose
                _debugStats.meshesDisposed++;

                // Clear userData references to help GC (avoid retaining Vector3/etc clones)
                this._clearMeshUserData(mesh);
            }
        }

        if (!animated) {
            this.activeElements[elementType] = [];
        }
    }

    /**
     * Clear userData references to help GC - prevents memory leaks from cloned vectors
     * @param {THREE.Mesh} mesh - Mesh to clean
     * @private
     */
    _clearMeshUserData(mesh) {
        // Animation state/config
        mesh.userData.animationState = null;
        mesh.userData.animationConfig = null;

        // Original transform clones (Vector3/Euler)
        mesh.userData.originalPosition = null;
        mesh.userData.originalRotation = null;
        mesh.userData.originalScale = null;

        // Spawn mode data
        mesh.userData.anchor = null;
        mesh.userData.velocity = null;

        // Orbit mode data (primitives, but clear for consistency)
        mesh.userData.orbitAngle = undefined;
        mesh.userData.orbitRadius = undefined;
        mesh.userData.heightOffset = undefined;
        mesh.userData.rotationSpeed = undefined;

        // Axis-travel mode data
        mesh.userData.axisTravel = null;

        // Trail state (already disposed separately)
        mesh.userData.trailState = null;

        // Clear remaining spawn mode references
        mesh.userData.spawnMode = null;
        mesh.userData.spawnModeType = null;
        mesh.userData.requiresSpawnModeUpdate = false;
    }

    /**
     * ATOMIC element registration - adds mesh to scene AND tracking in one operation.
     * This prevents orphaned meshes from race conditions.
     * @param {THREE.Mesh} mesh - The mesh to register
     * @param {string} elementType - Element type for tracking
     * @param {boolean} isSurfaceMode - Whether to attach to coreMesh
     * @private
     */
    _registerElement(mesh, elementType, isSurfaceMode = false) {
        // Validate tracking array exists
        if (!this.activeElements[elementType]) {
            console.error(`[ElementSpawner] Invalid element type: ${elementType}`);
            // Dispose material but NOT geometry (geometry is cached/shared)
            mesh.geometry = null; // Clear reference only
            mesh.material?.dispose();
            return false;
        }

        // Mark for tracking
        mesh.userData._isTrackedElement = true;
        mesh.userData._elementType = elementType;

        // ATOMIC: Add to scene and tracking together
        if (isSurfaceMode && this.coreMesh) {
            this.coreMesh.add(mesh);
        } else {
            this.container.add(mesh);
        }
        this.activeElements[elementType].push(mesh);

        return true;
    }

    /**
     * ATOMIC element unregistration - removes mesh from scene AND tracking.
     * @param {THREE.Mesh} mesh - The mesh to unregister
     * @param {string} elementType - Element type for tracking
     * @private
     */
    _unregisterElement(mesh, elementType) {
        // Remove from scene
        if (mesh.userData?.spawnMode === 'surface' && this.coreMesh) {
            this.coreMesh.remove(mesh);
        } else if (this.container) {
            this.container.remove(mesh);
        }

        // Remove from tracking
        const elements = this.activeElements[elementType];
        if (elements) {
            const idx = elements.indexOf(mesh);
            if (idx > -1) elements.splice(idx, 1);
        }

        // Dispose resources
        if (mesh.userData?.trailState) {
            mesh.userData.trailState.dispose();
            _debugStats.trailsDisposed++;
        }
        // NOTE: DO NOT dispose geometry - it's cached and shared
        mesh.geometry = null; // Clear reference only
        if (mesh.material) {
            mesh.material.dispose();
            _debugStats.materialsDisposed++;
            mesh.material = null;
        }
        _debugStats.meshesDisposed++;

        this._clearMeshUserData(mesh);
        mesh.userData._isTrackedElement = false;
    }

    /**
     * Nuclear cleanup - walks the scene graph and removes ANY element/trail meshes
     * that aren't properly tracked. Use when normal cleanup fails.
     * @private
     */
    _nuclearCleanup() {
        const orphanElements = [];
        const orphanTrails = [];

        // Build set of all tracked elements for fast lookup
        const trackedElements = new Set();
        for (const type of Object.keys(this.activeElements)) {
            for (const mesh of this.activeElements[type]) {
                trackedElements.add(mesh);
            }
        }

        // Build set of valid trail meshes (owned by tracked elements)
        const validTrails = new Set();
        for (const mesh of trackedElements) {
            if (mesh.userData?.trailState?.meshes) {
                for (const trailMesh of mesh.userData.trailState.meshes) {
                    validTrails.add(trailMesh);
                }
            }
        }

        const checkChild = (child) => {
            if (!child.isMesh) return;

            // Check for orphaned trail meshes
            if (child.userData?.isTrail) {
                if (!validTrails.has(child)) {
                    orphanTrails.push({ mesh: child, parent: child.parent });
                }
                return;
            }

            // Check for orphaned element meshes
            if (child.userData?.elementType || child.userData?._isTrackedElement) {
                if (!trackedElements.has(child)) {
                    orphanElements.push({ mesh: child, parent: child.parent });
                }
            }
        };

        // Walk container children
        if (this.container) {
            this.container.traverse(checkChild);
        }

        // Walk coreMesh children
        if (this.coreMesh) {
            this.coreMesh.traverse(checkChild);
        }

        // Remove orphan elements
        for (const { mesh, parent } of orphanElements) {
            if (parent) parent.remove(mesh);
            // NOTE: DO NOT dispose geometry - it's cached and shared
            mesh.geometry = null;
            if (mesh.material) {
                mesh.material.dispose();
                mesh.material = null;
            }
        }

        // Remove orphan trails
        for (const { mesh, parent } of orphanTrails) {
            if (parent) parent.remove(mesh);
            // Trail geometry is shared with original, don't dispose
            if (mesh.material) {
                mesh.material.dispose();
                mesh.material = null;
            }
        }

        const total = orphanElements.length + orphanTrails.length;
        if (total > 0) {
            console.warn(`[ElementSpawner] NUCLEAR CLEANUP: Found ${orphanElements.length} orphan elements, ${orphanTrails.length} orphan trails`);
        }

        return total;
    }

    /**
     * Despawn all elements
     */
    despawnAll() {
        for (const type of ['ice', 'earth', 'nature', 'fire', 'electricity', 'water', 'void', 'light', 'poison', 'smoke']) {
            this.despawn(type, false);
        }
        // Clear spawn mode cache to free references
        this.spawnModeCache.clear();

        // Nuclear cleanup: catch any orphaned meshes that escaped normal tracking
        this._nuclearCleanup();
    }

    /**
     * Update animations
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} [gestureProgress=null] - Gesture progress 0-1 for synced animations
     */
    update(deltaTime, gestureProgress = null) {
        this.time += deltaTime;

        // ═══════════════════════════════════════════════════════════════════════════
        // PERIODIC CLEANUP CHECK: Catch orphaned materials
        // ═══════════════════════════════════════════════════════════════════════════
        this._lastCleanupCheck += deltaTime;
        if (this._lastCleanupCheck >= this._cleanupCheckInterval) {
            this._lastCleanupCheck = 0;
            this._periodicCleanupCheck();
        }

        // Sync container position with coreMesh
        if (this.coreMesh) {
            this.container.position.copy(this.coreMesh.position);
        }

        // Update procedural fire material animation
        if (this.fireMaterial?.uniforms) {
            updateProceduralFireMaterial(this.fireMaterial, deltaTime);
        }

        // Update procedural water material animation
        if (this.waterMaterial?.uniforms) {
            updateProceduralWaterMaterial(this.waterMaterial, deltaTime);
        }

        // Update procedural poison material animation
        if (this.poisonMaterial?.uniforms) {
            updateProceduralPoisonMaterial(this.poisonMaterial, deltaTime);
        }

        // Update procedural smoke material animation
        if (this.smokeMaterial?.uniforms) {
            updateProceduralSmokeMaterial(this.smokeMaterial, deltaTime);
        }

        for (const type of ['ice', 'earth', 'nature', 'fire', 'electricity', 'water', 'void', 'light', 'poison', 'smoke']) {
            const elements = this.activeElements[type];
            if (!elements || elements.length === 0) continue;

            const toRemove = [];

            for (const mesh of elements) {
                try {
                // Skip disposed meshes (race condition protection)
                if (!mesh || !mesh.material) {
                    toRemove.push(mesh);
                    continue;
                }

                const isSurfaceMode = mesh.userData.spawnMode === 'surface';

                // NEW ANIMATION SYSTEM - gesture-synced animations
                if (mesh.userData.animationState) {
                    const animState = mesh.userData.animationState;
                    const isFireDebug = false; // Disabled - was causing 188ms frame times

                    // DEBUG: Track state before update
                    const stateBefore = animState.state;
                    const posBefore = isFireDebug ? mesh.position.clone() : null;

                    // Update state machine
                    animState.update(this.time, deltaTime, gestureProgress);

                    // DEBUG: Log state transition
                    if (isFireDebug && stateBefore !== animState.state) {
                        console.log(`[FIRE UPDATE] STATE TRANSITION: ${stateBefore} → ${animState.state}`);
                    }

                    // Check if element is dead and not respawning
                    if (animState.state === AnimationStates.DEAD && !animState.config.lifecycle.respawn) {
                        toRemove.push(mesh);
                        continue;
                    }

                    // Apply animation values to mesh
                    this._applyAnimationToMesh(mesh, animState);

                    // Phase 11: Update velocity tracking (reuse object to avoid per-frame allocation)
                    if (mesh.userData.lastPosition && deltaTime > 0) {
                        const currentPos = mesh.position;
                        const lastPos = mesh.userData.lastPosition;
                        if (!mesh.userData.velocity) {
                            mesh.userData.velocity = { x: 0, y: 0, z: 0 };
                        }
                        mesh.userData.velocity.x = (currentPos.x - lastPos.x) / deltaTime;
                        mesh.userData.velocity.y = (currentPos.y - lastPos.y) / deltaTime;
                        mesh.userData.velocity.z = (currentPos.z - lastPos.z) / deltaTime;
                        mesh.userData.lastPosition.copy(currentPos);
                    }

                    // Phase 13: Update spawn mode (axis-travel, anchor, etc.)
                    if (mesh.userData.requiresSpawnModeUpdate && mesh.userData.spawnModeType) {
                        const modeType = mesh.userData.spawnModeType;
                        let mode = this.spawnModeCache.get(modeType);
                        if (!mode) {
                            mode = createSpawnMode(modeType, this, this.spatialRef);
                            if (mode) this.spawnModeCache.set(modeType, mode);
                        }
                        if (mode) {
                            mode.updateElement(mesh, deltaTime, gestureProgress);
                        }
                    }

                    // Phase 11: Apply model-specific behaviors
                    this._applyModelBehaviors(mesh, animState, deltaTime);

                    // Update procedural shader time for per-mesh animation (fire, water, etc.)
                    // Each mesh has a cloned material, so uTime must be updated per-mesh
                    if (mesh.material?.uniforms?.uTime) {
                        mesh.material.uniforms.uTime.value += deltaTime;
                    }

                    // DEBUG: Check if position changed unexpectedly between state update and animation apply
                    if (isFireDebug && posBefore) {
                        const dx = mesh.position.x - posBefore.x;
                        const dy = mesh.position.y - posBefore.y;
                        const dz = mesh.position.z - posBefore.z;
                        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || Math.abs(dz) > 0.01) {
                            console.log(`[FIRE UPDATE] ⚠️ LARGE POSITION CHANGE: (${dx.toFixed(4)}, ${dy.toFixed(4)}, ${dz.toFixed(4)})`);
                        }
                    }

                    // Update trail if present
                    if (mesh.userData.trailState) {
                        mesh.userData.trailState.update(this.time, animState.opacity);

                        // Clear trail on respawn
                        if (animState.state === AnimationStates.WAITING) {
                            mesh.userData.trailState.clear();
                        }
                    }

                    // Handle respawn position change - ONLY for respawns, not fresh spawns
                    // Fresh spawns (respawnCount === 0) keep their original spawn position
                    if (animState.state === AnimationStates.WAITING && isSurfaceMode && animState.respawnCount > 0) {
                        // Reposition during waiting phase before respawn
                        this._repositionEphemeral(mesh, type);
                    }

                    // Skip legacy animations when using new system
                    continue;
                }

                // Spawn animation
                if (mesh.userData.targetScale) {
                    const elapsed = this.time - mesh.userData.spawnTime;
                    const duration = isSurfaceMode ? 0.8 : 0.5;  // Slower growth for surface mode
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

                    mesh.scale.setScalar(mesh.userData.targetScale * eased);

                    // Surface mode: also animate position outward along normal
                    if (isSurfaceMode && mesh.userData.surfaceNormal && mesh.userData.surfacePosition) {
                        const growthOffset = mesh.userData.targetGrowthOffset * eased;
                        const normal = mesh.userData.surfaceNormal;
                        const basePos = mesh.userData.surfacePosition;
                        mesh.position.copy(basePos).addScaledVector(normal, growthOffset);
                    }

                    if (progress >= 1) {
                        delete mesh.userData.targetScale;
                    }
                }

                // Despawn animation
                if (mesh.userData.despawning) {
                    // Guard against missing despawnStart
                    if (mesh.userData.despawnStart === undefined) {
                        mesh.userData.despawnStart = this.time;
                    }
                    const elapsed = this.time - mesh.userData.despawnStart;
                    const progress = Math.min(Math.max(elapsed / 0.3, 0), 1); // 0.3s despawn duration, clamp to 0-1

                    // Only scale if mesh hasn't been disposed
                    if (mesh.scale) {
                        const currentScale = mesh.scale.x || 0.001;
                        mesh.scale.setScalar(currentScale * (1 - progress * progress));
                    }

                    if (progress >= 1) {
                        toRemove.push(mesh);
                    }
                    continue; // Skip other animations during despawn
                }

                // EPHEMERAL LIFECYCLE: stagger → flash-in → hold → fade-out → waiting → respawn/die
                // This runs for ephemeral elements regardless of surface/orbit mode
                if (mesh.userData.ephemeral) {
                    const eph = mesh.userData.ephemeral;

                    // STAGGER: Wait for initial stagger offset before first flash
                    if (eph.phase === 'stagger') {
                        const staggerAge = (this.time - eph.birthTime) * 1000;
                        if (staggerAge >= eph.staggerOffset) {
                            eph.phase = 'flash-in';
                            eph.birthTime = this.time; // Reset birth time for actual lifecycle
                        }
                        continue;
                    }

                    // WAITING: Pause between respawns (respawnDelay)
                    if (eph.phase === 'waiting') {
                        const waitAge = (this.time - eph.waitStartTime) * 1000;
                        if (waitAge >= eph.respawnDelay) {
                            eph.phase = 'flash-in';
                            eph.birthTime = this.time;
                            // Pick new position when transitioning from waiting
                            if (mesh.userData.spawnMode === 'surface' && this.coreMesh?.geometry) {
                                this._repositionEphemeral(mesh, type);
                            }
                        }
                        continue;
                    }

                    const ageMs = (this.time - eph.birthTime) * 1000; // Convert seconds to ms

                    if (eph.phase === 'flash-in') {
                        // Flash in: rapidly increase opacity/emissive
                        const progress = Math.min(ageMs / eph.flashIn, 1);
                        const eased = progress * progress; // ease-in for sudden appearance
                        mesh.material.opacity = eased * mesh.userData.originalOpacity;
                        mesh.material.emissiveIntensity = eased * mesh.userData.originalEmissive * 1.5; // Extra bright on flash
                        if (progress >= 1) {
                            eph.phase = 'hold';
                            mesh.material.emissiveIntensity = mesh.userData.originalEmissive;
                        }
                    } else if (eph.phase === 'hold') {
                        // Hold: maintain visibility, slight flicker for electricity
                        const holdEnd = eph.lifetime - eph.fadeOut;
                        // Add slight random flicker during hold
                        const flicker = 0.9 + Math.random() * 0.2;
                        mesh.material.emissiveIntensity = mesh.userData.originalEmissive * flicker;
                        if (ageMs >= holdEnd) {
                            eph.phase = 'fade-out';
                            eph.fadeStartTime = this.time;
                        }
                    } else if (eph.phase === 'fade-out') {
                        // Fade out: rapidly decrease opacity/emissive
                        const fadeAge = (this.time - eph.fadeStartTime) * 1000;
                        const progress = Math.min(fadeAge / eph.fadeOut, 1);
                        const eased = 1 - (1 - progress) * (1 - progress); // ease-out for quick fade
                        mesh.material.opacity = (1 - eased) * mesh.userData.originalOpacity;
                        mesh.material.emissiveIntensity = (1 - eased) * mesh.userData.originalEmissive;
                        if (progress >= 1) {
                            eph.phase = 'dead';
                        }
                    } else if (eph.phase === 'dead') {
                        if (eph.respawn) {
                            // Respawn at new random position on surface
                            this._respawnEphemeral(mesh, type);
                        } else {
                            toRemove.push(mesh);
                            continue;
                        }
                    }
                    continue; // Ephemeral elements don't need other animations
                }

                // SURFACE MODE: Static after spawn - no animation
                // Elements attached to surface should feel solid and grounded
                if (isSurfaceMode) {
                    continue;  // Skip all animations for surface mode
                }

                // ORBIT MODE: Gentle orbital drift - extremely slow, meditative orbiting
                if (mesh.userData.orbitAngle !== undefined) {
                    mesh.userData.orbitAngle += deltaTime * 0.003;  // Very slow orbit (~35 minutes per revolution)
                    const radius = mesh.userData.orbitRadius;
                    const height = mesh.userData.heightOffset;

                    // Subtle bobbing - very slow and gentle
                    const bob = Math.sin(this.time * 0.15 + mesh.userData.orbitAngle) * 0.008;

                    mesh.position.set(
                        Math.cos(mesh.userData.orbitAngle) * radius,
                        height + bob,
                        Math.sin(mesh.userData.orbitAngle) * radius
                    );
                }

                // Very slow rotation - barely perceptible (orbit mode only)
                if (mesh.userData.rotationSpeed) {
                    mesh.rotation.y += deltaTime * mesh.userData.rotationSpeed * 0.1;
                    mesh.rotation.x += deltaTime * mesh.userData.rotationSpeed * 0.03;
                }
                } catch (meshError) {
                    // If any mesh processing fails, mark for removal to prevent further errors
                    console.warn(`[ElementSpawner] Error updating mesh, marking for removal:`, meshError);
                    toRemove.push(mesh);
                }
            }

            // Remove despawned elements
            for (const mesh of toRemove) {
                // Skip null meshes (already removed)
                if (!mesh) {
                    continue;
                }

                // Surface mode elements are attached to coreMesh, not container
                if (mesh.userData?.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else if (this.container) {
                    this.container.remove(mesh);
                }

                // Clear geometry reference (don't dispose - it's cached and shared)
                mesh.geometry = null;

                // Dispose cloned material (critical for memory - each element has its own clone)
                if (mesh.material) {
                    mesh.material.dispose();
                    _debugStats.materialsDisposed++;
                    mesh.material = null;
                }
                _debugStats.meshesDisposed++;

                // Dispose trail state if present
                if (mesh.userData?.trailState) {
                    mesh.userData.trailState.dispose();
                    _debugStats.trailsDisposed++;
                }

                // Clear userData references to help GC (avoid retaining Vector3/etc clones)
                if (mesh.userData) {
                    this._clearMeshUserData(mesh);
                }

                const idx = elements.indexOf(mesh);
                if (idx > -1) elements.splice(idx, 1);
            }
        }
    }

    /**
     * Check if elements are currently spawned
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @returns {boolean}
     */
    hasElements(elementType) {
        // Return true if spawn is in progress OR if elements already exist
        // This prevents Core3DManager from triggering duplicate spawns
        return this._spawning[elementType] || this.activeElements[elementType]?.length > 0;
    }

    /**
     * Get material for element type
     * @private
     */
    _getMaterial(elementType) {
        switch (elementType) {
        case 'ice':
            return this.iceMaterial;
        case 'earth':
            return this.earthMaterial;
        case 'nature':
            return this.natureMaterial;
        case 'fire':
            return this.fireMaterial;
        case 'electricity':
            return this.electricityMaterial;
        case 'water':
            return this.waterMaterial;
        case 'void':
            return this.voidMaterial;
        case 'light':
            return this.lightMaterial;
        // Derived elements
        case 'poison':
            return this.poisonMaterial;
        case 'smoke':
            return this.smokeMaterial;
        default:
            return new THREE.MeshStandardMaterial({ color: 0x888888 });
        }
    }

    /**
     * Get ephemeral timing values, optionally modified by progression
     * @param {Object} config - Ephemeral config from spawnMode
     * @param {number} progress - Gesture progress 0-1 (for evolution)
     * @returns {Object} Timing values: lifetime, flashIn, fadeOut, respawnDelay
     * @private
     */
    _getEphemeralTiming(config, progress = 0) {
        // Base timing values
        let lifetimeMin = config.lifetime?.min ?? 150;
        let lifetimeMax = config.lifetime?.max ?? 400;
        let flashIn = config.flashIn ?? 50;
        let fadeOut = config.fadeOut ?? 100;
        let respawnDelayMin = config.respawnDelay?.min ?? 0;
        let respawnDelayMax = config.respawnDelay?.max ?? 0;

        // Apply progression if configured
        // progression: { lifetime: [startMin, startMax, endMin, endMax], ... }
        if (config.progression && progress > 0) {
            const p = config.progression;

            if (p.lifetime) {
                // Interpolate between start and end ranges
                lifetimeMin = p.lifetime[0] + (p.lifetime[2] - p.lifetime[0]) * progress;
                lifetimeMax = p.lifetime[1] + (p.lifetime[3] - p.lifetime[1]) * progress;
            }
            if (p.flashIn) {
                flashIn = p.flashIn[0] + (p.flashIn[1] - p.flashIn[0]) * progress;
            }
            if (p.fadeOut) {
                fadeOut = p.fadeOut[0] + (p.fadeOut[1] - p.fadeOut[0]) * progress;
            }
            if (p.respawnDelay) {
                respawnDelayMin = p.respawnDelay[0] + (p.respawnDelay[2] - p.respawnDelay[0]) * progress;
                respawnDelayMax = p.respawnDelay[1] + (p.respawnDelay[3] - p.respawnDelay[1]) * progress;
            }
        }

        // Calculate random values within ranges
        const lifetime = lifetimeMin + Math.random() * (lifetimeMax - lifetimeMin);
        const respawnDelay = respawnDelayMin + Math.random() * (respawnDelayMax - respawnDelayMin);

        return { lifetime, flashIn, fadeOut, respawnDelay };
    }

    /**
     * Respawn an ephemeral element at a new position
     * @param {THREE.Mesh} mesh - The mesh to respawn
     * @param {string} elementType - Element type for config lookup
     * @private
     */
    _respawnEphemeral(mesh, elementType) {
        const eph = mesh.userData.ephemeral;
        const ephConfig = mesh.userData.ephemeralConfig;
        const {surfaceConfig} = mesh.userData;

        // Calculate progression (0-1) based on time since initial spawn
        let progress = 0;
        if (ephConfig?.progression?.duration && mesh.userData.spawnStartTime) {
            const elapsed = (this.time - mesh.userData.spawnStartTime) * 1000; // to ms
            progress = Math.min(1, elapsed / ephConfig.progression.duration);
        }

        // Get timing with progression applied
        const timing = this._getEphemeralTiming(ephConfig, progress);
        eph.lifetime = timing.lifetime;
        eph.flashIn = timing.flashIn;
        eph.fadeOut = timing.fadeOut;
        eph.respawnDelay = timing.respawnDelay;

        // If respawnDelay > 0, go to 'waiting' phase first
        if (timing.respawnDelay > 0) {
            eph.phase = 'waiting';
            eph.waitStartTime = this.time;
        } else {
            eph.phase = 'flash-in';
            eph.birthTime = this.time;
        }
        delete eph.fadeStartTime;

        // Reset material to invisible
        mesh.material.opacity = 0;
        mesh.material.emissiveIntensity = 0;

        // Pick new position on surface (if we have surface data)
        if (mesh.userData.spawnMode === 'surface' && this.coreMesh?.geometry) {
            // Sample a single new point
            const newPoints = this._sampleSurfacePoints(
                this.coreMesh.geometry,
                1,
                surfaceConfig,
                this.camera
            );

            if (newPoints.length > 0) {
                const sample = newPoints[0];
                const embedDepth = surfaceConfig?.embedDepth ?? 0.2;
                const scale = mesh.userData.finalScale || mesh.scale.x;
                const outwardOffset = (1 - embedDepth) * scale * 0.4;
                const inwardOffset = embedDepth * scale * 0.3;
                const netOffset = outwardOffset - inwardOffset;

                const offset = sample.normal.clone().multiplyScalar(netOffset);
                mesh.position.copy(sample.position).add(offset);

                // Update stored surface data
                mesh.userData.surfaceNormal = sample.normal.clone();
                mesh.userData.surfacePosition = sample.position.clone();
                mesh.userData.targetGrowthOffset = netOffset;

                // Re-orient to new normal
                const cameraFacing = surfaceConfig?.cameraFacing ?? 0.3;
                const models = this.spawnConfig[elementType]?.models;
                const modelName = models?.length > 0
                    ? models[Math.floor(Math.random() * models.length)]
                    : null;
                this._orientElement(mesh, sample.normal, cameraFacing, this.camera, modelName);
            }
        }
    }

    /**
     * Spawn elements using new spawn mode system (axis-travel, anchor)
     * Phase 13: Axis Choreography System
     *
     * @param {string} elementType - Element type for material/model lookup
     * @param {string} modeType - Spawn mode type ('axis-travel', 'anchor')
     * @param {Object} modeConfig - Full mode configuration object
     * @param {Object} options - Spawn options
     * @private
     */
    async _spawnWithNewMode(elementType, modeType, modeConfig, options) {
        const { intensity = 1.0, animated = true, gestureDuration = 1000 } = options;
        const camera = options.camera || this.camera;

        const config = this.spawnConfig[elementType];
        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

        // Increment spawn generation to invalidate any concurrent spawns (race condition protection)
        const currentGeneration = ++this._spawnGeneration[elementType];

        // Get or create spawn mode instance
        let spawnMode = this.spawnModeCache.get(modeType);
        if (!spawnMode) {
            spawnMode = createSpawnMode(modeType, this, this.spatialRef);
            if (spawnMode) this.spawnModeCache.set(modeType, spawnMode);
        }

        if (!spawnMode) {
            console.warn(`[ElementSpawner] Could not create spawn mode: ${modeType}`);
            return;
        }

        // Parse the mode configuration
        const parsedConfig = spawnMode.parseConfig(modeConfig);

        // Use gesture-specific models list if provided
        const modelsToUse = modeConfig.models && modeConfig.models.length > 0
            ? modeConfig.models
            : (config.models ?? []);

        // Validate models array before spawning
        if (!modelsToUse || modelsToUse.length === 0) {
            console.warn(`[ElementSpawner] No models available for element type: ${elementType}`);
            return;
        }

        // Get material for this type
        const material = this._getMaterial(elementType);
        if (!material) {
            console.error(`[ElementSpawner] No material for element type: ${elementType}`);
            return;
        }

        // Expand formation if present (creates multiple elements with offsets)
        const formationElements = spawnMode.expandFormation
            ? spawnMode.expandFormation(parsedConfig)
            : [{ index: 0, positionOffset: 0, rotationOffset: 0, progressOffset: 0 }];

        // Determine count - from formation or config
        const count = parsedConfig.formation?.count || modeConfig.count || 1;

        for (let i = 0; i < count; i++) {
            const formationData = formationElements[i] || formationElements[0];

            // Select model
            const modelName = modelsToUse[Math.floor(Math.random() * modelsToUse.length)];
            const geometry = await this.loadModel(elementType, modelName);

            // Check if a newer spawn has started (race condition protection)
            if (this._spawnGeneration[elementType] !== currentGeneration) {
                return; // Abort this spawn - a newer one has taken over
            }

            if (!geometry) continue;

            // Clone material for independent shader state
            const useMaterial = cloneShaderMaterialDeep(material);
            const mesh = new THREE.Mesh(geometry, useMaterial);
            _debugStats.meshesCreated++;

            // Calculate scale using Golden Ratio system
            const modelSizeFraction = getModelSizeFraction(modelName);
            const baseScale = modelSizeFraction.min +
                Math.random() * (modelSizeFraction.max - modelSizeFraction.min);
            const mascotRelativeScale = baseScale * this.mascotRadius;
            const scaleMultiplier = parsedConfig.scale ?? modeConfig.scale ?? 1.0;
            const finalScale = mascotRelativeScale * scaleMultiplier;

            mesh.scale.setScalar(finalScale);
            mesh.userData.finalScale = finalScale;
            mesh.userData.modelName = modelName;
            mesh.userData.elementType = elementType;
            mesh.userData.spawnTime = this.time;
            mesh.userData.spawnMode = modeType;

            // Position element using spawn mode
            spawnMode.positionElement(mesh, parsedConfig, i, formationData);

            // Apply orientation for anchor mode
            if (modeType === 'anchor' && modeConfig.anchor?.orientation === 'flat') {
                mesh.rotation.x = -Math.PI / 2;
            }

            // Set up animation config if animation options provided
            const animConfig = modeConfig.animation || options.animation;
            if (animConfig) {
                const animationConfig = new AnimationConfig({
                    gestureDuration: gestureDuration / 1000,
                    ...animConfig,
                    index: i,
                    totalCount: count
                });

                const animState = new AnimationState(animationConfig);
                _debugStats.animationStatesCreated++;
                mesh.userData.animationState = animState;
                mesh.userData.animationConfig = animationConfig;

                // Apply model overrides for shader animation
                const modelOverrides = animConfig.modelOverrides?.[modelName];
                if (modelOverrides?.shaderAnimation && useMaterial.uniforms) {
                    const sa = modelOverrides.shaderAnimation;
                    if (sa.type !== undefined && useMaterial.uniforms.uAnimationType) {
                        useMaterial.uniforms.uAnimationType.value = sa.type;
                    }
                    if (sa.arcWidth !== undefined && useMaterial.uniforms.uArcWidth) {
                        useMaterial.uniforms.uArcWidth.value = sa.arcWidth;
                    }
                    if (sa.arcSpeed !== undefined && useMaterial.uniforms.uArcSpeed) {
                        useMaterial.uniforms.uArcSpeed.value = sa.arcSpeed;
                    }
                    if (sa.arcCount !== undefined && useMaterial.uniforms.uArcCount) {
                        useMaterial.uniforms.uArcCount.value = sa.arcCount;
                    }
                }
            }

            // Store original position for animation offsets
            mesh.userData.originalPosition = mesh.position.clone();
            mesh.userData.originalRotation = mesh.rotation.clone();
            mesh.userData.originalScale = mesh.scale.clone();

            // ATOMIC: Add to scene and tracking together
            if (!this._registerElement(mesh, elementType, false)) {
                // Registration failed - dispose material (geometry is cached/shared)
                if (mesh.material) {
                    mesh.material.dispose();
                    _debugStats.materialsDisposed++;
                }
                continue;
            }
        }

        // console.log(`[ElementSpawner] Spawned ${count} ${elementType} elements with ${modeType} mode`);
    }

    /**
     * Spawn elements from a choreographed elements array
     * Each element in the array can specify its own model, timing, and animation
     *
     * @param {string} elementType - Element type for material/model lookup
     * @param {Object} options - Spawn options with elements array
     * @private
     */
    async _spawnFromElementsArray(elementType, options) {
        const { elements, animation: globalAnimation = {}, gestureDuration = 1000 } = options;
        const camera = options.camera || this.camera;
        const material = this._getMaterial(elementType);
        const config = this.spawnConfig[elementType];

        if (!material) {
            console.error(`[ElementSpawner] No material for element type: ${elementType}`);
            return;
        }

        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

        // Increment spawn generation to invalidate any concurrent spawns (race condition protection)
        const currentGeneration = ++this._spawnGeneration[elementType];

        // Track global element index for stagger calculations
        let globalIndex = 0;

        // Process each element definition in the array
        for (const elemDef of elements) {
            const {
                model: modelName = null,
                count = 1,
                position = null,
                spawnMode = null,
                // Per-element animation overrides
                appearAt,
                disappearAt,
                stagger: elemStagger,
                enter,
                exit,
                pulse,
                flicker,
                drift,
                rotate,
                emissive,
                respawn,
                scale: scaleConfig,
                color,
                opacity
            } = elemDef;

            // Determine which model(s) to use
            const modelsToUse = modelName
                ? [modelName]
                : (elemDef.models || config.models || []);

            // Skip if no models available
            if (modelsToUse.length === 0) {
                console.warn(`[ElementSpawner] No models available for element type: ${elementType}`);
                continue;
            }

            // Build per-element animation config by merging global + element overrides
            const elemAnimation = {
                ...globalAnimation,
                ...(appearAt !== undefined && { appearAt }),
                ...(disappearAt !== undefined && { disappearAt }),
                ...(elemStagger !== undefined && { stagger: elemStagger }),
                ...(enter && { enter: { ...globalAnimation.enter, ...enter } }),
                ...(exit && { exit: { ...globalAnimation.exit, ...exit } }),
                ...(pulse && { pulse: { ...globalAnimation.pulse, ...pulse } }),
                ...(flicker && { flicker: { ...globalAnimation.flicker, ...flicker } }),
                ...(drift && { drift: { ...globalAnimation.drift, ...drift } }),
                ...(rotate && { rotate: { ...globalAnimation.rotate, ...rotate } }),
                ...(emissive && { emissive: { ...globalAnimation.emissive, ...emissive } }),
                ...(respawn !== undefined && { respawn }),
                ...(scaleConfig && { scale: { ...globalAnimation.scale, ...scaleConfig } }),
                ...(color && { color: { ...globalAnimation.color, ...color } }),
                ...(opacity && { opacity: { ...globalAnimation.opacity, ...opacity } })
            };

            // Get surface points if using spawnMode
            let surfacePoints = null;
            if (spawnMode?.type === 'surface' && this.coreMesh?.geometry) {
                const surfaceConfig = {
                    pattern: spawnMode.pattern || 'scattered',
                    embedDepth: spawnMode.embedDepth ?? 0.2,
                    cameraFacing: spawnMode.cameraFacing ?? 0.3,
                    clustering: spawnMode.clustering ?? 0,
                    minDistanceFactor: spawnMode.minDistance ?? 0.15
                };
                surfacePoints = this._sampleSurfacePoints(
                    this.coreMesh.geometry,
                    count,
                    surfaceConfig,
                    camera
                );
            }

            // Spawn the specified count of this element
            for (let i = 0; i < count; i++) {
                // Select model (cycle through if multiple)
                const selectedModel = modelsToUse[i % modelsToUse.length];
                const geometry = await this.loadModel(elementType, selectedModel);

                // Check if a newer spawn has started (race condition protection)
                if (this._spawnGeneration[elementType] !== currentGeneration) {
                    return; // Abort this spawn - a newer one has taken over
                }

                if (!geometry) continue;

                // Create mesh - use deep clone for shader materials
                let clonedMaterial;
                if (material.isShaderMaterial) {
                    clonedMaterial = cloneShaderMaterialDeep(material); // Increments inside
                } else {
                    clonedMaterial = material.clone();
                    _debugStats.materialsCloned++;
                }
                const mesh = new THREE.Mesh(geometry, clonedMaterial);
                _debugStats.meshesCreated++;

                // Calculate scale
                const modelSizeFraction = getModelSizeFraction(selectedModel);
                const baseScale = modelSizeFraction.min +
                    Math.random() * (modelSizeFraction.max - modelSizeFraction.min);
                const mascotRelativeScale = baseScale * this.mascotRadius;
                const scaleMultiplier = spawnMode?.scale ?? 1.0;
                const scale = mascotRelativeScale * scaleMultiplier;

                // Store metadata
                mesh.userData.elementType = elementType;
                mesh.userData.spawnTime = this.time;
                mesh.userData.spawnMode = spawnMode?.type || (position ? 'point' : 'orbit');
                mesh.userData.originalOpacity = mesh.material.opacity;
                mesh.userData.originalEmissive = mesh.material.emissiveIntensity;
                mesh.userData.originalScale = scale;
                mesh.userData.finalScale = scale;

                // Position the element
                if (position) {
                    // Explicit position
                    mesh.position.set(position.x || 0, position.y || 0, position.z || 0);
                    mesh.rotation.set(
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    );
                } else if (surfacePoints && surfacePoints[i]) {
                    // Surface spawn
                    const sample = surfacePoints[i];
                    const embedDepth = spawnMode?.embedDepth ?? 0.2;
                    const outwardOffset = (1 - embedDepth) * scale * 0.4;
                    const inwardOffset = embedDepth * scale * 0.3;
                    const netOffset = outwardOffset - inwardOffset;

                    const offset = sample.normal.clone().multiplyScalar(netOffset);
                    mesh.position.copy(sample.position).add(offset);

                    mesh.userData.surfaceNormal = sample.normal.clone();
                    mesh.userData.surfacePosition = sample.position.clone();
                    mesh.userData.surfaceConfig = spawnMode;

                    const cameraFacing = spawnMode?.cameraFacing ?? 0.3;
                    this._orientElement(mesh, sample.normal, cameraFacing, camera, selectedModel);
                } else {
                    // Default orbit positioning
                    const angle = (globalIndex / 8) * Math.PI * 2 + Math.random() * 0.5;
                    const radius = 0.6 + Math.random() * 0.4;
                    const height = -0.2 + Math.random() * 0.6;

                    mesh.position.set(
                        Math.cos(angle) * radius,
                        height,
                        Math.sin(angle) * radius
                    );
                    mesh.rotation.set(
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    );
                }

                // Create animation state with merged config
                const animConfig = new AnimationConfig(elemAnimation, gestureDuration);
                const animState = new AnimationState(animConfig, globalIndex);
                _debugStats.animationStatesCreated++;
                animState.initialize(this.time);

                // Apply rendering settings from config
                this._applyRenderSettings(mesh, animConfig.rendering);

                // Create trail if configured
                if (animConfig.rendering.trail) {
                    const trailState = new TrailState(animConfig.rendering.trail);
                    _debugStats.trailsCreated++;
                    const parent = spawnMode?.type === 'surface' && this.coreMesh
                        ? this.coreMesh : this.container;
                    trailState.initialize(mesh, parent);
                    mesh.userData.trailState = trailState;
                }

                mesh.userData.animationState = animState;
                mesh.userData.animationConfig = animConfig;

                // Start invisible
                mesh.material.opacity = 0;
                mesh.material.emissiveIntensity = 0;
                mesh.visible = false;
                mesh.scale.setScalar(scale);

                // ATOMIC: Add to scene and tracking together
                const isSurfaceMode = spawnMode?.type === 'surface';
                if (!this._registerElement(mesh, elementType, isSurfaceMode)) {
                    // Registration failed - dispose resources to prevent leak
                    if (mesh.userData.trailState) {
                        mesh.userData.trailState.dispose();
                        _debugStats.trailsDisposed++;
                    }
                    // Dispose material (geometry is cached/shared, don't dispose)
                    if (mesh.material) {
                        mesh.material.dispose();
                        _debugStats.materialsDisposed++;
                    }
                    continue;
                }

                globalIndex++;
            }
        }
    }

    /**
     * Apply rendering settings to a mesh material
     * @param {THREE.Mesh} mesh - The mesh to configure
     * @param {Object} rendering - Rendering config from AnimationConfig
     * @private
     */
    _applyRenderSettings(mesh, rendering) {
        if (!rendering) return;

        // Render order
        if (rendering.renderOrder !== undefined) {
            mesh.renderOrder = rendering.renderOrder;
        }

        // Depth settings
        if (rendering.depthTest !== undefined) {
            mesh.material.depthTest = rendering.depthTest;
        }
        if (rendering.depthWrite !== undefined) {
            mesh.material.depthWrite = rendering.depthWrite;
        }

        // Blending mode
        if (rendering.blending) {
            switch (rendering.blending) {
            case 'additive':
                mesh.material.blending = THREE.AdditiveBlending;
                break;
            case 'multiply':
                mesh.material.blending = THREE.MultiplyBlending;
                break;
            case 'normal':
            default:
                mesh.material.blending = THREE.NormalBlending;
                break;
            }
        }
    }

    /**
     * Apply animation state values to a mesh
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {AnimationState} animState - The animation state
     * @private
     */
    _applyAnimationToMesh(mesh, animState) {
        // DEBUG: Track position at start (only for first fire element)
        const isFireDebug = false; // Disabled - was causing performance issues
        const posAtStart = isFireDebug ? mesh.position.clone() : null;

        // Visibility
        const isVisible = animState.state !== AnimationStates.WAITING &&
                         animState.state !== AnimationStates.DEAD;
        mesh.visible = isVisible;

        if (!isVisible) {
            if (isFireDebug) {
                console.log(`[FIRE ANIM] state=${animState.state} INVISIBLE, pos:`, mesh.position.x.toFixed(3), mesh.position.y.toFixed(3), mesh.position.z.toFixed(3));
            }
            return;
        }

        // Get animation config for intensity scaling
        const animConfig = mesh.userData.animationConfig;

        // Opacity
        const baseOpacity = mesh.userData.originalOpacity ?? 1;
        mesh.material.opacity = animState.opacity * baseOpacity;

        // Scale - apply intensity scaling
        const baseScale = mesh.userData.originalScale ?? 1;
        const scaledScale = animConfig
            ? animConfig.getScaledValue('scale', animState.scale)
            : animState.scale;
        const targetScale = scaledScale * baseScale;

        // Config-driven scale smoothing for procedural elements
        // Prevents jitter from high-frequency pulse animations with shader vertex displacement
        const scaleSmoothing = animConfig?.procedural?.scaleSmoothing ?? 0;
        if (scaleSmoothing > 0) {
            // Use stored uniform scale to avoid including non-uniform modifications from previous frame
            const currentUniformScale = mesh.userData.smoothedUniformScale ?? targetScale;
            const smoothedScale = currentUniformScale + (targetScale - currentUniformScale) * scaleSmoothing;
            mesh.userData.smoothedUniformScale = smoothedScale;
            mesh.scale.setScalar(smoothedScale);
        } else {
            mesh.scale.setScalar(targetScale);
            mesh.userData.smoothedUniformScale = targetScale;
        }

        // Emissive intensity - apply intensity scaling
        const baseEmissive = mesh.userData.originalEmissive ?? 1;
        const scaledEmissive = animConfig
            ? animConfig.getScaledValue('emissiveMax', animState.emissive)
            : animState.emissive;
        mesh.material.emissiveIntensity = scaledEmissive * baseEmissive;

        // Drift offset - apply to position ONLY if drift is configured and non-zero
        // Note: animState.driftOffset is always an object, so check for actual values
        const {driftOffset} = animState;
        const hasDrift = driftOffset && (driftOffset.x !== 0 || driftOffset.y !== 0 || driftOffset.z !== 0);
        if (hasDrift) {
            const { x, y, z } = driftOffset;
            // Store original position if not already stored
            if (!mesh.userData.originalPosition) {
                mesh.userData.originalPosition = mesh.position.clone();
                if (isFireDebug) {
                    console.log('[FIRE ANIM] STORING originalPosition:', mesh.userData.originalPosition.x.toFixed(3), mesh.userData.originalPosition.y.toFixed(3), mesh.userData.originalPosition.z.toFixed(3));
                }
            }
            // Apply drift relative to original position
            mesh.position.copy(mesh.userData.originalPosition);
            mesh.position.x += x;
            mesh.position.y += y;
            mesh.position.z += z;
            if (isFireDebug) {
                console.log(`[FIRE ANIM] DRIFT applied: drift=(${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}) → pos=(${mesh.position.x.toFixed(3)}, ${mesh.position.y.toFixed(3)}, ${mesh.position.z.toFixed(3)})`);
            }
        }

        // DEBUG: Log position change if it happened
        if (isFireDebug && posAtStart) {
            const dx = mesh.position.x - posAtStart.x;
            const dy = mesh.position.y - posAtStart.y;
            const dz = mesh.position.z - posAtStart.z;
            if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001 || Math.abs(dz) > 0.001) {
                console.log(`[FIRE ANIM] state=${animState.state} pos CHANGED by (${dx.toFixed(4)}, ${dy.toFixed(4)}, ${dz.toFixed(4)})`);
            }
        }

        // Rotation offset - apply to rotation
        if (animState.rotationOffset) {
            const { x, y, z } = animState.rotationOffset;
            // Store original rotation if not already stored
            if (!mesh.userData.originalRotation) {
                mesh.userData.originalRotation = mesh.rotation.clone();
            }
            // Apply rotation relative to original
            mesh.rotation.x = mesh.userData.originalRotation.x + x;
            mesh.rotation.y = mesh.userData.originalRotation.y + y;
            mesh.rotation.z = mesh.userData.originalRotation.z + z;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // PROCEDURAL ELEMENT HANDLING - Animate shader uniforms
        // Works for fire, water, electricity, or any element with procedural shaders
        // ═══════════════════════════════════════════════════════════════════════════
        const isProcedural = mesh.material?.uniforms && animConfig?.procedural;
        const isFire = mesh.userData.elementType === 'fire';
        const isWater = mesh.userData.elementType === 'water';

        // Fire-specific: intensity and fade progress
        if (isFire && mesh.material?.uniforms) {
            // Apply intensity (with flicker) for brightness
            // Apply fadeProgress (smooth, no flicker) for stable vertex displacement
            setProceduralFireIntensity(mesh.material, animState.opacity, animState.fadeProgress);

            // DEBUG: Log fire intensity for first element
            if (isFireDebug) {
                const actualIntensity = mesh.material.uniforms.uIntensity?.value;
                const fadeProgress = mesh.material.uniforms.uFadeProgress?.value;
                console.log(`[FIRE SHADER] opacity=${animState.opacity.toFixed(3)} fade=${animState.fadeProgress?.toFixed(3)} → intensity=${actualIntensity?.toFixed(3)}`);
            }
        }

        // Water-specific: intensity and fade progress
        if (isWater && mesh.material?.uniforms) {
            // Apply intensity for brightness and wave strength
            // Apply fadeProgress for stable wave displacement
            setProceduralWaterIntensity(mesh.material, animState.opacity, animState.fadeProgress);

            // Set gesture progress for arc rotation (0-1 over gesture lifetime)
            if (mesh.material.uniforms.uGestureProgress) {
                mesh.material.uniforms.uGestureProgress.value = animState.gestureProgress ?? 0;
            }
        }

        // Generic procedural: apply fadeProgress for geometry stability
        if (isProcedural && animConfig.procedural.geometryStability && mesh.material.uniforms.uFadeProgress) {
            mesh.material.uniforms.uFadeProgress.value = Math.max(0.01, animState.fadeProgress ?? 1);
        }

        // Parameter animation: animate any shader uniform over gesture lifetime
        // Works for fire (temperature), water (waveHeight), electricity (intensity), etc.
        const paramAnim = animConfig?.parameterAnimation;
        if (paramAnim && mesh.material?.uniforms) {
            const progress = animState.gestureProgress ?? 0;

            // Handle both old style (primary) and new style (named parameters)
            if (paramAnim.primary) {
                // Old style: fire temperature
                if (isFire) {
                    const temp = this._interpolateParameter(paramAnim.primary, progress);
                    setProceduralFireTemperature(mesh.material, temp);
                }
            } else {
                // New style: named parameters
                for (const [paramName, config] of Object.entries(paramAnim)) {
                    const uniformName = `u${paramName.charAt(0).toUpperCase()}${paramName.slice(1)}`;
                    if (mesh.material.uniforms[uniformName]) {
                        const value = this._interpolateParameter(config, progress);
                        mesh.material.uniforms[uniformName].value = value;
                    }
                    // Fire-specific: temperature has special setter
                    if (paramName === 'temperature' && isFire) {
                        const temp = this._interpolateParameter(config, progress);
                        setProceduralFireTemperature(mesh.material, temp);
                    }
                    // Water-specific: turbulence has special setter
                    if (paramName === 'turbulence' && isWater) {
                        const turb = this._interpolateParameter(config, progress);
                        setProceduralWaterTurbulence(mesh.material, turb);
                    }
                }
            }

            // NOTE: Flame height animation disabled - was causing vertex position glitches
            // The procedural shader handles flame appearance via intensity/temperature
            // if (mesh.material.uniforms.uFlameHeight) {
            //     const baseHeight = mesh.userData.baseFlameHeight ?? 0.3;
            //     mesh.material.uniforms.uFlameHeight.value = baseHeight * animState.opacity;
            // }
        }
    }

    /**
     * Interpolate parameter value based on gesture progress
     * Generic system that works for any shader uniform (temperature, waveHeight, intensity, etc.)
     * @param {Object} config - Parameter config { start, peak, end, curve }
     * @param {number} progress - Gesture progress 0-1
     * @returns {number} Interpolated value
     * @private
     */
    _interpolateParameter(config, progress) {
        const { start = 0.5, peak = 0.6, end = 0.4, curve = 'bell' } = config;

        switch (curve) {
        case 'bell':
            // Bell curve: start → peak at 0.5 → end
            if (progress < 0.5) {
                const t = progress * 2; // 0→1 for first half
                return start + (peak - start) * t;
            } else {
                const t = (progress - 0.5) * 2; // 0→1 for second half
                return peak + (end - peak) * t;
            }

        case 'spike':
            // Spike: slow rise then quick peak then fall
            if (progress < 0.6) {
                const t = progress / 0.6;
                return start + (peak - start) * t * t; // Quadratic rise
            } else {
                const t = (progress - 0.6) / 0.4;
                return peak + (end - peak) * t;
            }

        case 'sustained':
            // Quick rise to peak, hold, then fall at end
            if (progress < 0.15) {
                return start + (peak - start) * (progress / 0.15);
            } else if (progress < 0.85) {
                return peak;
            } else {
                const t = (progress - 0.85) / 0.15;
                return peak + (end - peak) * t;
            }

        case 'pulse': {
            // Gentle sine wave pulse
            const wave = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
            return start + (peak - start) * wave;
        }

        case 'linear':
            // Simple linear interpolation: start → end
            return start + (end - start) * progress;

        default:
            return start;
        }
    }

    /**
     * Apply Phase 11 model-specific behaviors (non-uniform scale, physics drift, opacity link)
     * @param {THREE.Mesh} mesh - The mesh to animate
     * @param {Object} animState - Animation state
     * @param {number} deltaTime - Frame delta in seconds
     * @private
     */
    _applyModelBehaviors(mesh, animState, deltaTime) {
        const { modelName, elementType, animationConfig, velocity, surfaceNormal } = mesh.userData;
        if (!modelName) return;

        // Get base behavior from MODEL_BEHAVIORS (with derived element modifications)
        const baseBehavior = getModelBehavior(modelName, elementType);
        if (!baseBehavior) return;

        // Merge with gesture-specific overrides if present
        const modelOverrides = animationConfig?.modelOverrides?.[modelName];
        const behavior = modelOverrides ?
            this._deepMergeBehavior(baseBehavior, modelOverrides) :
            baseBehavior;

        const time = mesh.userData.animationState?.elapsed ?? 0;
        const progress = animState.gestureProgress ?? 0;

        // ═══════════════════════════════════════════════════════════════════════════
        // NON-UNIFORM SCALING
        // ═══════════════════════════════════════════════════════════════════════════
        if (behavior.scaling) {
            const nuScale = calculateNonUniformScale(behavior, time, progress, velocity);

            // Store the uniform scale from _applyAnimationToMesh before we modify it
            // This prevents exponential growth when scale smoothing is enabled
            if (mesh.userData.lastUniformScale === undefined) {
                mesh.userData.lastUniformScale = mesh.scale.x;
            }
            // Use the uniform scale as base (mesh.scale was just set by _applyAnimationToMesh)
            const uniformScale = mesh.scale.x;

            // Apply non-uniform scale relative to the uniform base (not cumulative)
            mesh.scale.x = uniformScale * nuScale.x;
            mesh.scale.y = uniformScale * nuScale.y;
            mesh.scale.z = uniformScale * nuScale.z;

            // Velocity-stretch mode: orient mesh to face velocity direction
            if (nuScale.velocityAxis && behavior.scaling.mode === 'velocity-stretch') {
                const velAxis = nuScale.velocityAxis;
                // Point mesh Y-axis (the stretched axis) toward velocity direction
                // Using simple rotation: pitch down based on velocity.y, yaw based on velocity.x/z
                const horizontalSpeed = Math.sqrt(velAxis.x * velAxis.x + velAxis.z * velAxis.z);
                if (horizontalSpeed > 0.001 || Math.abs(velAxis.y) > 0.001) {
                    // Pitch: rotate around X axis based on vertical component
                    mesh.rotation.x = -Math.asin(Math.max(-1, Math.min(1, velAxis.y)));
                    // Yaw: rotate around Y axis based on horizontal direction
                    if (horizontalSpeed > 0.001) {
                        mesh.rotation.y = Math.atan2(velAxis.x, velAxis.z);
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // PHYSICS DRIFT
        // ═══════════════════════════════════════════════════════════════════════════
        if (behavior.drift) {
            const normalVec = surfaceNormal ?
                { x: surfaceNormal.x, y: surfaceNormal.y, z: surfaceNormal.z } :
                null;
            const currentOffset = mesh.userData.behaviorDriftOffset || { x: 0, y: 0, z: 0 };

            const driftOffset = calculatePhysicsDrift(
                behavior.drift,
                time,
                deltaTime,
                normalVec,
                currentOffset
            );

            // Store cumulative drift
            mesh.userData.behaviorDriftOffset = driftOffset;

            // Apply drift to position
            if (!mesh.userData.behaviorBasePosition) {
                mesh.userData.behaviorBasePosition = mesh.position.clone();
            }
            mesh.position.x = mesh.userData.behaviorBasePosition.x + driftOffset.x;
            mesh.position.y = mesh.userData.behaviorBasePosition.y + driftOffset.y;
            mesh.position.z = mesh.userData.behaviorBasePosition.z + driftOffset.z;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // OPACITY LINK
        // ═══════════════════════════════════════════════════════════════════════════
        if (behavior.opacityLink) {
            // Normalize scale by uniform base to get the non-uniform scale factors
            // This ensures inverse-scale works regardless of the element's base size
            const uniformBase = mesh.userData.lastUniformScale || mesh.userData.smoothedUniformScale || 1;
            const scale = {
                x: mesh.scale.x / uniformBase,
                y: mesh.scale.y / uniformBase,
                z: mesh.scale.z / uniformBase
            };
            const seed = mesh.userData.spawnIndex ?? 0;
            const opacityMod = calculateOpacityLink(behavior.opacityLink, scale, time, seed);

            // Apply opacity modifier
            mesh.material.opacity *= opacityMod;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // BEHAVIOR ROTATION
        // ═══════════════════════════════════════════════════════════════════════════
        if (behavior.rotate) {
            const { axis, speed, oscillate, range } = behavior.rotate;
            let rotAmount;

            if (oscillate && range) {
                rotAmount = Math.sin(time * speed * Math.PI * 2) * range;
            } else {
                rotAmount = time * speed;
            }

            switch (axis) {
            case 'y':
                mesh.rotation.y += rotAmount;
                break;
            case 'x':
                mesh.rotation.x += rotAmount;
                break;
            case 'z':
                mesh.rotation.z += rotAmount;
                break;
            case 'tangent':
            case 'random': {
                // Use random axis based on spawn index
                const idx = mesh.userData.spawnIndex ?? 0;
                if (idx % 3 === 0) mesh.rotation.x += rotAmount;
                else if (idx % 3 === 1) mesh.rotation.y += rotAmount;
                else mesh.rotation.z += rotAmount;
                break;
            }
            }
        }
    }

    /**
     * Deep merge model behavior with overrides
     * @private
     */
    _deepMergeBehavior(base, overrides) {
        const result = { ...base };

        for (const [key, value] of Object.entries(overrides)) {
            if (value && typeof value === 'object' && !Array.isArray(value) && base[key]) {
                result[key] = this._deepMergeBehavior(base[key], value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Reposition an ephemeral element to a new surface location (without changing timing)
     * @param {THREE.Mesh} mesh - The mesh to reposition
     * @param {string} elementType - Element type for config lookup
     * @private
     */
    _repositionEphemeral(mesh, elementType) {
        const {surfaceConfig} = mesh.userData;

        if (!this.coreMesh?.geometry) return;

        // Sample a single new point
        const newPoints = this._sampleSurfacePoints(
            this.coreMesh.geometry,
            1,
            surfaceConfig,
            this.camera
        );

        if (newPoints.length > 0) {
            const sample = newPoints[0];
            const embedDepth = surfaceConfig?.embedDepth ?? 0.2;
            const scale = mesh.userData.finalScale || mesh.scale.x;
            const outwardOffset = (1 - embedDepth) * scale * 0.4;
            const inwardOffset = embedDepth * scale * 0.3;
            const netOffset = outwardOffset - inwardOffset;

            const offset = sample.normal.clone().multiplyScalar(netOffset);
            mesh.position.copy(sample.position).add(offset);

            // Update stored surface data
            mesh.userData.surfaceNormal = sample.normal.clone();
            mesh.userData.surfacePosition = sample.position.clone();
            mesh.userData.targetGrowthOffset = netOffset;

            // Re-orient to new normal
            const cameraFacing = surfaceConfig?.cameraFacing ?? 0.3;
            const models = this.spawnConfig[elementType]?.models;
            const modelName = models?.length > 0
                ? models[Math.floor(Math.random() * models.length)]
                : null;
            this._orientElement(mesh, sample.normal, cameraFacing, this.camera, modelName);
        }
    }

    /**
     * Capitalize first letter
     * @private
     */
    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Periodic cleanup check - detects orphaned materials and triggers emergency cleanup
     * Called every few seconds from update() to catch resource leaks.
     * @private
     */
    _periodicCleanupCheck() {
        const activeMats = _debugStats.activeMaterials;
        const totalActiveElements = Object.values(this.activeElements)
            .reduce((sum, arr) => sum + arr.length, 0);

        // If we have many materials but few/no active elements, something is wrong
        // Expected: ~4 materials per element (1 main + 3 trails)
        const expectedMaterials = totalActiveElements * 4;
        const orphanThreshold = 50; // Allow some margin

        if (activeMats > expectedMaterials + orphanThreshold) {
            console.warn(
                `[ElementSpawner] Orphan material check: ${activeMats} active, ` +
                `${totalActiveElements} elements (expected ~${expectedMaterials}). ` +
                `Forcing cleanup.`
            );
            this.despawnAll();
        }

        // Also check for dangerous levels even with elements present
        if (activeMats > MAX_ACTIVE_MATERIALS * 0.9) {
            console.warn(
                `[ElementSpawner] Materials at ${Math.round(activeMats / MAX_ACTIVE_MATERIALS * 100)}% ` +
                `of limit (${activeMats}/${MAX_ACTIVE_MATERIALS}). Consider reducing element count.`
            );
        }
    }

    /**
     * Dispose all resources
     */
    dispose() {
        this.despawnAll();

        // Dispose cached geometries
        for (const geometry of this.geometryCache.values()) {
            geometry?.dispose();
        }
        this.geometryCache.clear();

        // Dispose materials
        this.iceMaterial?.dispose();
        this.earthMaterial?.dispose();
        this.natureMaterial?.dispose();
        this.fireMaterial?.dispose();
        this.electricityMaterial?.dispose();
        this.waterMaterial?.dispose();
        this.voidMaterial?.dispose();
        this.lightMaterial?.dispose();
        this.poisonMaterial?.dispose();
        this.smokeMaterial?.dispose();

        // Remove container from parent
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }
    }
}

export default ElementSpawner;
