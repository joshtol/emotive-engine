/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Love Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Love emotional state - warm affection with orbiting particles (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/love
 */

export default {
    name: 'love',
    emoji: '💕',
    description: 'Warm affection with orbiting particles',

    // Visual properties
    visual: {
        glowColor: '#FF1493',       // Deep passionate pink (DeepPink)
        glowIntensity: 1.8,         // Strong, radiant warmth
        particleRate: 25,           // Generous particle flow
        minParticles: 10,           // Constant loving presence
        maxParticles: 18,           // Abundant affection display
        particleBehavior: 'orbiting', // Particles orbit romantically
        breathRate: 0.75,           // Slow, content breathing
        breathDepth: 0.15,          // Deep, satisfied breaths
        coreJitter: false,          // Stable, secure feeling
        particleColors: [
            { color: '#FF1493', weight: 30 },  // Deep passionate pink
            { color: '#FF69B4', weight: 25 },  // Hot pink
            { color: '#FF007F', weight: 15 },  // Rose red
            { color: '#FFB6C1', weight: 10 },  // Light pink highlights
            { color: '#FF45A0', weight: 10 },  // Vibrant magenta
            { color: '#E91E63', weight: 5 },   // Material pink accent
            { color: '#FFC0CB', weight: 5 }    // Soft pink glow
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.9,         // Gentle, romantic pace
        amplitude: 1.1,     // Slightly expanded movements
        intensity: 1.2,     // Enhanced emotional depth
        smoothness: 1.4,    // Extra smooth, flowing motion
        regularity: 1.2,    // Consistent, rhythmic patterns
        addWarmth: true     // Warm, inviting quality
    },

    // Typical gestures for love
    typicalGestures: ['pulse', 'sway', 'orbit', 'glow', 'breathe', 'float'],

    // Transition configuration
    transitions: {
        duration: 700,         // Gradual emotional shift
        easing: 'easeInOut',  // Smooth, gentle transition
        priority: 5           // Moderate emotional priority
    }
};
