/**
 * Error tracking and reporting system for the Emotive Engine
 * Captures, categorizes, and reports errors with context
 */

export class ErrorTracker {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.maxErrors = options.maxErrors || 100;
        this.maxStackFrames = options.maxStackFrames || 10;
        this.reportingThreshold = options.reportingThreshold || 10;
        this.reportingInterval = options.reportingInterval || 60000; // 1 minute

        this.errors = [];
        this.errorCounts = new Map();
        this.errorPatterns = new Map();
        this.suppressedErrors = new Set(options.suppressedErrors || []);

        this.metadata = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            version: '2.4.0',
        };

        this.callbacks = {
            onError: options.onError || null,
            onReport: options.onReport || null,
            onCritical: options.onCritical || null,
        };

        this.severityLevels = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical',
        };

        this.errorCategories = {
            RENDERING: 'rendering',
            ANIMATION: 'animation',
            STATE: 'state',
            NETWORK: 'network',
            PLUGIN: 'plugin',
            USER_INPUT: 'user_input',
            PERFORMANCE: 'performance',
            UNKNOWN: 'unknown',
        };

        if (this.enabled) {
            this.attachGlobalHandlers();
            this.startReportingInterval();
        }
    }

    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    attachGlobalHandlers() {
        if (typeof window === 'undefined') return;

        // Handle uncaught errors
        this.originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            this.captureError(error || new Error(message), {
                source,
                lineno,
                colno,
                uncaught: true,
            });

            if (this.originalOnError) {
                return this.originalOnError(message, source, lineno, colno, error);
            }
            return true;
        };

        // Handle unhandled promise rejections
        this.originalOnUnhandledRejection = window.onunhandledrejection;
        window.onunhandledrejection = event => {
            this.captureError(new Error(event.reason), {
                type: 'unhandledRejection',
                promise: event.promise,
                uncaught: true,
            });

            if (this.originalOnUnhandledRejection) {
                return this.originalOnUnhandledRejection(event);
            }
        };
    }

    detachGlobalHandlers() {
        if (typeof window === 'undefined') return;

        if (this.originalOnError) {
            window.onerror = this.originalOnError;
        }

        if (this.originalOnUnhandledRejection) {
            window.onunhandledrejection = this.originalOnUnhandledRejection;
        }
    }

    captureError(error, context = {}) {
        if (!this.enabled) return;

        // Check if error should be suppressed
        if (this.shouldSuppress(error)) return;

        const errorInfo = this.processError(error, context);

        // Categorize error
        errorInfo.category = this.categorizeError(error, context);
        errorInfo.severity = this.determineSeverity(error, errorInfo.category);

        // Add to errors array
        this.errors.push(errorInfo);

        // Maintain max errors limit
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Update error counts
        const errorKey = `${errorInfo.name}:${errorInfo.message}`;
        this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

        // Detect patterns
        this.detectPatterns(errorInfo);

        // Call error callback
        if (this.callbacks.onError) {
            this.callbacks.onError(errorInfo);
        }

        // Check for critical errors
        if (errorInfo.severity === this.severityLevels.CRITICAL) {
            this.handleCriticalError(errorInfo);
        }

        return errorInfo;
    }

    processError(error, context) {
        const timestamp = Date.now();
        const stack = this.parseStackTrace(error.stack);

        return {
            id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            name: error.name || 'Error',
            message: error.message || String(error),
            stack: stack.slice(0, this.maxStackFrames),
            fullStack: error.stack,
            context: {
                ...context,
                url: typeof window !== 'undefined' ? window.location.href : 'unknown',
                userAgent: this.metadata.userAgent,
                sessionId: this.metadata.sessionId,
            },
            metadata: this.collectMetadata(),
        };
    }

    parseStackTrace(stack) {
        if (!stack) return [];

        const lines = stack.split('\n');
        const frames = [];

        for (const line of lines) {
            const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
                frames.push({
                    function: match[1],
                    file: match[2],
                    line: parseInt(match[3], 10),
                    column: parseInt(match[4], 10),
                });
            }
        }

        return frames;
    }

    categorizeError(error, context) {
        const message = error.message.toLowerCase();
        const stack = error.stack || '';

        if (
            message.includes('canvas') ||
            message.includes('render') ||
            stack.includes('Renderer')
        ) {
            return this.errorCategories.RENDERING;
        }

        if (message.includes('animation') || stack.includes('Animation')) {
            return this.errorCategories.ANIMATION;
        }

        if (message.includes('state') || stack.includes('State')) {
            return this.errorCategories.STATE;
        }

        if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
            return this.errorCategories.NETWORK;
        }

        if (message.includes('plugin') || stack.includes('Plugin')) {
            return this.errorCategories.PLUGIN;
        }

        if (context.source === 'user_input') {
            return this.errorCategories.USER_INPUT;
        }

        if (message.includes('performance') || message.includes('memory')) {
            return this.errorCategories.PERFORMANCE;
        }

        return this.errorCategories.UNKNOWN;
    }

    determineSeverity(error, category) {
        // Critical errors
        if (error.name === 'ReferenceError' || error.name === 'TypeError') {
            return this.severityLevels.CRITICAL;
        }

        if (
            category === this.errorCategories.RENDERING ||
            category === this.errorCategories.ANIMATION
        ) {
            return this.severityLevels.HIGH;
        }

        if (category === this.errorCategories.NETWORK) {
            return this.severityLevels.MEDIUM;
        }

        return this.severityLevels.LOW;
    }

    shouldSuppress(error) {
        const message = error.message || '';

        for (const pattern of this.suppressedErrors) {
            if (typeof pattern === 'string' && message.includes(pattern)) {
                return true;
            }
            if (pattern instanceof RegExp && pattern.test(message)) {
                return true;
            }
        }

        return false;
    }

    detectPatterns(errorInfo) {
        const key = `${errorInfo.category}:${errorInfo.severity}`;
        const pattern = this.errorPatterns.get(key) || {
            count: 0,
            firstSeen: Date.now(),
            lastSeen: null,
        };

        pattern.count++;
        pattern.lastSeen = Date.now();

        this.errorPatterns.set(key, pattern);

        // Detect error storms (many errors in short time)
        const recentErrors = this.errors.filter(e => Date.now() - e.timestamp < 5000);

        if (recentErrors.length > 10) {
            this.handleErrorStorm(recentErrors);
        }
    }

    handleCriticalError(errorInfo) {
        console.error('Critical error detected:', errorInfo);

        if (this.callbacks.onCritical) {
            this.callbacks.onCritical(errorInfo);
        }

        // Immediately report critical errors
        this.sendReport([errorInfo], 'critical');
    }

    handleErrorStorm(errors) {
        console.warn(`Error storm detected: ${errors.length} errors in 5 seconds`);

        // Group errors by type
        const grouped = new Map();
        for (const error of errors) {
            const key = `${error.name}:${error.message}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key).push(error);
        }

        // Report grouped errors
        this.sendReport(errors, 'storm');
    }

    collectMetadata() {
        const metadata = {};

        if (typeof window !== 'undefined') {
            metadata.viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            metadata.screen = {
                width: window.screen.width,
                height: window.screen.height,
                pixelRatio: window.devicePixelRatio,
            };

            if (performance.memory) {
                metadata.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
                };
            }
        }

        return metadata;
    }

    startReportingInterval() {
        this.reportingIntervalId = setInterval(() => {
            this.checkAndReport();
        }, this.reportingInterval);
    }

    stopReportingInterval() {
        if (this.reportingIntervalId) {
            clearInterval(this.reportingIntervalId);
            this.reportingIntervalId = null;
        }
    }

    checkAndReport() {
        if (this.errors.length >= this.reportingThreshold) {
            this.sendReport(this.errors.slice());
            this.errors = [];
        }
    }

    sendReport(errors, type = 'batch') {
        const report = {
            sessionId: this.metadata.sessionId,
            timestamp: Date.now(),
            type,
            errors,
            patterns: Array.from(this.errorPatterns.entries()),
            counts: Array.from(this.errorCounts.entries()),
            metadata: this.metadata,
        };

        if (this.callbacks.onReport) {
            this.callbacks.onReport(report);
        }

        return report;
    }

    getErrors(filter = {}) {
        let filtered = [...this.errors];

        if (filter.category) {
            filtered = filtered.filter(e => e.category === filter.category);
        }

        if (filter.severity) {
            filtered = filtered.filter(e => e.severity === filter.severity);
        }

        if (filter.since) {
            filtered = filtered.filter(e => e.timestamp >= filter.since);
        }

        return filtered;
    }

    getStats() {
        const stats = {
            total: this.errors.length,
            byCategory: {},
            bySeverity: {},
            patterns: this.errorPatterns.size,
            topErrors: [],
        };

        // Count by category
        for (const category of Object.values(this.errorCategories)) {
            stats.byCategory[category] = this.errors.filter(e => e.category === category).length;
        }

        // Count by severity
        for (const severity of Object.values(this.severityLevels)) {
            stats.bySeverity[severity] = this.errors.filter(e => e.severity === severity).length;
        }

        // Get top errors
        const sorted = Array.from(this.errorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        stats.topErrors = sorted.map(([key, count]) => ({ error: key, count }));

        return stats;
    }

    clearErrors() {
        this.errors = [];
        this.errorCounts.clear();
        this.errorPatterns.clear();
    }

    suppressError(pattern) {
        this.suppressedErrors.add(pattern);
    }

    unsuppressError(pattern) {
        this.suppressedErrors.delete(pattern);
    }

    enable() {
        this.enabled = true;
        this.attachGlobalHandlers();
        this.startReportingInterval();
    }

    disable() {
        this.enabled = false;
        this.detachGlobalHandlers();
        this.stopReportingInterval();
    }

    destroy() {
        this.disable();
        this.clearErrors();
    }
}

// Create singleton instance
export const errorTracker = new ErrorTracker({
    enabled: true,
    maxErrors: 100,
    reportingThreshold: 10,
    reportingInterval: 60000,
    suppressedErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
    ],
});

// Export default
export default ErrorTracker;
