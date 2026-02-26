/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Backflip Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Backflip gesture - backwards flip with dramatic arc
 * @author Emotive Engine Team
 * @module gestures/transforms/backflip
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *     ⭐ → ◑ → ○ → ◐ → ⭐
 *         Backwards flip rotation
 *
 * USED BY:
 * - Victory celebration
 * - Dramatic exits
 * - Showing off
 * - Surprise reactions
 */

export default {
    name: 'backflip',
    emoji: '⬆️',
    type: 'override',
    description: 'Backwards flip with dramatic arc trajectory',

    config: {
        duration: 900,
        musicalDuration: { musical: true, beats: 2 },
        rotations: 1,
        height: 0.35,
        strength: 1.0,
        particleMotion: {
            type: 'backflip',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.4,
        },
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const rotations = config.rotations || 1;
            const height = config.height || 0.35;

            // Backflip: rotate backward (top of head goes back first, away from camera)
            // This is POSITIVE X rotation in standard 3D (right-hand rule)
            // Use smooth cubic ease that guarantees exact completion
            const easeProgress =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Ensure we hit exactly 0 at start and exactly 2π at end
            const targetAngle = Math.PI * 2 * rotations; // Positive for backflip
            const flipAngle = easeProgress * targetAngle;

            // Higher arc for backflip - more dramatic
            const arcHeight = Math.sin(progress * Math.PI) * height * strength;

            // Slight backward movement during flip (away from camera = positive Z)
            const zOffset = Math.sin(progress * Math.PI) * 0.1 * strength;

            // Scale: crouch -> spring -> airborne -> land -> settle
            let scale = 1.0;
            if (progress < 0.1) {
                // Crouch before jump
                scale = 1.0 - (progress / 0.1) * 0.15;
            } else if (progress < 0.2) {
                // Spring up
                scale = 0.85 + ((progress - 0.1) / 0.1) * 0.25;
            } else if (progress > 0.9) {
                // Land compress then recover
                const landT = (progress - 0.9) / 0.1;
                scale = 1.1 - Math.sin(landT * Math.PI) * 0.15;
            } else {
                scale = 1.1;
            }
            // Force exact 1.0 at end
            if (progress >= 0.99) scale = 1.0;

            // Dramatic glow
            const glowIntensity = 1.0 + Math.sin(progress * Math.PI) * 0.5;
            const glowBoost = Math.sin(progress * Math.PI) * 0.4;

            return {
                position: [0, arcHeight, zOffset],
                rotation: [flipAngle, 0, 0],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
