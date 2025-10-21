/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Joy Emotion Rhythm
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Joy emotional state - rhythm configuration
 * @author Emotive Engine Team
 * @module emotions/rhythm/joy
 */

/**
 * Joy emotion rhythm configuration
 */
export default {
    rhythm: {
        enabled: true,

        // Particle emission celebrates on beat
        particleEmission: {
            syncMode: 'beat',
            burstSize: 8,           // Big celebration bursts
            offBeatRate: 0.6,       // Still happy between beats
            popcornSync: true       // Popcorn pops on beat
        },

        // Breathing syncs to happy tempo
        breathSync: {
            mode: 'beats',
            beatsPerBreath: 4,     // One breath per bar
            intensity: 1.2          // Deeper happy breaths
        },

        // Glow pulses with joy
        glowSync: {
            intensityRange: [1.2, 1.8],
            syncTo: 'beat',
            attack: 0.05,           // Quick brightening
            decay: 0.4              // Bouncy fade
        },

        // Pattern-specific joy expressions
        patternBehaviors: {
            'waltz': {
                // Elegant happy waltz
                particleEmission: { burstSize: 5 },
                breathSync: { beatsPerBreath: 3 }
            },
            'swing': {
                // Jazzy playful joy
                particleEmission: {
                    syncMode: 'swing',
                    burstSize: 6
                },
                glowSync: { curve: 'bounce' }
            },
            'dubstep': {
                // Explosive joy on drops
                particleEmission: {
                    burstSize: 15,
                    dropMultiplier: 3.0
                }
            },
            'breakbeat': {
                // Chaotic happy energy
                particleEmission: {
                    syncMode: 'random',
                    burstRange: [3, 12]
                }
            }
        }
    }
};
