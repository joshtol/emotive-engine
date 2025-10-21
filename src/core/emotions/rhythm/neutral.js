/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Neutral Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Neutral emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/neutral
 */

/**
 * Neutral emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission flows gently with ambient rhythm
        particleEmission: {
            syncMode: 'ambient',    // Subtle ambient sync
            burstSize: 2,           // Minimal bursts
            offBeatRate: 1.0,       // Consistent ambient flow
            ambientSync: true       // Gentle background pulse
        },

        // Breathing syncs to calm rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 4,      // Standard breathing (1 bar)
            intensity: 1.0          // Normal breath depth
        },

        // Glow pulses subtly
        glowSync: {
            intensityRange: [0.85, 0.95],
            syncTo: 'ambient',
            attack: 0.4,
            decay: 0.4
        },

        // Pattern-specific neutral expressions
        patternBehaviors: {
            'ambient': {
                // Atmospheric neutral
                particleEmission: {
                    syncMode: 'drift',
                    burstSize: 1
                }
            },
            'meditative': {
                // Meditation music
                particleEmission: {
                    syncMode: 'slow',
                    burstSize: 2
                },
                glowSync: { intensityRange: [0.8, 0.9] }
            }
        }
    }
};
