/**
 * Animation Loop Manager
 * Consolidates all requestAnimationFrame calls into a single, efficient loop
 *
 * @module core/AnimationLoopManager
 * @version 1.0.0
 */

/**
 * Priority levels for animations
 * @enum {number}
 */
export const AnimationPriority = {
    CRITICAL: 0,    // Must run every frame (e.g., main render)
    HIGH: 1,        // Should run every frame if possible
    MEDIUM: 2,      // Can skip frames if needed
    LOW: 3,         // Background tasks, can be throttled
    IDLE: 4         // Only run when idle
};

/**
 * Centralized animation loop manager
 * Replaces multiple requestAnimationFrame calls with a single, optimized loop
 */
export class AnimationLoopManager {
    constructor() {
        // Animation callbacks organized by priority
        this.callbacks = new Map();
        this.callbackIdCounter = 0;

        // Frame timing
        this.frameId = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;

        // Performance
        this.targetFPS = 60;
        this.targetFrameTime = 1000 / this.targetFPS;
        this.frameBudget = 16.67; // ms

        // Frame skipping for low priority
        this.prioritySkipCounters = {
            [AnimationPriority.MEDIUM]: 0,
            [AnimationPriority.LOW]: 0,
            [AnimationPriority.IDLE]: 0
        };

        // Performance monitoring
        this.performanceMonitor = null;
        this.frameTimeHistory = [];
        this.maxHistorySize = 60;

        // Bind methods
        this.loop = this.loop.bind(this);
    }

    /**
     * Register an animation callback
     * @param {Function} callback - Function to call each frame (receives deltaTime, timestamp)
     * @param {number} priority - Priority level from AnimationPriority enum
     * @param {Object} context - Optional context for callback
     * @returns {number} Callback ID for later removal
     */
    register(callback, priority = AnimationPriority.MEDIUM, context = null) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const id = ++this.callbackIdCounter;

        // Store callback with metadata
        this.callbacks.set(id, {
            callback,
            priority,
            context,
            lastRun: 0,
            runCount: 0,
            totalTime: 0,
            enabled: true
        });

        // Auto-start if this is the first callback
        if (this.callbacks.size === 1 && !this.isRunning) {
            this.start();
        }

        return id;
    }

    /**
     * Unregister an animation callback
     * @param {number} id - Callback ID returned from register()
     */
    unregister(id) {
        this.callbacks.delete(id);

        // Auto-stop if no callbacks remain
        if (this.callbacks.size === 0 && this.isRunning) {
            this.stop();
        }
    }

    /**
     * Enable/disable a callback without removing it
     * @param {number} id - Callback ID
     * @param {boolean} enabled - Whether to enable or disable
     */
    setEnabled(id, enabled) {
        const callback = this.callbacks.get(id);
        if (callback) {
            callback.enabled = enabled;
        }
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameId = requestAnimationFrame(this.loop);
    }

    /**
     * Stop the animation loop
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time
        this.deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Update FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / (this.deltaTime || 16.67));
        }

        // Track frame time
        this.frameTimeHistory.push(this.deltaTime);
        if (this.frameTimeHistory.length > this.maxHistorySize) {
            this.frameTimeHistory.shift();
        }

        // Performance marker start
        const frameStartTime = performance.now();

        // Group callbacks by priority
        const callbacksByPriority = this.groupCallbacksByPriority();

        // Execute callbacks by priority
        let timeSpent = 0;

        for (const priority of [
            AnimationPriority.CRITICAL,
            AnimationPriority.HIGH,
            AnimationPriority.MEDIUM,
            AnimationPriority.LOW,
            AnimationPriority.IDLE
        ]) {
            // Check frame budget (except for CRITICAL)
            if (priority > AnimationPriority.CRITICAL && timeSpent > this.frameBudget * 0.8) {
                break; // Skip lower priorities if running out of time
            }

            // Check if we should skip this priority level
            if (this.shouldSkipPriority(priority)) {
                continue;
            }

            // Execute callbacks at this priority
            const callbacks = callbacksByPriority.get(priority) || [];

            for (const callbackData of callbacks) {
                if (!callbackData.enabled) continue;

                const callbackStart = performance.now();

                try {
                    // Call with context if provided
                    if (callbackData.context) {
                        callbackData.callback.call(callbackData.context, this.deltaTime, timestamp);
                    } else {
                        callbackData.callback(this.deltaTime, timestamp);
                    }

                    // Track performance
                    const callbackTime = performance.now() - callbackStart;
                    callbackData.totalTime += callbackTime;
                    callbackData.runCount++;
                    callbackData.lastRun = timestamp;
                    timeSpent += callbackTime;

                } catch (error) {
                    console.error('Animation callback error:', error);
                    // Disable problematic callbacks
                    if (callbackData.runCount > 0 && callbackData.totalTime / callbackData.runCount > 10) {
                        console.warn('Disabling slow callback');
                        callbackData.enabled = false;
                    }
                }

                // Break if spending too much time
                if (timeSpent > this.frameBudget) {
                    break;
                }
            }
        }

        // Performance marker end
        const frameTime = performance.now() - frameStartTime;

        // Warn if frame took too long
        if (frameTime > this.frameBudget * 1.5) {
            console.warn(`Frame took ${frameTime.toFixed(2)}ms (target: ${this.frameBudget}ms)`);
        }

        // Schedule next frame
        this.frameId = requestAnimationFrame(this.loop);
    }

    /**
     * Group callbacks by priority for efficient execution
     * @returns {Map} Map of priority to callback arrays
     */
    groupCallbacksByPriority() {
        const groups = new Map();

        for (const [_id, callbackData] of this.callbacks) {
            const {priority} = callbackData;

            if (!groups.has(priority)) {
                groups.set(priority, []);
            }

            groups.get(priority).push(callbackData);
        }

        return groups;
    }

    /**
     * Determine if we should skip a priority level this frame
     * @param {number} priority - Priority level to check
     * @returns {boolean} True if should skip
     */
    shouldSkipPriority(priority) {
        // Never skip critical
        if (priority === AnimationPriority.CRITICAL) return false;

        // Skip based on frame rate
        if (this.fps < 30 && priority >= AnimationPriority.LOW) return true;
        if (this.fps < 45 && priority === AnimationPriority.IDLE) return true;

        // Frame skipping for lower priorities
        if (priority === AnimationPriority.MEDIUM) {
            // Run every 2nd frame if FPS is low
            if (this.fps < 50) {
                this.prioritySkipCounters[priority]++;
                if (this.prioritySkipCounters[priority] % 2 !== 0) return true;
            }
        } else if (priority === AnimationPriority.LOW) {
            // Run every 3rd frame if FPS is low
            if (this.fps < 50) {
                this.prioritySkipCounters[priority]++;
                if (this.prioritySkipCounters[priority] % 3 !== 0) return true;
            }
        } else if (priority === AnimationPriority.IDLE) {
            // Run every 5th frame
            this.prioritySkipCounters[priority]++;
            if (this.prioritySkipCounters[priority] % 5 !== 0) return true;
        }

        return false;
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getStats() {
        const stats = {
            fps: this.fps,
            frameCount: this.frameCount,
            callbackCount: this.callbacks.size,
            averageFrameTime: 0,
            maxFrameTime: 0,
            minFrameTime: Infinity
        };

        // Calculate frame time stats
        if (this.frameTimeHistory.length > 0) {
            let total = 0;
            for (const time of this.frameTimeHistory) {
                total += time;
                stats.maxFrameTime = Math.max(stats.maxFrameTime, time);
                stats.minFrameTime = Math.min(stats.minFrameTime, time);
            }
            stats.averageFrameTime = total / this.frameTimeHistory.length;
        }

        // Get callback stats by priority
        stats.callbacksByPriority = {};
        for (const [_id, callback] of this.callbacks) {
            const {priority} = callback;
            if (!stats.callbacksByPriority[priority]) {
                stats.callbacksByPriority[priority] = {
                    count: 0,
                    totalTime: 0,
                    enabled: 0
                };
            }
            stats.callbacksByPriority[priority].count++;
            stats.callbacksByPriority[priority].totalTime += callback.totalTime;
            if (callback.enabled) stats.callbacksByPriority[priority].enabled++;
        }

        return stats;
    }

    /**
     * Set target FPS
     * @param {number} fps - Target frames per second
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(15, Math.min(120, fps));
        this.targetFrameTime = 1000 / this.targetFPS;
        this.frameBudget = this.targetFrameTime;
    }

    /**
     * Set performance monitor
     * @param {PerformanceMonitor} monitor - Performance monitor instance
     */
    setPerformanceMonitor(monitor) {
        this.performanceMonitor = monitor;
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stop();
        this.callbacks.clear();
        this.frameTimeHistory = [];
    }
}

// Create singleton instance
export const animationLoopManager = new AnimationLoopManager();

// Export for convenience
export default animationLoopManager;