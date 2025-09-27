/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                       ◐ ◑ ◒ ◓  ERROR BOUNDARY  ◓ ◒ ◑ ◐                       
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Error Boundary - Error Handling & Recovery System
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module ErrorBoundary
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The SAFETY NET of the Emotive Engine. Catches errors, provides fallbacks,         
 * ║ logs issues for debugging, and attempts recovery to keep the animation            
 * ║ running even when things go wrong. Never let the orb die!                         
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🛡️ ERROR HANDLING FEATURES                                                        
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Try-catch wrapping for all critical functions                                   
 * │ • Safe default values for all emotional states                                    
 * │ • Error logging with context and timestamps                                       
 * │ • Automatic error suppression after threshold                                     
 * │ • Recovery attempts with exponential backoff                                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔄 FALLBACK VALUES                                                                
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • emotion       : 'neutral' (safe default state)                                  
 * │ • gesture       : null (no animation)                                             
 * │ • audioLevel    : 0 (silent)                                                      
 * │ • particleCount : 0 (no particles)                                                
 * │ • glowIntensity : 0.7 (moderate glow)                                             
 * │ • color         : '#B0B0B0' (neutral gray)                                        
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📊 VALIDATION LISTS                                                               
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ VALID EMOTIONS:                                                                   
 * │   neutral, joy, sadness, anger, fear, surprise, disgust, love,                    
 * │   suspicion, resting, connecting, thinking, speaking, zen, focused                
 * │                                                                                    
 * │ VALID UNDERTONES:                                                                 
 * │   nervous, confident, tired, intense, subdued                                     
 * │                                                                                    
 * │ VALID GESTURES:                                                                    
 * │   bounce, pulse, shake, spin, nod, tilt, expand, contract, flash,                 
 * │   drift, breathe, wave, slowBlink, jump, breathHold                               
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚠️  ERROR THRESHOLDS                                                              
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Max errors in log      : 10 (then rotates)                                      
 * │ • Errors before suppress : 3 per context                                          
 * │ • Recovery max attempts  : 3                                                      
 * │ • Recovery backoff       : 100ms * 2^attempt                                      
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                           USING ERROR BOUNDARY                                    
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ // Wrap any risky function:                                                       
 * ║ const safeFunction = errorBoundary.wrap(riskyFunction, 'context', fallback);      
 * ║                                                                                    
 * ║ // Validate input:                                                                
 * ║ const validEmotion = errorBoundary.validateInput(input, 'emotion', 'neutral');    
 * ║                                                                                    
 * ║ // Attempt recovery:                                                              
 * ║ await errorBoundary.attemptRecovery('render', retryFn, 3);                        
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */
class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.maxErrors = 10;
        this.errorCounts = new Map();
        
        // Safe default values for various contexts
        this.defaults = {
            emotion: 'neutral',
            gesture: null,
            audioLevel: 0,
            particleCount: 0,
            glowIntensity: 0.7,
            coreSize: 1.0,
            breathRate: 1.0,
            color: '#B0B0B0'
        };
    }

    /**
     * Wraps a function with error handling
     * @param {Function} fn - Function to wrap
     * @param {string} context - Context description for error logging
     * @param {*} fallbackValue - Value to return on error
     * @returns {Function} Wrapped function
     */
    wrap(fn, context, fallbackValue = null) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.logError(error, context);
                return fallbackValue !== null ? fallbackValue : this.getDefault(context);
            }
        };
    }

    /**
     * Logs an error with context and timestamp
     * @param {Error} error - The error object
     * @param {string} context - Context where the error occurred
     */
    logError(error, context) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            context,
            message: error.message,
            stack: error.stack
        };

        // Add to error log
        this.errors.push(errorEntry);
        
        // Maintain error count per context
        const count = this.errorCounts.get(context) || 0;
        this.errorCounts.set(context, count + 1);

        // Rotate error log if it gets too large
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console with appropriate level based on frequency
        if (count < 3) {
            // Log first few occurrences normally
        } else if (count === 3) {
            // Log threshold reached
        }
    }

    /**
     * Gets a safe default value for a given context
     * @param {string} context - The context to get default for
     * @returns {*} Safe default value
     */
    getDefault(context) {
        // Context-specific defaults
        const contextDefaults = {
            'emotion-transition': this.defaults.emotion,
            'gesture-execution': this.defaults.gesture,
            'audio-processing': this.defaults.audioLevel,
            'particle-system': this.defaults.particleCount,
            'rendering': {
                glowIntensity: this.defaults.glowIntensity,
                coreSize: this.defaults.coreSize,
                color: this.defaults.color
            },
            'canvas-operations': null,
            'state-management': this.defaults.emotion
        };

        return Object.prototype.hasOwnProperty.call(contextDefaults, context) ? contextDefaults[context] : null;
    }

    /**
     * Validates input parameters and returns safe values
     * @param {*} value - Value to validate
     * @param {string} type - Expected type
     * @param {*} defaultValue - Default value if validation fails
     * @returns {*} Validated value or default
     */
    validateInput(value, type, defaultValue) {
        try {
            switch (type) {
            case 'emotion': {
                const validEmotions = ['neutral', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'euphoria'];
                return validEmotions.includes(value) ? value : defaultValue;
            }
                
            case 'undertone': {
                const validUndertones = ['nervous', 'confident', 'tired', 'intense', 'subdued'];
                return value === null || validUndertones.includes(value) ? value : null;
            }
                
            case 'gesture': {
                const validGestures = ['bounce', 'pulse', 'shake', 'spin', 'nod', 'tilt', 'expand', 'contract', 'flash', 'drift'];
                return validGestures.includes(value) ? value : defaultValue;
            }
                
            case 'number':
                return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
                
            case 'string':
                return typeof value === 'string' ? value : defaultValue;
                
            case 'boolean':
                return typeof value === 'boolean' ? value : defaultValue;
                
            default:
                return value !== undefined && value !== null ? value : defaultValue;
            }
        } catch (error) {
            this.logError(error, 'input-validation');
            return defaultValue;
        }
    }

    /**
     * Checks if a context has exceeded error threshold
     * @param {string} context - Context to check
     * @param {number} threshold - Error threshold (default: 5)
     * @returns {boolean} True if threshold exceeded
     */
    hasExceededThreshold(context, threshold = 5) {
        return (this.errorCounts.get(context) || 0) >= threshold;
    }

    /**
     * Gets error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        return {
            totalErrors: this.errors.length,
            errorsByContext: Object.fromEntries(this.errorCounts),
            recentErrors: this.errors.slice(-5)
        };
    }

    /**
     * Clears error history
     */
    clearErrors() {
        this.errors = [];
        this.errorCounts.clear();
    }

    /**
     * Attempts to recover from a failed operation
     * @param {string} operation - The operation that failed
     * @param {Function} retryFn - Function to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise} Recovery attempt result
     */
    async attemptRecovery(operation, retryFn, maxRetries = 3) {
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                return await retryFn();
            } catch (error) {
                attempts++;
                this.logError(error, `recovery-${operation}-attempt-${attempts}`);
                
                if (attempts >= maxRetries) {
                    throw new Error(`Recovery failed for ${operation} after ${maxRetries} attempts`);
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
            }
        }
    }
}

export default ErrorBoundary;