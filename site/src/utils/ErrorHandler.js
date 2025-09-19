/**
 * Error Handler
 * Centralized error handling and recovery system for the Emotive Engine
 * @module utils/ErrorHandler
 */

/**
 * Custom error class for engine-specific errors
 * @extends Error
 */
export class EngineError extends Error {
    /**
     * Create an EngineError
     * @param {string} message - Error message
     * @param {string} code - Error code from ERROR_CODES
     * @param {Object} details - Additional error details
     */
    constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
        super(message);
        this.name = 'EngineError';
        this.code = code;
        this.details = details;
        this.timestamp = Date.now();
        this.stack = (new Error()).stack;
    }

    /**
     * Convert to plain object for serialization
     * @returns {Object} Error as plain object
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * Error severity levels
 * @enum {string}
 */
export const ErrorSeverity = {
    CRITICAL: 'critical',   // Engine cannot continue
    ERROR: 'error',        // Operation failed
    WARNING: 'warning',    // Operation degraded
    INFO: 'info'          // Informational only
};

/**
 * Standard error codes
 * @enum {string}
 */
export const ErrorCodes = {
    // Initialization errors
    NOT_INITIALIZED: 'ENGINE_NOT_INITIALIZED',
    ALREADY_INITIALIZED: 'ENGINE_ALREADY_INITIALIZED',
    INVALID_CONFIG: 'INVALID_CONFIG',

    // Canvas errors
    INVALID_CANVAS: 'INVALID_CANVAS',
    CANVAS_NOT_FOUND: 'CANVAS_NOT_FOUND',
    CONTEXT_LOST: 'CONTEXT_LOST',

    // Gesture errors
    INVALID_GESTURE: 'INVALID_GESTURE',
    GESTURE_NOT_FOUND: 'GESTURE_NOT_FOUND',
    GESTURE_QUEUE_FULL: 'GESTURE_QUEUE_FULL',

    // Emotion errors
    INVALID_EMOTION: 'INVALID_EMOTION',
    EMOTION_NOT_FOUND: 'EMOTION_NOT_FOUND',

    // Audio errors
    AUDIO_LOAD_FAILED: 'AUDIO_LOAD_FAILED',
    AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
    MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',

    // Rhythm errors
    RHYTHM_SYNC_FAILED: 'RHYTHM_SYNC_FAILED',
    INVALID_BPM: 'INVALID_BPM',

    // Recording errors
    RECORDING_IN_PROGRESS: 'RECORDING_IN_PROGRESS',
    PLAYBACK_IN_PROGRESS: 'PLAYBACK_IN_PROGRESS',
    RECORDING_FAILED: 'RECORDING_FAILED',

    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    FIREBASE_ERROR: 'FIREBASE_ERROR',
    API_ERROR: 'API_ERROR',

    // Performance errors
    PERFORMANCE_CRITICAL: 'PERFORMANCE_CRITICAL',
    MEMORY_LIMIT: 'MEMORY_LIMIT',

    // General errors
    INVALID_PARAMETER: 'INVALID_PARAMETER',
    OPERATION_FAILED: 'OPERATION_FAILED',
    NOT_SUPPORTED: 'NOT_SUPPORTED',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Error recovery strategies
 * @enum {string}
 */
export const RecoveryStrategy = {
    RETRY: 'retry',           // Retry the operation
    FALLBACK: 'fallback',     // Use fallback behavior
    GRACEFUL: 'graceful',     // Degrade gracefully
    RESET: 'reset',          // Reset to default state
    IGNORE: 'ignore',        // Continue despite error
    ABORT: 'abort'          // Stop operation
};

/**
 * Main error handler class
 */
export class ErrorHandler {
    constructor(options = {}) {
        // Configuration
        this.config = {
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 1000,
            logErrors: options.logErrors !== false,
            throwErrors: options.throwErrors || false,
            captureStack: options.captureStack !== false,
            reportToServer: options.reportToServer || false,
            emitEvents: options.emitEvents !== false
        };

        // Error history
        this.errorHistory = [];
        this.maxHistorySize = options.maxHistorySize || 100;

        // Error callbacks
        this.errorCallbacks = new Map();

        // Recovery strategies
        this.recoveryStrategies = new Map();

        // Retry tracking
        this.retryAttempts = new Map();

        // Event manager reference (will be set externally)
        this.eventManager = options.eventManager || null;

        // Initialize default strategies
        this.initDefaultStrategies();

        // Set up global error handling if requested
        if (options.captureGlobalErrors) {
            this.setupGlobalHandlers();
        }
    }

    /**
     * Initialize default recovery strategies
     * @private
     */
    initDefaultStrategies() {
        // Canvas errors
        this.setRecoveryStrategy(ErrorCodes.CONTEXT_LOST, RecoveryStrategy.RESET);

        // Audio errors
        this.setRecoveryStrategy(ErrorCodes.AUDIO_LOAD_FAILED, RecoveryStrategy.RETRY);
        this.setRecoveryStrategy(ErrorCodes.AUDIO_CONTEXT_FAILED, RecoveryStrategy.FALLBACK);

        // Network errors
        this.setRecoveryStrategy(ErrorCodes.NETWORK_ERROR, RecoveryStrategy.RETRY);
        this.setRecoveryStrategy(ErrorCodes.FIREBASE_ERROR, RecoveryStrategy.RETRY);

        // Performance errors
        this.setRecoveryStrategy(ErrorCodes.PERFORMANCE_CRITICAL, RecoveryStrategy.GRACEFUL);
        this.setRecoveryStrategy(ErrorCodes.MEMORY_LIMIT, RecoveryStrategy.GRACEFUL);

        // Gesture errors
        this.setRecoveryStrategy(ErrorCodes.GESTURE_QUEUE_FULL, RecoveryStrategy.IGNORE);
    }

    /**
     * Handle an error
     * @param {Error|EngineError} error - The error to handle
     * @param {Object} context - Additional context
     * @returns {Object} Error handling result
     */
    handle(error, context = {}) {
        // Convert to EngineError if needed
        if (!(error instanceof EngineError)) {
            error = new EngineError(
                error.message || 'Unknown error',
                ErrorCodes.UNKNOWN_ERROR,
                { originalError: error }
            );
        }

        // Add to history
        this.addToHistory(error, context);

        // Log if enabled
        if (this.config.logErrors) {
            this.logError(error, context);
        }

        // Execute callbacks
        this.executeCallbacks(error, context);

        // Emit error event if configured
        if (this.config.emitEvents) {
            this.emitError(error, context);
        }

        // Determine recovery strategy
        const strategy = this.getRecoveryStrategy(error.code);

        // Apply recovery
        const result = this.applyRecovery(error, strategy, context);

        // Report to server if enabled
        if (this.config.reportToServer) {
            this.reportError(error, context);
        }

        // Throw if configured
        if (this.config.throwErrors && result.severity === ErrorSeverity.CRITICAL) {
            throw error;
        }

        return result;
    }

    /**
     * Wrap a function with error handling
     * @param {Function} fn - Function to wrap
     * @param {Object} context - Context for error handling
     * @returns {Function} Wrapped function
     */
    wrap(fn, context = {}) {
        return (...args) => {
            try {
                const result = fn(...args);

                // Handle async functions
                if (result && typeof result.then === 'function') {
                    return result.catch(error => {
                        this.handle(error, { ...context, args });
                        throw error;
                    });
                }

                return result;
            } catch (error) {
                const handlingResult = this.handle(error, { ...context, args });

                // Return fallback value if available
                if (handlingResult.fallback !== undefined) {
                    return handlingResult.fallback;
                }

                // Re-throw if critical
                if (handlingResult.severity === ErrorSeverity.CRITICAL) {
                    throw error;
                }

                return null;
            }
        };
    }

    /**
     * Wrap an async function with error handling
     * @param {Function} fn - Async function to wrap
     * @param {Object} context - Context for error handling
     * @returns {Function} Wrapped async function
     */
    wrapAsync(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                const handlingResult = this.handle(error, { ...context, args });

                // Return fallback value if available
                if (handlingResult.fallback !== undefined) {
                    return handlingResult.fallback;
                }

                // Re-throw if critical
                if (handlingResult.severity === ErrorSeverity.CRITICAL) {
                    throw error;
                }

                return null;
            }
        };
    }

    /**
     * Apply recovery strategy
     * @private
     */
    applyRecovery(error, strategy, context) {
        const result = {
            error,
            strategy,
            recovered: false,
            severity: ErrorSeverity.ERROR,
            fallback: undefined
        };

        switch (strategy) {
            case RecoveryStrategy.RETRY:
                result.recovered = this.attemptRetry(error, context);
                break;

            case RecoveryStrategy.FALLBACK:
                result.fallback = this.getFallback(error, context);
                result.recovered = result.fallback !== undefined;
                break;

            case RecoveryStrategy.GRACEFUL:
                result.recovered = true;
                result.severity = ErrorSeverity.WARNING;
                break;

            case RecoveryStrategy.RESET:
                result.recovered = this.attemptReset(error, context);
                break;

            case RecoveryStrategy.IGNORE:
                result.recovered = true;
                result.severity = ErrorSeverity.INFO;
                break;

            case RecoveryStrategy.ABORT:
                result.recovered = false;
                result.severity = ErrorSeverity.CRITICAL;
                break;
        }

        return result;
    }

    /**
     * Attempt to retry an operation
     * @private
     */
    attemptRetry(error, context) {
        const key = `${error.code}:${JSON.stringify(context)}`;
        const attempts = this.retryAttempts.get(key) || 0;

        if (attempts >= this.config.maxRetries) {
            this.retryAttempts.delete(key);
            return false;
        }

        this.retryAttempts.set(key, attempts + 1);

        // Schedule retry
        setTimeout(() => {
            if (context.retryCallback) {
                context.retryCallback();
            }
        }, this.config.retryDelay * Math.pow(2, attempts)); // Exponential backoff

        return false; // Will be recovered after retry
    }

    /**
     * Attempt to reset state
     * @private
     */
    attemptReset(error, context) {
        if (context.resetCallback) {
            try {
                context.resetCallback();
                return true;
            } catch (resetError) {
                this.logError(new EngineError(
                    'Reset failed',
                    ErrorCodes.OPERATION_FAILED,
                    { originalError: resetError }
                ));
            }
        }
        return false;
    }

    /**
     * Get fallback value
     * @private
     */
    getFallback(error, context) {
        if (context.fallback !== undefined) {
            return context.fallback;
        }

        // Default fallbacks by error type
        switch (error.code) {
            case ErrorCodes.INVALID_GESTURE:
                return 'idle';
            case ErrorCodes.INVALID_EMOTION:
                return 'neutral';
            case ErrorCodes.INVALID_BPM:
                return 120;
            default:
                return undefined;
        }
    }

    /**
     * Add error to history
     * @private
     */
    addToHistory(error, context) {
        this.errorHistory.push({
            error: error.toObject(),
            context,
            timestamp: Date.now()
        });

        // Trim history if needed
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }

    /**
     * Log error
     * @private
     */
    logError(error, context) {
        const severity = this.getSeverity(error.code);
        const logMethod = severity === ErrorSeverity.CRITICAL ? 'error' :
                         severity === ErrorSeverity.ERROR ? 'error' :
                         severity === ErrorSeverity.WARNING ? 'warn' :
                         'log';

        console[logMethod](`[${error.code}] ${error.message}`, {
            details: error.details,
            context,
            stack: error.stack
        });
    }

    /**
     * Execute error callbacks
     * @private
     */
    executeCallbacks(error, context) {
        // Global callbacks
        if (this.errorCallbacks.has('*')) {
            this.errorCallbacks.get('*').forEach(callback => {
                try {
                    callback(error, context);
                } catch (e) {
                    console.error('Error callback failed:', e);
                }
            });
        }

        // Specific callbacks
        if (this.errorCallbacks.has(error.code)) {
            this.errorCallbacks.get(error.code).forEach(callback => {
                try {
                    callback(error, context);
                } catch (e) {
                    console.error('Error callback failed:', e);
                }
            });
        }
    }

    /**
     * Report error to server
     * @private
     */
    async reportError(error, context) {
        // This would send error to logging service
        // For now, just log that we would report it
        if (window.DEBUG) {
            console.log('Would report error to server:', error.toObject());
        }
    }

    /**
     * Set recovery strategy for an error code
     * @param {string} errorCode - Error code
     * @param {string} strategy - Recovery strategy
     */
    setRecoveryStrategy(errorCode, strategy) {
        this.recoveryStrategies.set(errorCode, strategy);
    }

    /**
     * Get recovery strategy for an error code
     * @param {string} errorCode - Error code
     * @returns {string} Recovery strategy
     */
    getRecoveryStrategy(errorCode) {
        return this.recoveryStrategies.get(errorCode) || RecoveryStrategy.ABORT;
    }

    /**
     * Get severity for an error code
     * @param {string} errorCode - Error code
     * @returns {string} Error severity
     */
    getSeverity(errorCode) {
        // Critical errors
        if ([
            ErrorCodes.NOT_INITIALIZED,
            ErrorCodes.CONTEXT_LOST,
            ErrorCodes.MEMORY_LIMIT
        ].includes(errorCode)) {
            return ErrorSeverity.CRITICAL;
        }

        // Warnings
        if ([
            ErrorCodes.PERFORMANCE_CRITICAL,
            ErrorCodes.GESTURE_QUEUE_FULL
        ].includes(errorCode)) {
            return ErrorSeverity.WARNING;
        }

        // Default to error
        return ErrorSeverity.ERROR;
    }

    /**
     * Register error callback
     * @param {string} errorCode - Error code or '*' for all
     * @param {Function} callback - Callback function
     */
    on(errorCode, callback) {
        if (!this.errorCallbacks.has(errorCode)) {
            this.errorCallbacks.set(errorCode, []);
        }
        this.errorCallbacks.get(errorCode).push(callback);
    }

    /**
     * Unregister error callback
     * @param {string} errorCode - Error code
     * @param {Function} callback - Callback to remove
     */
    off(errorCode, callback) {
        if (this.errorCallbacks.has(errorCode)) {
            const callbacks = this.errorCallbacks.get(errorCode);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Setup global error handlers
     * @private
     */
    setupGlobalHandlers() {
        // Window error handler
        window.addEventListener('error', (event) => {
            this.handle(new EngineError(
                event.message,
                ErrorCodes.UNKNOWN_ERROR,
                {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            ));
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handle(new EngineError(
                'Unhandled promise rejection',
                ErrorCodes.UNKNOWN_ERROR,
                { reason: event.reason }
            ));
        });
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getStats() {
        const stats = {
            total: this.errorHistory.length,
            bySeverity: {},
            byCode: {},
            recentErrors: []
        };

        // Analyze history
        this.errorHistory.forEach(entry => {
            const severity = this.getSeverity(entry.error.code);
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
            stats.byCode[entry.error.code] = (stats.byCode[entry.error.code] || 0) + 1;
        });

        // Get recent errors
        stats.recentErrors = this.errorHistory.slice(-10).map(entry => ({
            code: entry.error.code,
            message: entry.error.message,
            timestamp: entry.timestamp
        }));

        return stats;
    }

    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
        this.retryAttempts.clear();
    }

    /**
     * Create a scoped error handler
     * @param {Object} defaultContext - Default context for this scope
     * @returns {Object} Scoped handler methods
     */
    createScope(defaultContext = {}) {
        return {
            handle: (error, context) => this.handle(error, { ...defaultContext, ...context }),
            wrap: (fn, context) => this.wrap(fn, { ...defaultContext, ...context }),
            wrapAsync: (fn, context) => this.wrapAsync(fn, { ...defaultContext, ...context })
        };
    }

    /**
     * Set the event manager for error event emission
     * @param {EventManager} eventManager - Event manager instance
     */
    setEventManager(eventManager) {
        this.eventManager = eventManager;
    }

    /**
     * Emit an error event through the event system
     * @param {EngineError} error - The error to emit
     * @param {Object} context - Error context
     * @private
     */
    emitError(error, context = {}) {
        if (!this.eventManager) {
            // Try to get global event manager
            if (typeof window !== 'undefined' && window.eventManager) {
                this.eventManager = window.eventManager;
            } else {
                // No event manager available, skip emission
                return;
            }
        }

        // Determine event type based on severity
        const severity = this.getSeverity(error.code);
        let eventType = 'error';

        switch (severity) {
            case ErrorSeverity.CRITICAL:
                eventType = 'error:critical';
                break;
            case ErrorSeverity.ERROR:
                eventType = 'error:error';
                break;
            case ErrorSeverity.WARNING:
                eventType = 'error:warning';
                break;
            case ErrorSeverity.INFO:
                eventType = 'error:info';
                break;
        }

        // Emit general error event
        this.eventManager.emit('error', {
            error: error.toObject(),
            context,
            timestamp: Date.now(),
            severity,
            code: error.code,
            message: error.message
        });

        // Emit severity-specific event
        this.eventManager.emit(eventType, {
            error: error.toObject(),
            context,
            timestamp: Date.now()
        });

        // Emit code-specific event (for targeted error handling)
        this.eventManager.emit(`error:${error.code}`, {
            error: error.toObject(),
            context,
            timestamp: Date.now()
        });
    }

    /**
     * Get severity level for an error code
     * @param {string} code - Error code
     * @returns {string} Severity level
     * @private
     */
    getSeverity(code) {
        // Critical errors
        const criticalCodes = [
            ErrorCodes.NOT_INITIALIZED,
            ErrorCodes.CONTEXT_LOST,
            ErrorCodes.MEMORY_LIMIT,
            ErrorCodes.PERFORMANCE_CRITICAL
        ];

        // Warnings
        const warningCodes = [
            ErrorCodes.GESTURE_QUEUE_FULL,
            ErrorCodes.MICROPHONE_ACCESS_DENIED
        ];

        // Info
        const infoCodes = [
            ErrorCodes.GESTURE_NOT_FOUND,
            ErrorCodes.EMOTION_NOT_FOUND
        ];

        if (criticalCodes.includes(code)) {
            return ErrorSeverity.CRITICAL;
        } else if (warningCodes.includes(code)) {
            return ErrorSeverity.WARNING;
        } else if (infoCodes.includes(code)) {
            return ErrorSeverity.INFO;
        } else {
            return ErrorSeverity.ERROR;
        }
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        this.clearHistory();
        this.errorCallbacks.clear();
        this.recoveryStrategies.clear();
    }
}

// Create singleton instance
export const errorHandler = new ErrorHandler({
    logErrors: true,
    captureStack: true,
    maxHistorySize: 50,
    emitEvents: true
});

// Export default
export default errorHandler;

// Make available globally for debugging
if (typeof window !== 'undefined' && window.DEBUG) {
    window.errorHandler = errorHandler;
    window.EngineError = EngineError;
    window.ErrorCodes = ErrorCodes;
}