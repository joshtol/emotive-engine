/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Anger Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Anger emotional state - intense rage (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/anger
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

/**
 * Anger emotion configuration
 * Intense aggressive state with rapid, chaotic particles
 */
export default {
    name: 'anger',
    emoji: '😠',
    description: 'Intense rage and aggression',

    // Visual properties
    visual: {
        glowColor: '#DC143C',       // Crimson rage - more intense
        particleRate: 8,            // Aggressive flow - 8/sec with max 50 = ~6 sec particle life
        minParticles: 8,            // Maintain constant agitation
        maxParticles: 50,           // Match 3D system limit
        particleBehavior: 'aggressive', // Erratic, forceful particle movement
        breathRate: 2.2,            // Rapid, agitated breathing rhythm
        breathDepth: 0.15,          // Deep, forceful breath cycles
        coreJitter: true,           // Visual tremor from internal rage
        blinkRate: 1.6,             // More frequent blinking (agitated)
        blinkSpeed: 1.3,            // Faster, snappier blink animation
        particleColors: [
            { color: '#DC143C', weight: 25 },  // Crimson rage
            { color: '#FF0000', weight: 20 },  // Pure red fury
            { color: '#B22222', weight: 15 },  // FireBrick intensity
            { color: '#FF4500', weight: 15 },  // OrangeRed flames
            { color: '#8B0000', weight: 10 },  // Dark red depth
            { color: '#FF6347', weight: 10 },  // Tomato heat
            { color: '#660000', weight: 5 }    // Nearly black ember
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.5,        // Accelerated motion for urgency
        amplitude: 1.4,    // Exaggerated movement range
        intensity: 1.3,    // Heightened force and impact
        smoothness: 0.3,   // Sharp, abrupt transitions
        regularity: 0.7,   // Erratic, unpredictable patterns
        addShake: true     // Tremor effect from rage
    },

    // Typical gestures for anger
    typicalGestures: [
        'shake',     // Violent shaking
        'vibrate',   // Angry vibration
        'expand',    // Explosive expansion
        'pulse',     // Angry pulsing
        'flicker',   // Rage flickering
        'strike'     // Strike motion
    ],

    // Transition hints
    transitions: {
        duration: 300,          // Swift state change
        easing: 'easeOutExpo',  // Explosive, sudden entrance
        priority: 8,            // High priority emotional state
        shakeOnEntry: true      // Trigger screen disturbance
    },

    // Special anger properties
    special: {
        screenShake: true,         // Environmental disturbance effect
        particleTrails: 'fire',    // Incendiary particle trail style
        glowPulse: true,          // Rhythmic aura fluctuation
        temperatureEffect: 'hot'   // Warm spectrum color shifting
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'unstable',           // Trembling rage with explosive bursts
            speed: 1.5,                 // 1.5x faster than neutral rotation
            axes: [0, 0.3, 0],          // Rotation rates [X, Y, Z] - only Y-axis base spin
            shake: {
                amplitude: 0.02,        // Max safe trembling (hard-limited by RotationBehavior)
                frequency: 7.0          // Rapid vibration (7 Hz) - barely contained fury
            },
            eruption: {
                enabled: true,          // Periodic explosive bursts
                interval: 3000,         // Burst every 3 seconds
                speedMultiplier: 3.5,   // Rotation speeds up 3.5x during burst
                duration: 400           // Burst lasts 400ms
            },
            musicSync: false            // Anger doesn't sync to music - chaotic
        },
        glow: {
            color: '#DC143C',           // Crimson rage (matches visual.glowColor)
            intensity: 1.8,             // Strong burning aura
            pulse: {
                speed: 2.2,             // Rapid pulsing (matches breathRate)
                range: [0.8, 2.0]       // Pulse between 80% and 200% intensity
            }
        },
        scale: {
            base: 1.0,                  // Normal size
            breathe: {
                enabled: true,
                depth: 0.15,            // 15% size variation (matches breathDepth)
                rate: 2.2               // Rapid breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 2.0,        // Energy movement speed - aggressive, surging
        shimmerSpeed: 0.8,      // Vertical pulse speed - intense throb
        turbulence: 0.8         // Chaos/randomness factor - chaotic, unstable
    }
};
