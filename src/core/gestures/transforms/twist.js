/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Twist Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Twist gesture - alternating rotational dance motion
 * @author Emotive Engine Team
 * @module gestures/transforms/twist
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a twisting dance motion with alternating rotation and contraction.
 * ║ This is an OVERRIDE gesture that replaces existing particle motion.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *     ↻ ⭐ ↺      <- twist left/right
 *    ╱     ╲
 *   ⭐       ⭐    <- particles contract
 *    ╲     ╱
 *     ↺ ⭐ ↻      <- twist opposite
 *
 * USED BY:
 * - Dance gestures
 * - Playful emotions
 * - Music synchronization
 */

/**
 * Twist gesture configuration and implementation
 */
export default {
    name: 'twist',
    emoji: '🌀',
    type: 'override', // Replaces existing motion
    description: 'Twisting dance motion with alternating rotation',

    // Default configuration
    config: {
        duration: 1200,      // Animation duration
        rotationAngle: 45,   // Max rotation angle in degrees
        contractionFactor: 0.8, // How much to contract during twist
        twistFrequency: 2,   // Number of twist cycles
        easing: 'smooth',    // Animation curve type
        strength: 0.8,       // Overall motion intensity
        // Particle motion configuration
        particleMotion: {
            type: 'twist',
            rotationAngle: 45,
            contractionFactor: 0.8,
            twistFrequency: 2
        }
    },

    // Rhythm configuration - twist syncs to beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        interruptible: true,
        priority: 4,
        blendable: false,  // Override gesture, no blending
        crossfadePoint: 'anyBeat',

        // Twist intensity syncs to beat
        amplitudeSync: {
            onBeat: 1.5,      // Stronger twist on beat
            offBeat: 0.7,     // Lighter between beats
            curve: 'elastic'  // Bouncy twist motion
        },

        // Pattern-specific twisting styles
        patternOverrides: {
            'funk': {
                // Funky twist with more rotation
                rotationAngle: 60,
                contractionFactor: 0.7
            },
            'disco': {
                // Classic disco twist
                twistFrequency: 3,
                rotationAngle: 50
            },
            'latin': {
                // Latin-style hip twist
                rotationAngle: 35,
                contractionFactor: 0.85,
                twistFrequency: 2.5
            }
        }
    },

    /**
     * Initialize gesture data for a particle
     */
    initialize(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        particle.gestureData.twist = {
            startX: particle.x,
            startY: particle.y,
            startAngle: Math.atan2(particle.y - motion.centerY, particle.x - motion.centerX),
            startDistance: Math.sqrt(
                Math.pow(particle.x - motion.centerX, 2) +
                Math.pow(particle.y - motion.centerY, 2)
            ),
            initialized: true
        };
    },

    /**
     * Apply twist motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.twist?.initialized) {
            this.initialize(particle, { ...motion, centerX, centerY });
        }

        const config = { ...this.config, ...motion };
        const data = particle.gestureData.twist;
        const strength = config.strength || this.config.strength || 1.0;

        // Calculate twist oscillation
        const twistProgress = progress * config.twistFrequency * Math.PI * 2;
        const twistAmount = Math.sin(twistProgress) * strength;

        // Apply rhythm modulation if present
        let {rotationAngle} = config;
        let {contractionFactor} = config;

        if (motion.rhythmModulation) {
            rotationAngle *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            contractionFactor = 1 - ((1 - contractionFactor) * (motion.rhythmModulation.amplitudeMultiplier || 1));
        }

        // Convert rotation to radians
        const rotationRad = (rotationAngle * Math.PI / 180) * twistAmount;

        // Calculate contraction (pull particles closer during twist)
        const currentContraction = 1 - ((1 - contractionFactor) * Math.abs(twistAmount));

        // Apply twist transformation
        const newAngle = data.startAngle + rotationRad;
        const newDistance = data.startDistance * currentContraction;

        // Calculate new position
        const targetX = centerX + Math.cos(newAngle) * newDistance;
        const targetY = centerY + Math.sin(newAngle) * newDistance;

        // Smoothly move to target position
        const moveStrength = 0.15 * strength;
        particle.x += (targetX - particle.x) * moveStrength;
        particle.y += (targetY - particle.y) * moveStrength;

        // Add some velocity for fluid motion
        particle.vx = (targetX - particle.x) * 0.05;
        particle.vy = (targetY - particle.y) * 0.05;

        // Add slight vertical bounce for more dynamic feel
        const bounceAmount = Math.sin(progress * Math.PI * 4) * 5 * strength;
        particle.y += bounceAmount * 0.1;

        // Smooth ending
        if (progress > 0.9) {
            const endFactor = 1 - ((progress - 0.9) * 10);
            particle.vx *= endFactor;
            particle.vy *= endFactor;
        }

    },

    /**
     * Clean up gesture data when complete
     */
    cleanup(particle) {
        if (particle.gestureData?.twist) {
            delete particle.gestureData.twist;
        }
    }
};