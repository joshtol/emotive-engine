/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fear Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fear emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/fear
 */

/**
 * Fear emotion rhythm configuration
 */
export default {
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
