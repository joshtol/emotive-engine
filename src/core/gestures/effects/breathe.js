/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Breathe Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Breathe gesture - inhale/exhale particle motion
 * @author Emotive Engine Team
 * @module gestures/effects/breathe
 */

export default {
    name: 'breathe',
    emoji: '🫁',
    type: 'blending',
    description: 'Breathing rhythm with inhale and exhale',
    
    config: {
        duration: 3500,        // Animation duration (from gestureConfig)
        inhaleRadius: 1.5,
        exhaleRadius: 0.3,     // From gestureConfig
        breathRate: 0.3,
        spiralStrength: 0.002,
        scaleAmount: 0.25,     // 25% expansion/contraction (from gestureConfig)
        glowAmount: 0.4,       // Glow brightens on inhale (from gestureConfig)
        frequency: 1,          // One breath cycle
        easing: 'sine',        // Smooth breathing curve
        strength: 0.8,         // Particle motion strength
        holdPercent: 0.1,      // 10% breath hold at peaks
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'breathe',
            strength: 0.8,
            inhaleRadius: 1.5,
            exhaleRadius: 0.3,
            holdPercent: 0.1
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.breathe = {
            startX: particle.x,
            startY: particle.y,
            angle: Math.atan2(dy, dx),
            baseRadius: Math.sqrt(dx * dx + dy * dy),
            phaseOffset: Math.random() * 0.2 - 0.1
        };
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.breathe) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.breathe;
        const config = { ...this.config, ...motion };
        
        // Calculate breath phase (0 = full exhale, 1 = full inhale)
        const breathPhase = (Math.sin(progress * Math.PI * 2 * config.breathRate) + 1) / 2;
        
        // Reference radius
        const referenceRadius = 100 * (particle.scaleFactor || 1);
        const inhaleRadius = config.inhaleRadius * referenceRadius;
        const exhaleRadius = config.exhaleRadius * referenceRadius;
        const targetRadius = exhaleRadius + (inhaleRadius - exhaleRadius) * breathPhase;
        
        // Current position
        const currentDx = particle.x - centerX;
        const currentDy = particle.y - centerY;
        const currentRadius = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
        
        // Move toward target radius
        const radiusDiff = targetRadius - currentRadius;
        const moveStrength = (motion.strength || 0.8) * 0.05 * dt;
        
        if (currentRadius > 0) {
            const moveX = (currentDx / currentRadius) * radiusDiff * moveStrength;
            const moveY = (currentDy / currentRadius) * radiusDiff * moveStrength;
            
            particle.vx += moveX;
            particle.vy += moveY;
            
            // Add slight spiral motion
            const spiralStrength = config.spiralStrength * dt * (motion.strength || 1);
            const tangentX = -currentDy / currentRadius;
            const tangentY = currentDx / currentRadius;
            
            particle.vx += tangentX * spiralStrength * breathPhase;
            particle.vy += tangentY * spiralStrength * breathPhase;
        }
        
        // Apply damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.breathe) {
            delete particle.gestureData.breathe;
        }
    }
};