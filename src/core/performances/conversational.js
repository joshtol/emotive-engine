/**
 * Conversational Performances
 *
 * Semantic performances for conversation flows and AI interactions
 */

export const CONVERSATIONAL_PERFORMANCES = {
    // Basic conversation states
    listening: {
        name: 'listening',
        category: 'conversational',
        emotion: 'curiosity',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.6,
        emotionDuration: 400,
        description: 'User is speaking, AI is listening attentively'
    },

    thinking: {
        name: 'thinking',
        category: 'conversational',
        emotion: 'focused',
        gesture: 'breathe',
        delay: 100,
        baseIntensity: 0.7,
        emotionDuration: 500,
        description: 'AI is processing and thinking'
    },

    acknowledging: {
        name: 'acknowledging',
        category: 'conversational',
        emotion: 'calm',
        gesture: 'nod',
        delay: 150,
        baseIntensity: 0.7,
        emotionDuration: 400,
        description: 'AI acknowledges understanding'
    },

    // Guiding & instructing
    guiding: {
        name: 'guiding',
        category: 'conversational',
        emotion: 'calm',
        gesture: 'point',
        delay: 200,
        baseIntensity: 0.7,
        emotionDuration: 500,
        description: 'AI provides guidance or instructions'
    },

    // Emotional responses
    empathizing: {
        name: 'empathizing',
        category: 'conversational',
        emotion: 'empathy',
        baseIntensity: 0.8,
        emotionDuration: 600,
        description: 'AI shows empathy and understanding',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 0.8 },
            { at: 200, action: 'gesture', value: 'shake' },
            { at: 700, action: 'gesture', value: 'nod' }
        ]
    },

    celebrating: {
        name: 'celebrating',
        category: 'conversational',
        emotion: 'joy',
        baseIntensity: 0.9,
        emotionDuration: 500,
        description: 'AI celebrates success with user',
        sequence: [
            { at: 0, action: 'emotion', value: 'joy', intensity: 0.9 },
            { at: 200, action: 'gesture', value: 'bounce' },
            { at: 800, action: 'emotion', value: 'triumph', intensity: 1.0 },
            { at: 900, action: 'gesture', value: 'glow' }
        ]
    },

    celebrating_epic: {
        name: 'celebrating_epic',
        category: 'conversational',
        emotion: 'triumph',
        baseIntensity: 1.0,
        emotionDuration: 500,
        description: 'Epic celebration with visual transformation',
        sequence: [
            { at: 0, action: 'emotion', value: 'joy', intensity: 0.9 },
            { at: 200, action: 'gesture', value: 'bounce' },
            { at: 700, action: 'emotion', value: 'triumph', intensity: 1.0 },
            { at: 800, action: 'gesture', value: 'glow' },
            { at: 1000, action: 'morph', value: 'sun' },
            { at: 1000, action: 'chain', value: 'radiance' }
        ]
    },

    reassuring: {
        name: 'reassuring',
        category: 'conversational',
        emotion: 'calm',
        baseIntensity: 0.8,
        emotionDuration: 600,
        description: 'AI provides reassurance and comfort',
        sequence: [
            { at: 0, action: 'emotion', value: 'calm', intensity: 0.8 },
            { at: 200, action: 'gesture', value: 'breathe' },
            { at: 800, action: 'gesture', value: 'wave' }
        ]
    },

    // Offering help
    offering_help: {
        name: 'offering_help',
        category: 'conversational',
        emotion: 'empathy',
        baseIntensity: 0.8,
        emotionDuration: 500,
        description: 'AI offers assistance',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 0.8 },
            { at: 200, action: 'gesture', value: 'nod' },
            { at: 600, action: 'gesture', value: 'point' }
        ]
    },

    offering_urgent_help: {
        name: 'offering_urgent_help',
        category: 'conversational',
        emotion: 'empathy',
        baseIntensity: 1.0,
        emotionDuration: 400,
        description: 'AI urgently offers help for frustrated user',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 1.0 },
            { at: 150, action: 'gesture', value: 'shake' },
            { at: 400, action: 'gesture', value: 'nod' },
            { at: 700, action: 'gesture', value: 'point' }
        ]
    },

    // Apologizing
    apologizing: {
        name: 'apologizing',
        category: 'conversational',
        emotion: 'empathy',
        baseIntensity: 0.85,
        emotionDuration: 600,
        description: 'AI apologizes for mistake or error',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 0.85 },
            { at: 200, action: 'gesture', value: 'shake' },
            { at: 600, action: 'gesture', value: 'breathe' }
        ]
    },

    // Encouraging
    encouraging: {
        name: 'encouraging',
        category: 'conversational',
        emotion: 'joy',
        gesture: 'nod',
        delay: 200,
        baseIntensity: 0.75,
        emotionDuration: 500,
        description: 'AI encourages user to continue'
    },

    // Greeting
    greeting: {
        name: 'greeting',
        category: 'conversational',
        emotion: 'joy',
        gesture: 'wave',
        delay: 200,
        baseIntensity: 0.7,
        emotionDuration: 500,
        description: 'AI greets user warmly'
    },

    // Responding
    responding_positive: {
        name: 'responding_positive',
        category: 'conversational',
        emotion: 'joy',
        gesture: 'bounce',
        delay: 150,
        baseIntensity: 0.75,
        emotionDuration: 500,
        description: 'AI responds with positive sentiment'
    },

    responding_neutral: {
        name: 'responding_neutral',
        category: 'conversational',
        emotion: 'calm',
        gesture: 'drift',
        delay: 150,
        baseIntensity: 0.6,
        emotionDuration: 500,
        description: 'AI responds with neutral sentiment'
    },

    responding_negative: {
        name: 'responding_negative',
        category: 'conversational',
        emotion: 'empathy',
        gesture: 'shake',
        delay: 150,
        baseIntensity: 0.8,
        emotionDuration: 600,
        description: 'AI responds to negative situation'
    }
};

export default CONVERSATIONAL_PERFORMANCES;
