/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wetness Core
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shared wetness system for instanced elemental materials
 * @module materials/cores/WetnessCore
 *
 * Provides noise-driven moisture patches with:
 * - Temporal drift (patches slowly migrate across the surface)
 * - Breathing animation (gentle pulsation of wet/dry boundary)
 * - Crack pooling (moisture collects in crevices near Voronoi edges)
 * - Master parameter coupling (host element controls overall wetness)
 *
 * ## Usage in Materials
 *
 * ```javascript
 * import {
 *     WETNESS_UNIFORMS_GLSL,
 *     WETNESS_FUNC_GLSL,
 *     createWetnessUniforms,
 *     setWetness,
 *     resetWetness
 * } from './cores/WetnessCore.js';
 *
 * const FRAGMENT_SHADER = `
 *     ${WETNESS_UNIFORMS_GLSL}   // uniform declarations
 *     ${NOISE_GLSL}              // host material's noise (MUST come first)
 *     ${WETNESS_FUNC_GLSL}       // calculateWetMask, applyWetDarkening
 *
 *     void main() {
 *         float crackProximity = 1.0 - smoothstep(0.0, 0.10, crackEdge);
 *         float wetMask = calculateWetMask(vPosition, vRandomSeed, instanceTime, crackProximity);
 *         color = applyWetDarkening(color, wetMask, 0.55);
 *         // ... element-specific specular using wetMask ...
 *     }
 * `;
 * ```
 *
 * ## Per-Element Tuning
 *
 * | Element | uWetness coupling          | Darkening | Crack pooling |
 * |---------|----------------------------|-----------|---------------|
 * | Earth   | mix(0.7, 0.3, petrif.)     | 0.55      | crackEdge     |
 * | Ice     | melt * 0.7 + 0.3           | 0.92      | 0.0 (future)  |
 * | Nature  | 0.6 default (lush = moist) | 0.65      | N/A           |
 *
 * IMPORTANT: The GLSL functions call noise(vec3) which must already be defined
 * by the host material's NOISE_GLSL. Inject WETNESS_FUNC_GLSL AFTER NOISE_GLSL.
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const WETNESS_DEFAULTS = {
    wetness: 0.5, // Master wetness amount (0=bone dry, 1=fully wet)
    wetSpeed: 0.3, // Temporal animation speed (drift + breathing)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLSL UNIFORM DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Wetness uniform declarations for fragment shader.
 * Inject into the uniforms section of the fragment shader.
 */
export const WETNESS_UNIFORMS_GLSL = /* glsl */ `
// Shared wetness system (WetnessCore)
uniform float uWetness;       // Master wetness amount (0-1)
uniform float uWetSpeed;      // Temporal drift/breathing speed
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLSL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Wetness calculation functions.
 * MUST be injected AFTER the host material's NOISE_GLSL — calls noise(vec3).
 */
export const WETNESS_FUNC_GLSL = /* glsl */ `
// ═══════════════════════════════════════════════════════════════════════════════════════
// WETNESS SYSTEM (shared across earth, ice, nature)
//
// Noise-driven moisture patches with temporal drift, breathing, and crack pooling.
// Host material provides noise(vec3), position, seed, time, and crack proximity.
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate wetness mask with temporal animation and crack pooling.
 *
 * @param pos    Object-space position (vec3)
 * @param seed   Per-instance random seed for variation (float)
 * @param time   Global time for temporal animation (float)
 * @param crackProximity  0=far from crack, 1=on crack edge (float)
 * @return wetMask 0-1 (float)
 */
float calculateWetMask(vec3 pos, float seed, float time, float crackProximity) {
    // Temporal drift — patches slowly migrate across surface
    // Different speeds in X/Z for organic, non-uniform motion
    vec3 driftOffset = vec3(
        time * uWetSpeed * 0.05,
        0.0,
        time * uWetSpeed * 0.03
    );

    // Domain warp — breaks round noise blobs into irregular organic shapes
    // Like real moisture seeping along grain boundaries, not perfect circles
    vec3 warpedPos = pos + vec3(
        noise(pos * 3.0 + vec3(seed * 2.1)) * 0.3,
        0.0,
        noise(pos * 3.0 + vec3(0.0, seed * 3.4, 5.0)) * 0.3
    );

    // Broad damp patches (low frequency, ~8% coverage — sparse isolated pools)
    float wetNoise1 = noise(warpedPos * 2.0 + vec3(seed * 6.0) + driftOffset);
    float broadPatches = smoothstep(0.66, 0.80, wetNoise1);

    // Smaller damp spots (higher frequency, layered on top)
    float wetNoise2 = noise(warpedPos * 5.0 + vec3(seed * 3.0, 2.1, 0.8) + driftOffset * 1.5);
    float smallSpots = smoothstep(0.76, 0.88, wetNoise2) * 0.5;

    // Combine — whichever is stronger wins
    float baseMask = max(broadPatches, smallSpots);

    // Breathing animation — gentle pulse so wet/dry boundary shifts subtly
    float breathe = sin(time * uWetSpeed * 0.3 + seed * 6.28);
    baseMask *= (0.85 + breathe * 0.15);

    // Crack pooling — moisture accumulates in crevices
    // At medium wetness, cracks wet up first; at high wetness, everything is wet
    float wetMask = min(1.0, baseMask + crackProximity * 0.25);

    // Master wetness control — 0 = bone dry, 1 = fully wet
    return wetMask * uWetness;
}

/**
 * Apply darkening from moisture absorption.
 * Wet surfaces are darker because water fills pores and reduces diffuse scatter.
 *
 * @param color           Base surface color (vec3)
 * @param wetMask         Wetness mask 0-1 (float)
 * @param darkeningFactor How dark wet areas get (0.55=earth strong, 0.92=ice subtle)
 * @return darkened color (vec3)
 */
vec3 applyWetDarkening(vec3 color, float wetMask, float darkeningFactor) {
    return color * mix(1.0, darkeningFactor, wetMask);
}
`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// JAVASCRIPT API
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create wetness uniform objects to spread into material uniforms.
 *
 * @param {Object} [defaults] - Override default values
 * @param {number} [defaults.wetness] - Initial wetness amount (0-1)
 * @param {number} [defaults.wetSpeed] - Temporal animation speed
 * @returns {Object} Uniform objects { uWetness, uWetSpeed }
 */
export function createWetnessUniforms(defaults = {}) {
    return {
        uWetness: { value: defaults.wetness ?? WETNESS_DEFAULTS.wetness },
        uWetSpeed: { value: defaults.wetSpeed ?? WETNESS_DEFAULTS.wetSpeed },
    };
}

/**
 * Configure wetness on an instanced material.
 *
 * @param {THREE.ShaderMaterial} material - The material to configure
 * @param {Object} config - Wetness configuration
 * @param {number} [config.wetness] - Master wetness amount (0-1)
 * @param {number} [config.wetSpeed] - Temporal animation speed
 */
export function setWetness(material, config) {
    if (!material?.uniforms) return;

    const { wetness, wetSpeed } = config;

    if (wetness !== undefined && material.uniforms.uWetness) {
        material.uniforms.uWetness.value = wetness;
    }
    if (wetSpeed !== undefined && material.uniforms.uWetSpeed) {
        material.uniforms.uWetSpeed.value = wetSpeed;
    }
}

/**
 * Reset wetness to default (moderate) state.
 * @param {THREE.ShaderMaterial} material - The material to reset
 */
export function resetWetness(material) {
    if (!material?.uniforms) return;

    if (material.uniforms.uWetness) {
        material.uniforms.uWetness.value = WETNESS_DEFAULTS.wetness;
    }
    if (material.uniforms.uWetSpeed) {
        material.uniforms.uWetSpeed.value = WETNESS_DEFAULTS.wetSpeed;
    }
}

export default {
    WETNESS_DEFAULTS,
    WETNESS_UNIFORMS_GLSL,
    WETNESS_FUNC_GLSL,
    createWetnessUniforms,
    setWetness,
    resetWetness,
};
