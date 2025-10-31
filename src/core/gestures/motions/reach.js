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
 * @audience Motion patterns for reaching and stretching animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates an upward reaching motion with vertical extension.
 * ║ This is a BLENDING gesture that adds aspirational upward movement.
 * ║ Perfect for hopeful, eager, or stretching expressions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *           ⭐  ← reaching up
 *          ↗ ↑
 *         ⭐ ↑
 *        ↗  ↑
 *       ⭐   ← starting
 *
 * USED BY:
 * - Hopeful, aspirational expressions
 * - Eager, excited animations
 * - Stretching gestures
 * - Uplifting moments
 */

/**
 * Reach gesture configuration and implementation
 */
export default {
    name: 'reach',
    emoji: '🤚',
    type: 'blending', // Adds to existing motion
    description: 'Upward reaching with extension',

    // Default configuration
    config: {
        duration: 800,       // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 30,       // Reach height
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
     * Apply reach motion to particle
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

        // Reach motion - extend upward then return
        // Use sine wave for smooth in-out motion
        const reachProgress = Math.sin(progress * Math.PI);
        const extension = reachProgress * amplitude;

        // Apply upward reach (negative Y is up)
        particle.vy -= extension * 0.04 * dt * strength;

        // Slight outward expansion as it reaches
        const expansion = reachProgress * amplitude * 0.2;
        particle.vx += expansion * 0.015 * dt * strength;
    },

    /**
     * 3D core transformation for reach gesture
     * Upward extension with scale increase
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;

            // Reaching motion - extend upward
            const reachProgress = Math.sin(progress * Math.PI);
            const yPosition = reachProgress * 0.3 * strength * 0.25;

            // Scale up as it reaches
            const scale = 1.0 + reachProgress * 0.1;

            return {
                position: [0, yPosition, 0],
                rotation: [0, 0, 0],
                scale
            };
        }
    }
};
