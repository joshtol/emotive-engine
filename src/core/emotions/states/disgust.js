/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Disgust Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'disgust',
    emoji: '🤢',
    description: 'Revulsion with repelling particles',
    
    // Visual properties
    visual: {
        glowColor: '#9ACD32',       // Sickly yellow-green (YellowGreen)
        glowIntensity: 1.0,         // Stronger, toxic glow
        particleRate: 15,           // More particles for nauseating effect
        minParticles: 5,            // Maintain visible repulsion
        maxParticles: 12,           // Controlled rejection display
        particleBehavior: 'repelling', // Particles flee from center
        breathRate: 0.7,            // Slow, queasy breathing
        breathDepth: 0.04,          // Shallow, uncomfortable breaths
        coreJitter: false,          // Stable but uneasy core
        particleColors: [
            { color: '#9ACD32', weight: 25 },  // Yellow-green toxic
            { color: '#ADFF2F', weight: 20 },  // Bright acid green
            { color: '#7FFF00', weight: 15 },  // Chartreuse nausea
            { color: '#BDB76B', weight: 15 },  // Dark khaki sick
            { color: '#6B8E23', weight: 10 },  // Olive drab decay
            { color: '#CCFF00', weight: 8 },   // Fluorescent bile
            { color: '#556B2F', weight: 7 }    // Dark olive shadow
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 0.9,        // Slightly slowed movements
        amplitude: 0.7,    // Restricted, withdrawn motion
        intensity: 0.9,    // Controlled repulsion force
        smoothness: 0.8,   // Mostly smooth with discomfort
        regularity: 1.0,   // Consistent rejection pattern
        addRecoil: true    // Recoiling motion effect
    },
    
    // Typical gestures for disgust
    typicalGestures: ['contract', 'shake', 'recoil', 'wobble'],
    
    // Transition configuration
    transitions: {
        duration: 600,       // Moderate transition speed
        easing: 'easeIn',   // Gradual onset of revulsion
        priority: 4         // Mid-level priority state
    },

    // Rhythm configuration - disgust recoils with repulsive rhythm
    rhythm: {
        enabled: true,

        // Particle emission repels on beat
        particleEmission: {
            syncMode: 'repel',      // Repulsion on beat
            burstSize: 4,           // Moderate repelling bursts
            offBeatRate: 0.7,       // Steady disgust between beats
            repelSync: true         // Particles pushed away
        },

        // Breathing syncs to queasy, uncomfortable rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 6,      // Slow, queasy breathing
            intensity: 0.4          // Shallow, uncomfortable breaths
        },

        // Glow pulses with sickly rhythm
        glowSync: {
            intensityRange: [0.8, 1.2],
            syncTo: 'beat',
            attack: 0.3,            // Gradual sickly pulse
            decay: 0.5
        },

        // Pattern-specific disgust expressions
        patternBehaviors: {
            'toxic': {
                // Chemical/toxic vibes
                particleEmission: {
                    syncMode: 'pulse',
                    burstSize: 5
                },
                glowSync: { intensityRange: [0.9, 1.4] }
            },
            'visceral': {
                // Physical revulsion
                particleEmission: {
                    syncMode: 'wave',
                    burstSize: 6
                }
            },
            'decay': {
                // Rotting, decomposing
                particleEmission: {
                    syncMode: 'slow',
                    burstSize: 3
                },
                glowSync: { intensityRange: [0.6, 1.0] }
            }
        }
    }
};