/**
 * OffsetPositionManager - Eccentric Positioning and Offset Control
 *
 * Manages offset-based positioning for eccentric mascot placement.
 *
 * @module OffsetPositionManager
 */

export class OffsetPositionManager {
    /**
     * Create OffsetPositionManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.positionController - Position controller instance
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     *
     * @example
     * // New DI style:
     * new OffsetPositionManager({ errorBoundary, positionController })
     *
     * // Legacy style:
     * new OffsetPositionManager(mascot)
     */
    constructor(deps) {
        // Check for explicit DI style (has _diStyle marker property)
        if (deps && deps._diStyle === true) {
            // New DI style
            this.errorBoundary = deps.errorBoundary;
            this.positionController = deps.positionController;
            this._chainTarget = deps.chainTarget || this;
        } else {
            // Legacy: deps is mascot
            const mascot = deps;
            this.errorBoundary = mascot.errorBoundary;
            this.positionController = mascot.positionController;
            this._chainTarget = mascot;
            this._legacyMode = true;
        }
    }

    /**
     * Set offset values for eccentric positioning
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} z - Z offset (for pseudo-3D scaling)
     * @returns {Object} Chain target for method chaining
     */
    setOffset(x, y, z = 0) {
        return this.errorBoundary.wrap(() => {
            this.positionController.setOffset(x, y, z);
            return this._chainTarget;
        }, 'offset-setting', this._chainTarget)();
    }

    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     */
    getOffset() {
        return this.errorBoundary.wrap(() => {
            return this.positionController.getOffset();
        }, 'offset-getting', this._chainTarget)();
    }

    /**
     * Animate to new offset values
     * @param {number} x - Target X offset
     * @param {number} y - Target Y offset
     * @param {number} z - Target Z offset
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - Easing function name
     * @returns {Object} Chain target for method chaining
     */
    animateOffset(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        return this.errorBoundary.wrap(() => {
            this.positionController.animateOffset(x, y, z, duration, easing);
            return this._chainTarget;
        }, 'offset-animation', this._chainTarget)();
    }
}
