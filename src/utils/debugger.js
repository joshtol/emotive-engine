/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                      ◐ ◑ ◒ ◓  DEBUGGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Debugger - Enhanced Logging & Performance Profiling
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module Debugger
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The DIAGNOSTIC CENTER of the engine. Provides comprehensive debugging tools,
 * ║ performance profiling, memory tracking, and runtime diagnostics to ensure
 * ║ smooth operation and help developers optimize their implementations.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🐛 DEBUG FEATURES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Multi-level logging (NONE, ERROR, WARN, INFO, DEBUG, TRACE)
 * │ • Performance profiling with timing metrics
 * │ • Memory usage tracking and leak detection
 * │ • Error tracking and stack trace capture
 * │ • Runtime capability detection
 * │ • Visual debugging overlays
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Debug levels for controlling log output
 */
export const DebugLevel = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5,
};

/**
 * Enhanced debugger with performance profiling and error tracking
 */
export class EmotiveDebugger {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled !== false,
            level: config.level || DebugLevel.INFO,
            enableProfiling: config.enableProfiling !== false,
            enableErrorTracking: config.enableErrorTracking !== false,
            enableMemoryTracking: config.enableMemoryTracking !== false,
            maxLogEntries: config.maxLogEntries || 1000,
            maxProfileEntries: config.maxProfileEntries || 500,
            ...config,
        };

        // Log storage
        this.logs = [];
        this.errors = [];
        this.profiles = new Map();
        this.memorySnapshots = [];

        // Performance tracking
        this.frameTimings = [];
        this.maxFrameTimings = 120; // 2 seconds at 60fps

        // Error tracking
        this.errorCounts = new Map();
        this.lastErrors = new Map();

        // Feature detection for debugging capabilities
        this.capabilities = {
            performance: typeof performance !== 'undefined' && performance.now,
            memory: typeof performance !== 'undefined' && performance.memory,
            console: typeof console !== 'undefined',
            stackTrace: typeof Error !== 'undefined',
        };

        // Initialize
        this.startTime = this.now();
        this.setupErrorHandling();

        if (this.config.enabled) {
            this.log('DEBUG', 'EmotiveDebugger initialized', {
                config: this.config,
                capabilities: this.capabilities,
            });
        }
    }

    /**
     * Get current high-resolution timestamp
     * @returns {number} Timestamp in milliseconds
     */
    now() {
        if (this.capabilities.performance) {
            return performance.now();
        }
        return Date.now() - this.startTime;
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        if (!this.config.enableErrorTracking || typeof window === 'undefined') {
            return;
        }

        // Capture unhandled errors
        window.addEventListener('error', event => {
            this.trackError('UNHANDLED_ERROR', event.error || new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', event => {
            this.trackError('UNHANDLED_REJECTION', event.reason, {
                promise: event.promise,
            });
        });
    }

    /**
     * Log a message with specified level
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    log(level, message, data = null) {
        if (!this.config.enabled) return;

        const levelValue = DebugLevel[level] || DebugLevel.INFO;
        if (levelValue > this.config.level) return;

        const timestamp = this.now();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            stackTrace: this.getStackTrace(),
        };

        // Store log entry
        this.logs.push(logEntry);
        if (this.logs.length > this.config.maxLogEntries) {
            this.logs.shift();
        }

        // Console output
        if (this.capabilities.console) {
            const consoleMethod = this.getConsoleMethod(level);
            const timeStr = `[${(timestamp / 1000).toFixed(3)}s]`;

            if (data) {
                consoleMethod(`${timeStr} [${level}] ${message}`, data);
            } else {
                consoleMethod(`${timeStr} [${level}] ${message}`);
            }
        }
    }

    /**
     * Get appropriate console method for log level
     * @param {string} level - Log level
     * @returns {Function} Console method
     */
    getConsoleMethod(level) {
        switch (level) {
            case 'ERROR':
                return (() => {}).bind(console);
            case 'WARN':
                return (() => {}).bind(console);
            case 'DEBUG':
                return (() => {}).bind(console);
            case 'TRACE':
                return (() => {}).bind(console);
            default:
                return (() => {}).bind(console);
        }
    }

    /**
     * Get current stack trace
     * @returns {string|null} Stack trace or null if not available
     */
    getStackTrace() {
        if (!this.capabilities.stackTrace) return null;

        try {
            throw new Error();
        } catch (e) {
            return e.stack;
        }
    }

    /**
     * Track an error with context
     * @param {string} type - Error type
     * @param {Error} error - Error object
     * @param {Object} context - Additional context
     */
    trackError(type, error, context = {}) {
        if (!this.config.enableErrorTracking) return;

        const timestamp = this.now();
        const errorEntry = {
            timestamp,
            type,
            message: error.message || String(error),
            stack: error.stack,
            context,
            count: 1,
        };

        // Update error counts
        const errorKey = `${type}:${error.message}`;
        if (this.errorCounts.has(errorKey)) {
            this.errorCounts.set(errorKey, this.errorCounts.get(errorKey) + 1);
            errorEntry.count = this.errorCounts.get(errorKey);
        } else {
            this.errorCounts.set(errorKey, 1);
        }

        // Store error
        this.errors.push(errorEntry);
        this.lastErrors.set(type, errorEntry);

        // Log error
        this.log('ERROR', `${type}: ${error.message}`, {
            error: errorEntry,
            context,
        });
    }

    /**
     * Start profiling a named operation
     * @param {string} name - Profile name
     * @param {Object} metadata - Additional metadata
     */
    startProfile(name, metadata = {}) {
        if (!this.config.enableProfiling) return;

        const profile = {
            name,
            startTime: this.now(),
            metadata,
            samples: [],
            isActive: true,
        };

        this.profiles.set(name, profile);
        this.log('TRACE', `Started profiling: ${name}`, metadata);
    }

    /**
     * Add a sample to an active profile
     * @param {string} name - Profile name
     * @param {string} label - Sample label
     * @param {*} data - Sample data
     */
    profileSample(name, label, data = null) {
        if (!this.config.enableProfiling) return;

        const profile = this.profiles.get(name);
        if (!profile || !profile.isActive) return;

        const sample = {
            timestamp: this.now(),
            label,
            data,
            relativeTime: this.now() - profile.startTime,
        };

        profile.samples.push(sample);
    }

    /**
     * End profiling and get results
     * @param {string} name - Profile name
     * @returns {Object|null} Profile results or null if not found
     */
    endProfile(name) {
        if (!this.config.enableProfiling) return null;

        const profile = this.profiles.get(name);
        if (!profile || !profile.isActive) return null;

        profile.endTime = this.now();
        profile.duration = profile.endTime - profile.startTime;
        profile.isActive = false;

        // Calculate statistics
        profile.stats = this.calculateProfileStats(profile);

        this.log('TRACE', `Ended profiling: ${name}`, {
            duration: profile.duration,
            samples: profile.samples.length,
            stats: profile.stats,
        });

        // Limit stored profiles
        if (this.profiles.size > this.config.maxProfileEntries) {
            const oldestKey = this.profiles.keys().next().value;
            this.profiles.delete(oldestKey);
        }

        return { ...profile };
    }

    /**
     * Calculate statistics for a profile
     * @param {Object} profile - Profile data
     * @returns {Object} Profile statistics
     */
    calculateProfileStats(profile) {
        if (profile.samples.length === 0) {
            return { sampleCount: 0 };
        }

        const durations = [];
        for (let i = 1; i < profile.samples.length; i++) {
            durations.push(profile.samples[i].relativeTime - profile.samples[i - 1].relativeTime);
        }

        if (durations.length === 0) {
            return { sampleCount: profile.samples.length };
        }

        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        return {
            sampleCount: profile.samples.length,
            avgSampleDuration: avg,
            minSampleDuration: min,
            maxSampleDuration: max,
            totalDuration: profile.duration,
        };
    }

    /**
     * Track frame timing for performance analysis
     * @param {number} frameTime - Frame time in milliseconds
     */
    trackFrameTiming(frameTime) {
        if (!this.config.enableProfiling) return;

        this.frameTimings.push({
            timestamp: this.now(),
            frameTime,
            fps: 1000 / frameTime,
        });

        if (this.frameTimings.length > this.maxFrameTimings) {
            this.frameTimings.shift();
        }
    }

    /**
     * Take a memory snapshot (if supported)
     * @param {string} label - Snapshot label
     */
    takeMemorySnapshot(label = 'snapshot') {
        if (!this.config.enableMemoryTracking || !this.capabilities.memory) return;

        const snapshot = {
            timestamp: this.now(),
            label,
            memory: {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            },
        };

        this.memorySnapshots.push(snapshot);

        // Limit snapshots
        if (this.memorySnapshots.length > 100) {
            this.memorySnapshots.shift();
        }

        this.log('DEBUG', `Memory snapshot: ${label}`, snapshot.memory);
    }

    /**
     * Get comprehensive debug report
     * @returns {Object} Debug report
     */
    getDebugReport() {
        const report = {
            timestamp: this.now(),
            uptime: this.now() - 0,
            config: this.config,
            capabilities: this.capabilities,

            // Logs
            logCount: this.logs.length,
            recentLogs: this.logs.slice(-10),

            // Errors
            errorCount: this.errors.length,
            uniqueErrors: this.errorCounts.size,
            recentErrors: this.errors.slice(-5),
            errorCounts: Object.fromEntries(this.errorCounts),

            // Profiles
            activeProfiles: Array.from(this.profiles.values()).filter(p => p.isActive).length,
            completedProfiles: Array.from(this.profiles.values()).filter(p => !p.isActive).length,

            // Performance
            frameTimings: this.getFrameTimingStats(),

            // Memory
            memorySnapshots: this.memorySnapshots.slice(-5),
        };

        return report;
    }

    /**
     * Get frame timing statistics
     * @returns {Object} Frame timing stats
     */
    getFrameTimingStats() {
        if (this.frameTimings.length === 0) {
            return { sampleCount: 0 };
        }

        const frameTimes = this.frameTimings.map(f => f.frameTime);
        const fps = this.frameTimings.map(f => f.fps);

        return {
            sampleCount: this.frameTimings.length,
            avgFrameTime: frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length,
            minFrameTime: Math.min(...frameTimes),
            maxFrameTime: Math.max(...frameTimes),
            avgFPS: fps.reduce((a, b) => a + b, 0) / fps.length,
            minFPS: Math.min(...fps),
            maxFPS: Math.max(...fps),
        };
    }

    /**
     * Export debug data for external analysis
     * @returns {Object} Exportable debug data
     */
    exportDebugData() {
        return {
            metadata: {
                exportTime: Date.now(),
                debuggerUptime: this.now(),
                config: this.config,
                capabilities: this.capabilities,
            },
            logs: [...this.logs],
            errors: [...this.errors],
            profiles: Object.fromEntries(this.profiles),
            frameTimings: [...this.frameTimings],
            memorySnapshots: [...this.memorySnapshots],
            errorCounts: Object.fromEntries(this.errorCounts),
        };
    }

    /**
     * Clear all debug data
     */
    clear() {
        this.logs = [];
        this.errors = [];
        this.profiles.clear();
        this.frameTimings = [];
        this.memorySnapshots = [];
        this.errorCounts.clear();
        this.lastErrors.clear();

        this.log('INFO', 'Debug data cleared');
    }

    /**
     * Destroy the debugger and clean up
     */
    destroy() {
        this.clear();
        this.config.enabled = false;

        // Remove event listeners if we added them
        if (typeof window !== 'undefined') {
            // Note: In a real implementation, we'd need to store references to remove them
            // For now, just disable the debugger
        }
    }
}

/**
 * Runtime feature detection and capability reporting
 */
export class RuntimeCapabilities {
    constructor() {
        this.capabilities = this.detectCapabilities();
        this.performance = this.measurePerformance();
    }

    /**
     * Detect runtime capabilities
     * @returns {Object} Capability detection results
     */
    detectCapabilities() {
        const caps = {
            // JavaScript features
            es6: this.detectES6(),
            es2017: this.detectES2017(),
            modules: this.detectModules(),

            // Browser APIs
            webGL: this.detectWebGL(),
            webGL2: this.detectWebGL2(),
            webWorkers: this.detectWebWorkers(),
            serviceWorkers: this.detectServiceWorkers(),

            // Performance APIs
            performanceObserver: this.detectPerformanceObserver(),
            intersectionObserver: this.detectIntersectionObserver(),
            resizeObserver: this.detectResizeObserver(),

            // Storage
            localStorage: this.detectLocalStorage(),
            sessionStorage: this.detectSessionStorage(),
            indexedDB: this.detectIndexedDB(),

            // Network
            fetch: this.detectFetch(),
            webSockets: this.detectWebSockets(),

            // Device capabilities
            touchEvents: this.detectTouchEvents(),
            pointerEvents: this.detectPointerEvents(),
            deviceOrientation: this.detectDeviceOrientation(),

            // Graphics
            canvas2d: this.detectCanvas2D(),
            canvasFilters: this.detectCanvasFilters(),
            offscreenCanvas: this.detectOffscreenCanvas(),
        };

        return caps;
    }

    detectES6() {
        try {
            // Check for arrow functions and classes without eval
            return (
                typeof Symbol !== 'undefined' &&
                typeof Promise !== 'undefined' &&
                typeof Map !== 'undefined' &&
                typeof Set !== 'undefined'
            );
        } catch {
            return false;
        }
    }

    detectES2017() {
        try {
            // Check for async/await support
            return (
                typeof async !== 'undefined' ||
                (function () {
                    try {
                        // Check if async functions are supported without using Function constructor
                        return typeof async function () {}.constructor === 'function';
                    } catch {
                        return false;
                    }
                })()
            );
        } catch {
            return false;
        }
    }

    detectModules() {
        try {
            return (
                typeof document !== 'undefined' && 'noModule' in document.createElement('script')
            );
        } catch {
            return false;
        }
    }

    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    detectWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch {
            return false;
        }
    }

    detectWebWorkers() {
        return typeof Worker !== 'undefined';
    }

    detectServiceWorkers() {
        return 'serviceWorker' in navigator;
    }

    detectPerformanceObserver() {
        return typeof PerformanceObserver !== 'undefined';
    }

    detectIntersectionObserver() {
        return typeof IntersectionObserver !== 'undefined';
    }

    detectResizeObserver() {
        return typeof ResizeObserver !== 'undefined';
    }

    detectLocalStorage() {
        try {
            return typeof localStorage !== 'undefined' && localStorage !== null;
        } catch {
            return false;
        }
    }

    detectSessionStorage() {
        try {
            return typeof sessionStorage !== 'undefined' && sessionStorage !== null;
        } catch {
            return false;
        }
    }

    detectIndexedDB() {
        return typeof indexedDB !== 'undefined';
    }

    detectFetch() {
        return typeof fetch !== 'undefined';
    }

    detectWebSockets() {
        return typeof WebSocket !== 'undefined';
    }

    detectTouchEvents() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    detectPointerEvents() {
        return typeof PointerEvent !== 'undefined';
    }

    detectDeviceOrientation() {
        return 'ondeviceorientation' in window;
    }

    detectCanvas2D() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('2d');
        } catch {
            return false;
        }
    }

    detectCanvasFilters() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            return 'filter' in ctx;
        } catch {
            return false;
        }
    }

    detectOffscreenCanvas() {
        return typeof OffscreenCanvas !== 'undefined';
    }

    /**
     * Measure basic performance characteristics
     * @returns {Object} Performance measurements
     */
    measurePerformance() {
        const measurements = {};

        // Measure JavaScript execution speed
        const start = performance.now();
        for (let i = 0; i < 100000; i++) {
            Math.random(); // Benchmark loop
        }
        measurements.jsExecutionSpeed = performance.now() - start;

        // Measure canvas performance
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');

            const canvasStart = performance.now();
            for (let i = 0; i < 1000; i++) {
                ctx.fillRect(Math.random() * 100, Math.random() * 100, 10, 10);
            }
            measurements.canvasPerformance = performance.now() - canvasStart;
        } catch {
            measurements.canvasPerformance = null;
        }

        return measurements;
    }

    /**
     * Get all capabilities
     * @returns {Object} All detected capabilities
     */
    getCapabilities() {
        return { ...this.capabilities };
    }

    /**
     * Get performance measurements
     * @returns {Object} Performance measurements
     */
    getPerformance() {
        return { ...this.performance };
    }

    /**
     * Generate capability report
     * @returns {Object} Comprehensive capability report
     */
    generateReport() {
        const supportedFeatures = Object.entries(this.capabilities)
            .filter(([, supported]) => supported)
            .map(([feature]) => feature);

        const unsupportedFeatures = Object.entries(this.capabilities)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);

        const supportPercentage =
            (supportedFeatures.length / Object.keys(this.capabilities).length) * 100;

        return {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            supportedFeatures,
            unsupportedFeatures,
            supportPercentage: Math.round(supportPercentage),
            performance: this.performance,
            recommendations: this.generateRecommendations(supportPercentage),
        };
    }

    /**
     * Generate recommendations based on capabilities
     * @param {number} supportPercentage - Percentage of supported features
     * @returns {Array<string>} Recommendations
     */
    generateRecommendations(supportPercentage) {
        const recommendations = [];

        if (supportPercentage < 50) {
            recommendations.push('Consider using the minimal build for better compatibility');
        }

        if (!this.capabilities.webGL) {
            recommendations.push('WebGL not supported - advanced graphics features unavailable');
        }

        if (!this.capabilities.webWorkers) {
            recommendations.push('Web Workers not supported - background processing unavailable');
        }

        if (!this.capabilities.fetch) {
            recommendations.push(
                'Fetch API not supported - consider using XMLHttpRequest polyfill'
            );
        }

        if (this.performance.jsExecutionSpeed > 50) {
            recommendations.push(
                'Slow JavaScript execution detected - consider performance optimizations'
            );
        }

        if (this.performance.canvasPerformance > 100) {
            recommendations.push(
                'Slow canvas performance detected - consider reducing visual complexity'
            );
        }

        return recommendations;
    }
}

// Create singleton instances for convenience
export const emotiveDebugger = new EmotiveDebugger({
    enabled:
        typeof window !== 'undefined' &&
        window.location &&
        window.location.search.includes('debug=true'),
    level: DebugLevel.INFO,
});

export const runtimeCapabilities = new RuntimeCapabilities();
