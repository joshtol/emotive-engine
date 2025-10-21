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
        glowIntensity: 1.6,         // Stronger cheerful glow
        particleRate: 40,           // Abundant celebration particles
        minParticles: 0,            // Can start from stillness
        maxParticles: 40,           // Maximum joyful expression
        particleBehavior: 'popcorn', // Spontaneous popping effect
        breathRate: 1.5,            // Excited, happy breathing
        breathDepth: 0.10,          // Moderate breath variation
        coreJitter: false,          // Stable, confident happiness
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
    }
};
