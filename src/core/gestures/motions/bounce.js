/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Bounce Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bounce gesture - vertical oscillation motion
 * @author Emotive Engine Team
 * @module gestures/motions/bounce
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a bouncing motion with particles oscillating vertically.                  
 * ║ This is a BLENDING gesture that adds to existing particle motion.                 
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↑
 *       ⭐      <- peak
 *      ↗ ↘
 *     ↗   ↘
 *    ⭐     ⭐   <- midpoint
 *   ↗       ↘
 *  ↗         ↘
 * ⭐           ⭐ <- trough
 * 
 * USED BY:
 * - Joy emotions (playful bouncing)
 * - Excited states (energetic movement)
 * - Celebration gestures
 */

/**
 * Bounce gesture configuration and implementation
 */
export default {
    name: 'bounce',
    emoji: '⬆️',
    type: 'blending', // Adds to existing motion
    description: 'Vertical oscillation with smooth easing',
    
    // Default configuration
    config: {
        duration: 800,      // Animation duration
        amplitude: 30,      // Bounce height range
        frequency: 2,       // Number of oscillations
        axis: 'vertical',   // Movement axis: 'vertical' or 'horizontal'
        damping: true,      // Enable amplitude reduction over time
        easing: 'sine',     // Animation curve type
        strength: 0.6,      // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'bounce',
            axis: 'vertical',   // Oscillation direction
            strength: 0.6,      // Particle bounce strength
            frequency: 2        // Particle oscillation count
        }
    },
    
    // Rhythm configuration - bounce syncs perfectly to beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Each bounce lands on a beat
        timingSync: 'nextBeat',     // Start on next beat
        interruptible: true,         // Can interrupt mid-bounce
        priority: 3,                 // Lower priority
        blendable: true,             // Can blend with other effects
        crossfadePoint: 'anyBeat',   // Can transition out on any beat
        
        // Bounce height syncs to beat intensity
        amplitudeSync: {
            onBeat: 1.8,      // Higher bounce on beat
            offBeat: 0.6,     // Lower between beats
            curve: 'bounce'   // Natural bounce curve
        },
        
        // Frequency can sync to tempo
        frequencySync: {
            mode: 'tempo',    // Bounces per beat scale with BPM
            multiplier: 1.0   // 1 bounce per beat
        },
        
        // Duration syncs to musical time
        durationSync: {
            mode: 'beats',    // Duration in beats
            beats: 4          // Bounce for 4 beats (1 bar in 4/4)
        },
        
        // Accent response for stronger downbeats
        accentResponse: {
            enabled: true,
            multiplier: 1.5   // 50% higher on accented beats
        },
        
        // Pattern-specific bouncing styles
        patternOverrides: {
            'waltz': {
                // 3/4 time creates elegant triple bounce
                frequencySync: { multiplier: 0.75 },
                durationSync: { beats: 3 }
            },
            'swing': {
                // Jazzy swing bounce with syncopation
                amplitudeSync: { onBeat: 2.0, offBeat: 0.4, curve: 'ease' }
            },
            'dubstep': {
                // Heavy drop on beat 3
                amplitudeSync: { 
                    onBeat: 1.5,
                    dropBeat: 3.0,  // Massive bounce on the drop
                    curve: 'pulse'
                }
            },
            'breakbeat': {
                // Chaotic broken rhythm bouncing
                frequencySync: { multiplier: 1.5 },
                amplitudeSync: { onBeat: 2.2, offBeat: 0.3 }
            }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * Called once when gesture starts
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     */
    initialize: function(particle, motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        particle.gestureData.bounce = {
            startY: particle.y,
            startX: particle.x,
            startVx: particle.vx,
            startVy: particle.vy,
            initialized: true
        };
    },
    
    /**
     * Apply bounce motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.bounce?.initialized) {
            this.initialize(particle, motion);
        }
        
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Apply easing
        const easeProgress = this.easeInOutCubic(progress);
        
        // Calculate oscillation
        let frequency = config.frequency;
        const phase = motion.phase || 0;
        
        // Apply rhythm modulation if present
        let amplitude = config.amplitude * strength * particle.scaleFactor;
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            // Frequency modulation for tempo sync
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }
        
        const oscillation = Math.sin((easeProgress + phase) * Math.PI * 2 * frequency);
        if (config.damping && progress > 0.7) {
            // Reduce amplitude toward end of animation
            const dampProgress = (progress - 0.7) / 0.3;
            amplitude *= (1 - dampProgress * 0.8);
        }
        
        // Apply motion based on axis
        if (config.axis === 'vertical') {
            particle.vy += oscillation * amplitude * 0.01 * dt;
            
            // Dampen horizontal movement slightly for stability
            if (progress > 0.9) {
                particle.vx *= 0.98;
            }
        } else if (config.axis === 'horizontal') {
            particle.vx += oscillation * amplitude * 0.01 * dt;
            
            // Dampen vertical movement slightly for stability
            if (progress > 0.9) {
                particle.vy *= 0.98;
            }
        }
        
        // Smooth ending - gradually reduce velocity modifications
        if (progress > 0.9) {
            const endFactor = 1 - ((progress - 0.9) * 10);
            particle.vx = particle.vx * (0.95 + endFactor * 0.05);
            particle.vy = particle.vy * (0.95 + endFactor * 0.05);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        if (particle.gestureData?.bounce) {
            delete particle.gestureData.bounce;
        }
    },
    
    /**
     * Easing function for smooth animation
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic: function(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
};