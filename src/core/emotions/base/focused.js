/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Focused Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Focused emotional state - intense concentration with directed flow (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/focused
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'focused',
    emoji: '🎯',
    description: 'Intense concentration with directed flow',

    // Visual properties
    visual: {
        glowColor: '#00CED1',       // Sharp cyan concentration
        particleRate: 10,           // Steady, controlled emission
        minParticles: 5,            // Consistent focus presence
        maxParticles: 12,           // Controlled attention display
        particleBehavior: 'directed', // Particles follow target
        breathRate: 1.2,            // Steady, measured breathing
        breathDepth: 0.08,          // Controlled, regular breaths
        coreJitter: true,           // Minimal tracking adjustments
        blinkRate: 0.7,             // Less frequent blinking (concentrating)
        blinkSpeed: 1.0,            // Normal blink animation speed
        particleColors: [
            { color: '#00CED1', weight: 30 },  // Primary focused cyan
            { color: '#4A9FA0', weight: 20 },  // Muted concentration tone
            { color: '#00FFFF', weight: 20 },  // Bright attention burst
            { color: '#5FE5E7', weight: 15 },  // Light focus highlights
            { color: '#006B6D', weight: 15 }   // Deep concentration base
        ],
        eyeOpenness: 0.7,           // Narrowed for concentration
        microAdjustments: true      // Subtle tracking movements
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.0,         // Baseline, deliberate pace
        amplitude: 0.9,     // Controlled movement range
        intensity: 1.1,     // Enhanced focus strength
        smoothness: 1.1,    // Precise, smooth tracking
        regularity: 1.2,    // Consistent, predictable patterns
        addPrecision: true  // Enhanced accuracy mode
    },

    // Typical gestures for focus
    typicalGestures: ['track', 'lock', 'scan', 'pulse', 'vibrate'],

    // Transition configuration
    transitions: {
        duration: 400,       // Moderate focus shift
        easing: 'easeIn',   // Gradual concentration
        priority: 5         // Mid-level attention priority
    },

    // Core appearance parameters
    getCoreParams(_state) {
        return {
            scaleX: 1.1,              // Slightly widened awareness
            scaleY: 0.7,              // Narrowed for concentration
            eyeOpenness: 0.7,         // Focused gaze intensity
            eyeExpression: 'focused', // Concentrated expression
            pupilOffset: { x: 0, y: 0 }, // Centered attention
            microAdjustments: true    // Small tracking movements
        };
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'still',              // Minimal rotation - locked concentration
            speed: 0.5,                 // Very slow rotation
            axes: [0, 0.1, 0],          // Minimal Y-axis drift
            musicSync: false            // Focus doesn't sync to music
        },
        glow: {
            color: '#00CED1',           // Sharp cyan (matches visual.glowColor)
            intensity: 1.2,             // Clear defined aura
            pulse: {
                speed: 1.2,             // Steady pulsing (matches breathRate)
                range: [1.0, 1.3]       // Subtle pulse (controlled)
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.08,            // Controlled breaths (matches breathDepth)
                rate: 1.2               // Steady breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 0.6,        // Energy movement speed - steady, directed
        shimmerSpeed: 0.2,      // Vertical pulse speed - minimal distraction
        turbulence: 0.1         // Chaos/randomness factor - laser-focused precision
    }
};
