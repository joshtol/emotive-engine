/**
 * Ambient Dance Gestures
 * Continuous, looping gestures that provide foundational groove movement
 * These run as a base layer with other gestures layered on top
 */

// Base groove movements - continuous loops
export const grooveSway = {
    name: 'grooveSway',
    type: 'ambient',
    category: 'dance',
    duration: -1, // Infinite loop
    amplitude: 0.3,
    frequency: 1.0,
    easing: 'sineInOut',
    loop: true,
    blendable: true,

    animation: {
        x: {
            type: 'oscillate',
            amplitude: 15,
            frequency: 'bpm',
            phase: 0
        },
        rotation: {
            type: 'oscillate',
            amplitude: 5,
            frequency: 'bpm',
            phase: 0.25
        },
        scaleX: {
            type: 'oscillate',
            amplitude: 0.02,
            frequency: 'bpm*2',
            phase: 0
        }
    },

    description: 'Continuous hip swaying for funk/latin grooves'
};

export const grooveBob = {
    name: 'grooveBob',
    type: 'ambient',
    category: 'dance',
    duration: -1,
    amplitude: 0.4,
    frequency: 1.0,
    easing: 'quadInOut',
    loop: true,
    blendable: true,

    animation: {
        y: {
            type: 'oscillate',
            amplitude: 10,
            frequency: 'bpm',
            phase: 0
        },
        scaleY: {
            type: 'oscillate',
            amplitude: 0.03,
            frequency: 'bpm',
            phase: 0.5
        },
        rotation: {
            type: 'oscillate',
            amplitude: 2,
            frequency: 'bpm*2',
            phase: 0
        }
    },

    description: 'Head and body bobbing for hip-hop/techno'
};

export const grooveFlow = {
    name: 'grooveFlow',
    type: 'ambient',
    category: 'dance',
    duration: -1,
    amplitude: 0.25,
    frequency: 0.75,
    easing: 'sineInOut',
    loop: true,
    blendable: true,

    animation: {
        x: {
            type: 'figure8',
            amplitude: 20,
            frequency: 'bpm/2',
            phase: 0
        },
        y: {
            type: 'figure8',
            amplitude: 10,
            frequency: 'bpm/2',
            phase: 0.25
        },
        rotation: {
            type: 'oscillate',
            amplitude: 8,
            frequency: 'bpm/2',
            phase: 0
        }
    },

    description: 'Smooth figure-8 motion for swing/jazz'
};

export const groovePulse = {
    name: 'groovePulse',
    type: 'ambient',
    category: 'dance',
    duration: -1,
    amplitude: 0.3,
    frequency: 0.5,  // Slower for more chill vibe
    easing: 'sineInOut',
    loop: true,
    blendable: true,

    animation: {
        x: {
            type: 'figure8',
            amplitude: 25,
            frequency: 'bpm/4',  // Slow drift
            phase: 0
        },
        y: {
            type: 'wave',
            amplitude: 15,
            frequency: 'bpm/3',
            phase: 0.25
        },
        rotation: {
            type: 'oscillate',
            amplitude: 8,
            frequency: 'bpm/2',
            phase: 0
        },
        scale: {
            type: 'breathe',
            amplitude: 0.08,
            frequency: 'bpm/2',
            phase: 0
        }
    },

    description: 'Smooth ambient floating with gentle breathing'
};

export const grooveStep = {
    name: 'grooveStep',
    type: 'ambient',
    category: 'dance',
    duration: -1,
    amplitude: 0.35,
    frequency: 1.0,
    easing: 'linear',
    loop: true,
    blendable: true,

    animation: {
        x: {
            type: 'step',
            amplitude: 25,
            frequency: 'bpm',
            pattern: [1, 0, -1, 0] // Right, center, left, center
        },
        y: {
            type: 'bounce',
            amplitude: 5,
            frequency: 'bpm*2',
            phase: 0
        },
        rotation: {
            type: 'step',
            amplitude: 3,
            frequency: 'bpm',
            pattern: [1, 0, -1, 0]
        }
    },

    description: 'Side-to-side stepping for disco/dance'
};

// Transition gestures - smooth connectors
export const transitionLean = {
    name: 'transitionLean',
    type: 'transition',
    category: 'dance',
    duration: 500,
    amplitude: 0.5,
    easing: 'cubicInOut',
    blendable: true,

    animation: {
        rotation: {
            type: 'tween',
            target: 'next',
            duration: 500
        },
        x: {
            type: 'tween',
            target: 'next',
            duration: 500
        }
    },

    description: 'Smooth weight shift between positions'
};

export const transitionRoll = {
    name: 'transitionRoll',
    type: 'transition',
    category: 'dance',
    duration: 750,
    amplitude: 0.6,
    easing: 'sineInOut',
    blendable: true,

    animation: {
        rotation: {
            type: 'roll',
            amplitude: 360,
            duration: 750
        },
        scale: {
            type: 'pulse',
            amplitude: 0.1,
            duration: 750
        }
    },

    description: 'Body roll between positions'
};

export const transitionGlide = {
    name: 'transitionGlide',
    type: 'transition',
    category: 'dance',
    duration: 600,
    amplitude: 0.4,
    easing: 'quadInOut',
    blendable: true,

    animation: {
        x: {
            type: 'glide',
            target: 'next',
            duration: 600
        },
        y: {
            type: 'float',
            amplitude: 5,
            duration: 600
        }
    },

    description: 'Sliding movement between positions'
};

// Groove-specific composite gestures
export const funkChicken = {
    name: 'funkChicken',
    type: 'composite',
    category: 'dance',
    duration: 2000,
    amplitude: 0.8,
    beats: 4,

    sequence: [
        { time: 0, gesture: 'bounce', velocity: 1.0 },
        { time: 250, gesture: 'wiggle', velocity: 0.7 },
        { time: 500, gesture: 'lean', velocity: 0.8 },
        { time: 750, gesture: 'wiggle', velocity: 0.7 },
        { time: 1000, gesture: 'bounce', velocity: 1.0 },
        { time: 1250, gesture: 'twist', velocity: 0.6 },
        { time: 1500, gesture: 'lean', velocity: 0.8 },
        { time: 1750, gesture: 'wiggle', velocity: 0.5 }
    ],

    baseLayer: 'grooveSway',

    description: 'Classic funk dance move'
};

export const latinHips = {
    name: 'latinHips',
    type: 'composite',
    category: 'dance',
    duration: 1500,
    amplitude: 0.7,
    beats: 3,

    sequence: [
        { time: 0, gesture: 'sway', velocity: 0.9 },
        { time: 375, gesture: 'twist', velocity: 0.6 },
        { time: 500, gesture: 'sway', velocity: 0.9, direction: -1 },
        { time: 875, gesture: 'twist', velocity: 0.6, direction: -1 },
        { time: 1000, gesture: 'sway', velocity: 0.9 },
        { time: 1375, gesture: 'wiggle', velocity: 0.5 }
    ],

    baseLayer: 'grooveSway',

    description: 'Salsa-style hip movement'
};

export const swingOut = {
    name: 'swingOut',
    type: 'composite',
    category: 'dance',
    duration: 3000,
    amplitude: 0.9,
    beats: 6,

    sequence: [
        { time: 0, gesture: 'lean', velocity: 0.8, direction: 1 },
        { time: 500, gesture: 'spin', velocity: 0.6 },
        { time: 1000, gesture: 'bounce', velocity: 0.9 },
        { time: 1500, gesture: 'lean', velocity: 0.8, direction: -1 },
        { time: 2000, gesture: 'spin', velocity: 0.6, direction: -1 },
        { time: 2500, gesture: 'bounce', velocity: 0.9 }
    ],

    baseLayer: 'grooveFlow',

    description: 'Jazz swing movement pattern'
};

export const twoStep = {
    name: 'twoStep',
    type: 'composite',
    category: 'dance',
    duration: 1000,
    amplitude: 0.5,
    beats: 2,

    sequence: [
        { time: 0, gesture: 'step', velocity: 0.8, direction: 1 },
        { time: 500, gesture: 'step', velocity: 0.8, direction: -1 }
    ],

    baseLayer: 'grooveStep',

    description: 'Basic two-step dance pattern'
};

export const robotPop = {
    name: 'robotPop',
    type: 'composite',
    category: 'dance',
    duration: 1000,
    amplitude: 0.7,
    beats: 2,

    sequence: [
        { time: 0, gesture: 'pulse', velocity: 1.0 },
        { time: 125, gesture: 'glitch', velocity: 0.7 },
        { time: 250, gesture: 'pulse', velocity: 0.8 },
        { time: 375, gesture: 'glitch', velocity: 0.6 },
        { time: 500, gesture: 'pulse', velocity: 1.0 },
        { time: 625, gesture: 'flash', velocity: 0.5 },
        { time: 750, gesture: 'pulse', velocity: 0.8 },
        { time: 875, gesture: 'glitch', velocity: 0.4 }
    ],

    baseLayer: 'grooveBob',

    description: 'Techno/electronic robot style movement'
};

// Export all gestures
export const ambientDanceGestures = {
    // Base movements
    grooveSway,
    grooveBob,
    grooveFlow,
    groovePulse,
    grooveStep,

    // Transitions
    transitionLean,
    transitionRoll,
    transitionGlide,

    // Composite dances
    funkChicken,
    latinHips,
    swingOut,
    twoStep,
    robotPop
};

// Helper function to get gesture by name
export function getAmbientDanceGesture(name) {
    return ambientDanceGestures[name] || null;
}

// Helper to check if gesture is ambient (continuous)
export function isAmbientGesture(gesture) {
    return gesture && (gesture.type === 'ambient' || gesture.loop === true);
}

// Helper to check if gesture is a transition
export function isTransitionGesture(gesture) {
    return gesture && gesture.type === 'transition';
}

// Helper to check if gesture is composite
export function isCompositeGesture(gesture) {
    return gesture && gesture.type === 'composite';
}