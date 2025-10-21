/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glitch Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Glitch emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/glitch
 */

/**
 * Glitch emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'random',
            burstSize: 8,
            burstRange: [1, 15],
            offBeatRate: 0.3,
            burstSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 7,
            intensity: 0.6
        },

        glowSync: {
            intensityRange: [0.3, 2.0],
            syncTo: 'random',
            attack: 0.01,
            decay: 0.8
        },

        patternBehaviors: {
            'breakbeat': {
                particleEmission: { burstSize: 12, burstRange: [2, 18] }
            },
            'glitch': {
                particleEmission: { burstSize: 15, burstRange: [1, 20] }
            }
        }
    }
};
