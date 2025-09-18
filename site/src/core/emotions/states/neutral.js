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
    
    // Visual properties
    visual: {
        glowColor: '#00BCD4',        // Cyan baseline (more modern)
        glowIntensity: 0.9,          // Slightly softer glow
        particleRate: 2,              // Minimal particle generation
        minParticles: 8,             // Baseline particle presence
        maxParticles: 10,            // Limited particle count
        particleBehavior: 'ambient', // Gentle floating behavior
        breathRate: 1.0,             // Normal, relaxed breathing
        breathDepth: 0.08,           // Subtle breath variation
        coreJitter: false,           // Stable, still core
        particleColors: [
            { color: '#00BCD4', weight: 25 },  // Primary cyan
            { color: '#00ACC1', weight: 20 },  // Darker cyan
            { color: '#26C6DA', weight: 15 },  // Light cyan
            { color: '#B2EBF2', weight: 15 },  // Pale cyan highlight
            { color: '#0097A7', weight: 10 },  // Deep cyan shadow
            { color: '#80DEEA', weight: 10 },  // Cyan light
            { color: '#E0F7FA', weight: 5 }    // Very pale cyan
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.0,        // Baseline movement speed
        amplitude: 1.0,    // Standard motion range
        intensity: 1.0,    // Default force level
        smoothness: 1.0,   // Natural motion flow
        regularity: 1.0    // Consistent patterns
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
        duration: 500,      // Standard transition duration
        easing: 'easeInOut', // Balanced transition curve
        priority: 0         // Baseline priority level
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
        pupilSize: 1.0,        // Standard pupil dilation
        irisPattern: 'default', // Basic iris pattern
        blinkRate: 'normal',    // Regular blink frequency
        lookDirection: 'center' // Centered, neutral gaze
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