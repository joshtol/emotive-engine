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
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
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
        duration: 800,      // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
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
    initialize(particle, _motion) {
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
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.bounce?.initialized) {
            this.initialize(particle, motion);
        }
        
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Apply easing
        const easeProgress = this.easeInOutCubic(progress);
        
        // Calculate oscillation
        let {frequency} = config;
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
    cleanup(particle) {
        if (particle.gestureData?.bounce) {
            delete particle.gestureData.bounce;
        }
    },
    
    /**
     * Easing function for smooth animation
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    /**
     * 3D core translation
     * Maps bounce motion to 3D transforms with proper squash/stretch
     */
    '3d': {
        /**
         * Evaluate 3D properties at given progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} 3D transform properties {position, rotation, scale}
         */
        evaluate(progress, motion) {
            const config = motion || {};
            const amplitudePixels = config.amplitude || 30;
            const frequency = config.frequency || 2;
            const strength = config.strength || 0.6;

            // Scale pixels to 3D units
            const PIXEL_TO_3D = 0.008; // 30px = 0.24 units
            const amplitude = amplitudePixels * PIXEL_TO_3D * strength;

            // Apply easing
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Calculate bounce with proper physics curve
            // Use abs(sin) for bounce effect - always positive (up from ground)
            const bouncePhase = easeProgress * Math.PI * frequency;
            const bounceHeight = Math.abs(Math.sin(bouncePhase));

            // Apply damping
            let dampedAmplitude = amplitude;
            if (progress > 0.7) {
                const dampProgress = (progress - 0.7) / 0.3;
                dampedAmplitude *= (1 - dampProgress * 0.8);
            }

            // Y position - bounce up from neutral
            const yPosition = bounceHeight * dampedAmplitude;

            // Squash and stretch based on vertical velocity
            // At bottom (height = 0): squash (wider, shorter)
            // At peak (height = 1): stretch (narrower, taller)
            const squashStretch = 1 + (bounceHeight - 0.5) * 0.15; // ±7.5% scale
            const scaleY = squashStretch;
            const scaleX = 2 - squashStretch; // Inverse for volume conservation

            return {
                position: [0, yPosition, 0],
                rotation: [0, 0, 0],
                scale: [scaleX, scaleY, scaleX] // XZ squash, Y stretch
            };
        }
    }
};