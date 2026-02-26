/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Anger Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Anger emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/anger
 */

/**
 * Anger emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission bursts aggressively on beat
        particleEmission: {
            syncMode: 'beat',
            burstSize: 6, // Violent explosive bursts
            offBeatRate: 0.5, // Reduced particles between beats
            aggressiveSync: true, // Chaotic, forceful emission
        },

        // Breathing syncs to rapid, agitated rhythm
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 2, // Very fast, angry breathing
            intensity: 1.5, // Deep, forceful breaths
        },

        // Glow pulses intensely with rage
        glowSync: {
            intensityRange: [1.4, 2.2],
            syncTo: 'beat',
            attack: 0.02, // Instant flare
            decay: 0.3, // Sharp drop-off
        },

        // Pattern-specific anger expressions
        patternBehaviors: {
            metal: {
                // Heavy metal rage
                particleEmission: {
                    burstSize: 10,
                    dropMultiplier: 2.5,
                },
                glowSync: { intensityRange: [1.6, 2.4] },
            },
            dubstep: {
                // Explosive drops
                particleEmission: {
                    burstSize: 12,
                    dropMultiplier: 3.0,
                },
            },
            drum_and_bass: {
                // Rapid, chaotic energy
                particleEmission: {
                    syncMode: 'rapid',
                    burstRange: [4, 10],
                },
            },
            industrial: {
                // Machine-like aggression
                particleEmission: {
                    syncMode: 'mechanical',
                    burstSize: 8,
                },
            },
        },
    },
};
