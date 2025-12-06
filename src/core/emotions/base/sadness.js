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
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

export default {
    name: 'sadness',
    emoji: '😢',
    description: 'Deep melancholic sorrow',

    // Visual properties
    visual: {
        glowColor: '#4169E1',       // Royal blue melancholy
        particleRate: 50,           // Steady tear-like emission (increased for 3D)
        minParticles: 0,            // Can fade to emptiness
        maxParticles: 80,           // More tears for dramatic effect
        particleBehavior: 'falling', // Tears falling downward
        breathRate: 0.6,            // Slow, heavy breathing
        breathDepth: 0.12,          // Deep, sighing breaths
        coreJitter: false,          // Still, heavy core
        blinkRate: 0.6,             // Less frequent blinking (withdrawn)
        blinkSpeed: 0.8,            // Slower, heavier blink animation
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
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'gentle',             // Slow, heavy drifting - melancholic
            speed: 0.7,                 // Slow rotation (matches modifiers.speed)
            axes: [0, 0.2, 0],          // Slow Y-axis drift
            musicSync: false            // Sadness doesn't sync to music
        },
        glow: {
            color: '#4169E1',           // Royal blue (matches visual.glowColor)
            intensity: 0.65,            // Dimmer subdued glow
            pulse: {
                speed: 0.6,             // Slow heavy pulsing (matches breathRate)
                range: [0.5, 0.8]       // Subtle pulse (muted)
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.12,            // Deep sighing breaths (matches breathDepth)
                rate: 0.6               // Slow breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 0.2,        // Energy movement speed - sluggish, heavy
        shimmerSpeed: 0.3,      // Vertical pulse speed - slow, weighted
        turbulence: 0.1         // Chaos/randomness factor - minimal, subdued
    }
};
