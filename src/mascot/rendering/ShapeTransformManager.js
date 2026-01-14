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
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.renderer] - Renderer instance
     * @param {Object} [deps.shapeMorpher] - Shape morpher instance
     * @param {Function} deps.emit - Event emission function
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('ShapeTransformManager: errorBoundary required');
        if (!deps.emit) throw new Error('ShapeTransformManager: emit required');

        this.errorBoundary = deps.errorBoundary;
        this.renderer = deps.renderer || null;
        this.shapeMorpher = deps.shapeMorpher || null;
        this._emit = deps.emit;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Morph to a new shape
     * @param {string} shape - Target shape name
     * @param {Object} config - Morph configuration
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     */
    morphTo(shape, config = {}) {
        return this.errorBoundary.wrap(() => {
            if (!this.shapeMorpher) {
                // ShapeMorpher not initialized
                return this._chainTarget;
            }

            // Start the morph
            this.shapeMorpher.morphTo(shape, config);

            // Pass shape morpher to renderer
            if (this.renderer) {
                this.renderer.shapeMorpher = this.shapeMorpher;
            }

            // Emit event
            this._emit('shapeMorphStarted', { from: this.shapeMorpher.currentShape, to: shape });

            // Morphing to new shape
            return this._chainTarget;
        }, 'morphTo', this._chainTarget)();
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
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.backdropRenderer) {
                this.renderer.backdropRenderer.setConfig(options);
            }
            return this._chainTarget;
        }, 'setBackdrop', this._chainTarget)();
    }

    /**
     * Get current backdrop configuration
     * @returns {Object} Current backdrop config
     */
    getBackdrop() {
        return this.errorBoundary.wrap(() => {
            if (this.renderer && this.renderer.backdropRenderer) {
                return this.renderer.backdropRenderer.getConfig();
            }
            return null;
        }, 'getBackdrop', this._chainTarget)();
    }
}
