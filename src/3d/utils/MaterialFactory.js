/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Material Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Centralized factory for creating geometry-specific materials
 * @author Emotive Engine Team
 * @module 3d/utils/MaterialFactory
 *
 * Handles creation of custom materials (moon, sun, black hole, etc.) during
 * geometry initialization and morphing transitions.
 */

import * as THREE from 'three';
import { createMoonShadowMaterial } from '../geometries/Moon.js';
import { createSunMaterial } from '../geometries/Sun.js';

/**
 * Create custom material for a geometry type
 * @param {string} geometryType - Geometry type (e.g., 'moon', 'sun', 'blackhole')
 * @param {Object} geometryConfig - Geometry configuration from THREE_GEOMETRIES
 * @param {Object} options - Material creation options
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] (0-1 range)
 * @param {number} options.glowIntensity - Glow intensity (default: 1.0)
 * @returns {Object|null} Material object with { material, type } or null if no custom material
 */
export function createCustomMaterial(geometryType, geometryConfig, options = {}) {
    const { glowColor = [1.0, 1.0, 0.95], glowIntensity = 1.0 } = options;

    // Check if geometry requires custom material
    if (geometryConfig.material === 'custom') {
        return createCustomTypeMaterial(geometryType, glowColor, glowIntensity);
    }

    // Check if geometry requires emissive material
    if (geometryConfig.material === 'emissive') {
        return createEmissiveMaterial(geometryType, glowColor, glowIntensity);
    }

    // No custom material needed
    return null;
}

/**
 * Create custom-type materials (moon, etc.)
 * @private
 */
function createCustomTypeMaterial(geometryType, glowColor, glowIntensity) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'moon':
        return createMoonMaterial(textureLoader, glowColor, glowIntensity);

        // Future: Add more custom materials here
        // case 'blackhole':
        //     return createBlackHoleMaterial(textureLoader, glowColor, glowIntensity);

    default:
        console.warn(`Unknown custom material type: ${geometryType}`);
        return null;
    }
}

/**
 * Create emissive-type materials (sun, etc.)
 * @private
 */
function createEmissiveMaterial(geometryType, glowColor, glowIntensity) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'sun':
        return createSunMaterialWrapper(textureLoader, glowColor, glowIntensity);

        // Future: Add more emissive materials here
        // case 'star':
        //     return createStarMaterial(textureLoader, glowColor, glowIntensity);

    default:
        console.warn(`Unknown emissive material type: ${geometryType}`);
        return null;
    }
}

/**
 * Create moon material with shadow support
 * @private
 */
function createMoonMaterial(textureLoader, glowColor, glowIntensity) {
    // Detect device for resolution selection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const resolution = isMobile ? '2k' : '4k';

    console.log(`🌙 Creating moon material (${resolution})...`);

    const material = createMoonShadowMaterial(textureLoader, {
        resolution,
        glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
        glowIntensity,
        shadowOffsetX: 0.7,  // Offset to the right
        shadowOffsetY: 0.0,
        shadowCoverage: 1.0  // Not used for now - hardcoded in shader
    });

    return {
        material,
        type: 'moon'
    };
}

/**
 * Create sun material with NASA photosphere texture
 * @private
 */
function createSunMaterialWrapper(textureLoader, glowColor, glowIntensity) {
    console.log('☀️ Creating sun material (NASA photosphere: 5,772K)...');

    const material = createSunMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        resolution: '4k'
    });

    console.log('🔥 Sun material created with surface-mapped fire animation');

    return {
        material,
        type: 'sun'
    };
}

/**
 * Dispose custom material properly
 * @param {Object} customMaterial - Material to dispose
 */
export function disposeCustomMaterial(customMaterial) {
    if (!customMaterial) return;

    // Dispose individual textures first
    if (customMaterial.map) {
        customMaterial.map.dispose();
    }
    if (customMaterial.normalMap) {
        customMaterial.normalMap.dispose();
    }

    // Dispose any other common textures
    if (customMaterial.emissiveMap) {
        customMaterial.emissiveMap.dispose();
    }
    if (customMaterial.roughnessMap) {
        customMaterial.roughnessMap.dispose();
    }
    if (customMaterial.metalnessMap) {
        customMaterial.metalnessMap.dispose();
    }
}

export default { createCustomMaterial, disposeCustomMaterial };
