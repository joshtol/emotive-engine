/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Hula-Hoop Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Hula-hoop variation of orbital with vertical oscillation
 * @author Emotive Engine Team
 * @module gestures/transforms/hula
 * 
 * VISUAL EFFECT:
 * Like a hula-hoop spinning around the orb - particles orbit horizontally while
 * oscillating vertically, creating a tilted ring effect with 3D depth.
 */

export default {
    name: 'hula',
    emoji: '🌀',
    type: 'override',
    description: 'Hula-hoop motion with vertical waves',
    
    // Default configuration
    config: {
        speed: 0.015,             // Rotation speed
        maintainRadius: false,     // Allow radius variation for organic feel
        elliptical: true,          // Elliptical orbit shape
        use3D: true,               // Enable 3D depth effect
        zPhaseOffset: Math.PI / 4, // Ring tilt angle
        verticalOscillation: 0.3,  // Vertical wave amount
        wobbleAmount: 0.15,        // Ring wobble intensity
        duration: 2500,            // Animation duration
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'hula',
            strength: 1.0,
            verticalOscillation: 0.3
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        // Random direction for hula-hoop
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        particle.gestureData.hula = {
            radius: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx),
            originalVx: particle.vx,
            originalVy: particle.vy,
            originalZ: particle.z || 0,
            zPhase: Math.random() * Math.PI * 2,
            wobblePhase: Math.random() * Math.PI * 2,
            direction: direction  // Random hula direction
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.hula) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.hula;
        const speed = (motion.speed || this.config.speed) * (motion.strength || 1);
        
        // Update angle with direction (dt is already normalized to 60fps)
        data.angle += speed * dt * data.direction;
        
        // Wobble effect - the hoop wobbles as it spins
        const wobble = Math.sin(data.angle * 2 + data.wobblePhase) * (motion.wobbleAmount || this.config.wobbleAmount);
        
        // Calculate elliptical radius with wobble
        let radiusX = data.radius * (1 + wobble);
        let radiusY = data.radius * (0.7 + wobble); // Elliptical shape factor
        
        // Position on the ellipse
        particle.x = centerX + Math.cos(data.angle) * radiusX;
        particle.y = centerY + Math.sin(data.angle) * radiusY;
        
        // 3D DEPTH with strong vertical oscillation
        const zAngle = data.angle + data.zPhase + (motion.zPhaseOffset || this.config.zPhaseOffset);
        
        // Z-coordinate for depth (behind/in front)
        particle.z = Math.sin(zAngle) * 0.9; // Depth range for layering
        
        // Vertical oscillation synchronized with z-depth
        const verticalAmount = motion.verticalOscillation || this.config.verticalOscillation;
        const verticalOffset = Math.cos(zAngle * 2) * verticalAmount * data.radius * 0.2;
        particle.y += verticalOffset;
        
        // Tilt effect - particles higher when in front, lower when behind
        const tiltOffset = particle.z * data.radius * 0.1;
        particle.y -= tiltOffset;
        
        // Set velocity to match motion
        particle.vx = -Math.sin(data.angle) * radiusX * speed;
        particle.vy = Math.cos(data.angle) * radiusY * speed;
        
        // Restore original state at end
        if (progress > 0.9) {
            const blendFactor = (1 - progress) * 10;
            particle.vx = particle.vx * blendFactor + data.originalVx * (1 - blendFactor);
            particle.vy = particle.vy * blendFactor + data.originalVy * (1 - blendFactor);
            particle.z = particle.z * blendFactor + data.originalZ * (1 - blendFactor);
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.hula) {
            const data = particle.gestureData.hula;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.z = data.originalZ;
            delete particle.gestureData.hula;
        }
    }
};