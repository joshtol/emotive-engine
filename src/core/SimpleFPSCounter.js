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
        // Array to store timestamps from the last second
        this.timestamps = [];
        
        // Current FPS value
        this.fps = 0;
        
        // Smoothed FPS for display (to reduce jitter)
        this.smoothedFPS = 0;
        this.smoothingFactor = 0.9; // Higher = more smoothing
        
        // Frame time tracking
        this.lastFrameTime = 0;
        this.frameTime = 0;
        
        // Average frame time over last N frames
        this.frameTimes = [];
        this.maxFrameTimeSamples = 10;
        this.averageFrameTime = 0;
    }
    
    /**
     * Update FPS calculation with new frame
     * Call this in your animation loop with the timestamp from requestAnimationFrame
     * @param {number} timestamp - High resolution timestamp from requestAnimationFrame
     */
    update(timestamp) {
        // Remove timestamps older than 1 second
        while (this.timestamps.length > 0 && this.timestamps[0] <= timestamp - 1000) {
            this.timestamps.shift();
        }
        
        // Add current timestamp
        this.timestamps.push(timestamp);
        
        // FPS is the number of frames in the last second
        this.fps = this.timestamps.length;
        
        // Apply smoothing to reduce display jitter
        if (this.smoothedFPS === 0) {
            this.smoothedFPS = this.fps;
        } else {
            this.smoothedFPS = this.smoothedFPS * this.smoothingFactor + 
                               this.fps * (1 - this.smoothingFactor);
        }
        
        // Calculate frame time
        if (this.lastFrameTime > 0) {
            this.frameTime = timestamp - this.lastFrameTime;
            
            // Track frame times for averaging
            this.frameTimes.push(this.frameTime);
            if (this.frameTimes.length > this.maxFrameTimeSamples) {
                this.frameTimes.shift();
            }
            
            // Calculate average frame time
            if (this.frameTimes.length > 0) {
                const sum = this.frameTimes.reduce((a, b) => a + b, 0);
                this.averageFrameTime = sum / this.frameTimes.length;
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
        this.timestamps = [];
        this.fps = 0;
        this.smoothedFPS = 0;
        this.lastFrameTime = 0;
        this.frameTime = 0;
        this.frameTimes = [];
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
            status: this.fps >= 55 ? 'good' : this.fps >= 30 ? 'okay' : 'poor'
        };
    }
}

export default SimpleFPSCounter;