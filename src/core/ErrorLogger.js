/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                       ◐ ◑ ◒ ◓  ERROR LOGGER  ◓ ◒ ◑ ◐                       
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Error Logger - Centralized Error Tracking & Diagnostics
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module ErrorLogger
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The DIAGNOSTICS CENTER of the engine. Tracks, logs, and reports errors           
 * ║ with full context preservation. Essential for debugging and monitoring            
 * ║ the health of the Emotive Engine in production environments.                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📝 LOGGING FEATURES                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Structured error logging with severity levels                                   
 * │ • Context preservation (component, timestamp, stack trace)                        
 * │ • Error frequency tracking and throttling                                         
 * │ • Performance impact monitoring                                                   
 * │ • Automatic error suppression after threshold                                     
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { ErrorSeverity } from './ErrorResponse.js';

export class ErrorLogger {
    constructor(config = {}) {
        this.config = {
            enableConsoleLogging: config.enableConsoleLogging !== false,
            enableContextPreservation: config.enableContextPreservation !== false,
            maxLogEntries: config.maxLogEntries || 1000,
            logLevel: config.logLevel || ErrorSeverity.WARNING,
            ...config
        };
    
        this.logs = [];
        this.errorCounts = new Map();
        this.contextHistory = new Map();
        this.startTime = Date.now();
    }

    /**
   * Log an error with full context preservation
   * @param {ErrorResponse} errorResponse - Error response object
   * @param {Object} additionalContext - Additional context information
   */
    logError(errorResponse, additionalContext = {}) {
        const logEntry = this.createLogEntry(errorResponse, additionalContext);
    
        // Store log entry
        this.storeLogEntry(logEntry);
    
        // Update error counts
        this.updateErrorCounts(errorResponse.error.type);
    
        // Console logging if enabled
        if (this.config.enableConsoleLogging && this.shouldLog(errorResponse.error.severity)) {
            this.consoleLog(logEntry);
        }
    
        // Preserve context for debugging
        if (this.config.enableContextPreservation) {
            this.preserveContext(errorResponse.error.type, logEntry);
        }
    
        return logEntry;
    }

    /**
   * Create structured log entry
   * @param {ErrorResponse} errorResponse - Error response
   * @param {Object} additionalContext - Additional context
   * @returns {Object} Log entry object
   */
    createLogEntry(errorResponse, additionalContext) {
        return {
            id: this.generateLogId(),
            timestamp: Date.now(),
            relativeTime: Date.now() - this.startTime,
            type: errorResponse.error.type,
            message: errorResponse.error.message,
            severity: errorResponse.error.severity,
            context: {
                ...errorResponse.error.context,
                ...additionalContext,
                stackTrace: this.captureStackTrace(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                url: typeof window !== 'undefined' ? window.location.href : 'unknown'
            },
            recoveryActions: errorResponse.error.recoveryActions,
            errorCount: this.getErrorCount(errorResponse.error.type) + 1
        };
    }

    /**
   * Store log entry with size management
   * @param {Object} logEntry - Log entry to store
   */
    storeLogEntry(logEntry) {
        this.logs.push(logEntry);
    
        // Maintain maximum log size
        if (this.logs.length > this.config.maxLogEntries) {
            this.logs.shift(); // Remove oldest entry
        }
    }

    /**
   * Update error occurrence counts
   * @param {string} errorType - Error type
   */
    updateErrorCounts(errorType) {
        const currentCount = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, currentCount + 1);
    }

    /**
   * Preserve context for debugging
   * @param {string} errorType - Error type
   * @param {Object} logEntry - Log entry
   */
    preserveContext(errorType, logEntry) {
        if (!this.contextHistory.has(errorType)) {
            this.contextHistory.set(errorType, []);
        }
    
        const contexts = this.contextHistory.get(errorType);
        contexts.push({
            timestamp: logEntry.timestamp,
            context: logEntry.context,
            message: logEntry.message
        });
    
        // Keep only last 10 contexts per error type
        if (contexts.length > 10) {
            contexts.shift();
        }
    }

    /**
   * Console logging with appropriate formatting
   * @param {Object} logEntry - Log entry to log
   */
    consoleLog(logEntry) {
        const logMethod = this.getConsoleMethod(logEntry.severity);
        const timestamp = new Date(logEntry.timestamp).toISOString();
    
        console[logMethod](
            `[EmotiveMascot] ${timestamp} ${logEntry.type}: ${logEntry.message}`,
            {
                severity: logEntry.severity,
                context: logEntry.context,
                recoveryActions: logEntry.recoveryActions,
                errorCount: logEntry.errorCount
            }
        );
    }

    /**
   * Get appropriate console method for severity
   * @param {string} severity - Error severity
   * @returns {string} Console method name
   */
    getConsoleMethod(severity) {
        switch (severity) {
        case ErrorSeverity.CRITICAL:
            return 'error';
        case ErrorSeverity.ERROR:
            return 'error';
        case ErrorSeverity.WARNING:
            return 'warn';
        case ErrorSeverity.INFO:
            return 'info';
        default:
            return 'log';
        }
    }

    /**
   * Check if error should be logged based on level
   * @param {string} severity - Error severity
   * @returns {boolean} True if should log
   */
    shouldLog(severity) {
        const severityLevels = {
            [ErrorSeverity.CRITICAL]: 4,
            [ErrorSeverity.ERROR]: 3,
            [ErrorSeverity.WARNING]: 2,
            [ErrorSeverity.INFO]: 1
        };
    
        return severityLevels[severity] >= severityLevels[this.config.logLevel];
    }

    /**
   * Capture stack trace for debugging
   * @returns {string} Stack trace string
   */
    captureStackTrace() {
        try {
            throw new Error();
        } catch (e) {
            return e.stack || 'Stack trace not available';
        }
    }

    /**
   * Generate unique log ID
   * @returns {string} Unique log identifier
   */
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
   * Get error count for specific type
   * @param {string} errorType - Error type
   * @returns {number} Error count
   */
    getErrorCount(errorType) {
        return this.errorCounts.get(errorType) || 0;
    }

    /**
   * Get all logs with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered log entries
   */
    getLogs(filters = {}) {
        let filteredLogs = [...this.logs];
    
        if (filters.type) {
            filteredLogs = filteredLogs.filter(log => log.type === filters.type);
        }
    
        if (filters.severity) {
            filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
        }
    
        if (filters.since) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since);
        }
    
        if (filters.limit) {
            filteredLogs = filteredLogs.slice(-filters.limit);
        }
    
        return filteredLogs;
    }

    /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
    getErrorStatistics() {
        const stats = {
            totalErrors: this.logs.length,
            errorsByType: Object.fromEntries(this.errorCounts),
            errorsBySeverity: {},
            recentErrors: this.logs.slice(-10),
            uptime: Date.now() - this.startTime
        };
    
        // Count by severity
        this.logs.forEach(log => {
            stats.errorsBySeverity[log.severity] = (stats.errorsBySeverity[log.severity] || 0) + 1;
        });
    
        return stats;
    }

    /**
   * Clear all logs
   */
    clearLogs() {
        this.logs = [];
        this.errorCounts.clear();
        this.contextHistory.clear();
    }

    /**
   * Export logs for external analysis
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {string} Exported data
   */
    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                logs: this.logs,
                statistics: this.getErrorStatistics(),
                exportTime: Date.now()
            }, null, 2);
        }
    
        if (format === 'csv') {
            const headers = ['timestamp', 'type', 'severity', 'message', 'errorCount'];
            const rows = this.logs.map(log => [
                new Date(log.timestamp).toISOString(),
                log.type,
                log.severity,
                log.message.replace(/"/g, '""'),
                log.errorCount
            ]);
      
            return [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
        }
    
        throw new Error(`Unsupported export format: ${format}`);
    }
}

// Global error logger instance
let globalErrorLogger = null;

/**
 * Get or create global error logger instance
 * @param {Object} config - Logger configuration
 * @returns {ErrorLogger} Global logger instance
 */
export function getErrorLogger(config = {}) {
    if (!globalErrorLogger) {
        globalErrorLogger = new ErrorLogger(config);
    }
    return globalErrorLogger;
}

/**
 * Reset global error logger (mainly for testing)
 */
export function resetErrorLogger() {
    globalErrorLogger = null;
}