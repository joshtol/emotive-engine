/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sadness Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sadness emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/sadness
 */

/**
 * Sadness emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission syncs to slow, melancholic beats
        particleEmission: {
            syncMode: 'beat',
            burstSize: 3, // Small, subdued bursts
            offBeatRate: 0.8, // Steady tears between beats
            fallingSync: true, // Tears fall on beat
        },

        // Breathing syncs to slow, heavy rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 8, // Very slow breathing (2 bars)
            intensity: 0.7, // Shallow, weary breaths
        },

        // Glow pulses weakly with sadness
        glowSync: {
            intensityRange: [0.5, 0.8],
            syncTo: 'beat',
            attack: 0.2, // Slow fade in
            decay: 0.8, // Long, lingering fade
        },

        // Pattern-specific sadness expressions
        patternBehaviors: {
            waltz: {
                // Melancholic waltz
                particleEmission: { burstSize: 2 },
                breathSync: { beatsPerBreath: 6 },
            },
            ballad: {
                // Deep emotional ballad
                particleEmission: {
                    syncMode: 'slow',
                    burstSize: 4,
                },
                glowSync: { intensityRange: [0.4, 0.7] },
            },
            ambient: {
                // Atmospheric sadness
                particleEmission: {
                    syncMode: 'drift',
                    burstSize: 2,
                },
            },
        },
    },
};
