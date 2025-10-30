/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *            ◐ ◑ ◒ ◓  OFFSET POSITION MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview OffsetPositionManager - Eccentric Positioning and Offset Control
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module OffsetPositionManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages offset-based positioning for eccentric mascot placement. Provides
 * ║ both immediate offset setting and animated offset transitions using the
 * ║ PositionController.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📍 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Set immediate offset values (x, y, z)
 * │ • Get current offset values
 * │ • Animate offset transitions with easing
 * │ • Delegate to PositionController for implementation
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class OffsetPositionManager {
    /**
     * Create OffsetPositionManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Set offset values for eccentric positioning
     * @param {number} x - X offset
     * @param {number} y - Y offset
     * @param {number} z - Z offset (for pseudo-3D scaling)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.setOffset(100, 50, 0); // Position 100px right, 50px down
     */
    setOffset(x, y, z = 0) {
        return this.mascot.errorBoundary.wrap(() => {
            this.mascot.positionController.setOffset(x, y, z);
            return this.mascot;
        }, 'offset-setting', this.mascot)();
    }

    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     *
     * @example
     * const offset = mascot.getOffset();
     * console.log(`Position offset: ${offset.x}, ${offset.y}`);
     */
    getOffset() {
        return this.mascot.errorBoundary.wrap(() => {
            return this.mascot.positionController.getOffset();
        }, 'offset-getting', this.mascot)();
    }

    /**
     * Animate to new offset values
     * @param {number} x - Target X offset
     * @param {number} y - Target Y offset
     * @param {number} z - Target Z offset
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - Easing function name
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.animateOffset(200, 100, 0, 1000, 'easeOutCubic');
     */
    animateOffset(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        return this.mascot.errorBoundary.wrap(() => {
            this.mascot.positionController.animateOffset(x, y, z, duration, easing);
            return this.mascot;
        }, 'offset-animation', this.mascot)();
    }
}
