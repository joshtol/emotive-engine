/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Orbital Gesture with 3D Depth
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview 3D orbital gesture - particles orbit with dynamic z-depth changes
 * @author Emotive Engine Team
 * @module gestures/transforms/orbital
 * 
 * VISUAL EFFECT:
 * Particles orbit around the center while transitioning between foreground and
 * background layers, creating a true 3D effect where particles pass behind and
 * in front of the orb.
 */

export default {
    name: 'orbital',
    emoji: '🪐',
    type: 'override',
    description: 'Orbital motion around center',
    
    // Default configuration
    config: {
        speed: 0.02,              // Orbital rotation speed
        maintainRadius: true,     // Keep constant orbit radius
        elliptical: false,        // Use circular orbit
        use3D: true,              // Enable z-coordinate animation
        zPhaseOffset: 0,          // Phase offset for z-oscillation
        verticalOscillation: 0,   // Vertical movement for hula-hoop effect
        duration: 3000,           // Animation duration
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'orbital',
            strength: 1.0
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        // Random direction for orbit
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        particle.gestureData.orbital = {
            radius: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx),
            originalVx: particle.vx,
            originalVy: particle.vy,
            originalZ: particle.z || 0,  // Store original z-coordinate
            zPhase: Math.random() * Math.PI * 2,  // Random phase for variety
            direction: direction  // Random orbit direction
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.orbital) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.orbital;
        const speed = (motion.speed || this.config.speed) * (motion.strength || 1);
        
        // Update angle with direction (dt is already normalized to 60fps)
        data.angle += speed * dt * data.direction;
        
        // Calculate new position
        let radius = data.radius;
        if (!motion.maintainRadius) {
            // Allow radius to vary slightly
            radius = data.radius * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
        }
        
        particle.x = centerX + Math.cos(data.angle) * radius;
        particle.y = centerY + Math.sin(data.angle) * radius;
        
        // 3D DEPTH: Animate z-coordinate for particles passing behind/in front
        if (motion.use3D !== false) {  // Default to true
            // Z oscillates as particle orbits, creating 3D effect
            // When angle is 0/2π (right side), z is positive (front)
            // When angle is π (left side), z is negative (back)
            const zAngle = data.angle + data.zPhase + (motion.zPhaseOffset || 0);
            particle.z = Math.sin(zAngle) * 0.8; // Z-depth range for layering
            
            // Add vertical oscillation for hula-hoop effect
            if (motion.verticalOscillation) {
                const verticalOffset = Math.cos(zAngle) * motion.verticalOscillation * radius * 0.1;
                particle.y += verticalOffset;
            }
        }
        
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
            particle.z = data.originalZ;  // Restore original z-coordinate
            delete particle.gestureData.orbital;
        }
    }
};