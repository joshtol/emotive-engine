/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sparkle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sparkle gesture - twinkling star effect
 * @author Emotive Engine Team
 * @module gestures/effects/sparkle
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating sparkle effects
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a sparkling, twinkling effect with rapid scale and opacity changes.
 * ║ This is an OVERRIDE gesture that makes particles shimmer like stars.
 * ║ Particles scale up and down with rapid brightness variations.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ✨ Sparkle Pattern
 *      ★ ✦ ★     ✦ ★ ✦
 *     ✦   ★   ✦ ★   ✦
 *      ★ ✦ ★     ✦ ★ ✦
 *         (twinkling)
 *
 * USED BY:
 * - Magical effects
 * - Celebratory moments
 * - Attention-grabbing highlights
 * - Joyful expressions
 */

/**
 * Sparkle gesture configuration and implementation
 */
export default {
    name: 'sparkle',
    emoji: '✨',
    type: 'override', // Completely replaces motion
    description: 'Twinkling star effect with rapid shimmer',

    // Default configuration
    config: {
        // Musical duration - sparkle bursts for 2 beats
        musicalDuration: {
            musical: true,
            beats: 2,           // Default to 2 beats
            minBeats: 1,        // Minimum 1 beat
            maxBeats: 8         // Maximum 2 bars
        },

        sparkleFrequency: 8,    // How many twinkles per cycle
        minScale: 0.5,          // Smallest scale during twinkle
        maxScale: 1.8,          // Largest scale during twinkle
        minOpacity: 0.3,        // Dimmest opacity
        maxOpacity: 1.0,        // Brightest opacity
        randomOffset: 0.5,      // Random phase offset between particles
        expansionRadius: 15,    // Small outward movement
        strength: 1.0           // Overall effect intensity
    },

    // Rhythm configuration - sparkles synchronized to beats
    rhythm: {
        enabled: true,
        syncMode: 'beat',    // Sync to beat hits

        // Timing sync
        timingSync: 'nextBeat',

        // Duration automatically syncs to beats via musicalDuration config
        durationSync: {
            mode: 'beats',        // Uses beats from musicalDuration
            beats: 2
        },

        // Interruptible settings
        interruptible: true,
        priority: 3,
        blendable: true,
        crossfadePoint: 'anyBeat',
        maxQueue: 3
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

        particle.gestureData.sparkle = {
            baseOpacity: particle.opacity || particle.life || 1,
            baseScale: particle.scale || 1,
            phaseOffset: Math.random() * Math.PI * 2, // Random twinkle timing
            twinkleSpeed: 0.8 + Math.random() * 0.4,  // Variation in twinkle speed
            initialized: true
        };
    },

    /**
     * Apply sparkle effect to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.sparkle?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.sparkle;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;

        // Calculate sparkle phase with random offset
        const sparklePhase = (progress * config.sparkleFrequency * data.twinkleSpeed + data.phaseOffset) % (Math.PI * 2);

        // Rapid twinkle using sine wave
        const twinkle = Math.sin(sparklePhase);

        // Scale oscillates rapidly
        const scaleRange = config.maxScale - config.minScale;
        const scale = config.minScale + (twinkle * 0.5 + 0.5) * scaleRange * strength;
        particle.scale = data.baseScale * scale;

        // Opacity twinkles (slightly offset from scale for more dynamic effect)
        const opacityPhase = sparklePhase + Math.PI * 0.3;
        const opacityTwinkle = Math.sin(opacityPhase);
        const opacityRange = config.maxOpacity - config.minOpacity;
        const opacity = config.minOpacity + (opacityTwinkle * 0.5 + 0.5) * opacityRange;
        particle.opacity = data.baseOpacity * opacity;

        // Update life for particles that use it instead of opacity
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }

        // No position changes - sparkle is purely visual (scale + opacity)
        // Particles stay in place and just twinkle

        // Smooth ending - restore original state
        if (progress >= 0.95) {
            const endFactor = (1 - progress) * 20;
            particle.opacity = data.baseOpacity * endFactor + particle.opacity * (1 - endFactor);
            particle.scale = data.baseScale * endFactor + particle.scale * (1 - endFactor);

            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
        }
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.sparkle) {
            const data = particle.gestureData.sparkle;
            particle.opacity = data.baseOpacity;
            particle.scale = data.baseScale;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            delete particle.gestureData.sparkle;
        }
    },

    /**
     * 3D core transformation for sparkle gesture
     * No core changes - sparkle is ONLY a particle effect
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            // Sparkle is purely a particle effect - core stays neutral
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0
            };
        }
    }
};
