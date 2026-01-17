/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lean Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional lean gestures
 * @author Emotive Engine Team
 * @module gestures/motions/leanFactory
 *
 * Creates lean gestures for left/right body tilts.
 * Each gesture tilts in a direction then returns to center.
 *
 * LEAN: Body tilt (2 beats) - expressive, character-driven
 */

import { DIRECTIONS, capitalize } from './directions.js';

/**
 * Create a lean gesture - body tilt in a direction
 * @param {string} direction - 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createLeanGesture(direction) {
    // Lean only supports left/right (horizontal body tilts)
    if (direction !== 'left' && direction !== 'right') {
        throw new Error(`Invalid lean direction: ${direction}. Only 'left' and 'right' are supported.`);
    }
    const dir = DIRECTIONS[direction];

    return {
        name: `lean${capitalize(direction)}`,
        emoji: direction === 'left' ? '↖️' : '↗️',
        type: 'blending',
        description: `Lean ${direction} with smooth return`,

        config: {
            duration: 800,      // ~2 beats at 150 BPM
            amplitude: 10,      // Lean distance in pixels
            frequency: 1,       // Single lean cycle
            strength: 0.7,
            direction
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            timingSync: 'nextBeat',
            interruptible: true,
            priority: 3,
            blendable: true,

            durationSync: {
                mode: 'beats',
                beats: 2
            },

            amplitudeSync: {
                onBeat: 1.3,
                offBeat: 0.8,
                curve: 'ease'
            },

            accentResponse: {
                enabled: true,
                multiplier: 1.4
            }
        },

        initialize(particle, _motion) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }
            particle.gestureData.lean = {
                startX: particle.x,
                startY: particle.y,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            if (!particle.gestureData?.lean?.initialized) {
                this.initialize(particle, motion);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 0.7;

            const easeProgress = this.easeInOutCubic(progress);
            let amplitude = config.amplitude * strength * particle.scaleFactor;

            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Lean curve - goes to side and returns
            const leanCurve = Math.sin(easeProgress * Math.PI * config.frequency);

            // Apply horizontal motion with slight vertical for natural feel
            particle.vx += leanCurve * amplitude * 0.015 * dt * dir.x;
            particle.vy += leanCurve * amplitude * 0.01 * dt * dir.x * 0.5;

            // Smooth ending
            if (progress > 0.9) {
                const endFactor = 1 - ((progress - 0.9) * 10);
                particle.vx *= (0.95 + endFactor * 0.05);
                particle.vy *= (0.95 + endFactor * 0.05);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.lean) {
                delete particle.gestureData.lean;
            }
        },

        easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                const amplitudePixels = config.amplitude || 10;
                const frequency = config.frequency || 1;
                const strength = config.strength || 0.7;

                const PIXEL_TO_3D = 0.003;
                const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

                // Easing
                const easeProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Lean curve
                const leanCurve = Math.sin(easeProgress * Math.PI * frequency);

                // Z-axis roll rotation (body tilt) - camera-relative
                const rollRotation = leanCurve * 0.35 * dir.x;

                // X position shift - camera-relative (screen left/right)
                const xPosition = leanCurve * amplitude * dir.x;

                // Use cameraRelativePosition AND cameraRelativeRotation for full tidal lock
                // Roll rotation should also be relative to camera view
                return {
                    cameraRelativePosition: [xPosition, 0, 0],
                    cameraRelativeRotation: [0, 0, rollRotation],
                    scale: 1.0
                };
            }
        }
    };
}
