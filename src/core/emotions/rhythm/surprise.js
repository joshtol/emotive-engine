/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Surprise Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Surprise emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/surprise
 */

/**
 * Surprise emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission explodes on beat
        particleEmission: {
            syncMode: 'impact',     // Sudden impact on beat
            burstSize: 10,          // Large explosive burst
            offBeatRate: 0.3,       // Very few particles between
            burstSync: true         // Synchronized explosion
        },

        // Breathing stops/gasps on beat
        breathSync: {
            mode: 'gasp',           // Sudden intake
            beatsPerBreath: 8,      // Hold breath after gasp
            intensity: 2.0          // Deep shocked inhale
        },

        // Glow flashes brightly
        glowSync: {
            intensityRange: [1.0, 2.4],
            syncTo: 'impact',       // Flash on impact
            attack: 0.01,           // Instant flash
            decay: 0.6              // Quick fade
        },

        // Pattern-specific surprise expressions
        patternBehaviors: {
            'reveal': {
                // Dramatic reveals
                particleEmission: {
                    syncMode: 'buildup',
                    burstSize: 15
                },
                glowSync: { intensityRange: [1.2, 2.6] }
            },
            'jump_scare': {
                // Horror game jump scares
                particleEmission: {
                    syncMode: 'shock',
                    burstSize: 20
                }
            },
            'plot_twist': {
                // Narrative surprises
                particleEmission: {
                    syncMode: 'delayed',
                    burstSize: 12
                }
            }
        }
    }
};
