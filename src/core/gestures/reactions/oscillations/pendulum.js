/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Pendulum Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pendulum gesture - swing side to side like a clock
 * @author Emotive Engine Team
 * @module gestures/transforms/pendulum
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐              ⭐
 *       /                  \
 *      ⭐        ⭐        ⭐
 *         Tick    |    Tock
 *
 * USED BY:
 * - Hypnotic effect
 * - Waiting/passing time
 * - Metronome timing
 * - Indecision
 */

export default {
    name: 'pendulum',
    emoji: '🕰️',
    type: 'override',
    description: 'Swing side to side like a pendulum clock',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, beats: 4 },
        swingAngle: 0.4, // Max swing angle (radians)
        swings: 2, // Number of full swings
        damping: 0.3, // How much swing reduces over time
        strength: 1.0,
        particleMotion: {
            type: 'pendulum',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 4 },
        timingSync: 'onBeat',
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const swingAngle = config.swingAngle || 0.4;
            const swings = config.swings || 2;
            const damping = config.damping || 0.3;

            // Pendulum swing with damping
            const swingPhase = progress * swings * Math.PI * 2;
            const dampingFactor = 1 - damping * progress;
            const swing = Math.sin(swingPhase) * dampingFactor;

            // Rotation around Z axis (side to side tilt)
            const rotZ = swing * swingAngle * strength;

            // Slight position offset following the arc
            const xOffset = swing * 0.1 * strength;
            const yOffset = -Math.abs(swing) * 0.03 * strength; // Dip at edges

            // Consistent scale
            const scale = 1.0;

            // Subtle glow pulse at swing extremes
            const glowIntensity = 1.0 + Math.abs(swing) * 0.15;
            const glowBoost = 0;

            return {
                position: [xOffset, yOffset, 0],
                rotation: [0, 0, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
