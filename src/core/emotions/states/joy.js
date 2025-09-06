/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Joy Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Joy emotional state - playful happiness
 * @author Emotive Engine Team
 * @module emotions/states/joy
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
        glowColor: '#FFD54F',       // Golden yellow - sunny happiness
        glowIntensity: 1.4,         // Brighter glow for more joy
        particleRate: 40,           // Frequent celebration particles
        minParticles: 0,            // Start from zero
        maxParticles: 40,           // Maximum joy expression
        particleBehavior: 'popcorn', // Spontaneous popping effect
        breathRate: 1.5,            // Excited breathing (20-30 bpm)
        breathDepth: 0.10,          // 10% size variation
        coreJitter: false,          // No jitter, just happiness
        particleColors: [
            { color: '#FFD54F', weight: 30 },  // 30% golden yellow
            { color: '#C4B888', weight: 20 },  // 20% desaturated
            { color: '#FFFF00', weight: 20 },  // 20% electric joy
            { color: '#FFE082', weight: 15 },  // 15% sun-kissed
            { color: '#B39C2F', weight: 15 }   // 15% deep gold
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.8,        // 80% faster animations
        amplitude: 1.9,    // 90% bigger movements
        intensity: 1.1,    // 10% more intense
        smoothness: 1.0,   // Normal smoothness
        regularity: 0.9,   // Slightly bouncy/irregular
        addBounce: true    // Extra springiness flag
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
        duration: 400,         // Quick transition to joy
        easing: 'easeOutBack', // Bouncy entrance
        priority: 5,           // Higher priority for positive emotions
        burstOnEntry: true     // Particle burst when becoming joyful
    },
    
    // Audio/sound associations
    audio: {
        ambientSound: 'cheerful_hum',    // Cheerful background
        transitionSound: 'pop',           // Pop sound on entry
        gestureSound: 'giggle'            // Giggle on gestures
    },
    
    // Particle spawn patterns
    particleSpawn: {
        pattern: 'fountain',     // Fountain-like spawn
        frequency: 'burst',      // Burst spawning
        burstOnEntry: true,      // Big burst on entry
        fadeOnExit: false,       // Particles pop away
        specialEffect: 'sparkle' // Sparkle effect
    },
    
    // Eye/core appearance
    coreAppearance: {
        pupilSize: 1.2,          // Slightly dilated (excited)
        irisPattern: 'radiant',   // Radiant iris pattern
        blinkRate: 'frequent',    // Happy blinking
        lookDirection: 'up',      // Looking up optimistically
        specialEffect: 'twinkle'  // Eye twinkle effect
    }
};