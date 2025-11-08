/**
 * Moon Geometry with NASA Texture Maps
 *
 * Uses authentic NASA Lunar Reconnaissance Orbiter data:
 * - Color map: LROC Wide Angle Camera imagery
 * - Normal map: Generated from LOLA laser altimeter elevation data
 *
 * @module geometries/Moon
 */

import * as THREE from 'three';
import { getShadowShaders } from '../shaders/index.js';

/**
 * Create moon sphere geometry
 * Uses high segment count for smooth normals and proper texture mapping
 *
 * @param {number} widthSegments - Horizontal segments (default: 64 for smooth look)
 * @param {number} heightSegments - Vertical segments (default: 64)
 * @returns {THREE.SphereGeometry}
 */
export function createMoon(widthSegments = 64, heightSegments = 64) {
    return new THREE.SphereGeometry(
        0.9,           // radius 0.9 = 1.8 diameter (matches crystal height)
        widthSegments, // 64 segments for smooth normal mapping
        heightSegments
    );
}

/**
 * Create moon material with NASA texture maps
 * Loads color and normal maps asynchronously
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material configuration options
 * @param {string} options.resolution - Texture resolution: '2k' or '4k' (default: '4k')
 * @param {THREE.Color} options.glowColor - Emissive glow color (default: white)
 * @param {number} options.glowIntensity - Emissive intensity (default: 0)
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMoonMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';
    const glowColor = options.glowColor || new THREE.Color(0xffffff);
    const glowIntensity = options.glowIntensity || 0;

    // Determine texture paths based on resolution
    const colorPath = `/assets/textures/Moon/moon-color-${resolution}.jpg`;
    const normalPath = `/assets/textures/Moon/moon-normal-${resolution}.jpg`;

    // Load textures asynchronously
    const colorMap = textureLoader.load(
        colorPath,
        // onLoad callback
        texture => {
            console.log(`✅ Moon color texture loaded: ${resolution}`);
        },
        // onProgress callback
        undefined,
        // onError callback
        error => {
            console.error(`❌ Failed to load moon color texture (${resolution}):`, error);
        }
    );

    const normalMap = textureLoader.load(
        normalPath,
        texture => {
            console.log(`✅ Moon normal map loaded: ${resolution}`);
        },
        undefined,
        error => {
            console.error(`❌ Failed to load moon normal map (${resolution}):`, error);
        }
    );

    // Configure texture wrapping for seamless sphere mapping
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

    // Enable anisotropic filtering for better quality at oblique angles
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    // Create physically-based material with NASA textures
    const material = new THREE.MeshStandardMaterial({
        // Base color from NASA LROC imagery
        map: colorMap,

        // Surface detail from LOLA elevation data
        normalMap,
        normalScale: new THREE.Vector2(1.5, 1.5), // Adjust bump intensity (1.0 = subtle, 2.0 = pronounced)

        // Material properties for realistic lunar surface
        roughness: 0.7,    // Slightly less rough for more brightness
        metalness: 0.0,    // Non-metallic (moon rock is not metal)

        // Emissive glow (controlled by emotion system) - brightened for visibility
        emissive: new THREE.Color(0.3, 0.3, 0.3), // Base gray glow for brightness
        emissiveIntensity: 0.5,  // Boost base brightness

        // Enable transparency for future shader-based crescent clipping
        transparent: false, // Will be true in Phase 3 with shader material
        side: THREE.FrontSide
    });

    return material;
}

/**
 * Create fallback gray material for moon
 * Used as placeholder while textures load or if loading fails
 *
 * @param {THREE.Color} glowColor - Emissive glow color
 * @param {number} glowIntensity - Emissive intensity
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMoonFallbackMaterial(glowColor = new THREE.Color(0xffffff), glowIntensity = 0) {
    return new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,      // Light gray moon surface (matches 2D version)
        roughness: 0.9,
        metalness: 0.0,
        emissive: glowColor,
        emissiveIntensity: glowIntensity
    });
}

/**
 * Create moon material with shader-based shadow effects
 * Supports multiple shadow types: crescent, lunar-eclipse, solar-eclipse, black-hole
 *
 * @param {THREE.TextureLoader} textureLoader - Three.js texture loader
 * @param {Object} options - Material configuration options
 * @param {string} options.resolution - Texture resolution: '2k' or '4k' (default: '4k')
 * @param {THREE.Color} options.glowColor - Emissive glow color (default: white)
 * @param {number} options.glowIntensity - Emissive intensity (default: 1.0)
 * @param {string} options.shadowType - Shadow effect type: 'crescent', 'lunar-eclipse', 'solar-eclipse', 'black-hole' (default: 'crescent')
 * @param {number} options.shadowOffsetX - Shadow X offset/direction (default: 0.7)
 * @param {number} options.shadowOffsetY - Shadow Y offset/direction (default: 0.0)
 * @param {number} options.shadowCoverage - Shadow coverage 0-1 (default: 0.85)
 * @returns {THREE.ShaderMaterial}
 */
export function createMoonShadowMaterial(textureLoader, options = {}) {
    const resolution = options.resolution || '4k';
    const glowColor = options.glowColor || new THREE.Color(1, 1, 1);
    const glowIntensity = options.glowIntensity || 1.0;
    const shadowType = options.shadowType || 'crescent';
    const shadowOffsetX = options.shadowOffsetX !== undefined ? options.shadowOffsetX : 0.7;
    const shadowOffsetY = options.shadowOffsetY !== undefined ? options.shadowOffsetY : 0.0;
    const shadowCoverage = options.shadowCoverage !== undefined ? options.shadowCoverage : 0.85;

    // Determine texture paths
    const colorPath = `/assets/textures/Moon/moon-color-${resolution}.jpg`;
    const normalPath = `/assets/textures/Moon/moon-normal-${resolution}.jpg`;

    // Get shaders based on shadow type
    const { vertexShader, fragmentShader } = getShadowShaders(shadowType);

    // Create shader material with placeholder textures
    const material = new THREE.ShaderMaterial({
        uniforms: {
            colorMap: { value: null },
            normalMap: { value: null },
            shadowOffset: { value: new THREE.Vector2(shadowOffsetX, shadowOffsetY) },
            shadowCoverage: { value: shadowCoverage },
            shadowSoftness: { value: 0.05 }, // Edge blur amount
            glowColor: { value: glowColor },
            glowIntensity: { value: glowIntensity }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.FrontSide
    });

    // Load textures and update material when ready
    const colorMap = textureLoader.load(
        colorPath,
        texture => {
            console.log(`✅ Moon crescent color texture loaded: ${resolution}`);
            material.uniforms.colorMap.value = texture;
            material.needsUpdate = true;
        },
        undefined,
        error => console.error('❌ Failed to load moon crescent color texture:', error)
    );

    const normalMap = textureLoader.load(
        normalPath,
        texture => {
            console.log(`✅ Moon crescent normal map loaded: ${resolution}`);
            material.uniforms.normalMap.value = texture;
            material.needsUpdate = true;
        },
        undefined,
        error => console.error('❌ Failed to load moon crescent normal map:', error)
    );

    // Configure textures
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    colorMap.anisotropy = 16;
    normalMap.anisotropy = 16;

    console.log(`🌙 Moon shadow material created with '${shadowType}' shader`);
    console.log('   Shadow offset:', shadowOffsetX, shadowOffsetY);
    console.log('   Shadow coverage:', shadowCoverage);

    return material;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use createMoonShadowMaterial() instead
 */
export function createMoonCrescentMaterial(textureLoader, options = {}) {
    return createMoonShadowMaterial(textureLoader, { ...options, shadowType: 'crescent' });
}

/**
 * Update moon material glow (called by emotion system)
 * Works with both MeshStandardMaterial and ShaderMaterial
 *
 * @param {THREE.Material} material - Moon material to update
 * @param {THREE.Color} glowColor - New glow color
 * @param {number} glowIntensity - New glow intensity
 */
export function updateMoonGlow(material, glowColor, glowIntensity) {
    // Standard material (Phase 2)
    if (material.emissive) {
        material.emissive.copy(glowColor);
        material.emissiveIntensity = glowIntensity;
    }

    // Shader material (Phase 3)
    if (material.uniforms && material.uniforms.glowColor) {
        material.uniforms.glowColor.value.copy(glowColor);
        material.uniforms.glowIntensity.value = glowIntensity;
    }
}

/**
 * Update crescent shadow parameters
 *
 * @param {THREE.ShaderMaterial} material - Moon crescent shader material
 * @param {number} offsetX - Shadow X offset
 * @param {number} offsetY - Shadow Y offset
 * @param {number} coverage - Shadow coverage (0=full moon, 1=new moon)
 */
export function updateCrescentShadow(material, offsetX, offsetY, coverage) {
    if (material.uniforms && material.uniforms.shadowOffset) {
        material.uniforms.shadowOffset.value.set(offsetX, offsetY);
        material.uniforms.shadowCoverage.value = coverage;
    }
}
