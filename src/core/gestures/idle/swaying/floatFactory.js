/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Float Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional float gestures
 * @author Emotive Engine Team
 * @module gestures/motions/floatFactory
 *
 * Creates ethereal floating gestures for all four directions.
 * Incredibly smooth, expressive motion perfect for storytelling.
 *
 * FLOAT: Gentle drift (~2000ms) - dreamy, weightless, emotional
 *
 * Use cases:
 * - floatUp: "Ascended to the heavens", joy, hope, lightness
 * - floatDown: "Sank into despair", sadness, defeat, gravity
 * - floatLeft/Right: "Drifted away", departure, farewell, distance
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a float gesture - ethereal drift in a direction
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createFloatGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid float direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `float${capitalize(direction)}`,
        emoji:
            direction === 'up'
                ? '🎈'
                : direction === 'down'
                  ? '🍂'
                  : direction === 'left'
                    ? '🌬️'
                    : '💨',
        type: 'blending',
        description: `Gentle floating ${direction}`,

        config: {
            duration: 2000,
            amplitude: 80,
            wobbleAmount: 20,
            strength: 1.0,
            direction,
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',

            amplitudeSync: {
                onBeat: 1.5,
                offBeat: 0.8,
                curve: 'bounce',
            },

            wobbleSync: {
                subdivision: 'eighth',
                intensity: 0.7,
            },

            durationSync: {
                mode: 'bars',
                bars: 2,
            },

            accentResponse: {
                enabled: true,
                multiplier: 1.3,
            },
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }
            if (!particle.gestureData.float) {
                particle.gestureData.float = {
                    originalSize: particle.size,
                    originalOpacity: particle.opacity || 1,
                };
            }

            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude || 80;
            let wobbleAmount = config.wobbleAmount || 20;
            const strength = config.strength || 1.0;

            if (motion.rhythmModulation) {
                amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
                amplitude *= motion.rhythmModulation.accentMultiplier || 1;
                wobbleAmount *= motion.rhythmModulation.wobbleMultiplier || 1;
            }

            // Wobble perpendicular to direction of travel
            const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount;

            // Primary direction movement - gradually slows
            const primaryForce = amplitude * 0.01 * dt * strength * (1 - progress * 0.5);

            if (isVertical) {
                // Vertical float: move Y, wobble X
                particle.vy += dir.y * primaryForce;
                particle.vx += wobble * 0.01 * dt * strength;
            } else {
                // Horizontal float: move X, wobble Y
                particle.vx += dir.x * primaryForce;
                particle.vy += wobble * 0.01 * dt * strength;
            }

            // Slight size variation for depth effect
            particle.size = particle.baseSize * (1 + progress * 0.1);

            // Fade slightly as it floats
            particle.opacity = 1 - progress * 0.3;
        },

        cleanup(particle) {
            if (particle.gestureData?.float) {
                particle.opacity = particle.gestureData.float.originalOpacity;
                particle.size = particle.gestureData.float.originalSize;
                delete particle.gestureData.float;
            } else {
                particle.opacity = 1;
                particle.size = particle.baseSize;
            }

            particle.vx *= 0.5;
            particle.vy *= 0.5;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                let amplitude = config.amplitude || 80;
                let wobbleAmount = config.wobbleAmount || 20;
                const strength = config.strength || 1.0;

                if (motion.rhythmModulation) {
                    amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
                    amplitude *= motion.rhythmModulation.accentMultiplier || 1;
                    wobbleAmount *= motion.rhythmModulation.wobbleMultiplier || 1;
                }

                const PIXEL_TO_3D = 0.005;

                // Smooth sine curve: starts at 0, peaks, returns to 0
                const floatCurve = Math.sin(progress * Math.PI);
                const floatDistance = amplitude * floatCurve * strength * PIXEL_TO_3D;

                // Wobble perpendicular to float direction
                const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount * 0.3 * PIXEL_TO_3D;

                // Gentle spinning rotation - returns to 0
                const spinCurve = Math.sin(progress * Math.PI);
                const spinRotation = spinCurve * Math.PI * 0.5 * strength;

                // Natural tilt during float - returns to 0
                const tiltCurve = Math.sin(progress * Math.PI);
                const tiltX = tiltCurve * Math.sin(progress * Math.PI * 2) * 0.1;
                const tiltZ = tiltCurve * Math.cos(progress * Math.PI * 3) * 0.08;

                // Scale pulses with float (depth perception)
                const scale = 1.0 + floatCurve * 0.1;

                // Position based on direction
                let posX = 0,
                    posY = 0;
                const posZ = 0;

                if (isVertical) {
                    posY = dir.y * floatDistance;
                    posX = wobble;
                } else {
                    posX = dir.x * floatDistance;
                    posY = wobble;
                }

                // Use cameraRelativePosition for screen-space movement
                return {
                    cameraRelativePosition: [posX, posY, posZ],
                    rotation: [tiltX, spinRotation, tiltZ],
                    scale,
                };
            },
        },
    };
}
