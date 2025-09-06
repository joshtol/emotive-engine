/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nod Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Nod gesture - vertical agreement motion
 * @author Emotive Engine Team
 * @module gestures/motions/nod
 */

export default {
    name: 'nod',
    emoji: '🙂',
    type: 'blending',
    description: 'Vertical nodding motion',
    
    config: {
        duration: 500,
        amplitude: 15,      // Vertical movement
        frequency: 2,       // Number of nods
        easing: 'sine',
        strength: 0.4,
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'oscillate',
            axis: 'vertical',
            strength: 0.4,
            frequency: 2,
            phase: 0 // In sync with orb
        }
    },
    
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.nod = {
            startY: particle.y,
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.nod?.initialized) {
            this.initialize(particle, motion);
        }
        
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        const frequency = config.frequency;
        const oscillation = Math.sin(progress * Math.PI * 2 * frequency);
        const amplitude = config.amplitude * strength * particle.scaleFactor;
        
        // Apply vertical nodding motion
        particle.vy += oscillation * amplitude * 0.01 * dt;
        
        // Dampen at the end
        if (progress > 0.9) {
            particle.vy *= 0.95;
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.nod) {
            delete particle.gestureData.nod;
        }
    }
};