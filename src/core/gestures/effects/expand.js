/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Expand Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Expand gesture - particles move outward from center
 * @author Emotive Engine Team
 * @module gestures/effects/expand
 */

export default {
    name: 'expand',
    emoji: '💫',
    type: 'blending',
    description: 'Radial expansion from center',
    
    // Default configuration
    config: {
        duration: 600,        // Gesture duration
        scaleAmount: 3.0,     // Core scale expansion amount
        scaleTarget: 3.0,     // Target expansion distance ratio
        glowAmount: 0.5,      // Glow intensity increase
        easing: 'back',       // Overshoot animation curve
        strength: 3.0,        // Outward push force intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 3.0,        // Particle push strength
            direction: 'outward', // Movement away from center
            persist: true         // Maintain expanded position
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        particle.gestureData.expand = {
            startX: particle.x,
            startY: particle.y,
            angle: Math.atan2(dy, dx),
            baseRadius: Math.sqrt(dx * dx + dy * dy),
            initialized: true
        };
    },
    
    /**
     * Apply expansion motion to particle
     * Pushes particles outward from center with explosive force
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.expand?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.expand;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate expansion amount based on progress
        const expandFactor = 1 + (config.scaleTarget - 1) * progress * strength;
        const targetRadius = data.baseRadius * expandFactor;
        
        // Calculate target position farther from center
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply strong outward push forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.8 * dt;  // Strong explosive push
        particle.vy += dy * 0.8 * dt;  // Strong explosive push
        
        // Apply velocity damping for controlled motion
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.expand) {
            delete particle.gestureData.expand;
        }
    }
};