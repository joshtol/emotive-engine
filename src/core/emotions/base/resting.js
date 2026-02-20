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
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'resting',
    emoji: '😴',
    description: 'Deep relaxation with slow drift',

    // Visual properties
    visual: {
        glowColor: '#9370DB',       // Sleepy purple twilight
        particleRate: 1,            // Lazy flow - 1/sec with max 5 = ~5 sec particle life
        minParticles: 3,            // Minimal sleepy presence
        maxParticles: 5,            // Few drifting particles
        particleBehavior: 'resting', // Slow, floating behavior
        breathRate: 0.8,            // Deep, slow breathing
        breathDepth: 0.12,          // Pronounced rest breaths
        coreJitter: false,          // Perfectly still core
        blinkRate: 0.4,             // Very infrequent blinking (sleepy)
        blinkSpeed: 0.7,            // Slower, drowsy blink animation
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
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'gentle',             // Minimal drifting - sleeping
            speed: 0.5,                 // Very slow rotation (matches modifiers.speed)
            axes: [0, 0.15, 0],         // Minimal Y-axis drift
            musicSync: false            // Resting doesn't sync to music
        },
        glow: {
            color: '#9370DB',           // Sleepy purple (matches visual.glowColor)
            intensity: 0.8,             // Dimmed drowsy glow
            pulse: {
                speed: 0.8,             // Deep slow pulsing (matches breathRate)
                range: [0.6, 1.0]       // Subtle pulse (restful)
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.12,            // Pronounced rest breaths (matches breathDepth)
                rate: 0.8               // Deep slow breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 0.15,       // Energy movement speed - nearly still, dreaming
        shimmerSpeed: 0.1,      // Vertical pulse speed - deep sleep rhythm
        turbulence: 0.05        // Chaos/randomness factor - peaceful stillness
    },

    // Rhythm game modifiers
    rhythmModifiers: {
        windowMultiplier: 1.1,
        visualNoise: 0,
        inputDelay: 0,
        tempoShift: 0
    }
};
