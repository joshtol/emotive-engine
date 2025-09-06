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
        glowColor: '#FF5252',       // Bright crimson - intense rage
        glowIntensity: 1.4,         // Intense glow
        particleRate: 15,           // Controlled chaos
        minParticles: 3,            // Always some anger
        maxParticles: 8,            // Limited for performance
        particleBehavior: 'aggressive', // Aggressive particle behavior
        breathRate: 2.2,            // Rapid breathing (30-40 bpm)
        breathDepth: 0.15,          // Heavy, forceful breathing
        coreJitter: true,           // Shake with anger
        particleColors: [
            { color: '#FF5252', weight: 30 },  // 30% bright red
            { color: '#C47777', weight: 20 },  // 20% smoldering
            { color: '#FF0000', weight: 20 },  // 20% pure rage
            { color: '#FF7B7B', weight: 15 },  // 15% hot flash
            { color: '#B73636', weight: 15 }   // 15% dark fury
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.5,        // 50% faster
        amplitude: 1.4,    // 40% bigger movements
        intensity: 1.3,    // 30% more intense
        smoothness: 0.3,   // 70% less smooth (sharp)
        regularity: 0.7,   // More erratic
        addShake: true     // Angry tremor
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
        duration: 300,          // Quick snap to anger
        easing: 'easeOutExpo',  // Explosive entrance
        priority: 8,            // High priority (danger)
        shakeOnEntry: true      // Screen shake on anger
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
        pupilSize: 0.7,           // Constricted (focused rage)
        irisPattern: 'sharp',      // Sharp, angular iris
        blinkRate: 'rare',        // Intense stare
        lookDirection: 'forward',  // Direct confrontation
        specialEffect: 'flames',   // Fire in eyes
        pulseRate: 'rapid'        // Rapid pulsing
    },
    
    // Special anger properties
    special: {
        screenShake: true,         // Shake the screen
        particleTrails: 'fire',    // Fire trails on particles
        glowPulse: true,          // Pulsing glow
        temperatureEffect: 'hot'   // Hot color temperature
    }
};