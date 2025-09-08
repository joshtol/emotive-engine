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
        glowColor: '#FFD54F',       // Golden yellow happiness
        glowIntensity: 1.4,         // Bright, cheerful glow
        particleRate: 40,           // Abundant celebration particles
        minParticles: 0,            // Can start from stillness
        maxParticles: 40,           // Maximum joyful expression
        particleBehavior: 'popcorn', // Spontaneous popping effect
        breathRate: 1.5,            // Excited, happy breathing
        breathDepth: 0.10,          // Moderate breath variation
        coreJitter: false,          // Stable, confident happiness
        particleColors: [
            { color: '#FFD54F', weight: 30 },  // Primary golden joy
            { color: '#C4B888', weight: 20 },  // Muted warm tone
            { color: '#FFFF00', weight: 20 },  // Electric happiness burst
            { color: '#FFE082', weight: 15 },  // Soft sunny highlights
            { color: '#B39C2F', weight: 15 }   // Deep golden warmth
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
        pupilSize: 1.2,          // Dilated with excitement
        irisPattern: 'radiant',   // Radiant, sparkling iris
        blinkRate: 'frequent',    // Happy, frequent blinking
        lookDirection: 'up',      // Optimistic upward gaze
        specialEffect: 'twinkle'  // Sparkling eye effect
    },
    
    // Rhythm configuration - joy bounces to the beat
    rhythm: {
        enabled: true,
        
        // Particle emission celebrates on beat
        particleEmission: {
            syncMode: 'beat',
            burstSize: 8,           // Big celebration bursts
            offBeatRate: 0.6,       // Still happy between beats
            popcornSync: true       // Popcorn pops on beat
        },
        
        // Breathing syncs to happy tempo
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 4,     // One breath per bar
            intensity: 1.2          // Deeper happy breaths
        },
        
        // Glow pulses with joy
        glowSync: {
            intensityRange: [1.2, 1.8],
            syncTo: 'beat',
            attack: 0.05,           // Quick brightening
            decay: 0.4              // Bouncy fade
        },
        
        // Pattern-specific joy expressions
        patternBehaviors: {
            'waltz': {
                // Elegant happy waltz
                particleEmission: { burstSize: 5 },
                breathSync: { beatsPerBreath: 3 }
            },
            'swing': {
                // Jazzy playful joy
                particleEmission: { 
                    syncMode: 'swing',
                    burstSize: 6
                },
                glowSync: { curve: 'bounce' }
            },
            'dubstep': {
                // Explosive joy on drops
                particleEmission: {
                    burstSize: 15,
                    dropMultiplier: 3.0
                }
            },
            'breakbeat': {
                // Chaotic happy energy
                particleEmission: {
                    syncMode: 'random',
                    burstRange: [3, 12]
                }
            }
        }
    },
    
    /**
     * Get core rendering parameters for joy
     */
    getCoreParams: function(state) {
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