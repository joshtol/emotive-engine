/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Glow Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Glow gesture - sustained luminous effect
 * @author Emotive Engine Team
 * @module gestures/effects/glow
 */

export default {
    name: 'glow',
    emoji: '✨',
    type: 'blending',
    description: 'Sustained glowing effect',
    
    // Default configuration
    config: {
        duration: 1500,      // Animation duration
        glowAmount: 1.5,     // Sustained brightness level
        glowPeak: 2.0,       // Maximum glow intensity
        easing: 'sine',      // Smooth curve type
        strength: 0.3,       // Overall effect intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 0.3,       // Gentle radial force
            direction: 'outward', // Expansion direction
            gentle: true         // Soft movement mode
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.glow = {
            originalOpacity: particle.opacity,
            originalGlow: particle.glowSizeMultiplier || 0,
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.glow?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.glow;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate smooth glow intensity using sine wave curve
        const glowIntensity = Math.sin(progress * Math.PI) * config.glowPeak;
        
        // Apply glow
        particle.opacity = Math.min(1, data.originalOpacity * (1 + glowIntensity * strength * 0.5));
        particle.hasGlow = true;
        particle.glowSizeMultiplier = data.originalGlow + glowIntensity * strength;
        
        // Gentle radial drift
        const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
        const driftStrength = Math.sin(progress * Math.PI) * strength * 0.1;
        particle.vx += Math.cos(angle) * driftStrength * dt;
        particle.vy += Math.sin(angle) * driftStrength * dt;
        
        // Apply damping for smooth motion
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.glow) {
            particle.opacity = particle.gestureData.glow.originalOpacity;
            particle.glowSizeMultiplier = particle.gestureData.glow.originalGlow;
            delete particle.gestureData.glow;
        }
    }
};