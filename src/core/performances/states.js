/**
 * State Performances
 *
 * Performances for idle, waiting, and workflow states
 */

export const STATE_PERFORMANCES = {
    // Idle & waiting states
    idle: {
        name: 'idle',
        category: 'state',
        emotion: 'neutral',
        gesture: 'drift',
        delay: 0,
        baseIntensity: 0.5,
        emotionDuration: 600,
        description: 'System idle, waiting for user',
    },

    ready: {
        name: 'ready',
        category: 'state',
        emotion: 'neutral',
        gesture: 'wave',
        delay: 200,
        baseIntensity: 0.6,
        emotionDuration: 500,
        description: 'System ready for interaction',
    },

    waiting: {
        name: 'waiting',
        category: 'state',
        emotion: 'anticipation',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.6,
        emotionDuration: 600,
        description: 'System waiting for process to complete',
        loop: true,
        loopInterval: 1500,
    },

    // Workflow states
    processing: {
        name: 'processing',
        category: 'state',
        emotion: 'focused',
        gesture: 'breathe',
        delay: 0,
        baseIntensity: 0.7,
        emotionDuration: 600,
        description: 'System actively processing',
        loop: true,
        loopInterval: 1200,
    },

    scanning: {
        name: 'scanning',
        category: 'state',
        emotion: 'focused',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.75,
        emotionDuration: 500,
        description: 'Scanning or searching',
        loop: true,
        loopInterval: 1000,
    },

    analyzing: {
        name: 'analyzing',
        category: 'state',
        emotion: 'curiosity',
        gesture: 'drift',
        delay: 0,
        baseIntensity: 0.7,
        emotionDuration: 600,
        description: 'Analyzing data or input',
        loop: true,
        loopInterval: 1400,
    },

    // Completion states
    completing: {
        name: 'completing',
        category: 'state',
        emotion: 'anticipation',
        gesture: 'pulse',
        delay: 100,
        baseIntensity: 0.8,
        emotionDuration: 500,
        description: 'Final step, about to complete',
    },

    completed: {
        name: 'completed',
        category: 'state',
        emotion: 'satisfaction',
        gesture: 'glow',
        delay: 200,
        baseIntensity: 0.85,
        emotionDuration: 500,
        description: 'Process completed successfully',
    },

    // Review states
    reviewing: {
        name: 'reviewing',
        category: 'state',
        emotion: 'satisfaction',
        gesture: 'drift',
        delay: 0,
        baseIntensity: 0.65,
        emotionDuration: 600,
        description: 'Reviewing information or results',
    },

    // Active monitoring
    monitoring: {
        name: 'monitoring',
        category: 'state',
        emotion: 'focused',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.6,
        emotionDuration: 700,
        description: 'Actively monitoring for changes',
        loop: true,
        loopInterval: 2000,
    },

    // Paused state
    paused: {
        name: 'paused',
        category: 'state',
        emotion: 'neutral',
        gesture: 'breathe',
        delay: 200,
        baseIntensity: 0.5,
        emotionDuration: 600,
        description: 'System paused, can resume',
    },

    // Loading state
    loading: {
        name: 'loading',
        category: 'state',
        emotion: 'anticipation',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.65,
        emotionDuration: 500,
        description: 'Loading data or content',
        loop: true,
        loopInterval: 1100,
    },

    // Connecting state
    connecting: {
        name: 'connecting',
        category: 'state',
        emotion: 'anticipation',
        gesture: 'drift',
        delay: 0,
        baseIntensity: 0.6,
        emotionDuration: 600,
        description: 'Establishing connection',
        loop: true,
        loopInterval: 1300,
    },

    // Active state
    active: {
        name: 'active',
        category: 'state',
        emotion: 'focused',
        gesture: 'pulse',
        delay: 0,
        baseIntensity: 0.75,
        emotionDuration: 500,
        description: 'System actively engaged',
    },
};

export default STATE_PERFORMANCES;
