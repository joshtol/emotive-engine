/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Dance Step Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory functions for directional dance gestures
 * @author Emotive Engine Team
 * @module gestures/motions/danceSteps
 *
 * Creates beat-synced step and slide gestures for directional dance moves.
 * Each gesture moves in a direction then returns to center.
 *
 * STEP: Quick weight shift (1 beat) - snappy, percussive
 * SLIDE: Smooth glide (2 beats) - flowing, graceful
 */

/**
 * Direction vectors for movement
 */
const DIRECTIONS = {
    left:  { x: -1, y:  0 },
    right: { x:  1, y:  0 },
    up:    { x:  0, y:  1 },
    down:  { x:  0, y: -1 }
};

/**
 * Create a step gesture - quick weight shift in a direction
 * @param {string} direction - 'left', 'right', 'up', 'down'
 * @returns {Object} Gesture definition
 */
export function createStepGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid step direction: ${direction}`);

    return {
        name: `step${direction.charAt(0).toUpperCase() + direction.slice(1)}`,
        emoji: direction === 'left' ? '👈' : direction === 'right' ? '👉' : direction === 'up' ? '👆' : '👇',
        type: 'blending',
        description: `Quick step ${direction} and return`,

        config: {
            duration: 400,      // Fallback ~1 beat at 150 BPM
            amplitude: 25,      // Movement distance in pixels
            strength: 0.7,
            direction
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
                beats: 1          // Quick 1-beat step
            },

            amplitudeSync: {
                onBeat: 1.4,
                offBeat: 0.8,
                curve: 'snap'
            }
        },

        /**
         * Apply step motion to particle
         */
        apply(particle, progress, motion, dt, _centerX, _centerY) {
            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude * config.strength * particle.scaleFactor;

            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Sharp out, smooth back: quick snap to position, ease back to center
            // 0-0.3: snap out, 0.3-1.0: ease back
            let displacement;
            if (progress < 0.3) {
                // Quick snap out
                displacement = this.easeOutQuad(progress / 0.3);
            } else {
                // Smooth ease back
                displacement = 1 - this.easeInOutCubic((progress - 0.3) / 0.7);
            }

            const moveX = dir.x * amplitude * displacement * 0.01 * dt;
            const moveY = dir.y * amplitude * displacement * 0.01 * dt;

            particle.vx += moveX;
            particle.vy += moveY;
        },

        cleanup(_particle) {},

        easeOutQuad(t) {
            return 1 - (1 - t) * (1 - t);
        },

        easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                const amplitudePixels = config.amplitude || 25;
                const strength = config.strength || 0.7;

                const PIXEL_TO_3D = 0.008;
                let amplitude = amplitudePixels * PIXEL_TO_3D * strength;

                if (motion.rhythmModulation) {
                    amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                }

                // Sharp out, smooth back
                let displacement;
                if (progress < 0.3) {
                    displacement = 1 - (1 - progress / 0.3) * (1 - progress / 0.3);
                } else {
                    const t = (progress - 0.3) / 0.7;
                    displacement = 1 - (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
                }

                const posX = dir.x * amplitude * displacement;
                const posY = dir.y * amplitude * displacement;

                // Lean into the step direction
                const leanAmount = displacement * 0.12 * strength;
                const rotZ = -dir.x * leanAmount;  // Lean opposite to movement
                const rotX = dir.y * leanAmount * 0.5;

                return {
                    position: [posX, posY, 0],
                    rotation: [rotX, 0, rotZ],
                    scale: 1.0
                };
            }
        }
    };
}

/**
 * Create a slide gesture - smooth glide in a direction
 * @param {string} direction - 'left', 'right'
 * @returns {Object} Gesture definition
 */
export function createSlideGesture(direction) {
    const dir = DIRECTIONS[direction];
    if (!dir) throw new Error(`Invalid slide direction: ${direction}`);

    return {
        name: `slide${direction.charAt(0).toUpperCase() + direction.slice(1)}`,
        emoji: direction === 'left' ? '⬅️' : '➡️',
        type: 'blending',
        description: `Smooth slide ${direction} and return`,

        config: {
            duration: 800,      // Fallback ~2 beats at 150 BPM
            amplitude: 35,      // Larger movement for slide
            strength: 0.6,
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
                beats: 2          // Smooth 2-beat slide
            },

            amplitudeSync: {
                onBeat: 1.2,
                offBeat: 0.9,
                curve: 'ease'
            }
        },

        /**
         * Apply slide motion to particle
         */
        apply(particle, progress, motion, dt, _centerX, _centerY) {
            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude * config.strength * particle.scaleFactor;

            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Smooth sine curve: glide out and back
            const displacement = Math.sin(progress * Math.PI);

            const moveX = dir.x * amplitude * displacement * 0.008 * dt;
            const moveY = dir.y * amplitude * displacement * 0.008 * dt;

            particle.vx += moveX;
            particle.vy += moveY;
        },

        cleanup(_particle) {},

        '3d': {
            evaluate(progress, motion) {
                const config = motion || {};
                const amplitudePixels = config.amplitude || 35;
                const strength = config.strength || 0.6;

                const PIXEL_TO_3D = 0.008;
                let amplitude = amplitudePixels * PIXEL_TO_3D * strength;

                if (motion.rhythmModulation) {
                    amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                }

                // Smooth sine curve for graceful glide
                const displacement = Math.sin(progress * Math.PI);

                const posX = dir.x * amplitude * displacement;
                const posY = dir.y * amplitude * displacement;

                // Gentle lean and rotation during slide
                const leanAmount = displacement * 0.08 * strength;
                const rotZ = -dir.x * leanAmount;
                const rotY = dir.x * leanAmount * 0.5;  // Slight turn toward movement

                // Subtle depth movement
                const posZ = Math.sin(progress * Math.PI * 2) * 0.02 * strength;

                return {
                    position: [posX, posY, posZ],
                    rotation: [0, rotY, rotZ],
                    scale: 1.0 + displacement * 0.03  // Slight expansion during slide
                };
            }
        }
    };
}
