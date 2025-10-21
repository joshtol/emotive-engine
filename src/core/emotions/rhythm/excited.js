/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Excited Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Excited emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/excited
 */

/**
 * Excited emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 9,
            offBeatRate: 0.5,
            burstSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 2,
            intensity: 1.4
        },

        glowSync: {
            intensityRange: [1.3, 1.9],
            syncTo: 'beat',
            attack: 0.05,
            decay: 0.3
        },

        patternBehaviors: {
            'dubstep': {
                particleEmission: { burstSize: 15 }
            },
            'breakbeat': {
                particleEmission: { burstSize: 12 }
            }
        }
    }
};
