/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                     ◐ ◑ ◒ ◓  VALIDATION  ◓ ◒ ◑ ◐                     
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Validation - Input Sanitization & Type Checking
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module Validation
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The INPUT SAFETY system of the engine. Ensures all parameters are valid,          
 * ║ sanitized, and within acceptable ranges. Prevents runtime errors and provides     
 * ║ safe defaults for missing or invalid inputs.                                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🛡️ VALIDATION FEATURES                                                            
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Emotion validation against allowed states                                       
 * │ • Gesture validation with parameter checking                                      
 * │ • Numeric range validation with clamping                                          
 * │ • String sanitization for XSS prevention                                          
 * │ • Type coercion with safe defaults                                                
 * │ • Configuration object validation                                                 
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { ErrorResponse, ErrorTypes } from '../core/ErrorResponse.js';

/**
 * Validation utility class
 */
export class Validator {
    /**
   * Validate emotion parameter
   * @param {*} emotion - Emotion to validate
   * @returns {Object} Validation result
   */
    static validateEmotion(emotion) {
        const validEmotions = [
            'joy', 'sadness', 'anger', 'fear', 'surprise', 
            'disgust', 'contempt', 'neutral'
        ];
    
        if (typeof emotion !== 'string') {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_EMOTION,
                `Emotion must be a string, received ${typeof emotion}`,
                { received: emotion, validEmotions }
            );
        }
    
        const normalizedEmotion = emotion.toLowerCase().trim();
    
        if (!validEmotions.includes(normalizedEmotion)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_EMOTION,
                `Unknown emotion: ${emotion}`,
                { received: emotion, validEmotions }
            );
        }
    
        return ErrorResponse.success(normalizedEmotion);
    }

    /**
   * Validate gesture parameter
   * @param {*} gesture - Gesture to validate
   * @returns {Object} Validation result
   */
    static validateGesture(gesture) {
        const validGestures = [
            'wave', 'nod', 'shake', 'bounce', 'spin', 'pulse', 
            'float', 'dance', 'celebrate', 'think'
        ];
    
        if (typeof gesture !== 'string') {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_GESTURE,
                `Gesture must be a string, received ${typeof gesture}`,
                { received: gesture, validGestures }
            );
        }
    
        const normalizedGesture = gesture.toLowerCase().trim();
    
        if (!validGestures.includes(normalizedGesture)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_GESTURE,
                `Unknown gesture: ${gesture}`,
                { received: gesture, validGestures }
            );
        }
    
        return ErrorResponse.success(normalizedGesture);
    }

    /**
   * Validate numeric parameter with range checking
   * @param {*} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
    static validateNumber(value, options = {}) {
        const {
            min = -Infinity,
            max = Infinity,
            integer = false,
            defaultValue = 0,
            paramName = 'parameter'
        } = options;
    
        // Type conversion attempt
        let numValue = value;
        if (typeof value === 'string') {
            numValue = parseFloat(value);
        }
    
        // Check if valid number
        if (typeof numValue !== 'number' || isNaN(numValue)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} must be a valid number, received ${typeof value}`,
                { received: value, defaultValue, min, max }
            );
        }
    
        // Integer validation
        if (integer && !Number.isInteger(numValue)) {
            numValue = Math.round(numValue);
        }
    
        // Range validation
        if (numValue < min) {
            return ErrorResponse.warning(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} ${numValue} is below minimum ${min}, using ${min}`,
                { received: numValue, adjusted: min, min, max }
            );
        }
    
        if (numValue > max) {
            return ErrorResponse.warning(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} ${numValue} is above maximum ${max}, using ${max}`,
                { received: numValue, adjusted: max, min, max }
            );
        }
    
        return ErrorResponse.success(Math.max(min, Math.min(max, numValue)));
    }

    /**
   * Validate boolean parameter
   * @param {*} value - Value to validate
   * @param {*} defaultValue - Default value if invalid
   * @param {string} paramName - Parameter name for error messages
   * @returns {Object} Validation result
   */
    static validateBoolean(value, defaultValue = false, paramName = 'parameter') {
        if (typeof value === 'boolean') {
            return ErrorResponse.success(value);
        }
    
        // Attempt conversion
        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase().trim();
            if (lowerValue === 'true' || lowerValue === '1') {
                return ErrorResponse.success(true);
            }
            if (lowerValue === 'false' || lowerValue === '0') {
                return ErrorResponse.success(false);
            }
        }
    
        if (typeof value === 'number') {
            return ErrorResponse.success(Boolean(value));
        }
    
        return ErrorResponse.warning(
            ErrorTypes.INVALID_PARAMETER,
            `${paramName} must be boolean, using default ${defaultValue}`,
            { received: value, defaultValue }
        );
    }

    /**
   * Validate string parameter
   * @param {*} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
    static validateString(value, options = {}) {
        const {
            minLength = 0,
            maxLength = Infinity,
            allowEmpty = true,
            defaultValue = '',
            paramName = 'parameter',
            pattern = null
        } = options;
    
        if (typeof value !== 'string') {
            if (value === null || value === undefined) {
                return ErrorResponse.success(defaultValue);
            }
      
            // Attempt conversion
            try {
                value = String(value);
            } catch (error) {
                return ErrorResponse.failure(
                    ErrorTypes.INVALID_PARAMETER,
                    `${paramName} cannot be converted to string`,
                    { received: value, defaultValue }
                );
            }
        }
    
        // Empty string validation
        if (!allowEmpty && value.length === 0) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} cannot be empty`,
                { received: value, minLength, maxLength }
            );
        }
    
        // Length validation
        if (value.length < minLength) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} must be at least ${minLength} characters`,
                { received: value, length: value.length, minLength, maxLength }
            );
        }
    
        if (value.length > maxLength) {
            const truncated = value.substring(0, maxLength);
            return ErrorResponse.warning(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} truncated to ${maxLength} characters`,
                { received: value, adjusted: truncated, maxLength }
            );
        }
    
        // Pattern validation
        if (pattern && !pattern.test(value)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} does not match required pattern`,
                { received: value, pattern: pattern.toString() }
            );
        }
    
        return ErrorResponse.success(value);
    }

    /**
   * Validate object parameter
   * @param {*} value - Value to validate
   * @param {Object} schema - Validation schema
   * @param {string} paramName - Parameter name
   * @returns {Object} Validation result
   */
    static validateObject(value, schema = {}, paramName = 'parameter') {
        if (value === null || value === undefined) {
            return ErrorResponse.success({});
        }
    
        if (typeof value !== 'object' || Array.isArray(value)) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} must be an object`,
                { received: value, type: typeof value }
            );
        }
    
        const validatedObject = {};
        const errors = [];
    
        // Validate each schema property
        for (const [key, validator] of Object.entries(schema)) {
            if (typeof validator === 'function') {
                try {
                    const result = validator(value[key]);
                    if (result.success) {
                        validatedObject[key] = result.data;
                    } else {
                        errors.push(`${key}: ${result.error.message}`);
                    }
                } catch (error) {
                    errors.push(`${key}: validation error - ${error.message}`);
                }
            }
        }
    
        // Copy non-schema properties (permissive validation)
        for (const [key, val] of Object.entries(value)) {
            if (!(key in schema)) {
                validatedObject[key] = val;
            }
        }
    
        if (errors.length > 0) {
            return ErrorResponse.failure(
                ErrorTypes.VALIDATION_ERROR,
                `Object validation failed: ${errors.join(', ')}`,
                { received: value, errors, validatedObject }
            );
        }
    
        return ErrorResponse.success(validatedObject);
    }

    /**
   * Validate array parameter
   * @param {*} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
    static validateArray(value, options = {}) {
        const {
            minLength = 0,
            maxLength = Infinity,
            itemValidator = null,
            defaultValue = [],
            paramName = 'parameter'
        } = options;
    
        if (!Array.isArray(value)) {
            if (value === null || value === undefined) {
                return ErrorResponse.success(defaultValue);
            }
      
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} must be an array`,
                { received: value, type: typeof value, defaultValue }
            );
        }
    
        // Length validation
        if (value.length < minLength) {
            return ErrorResponse.failure(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} must have at least ${minLength} items`,
                { received: value, length: value.length, minLength, maxLength }
            );
        }
    
        if (value.length > maxLength) {
            const truncated = value.slice(0, maxLength);
            return ErrorResponse.warning(
                ErrorTypes.INVALID_PARAMETER,
                `${paramName} truncated to ${maxLength} items`,
                { received: value, adjusted: truncated, maxLength }
            );
        }
    
        // Item validation
        if (itemValidator) {
            const validatedItems = [];
            const errors = [];
      
            for (let i = 0; i < value.length; i++) {
                try {
                    const result = itemValidator(value[i], i);
                    if (result.success) {
                        validatedItems.push(result.data);
                    } else {
                        errors.push(`Item ${i}: ${result.error.message}`);
                    }
                } catch (error) {
                    errors.push(`Item ${i}: validation error - ${error.message}`);
                }
            }
      
            if (errors.length > 0) {
                return ErrorResponse.failure(
                    ErrorTypes.VALIDATION_ERROR,
                    `Array validation failed: ${errors.join(', ')}`,
                    { received: value, errors, validatedItems }
                );
            }
      
            return ErrorResponse.success(validatedItems);
        }
    
        return ErrorResponse.success(value);
    }

    /**
   * Sanitize HTML content to prevent XSS
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
    static sanitizeHTML(html) {
        if (typeof html !== 'string') {
            return '';
        }
    
        // Basic HTML sanitization - remove script tags and event handlers
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, '');
    }

    /**
   * Validate configuration object with comprehensive schema
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result with sanitized config
   */
    static validateConfig(config = {}) {
        const validatedConfig = {};
        const errors = [];
    
        // Optional canvas validation
        if (config.canvas !== undefined) {
            if (config.canvas && typeof config.canvas === 'object' && config.canvas.tagName === 'CANVAS') {
                validatedConfig.canvas = config.canvas;
            } else {
                errors.push('canvas must be a valid Canvas element');
            }
        }
    
        // Width validation
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
    
        // Height validation
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
    
        // EnableAudio validation
        if (config.enableAudio !== undefined) {
            const audioResult = Validator.validateBoolean(config.enableAudio, true, 'enableAudio');
            if (audioResult.success) {
                validatedConfig.enableAudio = audioResult.data;
            } else {
                errors.push(`enableAudio: ${audioResult.error.message}`);
            }
        }
    
        // EnableParticles validation
        if (config.enableParticles !== undefined) {
            const particlesResult = Validator.validateBoolean(config.enableParticles, true, 'enableParticles');
            if (particlesResult.success) {
                validatedConfig.enableParticles = particlesResult.data;
            } else {
                errors.push(`enableParticles: ${particlesResult.error.message}`);
            }
        }
    
        // MaxParticles validation
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
    
        // Debug validation
        if (config.debug !== undefined) {
            const debugResult = Validator.validateBoolean(config.debug, false, 'debug');
            if (debugResult.success) {
                validatedConfig.debug = debugResult.data;
            } else {
                errors.push(`debug: ${debugResult.error.message}`);
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
                `Configuration validation failed: ${errors.join(', ')}`,
                { received: config, errors, validatedConfig }
            );
        }
    
        return ErrorResponse.success(validatedConfig);
    }
}

/**
 * Input sanitization utilities
 */
export class Sanitizer {
    /**
   * Sanitize user input to prevent injection attacks
   * @param {*} input - Input to sanitize
   * @param {string} type - Expected input type
   * @returns {*} Sanitized input
   */
    static sanitizeInput(input, type = 'string') {
        if (input === null || input === undefined) {
            return input;
        }
    
        switch (type) {
        case 'string':
            return this.sanitizeString(input);
        case 'number':
            return this.sanitizeNumber(input);
        case 'boolean':
            return this.sanitizeBoolean(input);
        case 'html':
            return Validator.sanitizeHTML(input);
        default:
            return input;
        }
    }

    /**
   * Sanitize string input
   * @param {*} input - Input to sanitize
   * @returns {string} Sanitized string
   */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return String(input || '');
        }
    
        // Remove null bytes and control characters
        return input
            .replace(/\0/g, '')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim();
    }

    /**
   * Sanitize numeric input
   * @param {*} input - Input to sanitize
   * @returns {number} Sanitized number
   */
    static sanitizeNumber(input) {
        const num = parseFloat(input);
        return isNaN(num) ? 0 : num;
    }

    /**
   * Sanitize boolean input
   * @param {*} input - Input to sanitize
   * @returns {boolean} Sanitized boolean
   */
    static sanitizeBoolean(input) {
        if (typeof input === 'boolean') {
            return input;
        }
    
        if (typeof input === 'string') {
            const lower = input.toLowerCase().trim();
            return lower === 'true' || lower === '1' || lower === 'yes';
        }
    
        return Boolean(input);
    }
}