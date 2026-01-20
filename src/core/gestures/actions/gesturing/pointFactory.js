/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Point Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory function for directional point gestures
 * @author Emotive Engine Team
 * @module gestures/motions/pointFactory
 *
 * Creates pointing gestures for all four directions.
 * Extends with forward momentum then returns - great for storytelling.
 *
 * POINT: Extension with return (~500ms) - indicative, emphatic
 *
 * Use cases:
 * - pointUp: "Look to the stars", "Raised hand", aspiration
 * - pointDown: "Look at this", "There it is", grounding
 * - pointLeft/Right: Directing attention, indicating direction
 */

import { DIRECTIONS, capitalize } from '../../_shared/directions.js';

/**
 * Create a point gesture - directional indication
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createPointGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid point direction: ${direction}`);

    const isVertical = direction === 'up' || direction === 'down';

    return {
        name: `point${capitalize(direction)}`,
        emoji: direction === 'up' ? '☝️' : direction === 'down' ? '👇' : direction === 'left' ? '👈' : '👉',
        type: 'blending',
        description: `Point ${direction} with extension and return`,

        config: {
            duration: 500,
            amplitude: 15,
            strength: 0.8,
            direction
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            timingSync: 'nextBeat',
            interruptible: true,
            priority: 4,
            blendable: true,

            durationSync: {
                mode: 'beats',
                beats: 1
            },

            amplitudeSync: {
                onBeat: 1.5,
                offBeat: 0.7,
                curve: 'ease'
            },

            accentResponse: {
                enabled: true,
                multiplier: 1.6
            }
        },

        initialize(particle, _motion) {
            if (!particle.gestureData) {
                particle.gestureData = {};
            }
            particle.gestureData.point = {
                startX: particle.x,
                startY: particle.y,
                initialized: true
            };
        },

        apply(particle, progress, motion, dt, _centerX, _centerY) {
            if (!particle.gestureData?.point?.initialized) {
                this.initialize(particle, motion);
            }

            const config = { ...this.config, ...motion };
            const strength = config.strength || 0.8;

            const easeProgress = this.easeInOutCubic(progress);
            let amplitude = config.amplitude * strength * particle.scaleFactor;

            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Point curve - extends and returns
            const pointCurve = Math.sin(easeProgress * Math.PI);

            // Apply directional momentum
            particle.vx += pointCurve * amplitude * 0.02 * dt * dir.x;
            particle.vy += pointCurve * amplitude * 0.02 * dt * (-dir.y); // Invert Y for screen coords

            // Smooth ending
            if (progress > 0.9) {
                const endFactor = 1 - ((progress - 0.9) * 10);
                particle.vx *= (0.95 + endFactor * 0.05);
                particle.vy *= (0.95 + endFactor * 0.05);
            }
        },

        cleanup(particle) {
            if (particle.gestureData?.point) {
                delete particle.gestureData.point;
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
                const amplitudePixels = config.amplitude || 15;
                const strength = config.strength || 0.8;

                const PIXEL_TO_3D = 0.005;
                const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

                // Easing
                const easeProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Point curve
                const pointCurve = Math.sin(easeProgress * Math.PI);

                // Position based on direction
                const posX = dir.x * pointCurve * amplitude;
                const posY = dir.y * pointCurve * amplitude;

                // Rotation: lean into the point direction
                let rotX = 0, rotY = 0, rotZ = 0;

                if (isVertical) {
                    // Vertical pointing: tilt forward/back
                    rotX = dir.y * pointCurve * 0.2; // ~11 degrees
                } else {
                    // Horizontal pointing: turn toward direction
                    rotY = dir.x * pointCurve * 0.25; // ~14 degrees
                    rotZ = -dir.x * pointCurve * 0.1; // Slight lean
                }

                // Use cameraRelativePosition for screen-space movement
                return {
                    cameraRelativePosition: [posX, posY, 0],
                    rotation: [rotX, rotY, rotZ],
                    scale: 1.0
                };
            }
        }
    };
}
