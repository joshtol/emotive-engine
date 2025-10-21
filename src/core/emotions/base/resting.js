/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Resting Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Resting emotional state - deep relaxation with slow drift (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/resting
 */

export default {
    name: 'resting',
    emoji: '😴',
    description: 'Deep relaxation with slow drift',

    // Visual properties
    visual: {
        glowColor: '#9370DB',       // Sleepy purple twilight
        glowIntensity: 0.8,         // Dimmed, drowsy glow
        particleRate: 10,           // Lazy particle generation
        minParticles: 3,            // Minimal sleepy presence
        maxParticles: 5,            // Few drifting particles
        particleBehavior: 'resting', // Slow, floating behavior
        breathRate: 0.8,            // Deep, slow breathing
        breathDepth: 0.12,          // Pronounced rest breaths
        coreJitter: false,          // Perfectly still core
        particleColors: [
            { color: '#9370DB', weight: 30 },  // Primary sleepy purple
            { color: '#A591C4', weight: 20 },  // Soft lavender drift
            { color: '#B366FF', weight: 20 },  // Dreamy violet accent
            { color: '#B8A1E6', weight: 15 },  // Light drowsy highlights
            { color: '#674D9B', weight: 15 }   // Deep sleep shadows
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.5,         // Slowed, drowsy pace
        amplitude: 0.4,     // Minimal movement range
        intensity: 0.5,     // Reduced energy level
        smoothness: 1.4,    // Extra smooth drifting
        regularity: 0.9,    // Slightly irregular, natural rest
        addWeight: true     // Heavy, weighted feeling
    },

    // Typical gestures for resting
    typicalGestures: ['breathe', 'drift', 'sway', 'float'],

    // Transition configuration
    transitions: {
        duration: 1000,         // Slow fade to rest
        easing: 'easeInOut',   // Gentle transition
        priority: 2            // Low priority state
    }
};
