/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                     ◐ ◑ ◒ ◓  SIMPLE FPS COUNTER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Simple FPS Counter - Accurate Frame Rate Measurement
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module SimpleFPSCounter
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The SPEEDOMETER of the engine. Accurately measures frames per second using
 * ║ a rolling timestamp array. Shows exactly how smooth the animation is running.
 * ║ Critical for performance monitoring and automatic quality degradation.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📊 FPS CALCULATION METHOD
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Stores timestamps from the last second
 * │ • Counts frames within 1000ms window
 * │ • More accurate than delta time averaging
 * │ • Updates every frame for real-time monitoring
 * │ • Based on 2025 best practices for JavaScript FPS
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ PERFORMANCE TARGETS
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • 60 FPS   : Smooth animation (16.67ms per frame)
 * │ • 30 FPS   : Acceptable minimum (33.33ms per frame)
 * │ • < 30 FPS : Triggers quality degradation
 * │ • < 15 FPS : Critical performance issues
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ═══════════════════════════════════════════════════════════════════════════════════
 */
class SimpleFPSCounter {
    constructor() {
        // Circular buffer for timestamps (max 120 frames in 1 second at 120fps)
        this._maxTimestamps = 120;
        this._timestamps = new Float64Array(this._maxTimestamps);
        this._tsWriteIndex = 0;
        this._tsCount = 0;

        // Current FPS value
        this.fps = 0;

        // Smoothed FPS for display (to reduce jitter)
        this.smoothedFPS = 0;
        this.smoothingFactor = 0.9; // Higher = more smoothing

        // Frame time tracking
        this.lastFrameTime = 0;
        this.frameTime = 0;

        // Circular buffer for frame times (last N frames)
        this.maxFrameTimeSamples = 10;
        this._frameTimes = new Float64Array(this.maxFrameTimeSamples);
        this._ftWriteIndex = 0;
        this._ftCount = 0;
        this.averageFrameTime = 0;
    }

    /**
     * Update FPS calculation with new frame
     * Call this in your animation loop with the timestamp from requestAnimationFrame
     * @param {number} timestamp - High resolution timestamp from requestAnimationFrame
     */
    update(timestamp) {
        // Write timestamp into circular buffer
        this._timestamps[this._tsWriteIndex] = timestamp;
        this._tsWriteIndex = (this._tsWriteIndex + 1) % this._maxTimestamps;
        if (this._tsCount < this._maxTimestamps) this._tsCount++;

        // Count timestamps within last 1000ms
        const cutoff = timestamp - 1000;
        let count = 0;
        for (let i = 0; i < this._tsCount; i++) {
            if (this._timestamps[i] > cutoff) count++;
        }
        this.fps = count;

        // Apply smoothing to reduce display jitter
        if (this.smoothedFPS === 0) {
            this.smoothedFPS = this.fps;
        } else {
            this.smoothedFPS =
                this.smoothedFPS * this.smoothingFactor + this.fps * (1 - this.smoothingFactor);
        }

        // Calculate frame time
        if (this.lastFrameTime > 0) {
            this.frameTime = timestamp - this.lastFrameTime;

            // Track frame times in circular buffer
            this._frameTimes[this._ftWriteIndex] = this.frameTime;
            this._ftWriteIndex = (this._ftWriteIndex + 1) % this.maxFrameTimeSamples;
            if (this._ftCount < this.maxFrameTimeSamples) this._ftCount++;

            // Calculate average frame time
            if (this._ftCount > 0) {
                let sum = 0;
                for (let i = 0; i < this._ftCount; i++) {
                    sum += this._frameTimes[i];
                }
                this.averageFrameTime = sum / this._ftCount;
            }
        }
        this.lastFrameTime = timestamp;
    }

    /**
     * Get current FPS
     * @returns {number} Current FPS (integer)
     */
    getFPS() {
        return Math.round(this.fps);
    }

    /**
     * Get smoothed FPS for display
     * @returns {number} Smoothed FPS (integer)
     */
    getSmoothedFPS() {
        return Math.round(this.smoothedFPS);
    }

    /**
     * Get last frame time in milliseconds
     * @returns {number} Frame time in ms
     */
    getFrameTime() {
        return this.frameTime;
    }

    /**
     * Get average frame time over recent frames
     * @returns {number} Average frame time in ms
     */
    getAverageFrameTime() {
        return this.averageFrameTime;
    }

    /**
     * Reset the FPS counter
     */
    reset() {
        this._timestamps.fill(0);
        this._tsWriteIndex = 0;
        this._tsCount = 0;
        this.fps = 0;
        this.smoothedFPS = 0;
        this.lastFrameTime = 0;
        this.frameTime = 0;
        this._frameTimes.fill(0);
        this._ftWriteIndex = 0;
        this._ftCount = 0;
        this.averageFrameTime = 0;
    }

    /**
     * Get all metrics
     * @returns {Object} Object containing all FPS metrics
     */
    getMetrics() {
        return {
            fps: this.getFPS(),
            smoothedFPS: this.getSmoothedFPS(),
            frameTime: this.getFrameTime(),
            averageFrameTime: this.getAverageFrameTime(),
            // Performance status based on FPS
            status: this.fps >= 55 ? 'good' : this.fps >= 30 ? 'okay' : 'poor',
        };
    }
}

export default SimpleFPSCounter;
