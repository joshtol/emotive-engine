/**
 * Health Check System for Emotive Engine
 * Provides real-time health monitoring and diagnostics
 */

export class HealthCheck {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.interval = options.interval || 30000; // 30 seconds
        this.thresholds = {
            memory: options.memoryThreshold || 500, // MB
            fps: options.fpsThreshold || 30,
            errorRate: options.errorRateThreshold || 0.1, // 10%
            responseTime: options.responseTimeThreshold || 1000, // ms
            ...options.thresholds
        };

        this.checks = new Map();
        this.history = [];
        this.maxHistory = options.maxHistory || 100;
        this.status = 'initializing';
        this.lastCheck = null;

        this.dependencies = {
            animationLoop: null,
            stateStore: null,
            eventManager: null,
            performanceMonitor: null,
            errorTracker: null
        };

        this.callbacks = {
            onHealthy: options.onHealthy || null,
            onWarning: options.onWarning || null,
            onCritical: options.onCritical || null,
            onStatusChange: options.onStatusChange || null
        };

        this.registerDefaultChecks();

        if (this.enabled) {
            this.start();
        }
    }

    registerDefaultChecks() {
        // System checks
        this.registerCheck('memory', () => this.checkMemory());
        this.registerCheck('performance', () => this.checkPerformance());
        this.registerCheck('errors', () => this.checkErrors());
        this.registerCheck('dom', () => this.checkDOM());
        this.registerCheck('animation', () => this.checkAnimation());
        this.registerCheck('state', () => this.checkState());
        this.registerCheck('events', () => this.checkEvents());
        this.registerCheck('storage', () => this.checkStorage());
        this.registerCheck('network', () => this.checkNetwork());
        this.registerCheck('browser', () => this.checkBrowser());
    }

    registerCheck(name, checkFn, options = {}) {
        this.checks.set(name, {
            fn: checkFn,
            critical: options.critical || false,
            weight: options.weight || 1,
            timeout: options.timeout || 5000,
            lastResult: null,
            lastRun: null
        });
    }

    checkMemory() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / (1024 * 1024);
            const total = performance.memory.totalJSHeapSize / (1024 * 1024);
            const limit = performance.memory.jsHeapSizeLimit / (1024 * 1024);

            result.details = {
                used: Math.round(used),
                total: Math.round(total),
                limit: Math.round(limit),
                percentage: Math.round((used / limit) * 100)
            };

            if (used > this.thresholds.memory) {
                result.status = 'critical';
                result.message = `Memory usage too high: ${Math.round(used)}MB`;
            } else if (used > this.thresholds.memory * 0.8) {
                result.status = 'warning';
                result.message = `Memory usage approaching limit: ${Math.round(used)}MB`;
            }
        } else {
            result.status = 'unknown';
            result.message = 'Memory API not available';
        }

        return result;
    }

    checkPerformance() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (this.dependencies.performanceMonitor) {
            const stats = this.dependencies.performanceMonitor.getStats();
            result.details = {
                fps: stats.fps.current,
                frameTime: stats.frameTime.current,
                health: stats.health,
                score: stats.performance
            };

            if (stats.fps.current < this.thresholds.fps) {
                result.status = 'warning';
                result.message = `Low FPS: ${stats.fps.current}`;
            }

            if (stats.health === 'critical' || stats.health === 'poor') {
                result.status = 'critical';
                result.message = 'Performance is critically low';
            }
        }

        return result;
    }

    checkErrors() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (this.dependencies.errorTracker) {
            const stats = this.dependencies.errorTracker.getStats();
            const recentErrors = this.dependencies.errorTracker.getErrors({
                since: Date.now() - 60000 // Last minute
            });

            result.details = {
                total: stats.total,
                recent: recentErrors.length,
                critical: stats.bySeverity.critical || 0,
                patterns: stats.patterns
            };

            const errorRate = recentErrors.length / 60; // Errors per second

            if (errorRate > this.thresholds.errorRate) {
                result.status = 'critical';
                result.message = `High error rate: ${errorRate.toFixed(2)}/s`;
            } else if (stats.bySeverity.critical > 0) {
                result.status = 'warning';
                result.message = `${stats.bySeverity.critical} critical errors`;
            }
        }

        return result;
    }

    checkDOM() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (typeof document !== 'undefined') {
            const nodeCount = document.querySelectorAll('*').length;
            const canvasCount = document.querySelectorAll('canvas').length;
            const listenerCount = this.countEventListeners();

            result.details = {
                nodes: nodeCount,
                canvases: canvasCount,
                listeners: listenerCount
            };

            if (nodeCount > 10000) {
                result.status = 'warning';
                result.message = `High DOM node count: ${nodeCount}`;
            }

            if (listenerCount > 1000) {
                result.status = 'warning';
                result.message = `High event listener count: ${listenerCount}`;
            }
        }

        return result;
    }

    checkAnimation() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (this.dependencies.animationLoop) {
            const stats = this.dependencies.animationLoop.getStats();
            result.details = {
                callbacks: stats.callbackCount,
                fps: stats.fps,
                running: stats.isRunning,
                dropped: stats.droppedFrames
            };

            if (!stats.isRunning) {
                result.status = 'warning';
                result.message = 'Animation loop not running';
            }

            if (stats.droppedFrames > 100) {
                result.status = 'warning';
                result.message = `Dropped frames: ${stats.droppedFrames}`;
            }
        }

        return result;
    }

    checkState() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (this.dependencies.stateStore) {
            const state = this.dependencies.stateStore.getState();
            const stateSize = JSON.stringify(state).length;

            result.details = {
                size: stateSize,
                keys: Object.keys(state).length
            };

            if (stateSize > 1000000) { // 1MB
                result.status = 'warning';
                result.message = `Large state size: ${(stateSize / 1024).toFixed(2)}KB`;
            }
        }

        return result;
    }

    checkEvents() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (this.dependencies.eventManager) {
            const listeners = this.dependencies.eventManager.getActiveListeners();
            const leaks = this.dependencies.eventManager.analyzeLeaks();

            result.details = {
                active: listeners.length,
                potentialLeaks: leaks.potentialLeaks.length,
                byGroup: leaks.byGroup
            };

            if (leaks.potentialLeaks.length > 10) {
                result.status = 'warning';
                result.message = `Potential memory leaks: ${leaks.potentialLeaks.length}`;
            }

            if (listeners.length > 500) {
                result.status = 'warning';
                result.message = `High listener count: ${listeners.length}`;
            }
        }

        return result;
    }

    async checkStorage() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                const used = estimate.usage || 0;
                const quota = estimate.quota || 0;
                const percentage = quota > 0 ? (used / quota) * 100 : 0;

                result.details = {
                    used: Math.round(used / (1024 * 1024)), // MB
                    quota: Math.round(quota / (1024 * 1024)), // MB
                    percentage: Math.round(percentage)
                };

                if (percentage > 90) {
                    result.status = 'critical';
                    result.message = `Storage almost full: ${percentage.toFixed(1)}%`;
                } else if (percentage > 70) {
                    result.status = 'warning';
                    result.message = `Storage usage high: ${percentage.toFixed(1)}%`;
                }
            } catch (_error) {
                result.status = 'unknown';
                result.message = 'Storage API error';
            }
        }

        return result;
    }

    async checkNetwork() {
        const result = {
            status: 'healthy',
            details: {}
        };

        if (typeof navigator !== 'undefined' && navigator.connection) {
            const {connection} = navigator;
            result.details = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };

            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                result.status = 'warning';
                result.message = 'Slow network connection detected';
            }

            if (connection.saveData) {
                result.status = 'warning';
                result.message = 'Data saver mode enabled';
            }
        }

        // Test connectivity
        try {
            const start = performance.now();
            const response = await fetch('/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const responseTime = performance.now() - start;

            result.details.responseTime = Math.round(responseTime);
            result.details.online = response.ok;

            if (responseTime > this.thresholds.responseTime) {
                result.status = 'warning';
                result.message = `Slow response time: ${responseTime.toFixed(0)}ms`;
            }
        } catch (_error) {
            result.details.online = navigator.onLine;
            if (!navigator.onLine) {
                result.status = 'critical';
                result.message = 'No network connection';
            }
        }

        return result;
    }

    checkBrowser() {
        const result = {
            status: 'healthy',
            details: {}
        };

        result.details = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints
        };

        // Check for required features
        const requiredFeatures = {
            webGL: !!document.createElement('canvas').getContext('webgl'),
            webAudio: typeof AudioContext !== 'undefined',
            localStorage: typeof localStorage !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            webWorker: typeof Worker !== 'undefined'
        };

        result.details.features = requiredFeatures;

        const missingFeatures = Object.entries(requiredFeatures)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);

        if (missingFeatures.length > 0) {
            result.status = 'warning';
            result.message = `Missing features: ${missingFeatures.join(', ')}`;
        }

        return result;
    }

    countEventListeners() {
        let count = 0;
        const allElements = document.querySelectorAll('*');

        for (const element of allElements) {
            const listeners = (typeof getEventListeners !== 'undefined' && getEventListeners) ? getEventListeners(element) : {};
            for (const event in listeners) {
                count += listeners[event].length;
            }
        }

        return count;
    }

    async runCheck(name) {
        const check = this.checks.get(name);
        if (!check) {
            return { status: 'unknown', message: `Check '${name}' not found` };
        }

        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Check timeout')), check.timeout);
            });

            const result = await Promise.race([check.fn(), timeoutPromise]);
            check.lastResult = result;
            check.lastRun = Date.now();
            return result;
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                error: error.stack
            };
        }
    }

    async runAllChecks() {
        const results = {};
        const promises = [];

        for (const [name, _check] of this.checks) {
            promises.push(
                this.runCheck(name).then(result => {
                    results[name] = result;
                })
            );
        }

        await Promise.all(promises);
        return results;
    }

    async performHealthCheck() {
        const startTime = performance.now();
        const results = await this.runAllChecks();
        const duration = performance.now() - startTime;

        const health = this.calculateOverallHealth(results);

        const report = {
            timestamp: Date.now(),
            status: health.status,
            score: health.score,
            duration: Math.round(duration),
            checks: results,
            summary: health.summary
        };

        this.lastCheck = report;
        this.addToHistory(report);
        this.updateStatus(health.status);

        return report;
    }

    calculateOverallHealth(results) {
        let totalScore = 0;
        let totalWeight = 0;
        let criticalFailed = false;
        const issues = [];

        for (const [name, result] of Object.entries(results)) {
            const check = this.checks.get(name);
            const weight = check ? check.weight : 1;

            let score = 0;
            switch (result.status) {
            case 'healthy':
                score = 100;
                break;
            case 'warning':
                score = 70;
                issues.push({ name, level: 'warning', message: result.message });
                break;
            case 'critical':
                score = 30;
                issues.push({ name, level: 'critical', message: result.message });
                if (check && check.critical) {
                    criticalFailed = true;
                }
                break;
            case 'error':
                score = 0;
                issues.push({ name, level: 'error', message: result.message });
                break;
            case 'unknown':
                score = 50;
                break;
            }

            totalScore += score * weight;
            totalWeight += weight;
        }

        const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

        let status;
        if (criticalFailed || overallScore < 30) {
            status = 'critical';
        } else if (overallScore < 70) {
            status = 'degraded';
        } else if (overallScore < 90) {
            status = 'warning';
        } else {
            status = 'healthy';
        }

        return {
            status,
            score: overallScore,
            summary: {
                total: Object.keys(results).length,
                healthy: Object.values(results).filter(r => r.status === 'healthy').length,
                warning: Object.values(results).filter(r => r.status === 'warning').length,
                critical: Object.values(results).filter(r => r.status === 'critical').length,
                issues
            }
        };
    }

    updateStatus(newStatus) {
        if (this.status !== newStatus) {
            const oldStatus = this.status;
            this.status = newStatus;

            if (this.callbacks.onStatusChange) {
                this.callbacks.onStatusChange(newStatus, oldStatus);
            }

            switch (newStatus) {
            case 'healthy':
                if (this.callbacks.onHealthy) {
                    this.callbacks.onHealthy();
                }
                break;
            case 'warning':
            case 'degraded':
                if (this.callbacks.onWarning) {
                    this.callbacks.onWarning(this.lastCheck);
                }
                break;
            case 'critical':
                if (this.callbacks.onCritical) {
                    this.callbacks.onCritical(this.lastCheck);
                }
                break;
            }
        }
    }

    addToHistory(report) {
        this.history.push(report);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    start() {
        if (this.intervalId) return;

        // Initial check
        this.performHealthCheck();

        // Schedule regular checks
        this.intervalId = setInterval(() => {
            this.performHealthCheck();
        }, this.interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    setDependencies(deps) {
        Object.assign(this.dependencies, deps);
    }

    getStatus() {
        return this.status;
    }

    getLastCheck() {
        return this.lastCheck;
    }

    getHistory() {
        return [...this.history];
    }

    async getFullReport() {
        const report = await this.performHealthCheck();

        return {
            ...report,
            history: this.getHistory(),
            uptime: this.getUptime(),
            configuration: {
                interval: this.interval,
                thresholds: this.thresholds,
                checks: Array.from(this.checks.keys())
            }
        };
    }

    getUptime() {
        if (!this.history.length) return 0;

        const firstCheck = this.history[0].timestamp;
        const now = Date.now();
        return now - firstCheck;
    }

    // Endpoint for external health checks
    async handleHealthRequest(_req, _res) {
        const report = await this.performHealthCheck();

        const statusCode = report.status === 'healthy' ? 200 :
            report.status === 'warning' ? 200 :
                report.status === 'degraded' ? 503 :
                    503;

        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                status: report.status,
                score: report.score,
                timestamp: report.timestamp,
                checks: report.checks,
                version: '2.4.0'
            })
        };
    }
}

// Create singleton instance (disabled by default to avoid 404 errors)
// Users can enable via: healthCheck.enabled = true; healthCheck.start();
export const healthCheck = new HealthCheck({
    enabled: false,
    interval: 30000
});

export default HealthCheck;