/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Bow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bow gesture - graceful forward bow
 * @author Emotive Engine Team
 * @module gestures/transforms/bow
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐         Standing
 *        ↓
 *       ⭐          Bowing forward
 *      /
 *
 * USED BY:
 * - Gratitude/thanks
 * - Respect/greeting
 * - Performance ending
 * - Apology
 */

export default {
    name: 'bow',
    emoji: '🙇',
    type: 'override',
    description: 'Graceful forward bow of respect',

    config: {
        duration: 1200,
        musicalDuration: { musical: true, beats: 3 },
        depth: 0.4, // How deep to bow (rotation amount)
        holdTime: 0.4, // How long to hold the bow
        graceful: true, // Smooth, elegant motion
        strength: 1.0,
        particleMotion: {
            type: 'bow',
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
            const depth = config.depth || 0.4;
            const holdTime = config.holdTime || 0.4;

            // Bow envelope: graceful down, hold, graceful up
            let bowAmount;
            const downPhase = (1 - holdTime) * 0.4;
            const upStart = 1 - (1 - holdTime) * 0.6;

            if (progress < downPhase) {
                // Bowing down
                bowAmount = progress / downPhase;
                bowAmount = Math.sin((bowAmount * Math.PI) / 2); // Smooth ease
            } else if (progress < upStart) {
                // Holding bow
                bowAmount = 1.0;
            } else {
                // Rising up
                bowAmount = 1 - (progress - upStart) / (1 - upStart);
                bowAmount = Math.sin((bowAmount * Math.PI) / 2);
            }

            // Forward tilt (bow rotation) - positive X tilts top toward camera
            // For a bow, we tilt forward (top goes toward camera/viewer)
            const tiltX = bowAmount * depth * Math.PI * strength;

            // Lower position as we bow
            const yOffset = -bowAmount * 0.1 * strength;

            // Slight forward movement (toward camera = negative Z in camera space)
            const zOffset = -bowAmount * 0.05 * strength;

            // Soft, respectful glow
            const glowIntensity = 1.0 - bowAmount * 0.2;
            const glowBoost = 0;

            // Use camera-relative transforms for tidal lock
            // This ensures the bow always faces the camera regardless of orbit angle
            return {
                cameraRelativePosition: [0, yOffset, zOffset],
                cameraRelativeRotation: [tiltX, 0, 0],
                scale: 1.0,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
