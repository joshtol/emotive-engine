/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Disgust Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Disgust emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/disgust
 */

/**
 * Disgust emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission repels on beat
        particleEmission: {
            syncMode: 'repel', // Repulsion on beat
            burstSize: 4, // Moderate repelling bursts
            offBeatRate: 0.7, // Steady disgust between beats
            repelSync: true, // Particles pushed away
        },

        // Breathing syncs to queasy, uncomfortable rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 6, // Slow, queasy breathing
            intensity: 0.4, // Shallow, uncomfortable breaths
        },

        // Glow pulses with sickly rhythm
        glowSync: {
            intensityRange: [0.8, 1.2],
            syncTo: 'beat',
            attack: 0.3, // Gradual sickly pulse
            decay: 0.5,
        },

        // Pattern-specific disgust expressions
        patternBehaviors: {
            toxic: {
                // Chemical/toxic vibes
                particleEmission: {
                    syncMode: 'pulse',
                    burstSize: 5,
                },
                glowSync: { intensityRange: [0.9, 1.4] },
            },
            visceral: {
                // Physical revulsion
                particleEmission: {
                    syncMode: 'wave',
                    burstSize: 6,
                },
            },
            decay: {
                // Rotting, decomposing
                particleEmission: {
                    syncMode: 'slow',
                    burstSize: 3,
                },
                glowSync: { intensityRange: [0.6, 1.0] },
            },
        },
    },
};
