/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flash Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flash gesture - bright burst effect
 * @author Emotive Engine Team
 * @module gestures/effects/flash
 */

export default {
    name: 'flash',
    emoji: '⚡',
    type: 'blending',
    description: 'Bright flash burst effect',
    
    config: {
        duration: 400,
        glowAmount: 2.5,    // Bright flash
        glowPeak: 3.0,      // Peak intensity
        scalePeak: 1.1,     // Slight scale at peak
        easing: 'cubic',
        strength: 1.0,
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'burst',
            strength: 1.0,
            decay: 0.3
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.flash = {
            originalOpacity: particle.opacity,
            originalSize: particle.size,
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.flash?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.flash;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Flash effect - bright then fade
        let flashIntensity;
        if (progress < 0.3) {
            // Quick rise to peak
            flashIntensity = (progress / 0.3) * config.glowPeak;
        } else {
            // Slower fade out
            flashIntensity = config.glowPeak * (1 - (progress - 0.3) / 0.7);
        }
        
        // Apply to particle
        particle.opacity = Math.min(1, data.originalOpacity * (1 + flashIntensity * strength));
        particle.size = data.originalSize * (1 + (config.scalePeak - 1) * flashIntensity * strength * 0.1);
        
        // Burst motion - particles explode outward briefly
        if (progress < 0.2) {
            const burstStrength = (1 - progress / 0.2) * strength;
            const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
            particle.vx += Math.cos(angle) * burstStrength * 2 * dt;
            particle.vy += Math.sin(angle) * burstStrength * 2 * dt;
        }
        
        // Apply decay
        particle.vx *= (1 - config.particleMotion.decay * 0.1);
        particle.vy *= (1 - config.particleMotion.decay * 0.1);
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.flash) {
            particle.opacity = particle.gestureData.flash.originalOpacity;
            particle.size = particle.gestureData.flash.originalSize;
            delete particle.gestureData.flash;
        }
    }
};