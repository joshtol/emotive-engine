/**
 * GeometryCache - Asset Caching for Geometry Morphing
 *
 * Caches heavy assets (geometries, textures, materials) to avoid
 * reloading during morph transitions. Assets are loaded once and
 * reused on subsequent morphs.
 */

import { THREE_GEOMETRIES } from '../geometries/ThreeGeometries.js';
import { createCustomMaterial, disposeCustomMaterial } from './MaterialFactory.js';

/**
 * Cache storage for geometry assets
 * Structure: { geometryType: { geometry, material, loaded: boolean } }
 */
const cache = new Map();

/**
 * Preload assets for a geometry type
 * @param {string} geometryType - The geometry type to preload (e.g., 'crystal', 'moon', 'sun')
 * @param {Object} options - Material creation options
 * @returns {Promise<Object>} - Cached assets { geometry, material }
 */
export async function preload(geometryType, options = {}) {
    // Return cached if already loaded
    if (cache.has(geometryType)) {
        const cached = cache.get(geometryType);
        if (cached.loaded) {
            return cached;
        }
    }

    const config = THREE_GEOMETRIES[geometryType];
    if (!config) {
        console.warn(`[GeometryCache] Unknown geometry type: ${geometryType}`);
        return null;
    }

    // Start loading
    const entry = {
        geometry: null,
        material: null,
        materialType: null,
        config,
        loaded: false
    };

    // Load geometry (may be async for OBJ models like crystal)
    if (config.geometryLoader) {
        entry.geometry = await config.geometryLoader(options.assetBasePath);
    } else {
        entry.geometry = config.geometry;
    }

    // Create material if needed
    if (config.material === 'custom' || config.material === 'emissive') {
        const materialResult = createCustomMaterial(geometryType, config, {
            glowColor: options.glowColor || [1.0, 1.0, 0.95],
            glowIntensity: options.glowIntensity || 1.0,
            materialVariant: options.materialVariant,
            emotionData: options.emotionData,
            assetBasePath: options.assetBasePath
        });

        if (materialResult) {
            entry.material = materialResult.material;
            entry.materialType = materialResult.type;
        }
    }

    entry.loaded = true;
    cache.set(geometryType, entry);

    return entry;
}

/**
 * Get cached assets for a geometry type
 * @param {string} geometryType - The geometry type
 * @returns {Object|null} - Cached assets or null if not loaded
 */
export function get(geometryType) {
    const entry = cache.get(geometryType);
    if (entry && entry.loaded) {
        return entry;
    }
    return null;
}

/**
 * Check if a geometry type is cached
 * @param {string} geometryType - The geometry type
 * @returns {boolean}
 */
export function has(geometryType) {
    const entry = cache.get(geometryType);
    return entry && entry.loaded;
}

/**
 * Update material options for a cached geometry (e.g., when emotion changes)
 * Does NOT recreate the material - just updates uniforms
 * @param {string} geometryType - The geometry type
 * @param {Object} options - New material options
 */
export function updateMaterialOptions(geometryType, options) {
    const entry = cache.get(geometryType);
    if (!entry || !entry.material) {
        return;
    }

    // Update uniforms directly on cached material
    const {uniforms} = entry.material;
    if (uniforms) {
        if (options.glowColor && uniforms.glowColor) {
            uniforms.glowColor.value.set(...options.glowColor);
        }
        if (options.glowIntensity !== undefined && uniforms.glowIntensity) {
            uniforms.glowIntensity.value = options.glowIntensity;
        }
    }
}

/**
 * Preload all supported geometry types
 * Call during app initialization for instant morphs
 * @param {Object} options - Material creation options
 * @returns {Promise<void>}
 */
export async function preloadAll(options = {}) {
    const types = ['crystal', 'rough', 'heart', 'moon', 'sun'];

    await Promise.all(types.map(type => preload(type, options)));

}

/**
 * Clear cache and dispose all assets
 * Call on app shutdown to free GPU memory
 */
export function dispose() {
    for (const [type, entry] of cache.entries()) {
        if (entry.material) {
            disposeCustomMaterial(entry.material);
            entry.material.dispose();
        }
        // Note: Don't dispose shared geometries from THREE_GEOMETRIES
    }
    cache.clear();
}

/**
 * Get cache status for debugging
 * @returns {Object} - Cache status
 */
export function getStatus() {
    const status = {};
    for (const [type, entry] of cache.entries()) {
        status[type] = {
            loaded: entry.loaded,
            hasGeometry: !!entry.geometry,
            hasMaterial: !!entry.material,
            materialType: entry.materialType
        };
    }
    return status;
}

export default {
    preload,
    preloadAll,
    get,
    has,
    updateMaterialOptions,
    dispose,
    getStatus
};
