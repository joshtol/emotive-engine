/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lunge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lunge gesture - forward thrust pose
 * @author Emotive Engine Team
 * @module gestures/transforms/lunge
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     ⭐  →  ⭐→→→
 *         Forward lunge thrust
 *
 * USED BY:
 * - Attack/emphasis
 * - Reaching forward
 * - Dramatic gestures
 * - Fencing pose
 */

export default {
    name: 'lunge',
    emoji: '🤺',
    type: 'override',
    description: 'Forward thrust lunge with emphasis',

    config: {
        duration: 500,
        musicalDuration: { musical: true, beats: 1 },
        distance: 0.25,       // Lunge distance
        direction: 'forward', // 'forward', 'left', 'right'
        recover: true,        // Return to start position
        strength: 1.0,
        particleMotion: {
            type: 'lunge',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 1 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.5
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const distance = config.distance || 0.25;
            const recover = config.recover !== false;

            // Lunge envelope: quick thrust, hold briefly, recover
            let lungeAmount;
            if (progress < 0.3) {
                // Quick thrust forward
                lungeAmount = (progress / 0.3);
                lungeAmount = 1 - Math.pow(1 - lungeAmount, 3); // Ease out
            } else if (progress < 0.6) {
                // Hold
                lungeAmount = 1.0;
            } else if (recover) {
                // Recover
                lungeAmount = 1 - ((progress - 0.6) / 0.4);
                lungeAmount = Math.pow(lungeAmount, 2); // Ease in
            } else {
                lungeAmount = 1.0;
            }

            // Forward movement (Z axis)
            const zOffset = lungeAmount * distance * strength;

            // Slight dip during lunge
            const yOffset = -Math.sin(lungeAmount * Math.PI) * 0.05 * strength;

            // Forward tilt
            const tiltX = lungeAmount * 0.2 * strength;

            // Scale stretch forward
            const scale = 1 + lungeAmount * 0.1 * strength;

            // Intensity glow on thrust
            const glowIntensity = 1.0 + lungeAmount * 0.3;
            const glowBoost = progress < 0.4 ? lungeAmount * 0.4 : 0;

            return {
                position: [0, yOffset, zOffset],
                rotation: [tiltX, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
