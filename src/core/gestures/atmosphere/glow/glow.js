/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Glow gesture - based on pulse but focused on luminosity without movement
 * @author Emotive Engine Team
 * @module gestures/effects/glow
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a pure luminous glow effect without particle movement.
 * ║ This is a BLENDING gesture that only modifies brightness/glow.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *      Dim            Bright           Dim
 *    · · · ·         ✨ ✨ ✨         · · · ·
 *    · · ⭐ · ·   →  ✨ 🌟 ✨    →   · · ⭐ · ·
 *    · · · ·         ✨ ✨ ✨         · · · ·
 *
 * USED BY:
 * - Emphasis effects
 * - Magic/mystical states
 * - Energy charging
 */

/**
 * Glow gesture configuration and implementation
 */
export default {
    name: 'glow',
    emoji: '✨',
    type: 'blending', // Adds to existing motion
    description: 'Pure luminous glow without movement',

    // Default configuration
    config: {
        duration: 1500,      // Animation duration (longer than pulse for sustained glow)
        amplitude: 0,        // NO expansion distance (removed from pulse)
        frequency: 1,        // Number of glow pulses
        holdPeak: 0.3,       // Peak glow hold time (longer for sustained effect)
        easing: 'sine',      // Animation curve type
        scaleAmount: 0.1,    // Very subtle orb scale variation (reduced from pulse)
        glowAmount: 0.8,     // Strong orb glow intensity change (increased from pulse)
        strength: 0,         // NO particle motion strength (removed from pulse)
        direction: 'none',   // No movement direction
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'glow',
            strength: 0,     // No particle movement
            direction: 'none',
            frequency: 1
        }
    },

    // Rhythm configuration - glow pulses with musical phrases
    rhythm: {
        enabled: true,
        syncMode: 'phrase',  // Glow on musical phrases

        // Glow strength syncs to dynamics
        amplitudeSync: {
            onBeat: 2.0,      // Strong glow on beat
            offBeat: 1.2,     // Sustained glow off beat
            curve: 'smooth'   // Smooth transitions
        },

        // Frequency locks to phrase length
        frequencySync: {
            mode: 'phrase',
            subdivision: 'bar'
        },

        // Duration in musical time
        durationSync: {
            mode: 'bars',
            bars: 2           // Glow over 2 bars
        },

        // Stronger glow on accents
        accentResponse: {
            enabled: true,
            multiplier: 2.5   // Bright glow on accent
        },

        // Pattern-specific glow styles
        patternOverrides: {
            'ambient': {
                // Ethereal sustained glow
                amplitudeSync: { onBeat: 2.5, offBeat: 1.8 },
                durationSync: { bars: 4 }
            },
            'electronic': {
                // Pulsing neon glow
                amplitudeSync: { onBeat: 3.0, offBeat: 0.5, curve: 'sharp' },
                frequencySync: { subdivision: 'quarter' }
            }
        }
    },

    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, _motion, _centerX, _centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        // Store initial state (no position data needed for glow)
        particle.gestureData.glow = {
            startOpacity: particle.opacity,
            startGlow: particle.glowSizeMultiplier || 0,
            initialized: true
        };
    },

    /**
     * Apply glow effect to particle (no motion, just luminosity)
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.glow?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }


        const config = { ...this.config, ...motion };

        // Apply easing
        const easeProgress = this.easeInOutSine(progress);

        // Calculate glow pulse with peak hold
        let glowValue;
        let {frequency} = config;
        let {glowAmount} = config;

        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            glowAmount *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            glowAmount *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }

        const rawPulse = (easeProgress * frequency * 2) % 2;

        if (config.holdPeak > 0 && rawPulse > (1 - config.holdPeak) && rawPulse < (1 + config.holdPeak)) {
            // Hold at peak glow
            glowValue = 1;
        } else {
            // Normal sine wave for glow
            glowValue = Math.sin(easeProgress * Math.PI * 2 * frequency);
        }

        // NO PARTICLE MOVEMENT - just glow effects
        // Unlike pulse, we don't calculate target positions or apply velocity

        // Apply glow fade effect at the end
        let glowMultiplier = 1;
        if (progress > 0.9) {
            const fadeFactor = 1 - ((progress - 0.9) * 10);
            glowMultiplier = (0.5 + fadeFactor * 0.5);
        }

        // Modify particle glow properties (if your system supports it)
        // This is where the actual glow effect happens
        // Note: The actual visual implementation depends on your renderer
        // Set glow intensity directly, don't multiply to prevent accumulation
        particle.glowIntensity = 1 + glowValue * glowAmount * glowMultiplier;
    },

    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.glow) {
            // Reset any glow properties
            particle.glowIntensity = 1;
            delete particle.gestureData.glow;
        }
    },

    /**
     * Sine easing for smooth glow transitions
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    /**
     * 3D core transformation for glow gesture
     * GlowIntensity increase without movement
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number, glowBoost: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

            // Calculate glow pulse - single rise and fall (not oscillating)
            // Use sin(progress * π) to go: 0 → 1 → 0 (single pulse)
            const glowValue = Math.sin(easeProgress * Math.PI);
            let glowAmount = config.glowAmount || 0.8;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                glowAmount *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                glowAmount *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Glow adds brightness (doesn't go negative)
            // Maps 0→1→0 to 0%→+80%→0% intensity increase
            const glowIntensity = 1.0 + (glowValue * glowAmount);

            // Very subtle scale
            const scaleAmount = config.scaleAmount || 0.1;
            const scale = 1.0 + glowValue * scaleAmount * 0.5;

            // Glow boost for isolated screen-space halo effect
            // Peaks at 1.5 intensity for a dramatic, visible halo
            const glowBoost = glowValue * 1.5;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};