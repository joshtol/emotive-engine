/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *              ◐ ◑ ◒ ◓  CANVAS RESIZE MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview CanvasResizeManager - Canvas Resize Handling and Visual Resampling
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module CanvasResizeManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages canvas resize events and ensures visual quality through resampling.
 * ║ Coordinates renderer reinitialization, state machine updates, and particle
 * ║ system canvas dimension synchronization.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📐 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Handle canvas resize events with visual resampling
 * │ • Reinitialize offscreen canvases for crisp rendering
 * │ • Trigger emotion/undertone recalculation on resize
 * │ • Clear particles when repositioning
 * │ • Synchronize particle system canvas dimensions
 * │ • Emit resize events for external listeners
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class CanvasResizeManager {
    /**
     * Create CanvasResizeManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Handle canvas resize events to trigger visual resampling
     * This ensures visuals look crisp at any size
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     * @param {number} dpr - Device pixel ratio
     *
     * @example
     * window.addEventListener('resize', () => {
     *   const width = window.innerWidth;
     *   const height = window.innerHeight;
     *   const dpr = window.devicePixelRatio || 1;
     *   mascot.handleResize(width, height, dpr);
     * });
     */
    handleResize(width, height, dpr) {
        // Force a re-initialization of the offscreen canvas in renderer
        if (this.mascot.renderer && this.mascot.renderer.initOffscreenCanvas) {
            this.mascot.renderer.initOffscreenCanvas();
        }

        // Trigger a state update to recalculate all visual parameters
        if (this.mascot.stateMachine) {
            const {currentEmotion} = this.mascot.stateMachine;
            const {currentUndertone} = this.mascot.stateMachine;

            // Re-apply current emotion to trigger fresh calculations
            if (currentEmotion) {
                this.mascot.stateMachine.setEmotion(currentEmotion);
            }

            // Re-apply current undertone if any
            if (currentUndertone && currentUndertone !== 'none') {
                this.mascot.stateMachine.setUndertone(currentUndertone);
            }
        }

        // Emit resize event for any listeners
        this.mascot.emit('resize', { width, height, dpr });
    }

    /**
     * Clear all particles from the particle system
     * Useful when repositioning mascot to remove particles from old position
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.setPosition(100, 100);
     * mascot.clearParticles(); // Remove particles from old position
     */
    clearParticles() {
        if (this.mascot.particleSystem) {
            this.mascot.particleSystem.clear();
        }
        return this.mascot;
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.setParticleSystemCanvasDimensions(800, 600);
     * mascot.setPosition(100, 100); // Particles will spawn correctly with offset
     */
    setParticleSystemCanvasDimensions(width, height) {
        if (this.mascot.particleSystem) {
            this.mascot.particleSystem.canvasWidth = width;
            this.mascot.particleSystem.canvasHeight = height;
        }
        return this.mascot;
    }
}
