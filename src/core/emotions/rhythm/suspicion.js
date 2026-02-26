/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Suspicion Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Suspicion emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/suspicion
 */

/**
 * Suspicion emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 3,
            offBeatRate: 0.6,
            surveillanceSync: true,
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 5,
            intensity: 0.7,
        },

        glowSync: {
            intensityRange: [0.7, 1.1],
            syncTo: 'beat',
            attack: 0.3,
            decay: 0.6,
        },

        patternBehaviors: {
            stealth: {
                particleEmission: { burstSize: 2 },
            },
            thriller: {
                particleEmission: { burstSize: 4 },
            },
        },
    },
};
