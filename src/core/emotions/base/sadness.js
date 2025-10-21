/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sadness Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sadness emotional state - melancholic sorrow (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/sadness
 */

export default {
    name: 'sadness',
    emoji: '😢',
    description: 'Deep melancholic sorrow',

    // Visual properties
    visual: {
        glowColor: '#4169E1',       // Royal blue melancholy
        glowIntensity: 0.65,        // Dimmer, more subdued glow
        particleRate: 25,           // Steady tear-like emission
        minParticles: 0,            // Can fade to emptiness
        maxParticles: 25,           // Abundant sorrow display
        particleBehavior: 'falling', // Tears falling downward
        breathRate: 0.6,            // Slow, heavy breathing
        breathDepth: 0.12,          // Deep, sighing breaths
        coreJitter: false,          // Still, heavy core
        particleColors: [
            { color: '#4169E1', weight: 25 },  // Royal blue sorrow
            { color: '#1E90FF', weight: 20 },  // Dodger blue tears
            { color: '#6495ED', weight: 15 },  // Cornflower blue melancholy
            { color: '#B0C4DE', weight: 15 },  // Light steel blue mist
            { color: '#191970', weight: 10 },  // Midnight blue depth
            { color: '#87CEEB', weight: 10 },  // Sky blue glimmer
            { color: '#2F4F4F', weight: 5 }    // Dark slate gray shadow
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.7,         // Slowed, weary pace
        amplitude: 0.6,     // Diminished movement range
        intensity: 0.8,     // Weakened emotional force
        smoothness: 1.3,    // Smooth, flowing sorrow
        regularity: 1.1,    // Slightly monotonous patterns
        addGravity: true    // Downward, heavy feeling
    },

    // Typical gestures for sadness
    typicalGestures: [
        'droop',
        'sway',
        'contract',
        'drift',
        'sink'
    ],

    // Transition configuration
    transitions: {
        duration: 800,         // Gradual mood shift
        easing: 'easeInOut',  // Smooth emotional transition
        priority: 3           // Lower emotional priority
    }
};
