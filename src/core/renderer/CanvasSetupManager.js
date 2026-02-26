/**
 * CanvasSetupManager - Manages canvas setup and backdrop rendering
 *
 * Handles:
 * - Offscreen canvas size updates
 * - Context switching for double buffering
 * - Backdrop rendering to main canvas
 * - Canvas decay application
 *
 * @class CanvasSetupManager
 */
export class CanvasSetupManager {
    /**
     * Create a CanvasSetupManager
     * @param {Object} renderer - Reference to the EmotiveRenderer
     */
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Setup canvas for rendering (update offscreen size, get dimensions, switch context)
     * @returns {Object} Canvas setup data {logicalWidth, logicalHeight, originalCtx}
     */
    setupCanvas() {
        // Update offscreen canvas size if needed
        this.renderer.updateOffscreenSize();

        // Get logical dimensions from canvasManager (not scaled by DPR)
        const logicalWidth = this.renderer.canvasManager.width || this.renderer.canvas.width || 400;
        const logicalHeight =
            this.renderer.canvasManager.height || this.renderer.canvas.height || 400;

        // Store original context and switch to offscreen for double buffering
        const originalCtx = this.renderer.ctx;
        this.renderer.ctx = this.renderer.offscreenCtx;

        return { logicalWidth, logicalHeight, originalCtx };
    }

    /**
     * Render backdrop to main canvas
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     * @param {CanvasRenderingContext2D} originalCtx - Main canvas context
     * @param {number} deltaTime - Time since last frame
     */
    renderBackdrop(logicalWidth, logicalHeight, originalCtx, deltaTime) {
        // Calculate backdrop position early - needs centerX, centerY, coreRadius
        const backdropCanvasSize = Math.min(logicalWidth, logicalHeight);
        const backdropEffectiveCenter = this.renderer.getEffectiveCenter();
        const backdropCenterX = backdropEffectiveCenter.x;
        const backdropCenterY = backdropEffectiveCenter.y - this.renderer.config.topOffset;
        const backdropScaleFactor =
            (backdropCanvasSize / this.renderer.config.referenceSize) *
            this.renderer.config.baseScale *
            (backdropEffectiveCenter.coreScale || backdropEffectiveCenter.scale);
        const backdropBaseRadius =
            (this.renderer.config.referenceSize / this.renderer.config.coreSizeDivisor) *
            backdropScaleFactor;
        const backdropCoreRadius = backdropBaseRadius;

        // Update and render backdrop to MAIN canvas (not offscreen)
        this.renderer.backdropRenderer.update(deltaTime);
        if (this.renderer.audioAnalyzer && this.renderer.audioAnalyzer.currentAmplitude) {
            this.renderer.backdropRenderer.setAudioIntensity(
                this.renderer.audioAnalyzer.currentAmplitude
            );
        }
        this.renderer.backdropRenderer.render(
            backdropCenterX,
            backdropCenterY,
            backdropCoreRadius,
            originalCtx
        );
    }

    /**
     * Apply decay to main canvas to prevent glow accumulation
     * @param {CanvasRenderingContext2D} originalCtx - Main canvas context
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     */
    applyCanvasDecay(originalCtx, logicalWidth, logicalHeight) {
        // Scale decay with particle count to handle high-particle emotions like euphoria
        const particleCount = this.renderer.particleSystem
            ? this.renderer.particleSystem.particles.length
            : 0;
        // Base decay: 12%, increased up to 20% for high particle counts
        const decayRate = 0.12 + Math.min(0.08, particleCount * 0.003);

        originalCtx.save();
        originalCtx.globalCompositeOperation = 'destination-out';
        originalCtx.fillStyle = `rgba(0, 0, 0, ${decayRate})`;
        originalCtx.fillRect(0, 0, logicalWidth, logicalHeight);
        originalCtx.restore();
    }

    /**
     * Clear offscreen canvas for fresh render
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     */
    clearOffscreenCanvas(logicalWidth, logicalHeight) {
        this.renderer.ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    }

    /**
     * Complete canvas setup phase: backdrop, decay, clear offscreen
     * @param {number} logicalWidth - Canvas logical width
     * @param {number} logicalHeight - Canvas logical height
     * @param {CanvasRenderingContext2D} originalCtx - Main canvas context
     * @param {number} deltaTime - Time since last frame
     */
    performCanvasSetup(logicalWidth, logicalHeight, originalCtx, deltaTime) {
        // RENDER BACKDROP TO MAIN CANVAS FIRST (persists, not subject to decay/clear)
        this.renderBackdrop(logicalWidth, logicalHeight, originalCtx, deltaTime);

        // Apply decay to main canvas to prevent glow accumulation
        this.applyCanvasDecay(originalCtx, logicalWidth, logicalHeight);

        // Clear offscreen canvas for fresh render
        this.clearOffscreenCanvas(logicalWidth, logicalHeight);
    }
}
