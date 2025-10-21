/**
 * Performance Schema Definition
 *
 * Defines the structure for semantic performances
 */

/**
 * @typedef {Object} PerformanceDefinition
 * @property {string} name - Performance name
 * @property {string} category - Category (conversational, feedback, state)
 * @property {string} emotion - Primary emotion
 * @property {string} gesture - Primary gesture
 * @property {number} [delay] - Delay before gesture (ms)
 * @property {number} [baseIntensity] - Base intensity (0-1)
 * @property {number} [emotionDuration] - Emotion transition duration (ms)
 * @property {string} [description] - Human-readable description
 * @property {Array<PerformanceStep>} [sequence] - Complex sequence steps
 */

/**
 * @typedef {Object} PerformanceStep
 * @property {number} at - Timestamp in ms from start
 * @property {string} action - Action type (emotion, gesture, morph, chain, sound)
 * @property {string} value - Action value
 * @property {number} [intensity] - Intensity for this step
 * @property {Object} [options] - Additional options
 */

/**
 * @typedef {Object} PerformanceContext
 * @property {number} [frustration] - Frustration level (0-100)
 * @property {string} [urgency] - Urgency level (low, medium, high)
 * @property {string} [magnitude] - Magnitude (small, moderate, major, epic)
 */

export const PERFORMANCE_SCHEMA = {
    categories: ['conversational', 'feedback', 'state', 'custom'],
    actionTypes: ['emotion', 'gesture', 'morph', 'chain', 'sound'],
    urgencyLevels: ['low', 'medium', 'high'],
    magnitudes: ['small', 'moderate', 'major', 'epic']
};

/**
 * Validate a performance definition
 * @param {Object} definition - Performance definition
 * @returns {boolean} Is valid
 */
export function validatePerformance(definition) {
    if (!definition.name || typeof definition.name !== 'string') {
        console.warn('[Schema] Performance must have a name');
        return false;
    }

    if (!definition.category || !PERFORMANCE_SCHEMA.categories.includes(definition.category)) {
        console.warn('[Schema] Performance must have a valid category');
        return false;
    }

    // Simple performance must have emotion or gesture
    if (!definition.sequence) {
        if (!definition.emotion && !definition.gesture) {
            console.warn('[Schema] Simple performance must have emotion or gesture');
            return false;
        }
    }

    // Sequence steps must be valid
    if (definition.sequence) {
        if (!Array.isArray(definition.sequence)) {
            console.warn('[Schema] Sequence must be an array');
            return false;
        }

        for (const step of definition.sequence) {
            if (typeof step.at !== 'number') {
                console.warn('[Schema] Sequence step must have "at" timestamp');
                return false;
            }

            if (!step.action || !PERFORMANCE_SCHEMA.actionTypes.includes(step.action)) {
                console.warn('[Schema] Sequence step must have valid action type');
                return false;
            }

            if (!step.value) {
                console.warn('[Schema] Sequence step must have value');
                return false;
            }
        }
    }

    return true;
}

export default {
    PERFORMANCE_SCHEMA,
    validatePerformance
};
