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
    
    config: {
        fadeIn: false,
        fadeOut: true,
        minOpacity: 0,
        maxOpacity: 1
    },
    
    initialize: function(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.fade = {
            baseOpacity: particle.opacity || particle.life || 1
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.fade) {
            this.initialize(particle);
        }
        
        const data = particle.gestureData.fade;
        const config = { ...this.config, ...motion };
        
        let targetOpacity;
        if (config.fadeIn && !config.fadeOut) {
            // Fade in only
            targetOpacity = config.minOpacity + (config.maxOpacity - config.minOpacity) * progress;
        } else if (config.fadeOut && !config.fadeIn) {
            // Fade out only
            targetOpacity = config.maxOpacity - (config.maxOpacity - config.minOpacity) * progress;
        } else {
            // Fade in then out
            if (progress < 0.5) {
                targetOpacity = config.minOpacity + (config.maxOpacity - config.minOpacity) * (progress * 2);
            } else {
                targetOpacity = config.maxOpacity - (config.maxOpacity - config.minOpacity) * ((progress - 0.5) * 2);
            }
        }
        
        particle.opacity = data.baseOpacity * targetOpacity;
        if (particle.life !== undefined) {
            particle.life = particle.opacity;
        }
    },
    
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