/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                 ◐ ◑ ◒ ◓  SHAPE TRANSFORM MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ShapeTransformManager - Shape Morphing and Backdrop Manager
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module ShapeTransformManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages shape morphing and backdrop rendering functionality. Provides high-level
 * ║ API for transforming the mascot's shape and configuring visual backdrop effects.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Shape morphing control and configuration
 * │ • Backdrop rendering setup and management
 * │ • Shape morph event emission
 * │ • Integration with renderer and shape morpher
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class ShapeTransformManager {
    /**
     * Create ShapeTransformManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Morph to a new shape
     * @param {string} shape - Target shape name
     * @param {Object} config - Morph configuration
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    morphTo(shape, config = {}) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.shapeMorpher) {
                // ShapeMorpher not initialized
                return this.mascot;
            }

            // Start the morph
            this.mascot.shapeMorpher.morphTo(shape, config);

            // Pass shape morpher to renderer
            if (this.mascot.renderer) {
                this.mascot.renderer.shapeMorpher = this.mascot.shapeMorpher;
            }

            // Emit event
            this.mascot.emit('shapeMorphStarted', { from: this.mascot.shapeMorpher.currentShape, to: shape });

            // Morphing to new shape
            return this.mascot;
        }, 'morphTo', this.mascot)();
    }

    /**
     * Configure backdrop rendering
     * @param {Object} options - Backdrop configuration
     * @param {boolean} [options.enabled] - Enable/disable backdrop
     * @param {string} [options.type='radial-gradient'] - Type: 'radial-gradient', 'vignette', 'glow'
     * @param {number} [options.intensity=0.7] - Darkness/opacity (0-1)
     * @param {number} [options.radius=1.5] - Radius multiplier of mascot size
     * @param {string} [options.color='rgba(0, 0, 0, 0.6)'] - Base color
     * @param {boolean} [options.responsive=true] - React to audio/emotion
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     * @example
     * mascot.setBackdrop({ enabled: true, intensity: 0.8, radius: 2 });
     */
    setBackdrop(options = {}) {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.renderer && this.mascot.renderer.backdropRenderer) {
                this.mascot.renderer.backdropRenderer.setConfig(options);
            }
            return this.mascot;
        }, 'setBackdrop', this.mascot)();
    }

    /**
     * Get current backdrop configuration
     * @returns {Object} Current backdrop config
     */
    getBackdrop() {
        return this.mascot.errorBoundary.wrap(() => {
            if (this.mascot.renderer && this.mascot.renderer.backdropRenderer) {
                return this.mascot.renderer.backdropRenderer.getConfig();
            }
            return null;
        }, 'getBackdrop', this.mascot)();
    }
}
