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
    
    config: {
        duration: 500,
        frequency: 20,      // HIGHER frequency for intense vibration
        amplitude: 8,       // BIGGER amplitude for visible effect
        easing: 'linear',
        strength: 2.0,      // MUCH stronger
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'jitter',
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
        
        // Apply BIGGER, rapid movements
        particle.vx += vibrateX * 0.5 * dt;
        particle.vy += vibrateY * 0.5 * dt;
        
        // Strong damping to keep it controlled
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