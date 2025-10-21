/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Focused Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Focused emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/focused
 */

/**
 * Focused emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        particleEmission: {
            syncMode: 'beat',
            burstSize: 4,
            offBeatRate: 0.8,
            directedSync: true
        },

        breathSync: {
            mode: 'beats',
            beatsPerBreath: 4,
            intensity: 0.8
        },

        glowSync: {
            intensityRange: [1.0, 1.3],
            syncTo: 'beat',
            attack: 0.2,
            decay: 0.5
        },

        patternBehaviors: {
            'ambient': {
                particleEmission: { burstSize: 3 }
            },
            'minimal': {
                particleEmission: { burstSize: 2 }
            }
        }
    }
};
