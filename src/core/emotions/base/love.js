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
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'love',
    emoji: '💕',
    description: 'Warm affection with orbiting particles',

    // Visual properties
    visual: {
        glowColor: '#FF1493', // Deep passionate pink (DeepPink)
        particleRate: 6, // Gentle flow - 6/sec with max 50 = ~8 sec particle life
        minParticles: 15, // Constant loving presence
        maxParticles: 50, // Match 3D system limit
        particleBehavior: 'orbiting', // Particles orbit romantically
        breathRate: 0.75, // Slow, content breathing
        breathDepth: 0.15, // Deep, satisfied breaths
        coreJitter: false, // Stable, secure feeling
        blinkRate: 1.2, // Slightly more frequent blinking (affectionate)
        blinkSpeed: 1.0, // Normal blink animation speed
        particleColors: [
            { color: '#FF1493', weight: 30 }, // Deep passionate pink
            { color: '#FF69B4', weight: 25 }, // Hot pink
            { color: '#FF007F', weight: 15 }, // Rose red
            { color: '#FFB6C1', weight: 10 }, // Light pink highlights
            { color: '#FF45A0', weight: 10 }, // Vibrant magenta
            { color: '#E91E63', weight: 5 }, // Material pink accent
            { color: '#FFC0CB', weight: 5 }, // Soft pink glow
        ],
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.9, // Gentle, romantic pace
        amplitude: 1.1, // Slightly expanded movements
        intensity: 1.2, // Enhanced emotional depth
        smoothness: 1.4, // Extra smooth, flowing motion
        regularity: 1.2, // Consistent, rhythmic patterns
        addWarmth: true, // Warm, inviting quality
    },

    // Typical gestures for love
    typicalGestures: ['pulse', 'sway', 'orbit', 'glow', 'breathe', 'float'],

    // Transition configuration
    transitions: {
        duration: 700, // Gradual emotional shift
        easing: 'easeInOut', // Smooth, gentle transition
        priority: 5, // Moderate emotional priority
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'gentle', // Smooth gentle rotation (wobble-free)
            speed: 0.9, // Gentle rotation (matches modifiers.speed)
            axes: [0, 0.28, 0], // Smooth Y-axis orbit
            musicSync: true, // Love syncs beautifully with music
        },
        glow: {
            color: '#FF1493', // Deep passionate pink (matches visual.glowColor)
            intensity: 1.8, // Strong radiant warmth
            pulse: {
                speed: 0.75, // Slow content pulsing (matches breathRate)
                range: [1.3, 2.0], // Strong pulse variation (heartbeat-like)
            },
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.15, // Deep satisfied breaths (matches breathDepth)
                rate: 0.75, // Slow breathing (matches breathRate)
            },
        },
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 0.8, // Energy movement speed - warm, flowing
        shimmerSpeed: 1.2, // Vertical pulse speed - heartbeat-like rhythm
        turbulence: 0.2, // Chaos/randomness factor - smooth, romantic
    },

    // Rhythm game modifiers
    rhythmModifiers: {
        windowMultiplier: 1.15,
        visualNoise: 0,
        inputDelay: 0,
        tempoShift: 0,
    },
};
