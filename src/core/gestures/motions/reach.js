/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Reach Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Reach gesture - upward reaching motion
 * @author Emotive Engine Team
 * @module gestures/motions/reach
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an upward reaching motion with scale increase and return.
 * ║ This is a BLENDING gesture that adds to existing particle motion.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *         ⭐⭐    <- reached (scaled larger)
 *          ↑
 *          ↑
 *         ⭐     <- reaching
 *          ↑
 *          ↑
 *         ⭐     <- start
 *
 * USED BY:
 * - Hope emotions (reaching for goals)
 * - Aspiration states (striving upward)
 * - Growth gestures (expanding presence)
 */

/**
 * Reach gesture configuration and implementation
 */
export default {
    name: 'reach',
    emoji: '🙌',
    type: 'blending', // Adds to existing motion
    description: 'Upward reaching motion with scale increase',

    // Default configuration
    config: {
        duration: 1400,     // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 25,      // Reach distance (pixels)
        strength: 0.9,      // Overall motion intensity
        scaleMax: 1.05,     // Maximum scale multiplier
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'reach',
            strength: 0.9,
            scaleMax: 1.05
        }
    },

    // Rhythm configuration - reach syncs to musical timing
    rhythm: {
        enabled: true,
        syncMode: 'beat',         // Reach on beat
        timingSync: 'nextBeat',   // Start on next beat
        interruptible: true,      // Can interrupt mid-reach
        priority: 4,              // Medium priority
        blendable: true,          // Can blend with other effects
        crossfadePoint: 'anyBeat', // Can transition out on any beat

        // Reach intensity syncs to beat
        amplitudeSync: {
            onBeat: 1.4,      // Stronger reach on beat
            offBeat: 0.9,     // Gentler between beats
            curve: 'ease'     // Smooth curve
        },

        // Duration syncs to musical time
        durationSync: {
            mode: 'beats',
            beats: 2          // Reach for 2 beats
        },

        // Accent response for emphasis
        accentResponse: {
            enabled: true,
            multiplier: 1.5   // 50% stronger on accented beats
        },

        // Pattern-specific reaching styles
        patternOverrides: {
            'uplifting': {
                // Inspiring upward reach
                amplitudeSync: { onBeat: 1.8, offBeat: 0.7, curve: 'ease' },
                durationSync: { beats: 3 }
            },
            'ambient': {
                // Gentle sustained reach
                amplitudeSync: { onBeat: 1.2, offBeat: 1.0, curve: 'linear' }
            }
        }
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

        particle.gestureData.reach = {
            startY: particle.y,
            startVy: particle.vy,
            originalSize: particle.size,
            initialized: true
        };
    },

    /**
     * Apply reach motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.reach?.initialized) {
            this.initialize(particle, motion);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        const scaleMax = config.scaleMax || this.config.scaleMax || 1.05;

        // Apply easing for smooth motion
        const easeProgress = this.easeInOutCubic(progress);

        // Apply rhythm modulation if present
        let amplitude = config.amplitude * strength * particle.scaleFactor;
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
        }

        // Reach curve - extends upward and returns (sine wave)
        const reachCurve = Math.sin(easeProgress * Math.PI);

        // Apply upward momentum
        particle.vy -= reachCurve * amplitude * 0.015 * dt;

        // Scale increases as reach extends
        const scaleMultiplier = 1.0 + (reachCurve * (scaleMax - 1.0));
        particle.size = particle.baseSize * scaleMultiplier;

        // Smooth ending - gradually reduce velocity modifications
        if (progress > 0.9) {
            const endFactor = 1 - ((progress - 0.9) * 10);
            particle.vy = particle.vy * (0.95 + endFactor * 0.05);
        }
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.reach) {
            // Reset size to original
            if (particle.gestureData.reach.originalSize) {
                particle.size = particle.gestureData.reach.originalSize;
            } else {
                particle.size = particle.baseSize;
            }
            delete particle.gestureData.reach;
        }
    },

    /**
     * Easing function for smooth animation
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    /**
     * 3D core translation
     * Maps reach motion to 3D transforms with Y position and scale
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
            const amplitudePixels = config.amplitude || 25;
            const strength = config.strength || 0.9;
            const scaleMax = config.scaleMax || 1.05;

            // Scale pixels to 3D units
            const PIXEL_TO_3D = 0.004; // 25px = 0.1 units max, 0.09 with strength
            const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

            // Apply easing
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Reach curve - sine wave that returns to 0
            const reachCurve = Math.sin(easeProgress * Math.PI);

            // Upward Y position movement
            const yPosition = reachCurve * amplitude;

            // Scale increases with reach, returns to 1.0
            const scale = 1.0 + (reachCurve * (scaleMax - 1.0));

            // Slight forward tilt as reaching up (natural body motion)
            const tiltX = reachCurve * 0.1; // ~5 degrees

            return {
                position: [0, yPosition, 0],
                rotation: [tiltX, 0, 0],
                scale
            };
        }
    }
};
