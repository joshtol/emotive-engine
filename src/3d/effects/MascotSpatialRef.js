/**
 * MascotSpatialRef - Provides spatial reference points for element positioning
 *
 * Calculates bounding box and named landmarks relative to the mascot mesh,
 * enabling effects to position elements at semantic locations like 'head',
 * 'bottom', 'top', etc.
 *
 * @module MascotSpatialRef
 */

/**
 * Mascot spatial reference system for landmark-based positioning
 */
export class MascotSpatialRef {
    constructor() {
        /**
         * Bounding box measurements in local space
         * @type {{minY: number, maxY: number, centerY: number, height: number}}
         */
        this.bounds = {
            minY: -0.5,
            maxY: 0.5,
            centerY: 0,
            height: 1
        };

        /**
         * Named landmark Y positions
         * @type {Object.<string, number>}
         */
        this.landmarks = {};

        /**
         * Mascot radius (from bounding sphere)
         * @type {number}
         */
        this.radius = 1.0;

        /**
         * Reference to the core mesh
         * @type {THREE.Mesh|null}
         * @private
         */
        this._coreMesh = null;
    }

    /**
     * Initialize spatial reference from a core mesh
     * @param {THREE.Mesh} coreMesh - The mascot mesh to calculate bounds from
     */
    initialize(coreMesh) {
        this._coreMesh = coreMesh;

        if (!coreMesh?.geometry) {
            console.warn('[MascotSpatialRef] No geometry available, using defaults');
            this._computeLandmarks();
            return;
        }

        const {geometry} = coreMesh;
        const {scale} = coreMesh;

        // Calculate bounding box
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }

        if (geometry.boundingBox) {
            const box = geometry.boundingBox;
            // Use UNSCALED geometry bounds - the spawner container applies mascot scale,
            // so element positions are in local space and will be scaled by the container
            this.bounds = {
                minY: box.min.y,
                maxY: box.max.y,
                centerY: (box.min.y + box.max.y) * 0.5,
                height: (box.max.y - box.min.y)
            };
        }

        // Calculate radius from bounding sphere
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }

        if (geometry.boundingSphere) {
            const avgScale = (scale.x + scale.y + scale.z) / 3;
            this.radius = geometry.boundingSphere.radius * avgScale;
        }

        // Ensure reasonable minimum radius (matches original ElementSpawner)
        this.radius = Math.max(0.1, this.radius);

        // Debug: log calculated radius
        console.log(`[MascotSpatialRef] Calculated radius: ${this.radius.toFixed(3)}`);

        this._computeLandmarks();
    }

    /**
     * Compute named landmark positions from bounds
     * @private
     */
    _computeLandmarks() {
        const b = this.bounds;
        const headOffset = b.height * 0.15; // 15% above top for halos

        this.landmarks = {
            bottom: b.minY,
            center: b.centerY,
            top: b.maxY,
            head: b.maxY + headOffset,
            // Additional useful landmarks
            feet: b.minY,                           // Alias for bottom
            middle: b.centerY,                      // Alias for center
            above: b.maxY + b.height * 0.3,         // Well above mascot
            below: b.minY - b.height * 0.2,         // Below mascot
        };
    }

    /**
     * Resolve a landmark name or numeric value to a Y position
     * @param {string|number} landmark - Landmark name ('top', 'bottom', etc.) or numeric Y value
     * @returns {number} Y position in local space
     */
    resolveLandmark(landmark) {
        if (typeof landmark === 'number') {
            return landmark;
        }

        if (typeof landmark === 'string' && Object.hasOwn(this.landmarks, landmark)) {
            return this.landmarks[landmark];
        }

        console.warn(`[MascotSpatialRef] Unknown landmark: ${landmark}, using center`);
        return this.bounds.centerY;
    }

    /**
     * Resolve a landmark with an optional offset
     * @param {string|number} landmark - Landmark name or numeric value
     * @param {number} [offset=0] - Additional offset to apply
     * @returns {number} Y position with offset applied
     */
    resolveLandmarkWithOffset(landmark, offset = 0) {
        return this.resolveLandmark(landmark) + offset;
    }

    /**
     * Get the interpolated Y position between two landmarks
     * @param {string|number} startLandmark - Starting landmark
     * @param {string|number} endLandmark - Ending landmark
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated Y position
     */
    interpolateLandmarks(startLandmark, endLandmark, t) {
        const startY = this.resolveLandmark(startLandmark);
        const endY = this.resolveLandmark(endLandmark);
        return startY + (endY - startY) * t;
    }

    /**
     * Check if a Y position is within the mascot bounds
     * @param {number} y - Y position to check
     * @returns {boolean} True if within bounds
     */
    isWithinBounds(y) {
        return y >= this.bounds.minY && y <= this.bounds.maxY;
    }

    /**
     * Get the progress (0-1) of a Y position through the mascot height
     * @param {number} y - Y position
     * @returns {number} Progress from bottom (0) to top (1)
     */
    getProgressAtY(y) {
        if (this.bounds.height === 0) return 0.5;
        return (y - this.bounds.minY) / this.bounds.height;
    }

    // Convenience getters for common landmarks
    get top() { return this.landmarks.top; }
    get bottom() { return this.landmarks.bottom; }
    get center() { return this.landmarks.center; }
    get head() { return this.landmarks.head; }
    get height() { return this.bounds.height; }

    /**
     * Update bounds if the mesh scale changes
     * Call this if the mascot is dynamically scaled
     */
    refresh() {
        if (this._coreMesh) {
            this.initialize(this._coreMesh);
        }
    }
}

export default MascotSpatialRef;
