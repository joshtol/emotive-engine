/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rain Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Rain gesture - particles fall down from current position
 * @author Emotive Engine Team
 * @module gestures/effects/rain
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Takes particles from wherever they currently are and makes them fall downward.
 * ║ Complete override of particle behavior - no emotion/motion interference.
 * ║ The mascot stays completely still while particles rain down.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *      · · · · ·     Particles at current positions
 *      | | | | |
 *      | | | | |     Falling down from where they are
 *         ⭐          Mascot stays still
 *      | | | | |
 *      v v v v v     Particles fall off screen
 *
 * USED BY:
 * - Sad/melancholy states
 * - Weather effects
 * - Dramatic moments
 * - Cleansing/refreshing emotions
 */

export default {
    name: 'rain',
    emoji: '🌧️',
    type: 'override', // Complete override - particles fall as rain
    description: 'Particles fall down from their current positions',

    // Default configuration
    config: {
        duration: 3000, // Legacy fallback
        musicalDuration: { musical: true, bars: 2 }, // 2 bars (8 beats)
        fallSpeed: 8.0, // How fast drops fall (pixels per frame)
        fallDistance: 400, // How far particles fall total
        wobbleAmount: 1.5, // Wind wobble intensity
        strength: 1.0,
        // Particle motion configuration
        particleMotion: {
            type: 'rain',
            strength: 1.0,
            fallSpeed: 8.0,
        },
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncMode: 'ambient',
        durationSync: { mode: 'bars', bars: 2 },

        // Rain intensity varies with dynamics
        intensitySync: {
            quiet: 0.5, // Light drizzle
            loud: 1.5, // Heavy downpour
            crescendo: 'increase',
            diminuendo: 'decrease',
        },
    },

    /**
     * Initialize rain data for a particle - capture current position
     */
    initialize(particle, _motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        // Store original state - particle starts from wherever it currently is
        particle.gestureData.rain = {
            originalX: particle.x,
            originalY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            originalOpacity: particle.opacity ?? particle.life ?? 1,
            // Start falling from current position
            currentX: particle.x,
            currentY: particle.y,
            // Wind wobble
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.3 + Math.random() * 0.4,
            initialized: true,
        };
    },

    /**
     * Apply rain motion - particles fall down from their captured positions
     */
    apply(particle, progress, motion, dt) {
        // dt may be undefined in 3D renderer - default to 1
        const safeDt = typeof dt === 'number' ? dt : 1;

        // Initialize on first frame - capture current position
        if (!particle.gestureData?.rain?.initialized) {
            this.initialize(particle, motion);
        }

        const data = particle.gestureData.rain;
        const config = { ...this.config, ...motion };
        const strength = motion?.strength || 1.0;
        const fallSpeed = (config.fallSpeed || 8.0) * strength;

        // Calculate total fall based on progress
        const fallDistance = config.fallDistance || 400;
        const totalFall = fallDistance * progress * strength;

        // Wind wobble - use safe dt
        data.wobblePhase += data.wobbleSpeed * safeDt * 0.1;
        const wobble = Math.sin(data.wobblePhase) * (config.wobbleAmount || 1.5);

        // DIRECTLY set particle position - fall from original position
        particle.x = data.originalX + wobble;
        particle.y = data.originalY + totalFall;

        // Set velocity to match falling direction (for trail effects)
        particle.vx = wobble * 0.3;
        particle.vy = fallSpeed * 10;

        // Fade out as particles fall
        const fadeStart = 0.6;
        if (progress > fadeStart) {
            const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
            particle.opacity = data.originalOpacity * (1 - fadeProgress);
            if (particle.life !== undefined) {
                particle.life = data.originalOpacity * (1 - fadeProgress);
            }
        } else {
            particle.opacity = data.originalOpacity;
            if (particle.life !== undefined) {
                particle.life = data.originalOpacity;
            }
        }
    },

    /**
     * Clean up rain data when complete - restore original positions
     */
    cleanup(particle) {
        if (particle.gestureData?.rain) {
            const data = particle.gestureData.rain;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.opacity = data.originalOpacity;
            if (particle.life !== undefined) {
                particle.life = data.originalOpacity;
            }
            delete particle.gestureData.rain;
        }
    },

    /**
     * 3D transformation for rain gesture
     * Mascot stays completely still - only particles move
     */
    '3d': {
        evaluate(_progress, _motion) {
            // Mascot does NOT move during rain - only particles rain down
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
            };
        },
    },
};
