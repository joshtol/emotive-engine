/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbital Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Orbital gesture - circular orbit around center
 * @author Emotive Engine Team
 * @module gestures/transforms/orbital
 */

export default {
    name: 'orbital',
    emoji: '🪐',
    type: 'override',
    description: 'Orbital motion around center',
    
    config: {
        speed: 0.02,
        maintainRadius: true,
        elliptical: false
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.orbital = {
            radius: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx),
            originalVx: particle.vx,
            originalVy: particle.vy
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.orbital) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.orbital;
        const speed = (motion.speed || this.config.speed) * (motion.strength || 1);
        
        // Update angle
        data.angle += speed * dt * 60;
        
        // Calculate new position
        let radius = data.radius;
        if (!motion.maintainRadius) {
            // Allow radius to vary slightly
            radius = data.radius * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
        }
        
        particle.x = centerX + Math.cos(data.angle) * radius;
        particle.y = centerY + Math.sin(data.angle) * radius;
        
        // Set velocity to match motion
        particle.vx = -Math.sin(data.angle) * radius * speed;
        particle.vy = Math.cos(data.angle) * radius * speed;
        
        // Restore original velocity at end
        if (progress > 0.9) {
            const blendFactor = (1 - progress) * 10;
            particle.vx = particle.vx * blendFactor + data.originalVx * (1 - blendFactor);
            particle.vy = particle.vy * blendFactor + data.originalVy * (1 - blendFactor);
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.orbital) {
            const data = particle.gestureData.orbital;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.orbital;
        }
    }
};