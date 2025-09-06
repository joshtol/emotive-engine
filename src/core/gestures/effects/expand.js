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
    
    config: {
        duration: 600,
        scaleAmount: 3.0,   // HUGE expansion - 300%
        scaleTarget: 3.0,   // Jedi force push away
        glowAmount: 0.5,    // Bigger glow for power
        easing: 'back',     // Overshoot effect
        strength: 3.0,      // STRONG push force
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'radial',
            strength: 3.0,
            direction: 'outward',
            persist: true // Keep expanded position
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
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.expand?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.expand;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate expansion
        const expandFactor = 1 + (config.scaleTarget - 1) * progress * strength;
        const targetRadius = data.baseRadius * expandFactor;
        
        // Move particle outward
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply STRONG Jedi push forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.8 * dt;  // Much stronger push
        particle.vy += dy * 0.8 * dt;  // Much stronger push
        
        // Apply damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.expand) {
            delete particle.gestureData.expand;
        }
    }
};