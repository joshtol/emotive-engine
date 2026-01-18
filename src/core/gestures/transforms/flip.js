/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flip Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flip gesture - front flip rotation
 * @author Emotive Engine Team
 * @module gestures/transforms/flip
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *     ⭐ → ◐ → ○ → ◑ → ⭐
 *         Front flip rotation
 *
 * USED BY:
 * - Excitement/celebration
 * - Showing off
 * - Acrobatic movements
 * - Victory moments
 */

export default {
    name: 'flip',
    emoji: '🤸',
    type: 'override',
    description: 'Front flip rotation with arc trajectory',

    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 },
        rotations: 1,         // Number of flips
        height: 0.3,          // Arc height during flip
        direction: 'forward', // 'forward' or 'backward'
        strength: 1.0,
        particleMotion: {
            type: 'flip',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.3
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const rotations = config.rotations || 1;
            const height = config.height || 0.3;

            // Front flip: rotate forward (top of head goes down first toward camera)
            // This is NEGATIVE X rotation in standard 3D (right-hand rule)
            // Use smooth cubic ease that guarantees exact completion
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Ensure we hit exactly 0 at start and exactly 2π at end
            const targetAngle = -Math.PI * 2 * rotations; // Negative for forward flip
            const flipAngle = easeProgress * targetAngle;

            // Arc trajectory - up then down
            const arcHeight = Math.sin(progress * Math.PI) * height * strength;

            // Scale: crouch -> spring -> airborne -> land -> settle
            let scale = 1.0;
            if (progress < 0.1) {
                // Crouch before jump
                scale = 1.0 - (progress / 0.1) * 0.15;
            } else if (progress < 0.2) {
                // Spring up
                scale = 0.85 + ((progress - 0.1) / 0.1) * 0.2;
            } else if (progress > 0.9) {
                // Land compress then recover
                const landT = (progress - 0.9) / 0.1;
                scale = 1.05 - Math.sin(landT * Math.PI) * 0.1;
            } else {
                scale = 1.05;
            }
            // Force exact 1.0 at end
            if (progress >= 0.99) scale = 1.0;

            // Glow during flip
            const glowIntensity = 1.0 + Math.sin(progress * Math.PI) * 0.4;
            const glowBoost = progress > 0.2 && progress < 0.8 ? 0.3 : 0;

            return {
                position: [0, arcHeight, 0],
                rotation: [flipAngle, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
