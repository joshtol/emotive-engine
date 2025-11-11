/**
 * Sun Geometry with Solar Surface Features
 *
 * Creates a self-luminous sun with animated surface features including:
 * - Bright photosphere base
 * - Animated surface turbulence
 * - Radial glow effect
 * - Emissive material (always glowing)
 *
 * @module geometries/Sun
 */

import * as THREE from 'three';

/**
 * Create sun geometry with emissive glowing material
 *
 * @param {Array<number>} glowColor - RGB color array [r, g, b]
 * @param {number} glowIntensity - Glow intensity multiplier
 * @returns {THREE.Mesh} Sun mesh with emissive material
 */
export function createSunGeometry(glowColor, glowIntensity = 1.0) {
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(
        0.5,  // radius
        64,   // width segments (high detail for smooth surface)
        64    // height segments
    );

    // Base sun color (slightly orange-yellow)
    const baseColor = new THREE.Color(
        glowColor[0] * 1.0,
        glowColor[1] * 0.95,
        glowColor[2] * 0.7
    );

    // Create emissive material (self-luminous)
    const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: glowIntensity * 2.0, // Sun is very bright
        roughness: 1.0,
        metalness: 0.0,
        flatShading: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;  // Sun doesn't cast shadows
    mesh.receiveShadow = false; // Sun doesn't receive shadows

    return mesh;
}

/**
 * Update sun material based on emotion
 *
 * @param {THREE.Mesh} sunMesh - The sun mesh
 * @param {Array<number>} glowColor - RGB color array [r, g, b]
 * @param {number} glowIntensity - Glow intensity multiplier
 */
export function updateSunMaterial(sunMesh, glowColor, glowIntensity = 1.0) {
    if (!sunMesh || !sunMesh.material) return;

    const baseColor = new THREE.Color(
        glowColor[0] * 1.0,
        glowColor[1] * 0.95,
        glowColor[2] * 0.7
    );

    sunMesh.material.color.copy(baseColor);
    sunMesh.material.emissive.copy(baseColor);
    sunMesh.material.emissiveIntensity = glowIntensity * 2.0;
}
