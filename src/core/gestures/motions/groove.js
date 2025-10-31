/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Groove Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Groove gesture - rhythmic circular swaying motion
 * @author Emotive Engine Team
 * @module gestures/motions/groove
 * @complexity ⭐⭐⭐ Advanced
 * @audience Motion patterns for rhythmic dance-like animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a smooth grooving motion with circular swaying patterns.
 * ║ This is a BLENDING gesture that adds rhythmic dance-like movement.
 * ║ Perfect for music-synchronized animations and dance expressions.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ○ Groove Pattern
 *      ↗   ↖     ↗   ↖
 *     ⭐  →  ⭐  →  ⭐
 *      ↘   ↙     ↘   ↙
 *         (circular sway)
 *
 * USED BY:
 * - Music-synchronized animations
 * - Dance-like movements
 * - Rhythmic expressions
 * - Celebratory gestures
 */

/**
 * Groove gesture configuration and implementation
 */
export default {
    name: 'groove',
    emoji: '🎵',
    type: 'blending', // Adds to existing motion
    description: 'Rhythmic circular swaying motion',

    // Default configuration
    config: {
        duration: 1000,      // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        amplitude: 25,       // Groove circle radius
        frequency: 2,        // Number of groove cycles
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
     * Apply groove motion to particle
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

        // Circular groove pattern - like a dance move
        const angle = progress * Math.PI * 2 * frequency;
        const grooveX = Math.sin(angle) * amplitude;
        const grooveY = Math.cos(angle) * amplitude * 0.5; // Elliptical, not circular

        // Apply groove motion to velocity
        particle.vx += grooveX * 0.03 * dt * strength;
        particle.vy += grooveY * 0.03 * dt * strength;
    },

    /**
     * 3D core transformation for groove gesture
     * Looping motion with side-to-side and forward/back movement
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;
            const frequency = 2;

            // Looping motion: comes toward camera, moves right, goes back, moves left
            const angle = progress * Math.PI * 2 * frequency;
            const xPosition = Math.sin(angle) * 0.3 * strength;  // Side to side
            const zPosition = Math.cos(angle) * 0.4 * strength;  // Forward/back (toward/away from camera)
            const yRotation = Math.sin(angle) * 0.2 * strength;  // Turn as it grooves

            return {
                position: [xPosition, 0, zPosition],
                rotation: [0, yRotation, 0],
                scale: 1.0
            };
        }
    }
};
