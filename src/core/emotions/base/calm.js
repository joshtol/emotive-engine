/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Calm Emotion Base
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Calm emotional state - serene and peaceful (base configuration without rhythm)
 * @author Emotive Engine Team
 * @module emotions/base/calm
 * @complexity ⭐ Beginner-friendly
 * @audience Good example to learn emotion structure. Copy this to create new emotions.
 */

/**
 * Calm emotion configuration
 * A state of deep tranquility and inner peace
 */
export default {
    name: 'calm',
    emoji: '😌',
    description: 'Serene, peaceful state with gentle movements',

    // Visual properties
    visual: {
        glowColor: '#66D9CC',        // Bright mint/turquoise (more distinct from neutral blue)
        glowIntensity: 0.6,          // Softer glow than neutral
        particleRate: 25,            // Steady, peaceful emission like sadness
        minParticles: 8,             // Keep some particles always
        maxParticles: 25,            // Allow more particles like sadness
        particleBehavior: 'zen',     // Zen orbital behavior
        breathRate: 0.4,             // Much slower breathing than neutral (1.0)
        breathDepth: 0.12,           // Deeper breaths than neutral (0.08)
        coreJitter: false,           // Perfectly still core
        particleColors: [
            { color: '#66D9CC', weight: 35 },  // Bright turquoise
            { color: '#99E6D9', weight: 25 },  // Light mint
            { color: '#40BFB3', weight: 20 },  // Medium teal
            { color: '#B3F2E6', weight: 15 },  // Pale mint
            { color: '#339980', weight: 5 }    // Deep teal shadow
        ]
    },

    // Gesture modifiers
    modifiers: {
        speed: 0.5,         // Much slower than neutral (1.0)
        amplitude: 0.3,     // Significantly reduced motion range
        intensity: 0.4,     // Very gentle force level
        smoothness: 2.0,    // Much smoother than neutral
        regularity: 1.5,    // More consistent patterns
        addWeight: false,   // Light, floating feeling
        floatHeight: 0.2,   // Minimal floating height
        swayAmount: 0.15,   // Very minimal side-to-side sway
        duration: 1.5       // Extend gesture duration
    },

    // Typical gestures for this emotion
    typicalGestures: [
        'breathe',   // Deep, slow breathing
        'float',     // Gentle floating
        'drift',     // Slow drifting
        'idle'       // Peaceful idle state
    ],

    // Transition hints
    transitions: {
        duration: 800,           // Slower transition into calm
        easing: 'easeInOutSine', // Very smooth sine curve
        priority: 1              // Low-medium priority
    },

    // Movement patterns
    movement: {
        floatPattern: 'sine_slow',     // Slow sine wave floating
        floatPeriod: 6000,              // 6 second float cycle
        floatAmplitude: 8,              // 8 pixel vertical range
        swayPattern: 'gentle',          // Gentle side sway
        swayPeriod: 8000,               // 8 second sway cycle
        swayAmplitude: 5,               // 5 pixel horizontal range
        microMovements: false           // No jittery movements
    },

    /**
     * Get core rendering parameters
     * @param {Object} state - Current renderer state
     * @returns {Object} Core rendering configuration
     */
    getCoreParams(state) {
        const time = state.time || Date.now();
        const breathPhase = Math.sin(time * 0.0006) * 0.5 + 0.5; // Very slow breathing

        return {
            scaleX: 1.0 - (breathPhase * 0.02),  // Very subtle breathing scale
            scaleY: 1.0 - (breathPhase * 0.02),
            eyeOpenness: 0.85,                   // Relaxed eyes
            eyeExpression: 'serene',             // New serene expression
            pupilOffset: {
                x: Math.sin(time * 0.0003) * 2,  // Slow, minimal eye movement
                y: Math.cos(time * 0.0004) * 1
            },
            glowPulse: 0.95 + (breathPhase * 0.05)  // Very subtle glow pulse
        };
    },

    /**
     * Optional: Custom particle behavior for calm state
     * @param {Object} particle - Particle to update
     * @param {number} deltaTime - Time since last update
     */
    updateParticle(particle, deltaTime) {
        // Super slow drift
        particle.x += Math.sin(particle.life * 0.001) * 0.1;
        particle.y -= deltaTime * 0.02; // Very slow rise

        // Gentle fade based on life
        particle.opacity = Math.sin(particle.life * 0.002) * 0.3 + 0.2;

        // Slow size pulse
        particle.size = particle.baseSize * (1 + Math.sin(particle.life * 0.001) * 0.2);
    },

    /**
     * Optional: Custom core rendering
     * @param {CanvasRenderingContext2D} _ctx - Canvas context
     * @param {number} _x - Center X
     * @param {number} _y - Center Y
     * @param {number} _radius - Core radius
     * @returns {boolean} True if custom rendering was done
     */
    renderCore(_ctx, _x, _y, _radius) {
        // Return false to use default rendering with parameters
        return false;
    }
};
