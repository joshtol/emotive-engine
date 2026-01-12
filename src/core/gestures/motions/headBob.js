/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Head Bob Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Head bob gesture - rhythmic vertical bobbing motion
 * @author Emotive Engine Team
 * @module gestures/motions/headBob
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for musical animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a rhythmic head bobbing motion synchronized to music beats.
 * ║ This is an ADDITIVE gesture that adds quick vertical movement.
 * ║ Like nodding along to a beat - faster and tighter than regular nod.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        Quick rhythmic bobs
 *      ↓⭐↑ ↓⭐↑
 *      (bobbing to music - spam for continuous rhythm)
 *
 * USED BY:
 * - Music synchronization
 * - Rhythmic agreement
 * - Dancing states
 * - Groove animations
 */

/**
 * Head bob gesture configuration and implementation
 */
export default {
    name: 'headBob',
    emoji: '🎧',
    type: 'additive', // Adds to existing motion
    description: 'Rhythmic vertical bobbing to music',

    // Default configuration
    config: {
        duration: 600,          // Legacy fallback
        musicalDuration: { musical: true, beats: 1 }, // 1 beat duration
        amplitude: 12,          // Bob distance (pixels) - smaller than nod
        frequency: 2,           // 2 bobs per gesture - spammable for rhythm
        strength: 1.0,          // Motion intensity
        damping: 0.1,           // Minimal damping - smooth continuous motion
        easing: 'linear',       // Animation curve - steady rhythm
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'headBob',
            strength: 1.0,
            amplitude: 12,
            frequency: 2
        }
    },

    // Rhythm configuration - tight sync to beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',

        // Frequency syncs to beat subdivision
        frequencySync: {
            subdivision: 'eighth', // Quick bobs on 8th notes
            bobsPerBeat: 2
        },

        // Amplitude increases on downbeat
        amplitudeSync: {
            onBeat: 1.3,
            offBeat: 1.0,
            curve: 'pulse'
        },

        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 1  // Bob for 1 beat
        }
    },

    /**
     * Apply head bob motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {Object} gestureData - Persistent gesture data
     * @param {Object} config - Gesture configuration
     * @param {number} progress - Gesture progress (0-1)
     * @param {number} strength - Gesture strength multiplier
     * @param {number} centerX - Orb center X (unused for head bob)
     * @param {number} centerY - Orb center Y (unused for head bob)
     */
    apply(particle, gestureData, config, progress, strength, centerX, centerY) {
        const amplitude = (config.amplitude || this.config.amplitude) * strength;
        const frequency = config.frequency || this.config.frequency;
        const damping = config.damping || this.config.damping;

        // Quick rhythmic oscillation (vertical bobbing)
        const oscillation = Math.sin(progress * Math.PI * 2 * frequency);

        // Minimal damping - keep the energy throughout
        const envelope = 1 - (progress * damping);

        // Vertical velocity modification (primary motion)
        const bobForce = oscillation * amplitude * envelope;
        particle.vy += bobForce * 0.5;

        // Tiny horizontal component for natural feel (5% of vertical)
        const horizontalBob = Math.cos(progress * Math.PI * 2 * frequency * 1.5) * amplitude * 0.05 * envelope;
        particle.vx += horizontalBob * 0.2;
    },

    /**
     * 3D translation for WebGL rendering
     * Uses cameraRelativePosition for tidally-locked motion toward camera
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
            const amplitude = config.amplitude || 12; // pixels

            // Sharp attack, smooth decay (like head bob on beat)
            const envelope = progress < 0.15
                ? progress / 0.15  // Quick attack
                : Math.pow(1 - (progress - 0.15) / 0.85, 2);  // Smooth return

            // Scale amplitude: 12px default → 0.08 forward motion
            const ampScale = (amplitude / 12) * strength;
            const forward = envelope * 0.08 * ampScale;  // Move toward camera

            return {
                // Z in camera-relative = toward camera (tidally locked!)
                cameraRelativePosition: [0, 0, forward],
                // Slight Y dip for weight feel
                position: [0, -envelope * 0.015 * ampScale, 0],
                // Scale accompaniment
                scale: 1.0 - envelope * 0.05,
                glowIntensity: 1.0 + envelope * 0.15
            };
        }
    }
};
