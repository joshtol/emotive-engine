/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Neutral Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Neutral emotional state - calm baseline
 * @author Emotive Engine Team
 * @module emotions/states/neutral
 */

/**
 * Neutral emotion configuration
 * The default calm state, baseline for all other emotions
 */
export default {
    name: 'neutral',
    emoji: '😐',
    description: 'Calm, balanced emotional state',
    
    // Visual properties (from emotionMap.js)
    visual: {
        glowColor: '#32ACE2',        // Supple blue - otherworldly depth
        glowIntensity: 1.0,          // Standard glow brightness
        particleRate: 2,              // Particles per second
        minParticles: 8,             // Minimum particles always present
        maxParticles: 10,            // Maximum particle cap
        particleBehavior: 'ambient', // Particle behavior type
        breathRate: 1.0,             // Normal: 12-20 breaths/min
        breathDepth: 0.08,           // 8% size variation during breathing
        coreJitter: false,           // No shaking/vibrating
        particleColors: [
            { color: '#32ACE2', weight: 30 },  // 30% supple blue midtone
            { color: '#5A92A8', weight: 20 },  // 20% desaturated (background)
            { color: '#00B4FF', weight: 20 },  // 20% oversaturated (foreground)
            { color: '#7CC8F2', weight: 15 },  // 15% highlight
            { color: '#1A5A74', weight: 15 }   // 15% shadow
        ]
    },
    
    // Gesture modifiers (from emotionModifiers.js)
    modifiers: {
        speed: 1.0,        // Normal speed
        amplitude: 1.0,    // Normal amplitude
        intensity: 1.0,    // Normal intensity
        smoothness: 1.0,   // Normal smoothness
        regularity: 1.0    // Normal regularity
    },
    
    // Typical gestures for this emotion
    typicalGestures: [
        'breathe',   // Calm breathing
        'float',     // Gentle floating
        'idle',      // Idle animation
        'blink'      // Occasional blinks
    ],
    
    // Transition hints
    transitions: {
        duration: 500,      // Default transition time to this state
        easing: 'easeInOut', // Smooth transition
        priority: 0         // Base priority
    },
    
    // Audio/sound associations (optional)
    audio: {
        ambientSound: null,     // No specific ambient sound
        transitionSound: null,  // No transition sound
        gestureSound: null      // No gesture sound
    },
    
    // Particle spawn patterns
    particleSpawn: {
        pattern: 'random',      // Random spawn positions
        frequency: 'steady',    // Steady spawn rate
        burstOnEntry: false,    // No burst when entering state
        fadeOnExit: true        // Fade particles when leaving
    },
    
    // Eye/core appearance
    coreAppearance: {
        pupilSize: 1.0,        // Normal pupil size
        irisPattern: 'default', // Default iris pattern
        blinkRate: 'normal',    // Normal blink rate
        lookDirection: 'center' // Looking straight ahead
    },
    
    /**
     * Get core rendering parameters
     * @param {Object} state - Current renderer state
     * @returns {Object} Core rendering configuration
     */
    getCoreParams: function(state) {
        return {
            scaleX: 1.0,
            scaleY: 1.0,
            eyeOpenness: 1.0,
            eyeExpression: 'neutral', // neutral, happy, sad, focused
            pupilOffset: { x: 0, y: 0 }
        };
    },
    
    /**
     * Optional: Custom core rendering
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Core radius
     * @returns {boolean} True if custom rendering was done
     */
    renderCore: function(ctx, x, y, radius) {
        // Return false to use default rendering
        return false;
    }
};