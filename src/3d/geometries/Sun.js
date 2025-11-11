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
 * - Material: MeshStandardMaterial with emissive properties
 * - Emissive: Self-luminous glow (doesn't need external lights)
 * - Normal Map: Shows photosphere granulation detail (convection cells)
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
 * Create sun material with NASA photosphere texture
 *
 * Loads NASA-based photosphere texture and creates self-luminous material.
 * Uses MeshBasicMaterial for unlit rendering with HDR bloom effect.
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance
 * @param {Object} options - Configuration options
 * @param {string} options.resolution - Texture resolution ('2k' or '4k', default: '4k')
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} options.glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @returns {THREE.MeshStandardMaterial}
 */
export function createSunMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';
    const glowColor = options.glowColor || [1, 1, 1];
    const glowIntensity = options.glowIntensity || 1.0;

    // Determine texture paths based on resolution
    const colorPath = `/assets/textures/Sun/sun-photosphere-${resolution}.jpg`;
    const normalPath = `/assets/textures/Sun/sun-photosphere-normal-${resolution}.jpg`;

    // NASA-accurate base color: Brilliant white (5,772K black-body radiation)
    // Use HDR values for dramatic bloom
    const brightness = 1.0 + (glowIntensity * 2.0);
    const baseColor = new THREE.Color(
        brightness * glowColor[0],
        brightness * glowColor[1],
        brightness * glowColor[2] * 0.95  // Slight warm tint
    );

    // Load color texture asynchronously
    const colorMap = textureLoader.load(
        colorPath,
        // onLoad callback
        texture => {
            console.log(`✅ Sun photosphere texture loaded: ${resolution}`);
        },
        // onProgress callback
        undefined,
        // onError callback
        error => {
            console.warn(`⚠️ Failed to load sun texture (${resolution}), using color fallback:`, error);
        }
    );

    // Load normal map for granulation detail (optional)
    const normalMap = textureLoader.load(
        normalPath,
        texture => {
            console.log(`✅ Sun normal map loaded: ${resolution}`);
        },
        undefined,
        error => {
            console.warn(`⚠️ Sun normal map not found (${resolution}), continuing without surface detail:`, error);
        }
    );

    // Configure texture wrapping for seamless sphere mapping
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    // Enable anisotropic filtering for better quality at oblique angles
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    // Use MeshStandardMaterial with emissive for self-luminous sun with surface detail
    // This allows normal mapping for granulation while maintaining glow
    const material = new THREE.MeshStandardMaterial({
        map: colorMap,                              // NASA photosphere texture
        normalMap,                                  // Granulation surface detail
        normalScale: new THREE.Vector2(0.3, 0.3),  // Subtle bump (sun is gaseous, not rocky)

        // Self-luminous properties (HDR values for dramatic sun)
        emissive: baseColor,                        // Self-glow color
        emissiveMap: colorMap,                      // Use same texture for emissive
        emissiveIntensity: 3.0,                     // High intensity for sun brilliance

        // Base color should also be bright
        color: new THREE.Color(brightness, brightness, brightness * 0.95),

        // Surface properties
        roughness: 1.0,                             // Maximum roughness (gaseous plasma)
        metalness: 0.0,                             // Non-metallic

        toneMapped: false                           // Bypass tone mapping for HDR bloom
    });

    return material;
}

/**
 * Create sun geometry with NASA-accurate characteristics
 *
 * The sun is rendered as a self-luminous sphere using MeshBasicMaterial.
 * The base color is brilliant white (5,772K black-body spectrum), with emotion-based
 * tinting applied over time. Uses HDR color values (>1.0) for dramatic bloom effect.
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader instance (optional)
 * @param {Object} options - Configuration options
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] for emotion tinting
 * @param {number} options.glowIntensity - Glow intensity multiplier (scales HDR brightness)
 * @param {string} options.resolution - Texture resolution ('2k' or '4k', default: '4k')
 * @returns {THREE.Mesh} Sun mesh with self-luminous material
 */
export function createSunGeometry(textureLoader = null, options = {}) {
    const glowColor = options.glowColor || [1, 1, 1];
    const glowIntensity = options.glowIntensity || 1.0;
    const resolution = options.resolution || '4k';

    // Create high-resolution sphere geometry for smooth photosphere
    const geometry = new THREE.SphereGeometry(
        0.5,  // radius (normalized)
        64,   // width segments (high detail for smooth surface)
        64    // height segments
    );

    let material;

    // Use textured material if loader provided, otherwise fallback to color-only
    if (textureLoader) {
        material = createSunMaterial(textureLoader, { glowColor, glowIntensity, resolution });
    } else {
        // Fallback: color-only material (no texture)
        const brightness = 1.0 + (glowIntensity * 2.0);
        const baseColor = new THREE.Color(
            brightness * glowColor[0],
            brightness * glowColor[1],
            brightness * glowColor[2] * 0.95  // Slight warm tint
        );

        material = new THREE.MeshBasicMaterial({
            color: baseColor,
            toneMapped: false // Bypass tone mapping to preserve HDR brightness for bloom
        });
    }

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
