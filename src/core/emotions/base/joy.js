/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Joy Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Joy emotional state - playful happiness (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/joy
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

/**
 * Joy emotion configuration
 * Playful happiness with popcorn popping particles
 */
export default {
    name: 'joy',
    emoji: '😊',
    description: 'Playful happiness and celebration',

    // Visual properties
    visual: {
        glowColor: '#FFEB3B',       // Bright yellow sunshine
        particleRate: 60,           // Abundant celebration particles (increased for 3D)
        minParticles: 0,            // Can start from stillness
        maxParticles: 100,          // Maximum joyful expression (increased for 3D)
        particleBehavior: 'popcorn', // Spontaneous popping effect
        breathRate: 1.5,            // Excited, happy breathing
        breathDepth: 0.10,          // Moderate breath variation
        coreJitter: false,          // Stable, confident happiness
        blinkRate: 1.3,             // More frequent blinking (happy)
        blinkSpeed: 1.1,            // Slightly faster blink animation
        particleColors: [
            { color: '#FFEB3B', weight: 25 },  // Bright sunshine yellow
            { color: '#FFC107', weight: 20 },  // Amber joy
            { color: '#FFFF00', weight: 15 },  // Pure yellow burst
            { color: '#FFD700', weight: 15 },  // Gold celebration
            { color: '#FFF59D', weight: 10 },  // Pale yellow sparkle
            { color: '#FF9800', weight: 10 },  // Orange warmth
            { color: '#FFFDE7', weight: 5 }    // Light cream highlight
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 1.8,        // Energetic, lively pace
        amplitude: 1.9,    // Expansive, celebratory movements
        intensity: 1.1,    // Enhanced joyful energy
        smoothness: 1.0,   // Natural, flowing motion
        regularity: 0.9,   // Playful, varied rhythm
        addBounce: true    // Extra springiness effect
    },

    // Typical gestures for joy
    typicalGestures: [
        'bounce',    // Happy bouncing
        'spin',      // Joyful spinning
        'wave',      // Excited waving
        'expand',    // Expanding with joy
        'shake',     // Excited shaking (gentle)
        'float'      // Floating with happiness
    ],

    // Transition hints
    transitions: {
        duration: 400,         // Swift mood elevation
        easing: 'easeOutBack', // Bouncy, playful entrance
        priority: 5,           // Elevated positive priority
        burstOnEntry: true     // Celebratory particle burst
    },

    /**
     * Get core rendering parameters for joy
     */
    getCoreParams(_state) {
        return {
            scaleX: 1.0,
            scaleY: 1.0,
            eyeOpenness: 1.0,
            eyeExpression: 'happy',  // ∪ shaped eyes
            pupilOffset: { x: 0, y: -0.1 },  // Looking slightly up
            sparkle: true  // Add sparkle effect
        };
    },

    // 3D rotation behavior and effects
    '3d': {
        rotation: {
            type: 'rhythmic',           // Syncs to music BPM
            speed: 1.8,                 // 1.8x faster rotation (matches modifiers.speed)
            axes: [0, 0.3, 0],          // Rotation rates [X, Y, Z] - 0.3 rad/sec base
            musicSync: true             // Sync rotation speed pulses to BPM
        },
        glow: {
            color: '#FFEB3B',           // Bright sunshine yellow
            intensity: 1.6,             // Strong cheerful glow
            pulse: {
                speed: 1.5,             // Excited pulsing (matches breathRate)
                range: [1.2, 1.8]       // Pulse between 120% and 180% intensity
            }
        },
        scale: {
            base: 1.0,
            breathe: {
                enabled: true,
                depth: 0.10,            // 10% size variation (matches breathDepth)
                rate: 1.5               // Excited breathing (matches breathRate)
            }
        }
    },

    // Soul/energy animation parameters (geometry-agnostic)
    // Used by: Crystal (inner core), Sun (plasma flow), Moon (subtle glow pulse)
    soulAnimation: {
        driftSpeed: 1.2,        // Energy movement speed - lively, bouncy
        shimmerSpeed: 1.5,      // Vertical pulse speed - excited pulsing
        turbulence: 0.3         // Chaos/randomness factor - playful variation
    }

    // Note: Black hole behavior auto-derives from modifiers (speed: 1.8, intensity: 1.1, smoothness: 1.0)
    // Results in: fast disk rotation, high turbulence, enhanced doppler effect, bright shadow glow
};
