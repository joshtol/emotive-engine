/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Teeter Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Teeter gesture - rock back and forth unstably
 * @author Emotive Engine Team
 * @module gestures/transforms/teeter
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *      ⭐    ⭐    ⭐
 *     /      |      \
 *    Unstable balance
 *
 * USED BY:
 * - Uncertainty/indecision
 * - Balance struggle
 * - Nervous energy
 * - About to fall
 */

export default {
    name: 'teeter',
    emoji: '⚖️',
    type: 'override',
    description: 'Rock back and forth unstably like losing balance',

    config: {
        duration: 1200,
        musicalDuration: { musical: true, beats: 3 },
        tiltAngle: 0.25, // Max tilt angle
        frequency: 3, // Rocks per gesture
        irregularity: 0.3, // How irregular the rocking is
        strength: 1.0,
        particleMotion: {
            type: 'teeter',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 3 },
        timingSync: 'onBeat',
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const tiltAngle = config.tiltAngle || 0.25;
            const frequency = config.frequency || 3;
            const irregularity = config.irregularity || 0.3;

            // Irregular rocking - combine multiple frequencies
            const rock1 = Math.sin(progress * frequency * Math.PI * 2);
            const rock2 = Math.sin(progress * (frequency + 1.7) * Math.PI * 2) * irregularity;
            const rock3 = Math.sin(progress * (frequency * 0.5) * Math.PI * 2) * irregularity * 0.5;

            const combinedRock = rock1 + rock2 + rock3;
            const normalizedRock = combinedRock / (1 + irregularity * 1.5);

            // Forward-back tilt
            const rotX = normalizedRock * tiltAngle * strength * 0.7;

            // Side-to-side tilt (slightly different phase)
            const rotZ =
                Math.sin(progress * frequency * Math.PI * 2 + 0.5) * tiltAngle * strength * 0.5;

            // Position wobble
            const xOffset = rotZ * 0.15;
            const zOffset = rotX * 0.1;

            // Arms out for balance (scale slightly)
            const scale = 1.0 + Math.abs(normalizedRock) * 0.05;

            // Worried glow
            const glowIntensity = 1.0 + Math.abs(normalizedRock) * 0.2;
            const glowBoost = 0;

            return {
                position: [xOffset, 0, zOffset],
                rotation: [rotX, 0, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
