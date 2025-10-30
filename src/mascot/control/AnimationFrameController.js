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
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Set target frames per second for the animation loop
     * @param {number} targetFPS - Target frames per second (default: 60)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    setTargetFPS(targetFPS) {
        const clampedFPS = Math.max(15, Math.min(120, targetFPS)); // Clamp between 15-120 FPS
        this.mascot.config.targetFPS = clampedFPS;
        this.mascot.animationController.setTargetFPS(clampedFPS);

        // Target FPS set
        this.mascot.emit('targetFPSChanged', { targetFPS: clampedFPS });

        return this.mascot;
    }

    /**
     * Gets the current target FPS
     * @returns {number} Target frames per second
     */
    getTargetFPS() {
        return this.mascot.animationController.targetFPS;
    }

    /**
     * Set mascot position offset from viewport center
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset for scaling (optional)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    setPosition(x, y, z = 0) {
        if (this.mascot.positionController) {
            // Ensure onUpdate callback exists
            if (!this.mascot.positionController.onUpdate) {
                this.mascot.positionController.onUpdate = () => {};
            }
            this.mascot.positionController.setOffset(x, y, z);
        }
        return this.mascot;
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
        if (this.mascot.positionController) {
            // Ensure onUpdate callback exists
            if (!this.mascot.positionController.onUpdate) {
                this.mascot.positionController.onUpdate = () => {};
            }
            this.mascot.positionController.animateOffset(x, y, z, duration, easing);
        }
        return this.mascot;
    }

    /**
     * Get the current position information
     * @returns {Object|null} Current position metadata or null if not available
     */
    getPosition() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.positionController || typeof this.mascot.positionController.getPosition !== 'function') {
                return null;
            }

            const hasWindow = typeof window !== 'undefined';
            const centerX = hasWindow ? window.innerWidth / 2 : 0;
            const centerY = hasWindow ? window.innerHeight / 2 : 0;

            return this.mascot.positionController.getPosition(centerX, centerY);
        }, 'get-position', this.mascot)();
    }
}
