/**
 * BaseSpawnMode - Abstract base class for spawn mode implementations
 *
 * Each spawn mode handles positioning and updating elements in a specific way:
 * - OrbitMode: Elements orbit around the mascot
 * - SurfaceMode: Elements spawn on the mascot surface
 * - AxisTravelMode: Elements travel along an axis over time
 * - AnchorMode: Elements anchored at landmark positions
 *
 * @module spawn-modes/BaseSpawnMode
 */

/**
 * Abstract base class for spawn modes
 * @abstract
 */
export class BaseSpawnMode {
    /**
     * @param {Object} spawner - Reference to ElementSpawner instance
     * @param {MascotSpatialRef} spatialRef - Spatial reference for landmarks
     */
    constructor(spawner, spatialRef) {
        if (new.target === BaseSpawnMode) {
            throw new Error('BaseSpawnMode is abstract and cannot be instantiated directly');
        }

        /**
         * Reference to the ElementSpawner
         * @type {Object}
         * @protected
         */
        this.spawner = spawner;

        /**
         * Spatial reference for landmark resolution
         * @type {MascotSpatialRef}
         * @protected
         */
        this.spatialRef = spatialRef;
    }

    /**
     * Parse mode-specific configuration
     * @param {Object} config - Raw spawn mode configuration
     * @returns {Object} Parsed configuration with resolved values
     * @abstract
     */
    parseConfig(config) {
        throw new Error('parseConfig must be implemented by subclass');
    }

    /**
     * Position an element during spawn
     * @param {THREE.Mesh} mesh - The mesh to position
     * @param {Object} config - Parsed configuration
     * @param {number} index - Element index in spawn batch
     * @abstract
     */
    positionElement(mesh, config, index) {
        throw new Error('positionElement must be implemented by subclass');
    }

    /**
     * Update an element each frame
     * @param {THREE.Mesh} mesh - The mesh to update
     * @param {number} deltaTime - Time since last frame (seconds)
     * @param {number} gestureProgress - Current gesture progress (0-1)
     * @abstract
     */
    updateElement(mesh, deltaTime, gestureProgress) {
        throw new Error('updateElement must be implemented by subclass');
    }

    /**
     * Check if this mode requires per-frame updates
     * Override in subclasses that have dynamic positioning
     * @returns {boolean} True if updateElement should be called each frame
     */
    requiresUpdate() {
        return false;
    }

    /**
     * Get the mode type identifier
     * @returns {string} Mode type name
     * @abstract
     */
    static get modeType() {
        throw new Error('modeType getter must be implemented by subclass');
    }
}

export default BaseSpawnMode;
