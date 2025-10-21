/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Euphoria Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Euphoria emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/euphoria
 */

/**
 * Euphoria emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 12,
            offBeatRate: 0.4,
            radiantSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 2,
            intensity: 1.6
        },

        glowSync: {
            intensityRange: [1.6, 2.2],
            syncTo: 'beat',
            attack: 0.01,
            decay: 0.5
        },

        patternBehaviors: {
            'dubstep': {
                particleEmission: { burstSize: 18 }
            },
            'trance': {
                particleEmission: { burstSize: 15 }
            }
        }
    }
};
