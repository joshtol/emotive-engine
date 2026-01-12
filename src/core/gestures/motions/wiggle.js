/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wiggle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wiggle gesture - rapid side-to-side oscillation
 * @author Emotive Engine Team
 * @module gestures/motions/wiggle
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for playful animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a rapid wiggling motion with particles oscillating side-to-side.
 * ║ This is an ADDITIVE gesture that modifies velocity while maintaining behavior.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        Fast oscillation
 *      ← ⭐ → ⭐ ← ⭐ →
 *      (rapid side-to-side)
 *
 * USED BY:
 * - Playful excitement states
 * - Nervous energy
 * - Wiggling hello/goodbye
 * - Dance moves
 */

/**
 * Wiggle gesture configuration and implementation
 */
export default {
    name: 'wiggle',
    emoji: '〰️',
    type: 'additive', // Adds to existing motion
    description: 'Rapid side-to-side oscillation',

    // Default configuration
    config: {
        duration: 600,          // Legacy fallback
        musicalDuration: { musical: true, beats: 1 }, // 1 beat (quarter note)
        amplitude: 15,          // Wiggle distance (pixels)
        frequency: 6,           // Number of oscillations
        strength: 1.0,          // Motion intensity
        damping: 0.3,           // Velocity damping (0-1, higher = faster slowdown)
        easing: 'linear',       // Animation curve
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'wiggle',
            strength: 1.0,
            amplitude: 15,
            frequency: 6
        }
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncMode: 'beat',

        // Frequency syncs to beat subdivision
        frequencySync: {
            subdivision: 'sixteenth', // Fast wiggles on 16th notes
            wigglePerBeat: 4
        },

        // Amplitude increases on beat
        amplitudeSync: {
            onBeat: 1.5,
            offBeat: 0.8,
            curve: 'bounce'
        },

        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 1  // Wiggle for 1 beat
        }
    },

    /**
     * Apply wiggle motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {Object} gestureData - Persistent gesture data
     * @param {Object} config - Gesture configuration
     * @param {number} progress - Gesture progress (0-1)
     * @param {number} strength - Gesture strength multiplier
     * @param {number} centerX - Orb center X (unused for wiggle)
     * @param {number} centerY - Orb center Y (unused for wiggle)
     */
    apply(particle, gestureData, config, progress, strength, centerX, centerY) {
        const amplitude = (config.amplitude || this.config.amplitude) * strength;
        const frequency = config.frequency || this.config.frequency;
        const damping = config.damping || this.config.damping;

        // Fast oscillating sine wave (side-to-side)
        const oscillation = Math.sin(progress * Math.PI * frequency);

        // Apply damping envelope (fade out towards end)
        const envelope = 1 - (progress * damping);

        // Horizontal velocity modification
        const wiggleForce = oscillation * amplitude * envelope;
        particle.vx += wiggleForce * 0.5;

        // Slight vertical component for natural feel (10% of horizontal)
        const verticalWiggle = Math.cos(progress * Math.PI * frequency * 2) * amplitude * 0.1 * envelope;
        particle.vy += verticalWiggle * 0.3;
    },

    /**
     * 3D translation for WebGL rendering
     * Uses cameraRelativePosition for horizontal shimmy relative to camera view
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} Transform with cameraRelativePosition
         */
        evaluate(progress, motion) {
            const config = motion.config || {};
            const strength = motion.strength || 1.0;
            const amplitude = config.amplitude || 15; // pixels

            // Fast decay
            const decay = Math.pow(1 - progress, 0.6);
            // Rapid oscillation - left/right shimmy
            const osc = Math.sin(progress * Math.PI * 12) * decay;

            // Scale amplitude: 15px default → 0.04 horizontal shimmy
            const ampScale = (amplitude / 15) * strength;
            const horizontal = osc * 0.04 * ampScale;

            return {
                // X in camera-relative = horizontal shimmy (always side-to-side in view)
                cameraRelativePosition: [horizontal, 0, 0],
                // Slight scale pulse
                scale: 1.0 + Math.abs(osc) * 0.03,
                glowIntensity: 1.0 + Math.abs(osc) * 0.1
            };
        }
    }
};
