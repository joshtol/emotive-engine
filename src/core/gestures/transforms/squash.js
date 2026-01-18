/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Squash Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Squash gesture - flatten horizontally like cartoon impact
 * @author Emotive Engine Team
 * @module gestures/transforms/squash
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐         Normal
 *        ↓
 *     ═══⭐═══      Squashed flat
 *
 * USED BY:
 * - Impact/collision
 * - Surprise/shock
 * - Cartoon physics
 * - Comedy effect
 */

export default {
    name: 'squash',
    emoji: '🫓',
    type: 'override',
    description: 'Flatten horizontally like a cartoon impact',

    config: {
        duration: 500,
        musicalDuration: { musical: true, beats: 1 },
        squashAmount: 0.5,    // How flat to get (0.5 = half height)
        stretchAmount: 1.5,   // How wide to stretch
        bounce: true,         // Bounce back with overshoot
        strength: 1.0,
        particleMotion: {
            type: 'squash',
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
            const squashAmount = config.squashAmount || 0.5;
            const stretchAmount = config.stretchAmount || 1.5;
            const bounce = config.bounce !== false;

            // Squash envelope with bounce
            let squash;
            if (progress < 0.15) {
                // Quick squash - fast impact
                squash = progress / 0.15;
                squash = 1 - Math.pow(1 - squash, 3);
            } else if (bounce) {
                // Bouncy recovery
                const bounceProgress = (progress - 0.15) / 0.85;
                const decay = Math.exp(-bounceProgress * 4);
                const oscillation = Math.cos(bounceProgress * Math.PI * 3);
                squash = oscillation * decay;
                squash = Math.max(0, squash); // Only positive squash
            } else {
                squash = 0;
            }

            // Non-uniform scale: squash Y (flatten), stretch X/Z (widen)
            // scaleY goes DOWN (flattens), scaleXZ goes UP (stretches wide)
            const scaleY = 1 - squash * (1 - squashAmount) * strength;  // e.g., 1 -> 0.5
            const scaleXZ = 1 + squash * (stretchAmount - 1) * strength; // e.g., 1 -> 1.5

            // Drop down when squashed (move to ground level)
            const yOffset = -squash * 0.15 * strength;

            // Impact flash
            const glowIntensity = 1.0 + (progress < 0.2 ? (0.2 - progress) * 3 : 0);
            const glowBoost = progress < 0.15 ? 0.6 : 0;

            return {
                position: [0, yOffset, 0],
                rotation: [0, 0, 0],
                // Return non-uniform scale as array [x, y, z]
                scale: [scaleXZ, scaleY, scaleXZ],
                glowIntensity,
                glowBoost
            };
        }
    }
};
