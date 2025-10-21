/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Surprise Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Surprise emotional state - sudden shock with explosive particles (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/surprise
 */

export default {
    name: 'surprise',
    emoji: '😲',
    description: 'Sudden shock with explosive particles',

    // Visual properties
    visual: {
        glowColor: '#FFD700',       // Bright gold (shining surprise)
        glowIntensity: 1.8,         // Very intense, sudden flash
        particleRate: 30,           // Rapid burst emission
        minParticles: 0,            // Can start from nothing
        maxParticles: 15,           // Burst of shocked particles
        particleBehavior: 'burst',  // Explosive outward motion
        breathRate: 0.3,            // Gasping, held breath
        breathDepth: 0.18,          // Large shocked inhale
        coreJitter: false,          // Frozen in surprise
        particleColors: [
            { color: '#FFD700', weight: 25 },  // Gold burst
            { color: '#FFA500', weight: 20 },  // Orange shock
            { color: '#FFFF00', weight: 15 },  // Yellow flash
            { color: '#FF6347', weight: 15 },  // Tomato red excitement
            { color: '#FFE4B5', weight: 10 },  // Moccasin highlight
            { color: '#FF4500', weight: 10 },  // OrangeRed pop
            { color: '#FFFACD', weight: 5 }    // LemonChiffon sparkle
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.6,         // Rapid, startled reactions
        amplitude: 1.5,     // Large, exaggerated movements
        intensity: 1.4,     // Strong shock force
        smoothness: 0.7,    // Abrupt, jerky motions
        regularity: 0.8,    // Erratic surprise patterns
        addPop: true        // Popping, explosive effect
    },

    // Typical gestures for surprise
    typicalGestures: ['expand', 'bounce', 'flash', 'pulse', 'pop'],

    // Transition configuration
    transitions: {
        duration: 200,           // Instant shock response
        easing: 'easeOutBack',  // Snappy, elastic reaction
        priority: 6             // High interrupt priority
    }
};
