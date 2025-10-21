/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Love Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Love emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/love
 */

/**
 * Love emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 6,
            offBeatRate: 0.7,
            orbitingSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 6,
            intensity: 1.0
        },

        glowSync: {
            intensityRange: [1.0, 1.4],
            syncTo: 'beat',
            attack: 0.1,
            decay: 0.6
        },

        patternBehaviors: {
            'waltz': {
                particleEmission: { burstSize: 8 }
            },
            'swing': {
                particleEmission: { burstSize: 7 }
            }
        }
    }
};
