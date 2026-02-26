/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Recoil Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Recoil gesture - snap backwards in shock
 * @author Emotive Engine Team
 * @module gestures/transforms/recoil
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     ⭐  ←←←  😱
 *         Snap backwards in shock
 *
 * USED BY:
 * - Surprise/shock
 * - Fear reaction
 * - Disgust
 * - Impact response
 */

export default {
    name: 'recoil',
    emoji: '😱',
    type: 'override',
    description: 'Snap backwards in shock or surprise',

    config: {
        duration: 600,
        musicalDuration: { musical: true, beats: 1.5 },
        distance: 0.2, // Recoil distance
        intensity: 1.0, // Reaction intensity
        recover: true, // Return to position
        strength: 1.0,
        particleMotion: {
            type: 'recoil',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 1.5 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.6,
        },
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const distance = config.distance || 0.2;
            const intensity = config.intensity || 1.0;
            const recover = config.recover !== false;

            // Recoil: instant snap back, then slow recovery
            let recoilAmount;
            if (progress < 0.15) {
                // Instant snap back
                recoilAmount = progress / 0.15;
                recoilAmount = 1 - Math.pow(1 - recoilAmount, 4); // Very fast ease out
            } else if (progress < 0.4) {
                // Hold in shock
                recoilAmount = 1.0;
            } else if (recover) {
                // Slow recovery
                recoilAmount = 1 - (progress - 0.4) / 0.6;
                recoilAmount = Math.pow(recoilAmount, 0.5); // Slow ease
            } else {
                recoilAmount = 1.0;
            }

            // Move backwards (negative Z)
            const zOffset = -recoilAmount * distance * strength * intensity;

            // Lean back
            const tiltX = -recoilAmount * 0.25 * strength * intensity;

            // Slight rise (startled)
            const yOffset = recoilAmount * 0.05 * strength;

            // Contract slightly in fear
            const scale = 1 - recoilAmount * 0.1 * intensity;

            // Flash of shock
            const glowIntensity = 1.0 + (progress < 0.2 ? (0.2 - progress) * 3 : 0);
            const glowBoost = progress < 0.15 ? 0.5 : 0;

            return {
                position: [0, yOffset, zOffset],
                rotation: [tiltX, 0, 0],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
