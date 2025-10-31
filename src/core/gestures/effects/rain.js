/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rain Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Rain gesture - falling droplet effect
 * @author Emotive Engine Team
 * @module gestures/effects/rain
 * @complexity ⭐⭐⭐ Advanced
 * @audience Good examples for creating falling particle effects
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a rain effect with falling particles and doppler behavior.
 * ║ This is a PARTICLE gesture that applies falling motion to particles.
 * ║ Particles fall downward with varying speeds and fade effects.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        🌧️ Rain Pattern
 *       ⭐ ⭐ ⭐ ⭐ ⭐
 *        ↓  ↓  ↓  ↓  ↓
 *       ⭐ ⭐ ⭐ ⭐ ⭐
 *        ↓  ↓  ↓  ↓  ↓
 *       ⭐ ⭐ ⭐ ⭐ ⭐
 *         (falling)
 *
 * USED BY:
 * - Weather effects
 * - Melancholy expressions
 * - Atmospheric backgrounds
 * - Transition effects
 */

/**
 * Rain gesture configuration and implementation
 */
export default {
    name: 'rain',
    emoji: '🌧️',
    type: 'particle',  // Particle type to affect particle behavior
    description: 'Rain effect with falling particles',

    // Default configuration
    config: {
        duration: 3000,  // Legacy fallback
        musicalDuration: { musical: true, bars: 2 }, // 2 bars (8 beats)
        particleMotion: 'falling',  // Use the falling particle behavior
        fallSpeed: 80,        // Falling velocity
        fallVariation: 0.4,   // Speed variation between particles
        horizontalDrift: 15,  // Slight horizontal drift
        fadeStart: 0.3,       // When particles start fading (0-1)
        minOpacity: 0.2,      // Minimum opacity
        strength: 1.0         // Overall intensity
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncType: 'off-beat',
        durationSync: { mode: 'bars', bars: 2 }, // Musical: 2 bars
        intensity: 0.8
    },

    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        particle.gestureData.rain = {
            startY: particle.y,
            baseOpacity: particle.opacity || particle.life || 1,
            fallSpeedMultiplier: 0.8 + Math.random() * 0.4, // Random fall speed
            driftDirection: Math.random() < 0.5 ? 1 : -1,   // Random drift direction
            driftSpeed: Math.random() * 0.5,                 // Random drift speed
            initialized: true
        };
    },

    /**
     * Apply rain effect to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.rain?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.rain;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;

        // Apply downward falling velocity
        const fallSpeed = config.fallSpeed * data.fallSpeedMultiplier * strength;
        particle.vy += fallSpeed * 0.05 * dt;

        // Apply horizontal drift
        const drift = config.horizontalDrift * data.driftDirection * data.driftSpeed * strength;
        particle.vx += drift * 0.02 * dt;

        // Fade effect as particles fall
        if (progress >= config.fadeStart) {
            const fadeProgress = (progress - config.fadeStart) / (1 - config.fadeStart);
            const opacity = data.baseOpacity * (1 - fadeProgress * (1 - config.minOpacity));
            particle.opacity = Math.max(config.minOpacity, opacity);

            // Update life for particles that use it instead of opacity
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
        }

        // Mark rain effect active
        particle.rainEffect = true;
        particle.rainProgress = progress;

        return true;
    },

    /**
     * Blend with other gestures
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} params - Additional parameters
     * @returns {boolean} Always returns false (handled by apply)
     */
    blend(_particle, _progress, _params) {
        // Blend with other gestures
        return false;
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.rain) {
            const data = particle.gestureData.rain;
            particle.opacity = data.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            particle.rainEffect = false;
            delete particle.gestureData.rain;
        }
    },

    /**
     * 3D core transformation for rain gesture
     * Downward movement with subtle rotation
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;

            // Downward falling motion
            const yPosition = -progress * 0.6 * strength;

            // Slight horizontal drift
            const xPosition = Math.sin(progress * Math.PI * 2) * 0.1 * strength;

            // Subtle rotation as it falls
            const xRotation = progress * 0.2 * strength;

            return {
                position: [xPosition, yPosition, 0],
                rotation: [xRotation, 0, 0],
                scale: 1.0
            };
        }
    }
};
