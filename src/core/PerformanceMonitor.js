/**
 * Performance monitoring system for the Emotive Engine
 * Tracks FPS, memory usage, render times, and other metrics
 */

export class PerformanceMonitor {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.sampleInterval = options.sampleInterval || 1000; // 1 second
        this.maxSamples = options.maxSamples || 60; // Keep 1 minute of data
        this.enableMemoryTracking = options.enableMemoryTracking !== false;
        this.enableNetworkTracking = options.enableNetworkTracking !== false;

        this.metrics = {
            fps: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            frameTime: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            memory: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            renderTime: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            updateTime: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            particleCount: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            drawCalls: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 },
            canvasOperations: { samples: [], current: 0, avg: 0, min: Infinity, max: 0 }
        };

        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.lastSampleTime = 0;
        this.marks = new Map();
        this.measures = new Map();

        this.thresholds = {
            fps: { warning: 50, critical: 30 },
            frameTime: { warning: 20, critical: 33 },
            memory: { warning: 100, critical: 200 }, // MB
            renderTime: { warning: 10, critical: 16 },
            ...options.thresholds
        };

        this.callbacks = {
            onWarning: options.onWarning || null,
            onCritical: options.onCritical || null,
            onSample: options.onSample || null
        };

        if (this.enabled) {
            this.start();
        }
    }

    start() {
        if (!this.enabled) return;

        this.lastSampleTime = performance.now();
        this.lastFrameTime = performance.now();
        this.frameCount = 0;

        // Start sampling interval
        this.sampleIntervalId = setInterval(() => this.sample(), this.sampleInterval);
    }

    stop() {
        if (this.sampleIntervalId) {
            clearInterval(this.sampleIntervalId);
            this.sampleIntervalId = null;
        }
    }

    frame(timestamp = performance.now()) {
        if (!this.enabled) return;

        this.frameCount++;
        const deltaTime = timestamp - this.lastFrameTime;

        // Update frame time
        this.metrics.frameTime.current = deltaTime;

        // Calculate instant FPS
        if (deltaTime > 0) {
            this.metrics.fps.current = 1000 / deltaTime;
        }

        this.lastFrameTime = timestamp;
    }

    mark(name, timestamp = performance.now()) {
        if (!this.enabled) return;

        this.marks.set(name, timestamp);
    }

    measure(name, startMark, endMark = null) {
        if (!this.enabled) return 0;

        const startTime = this.marks.get(startMark);
        if (!startTime) return 0;

        const endTime = endMark ? this.marks.get(endMark) : performance.now();
        const duration = endTime - startTime;

        let measures = this.measures.get(name);
        if (!measures) {
            measures = [];
            this.measures.set(name, measures);
        }

        measures.push(duration);

        // Keep only recent measures
        if (measures.length > this.maxSamples) {
            measures.shift();
        }

        // Update specific metrics if they match known patterns
        if (name === 'render') {
            this.metrics.renderTime.current = duration;
        } else if (name === 'update') {
            this.metrics.updateTime.current = duration;
        }

        return duration;
    }

    recordMetric(name, value) {
        if (!this.enabled) return;

        if (this.metrics[name]) {
            this.metrics[name].current = value;
        }
    }

    sample() {
        const now = performance.now();
        const deltaTime = now - this.lastSampleTime;

        // Calculate average FPS over the sample interval
        const avgFPS = (this.frameCount * 1000) / deltaTime;

        // Update FPS metrics
        this.updateMetric('fps', avgFPS);

        // Update memory if available
        if (this.enableMemoryTracking && performance.memory) {
            const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
            this.updateMetric('memory', memoryMB);
        }

        // Update other current metrics
        for (const key in this.metrics) {
            if (key !== 'fps' && key !== 'memory') {
                this.updateMetric(key, this.metrics[key].current);
            }
        }

        // Check thresholds
        this.checkThresholds();

        // Reset frame counter
        this.frameCount = 0;
        this.lastSampleTime = now;

        // Call sample callback
        if (this.callbacks.onSample) {
            this.callbacks.onSample(this.getStats());
        }
    }

    updateMetric(name, value) {
        const metric = this.metrics[name];
        if (!metric) return;

        metric.current = value;
        metric.samples.push(value);

        // Keep only recent samples
        if (metric.samples.length > this.maxSamples) {
            metric.samples.shift();
        }

        // Calculate statistics
        if (metric.samples.length > 0) {
            metric.avg = metric.samples.reduce((a, b) => a + b, 0) / metric.samples.length;
            metric.min = Math.min(metric.min, value);
            metric.max = Math.max(metric.max, value);
        }
    }

    checkThresholds() {
        for (const [key, threshold] of Object.entries(this.thresholds)) {
            const metric = this.metrics[key];
            if (!metric) continue;

            const value = metric.current;
            const isInverted = key === 'fps'; // Lower values are worse for FPS

            let level = 'normal';
            if (isInverted) {
                if (value <= threshold.critical) {
                    level = 'critical';
                } else if (value <= threshold.warning) {
                    level = 'warning';
                }
            } else {
                if (value >= threshold.critical) {
                    level = 'critical';
                } else if (value >= threshold.warning) {
                    level = 'warning';
                }
            }

            if (level === 'critical' && this.callbacks.onCritical) {
                this.callbacks.onCritical(key, value, threshold.critical);
            } else if (level === 'warning' && this.callbacks.onWarning) {
                this.callbacks.onWarning(key, value, threshold.warning);
            }
        }
    }

    getStats() {
        const stats = {};

        for (const [key, metric] of Object.entries(this.metrics)) {
            stats[key] = {
                current: metric.current,
                average: metric.avg,
                min: metric.min === Infinity ? 0 : metric.min,
                max: metric.max,
                samples: metric.samples.length
            };
        }

        // Add computed metrics
        stats.performance = this.getPerformanceScore();
        stats.health = this.getHealthStatus();

        return stats;
    }

    getPerformanceScore() {
        // Calculate a 0-100 performance score based on metrics
        let score = 100;

        // FPS impact (max 40 points)
        const fpsRatio = Math.min(this.metrics.fps.current / 60, 1);
        score -= (1 - fpsRatio) * 40;

        // Frame time impact (max 30 points)
        const frameTimeRatio = Math.min(16.67 / Math.max(this.metrics.frameTime.current, 1), 1);
        score -= (1 - frameTimeRatio) * 30;

        // Memory impact (max 20 points)
        if (this.metrics.memory.current > 0) {
            const memoryRatio = Math.min(100 / Math.max(this.metrics.memory.current, 1), 1);
            score -= (1 - memoryRatio) * 20;
        }

        // Render time impact (max 10 points)
        const renderRatio = Math.min(10 / Math.max(this.metrics.renderTime.current, 1), 1);
        score -= (1 - renderRatio) * 10;

        return Math.max(0, Math.round(score));
    }

    getHealthStatus() {
        const score = this.getPerformanceScore();

        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 50) return 'fair';
        if (score >= 25) return 'poor';
        return 'critical';
    }

    reset() {
        for (const metric of Object.values(this.metrics)) {
            metric.samples = [];
            metric.current = 0;
            metric.avg = 0;
            metric.min = Infinity;
            metric.max = 0;
        }

        this.marks.clear();
        this.measures.clear();
        this.frameCount = 0;
    }

    exportData() {
        return {
            timestamp: Date.now(),
            metrics: this.getStats(),
            measures: Array.from(this.measures.entries()).map(([name, values]) => ({
                name,
                values,
                average: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            })),
            thresholds: this.thresholds
        };
    }

    setThreshold(metric, warning, critical) {
        if (this.thresholds[metric]) {
            this.thresholds[metric] = { warning, critical };
        }
    }

    enable() {
        this.enabled = true;
        this.start();
    }

    disable() {
        this.enabled = false;
        this.stop();
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor({
    enabled: true,
    sampleInterval: 1000,
    maxSamples: 60,
    thresholds: {
        fps: { warning: 50, critical: 30 },
        frameTime: { warning: 20, critical: 33 },
        memory: { warning: 150, critical: 300 },
        renderTime: { warning: 10, critical: 16 },
        updateTime: { warning: 5, critical: 10 }
    }
});

// Export default
export default PerformanceMonitor;