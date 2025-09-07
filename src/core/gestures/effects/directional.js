/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Directional Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Directional gesture - move particles in specific direction
 * @author Emotive Engine Team
 * @module gestures/effects/directional
 */

export default {
    name: 'directional',
    emoji: '➡️',
    type: 'blending',
    description: 'Move particles in a specific direction',
    
    // Default configuration
    config: {
        angle: 0,                // Movement direction in degrees
        returnToOrigin: false,   // Whether particles return to start
        strength: 1.0           // Force intensity
    },
    
    /**
     * Initialize directional movement data
     * Stores particle's starting position for return motion
     */
    initialize: function(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.directional = {
            initialX: particle.x,
            initialY: particle.y
        };
    },
    
    /**
     * Apply directional force to particle
     * Pushes particles in specified direction with optional return
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.directional) {
            this.initialize(particle);
        }
        
        // Convert angle to radians for calculation
        const angle = (motion.angle || this.config.angle) * Math.PI / 180;
        const strength = motion.strength || this.config.strength;
        
        // Apply directional force
        particle.vx += Math.cos(angle) * strength * 0.3 * dt;
        particle.vy += Math.sin(angle) * strength * 0.3 * dt;
        
        // Optional return motion in second half of gesture
        if (motion.returnToOrigin && progress > 0.5) {
            const returnProgress = (progress - 0.5) * 2;
            const data = particle.gestureData.directional;
            // Calculate return force toward initial position
            const dx = data.initialX - particle.x;
            const dy = data.initialY - particle.y;
            particle.vx += dx * returnProgress * 0.02 * dt;
            particle.vy += dy * returnProgress * 0.02 * dt;
        }
    }
};