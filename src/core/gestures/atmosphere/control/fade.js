/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fade Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fade gesture - opacity fade effect
 * @author Emotive Engine Team
 * @module gestures/effects/fade
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'fade',
    emoji: '👻',
    type: 'blending',
    description: 'Fade particle opacity',

    // Default configuration
    config: {
        duration: 2000, // Legacy fallback
        musicalDuration: { musical: true, bars: 1 }, // 1 bar (4 beats)
        fadeIn: true, // Enable fade in effect (for fade-out-and-back)
        fadeOut: true, // Enable fade out effect
        minOpacity: 0, // Minimum opacity level
        maxOpacity: 1, // Maximum opacity level
    },

    // Rhythm configuration - fades sync to musical dynamics
    rhythm: {
        enabled: true,
        syncMode: 'dynamic', // Fade with volume/intensity changes
        durationSync: { mode: 'bars', bars: 1 }, // 1 bar duration

        // Opacity modulation with beat
        opacitySync: {
            onBeat: 0.9, // Nearly visible on beat
            offBeat: 0.3, // Ghostly between beats
            subdivision: 'eighth', // Check every 8th note
            curve: 'exponential', // Sharp opacity changes
        },

        // Fade timing with musical structure
        fadePhaseSync: {
            verse: { fadeIn: true, fadeOut: false }, // Build in verse
            chorus: { fadeIn: false, fadeOut: false }, // Full visibility
            bridge: { fadeIn: true, fadeOut: true }, // In and out
            outro: { fadeIn: false, fadeOut: true }, // Fade to end
        },

        // Pulse with rhythm
        pulseSync: {
            enabled: true,
            frequency: 'quarter', // Pulse every quarter note
            intensity: 0.2, // Pulse depth
            onAccent: 0.4, // Deeper pulse on accents
        },

        // Musical dynamics
        dynamics: {
            forte: { minOpacity: 0.5, maxOpacity: 1.0 }, // More visible when loud
            piano: { minOpacity: 0.0, maxOpacity: 0.4 }, // Ghostly when quiet
        },
    },

    /**
     * Initialize fade data
     * Stores particle's original opacity
     */
    initialize(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.fade = {
            baseOpacity: particle.opacity || particle.life || 1,
        };
    },

    /**
     * Apply fade effect to particle
     * Smoothly transitions opacity based on configuration
     */
    apply(particle, progress, motion, _dt, _centerX, _centerY) {
        if (!particle.gestureData?.fade) {
            this.initialize(particle);
        }

        const data = particle.gestureData.fade;
        const config = { ...this.config, ...motion };

        let targetOpacity;
        if (config.fadeIn && !config.fadeOut) {
            // Fade in only - opacity increases over time
            targetOpacity = config.minOpacity + (config.maxOpacity - config.minOpacity) * progress;
        } else if (config.fadeOut && !config.fadeIn) {
            // Fade out only - opacity decreases over time
            targetOpacity = config.maxOpacity - (config.maxOpacity - config.minOpacity) * progress;
        } else {
            // Fade in then out - peak opacity at midpoint
            if (progress < 0.5) {
                targetOpacity =
                    config.minOpacity + (config.maxOpacity - config.minOpacity) * (progress * 2);
            } else {
                targetOpacity =
                    config.maxOpacity -
                    (config.maxOpacity - config.minOpacity) * ((progress - 0.5) * 2);
            }
        }

        // Apply calculated opacity
        particle.opacity = data.baseOpacity * targetOpacity;
        // Also update life property for particles that use it
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }
    },

    /**
     * Clean up fade effect
     * Restores original opacity values
     */
    cleanup(particle) {
        if (particle.gestureData?.fade) {
            particle.opacity = particle.gestureData.fade.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
            delete particle.gestureData.fade;
        }
    },

    /**
     * 3D core transformation for fade gesture
     * Fades the mascot to NOTHING then fades back in using scale + glow
     * Uses scale down to ~0 and glowIntensity to 0 for true invisibility
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation with scale/glow controls
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...(this?.config || {}), ...motion };

            const fadeIn = config.fadeIn ?? true;
            const fadeOut = config.fadeOut ?? true;

            let fadeAmount;
            if (fadeIn && !fadeOut) {
                // Fade in only - starts invisible, becomes visible
                fadeAmount = progress;
            } else if (fadeOut && !fadeIn) {
                // Fade out only - starts visible, becomes invisible
                fadeAmount = 1 - progress;
            } else {
                // Default: Fade OUT to nothing (0-50%), then fade BACK in (50-100%)
                if (progress < 0.5) {
                    // Fade out: 1.0 → 0.0
                    fadeAmount = 1 - progress / 0.5;
                } else {
                    // Fade in: 0.0 → 1.0
                    fadeAmount = (progress - 0.5) / 0.5;
                }
            }

            // Apply smoothstep easing for smoother visual transitions
            const easedFade = fadeAmount * fadeAmount * (3 - 2 * fadeAmount);

            // FADE EFFECT using channels that actually work:
            // - scale: shrinks to near-zero (0.01) when fully faded
            // - glowIntensity: fades to 0 (kills the glow completely)
            // - glowBoost: stays 0 (no extra glow effect)
            //
            // Minimum scale 0.01 instead of 0 to avoid potential Three.js issues
            const scale = 0.01 + easedFade * 0.99; // 0.01 → 1.0

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale,
                // Glow intensity fades with mesh (0 = invisible, 1 = full)
                glowIntensity: easedFade,
                // No glow boost
                glowBoost: 0,
            };
        },
    },
};
