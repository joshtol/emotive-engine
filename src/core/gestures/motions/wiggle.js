/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wiggle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Quick side-to-side wiggling motion for playful/sassy states
 * @author Emotive Engine Team
 * @module gestures/motions/wiggle
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 *
 * GESTURE TYPE:
 * type: 'blending' - Adds to existing particle motion
 *
 * VISUAL EFFECT:
 * Fast oscillating side-to-side movement with slight vertical bounce.
 * Creates a playful, sassy, or excited feeling with rhythmic wiggling.
 */

export default {
    name: 'wiggle',
    type: 'blending',
    emoji: '〰️',
    description: 'Quick side-to-side wiggling motion',

    // Default configuration
    config: {
        duration: 800,          // Animation duration (ms)
        amplitude: 15,          // Wiggle distance
        frequency: 6,           // Oscillations per gesture
        easing: 'linear',       // Animation curve type
        strength: 0.8           // Overall motion intensity
    },

    // Rhythm configuration - wiggle can follow fast beats
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Wiggle happens on beats

        // Wiggle intensity on beats
        amplitudeSync: {
            onBeat: 1.5,
            offBeat: 0.8,
            curve: 'sharp'  // Quick transitions for wiggle
        },

        // Duration syncs to beats
        durationSync: {
            mode: 'beats',
            beats: 2  // Two beats per wiggle
        },

        // Pattern-specific wiggling
        patternOverrides: {
            'disco': {
                amplitudeSync: { onBeat: 2.0, curve: 'bounce' }
            },
            'funk': {
                frequency: 8,  // Extra fast wiggle for funk
                amplitudeSync: { onBeat: 1.8, offBeat: 0.6 }
            }
        }
    },

    /**
     * Apply wiggle motion to particle
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

        // Fast oscillating wiggle - HORIZONTAL ONLY (side to side)
        const wiggle = Math.sin(progress * Math.PI * 2 * frequency) * amplitude;

        // Apply horizontal wiggle (left-right motion)
        particle.vx += wiggle * 0.05 * dt * strength;  // Increased from 0.015 to 0.05 for visibility

        // NO vertical motion - wiggle is purely horizontal side-to-side
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(_particle) {
        // No cleanup needed for wiggle
    },

    /**
     * 3D translation for wiggle gesture
     * Pure side-to-side horizontal motion matching 2D behavior
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            let amplitude = config.amplitude || this.config.amplitude;
            const frequency = config.frequency || this.config.frequency;
            const strength = config.strength || this.config.strength;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Fast oscillation - creates wiggling motion
            const oscillation = Math.sin(progress * Math.PI * 2 * frequency);

            // Pure side-to-side position movement (left-right)
            // X was vertical (nodding), trying Y axis for horizontal
            const wiggleAmount = amplitude * strength * 2.0;  // Much larger for clear visibility
            const posY = oscillation * wiggleAmount;

            return {
                position: [0, posY * 0.25, 0],  // Y movement - testing for horizontal side-to-side
                rotation: [0, 0, 0],  // No rotation - pure position wiggle like 2D
                scale: 1.0
            };
        }
    }
};
