/**
 * apiValidation validates public API inputs and provides descriptive errors for developers.
 * @module utils/apiValidation
 */

import { ErrorResponse, ErrorTypes } from '../core/ErrorResponse.js';
import { Validator } from './validation.js';

/**
 * API parameter validation utilities
 */
export class APIValidator {
    /**
     * Validate setEmotion method parameters
     * @param {*} emotion - Emotion parameter
     * @param {*} options - Options parameter
     * @returns {Object} Validation result
     */
    static validateSetEmotion(emotion, options = {}) {
        const errors = [];
        const validatedParams = {};

        // Validate emotion
        const emotionResult = Validator.validateEmotion(emotion);
        if (emotionResult.success) {
            validatedParams.emotion = emotionResult.data;
        } else {
            errors.push(`emotion: ${emotionResult.error.message}`);
        }

        // Validate options
        const optionsSchema = {
            duration: value => {
                if (value === undefined) return ErrorResponse.success(1000);
                return Validator.validateNumber(value, {
                    min: 0,
                    max: 10000,
                    paramName: 'duration'
                });
            },
            
            intensity: value => {
                if (value === undefined) return ErrorResponse.success(1.0);
                return Validator.validateNumber(value, {
                    min: 0,
                    max: 2.0,
                    paramName: 'intensity'
                });
            },
            
            easing: value => {
                if (value === undefined) return ErrorResponse.success('ease-in-out');
                const validEasings = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'];
                return Validator.validateString(value, {
                    paramName: 'easing'
                }).success && validEasings.includes(value) 
                    ? ErrorResponse.success(value)
                    : ErrorResponse.failure(ErrorTypes.INVALID_PARAMETER, `Invalid easing: ${value}`, { validEasings });
            },
            
            undertone: value => {
                if (value === undefined) return ErrorResponse.success(null);
                const validUndertones = ['subtle', 'moderate', 'strong'];
                return validUndertones.includes(value)
                    ? ErrorResponse.success(value)
                    : ErrorResponse.failure(ErrorTypes.INVALID_PARAMETER, `Invalid undertone: ${value}`, { validUndertones });
            }
        };

        const optionsResult = Validator.validateObject(options, optionsSchema, 'options');
        if (optionsResult.success) {
            validatedParams.options = optionsResult.data;
        } else {
            errors.push(`options: ${optionsResult.error.message}`);
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `setEmotion validation failed: ${errors.join(', ')}`,
                { errors, received: { emotion, options } }
            );
        }

        return ErrorResponse.success(validatedParams);
    }

    /**
     * Validate express method parameters
     * @param {*} gesture - Gesture parameter
     * @param {*} options - Options parameter
     * @returns {Object} Validation result
     */
    static validateExpress(gesture, options = {}) {
        const errors = [];
        const validatedParams = {};

        // Validate gesture
        const gestureResult = Validator.validateGesture(gesture);
        if (gestureResult.success) {
            validatedParams.gesture = gestureResult.data;
        } else {
            errors.push(`gesture: ${gestureResult.error.message}`);
        }

        // Validate options
        const optionsSchema = {
            duration: value => {
                if (value === undefined) return ErrorResponse.success(500);
                return Validator.validateNumber(value, {
                    min: 100,
                    max: 5000,
                    paramName: 'duration'
                });
            },
            
            intensity: value => {
                if (value === undefined) return ErrorResponse.success(1.0);
                return Validator.validateNumber(value, {
                    min: 0.1,
                    max: 3.0,
                    paramName: 'intensity'
                });
            },
            
            repeat: value => {
                if (value === undefined) return ErrorResponse.success(1);
                return Validator.validateNumber(value, {
                    min: 1,
                    max: 10,
                    integer: true,
                    paramName: 'repeat'
                });
            },
            
            delay: value => {
                if (value === undefined) return ErrorResponse.success(0);
                return Validator.validateNumber(value, {
                    min: 0,
                    max: 2000,
                    paramName: 'delay'
                });
            }
        };

        const optionsResult = Validator.validateObject(options, optionsSchema, 'options');
        if (optionsResult.success) {
            validatedParams.options = optionsResult.data;
        } else {
            errors.push(`options: ${optionsResult.error.message}`);
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `express validation failed: ${errors.join(', ')}`,
                { errors, received: { gesture, options } }
            );
        }

        return ErrorResponse.success(validatedParams);
    }

    /**
     * Validate chain method parameters
     * @param {*} gestures - Array of gestures
     * @param {*} options - Options parameter
     * @returns {Object} Validation result
     */
    static validateChain(gestures, options = {}) {
        const errors = [];
        const validatedParams = {};

        // Validate gestures array
        const gesturesResult = Validator.validateArray(gestures, {
            minLength: 1,
            maxLength: 10,
            paramName: 'gestures',
            itemValidator: (gesture, index) => {
                const result = Validator.validateGesture(gesture);
                if (!result.success) {
                    return ErrorResponse.failure(
                        ErrorTypes.INVALID_GESTURE,
                        `Invalid gesture at index ${index}: ${result.error.message}`,
                        { index, gesture }
                    );
                }
                return result;
            }
        });

        if (gesturesResult.success) {
            validatedParams.gestures = gesturesResult.data;
        } else {
            errors.push(`gestures: ${gesturesResult.error.message}`);
        }

        // Validate options
        const optionsSchema = {
            timing: value => {
                if (value === undefined) return ErrorResponse.success('sequential');
                const validTimings = ['sequential', 'parallel', 'staggered'];
                return validTimings.includes(value)
                    ? ErrorResponse.success(value)
                    : ErrorResponse.failure(ErrorTypes.INVALID_PARAMETER, `Invalid timing: ${value}`, { validTimings });
            },
            
            interval: value => {
                if (value === undefined) return ErrorResponse.success(200);
                return Validator.validateNumber(value, {
                    min: 0,
                    max: 2000,
                    paramName: 'interval'
                });
            },
            
            loop: value => {
                if (value === undefined) return ErrorResponse.success(false);
                return Validator.validateBoolean(value, false, 'loop');
            }
        };

        const optionsResult = Validator.validateObject(options, optionsSchema, 'options');
        if (optionsResult.success) {
            validatedParams.options = optionsResult.data;
        } else {
            errors.push(`options: ${optionsResult.error.message}`);
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `chain validation failed: ${errors.join(', ')}`,
                { errors, received: { gestures, options } }
            );
        }

        return ErrorResponse.success(validatedParams);
    }

    /**
     * Validate on/off event listener parameters
     * @param {*} event - Event name
     * @param {*} callback - Callback function
     * @returns {Object} Validation result
     */
    static validateEventListener(event, callback) {
        const errors = [];
        const validatedParams = {};

        // Validate event name
        const validEvents = [
            'emotionChanged', 'gestureStarted', 'gestureCompleted', 'chainCompleted',
            'performanceDegraded', 'contextLost', 'contextRestored', 'error'
        ];

        const eventResult = Validator.validateString(event, {
            minLength: 1,
            maxLength: 50,
            paramName: 'event'
        });

        if (eventResult.success) {
            if (validEvents.includes(eventResult.data)) {
                validatedParams.event = eventResult.data;
            } else {
                errors.push(`Unknown event: ${eventResult.data}. Valid events: ${validEvents.join(', ')}`);
            }
        } else {
            errors.push(`event: ${eventResult.error.message}`);
        }

        // Validate callback
        if (typeof callback !== 'function') {
            errors.push('callback must be a function');
        } else {
            validatedParams.callback = callback;
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `Event listener validation failed: ${errors.join(', ')}`,
                { errors, received: { event, callback: typeof callback } }
            );
        }

        return ErrorResponse.success(validatedParams);
    }

    /**
     * Validate configuration object for constructor
     * @param {*} config - Configuration object
     * @returns {Object} Validation result
     */
    static validateConstructorConfig(config = {}) {
        // First do basic validation without strict canvas requirements
        const validatedConfig = {};
        const warnings = [];
        const errors = [];

        // Validate individual properties
        if (config.width !== undefined) {
            const widthResult = Validator.validateNumber(config.width, {
                min: 100,
                max: 4000,
                paramName: 'width'
            });
            if (widthResult.success) {
                validatedConfig.width = widthResult.data;
            } else {
                errors.push(`width: ${widthResult.error.message}`);
            }
        }

        if (config.height !== undefined) {
            const heightResult = Validator.validateNumber(config.height, {
                min: 100,
                max: 4000,
                paramName: 'height'
            });
            if (heightResult.success) {
                validatedConfig.height = heightResult.data;
            } else {
                errors.push(`height: ${heightResult.error.message}`);
            }
        }

        if (config.enableAudio !== undefined) {
            const audioResult = Validator.validateBoolean(config.enableAudio, true, 'enableAudio');
            if (audioResult.success) {
                validatedConfig.enableAudio = audioResult.data;
            } else {
                errors.push(`enableAudio: ${audioResult.error.message}`);
            }
        }

        if (config.enableParticles !== undefined) {
            const particlesResult = Validator.validateBoolean(config.enableParticles, true, 'enableParticles');
            if (particlesResult.success) {
                validatedConfig.enableParticles = particlesResult.data;
            } else {
                errors.push(`enableParticles: ${particlesResult.error.message}`);
            }
        }

        if (config.maxParticles !== undefined) {
            const maxParticlesResult = Validator.validateNumber(config.maxParticles, {
                min: 0,
                max: 200,
                integer: true,
                paramName: 'maxParticles'
            });
            if (maxParticlesResult.success) {
                validatedConfig.maxParticles = maxParticlesResult.data;
            } else {
                errors.push(`maxParticles: ${maxParticlesResult.error.message}`);
            }
        }

        if (config.debug !== undefined) {
            const debugResult = Validator.validateBoolean(config.debug, false, 'debug');
            if (debugResult.success) {
                validatedConfig.debug = debugResult.data;
            } else {
                errors.push(`debug: ${debugResult.error.message}`);
            }
        }

        // Validate canvas element if provided
        if (config.canvas !== undefined) {
            if (config.canvas && typeof config.canvas === 'object' && config.canvas.getContext) {
                validatedConfig.canvas = config.canvas;
            } else {
                return ErrorResponse.failure(
                    ErrorTypes.INVALID_PARAMETER,
                    'Provided canvas element does not support getContext method',
                    { canvas: config.canvas }
                );
            }
        }

        // Copy any other properties
        for (const [key, value] of Object.entries(config)) {
            if (!(key in validatedConfig) && !['canvas', 'width', 'height', 'enableAudio', 'enableParticles', 'maxParticles', 'debug'].includes(key)) {
                validatedConfig[key] = value;
            }
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `Constructor configuration validation failed: ${errors.join(', ')}`,
                { received: config, errors }
            );
        }

        // Generate warnings
        if (validatedConfig.maxParticles && validatedConfig.maxParticles > 100) {
            warnings.push('High particle count may impact performance');
        }

        if (validatedConfig.enableAudio === false && validatedConfig.enableParticles === false) {
            warnings.push('Both audio and particles disabled - limited visual feedback available');
        }

        return ErrorResponse.success({
            config: validatedConfig,
            warnings
        });
    }

    /**
     * Validate method parameters with context-aware error messages
     * @param {string} methodName - Name of the method being validated
     * @param {Array} params - Array of parameters
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result
     */
    static validateMethodParams(methodName, params, schema) {
        const errors = [];
        const validatedParams = [];

        for (let i = 0; i < schema.length; i++) {
            const param = params[i];
            const validator = schema[i];
            
            try {
                const result = validator(param);
                if (result.success) {
                    validatedParams.push(result.data);
                } else {
                    errors.push(`Parameter ${i + 1}: ${result.error.message}`);
                }
            } catch (error) {
                errors.push(`Parameter ${i + 1}: Validation error - ${error.message}`);
            }
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `${methodName} validation failed: ${errors.join(', ')}`,
                { 
                    method: methodName,
                    errors,
                    received: params,
                    expectedParams: schema.length
                }
            );
        }

        return ErrorResponse.success(validatedParams);
    }

    /**
     * Sanitize and validate user input for security
     * @param {*} input - User input to sanitize
     * @param {string} context - Context of the input (e.g., 'emotion', 'gesture')
     * @returns {Object} Sanitization result
     */
    static sanitizeUserInput(input, context = 'general') {
        if (input === null || input === undefined) {
            return ErrorResponse.success(input);
        }

        // Convert to string for sanitization
        let sanitized = String(input);

        // Remove potentially dangerous characters
        sanitized = sanitized
            .replace(/[<>'"&]/g, '') // Remove HTML/XML characters
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/data:/gi, '') // Remove data: protocol
            .replace(/vbscript:/gi, '') // Remove vbscript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/alert\s*\(/gi, '') // Remove alert calls
            .replace(/eval\s*\(/gi, '') // Remove eval calls
            .trim();

        // Context-specific validation
        switch (context) {
        case 'emotion': {
            const emotionResult = Validator.validateEmotion(sanitized);
            return emotionResult.success 
                ? ErrorResponse.success(emotionResult.data)
                : ErrorResponse.failure(ErrorTypes.INVALID_EMOTION, 'Invalid emotion after sanitization', { original: input, sanitized });
        }

        case 'gesture': {
            const gestureResult = Validator.validateGesture(sanitized);
            return gestureResult.success
                ? ErrorResponse.success(gestureResult.data)
                : ErrorResponse.failure(ErrorTypes.INVALID_GESTURE, 'Invalid gesture after sanitization', { original: input, sanitized });
        }

        case 'event':
            if (sanitized.length > 50) {
                return ErrorResponse.failure(ErrorTypes.INVALID_PARAMETER, 'Event name too long after sanitization');
            }
            return ErrorResponse.success(sanitized);

        default:
            // General sanitization - limit length and remove dangerous content
            if (sanitized.length > 1000) {
                sanitized = sanitized.substring(0, 1000);
            }
            return ErrorResponse.success(sanitized);
        }
    }

    /**
     * Validate numeric ranges with context-aware limits
     * @param {*} value - Value to validate
     * @param {string} context - Context for range limits
     * @returns {Object} Validation result
     */
    static validateNumericRange(value, context) {
        const ranges = {
            duration: { min: 0, max: 10000, default: 1000 },
            intensity: { min: 0, max: 3.0, default: 1.0 },
            delay: { min: 0, max: 5000, default: 0 },
            repeat: { min: 1, max: 20, default: 1, integer: true },
            particleCount: { min: 0, max: 200, default: 50, integer: true },
            volume: { min: 0, max: 1.0, default: 0.5 },
            fps: { min: 15, max: 120, default: 60, integer: true }
        };

        const range = ranges[context];
        if (!range) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `Unknown numeric context: ${context}`,
                { context, availableContexts: Object.keys(ranges) }
            );
        }

        return Validator.validateNumber(value, {
            min: range.min,
            max: range.max,
            integer: range.integer,
            defaultValue: range.default,
            paramName: context
        });
    }

    /**
     * Batch validate multiple parameters
     * @param {Object} params - Object with parameter names and values
     * @param {Object} validationRules - Object with parameter names and validation functions
     * @returns {Object} Batch validation result
     */
    static batchValidate(params, validationRules) {
        const results = {};
        const errors = [];
        const warnings = [];

        for (const [paramName, value] of Object.entries(params)) {
            const validator = validationRules[paramName];
            
            if (!validator) {
                warnings.push(`No validation rule for parameter: ${paramName}`);
                results[paramName] = value; // Pass through unvalidated
                continue;
            }

            try {
                const result = validator(value);
                if (result.success) {
                    results[paramName] = result.data;
                } else {
                    errors.push(`${paramName}: ${result.error.message}`);
                    if (result.error.severity === 'warning') {
                        warnings.push(`${paramName}: ${result.error.message}`);
                        results[paramName] = result.data || value;
                    }
                }
            } catch (error) {
                errors.push(`${paramName}: Validation error - ${error.message}`);
            }
        }

        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `Batch validation failed: ${errors.join(', ')}`,
                { 
                    errors,
                    warnings,
                    validatedParams: results,
                    originalParams: params
                }
            );
        }

        return ErrorResponse.success({
            validatedParams: results,
            warnings
        });
    }
}

export default APIValidator;