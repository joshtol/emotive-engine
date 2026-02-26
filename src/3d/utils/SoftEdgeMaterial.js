/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Soft Edge Material
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Applies edge-fading effect to materials using barycentric coordinates
 * @author Emotive Engine Team
 * @module utils/SoftEdgeMaterial
 *
 * ## Purpose
 *
 * Makes polygon edges fade to transparent, creating softer-looking geometry.
 * Particularly useful for:
 * - Fire/flame effects (sun shards)
 * - Glass/crystal shattering
 * - Energy/magic particles
 * - Any effect where hard polygon edges are undesirable
 *
 * ## Requirements
 *
 * Geometry must have a 'barycentric' attribute (vec3 per vertex).
 * Use addBarycentricCoordinates() to add this to any geometry.
 */

import * as THREE from 'three';

/**
 * Add barycentric coordinates to a geometry
 * Converts indexed geometry to non-indexed and assigns barycentric coords per triangle
 *
 * @param {THREE.BufferGeometry} geometry - Geometry to modify (will be converted to non-indexed)
 * @returns {THREE.BufferGeometry} The modified geometry (same reference, mutated)
 */
export function addBarycentricCoordinates(geometry) {
    // Convert to non-indexed if needed (barycentric coords require unique vertices per triangle)
    if (geometry.index !== null) {
        geometry = geometry.toNonIndexed();
    }

    const position = geometry.getAttribute('position');
    const { count } = position;

    // Each triangle needs vertices with barycentric coords (1,0,0), (0,1,0), (0,0,1)
    const barycentric = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 3) {
        // Vertex 0 of triangle
        barycentric[i * 3 + 0] = 1;
        barycentric[i * 3 + 1] = 0;
        barycentric[i * 3 + 2] = 0;

        // Vertex 1 of triangle
        barycentric[(i + 1) * 3 + 0] = 0;
        barycentric[(i + 1) * 3 + 1] = 1;
        barycentric[(i + 1) * 3 + 2] = 0;

        // Vertex 2 of triangle
        barycentric[(i + 2) * 3 + 0] = 0;
        barycentric[(i + 2) * 3 + 1] = 0;
        barycentric[(i + 2) * 3 + 2] = 1;
    }

    geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentric, 3));

    return geometry;
}

/**
 * Apply soft edge effect to a material using shader injection
 * The material will fade alpha based on distance from polygon edges
 *
 * @param {THREE.Material} material - Material to modify (mutates the material)
 * @param {Object} options - Configuration options
 * @param {number} [options.fadeWidth=0.15] - Edge fade width (0-1, higher = softer edges)
 * @param {number} [options.fadeExponent=1.0] - Fade curve exponent (higher = sharper falloff)
 * @returns {THREE.Material} The modified material (same reference)
 */
export function applySoftEdge(material, options = {}) {
    const { fadeWidth = 0.15, fadeExponent = 1.0 } = options;

    // Store original onBeforeCompile if it exists
    const originalOnBeforeCompile = material.onBeforeCompile;

    material.onBeforeCompile = shader => {
        // Call original if it existed
        if (originalOnBeforeCompile) {
            originalOnBeforeCompile(shader);
        }

        // Add barycentric attribute and varying to vertex shader
        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `attribute vec3 barycentric;
varying vec3 vBarycentric;

void main() {
    vBarycentric = barycentric;`
        );

        // Add varying declaration to fragment shader
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `varying vec3 vBarycentric;

void main() {`
        );

        // Calculate edge distance and apply fade to BOTH RGB and alpha
        // Must be AFTER output_fragment so we can modify gl_FragColor
        // Fading RGB is critical for additive blending where alpha may be ignored
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <output_fragment>',
            `#include <output_fragment>

    // Soft edge calculation - fade based on distance from polygon edge
    float edgeDist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
    float edgeFade = smoothstep(0.0, ${fadeWidth.toFixed(4)}, edgeDist);
    edgeFade = pow(edgeFade, ${fadeExponent.toFixed(4)});

    // Apply edge fade to BOTH RGB and alpha
    // RGB fade is critical for additive blending (alpha may be ignored)
    gl_FragColor.rgb *= edgeFade;
    gl_FragColor.a *= edgeFade;`
        );
    };

    // Mark material as needing update
    material.needsUpdate = true;

    // CRITICAL: Force unique shader program to bypass Three.js shader cache
    // Without this, cloned materials may reuse cached shader without our injection
    const uniqueId = Math.random().toString(36).substring(7);
    material.customProgramCacheKey = function () {
        return `softEdge_${fadeWidth}_${fadeExponent}_${uniqueId}`;
    };

    // Store soft edge config for potential later adjustment
    material.userData.softEdge = { fadeWidth, fadeExponent };

    return material;
}

/**
 * Check if a geometry has barycentric coordinates
 * @param {THREE.BufferGeometry} geometry
 * @returns {boolean}
 */
export function hasBarycentricCoordinates(geometry) {
    return geometry.hasAttribute('barycentric');
}

/**
 * Create a soft-edged clone of a material
 * Useful when you don't want to modify the original material
 *
 * @param {THREE.Material} material - Material to clone and modify
 * @param {Object} options - Soft edge options (see applySoftEdge)
 * @returns {THREE.Material} New material with soft edges
 */
export function createSoftEdgeMaterial(material, options = {}) {
    const cloned = material.clone();
    return applySoftEdge(cloned, options);
}

export default {
    addBarycentricCoordinates,
    applySoftEdge,
    hasBarycentricCoordinates,
    createSoftEdgeMaterial,
};
