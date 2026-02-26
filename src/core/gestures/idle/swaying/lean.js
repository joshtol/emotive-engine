/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lean Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lean gesture - tilting/leaning motion to one side
 * @author Emotive Engine Team
 * @module gestures/motions/lean
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a leaning/tilting motion where particles shift diagonally.
 * ║ This is a BLENDING gesture that adds to existing particle motion.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *      \
 *       \⭐     <- leaning right
 *        \
 *         \
 *          \⭐  <- maximum lean
 *           \
 *            \
 *           ⭐  <- return to center
 *
 * USED BY:
 * - Curiosity emotions (leaning in to look)
 * - Interest states (tilting to examine)
 * - Playful gestures (coy head tilt)
 */

/**
 * Lean gesture configuration and implementation
 */
export default {
    name: 'lean',
    emoji: '↗️',
    type: 'blending', // Adds to existing motion
    description: 'Diagonal tilting motion with smooth return',

    // Default configuration
    config: {
        duration: 1200, // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 10, // Lean distance (pixels)
        frequency: 1, // Number of lean cycles
        direction: 'right', // Lean direction: 'left' or 'right'
        strength: 0.7, // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'lean',
            direction: 'right',
            strength: 0.7,
            frequency: 1,
        },
    },

    // Rhythm configuration - lean syncs to musical timing
    rhythm: {
        enabled: true,
        syncMode: 'beat', // Lean on beat
        timingSync: 'nextBeat', // Start on next beat
        interruptible: true, // Can interrupt mid-lean
        priority: 3, // Lower priority
        blendable: true, // Can blend with other effects
        crossfadePoint: 'anyBeat', // Can transition out on any beat

        // Lean intensity syncs to beat
        amplitudeSync: {
            onBeat: 1.3, // Stronger lean on beat
            offBeat: 0.8, // Gentler between beats
            curve: 'ease', // Smooth curve
        },

        // Duration syncs to musical time
        durationSync: {
            mode: 'beats',
            beats: 2, // Lean for 2 beats
        },

        // Accent response for stronger emphasis
        accentResponse: {
            enabled: true,
            multiplier: 1.4, // 40% stronger on accented beats
        },

        // Pattern-specific leaning styles
        patternOverrides: {
            waltz: {
                // 3/4 time creates elegant leaning
                durationSync: { beats: 3 },
                amplitudeSync: { onBeat: 1.5, offBeat: 0.6 },
            },
            swing: {
                // Jazzy swing lean with character
                amplitudeSync: { onBeat: 1.6, offBeat: 0.5, curve: 'bounce' },
            },
        },
    },

    /**
     * Initialize gesture data for a particle
     * Called once when gesture starts
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     */
    initialize(particle, _motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        particle.gestureData.lean = {
            startX: particle.x,
            startY: particle.y,
            startVx: particle.vx,
            startVy: particle.vy,
            initialized: true,
        };
    },

    /**
     * Apply lean motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.lean?.initialized) {
            this.initialize(particle, motion);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;

        // Apply easing for smooth motion
        const easeProgress = this.easeInOutCubic(progress);

        // Calculate lean amount
        const frequency = config.frequency || this.config.frequency;

        // Apply rhythm modulation if present
        let amplitude = config.amplitude * strength * particle.scaleFactor;
        if (motion.rhythmModulation) {
            amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
            amplitude *= motion.rhythmModulation.accentMultiplier || 1;
        }

        // Lean curve - goes to one side and returns (sine wave)
        const leanCurve = Math.sin(easeProgress * Math.PI * frequency);

        // Direction multiplier
        const directionMult = config.direction === 'left' ? -1 : 1;

        // Apply diagonal motion (right/up or left/down)
        particle.vx += leanCurve * amplitude * 0.015 * dt * directionMult;
        particle.vy += leanCurve * amplitude * 0.01 * dt * directionMult * 0.5; // Slight vertical

        // Smooth ending - gradually reduce velocity modifications
        if (progress > 0.9) {
            const endFactor = 1 - (progress - 0.9) * 10;
            particle.vx = particle.vx * (0.95 + endFactor * 0.05);
            particle.vy = particle.vy * (0.95 + endFactor * 0.05);
        }
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.lean) {
            delete particle.gestureData.lean;
        }
    },

    /**
     * Easing function for smooth animation
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    /**
     * 3D core translation
     * Maps lean motion to 3D transforms with Z-axis roll rotation
     */
    '3d': {
        /**
         * Evaluate 3D properties at given progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} 3D transform properties {position, rotation, scale}
         */
        evaluate(progress, motion) {
            const config = motion || {};
            const amplitudePixels = config.amplitude || 10;
            const frequency = config.frequency || 1;
            const strength = config.strength || 0.7;
            const direction = config.direction || 'right';

            // Scale pixels to 3D units
            const PIXEL_TO_3D = 0.003; // 10px = 0.03 units max, 0.021 with strength
            const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

            // Apply easing
            const easeProgress =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Lean curve - sine wave that returns to 0
            const leanCurve = Math.sin(easeProgress * Math.PI * frequency);

            // Direction multiplier
            const directionMult = direction === 'left' ? -1 : 1;

            // Z-axis roll rotation (leaning left/right)
            // Max rotation: ~20 degrees (0.35 radians)
            const rollRotation = leanCurve * 0.35 * directionMult;

            // Slight X position shift for natural lean feel
            const xPosition = leanCurve * amplitude * directionMult;

            return {
                position: [xPosition, 0, 0],
                rotation: [0, 0, rollRotation],
                scale: 1.0,
            };
        },
    },
};
