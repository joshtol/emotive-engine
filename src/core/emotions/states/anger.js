/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Anger Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Anger emotional state - intense rage
 * @author Emotive Engine Team
 * @module emotions/states/anger
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
        glowColor: '#FF5252',       // Primary rage color - crimson intensity
        glowIntensity: 1.4,         // Heightened aura strength
        particleRate: 15,           // Frequent particle generation for chaos
        minParticles: 3,            // Maintain constant agitation
        maxParticles: 8,            // Cap for performance while showing intensity
        particleBehavior: 'aggressive', // Erratic, forceful particle movement
        breathRate: 2.2,            // Rapid, agitated breathing rhythm
        breathDepth: 0.15,          // Deep, forceful breath cycles
        coreJitter: true,           // Visual tremor from internal rage
        particleColors: [
            { color: '#FF5252', weight: 30 },  // Primary bright rage tone
            { color: '#C47777', weight: 20 },  // Smoldering undertone
            { color: '#FF0000', weight: 20 },  // Pure intensity accent
            { color: '#FF7B7B', weight: 15 },  // Hot flash highlights
            { color: '#B73636', weight: 15 }   // Dark fury shadows
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
    
    // Audio/sound associations
    audio: {
        ambientSound: 'rumble',      // Low rumbling
        transitionSound: 'explosion', // Explosive sound
        gestureSound: 'growl'         // Growling sounds
    },
    
    // Particle spawn patterns
    particleSpawn: {
        pattern: 'explosive',    // Explosive spawn
        frequency: 'chaotic',    // Chaotic frequency
        burstOnEntry: true,      // Explosion on entry
        fadeOnExit: false,       // Particles dissipate violently
        specialEffect: 'flames'  // Flame-like effect
    },
    
    // Eye/core appearance
    coreAppearance: {
        pupilSize: 0.7,           // Constricted for focused intensity
        irisPattern: 'sharp',      // Angular, aggressive iris pattern
        blinkRate: 'rare',        // Unwavering, intense gaze
        lookDirection: 'forward',  // Direct, confrontational focus
        specialEffect: 'flames',   // Fire-like eye effects
        pulseRate: 'rapid'        // Quick, agitated pulsing
    },
    
    // Special anger properties
    special: {
        screenShake: true,         // Environmental disturbance effect
        particleTrails: 'fire',    // Incendiary particle trail style
        glowPulse: true,          // Rhythmic aura fluctuation
        temperatureEffect: 'hot'   // Warm spectrum color shifting
    }
};