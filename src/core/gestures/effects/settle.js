/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Settle Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Settle gesture - gradually reduce velocity
 * @author Emotive Engine Team
 * @module gestures/effects/settle
 */

export default {
    name: 'settle',
    emoji: '🍃',
    type: 'blending',
    description: 'Gradually settle particles to rest',
    
    config: {
        damping: 0.02,
        threshold: 0.01
    },
    
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        const damping = motion.damping || this.config.damping;
        const threshold = motion.threshold || this.config.threshold;
        
        // Exponential damping
        particle.vx *= Math.max(0, 1 - damping * dt * 60);
        particle.vy *= Math.max(0, 1 - damping * dt * 60);
        
        // Stop completely when below threshold
        if (Math.abs(particle.vx) < threshold) particle.vx = 0;
        if (Math.abs(particle.vy) < threshold) particle.vy = 0;
    }
};