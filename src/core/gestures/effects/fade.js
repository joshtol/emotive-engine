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
 */

export default {
    name: 'fade',
    emoji: '👻',
    type: 'blending',
    description: 'Fade particle opacity',
    
    // Default configuration
    config: {
        fadeIn: false,      // Enable fade in effect
        fadeOut: true,      // Enable fade out effect
        minOpacity: 0,      // Minimum opacity level
        maxOpacity: 1       // Maximum opacity level
    },
    
    /**
     * Initialize fade data
     * Stores particle's original opacity
     */
    initialize: function(particle) {
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
    apply: function(particle, progress, motion, dt, centerX, centerY) {
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
    cleanup: function(particle) {
        if (particle.gestureData?.fade) {
            particle.opacity = particle.gestureData.fade.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
            delete particle.gestureData.fade;
        }
    }
};