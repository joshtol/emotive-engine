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
 * @audience Motion patterns for directional animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a pointing gesture with forward extension and slight tilt.
 * ║ This is a BLENDING gesture that adds directional emphasis.
 * ║ Perfect for attention-directing and UI interaction hints.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        → Point Pattern
 *     ⭐ → ⭐⭐ → ⭐⭐⭐
 *         (extending forward)
 *
 * USED BY:
 * - UI hints and tooltips
 * - Attention directing
 * - Interactive tutorials
 * - Call-to-action emphasis
 */

/**
 * Point gesture configuration and implementation
 */
export default {
    name: 'point',
    emoji: '👉',
    type: 'blending', // Adds to existing motion
    description: 'Directional pointing with extension',

    // Default configuration
    config: {
        duration: 800,       // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 20,       // Extension distance
        strength: 1.0        // Overall intensity
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 3,
        blendable: true,
        crossfadePoint: 'anyBeat',
        maxQueue: 3
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
        const config = { ...this.config, ...motion };
        let amplitude = config.amplitude || this.config.amplitude;
        const strength = config.strength || this.config.strength;

        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
        }

        // Pointing motion - extend outward then return
        // Use sine wave for smooth in-out motion
        const pointProgress = Math.sin(progress * Math.PI);
        const extension = pointProgress * amplitude;

        // Apply horizontal extension (pointing right)
        particle.vx += extension * 0.04 * dt * strength;

        // Slight upward tilt as it points
        const tilt = pointProgress * amplitude * 0.3;
        particle.vy -= tilt * 0.02 * dt * strength;
    },

    /**
     * 3D core transformation for point gesture
     * Forward extension with slight rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;

            // Pointing motion - extend forward
            const pointProgress = Math.sin(progress * Math.PI);
            const zPosition = pointProgress * 0.4 * strength; // Forward toward camera
            const xPosition = pointProgress * 0.2 * strength; // Slight right
            const yRotation = pointProgress * 0.15 * strength; // Slight turn

            // Scale up slightly during point
            const scale = 1.0 + pointProgress * 0.1 * strength;

            return {
                position: [xPosition, 0, zPosition],
                rotation: [0, yRotation, 0],
                scale
            };
        }
    }
};
