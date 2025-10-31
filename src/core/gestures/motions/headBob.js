/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Head Bob Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Head bob gesture - rhythmic vertical nodding
 * @author Emotive Engine Team
 * @module gestures/motions/headBob
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for music-synchronized bobbing animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a rhythmic head-bobbing motion synchronized to music beats.
 * ║ This is a BLENDING gesture that adds music-reactive nodding.
 * ║ Perfect for music listening, dancing, or grooving expressions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ○ Bob Pattern
 *       ⭐ ↓ ⭐ ↓ ⭐
 *        ↑   ↑   ↑
 *       ⭐   ⭐   ⭐
 *      (rhythmic bobbing)
 *
 * USED BY:
 * - Music-reactive animations
 * - Dancing expressions
 * - Grooving to beat
 * - Affirmative nodding
 */

/**
 * Head bob gesture configuration and implementation
 */
export default {
    name: 'headBob',
    emoji: '🎧',
    type: 'blending', // Adds to existing motion
    description: 'Rhythmic vertical bobbing to music',

    // Default configuration
    config: {
        duration: 1000,      // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 20,       // Bob distance
        frequency: 2,        // Bobs per cycle
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
     * Apply head bob motion to particle
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
        const frequency = config.frequency || this.config.frequency;
        const strength = config.strength || this.config.strength;

        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
        }

        // Rhythmic bobbing motion - vertical oscillation
        const bob = Math.sin(progress * Math.PI * 2 * frequency);
        const bobAmount = bob * amplitude;

        // Apply vertical bob
        particle.vy += bobAmount * 0.04 * dt * strength;

        // Slight horizontal sway accompanying the bob (for naturalness)
        const sway = Math.cos(progress * Math.PI * 2 * frequency) * amplitude * 0.2;
        particle.vx += sway * 0.02 * dt * strength;
    },

    /**
     * 3D core transformation for head bob gesture
     * Vertical bobbing with pitch rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;
            const frequency = 2;

            // Rhythmic bobbing
            const bob = Math.sin(progress * Math.PI * 2 * frequency);
            const yPosition = bob * 0.15 * strength * 0.25;
            const xRotation = bob * 0.08 * strength * 0.25;  // Pitch rotation (nod)

            return {
                position: [0, yPosition, 0],
                rotation: [xRotation, 0, 0],
                scale: 1.0
            };
        }
    }
};
