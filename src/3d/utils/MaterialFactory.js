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
import { createMoonShadowMaterial, createMoonMultiplexerMaterial } from '../geometries/Moon.js';
import { createSunMaterial } from '../geometries/Sun.js';
import { createBlackHoleMaterial } from '../geometries/BlackHole.js';
import { getCrystalWithBlendLayersShaders, getCrystalDefaultUniforms } from '../shaders/crystalWithBlendLayers.js';

/**
 * Create custom material for a geometry type
 * @param {string} geometryType - Geometry type (e.g., 'moon', 'sun', 'blackhole')
 * @param {Object} geometryConfig - Geometry configuration from THREE_GEOMETRIES
 * @param {Object} options - Material creation options
 * @param {Array<number>} options.glowColor - RGB color array [r, g, b] (0-1 range)
 * @param {number} options.glowIntensity - Glow intensity (default: 1.0)
 * @param {string} options.materialVariant - Material variant (e.g., 'multiplexer' for moon)
 * @param {Object} options.emotionData - Emotion data for auto-deriving geometry params
 * @returns {Object|null} Material object with { material, type } or null if no custom material
 */
export function createCustomMaterial(geometryType, geometryConfig, options = {}) {
    const { glowColor = [1.0, 1.0, 0.95], glowIntensity = 1.0, materialVariant = null, emotionData = null } = options;

    // Check if geometry requires custom material
    if (geometryConfig.material === 'custom') {
        return createCustomTypeMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData);
    }

    // Check if geometry requires emissive material
    if (geometryConfig.material === 'emissive') {
        return createEmissiveMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData);
    }

    // No custom material needed
    return null;
}

/**
 * Create custom-type materials (moon, etc.)
 * @private
 */
function createCustomTypeMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'moon':
        return createMoonMaterial(textureLoader, glowColor, glowIntensity, materialVariant);

    case 'crystal':
    case 'diamond':
        // Crystal/diamond always use blend-layers shader
        return createCrystalMaterial(glowColor, glowIntensity, emotionData);

    default:
        console.warn(`Unknown custom material type: ${geometryType}`);
        return null;
    }
}

/**
 * Create emissive-type materials (sun, etc.)
 * @private
 */
function createEmissiveMaterial(geometryType, glowColor, glowIntensity, materialVariant, emotionData) {
    const textureLoader = new THREE.TextureLoader();

    switch (geometryType) {
    case 'sun':
        return createSunMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant, emotionData);

    case 'blackHole':
        return createBlackHoleMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant, emotionData);

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
function createMoonMaterial(textureLoader, glowColor, glowIntensity, materialVariant = null) {
    // Detect device for resolution selection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const resolution = isMobile ? '2k' : '4k';

    // Check for multiplexer variant
    if (materialVariant === 'multiplexer') {
        console.log(`🎨 Creating moon multiplexer material (${resolution})...`);

        const material = createMoonMultiplexerMaterial(textureLoader, {
            resolution,
            glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
            glowIntensity
        });

        return {
            material,
            type: 'moon-multiplexer'
        };
    }

    // Default: standard shadow material
    console.log(`🌙 Creating moon material (${resolution})...`);

    const material = createMoonShadowMaterial(textureLoader, {
        resolution,
        glowColor: new THREE.Color(glowColor[0], glowColor[1], glowColor[2]),
        glowIntensity,
        moonPhase: 'full' // Start with full moon (shadowOffset: 0, 0)
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
function createSunMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant = null, emotionData = null) {
    console.log('☀️ Creating sun material (NASA photosphere: 5,772K)...', materialVariant ? `[${materialVariant}]` : '[standard]');

    const material = createSunMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        resolution: '4k',
        materialVariant
    });

    console.log('🔥 Sun material created with surface-mapped fire animation');

    return {
        material,
        type: 'sun'
    };
}

/**
 * Create black hole material with NASA M87* EHT accuracy
 * @private
 */
function createBlackHoleMaterialWrapper(textureLoader, glowColor, glowIntensity, materialVariant = null, emotionData = null) {
    console.log('🕳️ Creating black hole material (M87* supermassive)...', materialVariant ? `[${materialVariant}]` : '[standard]');

    const { diskMaterial, shadowMaterial } = createBlackHoleMaterial(textureLoader, {
        glowColor,
        glowIntensity,
        materialVariant,
        emotionData  // Pass emotion data for auto-deriving params
    });

    console.log('🌀 Black hole materials created: accretion disk + event horizon shadow');

    // Return materials object for Core3DManager to apply to Group meshes
    // Core3DManager will handle applying these to the Group's child meshes
    return {
        material: {
            diskMaterial,
            shadowMaterial
        },
        type: 'blackHole'
    };
}

/**
 * Create crystal material with blend layers shader
 * @private
 */
function createCrystalMaterial(glowColor, glowIntensity, emotionData = null) {
    console.log('💎 Creating crystal blend layers material...');

    const shaders = getCrystalWithBlendLayersShaders();
    const uniforms = getCrystalDefaultUniforms();

    // Set color uniforms
    uniforms.baseColor.value = new THREE.Color(1.0, 1.0, 1.0);
    uniforms.emotionColor.value = new THREE.Color(glowColor[0], glowColor[1], glowColor[2]);
    uniforms.emissiveIntensity.value = glowIntensity * 2.0; // Boost for HDR bloom

    const material = new THREE.ShaderMaterial({
        vertexShader: shaders.vertexShader,
        fragmentShader: shaders.fragmentShader,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
        depthTest: true
    });

    console.log('✨ Crystal blend layers material created with 4 visual components');

    return {
        material,
        type: 'crystal-blend-layers'
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
