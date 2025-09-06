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
    
    config: {
        decay: 0.5,
        strength: 2.0
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        const decay = motion.decay || this.config.decay;
        const strength = (motion.strength || this.config.strength) * (1 - progress * decay);
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            particle.vx += (dx / distance) * strength * 2 * dt;
            particle.vy += (dy / distance) * strength * 2 * dt;
        }
    }
};