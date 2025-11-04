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
 *      ↓⭐↑ ↓⭐↑ ↓⭐↑
 *      (bobbing to music)
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
        frequency: 3,           // 3 bobs per gesture
        strength: 1.0,          // Motion intensity
        damping: 0.2,           // Velocity damping (keeps energy up)
        easing: 'linear',       // Animation curve - steady rhythm
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'headBob',
            strength: 1.0,
            amplitude: 12,
            frequency: 3
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
     * Maps rhythmic head bob to X-axis rotation (pitch) with tight, musical timing
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} Transform with position, rotation, scale
         */
        evaluate(progress, motion) {
            const config = motion.config || {};
            const strength = motion.strength || 1.0;
            const amplitude = config.amplitude || 12; // pixels
            const frequency = config.frequency || 3; // 3 bobs
            const damping = config.damping || 0.2;

            // Quick rhythmic oscillation
            const oscillation = Math.sin(progress * Math.PI * 2 * frequency);

            // Minimal damping - keep energy up for musical feel
            const envelope = 1 - (progress * damping);

            // X-axis rotation (pitch) - quicker and tighter than regular nod
            // Scale from pixels: 12px → ~0.5 radians (~28°) for visible bob
            const pitchRotation = oscillation * (amplitude * 0.045) * strength * envelope;

            // Slight vertical position shift for emphasis
            const PIXEL_TO_3D = 0.008; // 12px = 0.096 units
            const yPosition = -oscillation * amplitude * PIXEL_TO_3D * strength * envelope;

            return {
                position: [0, yPosition, 0],
                rotation: [pitchRotation, 0, 0],
                scale: 1.0
            };
        }
    }
};
