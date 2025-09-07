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
    
    // Default configuration
    config: {
        duration: 600,        // Gesture duration
        scaleAmount: 0.2,     // Core scale reduction amount
        scaleTarget: 0.2,     // Target contraction distance ratio
        glowAmount: -0.2,     // Glow intensity reduction
        easing: 'cubic',      // Smooth acceleration curve
        strength: 2.5,        // Inward pull force intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 2.5,        // Particle pull strength
            direction: 'inward',  // Movement toward center
            persist: true         // Effect continues after gesture
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
    
    /**
     * Apply contraction motion to particle
     * Pulls particles toward center with magnetic-like force
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.contract?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.contract;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate contraction amount based on progress
        const contractFactor = 1 - (1 - config.scaleTarget) * progress * strength;
        const targetRadius = data.baseRadius * contractFactor;
        
        // Calculate target position closer to center
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply strong inward pull forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.5 * dt;  // Strong magnetic pull
        particle.vy += dy * 0.5 * dt;  // Strong magnetic pull
        
        // Apply velocity damping for controlled motion
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.contract) {
            delete particle.gestureData.contract;
        }
    }
};