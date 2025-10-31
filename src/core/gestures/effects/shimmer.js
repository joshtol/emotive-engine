/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shimmer Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shimmer gesture - wave-like sparkling effect
 * @author Emotive Engine Team
 * @module gestures/effects/shimmer
 * @complexity ⭐⭐⭐ Advanced
 * @audience Good examples for creating wave-based shimmer effects
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a shimmering effect with wave-like sparkle propagation.
 * ║ This is an OVERRIDE gesture that creates radiant glittering patterns.
 * ║ Particles shimmer in waves with cascading brightness variations.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        🌟 Shimmer Pattern
 *      ✦ ★ ✦     ✦ ★ ✦
 *     ★ ✦ ★ ✦ ★ ✦ ★
 *      ✦ ★ ✦     ✦ ★ ✦
 *      (wave propagation)
 *
 * USED BY:
 * - Magical, ethereal effects
 * - Attention highlights
 * - Celebratory moments
 * - Radiant expressions
 */

/**
 * Shimmer gesture configuration and implementation
 */
export default {
    name: 'shimmer',
    emoji: '🌟',
    type: 'particle',  // Particle type to affect particle behavior
    description: 'Shimmer effect with sparkling particles',

    // Default configuration
    config: {
        duration: 2000,  // Legacy fallback
        musicalDuration: { musical: true, bars: 1 }, // 1 bar (4 beats)
        particleMotion: 'radiant',  // Use radiant behavior for shimmering effect
        waveFrequency: 3,     // Wave propagation speed
        shimmerSpeed: 10,     // Individual shimmer speed
        minOpacity: 0.4,      // Minimum brightness
        maxOpacity: 1.0,      // Maximum brightness
        waveAmplitude: 0.6,   // Wave strength
        strength: 1.0         // Overall intensity
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncType: 'beat',
        durationSync: { mode: 'bars', bars: 1 }, // Musical: 1 bar
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

        // Calculate distance from center for wave propagation
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        particle.gestureData.shimmer = {
            baseOpacity: particle.opacity || particle.life || 1,
            baseScale: particle.scale || 1,
            distance,
            phaseOffset: Math.random() * Math.PI * 2, // Random shimmer phase
            waveOffset: distance * 0.02,               // Wave propagation based on distance
            shimmerSpeed: 0.8 + Math.random() * 0.4,  // Variation in shimmer speed
            initialized: true
        };
    },

    /**
     * Apply shimmer effect to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    override(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.shimmer?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.shimmer;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;

        // Wave propagation from center
        const wavePhase = (progress * config.waveFrequency + data.waveOffset) * Math.PI * 2;
        const wave = Math.sin(wavePhase) * 0.5 + 0.5; // 0-1 range

        // Individual particle shimmer
        const shimmerPhase = (progress * config.shimmerSpeed * data.shimmerSpeed + data.phaseOffset) * Math.PI * 2;
        const shimmer = Math.sin(shimmerPhase) * 0.5 + 0.5; // 0-1 range

        // Combine wave and shimmer
        const combined = wave * config.waveAmplitude + shimmer * (1 - config.waveAmplitude);

        // Apply to opacity
        const opacityRange = config.maxOpacity - config.minOpacity;
        particle.opacity = data.baseOpacity * (config.minOpacity + combined * opacityRange * strength);

        // Update life for particles that use it instead of opacity
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }

        // Subtle scale variation
        particle.scale = data.baseScale * (0.9 + combined * 0.2 * strength);

        // Mark shimmer effect active
        particle.shimmerEffect = true;
        particle.shimmerProgress = progress;

        return true;
    },

    /**
     * Blend with other gestures
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} params - Additional parameters
     * @returns {boolean} Always returns false (handled by override)
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
        if (particle.gestureData?.shimmer) {
            const data = particle.gestureData.shimmer;
            particle.opacity = data.baseOpacity;
            particle.scale = data.baseScale;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            particle.shimmerEffect = false;
            delete particle.gestureData.shimmer;
        }
    },

    /**
     * 3D core transformation for shimmer gesture
     * Gentle rotation with glow pulsing
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;
            const frequency = 3;

            // Wave shimmer
            const wave = Math.sin(progress * Math.PI * 2 * frequency);

            // Gentle rotation
            const yRotation = progress * Math.PI * 2 * 0.3 * strength;

            // Pulsing glow
            const glowIntensity = 1.0 + (wave * 0.5 + 0.5) * 0.8 * strength;

            // Subtle scale pulse
            const scale = 1.0 + (wave * 0.5 + 0.5) * 0.1 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, yRotation, 0],
                scale,
                glowIntensity
            };
        }
    }
};
