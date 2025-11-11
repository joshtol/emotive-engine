/**
 * Sun Geometry with NASA-Accurate Photosphere Characteristics
 *
 * Based on NASA Solar Dynamics Observatory (SDO) data and solar physics:
 *
 * PHOTOSPHERE CHARACTERISTICS (NASA):
 * - Temperature: 5,772 K (5,500°C / 10,000°F) - Official NASA effective temperature
 * - Color: Brilliant white (black-body spectrum at 5,772K)
 * - Thickness: 100-400 km
 * - Composition: 74.9% Hydrogen, 23.8% Helium
 * - Surface features: Granules (convection cells ~1,000 km diameter)
 *
 * VISUAL PROPERTIES:
 * - Self-luminous (MeshBasicMaterial - unlit, always at full brightness)
 * - No shadows cast or received (sun is light source)
 * - Radial bloom effect from HDR color values + UnrealBloomPass
 * - Emotion-responsive color tinting over base brilliant white
 * - toneMapped: false to preserve HDR brightness values for bloom
 *
 * THREE.JS IMPLEMENTATION:
 * - Material: MeshBasicMaterial (not MeshStandardMaterial)
 * - Reason: Sun is self-luminous and doesn't need external lights
 * - toneMapped: false allows HDR values > 1.0 for dramatic bloom
 * - UnrealBloomPass creates the radiant glow effect
 *
 * References:
 * - NASA Sun Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
 * - NASA Solar Dynamics Observatory: https://sdo.gsfc.nasa.gov/
 * - NASA Sun Facts: https://science.nasa.gov/sun/facts/
 *
 * @module geometries/Sun
 */

import * as THREE from 'three';

/**
 * NASA-accurate photosphere effective temperature in Kelvin
 * Source: NASA Sun Fact Sheet (official)
 */
export const SUN_PHOTOSPHERE_TEMP_K = 5772;

/**
 * Create sun geometry with NASA-accurate characteristics
 *
 * The sun is rendered as a self-luminous sphere using MeshBasicMaterial.
 * The base color is brilliant white (5,772K black-body spectrum), with emotion-based
 * tinting applied over time. Uses HDR color values (>1.0) for dramatic bloom effect.
 *
 * @param {Array<number>} glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @returns {THREE.Mesh} Sun mesh with self-luminous material
 */
export function createSunGeometry(glowColor, glowIntensity = 1.0) {
    // Create high-resolution sphere geometry for smooth photosphere
    const geometry = new THREE.SphereGeometry(
        0.5,  // radius (normalized)
        64,   // width segments (high detail for smooth surface)
        64    // height segments
    );

    // NASA-accurate base color: Brilliant white (5,772K black-body radiation)
    // Use HDR values for dramatic bloom
    const brightness = 1.0 + (glowIntensity * 2.0);
    const baseColor = new THREE.Color(
        brightness,
        brightness,
        brightness * 0.95  // Slight warm tint
    );

    // Apply emotion tinting if provided
    if (glowColor && glowColor.length === 3) {
        baseColor.r *= glowColor[0];
        baseColor.g *= glowColor[1];
        baseColor.b *= glowColor[2];
    }

    // Use MeshBasicMaterial for self-luminous sun (unlit, always at full brightness)
    // This is essential - MeshBasicMaterial doesn't need lights and always renders at full color
    const material = new THREE.MeshBasicMaterial({
        color: baseColor,
        toneMapped: false // Bypass tone mapping to preserve HDR brightness for bloom
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;  // Sun doesn't cast shadows (it IS the light source)
    mesh.receiveShadow = false; // Sun doesn't receive shadows

    return mesh;
}

/**
 * Update sun material based on emotion state
 *
 * Applies emotion-based color tinting and HDR brightness over the NASA-accurate white base.
 * The sun remains predominantly brilliant white but takes on emotional hues and intensity.
 * Uses HDR color values (>1.0) for dramatic bloom effect.
 *
 * @param {THREE.Mesh} sunMesh - The sun mesh to update
 * @param {Array<number>} glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} glowIntensity - Glow intensity multiplier (scales HDR brightness)
 */
export function updateSunMaterial(sunMesh, glowColor, glowIntensity = 1.0) {
    if (!sunMesh || !sunMesh.material) return;

    // Start with NASA-accurate brilliant white (5,772K photosphere)
    // Scale by intensity for HDR bloom effect
    const brightness = 1.0 + (glowIntensity * 2.0);
    const baseColor = new THREE.Color(
        brightness,
        brightness,
        brightness * 0.95  // Slight warm tint
    );

    // Apply emotion tinting
    if (glowColor && glowColor.length === 3) {
        baseColor.r *= glowColor[0];
        baseColor.g *= glowColor[1];
        baseColor.b *= glowColor[2];
    }

    sunMesh.material.color.copy(baseColor);
}
