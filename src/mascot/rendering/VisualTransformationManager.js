/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *          ◐ ◑ ◒ ◓  VISUAL TRANSFORMATION MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview VisualTransformationManager - Visual Positioning and Transformation
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module VisualTransformationManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages mascot visual transformations including position offsets, shape morphing,
 * ║ backdrop effects, and canvas coordination. Provides unified interface for all
 * ║ spatial and visual presentation changes.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎨 TRANSFORMATION TYPES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Position Offset: Move mascot from viewport center (x, y, z for scaling)
 * │ • Shape Morphing: Transition between shapes (circle, heart, star, etc.)
 * │ • Backdrop Effects: Radial gradients, vignettes, glows behind mascot
 * │ • Canvas Coordination: Handle resize events and particle system dimensions
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔧 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Set and animate position offsets
 * │ • Morph between different shapes
 * │ • Configure backdrop rendering (gradients, vignettes, glows)
 * │ • Handle canvas resize events
 * │ • Clear particles on position changes
 * │ • Configure particle system canvas dimensions
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class VisualTransformationManager {
    /**
     * Create VisualTransformationManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.canvasResizeManager - Canvas resize manager instance
     * @param {Object} deps.offsetPositionManager - Offset position manager instance
     * @param {Object} deps.shapeTransformManager - Shape transform manager instance
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.canvasResizeManager)
            throw new Error('VisualTransformationManager: canvasResizeManager required');
        if (!deps.offsetPositionManager)
            throw new Error('VisualTransformationManager: offsetPositionManager required');
        if (!deps.shapeTransformManager)
            throw new Error('VisualTransformationManager: shapeTransformManager required');

        this.canvasResizeManager = deps.canvasResizeManager;
        this.offsetPositionManager = deps.offsetPositionManager;
        this.shapeTransformManager = deps.shapeTransformManager;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Set offset values for eccentric positioning
     * @param {number} x - X offset from center
     * @param {number} y - Y offset from center
     * @param {number} z - Z offset (for pseudo-3D scaling)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // Position mascot 100px right, 50px down
     * mascot.setOffset(100, 50);
     *
     * @example
     * // Position with scaling effect
     * mascot.setOffset(0, 0, 1.5); // 1.5x scale
     */
    setOffset(x, y, z = 0) {
        return this.offsetPositionManager.setOffset(x, y, z);
    }

    /**
     * Get current offset values
     * @returns {Object} Current offset {x, y, z}
     *
     * @example
     * const offset = mascot.getOffset();
     * console.log(`Position: (${offset.x}, ${offset.y}), Scale: ${offset.z}`);
     */
    getOffset() {
        return this.offsetPositionManager.getOffset();
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
     * // Slide mascot to the right over 1 second
     * mascot.animateOffset(200, 0, 0, 1000, 'easeOutCubic');
     *
     * @example
     * // Bounce effect with custom easing
     * mascot.animateOffset(0, -100, 0, 500, 'easeOutBounce');
     */
    animateOffset(x, y, z = 0, duration = 1000, easing = 'easeOutCubic') {
        return this.offsetPositionManager.animateOffset(x, y, z, duration, easing);
    }

    /**
     * Morph the core to a different shape
     * @param {string} shape - Target shape name (circle, heart, star, sun, moon, eclipse, square, triangle)
     * @param {Object} config - Morph configuration
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // Morph to heart shape
     * mascot.morphTo('heart');
     *
     * @example
     * // Morph with custom duration
     * mascot.morphTo('star', { duration: 2000 });
     */
    morphTo(shape, config = {}) {
        return this.shapeTransformManager.morphTo(shape, config);
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
     *
     * @example
     * // Enable dramatic backdrop
     * mascot.setBackdrop({ enabled: true, intensity: 0.8, radius: 2 });
     *
     * @example
     * // Subtle glow effect
     * mascot.setBackdrop({
     *   enabled: true,
     *   type: 'glow',
     *   intensity: 0.3,
     *   color: 'rgba(255, 100, 0, 0.5)'
     * });
     *
     * @example
     * // Disable backdrop
     * mascot.setBackdrop({ enabled: false });
     */
    setBackdrop(options = {}) {
        return this.shapeTransformManager.setBackdrop(options);
    }

    /**
     * Get current backdrop configuration
     * @returns {Object} Current backdrop config
     *
     * @example
     * const backdrop = mascot.getBackdrop();
     * console.log('Backdrop enabled:', backdrop.enabled);
     */
    getBackdrop() {
        return this.shapeTransformManager.getBackdrop();
    }

    /**
     * Handle canvas resize events to trigger visual resampling
     * This ensures visuals look crisp at any size
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     * @param {number} dpr - Device pixel ratio
     *
     * @example
     * // Handle window resize
     * window.addEventListener('resize', () => {
     *   const canvas = mascot.canvas;
     *   mascot.handleResize(canvas.width, canvas.height, window.devicePixelRatio);
     * });
     */
    handleResize(width, height, dpr) {
        this.canvasResizeManager.handleResize(width, height, dpr);
    }

    /**
     * Clear all particles from the particle system
     * Useful when repositioning mascot to remove particles from old position
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // Clear particles before teleporting
     * mascot.clearParticles();
     * mascot.setOffset(500, 0);
     */
    clearParticles() {
        return this.canvasResizeManager.clearParticles();
    }

    /**
     * Set canvas dimensions on particle system for accurate spawn calculations
     * Call this after init() to ensure particles spawn correctly when mascot is offset
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // After initialization, sync particle system with canvas
     * await mascot.initialize();
     * mascot.setParticleSystemCanvasDimensions(800, 600);
     */
    setParticleSystemCanvasDimensions(width, height) {
        return this.canvasResizeManager.setParticleSystemCanvasDimensions(width, height);
    }
}
