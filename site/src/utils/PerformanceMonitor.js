/**
 * Performance Monitor
 * Tracks and analyzes engine performance metrics
 * @module utils/PerformanceMonitor
 */

export class PerformanceMonitor {
    constructor(options = {}) {
        // Configuration
        this.config = {
            sampleSize: options.sampleSize || 60, // Number of frames to average
            warnThreshold: options.warnThreshold || 50, // FPS warning threshold
            criticalThreshold: options.criticalThreshold || 30, // FPS critical threshold
            memoryCheckInterval: options.memoryCheckInterval || 5000, // ms
            autoAdjustQuality: options.autoAdjustQuality !== false,
            logInterval: options.logInterval || 10000 // ms between perf logs
        };

        // Metrics storage
        this.metrics = {
            fps: [],
            frameTimes: [],
            gestureTimes: new Map(),
            renderTimes: [],
            memoryUsage: [],
            drawCalls: [],
            particleCount: []
        };

        // Performance marks
        this.marks = new Map();
        this.measures = new Map();

        // Current state
        this.state = {
            currentFPS: 0,
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameTime: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            totalFrames: 0,
            performanceScore: 100,
            qualityLevel: 'high'
        };

        // Timing
        this.lastFrameTime = 0;
        this.frameStartTime = 0;
        this.startTime = performance.now();
        this.lastLogTime = this.startTime;
        this.lastMemoryCheck = this.startTime;

        // Callbacks
        this.onPerformanceWarning = options.onPerformanceWarning || null;
        this.onQualityChange = options.onQualityChange || null;

        // Auto-start if requested
        if (options.autoStart) {
            this.start();
        }
    }

    /**
     * Start monitoring
     */
    start() {
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.monitoring = true;

        // Start memory monitoring if available
        if (performance.memory) {
            this.startMemoryMonitoring();
        }
    }

    /**
     * Stop monitoring
     */
    stop() {
        this.monitoring = false;
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
            this.memoryInterval = null;
        }
    }

    /**
     * Mark the start of a frame
     */
    startFrame() {
        if (!this.monitoring) return;

        this.frameStartTime = performance.now();

        // Calculate FPS from last frame
        if (this.lastFrameTime > 0) {
            const delta = this.frameStartTime - this.lastFrameTime;
            const fps = 1000 / delta;

            // Update FPS metrics
            this.metrics.fps.push(fps);
            if (this.metrics.fps.length > this.config.sampleSize) {
                this.metrics.fps.shift();
            }

            // Update state
            this.state.currentFPS = fps;
            this.state.frameTime = delta;
            this.state.totalFrames++;

            // Check for dropped frames (> 16.67ms for 60fps)
            if (delta > 16.67 * 1.5) {
                this.state.droppedFrames++;
            }

            // Update min/max
            if (fps < this.state.minFPS) this.state.minFPS = fps;
            if (fps > this.state.maxFPS) this.state.maxFPS = fps;
        }

        this.lastFrameTime = this.frameStartTime;
    }

    /**
     * Mark the end of a frame
     */
    endFrame() {
        if (!this.monitoring || !this.frameStartTime) return;

        const frameTime = performance.now() - this.frameStartTime;

        // Store frame time
        this.metrics.frameTimes.push(frameTime);
        if (this.metrics.frameTimes.length > this.config.sampleSize) {
            this.metrics.frameTimes.shift();
        }

        // Calculate averages
        this.calculateAverages();

        // Check performance thresholds
        this.checkPerformance();

        // Log periodically
        const now = performance.now();
        if (now - this.lastLogTime > this.config.logInterval) {
            this.logPerformance();
            this.lastLogTime = now;
        }
    }

    /**
     * Calculate average metrics
     * @private
     */
    calculateAverages() {
        // Average FPS
        if (this.metrics.fps.length > 0) {
            const sum = this.metrics.fps.reduce((a, b) => a + b, 0);
            this.state.averageFPS = sum / this.metrics.fps.length;
        }

        // Average frame time
        if (this.metrics.frameTimes.length > 0) {
            const sum = this.metrics.frameTimes.reduce((a, b) => a + b, 0);
            this.state.averageFrameTime = sum / this.metrics.frameTimes.length;
        }

        // Calculate performance score (0-100)
        const targetFPS = 60;
        const fpsRatio = Math.min(this.state.averageFPS / targetFPS, 1);
        const droppedRatio = 1 - (this.state.droppedFrames / Math.max(this.state.totalFrames, 1));
        this.state.performanceScore = Math.round((fpsRatio * 0.7 + droppedRatio * 0.3) * 100);
    }

    /**
     * Check performance and trigger warnings
     * @private
     */
    checkPerformance() {
        const fps = this.state.averageFPS;

        // Check thresholds
        if (fps < this.config.criticalThreshold) {
            this.handlePerformanceIssue('critical', fps);
        } else if (fps < this.config.warnThreshold) {
            this.handlePerformanceIssue('warning', fps);
        }

        // Auto-adjust quality if enabled
        if (this.config.autoAdjustQuality) {
            this.adjustQuality();
        }
    }

    /**
     * Handle performance issues
     * @private
     */
    handlePerformanceIssue(severity, fps) {
        const issue = {
            severity,
            fps,
            averageFPS: this.state.averageFPS,
            droppedFrames: this.state.droppedFrames,
            timestamp: performance.now()
        };

        if (this.onPerformanceWarning) {
            this.onPerformanceWarning(issue);
        }

        if (window.DEBUG) {
            console.warn(`Performance ${severity}:`, issue);
        }
    }

    /**
     * Auto-adjust quality based on performance
     * @private
     */
    adjustQuality() {
        const fps = this.state.averageFPS;
        let newQuality = this.state.qualityLevel;

        if (fps < 30 && this.state.qualityLevel !== 'low') {
            newQuality = 'low';
        } else if (fps < 45 && this.state.qualityLevel === 'high') {
            newQuality = 'medium';
        } else if (fps > 55 && this.state.qualityLevel === 'low') {
            newQuality = 'medium';
        } else if (fps > 58 && this.state.qualityLevel === 'medium') {
            newQuality = 'high';
        }

        if (newQuality !== this.state.qualityLevel) {
            this.state.qualityLevel = newQuality;
            if (this.onQualityChange) {
                this.onQualityChange(newQuality);
            }
        }
    }

    /**
     * Measure a gesture's execution time
     * @param {string} gestureName - Name of the gesture
     * @param {number} duration - Execution duration in ms
     */
    measureGesture(gestureName, duration) {
        if (!this.metrics.gestureTimes.has(gestureName)) {
            this.metrics.gestureTimes.set(gestureName, []);
        }

        const times = this.metrics.gestureTimes.get(gestureName);
        times.push(duration);

        // Keep only recent measurements
        if (times.length > 10) {
            times.shift();
        }
    }

    /**
     * Start memory monitoring
     * @private
     */
    startMemoryMonitoring() {
        this.memoryInterval = setInterval(() => {
            if (performance.memory) {
                const usage = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    ratio: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit,
                    timestamp: performance.now()
                };

                this.metrics.memoryUsage.push(usage);
                if (this.metrics.memoryUsage.length > 20) {
                    this.metrics.memoryUsage.shift();
                }

                // Check for memory issues
                if (usage.ratio > 0.9) {
                    console.warn('High memory usage:', usage);
                }
            }
        }, this.config.memoryCheckInterval);
    }

    /**
     * Mark a performance point
     * @param {string} name - Mark name
     */
    mark(name) {
        if (!this.monitoring) return;

        performance.mark(name);
        this.marks.set(name, performance.now());
    }

    /**
     * Measure between two marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     * @returns {number} Duration in ms
     */
    measure(name, startMark, endMark) {
        if (!this.monitoring) return 0;

        try {
            performance.measure(name, startMark, endMark);
            const entries = performance.getEntriesByName(name);
            if (entries.length > 0) {
                const duration = entries[entries.length - 1].duration;

                if (!this.measures.has(name)) {
                    this.measures.set(name, []);
                }
                this.measures.get(name).push(duration);

                return duration;
            }
        } catch (e) {
            // Marks may not exist
        }

        return 0;
    }

    /**
     * Get current metrics
     * @returns {Object} Current performance metrics
     */
    getMetrics() {
        return {
            fps: {
                current: Math.round(this.state.currentFPS),
                average: Math.round(this.state.averageFPS),
                min: Math.round(this.state.minFPS),
                max: Math.round(this.state.maxFPS)
            },
            frameTime: {
                current: this.state.frameTime.toFixed(2),
                average: this.state.averageFrameTime.toFixed(2)
            },
            frames: {
                total: this.state.totalFrames,
                dropped: this.state.droppedFrames,
                droppedPercentage: ((this.state.droppedFrames / this.state.totalFrames) * 100).toFixed(1)
            },
            performance: {
                score: this.state.performanceScore,
                quality: this.state.qualityLevel
            },
            memory: this.getMemoryMetrics(),
            gestures: this.getGestureMetrics()
        };
    }

    /**
     * Get memory metrics
     * @private
     */
    getMemoryMetrics() {
        if (this.metrics.memoryUsage.length === 0) {
            return null;
        }

        const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        return {
            used: (latest.used / 1048576).toFixed(2) + ' MB',
            total: (latest.total / 1048576).toFixed(2) + ' MB',
            limit: (latest.limit / 1048576).toFixed(2) + ' MB',
            percentage: (latest.ratio * 100).toFixed(1) + '%'
        };
    }

    /**
     * Get gesture metrics
     * @private
     */
    getGestureMetrics() {
        const metrics = {};

        this.metrics.gestureTimes.forEach((times, gesture) => {
            if (times.length > 0) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                metrics[gesture] = {
                    average: avg.toFixed(2),
                    count: times.length
                };
            }
        });

        return metrics;
    }

    /**
     * Log performance data
     * @private
     */
    logPerformance() {
        if (!window.DEBUG) return;

        const metrics = this.getMetrics();
        console.log('%c[Performance]', 'color: #10B981; font-weight: bold;', metrics);
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = {
            fps: [],
            frameTimes: [],
            gestureTimes: new Map(),
            renderTimes: [],
            memoryUsage: [],
            drawCalls: [],
            particleCount: []
        };

        this.state = {
            currentFPS: 0,
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameTime: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            totalFrames: 0,
            performanceScore: 100,
            qualityLevel: 'high'
        };

        this.marks.clear();
        this.measures.clear();

        this.lastFrameTime = 0;
        this.frameStartTime = 0;
        this.startTime = performance.now();
        this.lastLogTime = this.startTime;
    }

    /**
     * Get a performance report
     * @returns {string} Formatted performance report
     */
    getReport() {
        const metrics = this.getMetrics();
        const uptime = ((performance.now() - this.startTime) / 1000).toFixed(1);

        return `
Performance Report (${uptime}s uptime)
=====================================
FPS: ${metrics.fps.average} avg (${metrics.fps.min}-${metrics.fps.max})
Frame Time: ${metrics.frameTime.average}ms avg
Dropped Frames: ${metrics.frames.dropped} (${metrics.frames.droppedPercentage}%)
Performance Score: ${metrics.performance.score}/100
Quality Level: ${metrics.performance.quality}
${metrics.memory ? `Memory: ${metrics.memory.used} / ${metrics.memory.limit} (${metrics.memory.percentage})` : 'Memory: N/A'}
        `.trim();
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.stop();
        this.reset();
        this.onPerformanceWarning = null;
        this.onQualityChange = null;
    }
}

// Export singleton instance for convenience
export const performanceMonitor = new PerformanceMonitor({
    autoStart: false
});

// Export default
export default PerformanceMonitor;

// Make available globally for debugging
if (typeof window !== 'undefined' && window.DEBUG) {
    window.performanceMonitor = performanceMonitor;
}