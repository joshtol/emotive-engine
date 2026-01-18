/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Pancake Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pancake gesture - extreme squash and hold
 * @author Emotive Engine Team
 * @module gestures/transforms/pancake
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐         Normal
 *        ↓
 *   ════════════    PANCAKE! (held)
 *        ↓
 *        ⭐         Slowly recover
 *
 * USED BY:
 * - Heavy impact
 * - Steamroller effect
 * - Comical crushing
 * - Dramatic flatten
 */

export default {
    name: 'pancake',
    emoji: '🥞',
    type: 'override',
    description: 'Extreme flatten and hold - cartoon pancake effect',

    config: {
        duration: 1600,
        musicalDuration: { musical: true, bars: 1 },
        squashAmount: 0.2,     // How flat to get (0.2 = 20% of original height)
        stretchAmount: 2.0,    // How wide to stretch (2x width)
        holdRatio: 0.5,        // How long to hold the squash (50% of duration)
        strength: 1.0,
        particleMotion: {
            type: 'pancake',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
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
            const squashAmount = config.squashAmount || 0.2;
            const stretchAmount = config.stretchAmount || 2.0;
            const holdRatio = config.holdRatio || 0.5;

            // PANCAKE PHASES:
            // Phase 1 (0-0.1): SLAM - instant violent impact
            // Phase 2 (0.1-0.1+holdRatio): HOLD - maintain pancake with wobble
            // Phase 3 (remaining): RECOVER - slow peeling up

            const holdEnd = 0.1 + holdRatio * 0.6; // e.g., 0.1 + 0.3 = 0.4
            const recoverStart = holdEnd;

            let squash = 0;
            let wobble = 0;

            if (progress < 0.1) {
                // Phase 1: SLAM - instant violent squash
                const slamT = progress / 0.1;
                squash = 1 - Math.pow(1 - slamT, 2); // Very fast
            } else if (progress < recoverStart) {
                // Phase 2: HOLD - maintain with slight wobble
                squash = 1.0;
                const holdT = (progress - 0.1) / (recoverStart - 0.1);
                // Settle wobble
                wobble = Math.sin(holdT * Math.PI * 4) * (1 - holdT) * 0.02;
            } else {
                // Phase 3: RECOVER - slow peeling up
                const recoverT = (progress - recoverStart) / (1 - recoverStart);
                // Slow ease out - like peeling off the ground
                const peelEase = recoverT < 0.3
                    ? recoverT / 0.3 * 0.3 // Slow start
                    : 0.3 + (recoverT - 0.3) / 0.7 * 0.7; // Then accelerate
                squash = 1 - peelEase;

                // Overshoot bounce at end
                if (recoverT > 0.8) {
                    const bounceT = (recoverT - 0.8) / 0.2;
                    const bounce = Math.sin(bounceT * Math.PI) * 0.15;
                    squash = Math.max(0, squash - bounce);
                }
            }

            // Non-uniform scale: extreme squash Y, extreme stretch X/Z
            const scaleY = 1 - squash * (1 - squashAmount) * strength;  // e.g., 1 -> 0.2
            const scaleXZ = 1 + squash * (stretchAmount - 1) * strength; // e.g., 1 -> 2.0

            // Drop down when squashed (move to ground level)
            const yOffset = -squash * 0.2 * strength;

            // Add wobble to X position
            const xOffset = wobble * strength;

            // Slight rotation wobble during hold
            const rotZ = wobble * 2 * strength;

            // Impact flash - sustained during hold
            let glowIntensity = 1.0;
            let glowBoost = 0;
            if (progress < 0.15) {
                // Initial flash
                glowIntensity = 1.0 + (1 - progress / 0.15) * 0.8;
                glowBoost = (1 - progress / 0.15) * 0.6;
            } else if (progress < recoverStart) {
                // Sustained glow during hold
                glowIntensity = 1.3;
                glowBoost = 0.2;
            } else {
                // Fade during recovery
                const fadeT = (progress - recoverStart) / (1 - recoverStart);
                glowIntensity = 1.3 - fadeT * 0.3;
            }

            return {
                position: [xOffset, yOffset, 0],
                rotation: [0, 0, rotZ],
                // Return non-uniform scale as array [x, y, z]
                scale: [scaleXZ, scaleY, scaleXZ],
                glowIntensity,
                glowBoost
            };
        }
    }
};
