/**
 * CanvasContextManager
 *
 * Manages canvas context state and quality settings.
 * Handles:
 * - Canvas context reset and recovery
 * - Quality level adjustments
 * - Image smoothing configuration
 * - Context state cleanup
 */
export class CanvasContextManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Reset canvas context to fix rendering artifacts after tab switch
     */
    resetCanvasContext() {
        if (!this.renderer.canvas || !this.renderer.ctx) return;

        // Save current dimensions
        const { width } = this.renderer.canvas;
        const { height } = this.renderer.canvas;

        // Reset main canvas context
        this.resetContext(this.renderer.ctx, width, height);

        // Reset offscreen canvas if it exists
        if (this.renderer.offscreenCanvas && this.renderer.offscreenCtx) {
            this.resetContext(
                this.renderer.offscreenCtx,
                this.renderer.offscreenCanvas.width,
                this.renderer.offscreenCanvas.height
            );
        }

        // Reset context state manager if it exists
        if (this.renderer.contextStateManager) {
            this.renderer.contextStateManager.reset();
        }

        // Force a clean render on next frame
        this.renderer.forceCleanRender = true;
    }

    /**
     * Reset a single canvas context
     * @param {CanvasRenderingContext2D} ctx - Context to reset
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    resetContext(ctx, width, height) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, width, height);
    }

    /**
     * Set quality level for degradation manager compatibility
     * @param {number} quality - Quality level (0-1)
     */
    setQualityLevel(quality) {
        this.renderer.qualityLevel = Math.max(0, Math.min(1, quality));

        // Adjust rendering parameters based on quality
        if (this.renderer.qualityLevel < 0.5) {
            // Low quality mode
            this.applyLowQuality();
        } else if (this.renderer.qualityLevel < 0.8) {
            // Medium quality
            this.applyMediumQuality();
        } else {
            // High quality
            this.applyHighQuality();
        }
    }

    /**
     * Apply low quality settings
     */
    applyLowQuality() {
        this.renderer.ctx.imageSmoothingEnabled = false;
        this.renderer.state.breathDepth *= 0.5; // Reduce animation complexity
    }

    /**
     * Apply medium quality settings
     */
    applyMediumQuality() {
        this.renderer.ctx.imageSmoothingEnabled = true;
        this.renderer.ctx.imageSmoothingQuality = 'medium';
    }

    /**
     * Apply high quality settings
     */
    applyHighQuality() {
        this.renderer.ctx.imageSmoothingEnabled = true;
        this.renderer.ctx.imageSmoothingQuality = 'high';
    }

    /**
     * Set quality reduction (for degradation manager)
     * @param {boolean} enabled - Whether quality reduction is enabled
     */
    setQualityReduction(enabled) {
        if (enabled) {
            this.setQualityLevel(0.5);
        } else {
            this.setQualityLevel(1.0);
        }
    }

    /**
     * Handle canvas context recovery
     * @param {CanvasRenderingContext2D} newContext - New context after recovery
     */
    handleContextRecovery(newContext) {
        this.renderer.ctx = newContext;
    }
}
