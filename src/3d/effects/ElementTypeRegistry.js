/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Type Registry
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Registry for element types (fire, water, ice, etc.)
 * @module effects/ElementTypeRegistry
 *
 * Provides a central registry for element type configurations, enabling:
 * - Dynamic registration of new element types
 * - Decoupling of ElementInstancedSpawner from specific element implementations
 * - Clean extension point for adding water, ice, lightning, etc.
 *
 * Each element type defines:
 * - basePath: Path to model assets
 * - models: Array of .glb model filenames
 * - createMaterial: Factory function for instanced material
 * - updateMaterial: Per-frame material update function
 * - setShaderAnimation: Optional shader configuration (e.g., arc animations)
 * - scaleMultiplier: Default scale multiplier for this element type
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// REGISTRY STORAGE
// ═══════════════════════════════════════════════════════════════════════════════════════

const _registry = new Map();

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELEMENT TYPE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Registry for element type configurations.
 *
 * @example
 * // Register a new element type
 * ElementTypeRegistry.register('water', {
 *     basePath: 'models/Elements/Water/',
 *     models: ['droplet-small.glb', 'splash-ring.glb'],
 *     createMaterial: createInstancedWaterMaterial,
 *     updateMaterial: updateInstancedWaterMaterial,
 *     scaleMultiplier: 1.2
 * });
 *
 * // Check if element type exists
 * if (ElementTypeRegistry.has('fire')) { ... }
 *
 * // Get element configuration
 * const config = ElementTypeRegistry.get('fire');
 */
export const ElementTypeRegistry = {
    /**
     * Register an element type configuration.
     * @param {string} type - Element type identifier (e.g., 'fire', 'water')
     * @param {Object} config - Element configuration
     * @param {string} config.basePath - Base path for model assets
     * @param {string[]} config.models - Array of model filenames
     * @param {Function} config.createMaterial - Factory for instanced material
     * @param {Function} config.updateMaterial - Per-frame material updater
     * @param {Function} [config.setShaderAnimation] - Optional shader animation setter
     * @param {number} [config.scaleMultiplier=1.5] - Default scale multiplier
     * @throws {Error} If required fields are missing
     */
    register(type, config) {
        // Validate required fields
        const required = ['basePath', 'models', 'createMaterial', 'updateMaterial'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`[ElementTypeRegistry] Missing required field '${field}' for type '${type}'`);
            }
        }

        // Store with defaults
        _registry.set(type, {
            scaleMultiplier: 1.5,
            setShaderAnimation: null,
            ...config
        });

        console.log(`[ElementTypeRegistry] Registered element type: ${type} (${config.models.length} models)`);
    },

    /**
     * Get configuration for an element type.
     * @param {string} type - Element type identifier
     * @returns {Object|undefined} Element configuration or undefined if not registered
     */
    get(type) {
        return _registry.get(type);
    },

    /**
     * Check if an element type is registered.
     * @param {string} type - Element type identifier
     * @returns {boolean}
     */
    has(type) {
        return _registry.has(type);
    },

    /**
     * Get all registered element type names.
     * @returns {string[]}
     */
    types() {
        return Array.from(_registry.keys());
    },

    /**
     * Unregister an element type (primarily for testing).
     * @param {string} type - Element type identifier
     * @returns {boolean} True if type was registered
     */
    unregister(type) {
        return _registry.delete(type);
    },

    /**
     * Clear all registrations (primarily for testing).
     */
    clear() {
        _registry.clear();
    }
};

export default ElementTypeRegistry;
