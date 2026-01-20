/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rock Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Rock gesture - gentle front-back rocking motion
 * @author Emotive Engine Team
 * @module gestures/transforms/rock
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     ⭐ → ⭐ → ⭐
 *    /     |     \
 *   Back  Mid  Forward
 *
 * USED BY:
 * - Soothing/calming
 * - Deep thinking
 * - Comfort/self-soothing
 * - Gentle motion
 */

export default {
    name: 'rock',
    emoji: '🪨',
    type: 'override',
    description: 'Gentle front-back rocking motion',

    config: {
        duration: 2000,
        musicalDuration: { musical: true, bars: 1 },
        rockAngle: 0.15,      // Rocking angle
        rockCycles: 2,        // Number of rock cycles
        smooth: true,         // Extra smooth motion
        strength: 1.0,
        particleMotion: {
            type: 'rock',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat'
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const rockAngle = config.rockAngle || 0.15;
            const rockCycles = config.rockCycles || 2;

            // Smooth sinusoidal rocking
            const phase = progress * rockCycles * Math.PI * 2;
            const rockValue = Math.sin(phase);

            // Forward-back tilt
            const rotX = rockValue * rockAngle * strength;

            // Slight forward-back position
            const zOffset = rockValue * 0.05 * strength;

            // Subtle vertical movement
            const yOffset = Math.abs(rockValue) * 0.02 * strength;

            // Consistent scale with tiny breathing
            const scale = 1.0 + Math.sin(phase * 0.5) * 0.02;

            // Calm, steady glow
            const glowIntensity = 1.0 + rockValue * 0.1;
            const glowBoost = 0;

            return {
                position: [0, yOffset, zOffset],
                rotation: [rotX, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
