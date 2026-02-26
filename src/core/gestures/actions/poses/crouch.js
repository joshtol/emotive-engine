/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Crouch Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Crouch gesture - compress down low
 * @author Emotive Engine Team
 * @module gestures/transforms/crouch
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐        Standing
 *        ↓
 *       ═⭐═       Crouched (wider, lower)
 *
 * USED BY:
 * - Sneaking/hiding
 * - Preparing to jump
 * - Defensive posture
 * - Concentration
 */

export default {
    name: 'crouch',
    emoji: '🦎',
    type: 'override',
    description: 'Compress down into a low crouch position',

    config: {
        duration: 600,
        musicalDuration: { musical: true, beats: 1.5 },
        depth: 0.3, // How low to crouch
        widen: 0.2, // How much to widen
        holdTime: 0.5, // Portion of time to hold crouch (0-1)
        strength: 1.0,
        particleMotion: {
            type: 'crouch',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 1.5 },
        timingSync: 'onBeat',
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const depth = config.depth || 0.3;
            const widen = config.widen || 0.2;
            const holdTime = config.holdTime || 0.5;

            // Crouch envelope: down, hold, up
            let crouchAmount;
            const downPhase = (1 - holdTime) / 2;
            const upPhase = 1 - downPhase;

            if (progress < downPhase) {
                // Going down
                crouchAmount = progress / downPhase;
            } else if (progress < upPhase) {
                // Holding
                crouchAmount = 1.0;
            } else {
                // Coming up
                crouchAmount = 1 - (progress - upPhase) / downPhase;
            }

            // Ease the crouch
            crouchAmount = Math.sin((crouchAmount * Math.PI) / 2);

            // Position drops down
            const yOffset = -crouchAmount * depth * strength;

            // Scale: squash vertically, stretch horizontally
            const scaleY = 1 - crouchAmount * 0.25 * strength;
            const scaleX = 1 + crouchAmount * widen * strength;
            const scale = (scaleX + scaleY) / 2; // Approximate with uniform scale

            // Slight forward tilt
            const tiltX = crouchAmount * 0.15 * strength;

            // Dim glow when crouching (being stealthy)
            const glowIntensity = 1.0 - crouchAmount * 0.3;

            return {
                position: [0, yOffset, 0],
                rotation: [tiltX, 0, 0],
                scale,
                glowIntensity,
                glowBoost: 0,
            };
        },
    },
};
