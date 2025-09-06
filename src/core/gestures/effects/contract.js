/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Contract Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Contract gesture - particles move inward toward center
 * @author Emotive Engine Team
 * @module gestures/effects/contract
 */

export default {
    name: 'contract',
    emoji: '🌀',
    type: 'blending',
    description: 'Radial contraction toward center',
    
    config: {
        duration: 600,
        scaleAmount: 0.2,   // Pull MUCH closer - 20% of original distance
        scaleTarget: 0.2,   // Jedi force pull to core
        glowAmount: -0.2,   // Glow decrease
        easing: 'cubic',
        strength: 2.5,      // STRONG pull force
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'radial',
            strength: 2.5,
            direction: 'inward',
            persist: true
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        particle.gestureData.contract = {
            startX: particle.x,
            startY: particle.y,
            angle: Math.atan2(dy, dx),
            baseRadius: Math.sqrt(dx * dx + dy * dy),
            initialized: true
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.contract?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.contract;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate contraction
        const contractFactor = 1 - (1 - config.scaleTarget) * progress * strength;
        const targetRadius = data.baseRadius * contractFactor;
        
        // Move particle inward
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply STRONG Jedi pull forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.5 * dt;  // Much stronger pull
        particle.vy += dy * 0.5 * dt;  // Much stronger pull
        
        // Apply damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.contract) {
            delete particle.gestureData.contract;
        }
    }
};