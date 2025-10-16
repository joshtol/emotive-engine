/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Resting Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'resting',
    emoji: '😴',
    description: 'Deep relaxation with slow drift',
    
    // Visual properties
    visual: {
        glowColor: '#9370DB',       // Sleepy purple twilight
        glowIntensity: 0.8,         // Dimmed, drowsy glow
        particleRate: 10,           // Lazy particle generation
        minParticles: 3,            // Minimal sleepy presence
        maxParticles: 5,            // Few drifting particles
        particleBehavior: 'resting', // Slow, floating behavior
        breathRate: 0.8,            // Deep, slow breathing
        breathDepth: 0.12,          // Pronounced rest breaths
        coreJitter: false,          // Perfectly still core
        particleColors: [
            { color: '#9370DB', weight: 30 },  // Primary sleepy purple
            { color: '#A591C4', weight: 20 },  // Soft lavender drift
            { color: '#B366FF', weight: 20 },  // Dreamy violet accent
            { color: '#B8A1E6', weight: 15 },  // Light drowsy highlights
            { color: '#674D9B', weight: 15 }   // Deep sleep shadows
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.5,         // Slowed, drowsy pace
        amplitude: 0.4,     // Minimal movement range
        intensity: 0.5,     // Reduced energy level
        smoothness: 1.4,    // Extra smooth drifting
        regularity: 0.9,    // Slightly irregular, natural rest
        addWeight: true     // Heavy, weighted feeling
    },
    
    // Typical gestures for resting
    typicalGestures: ['breathe', 'drift', 'sway', 'float'],
    
    // Transition configuration
    transitions: {
        duration: 1000,         // Slow fade to rest
        easing: 'easeInOut',   // Gentle transition
        priority: 2            // Low priority state
    },

    // Rhythm configuration - resting drifts with minimal sleepy rhythm
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 1,
            offBeatRate: 1.0,
            restingSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 12,
            intensity: 0.4
        },

        glowSync: {
            intensityRange: [0.4, 0.6],
            syncTo: 'beat',
            attack: 0.8,
            decay: 0.8
        },

        patternBehaviors: {
            'ambient': {
                particleEmission: { burstSize: 1 }
            },
            'lullaby': {
                particleEmission: { burstSize: 1 }
            }
        }
    }
};