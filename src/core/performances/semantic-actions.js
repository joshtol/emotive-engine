/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Semantic Action Registry
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Maps LLM response actions to semantic performances
 * @author Emotive Engine Team
 * @module core/performances/semantic-actions
 *
 * @description
 * Bridges the gap between LLM intent (actions like "offer_help", "celebrate") and the
 * semantic performance system. Each action maps to:
 * - A semantic performance name (if available)
 * - Default shape to morph into
 * - Default gesture to perform
 * - Matching emotion
 * - Performance characteristics
 *
 * This enables LLMs to trigger sophisticated choreographed performances with simple
 * action names, while maintaining fallback behavior for manual choreography.
 */

/**
 * Semantic action definitions
 * Maps LLM action strings to performance configurations
 */
export const SEMANTIC_ACTIONS = {
    // ═══════════════════════════════════════════════════════════════════════════════════
    // CONVERSATIONAL ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * User needs assistance - mascot offers help
     */
    offer_help: {
        performance: 'offering_help',      // Semantic performance name
        defaultShape: 'heart',             // Empathetic shape
        defaultGesture: 'reach',           // Reaching out gesture
        emotionMatch: 'empathy',           // Best matching emotion
        category: 'conversational',
        description: 'Offering assistance to user',
        intensityModifier: 1.0,            // No modification to calculated intensity
        examples: [
            'How can I help you?',
            'Let me assist you with that',
            'I\'m here to help'
        ]
    },

    /**
     * Celebrating success or achievement
     */
    celebrate: {
        performance: 'celebrating',
        defaultShape: 'star',              // Achievement shape
        defaultGesture: 'sparkle',         // Celebratory gesture
        emotionMatch: 'joy',
        category: 'conversational',
        description: 'Celebrating success or completion',
        intensityModifier: 1.2,            // Amplify celebrations
        examples: [
            'Great job!',
            'You did it!',
            'Perfect!'
        ]
    },

    /**
     * Providing guidance or instructions
     */
    guide: {
        performance: 'guiding',
        defaultShape: 'square',            // Structured shape for instructions
        defaultGesture: 'point',           // Directional gesture
        emotionMatch: 'calm',
        category: 'conversational',
        description: 'Providing step-by-step guidance',
        intensityModifier: 0.8,            // Calm, measured guidance
        examples: [
            'Here\'s how to do that',
            'Follow these steps',
            'Let me show you'
        ]
    },

    /**
     * Reassuring or comforting user
     */
    reassure: {
        performance: 'reassuring',
        defaultShape: 'heart',             // Caring shape
        defaultGesture: 'nod',             // Affirming gesture
        emotionMatch: 'empathy',
        category: 'conversational',
        description: 'Providing comfort and reassurance',
        intensityModifier: 0.9,            // Gentle reassurance
        examples: [
            'Don\'t worry, we\'ll fix this',
            'Everything will be okay',
            'You\'re doing great'
        ]
    },

    /**
     * Greeting user
     */
    greet: {
        performance: 'greeting',
        defaultShape: 'sun',               // Bright, welcoming shape
        defaultGesture: 'wave',            // Welcoming gesture
        emotionMatch: 'joy',
        category: 'conversational',
        description: 'Welcoming user',
        intensityModifier: 1.0,
        examples: [
            'Hello!',
            'Welcome!',
            'Hi there!'
        ]
    },

    /**
     * Confirming or validating user action
     */
    confirm: {
        performance: 'confirming',
        defaultShape: 'circle',            // Neutral shape
        defaultGesture: 'nod',             // Affirmative gesture
        emotionMatch: 'calm',
        category: 'conversational',
        description: 'Confirming user action or understanding',
        intensityModifier: 0.7,            // Subtle confirmation
        examples: [
            'Yes, that\'s correct',
            'I understand',
            'Got it'
        ]
    },

    /**
     * Denying or correcting
     */
    deny: {
        performance: 'denying',
        defaultShape: 'circle',            // Neutral shape
        defaultGesture: 'shake',           // Negative gesture
        emotionMatch: 'concern',
        category: 'conversational',
        description: 'Correcting or indicating no',
        intensityModifier: 0.8,
        examples: [
            'That\'s not quite right',
            'No, let me clarify',
            'Not exactly'
        ]
    },

    /**
     * Emphasizing important information
     */
    emphasize: {
        performance: 'emphasizing',
        defaultShape: 'star',              // Attention-grabbing shape
        defaultGesture: 'pulse',           // Pulsing for emphasis
        emotionMatch: 'excitement',
        category: 'conversational',
        description: 'Drawing attention to key information',
        intensityModifier: 1.1,            // Slightly amplified
        examples: [
            'This is important',
            'Pay attention to this',
            'Remember this'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // COGNITIVE ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Asking a question or expressing curiosity
     */
    question: {
        performance: 'questioning',
        defaultShape: 'circle',            // Open, curious shape
        defaultGesture: 'tilt',            // Inquisitive tilt
        emotionMatch: 'curiosity',
        category: 'cognitive',
        description: 'Asking for clarification or more info',
        intensityModifier: 0.8,
        examples: [
            'Could you clarify?',
            'What do you mean?',
            'Can you tell me more?'
        ]
    },

    /**
     * Processing or thinking
     */
    think: {
        performance: 'thinking',
        defaultShape: 'circle',            // Neutral while processing
        defaultGesture: 'orbit',           // Contemplative orbit
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'Processing information',
        intensityModifier: 0.6,            // Calm thinking
        examples: [
            'Let me think about that',
            'Processing...',
            'Hmm...'
        ]
    },

    /**
     * Actively listening
     */
    listen: {
        performance: 'listening',
        defaultShape: 'circle',            // Attentive shape
        defaultGesture: 'settle',          // Focused, still
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'Actively listening to user',
        intensityModifier: 0.5,            // Very calm, attentive
        examples: [
            'I\'m listening',
            'Go on...',
            'Tell me more'
        ]
    },

    /**
     * Responding or replying
     */
    respond: {
        performance: 'responding',
        defaultShape: 'circle',            // Neutral response
        defaultGesture: 'bounce',          // Engaged bounce
        emotionMatch: 'calm',
        category: 'cognitive',
        description: 'General response to user',
        intensityModifier: 0.8,
        examples: [
            'Here\'s what I think',
            'My response is...',
            'To answer your question'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════════════════
    // NEUTRAL / NONE
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * No specific action - neutral state
     */
    none: {
        performance: null,                 // No performance
        defaultShape: 'circle',            // Default shape
        defaultGesture: null,              // No gesture
        emotionMatch: 'neutral',
        category: 'neutral',
        description: 'Neutral state with no specific action',
        intensityModifier: 0.5,
        examples: [
            'Okay',
            'I see',
            'Understood'
        ]
    }
};

/**
 * Get semantic action configuration by name
 * @param {string} actionName - Action name from LLM response
 * @returns {Object|null} Action configuration or null if not found
 */
export function getSemanticAction(actionName) {
    return SEMANTIC_ACTIONS[actionName] || null;
}

/**
 * Get all available action names
 * @returns {Array<string>} List of valid action names
 */
export function getAvailableActions() {
    return Object.keys(SEMANTIC_ACTIONS);
}

/**
 * Get actions by category
 * @param {string} category - Category name ('conversational', 'cognitive', 'neutral')
 * @returns {Array<Object>} List of actions in category
 */
export function getActionsByCategory(category) {
    return Object.entries(SEMANTIC_ACTIONS)
        .filter(([_, config]) => config.category === category)
        .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get action configuration with fallbacks
 * @param {string} actionName - Action name
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Complete action configuration
 */
export function getActionConfig(actionName, overrides = {}) {
    const action = getSemanticAction(actionName);

    if (!action) {
        // Return safe defaults for unknown actions
        return {
            performance: null,
            defaultShape: 'circle',
            defaultGesture: null,
            emotionMatch: 'neutral',
            category: 'unknown',
            description: 'Unknown action',
            intensityModifier: 1.0,
            ...overrides
        };
    }

    return {
        ...action,
        ...overrides
    };
}

/**
 * Validate if action name is valid
 * @param {string} actionName - Action name to validate
 * @returns {boolean} True if valid
 */
export function isValidAction(actionName) {
    return actionName in SEMANTIC_ACTIONS;
}

/**
 * Get suggested emotion for action
 * @param {string} actionName - Action name
 * @returns {string} Suggested emotion name
 */
export function getSuggestedEmotion(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.emotionMatch : 'neutral';
}

/**
 * Get suggested shape for action
 * @param {string} actionName - Action name
 * @returns {string} Suggested shape name
 */
export function getSuggestedShape(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.defaultShape : 'circle';
}

/**
 * Get suggested gesture for action
 * @param {string} actionName - Action name
 * @returns {string|null} Suggested gesture name or null
 */
export function getSuggestedGesture(actionName) {
    const action = getSemanticAction(actionName);
    return action ? action.defaultGesture : null;
}

/**
 * Calculate intensity with action modifier
 * @param {number} baseIntensity - Base intensity (0-1)
 * @param {string} actionName - Action name
 * @returns {number} Modified intensity (0-1)
 */
export function calculateActionIntensity(baseIntensity, actionName) {
    const action = getSemanticAction(actionName);
    const modifier = action ? action.intensityModifier : 1.0;
    return Math.max(0.3, Math.min(1.0, baseIntensity * modifier));
}

export default SEMANTIC_ACTIONS;
