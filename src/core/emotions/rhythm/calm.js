/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Calm Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Calm emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/calm
 */

/**
 * Calm emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission drifts peacefully with rhythm
        particleEmission: {
            syncMode: 'zen',        // Zen peaceful sync
            burstSize: 3,           // Small peaceful bursts
            offBeatRate: 0.9,       // Steady peaceful flow
            zenSync: true           // Mindful zen rhythm
        },

        // Breathing syncs to very slow, deep rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 8,      // Very slow breathing (2 bars)
            intensity: 1.2          // Deep, relaxing breaths
        },

        // Glow pulses gently
        glowSync: {
            intensityRange: [0.55, 0.65],
            syncTo: 'zen',
            attack: 0.6,            // Very gradual rise
            decay: 0.8              // Long gentle fade
        },

        // Pattern-specific calm expressions
        patternBehaviors: {
            'meditation': {
                // Meditation/spa music
                particleEmission: {
                    syncMode: 'drift',
                    burstSize: 2
                },
                glowSync: { intensityRange: [0.5, 0.6] }
            },
            'ambient': {
                // Atmospheric calm
                particleEmission: {
                    syncMode: 'flow',
                    burstSize: 3
                }
            },
            'nature': {
                // Natural sounds (rain, ocean)
                particleEmission: {
                    syncMode: 'organic',
                    burstSize: 4
                }
            }
        }
    }
};
