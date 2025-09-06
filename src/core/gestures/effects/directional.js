/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Directional Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Directional gesture - move particles in specific direction
 * @author Emotive Engine Team
 * @module gestures/effects/directional
 */

export default {
    name: 'directional',
    emoji: '➡️',
    type: 'blending',
    description: 'Move particles in a specific direction',
    
    config: {
        angle: 0,
        returnToOrigin: false,
        strength: 1.0
    },
    
    initialize: function(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.directional = {
            initialX: particle.x,
            initialY: particle.y
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.directional) {
            this.initialize(particle);
        }
        
        const angle = (motion.angle || this.config.angle) * Math.PI / 180;
        const strength = motion.strength || this.config.strength;
        
        particle.vx += Math.cos(angle) * strength * 0.3 * dt;
        particle.vy += Math.sin(angle) * strength * 0.3 * dt;
        
        if (motion.returnToOrigin && progress > 0.5) {
            const returnProgress = (progress - 0.5) * 2;
            const data = particle.gestureData.directional;
            const dx = data.initialX - particle.x;
            const dy = data.initialY - particle.y;
            particle.vx += dx * returnProgress * 0.02 * dt;
            particle.vy += dy * returnProgress * 0.02 * dt;
        }
    }
};