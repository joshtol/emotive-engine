/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Resting Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Resting emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/resting
 */

/**
 * Resting emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 1,
            offBeatRate: 1.0,
            restingSync: true,
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 12,
            intensity: 0.4,
        },

        glowSync: {
            intensityRange: [0.4, 0.6],
            syncTo: 'beat',
            attack: 0.8,
            decay: 0.8,
        },

        patternBehaviors: {
            ambient: {
                particleEmission: { burstSize: 1 },
            },
            lullaby: {
                particleEmission: { burstSize: 1 },
            },
        },
    },
};
