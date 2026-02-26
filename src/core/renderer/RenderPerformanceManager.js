/**
 * RenderPerformanceManager
 *
 * Manages performance monitoring and render cleanup operations.
 * Handles:
 * - Frame start performance markers
 * - Frame timing measurements
 * - Forced clean render after tab switches
 */
export class RenderPerformanceManager {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Mark frame start and return frame start time
     * @returns {number} Frame start timestamp
     */
    markFrameStart() {
        // Performance marker: Frame start
        if (this.renderer.performanceMonitor) {
            this.renderer.performanceMonitor.markFrameStart();
        }
        return performance.now();
    }

    /**
     * Handle forced clean render after tab switch
     * Clears any rendering artifacts when needed
     */
    handleCleanRender() {
        if (this.renderer.forceCleanRender) {
            this.renderer.forceCleanRender = false;
            // Clear any rendering artifacts
            if (this.renderer.canvas && this.renderer.ctx) {
                this.renderer.ctx.clearRect(
                    0,
                    0,
                    this.renderer.canvas.width,
                    this.renderer.canvas.height
                );
            }
        }
    }

    /**
     * Perform frame initialization tasks
     * @returns {number} Frame start timestamp
     */
    initializeFrame() {
        const frameStartTime = this.markFrameStart();
        this.handleCleanRender();
        return frameStartTime;
    }
}
