/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Vibrate Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Vibrate gesture - high frequency micro-shake
 * @author Emotive Engine Team
 * @module gestures/motions/vibrate
 */

export default {
    name: 'vibrate',
    emoji: '📳',
    type: 'blending',
    description: 'High frequency vibration',
    
    // Default configuration
    config: {
        duration: 500,      // Animation duration
        frequency: 20,      // Vibration frequency
        amplitude: 8,       // Vibration amplitude
        easing: 'linear',   // Animation curve type
        strength: 2.0,      // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'shake',
            strength: 2.0,
            frequency: 20,
            amplitude: 8
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.vibrate = {
            timer: 0,
            seed: Math.random() * 1000,
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.vibrate?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.vibrate;
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Update timer
        data.timer += dt * config.frequency;
        
        // High frequency vibration
        const vibrateX = (Math.random() - 0.5) * config.amplitude * strength;
        const vibrateY = (Math.random() - 0.5) * config.amplitude * strength;
        
        // Apply rapid vibration movements
        particle.vx += vibrateX * 0.5 * dt;
        particle.vy += vibrateY * 0.5 * dt;
        
        // Apply damping for control
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        
        // Fade out at the end
        if (progress > 0.8) {
            const fadeFactor = 1 - ((progress - 0.8) * 5);
            particle.vx *= fadeFactor;
            particle.vy *= fadeFactor;
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.vibrate) {
            delete particle.gestureData.vibrate;
        }
    }
};