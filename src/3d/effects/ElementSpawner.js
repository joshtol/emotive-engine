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
import { calculateHoldAnimations } from './animation/HoldAnimations.js';
import { TrailState } from './animation/Trail.js';

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
    setProceduralWaterTurbulence
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

                    gltf.scene.traverse(child => {
                        if (child.isMesh && child.geometry) {
                            geometry = child.geometry.clone();
                        }
                    });

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
        if (!config) return;

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
        const candidates = [];
        const cameraDir = camera ?
            new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion) :
            new THREE.Vector3(0, 0, 1);

        for (let i = 0; i < vertexCount; i++) {
            const pos = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );
            const normal = normals ?
                new THREE.Vector3(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                ).normalize() :
                new THREE.Vector3(0, 1, 0);

            // Calculate weight based on pattern
            let weight = 1.0;

            switch (pattern) {
            case 'crown':
                // Favor top of mascot (high Y, facing upward)
                weight = Math.max(0, pos.y) * 2 + Math.max(0, normal.y) * 0.5;
                break;

            case 'shell':
                // Even distribution, slight camera bias for visibility
                weight = 0.5 + Math.max(0, normal.dot(cameraDir)) * 0.5;
                break;

            case 'scattered':
                // Random with camera visibility weighting
                weight = 0.3 + Math.max(0, normal.dot(cameraDir)) * 0.7;
                break;

            case 'spikes': {
                // Favor outward-facing normals (edges, protrusions)
                const radialDir = pos.clone().normalize();
                weight = Math.max(0, normal.dot(radialDir)) * 1.5;
                break;
            }

            case 'ring': {
                // Horizontal ring around center
                const horizontalness = 1 - Math.abs(normal.y);
                const atCenter = 1 - Math.abs(pos.y) * 2;
                weight = horizontalness * 0.5 + Math.max(0, atCenter) * 0.5;
                break;
            }

            default:
                weight = 1.0;
            }

            // Apply camera-facing boost for all patterns
            const cameraDot = normal.dot(cameraDir);
            if (cameraDot > 0) {
                weight *= 1 + cameraDot * 0.3;
            }

            if (weight > 0.01) {
                candidates.push({ position: pos, normal, weight, index: i });
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
        const up = new THREE.Vector3(0, 1, 0);
        const orientConfig = modelName ? getModelOrientation(modelName) : { mode: 'outward', tiltAngle: 0.2 };

        // Random angle for variety (used by all modes)
        const randomAngle = Math.random() * Math.PI * 2;

        // Calculate a tangent vector perpendicular to the normal
        // This gives us a direction "along" the surface
        const tangent = new THREE.Vector3();
        if (Math.abs(normal.y) < 0.999) {
            tangent.crossVectors(up, normal).normalize();
        } else {
            // If normal is nearly vertical, use a different reference
            tangent.crossVectors(new THREE.Vector3(1, 0, 0), normal).normalize();
        }

        // Calculate bitangent (perpendicular to both normal and tangent)
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

        // Rotate tangent by random angle around normal for variety
        const rotatedTangent = tangent.clone()
            .multiplyScalar(Math.cos(randomAngle))
            .addScaledVector(bitangent, Math.sin(randomAngle));

        const baseQuat = new THREE.Quaternion();

        switch (orientConfig.mode) {
        case 'flat':
            // Element lies parallel to surface
            // Up axis becomes the surface normal, forward is along tangent
            {
                const matrix = new THREE.Matrix4();
                // X = rotated tangent (forward), Y = normal (up), Z = cross product
                const zAxis = new THREE.Vector3().crossVectors(rotatedTangent, normal).normalize();
                matrix.makeBasis(rotatedTangent, normal, zAxis);
                baseQuat.setFromRotationMatrix(matrix);

                // Apply tilt - rotate around tangent axis to lift one edge
                if (orientConfig.tiltAngle !== 0) {
                    const tiltQuat = new THREE.Quaternion();
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
                const elementUp = normal.clone()
                    .multiplyScalar(tiltAmount)
                    .addScaledVector(rotatedTangent, 1 - tiltAmount)
                    .normalize();

                baseQuat.setFromUnitVectors(up, elementUp);

                // Apply additional tilt (negative = digs in, positive = lifts)
                if (orientConfig.tiltAngle !== 0) {
                    const tiltAxis = new THREE.Vector3().crossVectors(rotatedTangent, normal).normalize();
                    const tiltQuat = new THREE.Quaternion();
                    tiltQuat.setFromAxisAngle(tiltAxis, orientConfig.tiltAngle);
                    baseQuat.premultiply(tiltQuat);
                }
            }
            break;

        case 'rising':
        case 'falling': {
            // Fire/bubbles rise toward world-up, water droplets fall toward world-down
            // Blends between surface normal and world direction based on riseFactor
            const worldUp = new THREE.Vector3(0, 1, 0);
            const riseFactor = orientConfig.riseFactor ?? 0.7;

            // For 'falling', invert the world direction (negative riseFactor in config)
            // riseFactor > 0 = bias toward world-up (fire, bubbles)
            // riseFactor < 0 = bias toward world-down (water droplets)
            let targetDir;
            if (riseFactor >= 0) {
                // Blend from surface normal toward world-up
                targetDir = normal.clone()
                    .multiplyScalar(1 - riseFactor)
                    .addScaledVector(worldUp, riseFactor)
                    .normalize();
            } else {
                // Blend from surface normal toward world-down
                const worldDown = new THREE.Vector3(0, -1, 0);
                const fallFactor = Math.abs(riseFactor);
                targetDir = normal.clone()
                    .multiplyScalar(1 - fallFactor)
                    .addScaledVector(worldDown, fallFactor)
                    .normalize();
            }

            baseQuat.setFromUnitVectors(up, targetDir);

            // Apply tilt for variation
            if (orientConfig.tiltAngle !== 0) {
                const tiltQuat = new THREE.Quaternion();
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }

            // Random spin around the target direction
            const spinQuat = new THREE.Quaternion();
            spinQuat.setFromAxisAngle(targetDir, randomAngle);
            baseQuat.premultiply(spinQuat);
            break;
        }

        case 'outward-flat': {
            // Element faces away from surface but lies flat (parallel to surface)
            // Perfect for rifts, portals, spreading cracks - they open up facing outward
            // but spread along the surface plane

            // First: orient so the element's "front" faces along the normal (away from surface)
            // The element's Y-up becomes perpendicular to normal (lies in surface plane)
            const forward = normal.clone();  // Element faces this direction

            // Create a basis where forward = normal, up lies in surface plane
            const matrix = new THREE.Matrix4();

            // Pick an "up" direction that lies in the surface plane
            // Use the rotated tangent as the element's up (it lies in surface plane)
            const elementUp = rotatedTangent.clone();

            // Right vector completes the basis
            const elementRight = new THREE.Vector3().crossVectors(elementUp, forward).normalize();

            // Recalculate up to ensure orthogonality
            const finalUp = new THREE.Vector3().crossVectors(forward, elementRight).normalize();

            // Build rotation matrix: X=right, Y=up (in surface plane), Z=forward (away from surface)
            matrix.makeBasis(elementRight, finalUp, forward);
            baseQuat.setFromRotationMatrix(matrix);

            // Apply tilt - slight angle off the surface for depth
            if (orientConfig.tiltAngle !== 0) {
                const tiltQuat = new THREE.Quaternion();
                tiltQuat.setFromAxisAngle(elementRight, orientConfig.tiltAngle);
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
                const tiltQuat = new THREE.Quaternion();
                tiltQuat.setFromAxisAngle(rotatedTangent, orientConfig.tiltAngle);
                baseQuat.premultiply(tiltQuat);
            }

            // Random spin around normal
            const spinQuat = new THREE.Quaternion();
            spinQuat.setFromAxisAngle(normal, randomAngle);
            baseQuat.premultiply(spinQuat);
            break;
        }
        }

        // Apply camera-facing blend if requested
        if (cameraFacing > 0 && camera && orientConfig.mode === 'outward') {
            const cameraPos = camera.position.clone();
            const meshWorldPos = mesh.getWorldPosition(new THREE.Vector3());
            const toCamera = cameraPos.sub(meshWorldPos).normalize();

            const cameraQuat = new THREE.Quaternion();
            cameraQuat.setFromUnitVectors(up, toCamera);

            // Slerp between base orientation and camera facing
            baseQuat.slerp(cameraQuat, cameraFacing);
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
    async spawn(elementType, options = {}) {
        // Check for elements array (choreographed sequences)
        if (options.elements && Array.isArray(options.elements)) {
            return this._spawnFromElementsArray(elementType, options);
        }
        const { intensity = 1.0, animated = true } = options;
        // Use passed camera or fall back to stored camera
        const camera = options.camera || this.camera;
        const { mode = 'orbit' } = options;

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

        const config = this.spawnConfig[elementType];

        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

        // Calculate spawn count based on intensity (or use override)
        const count = surfaceConfig?.countOverride || Math.floor(
            config.count.min + (config.count.max - config.count.min) * intensity
        );

        // Debug: console.log(`[ElementSpawner] Spawning ${count} ${elementType} elements (mode: ${modeType}, pattern: ${surfaceConfig?.pattern || 'n/a'})`);

        // Get material for this type
        const material = this._getMaterial(elementType);

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

        for (let i = 0; i < count; i++) {
            // Select random model
            const modelName = config.models[Math.floor(Math.random() * config.models.length)];
            const geometry = await this.loadModel(elementType, modelName);

            if (!geometry) continue;

            // Create mesh - clone material for fire elements to allow per-element intensity
            const useMaterial = (elementType === 'fire') ? material.clone() : material;
            const mesh = new THREE.Mesh(geometry, useMaterial);

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

            // Handle ephemeral mode - flash in, hold, fade out, respawn
            if (surfaceConfig?.ephemeral) {
                const eph = surfaceConfig.ephemeral;
                // Clone material so each mesh can have independent opacity/emissive
                mesh.material = material.clone();
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
            if (options.animation) {
                // Clone material for independent animation control
                mesh.material = material.clone();
                mesh.userData.originalOpacity = mesh.material.opacity;
                mesh.userData.originalEmissive = mesh.material.emissiveIntensity;
                mesh.userData.originalScale = scale;

                // Create AnimationConfig and AnimationState for this element
                const gestureDuration = options.gestureDuration ?? 1000;
                const animConfig = new AnimationConfig(options.animation, gestureDuration);
                const animState = new AnimationState(animConfig, i);

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

                // Create trail if configured
                if (animConfig.rendering.trail) {
                    const trailState = new TrailState(animConfig.rendering.trail);
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

                // DEBUG: Log spawn position and mark first fire element for tracking
                if (elementType === 'fire') {
                    mesh.userData.debugIndex = i;
                    if (i === 0) {
                        console.log(`[FIRE SPAWN] element ${i} position:`, mesh.position.x.toFixed(3), mesh.position.y.toFixed(3), mesh.position.z.toFixed(3));
                    }
                }

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

            // For surface mode, add to coreMesh so it moves with it
            if (modeType === 'surface' && this.coreMesh) {
                this.coreMesh.add(mesh);
            } else {
                this.container.add(mesh);
            }
            this.activeElements[elementType].push(mesh);
        }
    }

    /**
     * Despawn all elements of a type
     * @param {string} elementType - 'ice', 'earth', or 'nature'
     * @param {boolean} [animated=true] - Enable despawn animation
     */
    despawn(elementType, animated = true) {
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
                }

                // Surface mode elements are attached to coreMesh
                if (mesh.userData.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else {
                    this.container.remove(mesh);
                }
                mesh.geometry.dispose();
            }
        }

        if (!animated) {
            this.activeElements[elementType] = [];
        }
    }

    /**
     * Despawn all elements
     */
    despawnAll() {
        for (const type of ['ice', 'earth', 'nature', 'fire', 'electricity', 'water', 'void', 'light']) {
            this.despawn(type, false);
        }
    }

    /**
     * Update animations
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} [gestureProgress=null] - Gesture progress 0-1 for synced animations
     */
    update(deltaTime, gestureProgress = null) {
        this.time += deltaTime;

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
            const toRemove = [];

            for (const mesh of elements) {
                const isSurfaceMode = mesh.userData.spawnMode === 'surface';

                // NEW ANIMATION SYSTEM - gesture-synced animations
                if (mesh.userData.animationState) {
                    const animState = mesh.userData.animationState;
                    const isFireDebug = type === 'fire' && mesh.userData.debugIndex === 0;

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
                    const elapsed = this.time - mesh.userData.despawnStart;
                    const progress = Math.min(elapsed / 0.3, 1); // 0.3s despawn duration

                    mesh.scale.setScalar(mesh.scale.x * (1 - progress * progress));

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
            }

            // Remove despawned elements
            for (const mesh of toRemove) {
                // Surface mode elements are attached to coreMesh, not container
                if (mesh.userData.spawnMode === 'surface' && this.coreMesh) {
                    this.coreMesh.remove(mesh);
                } else {
                    this.container.remove(mesh);
                }
                mesh.geometry.dispose();
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
        return this.activeElements[elementType]?.length > 0;
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
                const modelName = this.spawnConfig[elementType]?.models?.[
                    Math.floor(Math.random() * this.spawnConfig[elementType].models.length)
                ];
                this._orientElement(mesh, sample.normal, cameraFacing, this.camera, modelName);
            }
        }
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

        if (!config) {
            console.warn(`[ElementSpawner] Unknown element type: ${elementType}`);
            return;
        }

        // Clear existing elements of this type
        this.despawn(elementType, false);

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
                : (elemDef.models || config.models);

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

                if (!geometry) continue;

                // Create mesh
                const mesh = new THREE.Mesh(geometry, material.clone());

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
                animState.initialize(this.time);

                // Apply rendering settings from config
                this._applyRenderSettings(mesh, animConfig.rendering);

                // Create trail if configured
                if (animConfig.rendering.trail) {
                    const trailState = new TrailState(animConfig.rendering.trail);
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

                // Add to scene
                if (spawnMode?.type === 'surface' && this.coreMesh) {
                    this.coreMesh.add(mesh);
                } else {
                    this.container.add(mesh);
                }
                this.activeElements[elementType].push(mesh);

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
        const isFireDebug = mesh.userData.elementType === 'fire' && mesh.userData.debugIndex === 0;
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
            const currentScale = mesh.scale.x;
            const smoothedScale = currentScale + (targetScale - currentScale) * scaleSmoothing;
            mesh.scale.setScalar(smoothedScale);
        } else {
            mesh.scale.setScalar(targetScale);
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
            const modelName = this.spawnConfig[elementType]?.models?.[
                Math.floor(Math.random() * this.spawnConfig[elementType].models.length)
            ];
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
