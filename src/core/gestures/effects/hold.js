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
    
    // Rhythm configuration - synchronized pause effects following musical structure
    rhythm: {
        enabled: true,
        syncMode: 'rest',    // Hold particles during musical rests and pauses
        
        // Hold strength responds to musical silence
        holdSync: {
            onRest: 0.98,         // Very strong hold during rests
            onSound: 0.80,        // Looser hold when music plays
            curve: 'immediate'    // Instant response to silence/sound
        },
        
        // Duration matches rest length
        durationSync: {
            mode: 'rests',
            minBeats: 0.5,        // Minimum half-beat hold
            maxBeats: 8,          // Maximum 8-beat hold
            sustain: true         // Maintain hold through entire rest
        },
        
        // Response to fermatas and caesuras
        pauseResponse: {
            enabled: true,
            multiplier: 1.5,      // Stronger hold during marked pauses
            type: 'strength'      // Affects hold strength
        },
        
        // Style variations for different music types
        patternOverrides: {
            'classical': {
                // Expressive holds for dramatic pauses
                holdSync: { onRest: 0.99, onSound: 0.75, curve: 'dramatic' },
                pauseResponse: { multiplier: 2.0 }
            },
            'minimal': {
                // Extended, meditative holds
                holdSync: { onRest: 0.95, onSound: 0.85 },
                durationSync: { minBeats: 2, maxBeats: 16 }
            },
            'jazz': {
                // Subtle holds that allow for swing
                holdSync: { onRest: 0.90, onSound: 0.70 },
                allowDrift: true  // Enable slight movement for swing feel
            },
            'electronic': {
                // Precise, digital-style holds
                holdSync: { onRest: 0.99, onSound: 0.60, curve: 'digital' },
                pauseResponse: { multiplier: 1.2 }
            }
        },
        
        // Musical dynamics
        dynamics: {
            forte: {
                // Strong, definitive holds
                holdSync: { 
                    onRest: { multiplier: 1.02 },
                    onSound: { multiplier: 0.9 }
                },
                pauseResponse: { multiplier: 2.2 }
            },
            piano: {
                // Gentle, floating holds
                holdSync: { 
                    onRest: { multiplier: 0.97 },
                    onSound: { multiplier: 0.85 }
                },
                pauseResponse: { multiplier: 1.3 }
            }
        }
    },
    
    initialize(particle) {
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
    apply(particle, progress, motion, dt, centerX, centerY) {
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
    
    cleanup(particle) {
        if (particle.gestureData?.hold) {
            const data = particle.gestureData.hold;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.hold;
        }
    }
};