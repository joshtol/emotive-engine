/**
 * Performance Definitions - Main Export
 *
 * Central registry of all built-in semantic performances
 */

import { CONVERSATIONAL_PERFORMANCES } from './conversational.js';
import { FEEDBACK_PERFORMANCES } from './feedback.js';
import { STATE_PERFORMANCES } from './states.js';
import { PERFORMANCE_SCHEMA, validatePerformance } from './schema.js';

/**
 * All built-in performances
 */
export const PERFORMANCES = {
    // Conversational (16 performances)
    ...CONVERSATIONAL_PERFORMANCES,

    // Feedback (13 performances)
    ...FEEDBACK_PERFORMANCES,

    // State (15 performances)
    ...STATE_PERFORMANCES,
};

/**
 * Performance categories
 */
export const PERFORMANCE_CATEGORIES = {
    conversational: Object.keys(CONVERSATIONAL_PERFORMANCES),
    feedback: Object.keys(FEEDBACK_PERFORMANCES),
    state: Object.keys(STATE_PERFORMANCES),
};

/**
 * Get all performance names
 * @returns {Array<string>} Performance names
 */
export function getAllPerformanceNames() {
    return Object.keys(PERFORMANCES);
}

/**
 * Get performances by category
 * @param {string} category - Category name
 * @returns {Object} Performances in category
 */
export function getPerformancesByCategory(category) {
    const names = PERFORMANCE_CATEGORIES[category];
    if (!names) return {};

    const result = {};
    names.forEach(name => {
        result[name] = PERFORMANCES[name];
    });
    return result;
}

/**
 * Get performance count by category
 * @returns {Object} Count per category
 */
export function getPerformanceCount() {
    return {
        conversational: Object.keys(CONVERSATIONAL_PERFORMANCES).length,
        feedback: Object.keys(FEEDBACK_PERFORMANCES).length,
        state: Object.keys(STATE_PERFORMANCES).length,
        total: Object.keys(PERFORMANCES).length,
    };
}

/**
 * Validate all performance definitions
 * @returns {Object} Validation results
 */
export function validateAllPerformances() {
    const results = {
        valid: [],
        invalid: [],
        total: 0,
    };

    Object.entries(PERFORMANCES).forEach(([name, definition]) => {
        results.total++;
        if (validatePerformance(definition)) {
            results.valid.push(name);
        } else {
            results.invalid.push(name);
        }
    });

    return results;
}

// Export individual categories for direct access
export {
    CONVERSATIONAL_PERFORMANCES,
    FEEDBACK_PERFORMANCES,
    STATE_PERFORMANCES,
    PERFORMANCE_SCHEMA,
    validatePerformance,
};

export default PERFORMANCES;
