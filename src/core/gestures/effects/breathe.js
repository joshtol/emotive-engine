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
    
    // Default configuration
    config: {
        duration: 3500,        // Full breath cycle duration
        inhaleRadius: 1.5,     // Maximum expansion distance
        exhaleRadius: 0.3,     // Minimum contraction distance
        breathRate: 0.3,       // Breathing rhythm speed
        spiralStrength: 0.002, // Subtle spiral motion intensity
        scaleAmount: 0.25,     // Core size variation amount
        glowAmount: 0.4,       // Glow intensity variation
        frequency: 1,          // Number of breath cycles
        easing: 'sine',        // Smooth, natural curve type
        strength: 0.8,         // Overall motion influence
        holdPercent: 0.1,      // Pause duration at breath peaks
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'breathe',
            strength: 0.8,         // Particle response strength
            inhaleRadius: 1.5,     // Particle expansion limit
            exhaleRadius: 0.3,     // Particle contraction limit
            holdPercent: 0.1       // Particle pause duration
        }
    },
    
    /**
     * Initialize breathing data for a particle
     * Stores particle's starting position and relationship to center
     */
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Calculate particle's position relative to orb center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.breathe = {
            startX: particle.x,                        // Original X position
            startY: particle.y,                        // Original Y position
            angle: Math.atan2(dy, dx),                // Direction from center
            baseRadius: Math.sqrt(dx * dx + dy * dy), // Distance from center
            phaseOffset: Math.random() * 0.2 - 0.1    // Slight timing variation for organic feel
        };
    },
    
    /**
     * Apply breathing motion to particle
     * Creates expansion/contraction movement synchronized with breath rhythm
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize particle data if needed
        if (!particle.gestureData?.breathe) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.breathe;
        const config = { ...this.config, ...motion };
        
        // Calculate breath phase - creates smooth sine wave between exhale and inhale
        // Result oscillates smoothly between 0 (exhale) and 1 (inhale)
        const breathPhase = (Math.sin(progress * Math.PI * 2 * config.breathRate) + 1) / 2;
        
        // Define breathing boundaries relative to orb size
        // Scale boundaries based on particle's size factor for consistent appearance
        const referenceRadius = 100 * (particle.scaleFactor || 1);
        const inhaleRadius = config.inhaleRadius * referenceRadius;
        const exhaleRadius = config.exhaleRadius * referenceRadius;
        
        // Interpolate target position between exhale and inhale boundaries
        const targetRadius = exhaleRadius + (inhaleRadius - exhaleRadius) * breathPhase;
        
        // Calculate particle's current distance from center
        const currentDx = particle.x - centerX;
        const currentDy = particle.y - centerY;
        const currentRadius = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
        
        // Calculate radial movement needed to reach target breathing position
        const radiusDiff = targetRadius - currentRadius;
        const moveStrength = (motion.strength || 0.8) * 0.05 * dt;
        
        // Apply radial motion (move in/out from center)
        if (currentRadius > 0) {
            // Normalize direction and apply movement
            const moveX = (currentDx / currentRadius) * radiusDiff * moveStrength;
            const moveY = (currentDy / currentRadius) * radiusDiff * moveStrength;
            
            particle.vx += moveX;
            particle.vy += moveY;
            
            // Add organic spiral motion for more natural breathing feel
            // Creates slight circular drift during expansion/contraction
            const spiralStrength = config.spiralStrength * dt * (motion.strength || 1);
            const tangentX = -currentDy / currentRadius;  // Perpendicular to radial direction
            const tangentY = currentDx / currentRadius;
            
            // Spiral motion stronger during inhale, creating expanding spiral
            particle.vx += tangentX * spiralStrength * breathPhase;
            particle.vy += tangentY * spiralStrength * breathPhase;
        }
        
        // Apply velocity damping for smooth, controlled motion
        // Prevents particles from overshooting or oscillating
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    },
    
    /**
     * Clean up breathing data when gesture completes
     * Removes stored data to free memory
     */
    cleanup: function(particle) {
        if (particle.gestureData?.breathe) {
            delete particle.gestureData.breathe;
        }
    }
};