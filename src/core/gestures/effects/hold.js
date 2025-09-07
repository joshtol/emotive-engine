/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Hold Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Hold gesture - freeze particles in place
 * @author Emotive Engine Team
 * @module gestures/effects/hold
 */

export default {
    name: 'hold',
    emoji: '⏸️',
    type: 'override',
    description: 'Hold particles in current position',
    
    // Default configuration
    config: {
        holdStrength: 0.95,  // Position retention strength
        allowDrift: false    // Enable slight movement
    },
    
    initialize: function(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.hold = {
            holdX: particle.x,
            holdY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy
        };
    },
    
    /**
     * Apply hold effect to particle
     * Freezes or slows particle movement based on configuration
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.hold) {
            this.initialize(particle);
        }
        
        const data = particle.gestureData.hold;
        const holdStrength = motion.holdStrength || this.config.holdStrength;
        
        if (motion.allowDrift) {
            // Allow slight drift with velocity damping
            particle.vx *= holdStrength;
            particle.vy *= holdStrength;
        } else {
            // Hard hold - lock to position
            particle.x += (data.holdX - particle.x) * (1 - holdStrength);
            particle.y += (data.holdY - particle.y) * (1 - holdStrength);
            particle.vx = 0;
            particle.vy = 0;
        }
        
        // Gradually restore velocity near end
        if (progress > 0.9) {
            const restoreFactor = (progress - 0.9) * 10;
            particle.vx = particle.vx * (1 - restoreFactor) + data.originalVx * restoreFactor;
            particle.vy = particle.vy * (1 - restoreFactor) + data.originalVy * restoreFactor;
        }
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.hold) {
            const data = particle.gestureData.hold;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.hold;
        }
    }
};