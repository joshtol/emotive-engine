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
        glowIntensity: 1.8,         // Stronger, burning aura
        particleRate: 20,           // More frequent particle generation for chaos
        minParticles: 3,            // Maintain constant agitation
        maxParticles: 10,           // More particles for intensity
        particleBehavior: 'aggressive', // Erratic, forceful particle movement
        breathRate: 2.2,            // Rapid, agitated breathing rhythm
        breathDepth: 0.15,          // Deep, forceful breath cycles
        coreJitter: true,           // Visual tremor from internal rage
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
            type: 'unstable',           // Wobble/shake pattern - uncontrolled rage
            speed: 1.5,                 // 1.5x faster than neutral rotation
            axes: [0.05, 0.02, 0.03],   // Rotation rates [X, Y, Z] - wobbles on all axes
            shake: {
                amplitude: 0.02,        // Max rotation shake angle (radians)
                frequency: 8            // Rapid tremor (8 Hz)
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
    }
};
