/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                      ◐ ◑ ◒ ◓  ERROR RESPONSE  ◓ ◒ ◑ ◐                      
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Error Response - Standardized Error Formats & Recovery
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module ErrorResponse
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The ERROR STANDARDIZATION system of the engine. Provides consistent error        
 * ║ formats, recovery suggestions, and severity classifications for all              
 * ║ error conditions throughout the Emotive Engine.                                  
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🚨 ERROR TYPES                                                                    
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Validation Errors: Invalid emotions, gestures, parameters                       
 * │ • System Errors: Canvas/audio context, initialization failures                    
 * │ • Performance Errors: Degradation, memory limits, frame drops                     
 * │ • Resource Errors: Load/cleanup failures                                          
 * │ • Network Errors: Connectivity, audio loading                                     
 * │ • Compatibility Errors: Feature/browser support                                   
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class ErrorResponse {
    constructor(type, message, context = {}, severity = 'error') {
        this.success = false;
        this.error = {
            type,
            message,
            context,
            severity,
            timestamp: Date.now(),
            recoveryActions: this.generateRecoveryActions(type, context)
        };
    }

    /**
   * Create a successful response
   * @param {*} data - Response data
   * @returns {Object} Success response object
   */
    static success(data = null) {
        return { 
            success: true, 
            data,
            timestamp: Date.now()
        };
    }

    /**
   * Create a failure response
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {Object} context - Error context
   * @param {string} severity - Error severity level
   * @returns {ErrorResponse} Error response object
   */
    static failure(type, message, context = {}, severity = 'error') {
        return new ErrorResponse(type, message, context, severity);
    }

    /**
   * Create a warning response (non-blocking)
   * @param {string} type - Warning type
   * @param {string} message - Warning message
   * @param {Object} context - Warning context
   * @returns {ErrorResponse} Warning response object
   */
    static warning(type, message, context = {}) {
        return new ErrorResponse(type, message, context, 'warning');
    }

    /**
   * Generate recovery actions based on error type
   * @param {string} type - Error type
   * @param {Object} context - Error context
   * @returns {Array} Array of recovery suggestions
   */
    generateRecoveryActions(type, context) {
        const recoveryMap = {
            'INVALID_EMOTION': [
                'Check if emotion is one of: joy, sadness, anger, fear, surprise, disgust, contempt, neutral',
                'Use EmotiveMascot.getAvailableEmotions() to see valid options'
            ],
            'INVALID_GESTURE': [
                'Verify gesture name matches available gestures',
                'Use EmotiveMascot.getAvailableGestures() to see valid options'
            ],
            'CANVAS_CONTEXT_LOST': [
                'Canvas context will attempt automatic recovery',
                'Reduce canvas size if problem persists',
                'Check for memory pressure or GPU issues'
            ],
            'AUDIO_CONTEXT_FAILED': [
                'Audio features will be disabled, visual features continue',
                'Check browser audio permissions',
                'Ensure user interaction occurred before audio initialization'
            ],
            'PERFORMANCE_DEGRADED': [
                'Particle count has been automatically reduced',
                'Consider reducing canvas size or complexity',
                'Monitor performance metrics for recovery'
            ],
            'MEMORY_LIMIT_EXCEEDED': [
                'System has automatically reduced resource usage',
                'Consider destroying unused mascot instances',
                'Monitor memory usage patterns'
            ],
            'VALIDATION_ERROR': [
                'Check parameter types and ranges',
                'Refer to API documentation for valid values',
                'Use default values if unsure'
            ],
            'INITIALIZATION_ERROR': [
                'Ensure canvas element exists and is accessible',
                'Check browser compatibility',
                'Verify all required dependencies are loaded'
            ]
        };

        return recoveryMap[type] || [
            'Check console for additional error details',
            'Refer to troubleshooting documentation',
            'Consider reporting this issue if it persists'
        ];
    }

    /**
   * Log error with appropriate level
   */
    log() {
        const logMethod = this.error.severity === 'warning' ? 'warn' : 'error';
        if (logMethod === 'warn') {
            console.warn(`[EmotiveMascot] ${this.error.type}: ${this.error.message}`, {
                context: this.error.context,
                recoveryActions: this.error.recoveryActions,
                timestamp: new Date(this.error.timestamp).toISOString()
            });
        } else {
            console.error(`[EmotiveMascot] ${this.error.type}: ${this.error.message}`, {
                context: this.error.context,
                recoveryActions: this.error.recoveryActions,
                timestamp: new Date(this.error.timestamp).toISOString()
            });
        }
    }

    /**
   * Get formatted error message for display
   * @returns {string} Formatted error message
   */
    getDisplayMessage() {
        return `${this.error.type}: ${this.error.message}`;
    }

    /**
   * Check if error is recoverable
   * @returns {boolean} True if error has recovery actions
   */
    isRecoverable() {
        return this.error.recoveryActions && this.error.recoveryActions.length > 0;
    }

    /**
   * Get error severity level
   * @returns {string} Severity level
   */
    getSeverity() {
        return this.error.severity;
    }

    /**
   * Convert to JSON for serialization
   * @returns {Object} JSON representation
   */
    toJSON() {
        return {
            success: this.success,
            error: this.error
        };
    }
}

/**
 * Error categories for consistent classification
 */
export const ErrorTypes = {
    // Validation errors
    INVALID_EMOTION: 'INVALID_EMOTION',
    INVALID_GESTURE: 'INVALID_GESTURE',
    INVALID_PARAMETER: 'INVALID_PARAMETER',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  
    // System errors
    CANVAS_CONTEXT_LOST: 'CANVAS_CONTEXT_LOST',
    AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
    INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
  
    // Performance errors
    PERFORMANCE_DEGRADED: 'PERFORMANCE_DEGRADED',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    FRAME_RATE_LOW: 'FRAME_RATE_LOW',
  
    // Resource errors
    RESOURCE_LOAD_FAILED: 'RESOURCE_LOAD_FAILED',
    RESOURCE_CLEANUP_FAILED: 'RESOURCE_CLEANUP_FAILED',
  
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUDIO_LOAD_FAILED: 'AUDIO_LOAD_FAILED',
  
    // Browser compatibility
    FEATURE_NOT_SUPPORTED: 'FEATURE_NOT_SUPPORTED',
    BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED'
};

/**
 * Severity levels for error classification
 */
export const ErrorSeverity = {
    CRITICAL: 'critical',  // System cannot continue
    ERROR: 'error',        // Feature fails but system continues
    WARNING: 'warning',    // Degraded functionality
    INFO: 'info'          // Informational only
};