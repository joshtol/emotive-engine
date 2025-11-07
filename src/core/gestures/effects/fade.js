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
        duration: 2000,     // 2 second duration (longer for lerping to catch up)
        fadeIn: true,       // Enable fade in effect (for fade-out-and-back)
        fadeOut: true,      // Enable fade out effect
        minOpacity: 0,      // Minimum opacity level
        maxOpacity: 1       // Maximum opacity level
    },
    
    // Rhythm configuration - fades sync to musical dynamics
    rhythm: {
        enabled: true,
        syncMode: 'dynamic',  // Fade with volume/intensity changes
        
        // Opacity modulation with beat
        opacitySync: {
            onBeat: 0.9,              // Nearly visible on beat
            offBeat: 0.3,             // Ghostly between beats
            subdivision: 'eighth',     // Check every 8th note
            curve: 'exponential'      // Sharp opacity changes
        },
        
        // Fade timing with musical structure
        fadePhaseSync: {
            verse: { fadeIn: true, fadeOut: false },    // Build in verse
            chorus: { fadeIn: false, fadeOut: false },  // Full visibility
            bridge: { fadeIn: true, fadeOut: true },    // In and out
            outro: { fadeIn: false, fadeOut: true }     // Fade to end
        },
        
        // Pulse with rhythm
        pulseSync: {
            enabled: true,
            frequency: 'quarter',     // Pulse every quarter note
            intensity: 0.2,           // Pulse depth
            onAccent: 0.4            // Deeper pulse on accents
        },
        
        // Musical dynamics
        dynamics: {
            forte: { minOpacity: 0.5, maxOpacity: 1.0 },    // More visible when loud
            piano: { minOpacity: 0.0, maxOpacity: 0.4 }     // Ghostly when quiet
        }
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
            baseOpacity: particle.opacity || particle.life || 1
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
                targetOpacity = config.minOpacity + (config.maxOpacity - config.minOpacity) * (progress * 2);
            } else {
                targetOpacity = config.maxOpacity - (config.maxOpacity - config.minOpacity) * ((progress - 0.5) * 2);
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
     * Opacity fade translates to glowIntensity multiplier
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };

            let glowIntensity;
            const minOpacity = config.minOpacity ?? 0.0;
            const maxOpacity = config.maxOpacity ?? 1.0;

            if (config.fadeIn && !config.fadeOut) {
                // Fade in only - glow increases from minOpacity to maxOpacity
                glowIntensity = minOpacity + (maxOpacity - minOpacity) * progress;
            } else if (config.fadeOut && !config.fadeIn) {
                // Fade out only - glow decreases from maxOpacity to minOpacity
                glowIntensity = maxOpacity - (maxOpacity - minOpacity) * progress;
            } else {
                // Fade out then back in: maxOpacity → minOpacity → maxOpacity
                // This creates the classic "fade" effect (bright → dark → bright)
                if (progress < 0.5) {
                    glowIntensity = maxOpacity - (maxOpacity - minOpacity) * (progress * 2);
                } else {
                    glowIntensity = minOpacity + (maxOpacity - minOpacity) * ((progress - 0.5) * 2);
                }
            }

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                glowIntensity
            };
        }
    }
};