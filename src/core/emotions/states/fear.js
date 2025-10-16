/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fear Emotion
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'fear',
    emoji: '😨',
    description: 'Anxious state with fleeing particles',
    
    // Visual properties
    visual: {
        glowColor: '#8A2BE2',       // Dark violet (BlueViolet) - more ominous
        glowIntensity: 0.9,         // Slightly stronger, pulsing glow
        particleRate: 18,           // More rapid nervous emission
        minParticles: 4,            // Constant anxious presence
        maxParticles: 16,           // Scattered fearful display
        particleBehavior: 'scattering', // Particles flee outward
        breathRate: 2.5,            // Rapid, shallow breathing
        breathDepth: 0.06,          // Short, panicked breaths
        coreJitter: true,           // Trembling with anxiety
        particleColors: [
            { color: '#8A2BE2', weight: 25 },  // Dark violet base
            { color: '#4B0082', weight: 20 },  // Indigo dread
            { color: '#9400D3', weight: 15 },  // Dark violet panic
            { color: '#6B46C1', weight: 15 },  // Deep purple anxiety
            { color: '#9932CC', weight: 10 },  // Dark orchid fear
            { color: '#E6E6FA', weight: 8 },   // Pale lavender flash
            { color: '#301934', weight: 7 }    // Almost black shadow
        ]
    },
    
    // Gesture modifiers
    modifiers: {
        speed: 1.4,        // Quick, reactive movements
        amplitude: 0.8,    // Restricted, defensive range
        intensity: 1.2,    // Heightened fight-or-flight response
        smoothness: 0.5,   // Jerky, startled transitions
        regularity: 0.5,   // Unpredictable panic patterns
        addJitter: true    // Nervous trembling overlay
    },
    
    // Typical gestures for fear
    typicalGestures: ['shake', 'vibrate', 'contract', 'flicker', 'retreat'],
    
    // Transition configuration
    transitions: {
        duration: 400,       // Quick fear response
        easing: 'easeOut',  // Sudden onset
        priority: 7         // High alert priority
    },

    // Rhythm configuration - fear trembles with anxious rhythm
    rhythm: {
        enabled: true,

        // Particle emission scatters nervously on beat
        particleEmission: {
            syncMode: 'offbeat',   // Anxious, off-kilter timing
            burstSize: 5,           // Panicked bursts
            offBeatRate: 0.9,       // High baseline anxiety
            scatterSync: true       // Particles flee on beat
        },

        // Breathing syncs to rapid, panicked rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 1,      // Hyperventilating (every beat)
            intensity: 0.5          // Shallow, rapid breaths
        },

        // Glow flickers nervously
        glowSync: {
            intensityRange: [0.7, 1.1],
            syncTo: 'jitter',       // Trembling, unstable
            attack: 0.1,
            decay: 0.2
        },

        // Pattern-specific fear expressions
        patternBehaviors: {
            'suspense': {
                // Building tension
                particleEmission: {
                    syncMode: 'buildup',
                    burstSize: 3
                },
                glowSync: { intensityRange: [0.6, 1.3] }
            },
            'horror': {
                // Sudden shocks
                particleEmission: {
                    syncMode: 'shock',
                    burstRange: [2, 8]
                }
            },
            'chase': {
                // Frantic escape rhythm
                particleEmission: {
                    syncMode: 'rapid',
                    burstSize: 6
                },
                breathSync: { beatsPerBreath: 0.5 }
            }
        }
    }
};