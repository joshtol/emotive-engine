/**
 * RenderFinalizationManager
 *
 * Manages the final steps of rendering.
 * Handles:
 * - Sleep indicator rendering
 * - Context restoration
 * - Offscreen canvas blitting to main canvas
 * - Recording indicator overlay
 * - Performance monitoring (frame end)
 */
import { isEffectActive, getEffect } from '../effects/index.js';

export class RenderFinalizationManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Render sleep indicator if sleeping
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} glowRadius - Glow radius
     * @param {number} deltaTime - Time elapsed since last frame
     */
    renderSleepIndicator(centerX, centerY, glowRadius, deltaTime) {
        // Add sleep indicator if sleeping
        if (this.renderer.state.sleeping) {
            this.renderer.renderSleepIndicator(
                centerX,
                centerY - glowRadius - this.renderer.scaleValue(20),
                deltaTime
            );
        }
    }

    /**
     * Restore original context and blit offscreen canvas to main canvas
     * @param {CanvasRenderingContext2D} originalCtx - Original canvas context
     * @param {number} logicalWidth - Logical canvas width
     * @param {number} logicalHeight - Logical canvas height
     */
    finalizeCanvas(originalCtx, logicalWidth, logicalHeight) {
        // Restore original context AFTER all rendering is done
        this.renderer.ctx = originalCtx;

        // Blit offscreen canvas to main canvas
        // CRITICAL: Specify dimensions to properly scale DPR-sized offscreen canvas
        // back to logical size on the main canvas
        originalCtx.drawImage(this.renderer.offscreenCanvas, 0, 0, logicalWidth, logicalHeight);
    }

    /**
     * Draw recording indicator on top of everything
     * @param {CanvasRenderingContext2D} originalCtx - Original canvas context
     */
    drawRecordingIndicator(originalCtx) {
        // Draw recording indicator on TOP of everything, with no transforms
        if (isEffectActive('recording-glow', this.renderer.state)) {
            const recordingEffect = getEffect('recording-glow');
            if (recordingEffect && recordingEffect.drawRecordingIndicator) {
                // Use original context to draw on top of the blitted image
                recordingEffect.drawRecordingIndicator(
                    originalCtx,
                    this.renderer.canvas.width,
                    this.renderer.canvas.height
                );
            }
        }
    }

    /**
     * Mark frame end and record performance metrics
     * @param {number} frameStartTime - Frame start timestamp
     */
    finalizePerformanceMetrics(frameStartTime) {
        // Performance marker: Frame end
        const frameEndTime = performance.now();
        const frameTime = frameEndTime - frameStartTime;
        if (this.renderer.performanceMonitor) {
            this.renderer.performanceMonitor.markFrameEnd();
            this.renderer.performanceMonitor.recordFrameTime(frameTime);
        }
    }

    /**
     * Perform all finalization steps
     * @param {Object} params - Finalization parameters
     */
    finalizeRender(params) {
        const {
            centerX,
            centerY,
            glowRadius,
            deltaTime,
            originalCtx,
            logicalWidth,
            logicalHeight,
            frameStartTime,
        } = params;

        // Render sleep indicator
        this.renderSleepIndicator(centerX, centerY, glowRadius, deltaTime);

        // Restore context and blit to main canvas
        this.finalizeCanvas(originalCtx, logicalWidth, logicalHeight);

        // Draw recording indicator overlay
        this.drawRecordingIndicator(originalCtx);

        // Finalize performance metrics
        this.finalizePerformanceMetrics(frameStartTime);
    }
}
