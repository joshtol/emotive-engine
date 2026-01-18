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
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'hold',
    emoji: '⏸️',
    type: 'override',
    description: 'Hold particles in current position',
    
    // Default configuration
    config: {
        duration: 2000,                                    // Legacy fallback (2 seconds)
        musicalDuration: { musical: true, bars: 1 },       // 1 bar (4 beats)
        holdStrength: 0.95,                                // Position retention strength
        allowDrift: false,                                 // Enable slight movement
        strength: 1.0                                      // Freeze strength (1 = full freeze)
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
    apply(particle, progress, motion, _dt, _centerX, _centerY) {
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
    },

    /**
     * 3D core transformation for hold gesture
     * PAUSE BUTTON - freezes all rotation, wobble, and groove with smooth easing
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation with freeze signal
     */
    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};

            // HOLD: Pause button effect - freeze all animation smoothly
            // Phase 1 (0-0.15): Ease into freeze
            // Phase 2 (0.15-0.85): Full freeze
            // Phase 3 (0.85-1.0): Ease out of freeze

            let freezeAmount = 0;
            let glowDim = 1.0;

            if (progress < 0.15) {
                // Ease into freeze - smooth ramp up
                const t = progress / 0.15;
                // Smoothstep for musical easing
                freezeAmount = t * t * (3 - 2 * t);
                // Dim glow slightly as we freeze (like pausing playback)
                glowDim = 1.0 - freezeAmount * 0.2;
            } else if (progress < 0.85) {
                // Full freeze - completely frozen
                freezeAmount = 1.0;
                glowDim = 0.8;
            } else {
                // Ease out of freeze - smooth return
                const t = (progress - 0.85) / 0.15;
                // Inverse smoothstep
                freezeAmount = 1.0 - t * t * (3 - 2 * t);
                glowDim = 0.8 + t * 0.2;
            }

            // Apply strength modifier
            const strength = config.strength || 1.0;
            freezeAmount *= strength;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                glowIntensity: glowDim,
                // New freeze signals - 0 = normal animation, 1 = fully frozen
                freezeRotation: freezeAmount,      // Stops rotation behavior
                freezeWobble: freezeAmount,        // Stops episodic wobble
                freezeGroove: freezeAmount,        // Stops rhythm groove
                freezeParticles: freezeAmount      // Stops particle motion
            };
        }
    }
};