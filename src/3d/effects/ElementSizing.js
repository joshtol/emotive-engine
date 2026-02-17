/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Sizing & Orientation
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared sizing and orientation logic for element spawning
 * @module effects/ElementSizing
 *
 * Golden Ratio-based sizing system for consistent element scaling across mascots.
 * All sizes are fractions of the mascot's bounding radius (R).
 *
 * Size classes using φ (1.618):
 * - tiny:      φ⁻⁴ ≈ 0.069 (6.9% of R)
 * - small:     φ⁻³ ≈ 0.111 (11.1% of R)
 * - medium:    φ⁻² ≈ 0.180 (18.0% of R)
 * - large:     φ⁻¹ ≈ 0.292 (29.2% of R)
 * - prominent: φ⁻⁰·⁵ ≈ 0.382 (38.2% of R)
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO SIZE CLASSES
// ═══════════════════════════════════════════════════════════════════════════════════════

/** Golden Ratio constant */
export const PHI = 1.6180339887;

/** Size class definitions as fractions of mascot radius */
export const SIZE_CLASSES = {
    tiny:      1 / Math.pow(PHI, 4),    // ~0.069 (6.9% of R)
    small:     1 / Math.pow(PHI, 3),    // ~0.111 (11.1% of R)
    medium:    1 / Math.pow(PHI, 2),    // ~0.180 (18.0% of R)
    large:     1 / PHI,                 // ~0.292 (29.2% of R)
    prominent: 1 / Math.pow(PHI, 0.5)   // ~0.382 (38.2% of R)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODEL SIZE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Model size definitions using Golden Ratio size classes
 * Each model maps to a size class with optional variance
 */
export const MODEL_SIZES = {
    // Ice models - smaller than earth for delicate crystalline feel
    'crystal-small':   { class: 'tiny',   variance: 0.25 },
    'crystal-medium':  { class: 'small',  variance: 0.2 },
    'crystal-cluster': { class: 'medium', variance: 0.2 },
    'ice-spike':       { class: 'small',  variance: 0.25 },

    // Earth models - chunky, substantial feel
    'rock-chunk-small':  { class: 'small',  variance: 0.25 },
    'rock-chunk-medium': { class: 'medium', variance: 0.2 },
    'rock-cluster':      { class: 'large',  variance: 0.2 },
    'stone-slab':        { class: 'medium', variance: 0.25 },

    // Nature models - organic, varied sizes
    'vine-tendril':    { class: 'medium', variance: 0.3 },
    'vine-coil':       { class: 'medium', variance: 0.25 },
    'thorn-vine':      { class: 'small',  variance: 0.3 },
    'leaf-single':     { class: 'tiny',   variance: 0.25 },
    'leaf-cluster':    { class: 'small',  variance: 0.3 },
    'fern-frond':      { class: 'medium', variance: 0.25 },
    'flower-bud':      { class: 'tiny',   variance: 0.3 },
    'flower-bloom':    { class: 'small',  variance: 0.25 },
    'petal-scatter':   { class: 'tiny',   variance: 0.3 },
    'root-tendril':    { class: 'small',  variance: 0.3 },
    'moss-patch':      { class: 'tiny',   variance: 0.25 },
    'mushroom-cap':    { class: 'small',  variance: 0.3 },

    // Fire models - dynamic, rising flames
    'ember-cluster':   { class: 'tiny',   variance: 0.3 },
    'flame-wisp':      { class: 'small',  variance: 0.25 },
    'flame-tongue':    { class: 'medium', variance: 0.25 },
    'fire-burst':      { class: 'large',  variance: 0.2 },
    'flame-ring':      { class: 'large',  variance: 0.15 },  // Vortex ring

    // Electricity models - angular, energetic
    'arc-small':       { class: 'small',  variance: 0.25 },
    'arc-medium':      { class: 'medium', variance: 0.2 },
    'arc-cluster':     { class: 'large',  variance: 0.2 },
    'spark-node':      { class: 'tiny',   variance: 0.3 },
    'lightning-ring':  { class: 'large',  variance: 0.15 },

    // Water models - flowing, organic
    'droplet-small':   { class: 'tiny',   variance: 0.25 },
    'droplet-large':   { class: 'small',  variance: 0.2 },
    'splash-ring':     { class: 'medium', variance: 0.25 },
    'bubble-cluster':  { class: 'small',  variance: 0.3 },
    'wave-curl':       { class: 'medium', variance: 0.25 },

    // Void models - dark, corrupting
    'void-crack':        { class: 'small',  variance: 0.3 },
    'shadow-tendril':    { class: 'medium', variance: 0.25 },
    'corruption-patch':  { class: 'small',  variance: 0.3 },
    'void-shard':        { class: 'tiny',   variance: 0.25 },
    'void-ring':         { class: 'large',  variance: 0.15 },  // Vortex ring (matches flame-ring)
    'void-orb':          { class: 'medium', variance: 0.2 },
    'void-tendril-large': { class: 'large', variance: 0.2 },
    'void-wrap':         { class: 'medium', variance: 0.25 },
    'void-disk':         { class: 'large',  variance: 0.1 },   // Procedural dark disk (singularity/hollow)
    'void-crown':        { class: 'large',  variance: 0.15 },  // Crown ring GLB

    // Light models - radiant, geometric
    'light-ray':       { class: 'medium', variance: 0.25 },
    'prism-shard':     { class: 'small',  variance: 0.2 },
    'halo-ring':       { class: 'large',  variance: 0.2 },
    'sparkle-star':    { class: 'tiny',   variance: 0.3 }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODEL ORIENTATION DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

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
 * riseFactor: For 'rising' mode, how much to bias toward world-up (0-1)
 */
export const MODEL_ORIENTATIONS = {
    // Ice
    'crystal-small':   { mode: 'outward', tiltAngle: 0.15 },
    'crystal-medium':  { mode: 'outward', tiltAngle: 0.2 },
    'crystal-cluster': { mode: 'outward', tiltAngle: 0.25 },
    'ice-spike':       { mode: 'outward', tiltAngle: 0.05 },

    // Earth
    'rock-chunk-small':  { mode: 'outward', tiltAngle: 0.35 },
    'rock-chunk-medium': { mode: 'outward', tiltAngle: 0.3 },
    'rock-cluster':      { mode: 'outward', tiltAngle: 0.15 },
    'stone-slab':        { mode: 'flat',    tiltAngle: 0.1 },

    // Nature
    'vine-tendril':    { mode: 'tangent', tiltAngle: 0.2 },
    'vine-coil':       { mode: 'tangent', tiltAngle: 0.15 },
    'thorn-vine':      { mode: 'tangent', tiltAngle: 0.25 },
    'leaf-single':     { mode: 'flat',    tiltAngle: 0.3 },
    'leaf-cluster':    { mode: 'outward', tiltAngle: 0.4 },
    'fern-frond':      { mode: 'outward', tiltAngle: 0.5 },
    'flower-bud':      { mode: 'outward', tiltAngle: 0.2 },
    'flower-bloom':    { mode: 'outward', tiltAngle: 0.3 },
    'petal-scatter':   { mode: 'flat',    tiltAngle: 0.1 },
    'root-tendril':    { mode: 'tangent', tiltAngle: -0.1 },
    'moss-patch':      { mode: 'flat',    tiltAngle: 0 },
    'mushroom-cap':    { mode: 'outward', tiltAngle: 0.15 },

    // Fire - rising mode biases toward world-up
    'ember-cluster':   { mode: 'rising',  tiltAngle: 0.2, riseFactor: 0.6 },
    'flame-wisp':      { mode: 'rising',  tiltAngle: 0.15, riseFactor: 0.8 },
    'flame-tongue':    { mode: 'rising',  tiltAngle: 0.2, riseFactor: 0.75 },
    'fire-burst':      { mode: 'rising',  tiltAngle: 0.25, riseFactor: 0.5 },
    'flame-ring':      { mode: 'flat',    tiltAngle: 0 },  // Horizontal vortex ring

    // Electricity
    'arc-small':       { mode: 'tangent', tiltAngle: 0.1 },
    'arc-medium':      { mode: 'tangent', tiltAngle: 0.15 },
    'arc-cluster':     { mode: 'outward', tiltAngle: 0.3 },
    'spark-node':      { mode: 'outward', tiltAngle: 0.4 },
    'lightning-ring':  { mode: 'flat',    tiltAngle: 0 },

    // Water - falling mode for droplets
    'droplet-small':   { mode: 'falling', tiltAngle: 0.1, fallFactor: 0.7 },
    'droplet-large':   { mode: 'falling', tiltAngle: 0.05, fallFactor: 0.8 },
    'splash-ring':     { mode: 'flat',    tiltAngle: 0.05 },
    'bubble-cluster':  { mode: 'rising',  tiltAngle: 0.2, riseFactor: 0.5 },
    'wave-curl':       { mode: 'vertical', tiltAngle: 0 },

    // Void
    'void-crack':        { mode: 'outward-flat', tiltAngle: 0.05 },
    'shadow-tendril':    { mode: 'tangent',      tiltAngle: 0.3 },
    'corruption-patch':  { mode: 'flat',         tiltAngle: 0 },
    'void-shard':        { mode: 'outward',      tiltAngle: 0.35 },
    'void-ring':         { mode: 'flat',         tiltAngle: 0 },  // XY plane in Three.js — 'flat' rotates to horizontal
    'void-orb':          { mode: 'outward',      tiltAngle: 0 },
    'void-tendril-large': { mode: 'tangent',     tiltAngle: 0.2 },
    'void-wrap':         { mode: 'flat',         tiltAngle: 0.1 },
    'void-disk':         { mode: 'flat',         tiltAngle: 0 },   // Procedural dark disk — always flat
    'void-crown':        { mode: 'flat',         tiltAngle: 0 },   // Crown ring GLB — horizontal above head

    // Light
    'light-ray':       { mode: 'outward', tiltAngle: 0.1 },
    'prism-shard':     { mode: 'outward', tiltAngle: 0.2 },
    'halo-ring':       { mode: 'outward-flat', tiltAngle: 0 },
    'sparkle-star':    { mode: 'outward', tiltAngle: 0.3 }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Get the size for a model as a fraction of mascot radius
 * @param {string} modelName - Name of the model (without .glb extension)
 * @returns {{ base: number, min: number, max: number }} Size fractions of R
 */
export function getModelSizeFraction(modelName) {
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
 * Get the orientation config for a model
 * @param {string} modelName - Name of the model (without .glb extension)
 * @returns {{ mode: string, tiltAngle: number, riseFactor?: number, fallFactor?: number }}
 */
export function getModelOrientation(modelName) {
    return MODEL_ORIENTATIONS[modelName] || { mode: 'outward', tiltAngle: 0.2 };
}

/**
 * Calculate mascot bounding radius from a mesh
 * @param {THREE.Mesh} mesh - The mascot mesh
 * @returns {number} Bounding radius
 */
export function calculateMascotRadius(mesh) {
    if (!mesh?.geometry) {
        console.warn('[ElementSizing] No mesh geometry, using default radius');
        return 1.0;
    }

    const { geometry } = mesh;
    let radius = 1.0;

    // Try bounding sphere first
    if (!geometry.boundingSphere) {
        geometry.computeBoundingSphere();
    }

    if (geometry.boundingSphere) {
        ({ radius } = geometry.boundingSphere);

        // Account for mesh scale
        const { scale } = mesh;
        const avgScale = (scale.x + scale.y + scale.z) / 3;
        radius *= avgScale;
    } else {
        // Fallback: compute from bounding box
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }

        if (geometry.boundingBox) {
            const size = new THREE.Vector3();
            geometry.boundingBox.getSize(size);
            // Use half the diagonal as approximate radius
            radius = size.length() / 2;
        }
    }

    // Ensure reasonable minimum
    return Math.max(0.1, radius);
}

/**
 * Calculate scale for an element given model name and mascot radius
 * @param {string} modelName - Model name (without .glb)
 * @param {number} mascotRadius - Mascot bounding radius
 * @param {number} [scaleMultiplier=1.0] - Additional scale multiplier
 * @returns {number} Final scale value
 */
export function calculateElementScale(modelName, mascotRadius, scaleMultiplier = 1.0) {
    const sizeFraction = getModelSizeFraction(modelName);
    const baseScale = sizeFraction.min + Math.random() * (sizeFraction.max - sizeFraction.min);
    return baseScale * mascotRadius * scaleMultiplier;
}

export default {
    PHI,
    SIZE_CLASSES,
    MODEL_SIZES,
    MODEL_ORIENTATIONS,
    getModelSizeFraction,
    getModelOrientation,
    calculateMascotRadius,
    calculateElementScale
};
