/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Kick Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional kick gestures
 * @author Emotive Engine Team
 * @module gestures/motions/kickFactory
 *
 * Creates kick gestures for left/right side kicks.
 * Quick, punchy extension with snap return - perfect for dance.
 *
 * KICK: Quick side extension (1 beat) - energetic, percussive
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a kick gesture - quick extension in a direction
 * @param {string} direction - 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createKickGesture(direction) {
    // Kick only supports left/right (side kicks)
    if (direction !== 'left' && direction !== 'right') {
        throw new Error(
            `Invalid kick direction: ${direction}. Only 'left' and 'right' are supported.`
        );
    }
    const dir = DIRECTIONS[direction];

    return {
        name: `kick${capitalize(direction)}`,
        emoji: direction === 'left' ? '🦵' : '🦶',
        type: 'blending',
        description: `Quick kick ${direction} with snap return`,

        config: {
            duration: 400, // ~1 beat at 150 BPM
            amplitude: 30, // Kick distance in pixels
            strength: 0.8,
            direction,
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            timingSync: 'nextBeat',
            interruptible: true,
            priority: 5,
            blendable: true,

            durationSync: {
                mode: 'beats',
                beats: 1,
            },

            amplitudeSync: {
                onBeat: 1.5,
                offBeat: 0.7,
                curve: 'snap',
            },

            accentResponse: {
                enabled: true,
                multiplier: 1.5,
            },
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude * config.strength * particle.scaleFactor;

            if (motion.rhythmModulation) {
                amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
                amplitude *= motion.rhythmModulation.accentMultiplier || 1;
            }

            // Kick curve: fast out (0-0.25), hold (0.25-0.5), snap back (0.5-1.0)
            let displacement;
            if (progress < 0.25) {
                // Quick extension
                displacement = this.easeOutQuad(progress / 0.25);
            } else if (progress < 0.5) {
                // Hold at peak
                displacement = 1.0;
            } else {
                // Snap back
                displacement = 1 - this.easeInQuad((progress - 0.5) / 0.5);
            }

            const moveX = dir.x * amplitude * displacement * 0.012 * dt;
            const moveY = dir.y * amplitude * displacement * 0.012 * dt;

            particle.vx += moveX;
            particle.vy += moveY;
        },

        cleanup(_particle) {},

        easeOutQuad(t) {
            return 1 - (1 - t) * (1 - t);
        },

        easeInQuad(t) {
            return t * t;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                const amplitudePixels = config.amplitude || 30;
                const strength = config.strength || 0.8;

                const PIXEL_TO_3D = 0.008;
                let amplitude = amplitudePixels * PIXEL_TO_3D * strength;

                if (motion.rhythmModulation) {
                    amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
                }

                // Kick curve: fast out, hold, snap back
                let displacement;
                if (progress < 0.25) {
                    displacement = 1 - (1 - progress / 0.25) * (1 - progress / 0.25);
                } else if (progress < 0.5) {
                    displacement = 1.0;
                } else {
                    const t = (progress - 0.5) / 0.5;
                    displacement = 1 - t * t;
                }

                const posX = dir.x * amplitude * displacement;
                const posY = dir.y * amplitude * displacement * 0.3; // Slight lift

                // Tilt away from kick direction
                const tiltAmount = displacement * 0.15 * strength;
                const rotZ = dir.x * tiltAmount; // Lean opposite to kick

                // Slight forward rotation for dynamic feel
                const rotX = displacement * 0.08 * strength;

                // Use cameraRelativePosition for screen-space movement
                return {
                    cameraRelativePosition: [posX, posY, 0],
                    rotation: [rotX, 0, rotZ],
                    scale: 1.0 + displacement * 0.05, // Slight expansion on kick
                };
            },
        },
    };
}
