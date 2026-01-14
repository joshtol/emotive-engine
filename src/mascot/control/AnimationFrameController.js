/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                  ◐ ◑ ◒ ◓  ANIMATION FRAME CONTROLLER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview AnimationFrameController - FPS and Position Control Manager
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module AnimationFrameController
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages FPS control and position offset functionality for the mascot.
 * ║ Provides high-level API for controlling animation frame rate and positioning
 * ║ without directly interacting with lower-level controllers.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎯 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Set and get target FPS with validation (15-120 FPS range)
 * │ • Set position offset from viewport center
 * │ • Animate position changes with easing
 * │ • Get current position information
 * │ • Emit events for FPS changes
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class AnimationFrameController {
    /**
     * Create AnimationFrameController
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.animationController - Animation controller instance
     * @param {Object} deps.positionController - Position controller instance
     * @param {Object} deps.config - Configuration object
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('AnimationFrameController: errorBoundary required');
        if (!deps.animationController) throw new Error('AnimationFrameController: animationController required');
        if (!deps.config) throw new Error('AnimationFrameController: config required');
        if (!deps.emit) throw new Error('AnimationFrameController: emit required');

        this.errorBoundary = deps.errorBoundary;
        this.animationController = deps.animationController;
        this.positionController = deps.positionController || null;
        this.config = deps.config;
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Set target frames per second for the animation loop
     * @param {number} targetFPS - Target frames per second (default: 60)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    setTargetFPS(targetFPS) {
        const clampedFPS = Math.max(15, Math.min(120, targetFPS)); // Clamp between 15-120 FPS
        this.config.targetFPS = clampedFPS;
        this.animationController.setTargetFPS(clampedFPS);

        // Target FPS set
        this._emit('targetFPSChanged', { targetFPS: clampedFPS });

        return this._chainTarget;
    }

    /**
     * Gets the current target FPS
     * @returns {number} Target frames per second
     */
    getTargetFPS() {
        return this.animationController.targetFPS;
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset for scaling (optional)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    setPosition(x, y, z = 0) {
        if (this.positionController) {
            // Ensure onUpdate callback exists
            if (!this.positionController.onUpdate) {
                this.positionController.onUpdate = () => {};
            }
            this.positionController.setOffset(x, y, z);
        }
        return this._chainTarget;
    }

    /**
     * Animate mascot to position offset from viewport center
     * @param {number} x - Target X offset from center
     * @param {number} y - Target Y offset from center
     * @param {number} z - Target Z offset for scaling (optional)
     * @param {number} duration - Animation duration in milliseconds
     * @param {string} easing - Easing function name (optional)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    animateToPosition(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        if (this.positionController) {
            // Ensure onUpdate callback exists
            if (!this.positionController.onUpdate) {
                this.positionController.onUpdate = () => {};
            }
            this.positionController.animateOffset(x, y, z, duration, easing);
        }
        return this._chainTarget;
    }

    /**
     * Get the current position information
     * @returns {Object|null} Current position metadata or null if not available
     */
    getPosition() {
        return this.errorBoundary.wrap(() => {
            if (!this.positionController || typeof this.positionController.getPosition !== 'function') {
                return null;
            }

            const hasWindow = typeof window !== 'undefined';
            const centerX = hasWindow ? window.innerWidth / 2 : 0;
            const centerY = hasWindow ? window.innerHeight / 2 : 0;

            return this.positionController.getPosition(centerX, centerY);
        }, 'get-position', this._chainTarget)();
    }
}
