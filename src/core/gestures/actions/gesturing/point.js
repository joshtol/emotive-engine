/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Point Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Point gesture - directional pointing motion
 * @author Emotive Engine Team
 * @module gestures/motions/point
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a pointing motion with forward momentum and directional orientation.
 * ║ This is a BLENDING gesture that adds to existing particle motion.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *       →→→
 *      ⭐→→  <- pointing forward
 *     ⭐→    <- extending
 *    ⭐      <- retracting
 *
 * USED BY:
 * - Attention-directing emotions (look there!)
 * - Emphasis states (indicating direction)
 * - Assertive gestures (pointing out)
 */

/**
 * Point gesture configuration and implementation
 */
export default {
    name: 'point',
    emoji: '👉',
    type: 'blending', // Adds to existing motion
    description: 'Directional pointing motion with forward momentum',

    // Default configuration
    config: {
        duration: 1000, // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 15, // Point extension distance (pixels)
        direction: 'right', // Point direction: 'left', 'right', 'up', 'down'
        strength: 0.8, // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'point',
            direction: 'right',
            strength: 0.8,
        },
    },

    // Rhythm configuration - point syncs to musical timing
    rhythm: {
        enabled: true,
        syncMode: 'beat', // Point on beat
        timingSync: 'nextBeat', // Start on next beat
        interruptible: true, // Can interrupt mid-point
        priority: 4, // Medium priority
        blendable: true, // Can blend with other effects
        crossfadePoint: 'anyBeat', // Can transition out on any beat

        // Point emphasis syncs to beat
        amplitudeSync: {
            onBeat: 1.5, // Stronger point on beat
            offBeat: 0.7, // Gentler between beats
            curve: 'ease', // Smooth curve
        },

        // Duration syncs to musical time
        durationSync: {
            mode: 'beats',
            beats: 2, // Point for 2 beats
        },

        // Accent response for emphasis
        accentResponse: {
            enabled: true,
            multiplier: 1.6, // 60% stronger on accented beats
        },

        // Pattern-specific pointing styles
        patternOverrides: {
            march: {
                // Strong, deliberate pointing
                amplitudeSync: { onBeat: 2.0, offBeat: 0.5, curve: 'pulse' },
            },
            swing: {
                // Smooth jazzy pointing
                amplitudeSync: { onBeat: 1.4, offBeat: 0.8, curve: 'bounce' },
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

        particle.gestureData.point = {
            startX: particle.x,
            startY: particle.y,
            startVx: particle.vx,
            startVy: particle.vy,
            initialized: true,
        };
    },

    /**
     * Apply point motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.point?.initialized) {
            this.initialize(particle, motion);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;

        // Apply easing for smooth motion
        const easeProgress = this.easeInOutCubic(progress);

        // Apply rhythm modulation if present
        let amplitude = config.amplitude * strength * particle.scaleFactor;
        if (motion.rhythmModulation) {
            amplitude *= motion.rhythmModulation.amplitudeMultiplier || 1;
            amplitude *= motion.rhythmModulation.accentMultiplier || 1;
        }

        // Point curve - extends and returns (sine wave)
        const pointCurve = Math.sin(easeProgress * Math.PI);

        // Direction vectors
        const direction = config.direction || 'right';
        let vx = 0,
            vy = 0;

        switch (direction) {
            case 'right':
                vx = 1;
                break;
            case 'left':
                vx = -1;
                break;
            case 'up':
                vy = -1;
                break;
            case 'down':
                vy = 1;
                break;
        }

        // Apply forward momentum
        particle.vx += pointCurve * amplitude * 0.02 * dt * vx;
        particle.vy += pointCurve * amplitude * 0.02 * dt * vy;

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
        if (particle.gestureData?.point) {
            delete particle.gestureData.point;
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
     * Maps point motion to 3D transforms with Y-axis rotation and position
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
            const amplitudePixels = config.amplitude || 15;
            const strength = config.strength || 0.8;
            const direction = config.direction || 'right';

            // Scale pixels to 3D units
            const PIXEL_TO_3D = 0.005; // 15px = 0.075 units max, 0.06 with strength
            const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

            // Apply easing
            const easeProgress =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Point curve - sine wave that returns to 0
            const pointCurve = Math.sin(easeProgress * Math.PI);

            // Direction-based transformations
            let xPosition = 0;
            let yRotation = 0;

            switch (direction) {
                case 'right':
                    xPosition = pointCurve * amplitude;
                    yRotation = pointCurve * 0.25; // ~14 degrees
                    break;
                case 'left':
                    xPosition = -pointCurve * amplitude;
                    yRotation = -pointCurve * 0.25;
                    break;
                case 'up':
                    // Point upward uses slight Y-axis tilt
                    yRotation = 0;
                    break;
                case 'down':
                    yRotation = 0;
                    break;
            }

            return {
                position: [xPosition, 0, 0],
                rotation: [0, yRotation, 0],
                scale: 1.0,
            };
        },
    },
};
