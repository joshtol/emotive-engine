/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lean Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lean gesture - side-to-side tilting motion
 * @author Emotive Engine Team
 * @module gestures/motions/lean
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for tilting and leaning animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a leaning/tilting motion with side-to-side sway.
 * ║ This is a BLENDING gesture that adds casual, relaxed movement.
 * ║ Perfect for cool, laid-back, or curious expressions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↗ Lean Pattern ↖
 *       ⭐        ⭐
 *      /          \
 *     /            \
 *         (tilting)
 *
 * USED BY:
 * - Casual, relaxed expressions
 * - Curious head tilts
 * - Cool, laid-back animations
 * - Contemplative gestures
 */

/**
 * Lean gesture configuration and implementation
 */
export default {
    name: 'lean',
    emoji: '↗️',
    type: 'blending', // Adds to existing motion
    description: 'Side-to-side tilting motion',

    // Default configuration
    config: {
        duration: 1000,      // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 18,       // Lean angle/distance
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
     * Apply lean motion to particle
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

        // Lean motion - smooth tilt to the side
        const leanProgress = Math.sin(progress * Math.PI);
        const lean = leanProgress * amplitude;

        // Apply horizontal lean (side to side)
        particle.vx += lean * 0.035 * dt * strength;

        // Slight vertical adjustment for natural lean
        const verticalAdjust = Math.abs(leanProgress) * amplitude * 0.2;
        particle.vy -= verticalAdjust * 0.015 * dt * strength;
    },

    /**
     * 3D core transformation for lean gesture
     * Side tilt with roll rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;

            // Lean to the side with roll rotation
            const leanProgress = Math.sin(progress * Math.PI);
            const zRotation = leanProgress * 0.4 * strength;  // Z rotation for side lean

            // Slight horizontal position shift
            const xPosition = leanProgress * 0.15 * strength;

            return {
                position: [xPosition, 0, 0],
                rotation: [0, 0, zRotation],
                scale: 1.0
            };
        }
    }
};
