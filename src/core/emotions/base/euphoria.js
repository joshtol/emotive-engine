/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Euphoria Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Euphoria emotional state - radiant hope and new beginnings (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/euphoria
 */

export default {
    name: 'euphoria',
    emoji: '🌟',
    description: 'Radiant hope and new beginnings',

    // Visual properties
    visual: {
        glowColor: '#FFB6C1',       // Light pink euphoric glow
        glowIntensity: 1.2,         // Bright radiance without accumulation
        particleRate: 35,           // Abundant particle emission
        minParticles: 15,           // Abundant positive energy
        maxParticles: 30,           // Maximum radiant display
        particleBehavior: 'radiant', // Outward radiating particles
        breathRate: 1.3,            // Elevated, joyful breathing
        breathDepth: 0.25,          // Full, satisfied breaths
        coreJitter: false,          // Stable, confident core
        particleColors: [
            { color: '#FFB6C1', weight: 20 },  // Light pink bliss
            { color: '#FFD700', weight: 18 },  // Golden joy
            { color: '#87CEEB', weight: 15 },  // Sky blue serenity
            { color: '#DDA0DD', weight: 15 },  // Plum transcendence
            { color: '#98FB98', weight: 12 },  // Pale green harmony
            { color: '#FFA07A', weight: 10 },  // Light salmon warmth
            { color: '#E6E6FA', weight: 8 },   // Lavender dream
            { color: '#FFFFFF', weight: 2 }    // Pure white sparkle
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.4,         // Energized, flowing pace
        amplitude: 1.5,     // Expansive, reaching movements
        intensity: 1.6,     // Powerful positive force
        smoothness: 1.3,    // Extra fluid, graceful motion
        regularity: 0.8,    // Natural variation in rhythm
        addWarmth: true,    // Warm, inviting quality
        addLift: true       // Upward, elevating tendency
    },

    // Typical gestures for euphoria
    typicalGestures: ['expand', 'radiate', 'pulse', 'glow', 'float', 'bloom'],

    // Transition configuration
    transitions: {
        duration: 600,           // Smooth emergence
        easing: 'easeOutExpo',  // Explosive, radiant entrance
        priority: 8             // High priority transcendent state
    }
};
