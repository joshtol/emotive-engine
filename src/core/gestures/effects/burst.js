/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Burst Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Burst gesture - explosive outward motion
 * @author Emotive Engine Team
 * @module gestures/effects/burst
 */

export default {
    name: 'burst',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive outward burst from center',
    
    // Default configuration
    config: {
        decay: 0.5,      // Force reduction over time
        strength: 2.0    // Initial explosion intensity
    },
    
    /**
     * Apply explosive burst motion to particle
     * Pushes particles radially outward with decaying force
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Calculate force decay over gesture duration
        const decay = motion.decay || this.config.decay;
        const strength = (motion.strength || this.config.strength) * (1 - progress * decay);
        
        // Calculate direction from center to particle
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Apply outward force if particle isn't at center
        if (distance > 1) {
            // Normalize direction and apply explosive force
            particle.vx += (dx / distance) * strength * 2 * dt;
            particle.vy += (dy / distance) * strength * 2 * dt;
        }
    }
};