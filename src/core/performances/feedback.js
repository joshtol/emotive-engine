/**
 * Feedback Performances
 *
 * Universal archetypes for success and error feedback
 */

export const FEEDBACK_PERFORMANCES = {
    // Success feedback
    success_minor: {
        name: 'success_minor',
        category: 'feedback',
        emotion: 'joy',
        gesture: 'bounce',
        delay: 150,
        baseIntensity: 0.7,
        emotionDuration: 500,
        description: 'Small success (item scanned, form field validated)',
    },

    success_moderate: {
        name: 'success_moderate',
        category: 'feedback',
        emotion: 'joy',
        baseIntensity: 0.8,
        emotionDuration: 500,
        description: 'Moderate success (section completed, task done)',
        sequence: [
            { at: 0, action: 'emotion', value: 'joy', intensity: 0.8 },
            { at: 200, action: 'gesture', value: 'bounce' },
            { at: 600, action: 'gesture', value: 'wiggle' },
        ],
    },

    success_major: {
        name: 'success_major',
        category: 'feedback',
        emotion: 'triumph',
        baseIntensity: 0.9,
        emotionDuration: 500,
        description: 'Major success (milestone reached, goal achieved)',
        sequence: [
            { at: 0, action: 'emotion', value: 'joy', intensity: 0.85 },
            { at: 150, action: 'gesture', value: 'bounce' },
            { at: 500, action: 'emotion', value: 'triumph', intensity: 0.9 },
            { at: 600, action: 'gesture', value: 'glow' },
        ],
    },

    success_epic: {
        name: 'success_epic',
        category: 'feedback',
        emotion: 'triumph',
        baseIntensity: 1.0,
        emotionDuration: 500,
        description: 'Epic success with visual transformation',
        sequence: [
            { at: 0, action: 'emotion', value: 'triumph', intensity: 1.0 },
            { at: 200, action: 'gesture', value: 'glow' },
            { at: 700, action: 'morph', value: 'sun' },
            { at: 700, action: 'chain', value: 'radiance' },
        ],
    },

    // Error feedback
    error_minor: {
        name: 'error_minor',
        category: 'feedback',
        emotion: 'concern',
        gesture: 'shake',
        delay: 150,
        baseIntensity: 0.6,
        emotionDuration: 500,
        description: 'Minor error, easily recoverable',
    },

    error_moderate: {
        name: 'error_moderate',
        category: 'feedback',
        emotion: 'empathy',
        baseIntensity: 0.75,
        emotionDuration: 600,
        description: 'Moderate error, needs user action',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 0.75 },
            { at: 200, action: 'gesture', value: 'shake' },
            { at: 600, action: 'gesture', value: 'nod' },
        ],
    },

    error_major: {
        name: 'error_major',
        category: 'feedback',
        emotion: 'empathy',
        baseIntensity: 0.9,
        emotionDuration: 600,
        description: 'Major error, needs help',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 0.9 },
            { at: 150, action: 'gesture', value: 'shake' },
            { at: 500, action: 'gesture', value: 'nod' },
            { at: 800, action: 'gesture', value: 'point' },
        ],
    },

    error_critical: {
        name: 'error_critical',
        category: 'feedback',
        emotion: 'empathy',
        baseIntensity: 1.0,
        emotionDuration: 500,
        description: 'Critical error, urgent attention needed',
        sequence: [
            { at: 0, action: 'emotion', value: 'empathy', intensity: 1.0 },
            { at: 100, action: 'gesture', value: 'shake' },
            { at: 400, action: 'gesture', value: 'point' },
        ],
    },

    // Warning feedback
    warning: {
        name: 'warning',
        category: 'feedback',
        emotion: 'concern',
        gesture: 'pulse',
        delay: 150,
        baseIntensity: 0.7,
        emotionDuration: 500,
        description: 'Warning, needs attention',
    },

    // Info feedback
    info: {
        name: 'info',
        category: 'feedback',
        emotion: 'neutral',
        gesture: 'drift',
        delay: 100,
        baseIntensity: 0.5,
        emotionDuration: 400,
        description: 'Informational, passive notification',
    },

    // Progress feedback
    progress_start: {
        name: 'progress_start',
        category: 'feedback',
        emotion: 'anticipation',
        gesture: 'pulse',
        delay: 100,
        baseIntensity: 0.6,
        emotionDuration: 500,
        description: 'Starting a process',
    },

    progress_ongoing: {
        name: 'progress_ongoing',
        category: 'feedback',
        emotion: 'focused',
        gesture: 'breathe',
        delay: 0,
        baseIntensity: 0.7,
        emotionDuration: 600,
        description: 'Process ongoing, working',
    },

    progress_complete: {
        name: 'progress_complete',
        category: 'feedback',
        emotion: 'satisfaction',
        gesture: 'glow',
        delay: 200,
        baseIntensity: 0.8,
        emotionDuration: 500,
        description: 'Process completed successfully',
    },
};

export default FEEDBACK_PERFORMANCES;
