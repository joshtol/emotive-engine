/**
 * DebugInfoRenderer
 *
 * Renders debug information overlay on canvas.
 * Handles:
 * - FPS display with color-coded borders
 * - Frame time metrics
 * - Particle count display
 * - Emotional state display
 * - Gesture information
 * - Audio level display
 * - Background boxes for readability
 */
export class DebugInfoRenderer {
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Render debug information overlay
     * @param {number} _deltaTime - Time since last frame (unused but kept for API consistency)
     */
    renderDebugInfo(_deltaTime) {
        const ctx = this.mascot.canvasManager.getContext();
        ctx.save();

        this.setupTextStyle(ctx);

        let y = 20;
        const lineHeight = 16;

        if (this.mascot.config.showFPS) {
            y = this.renderFPSInfo(ctx, y, lineHeight);
        }

        if (this.mascot.config.showDebug) {
            this.renderDebugDetails(ctx, y, lineHeight);
        }

        ctx.restore();
    }

    /**
     * Setup text rendering style
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    setupTextStyle(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
    }

    /**
     * Render FPS information box
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} y - Y position to start rendering
     * @param {number} lineHeight - Height of each line
     * @returns {number} Updated Y position
     */
    renderFPSInfo(ctx, y, lineHeight) {
        const metrics = this.mascot.animationController.getPerformanceMetrics();
        const fps = metrics.instantFps || metrics.fps || 0;
        const frameTime = metrics.averageFrameTime ? metrics.averageFrameTime.toFixed(1) : '0.0';
        const particleStats = this.mascot.particleSystem.getStats();

        const lines = [
            `FPS: ${fps}`,
            `Frame: ${frameTime}ms`,
            `Particles: ${particleStats.activeParticles}`
        ];

        const { x, maxWidth } = this.calculateFPSBoxPosition(ctx, lines);
        this.drawFPSBackground(ctx, x, y, maxWidth, lines.length);
        this.drawFPSBorder(ctx, x, y, maxWidth, lines.length, fps);
        this.drawTextLines(ctx, lines, x, y, lineHeight);

        return y + lineHeight * lines.length;
    }

    /**
     * Calculate FPS box position (top right)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array<string>} lines - Lines to display
     * @returns {Object} Position and max width
     */
    calculateFPSBoxPosition(ctx, lines) {
        const padding = 8;
        let maxWidth = 0;

        lines.forEach(line => {
            const {width} = ctx.measureText(line);
            if (width > maxWidth) maxWidth = width;
        });

        const x = this.mascot.canvasManager.width - maxWidth - padding - 10;

        return { x, maxWidth };
    }

    /**
     * Draw semi-transparent background for FPS box
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum width
     * @param {number} lineCount - Number of lines
     */
    drawFPSBackground(ctx, x, y, maxWidth, lineCount) {
        const padding = 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - padding, y - 14, maxWidth + padding * 2, 18 * lineCount + 4);
    }

    /**
     * Draw FPS box border with color based on performance
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum width
     * @param {number} lineCount - Number of lines
     * @param {number} fps - Current FPS
     */
    drawFPSBorder(ctx, x, y, maxWidth, lineCount, fps) {
        const padding = 8;
        const borderColor = this.getFPSBorderColor(fps);

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - padding, y - 14, maxWidth + padding * 2, 18 * lineCount + 4);
    }

    /**
     * Get border color based on FPS
     * @param {number} fps - Current FPS
     * @returns {string} Border color
     */
    getFPSBorderColor(fps) {
        if (fps >= 55) {
            return '#00ff00';  // Green for good FPS
        } else if (fps >= 30) {
            return '#ffff00';  // Yellow for okay FPS
        } else {
            return '#ff0000';  // Red for poor FPS
        }
    }

    /**
     * Draw text lines at position
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array<string>} lines - Lines to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} lineHeight - Height of each line
     */
    drawTextLines(ctx, lines, x, y, lineHeight) {
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, i) => {
            const lineY = y + (i * lineHeight);
            ctx.fillText(line, x, lineY);
        });
    }

    /**
     * Render detailed debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} y - Y position to start rendering
     * @param {number} lineHeight - Height of each line
     */
    renderDebugDetails(ctx, y, lineHeight) {
        const state = this.mascot.stateMachine.getCurrentState();
        const particleStats = this.mascot.particleSystem.getStats();

        const debugInfo = [
            `Emotion: ${state.emotion}${state.undertone ? ` (${state.undertone})` : ''}`,
            `Particles: ${particleStats.activeParticles}/${particleStats.maxParticles}`,
            `Gesture: ${this.mascot.currentModularGesture ? this.mascot.currentModularGesture.type : 'none'}`,
            `Speaking: ${this.mascot.speaking ? 'yes' : 'no'}`,
            `Audio Level: ${(this.mascot.audioLevel * 100).toFixed(1)}%`
        ];

        // Draw debug info with background for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const debugWidth = Math.max(...debugInfo.map(line => ctx.measureText(line).width));
        ctx.fillRect(8, y - 14, debugWidth + 16, debugInfo.length * lineHeight + 4);

        ctx.fillStyle = '#ffffff';
        for (const info of debugInfo) {
            ctx.fillText(info, 10, y);
            y += lineHeight;
        }
    }
}
