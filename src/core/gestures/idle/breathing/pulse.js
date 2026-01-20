/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Pulse Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Pulse gesture - radial expansion and contraction
 * @author Emotive Engine Team
 * @module gestures/motions/pulse
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a breathing/heartbeat effect with particles expanding and contracting      
 * ║ radially from the center. This is a BLENDING gesture that modifies positions.     
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *     Expand          Contract         Expand
 *    ← · · · →         → ⭐ ←         ← · · · →
 *    ↖ · · ↗           ↘ ↓ ↙           ↖ · · ↗
 *    · · ⭐ · ·   →    · ⭐ ·     →   · · ⭐ · ·
 *    ↙ · · ↘           ↗ ↑ ↖           ↙ · · ↘
 *    ← · · · →         → ⭐ ←         ← · · · →
 * 
 * USED BY:
 * - Love emotions (heartbeat rhythm)
 * - Breathing/calm states
 * - Emphasis gestures
 */

/**
 * Pulse gesture configuration and implementation
 */
export default {
    name: 'pulse',
    emoji: '💗',
    type: 'blending', // Adds to existing motion
    description: 'Radial expansion and contraction from center',
    
    // Default configuration
    config: {
        duration: 600,      // Animation duration
        amplitude: 30,      // Expansion distance
        frequency: 1,       // Number of pulses
        holdPeak: 0.1,      // Peak expansion hold time
        easing: 'sine',     // Animation curve type
        scaleAmount: 0.2,   // Orb scale variation
        glowAmount: 0.3,    // Orb glow intensity change
        strength: 0.15,     // Particle motion strength
        direction: 'outward', // Radial direction
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 0.15,
            direction: 'outward',
            frequency: 1
        }
    },
    
    // Rhythm configuration - pulse as heartbeat synced to music
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Heartbeat on every beat
        
        // Pulse strength syncs to beat
        amplitudeSync: {
            onBeat: 1.6,      // Strong expansion on beat
            offBeat: 0.8,     // Gentle contraction off beat
            curve: 'pulse'    // Sharp attack, gradual release
        },
        
        // Frequency locks to tempo
        frequencySync: {
            mode: 'locked',   // One pulse per beat
            subdivision: 'quarter'  // Pulse on quarter notes
        },
        
        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 1          // One pulse per beat
        },
        
        // Stronger pulse on downbeats
        accentResponse: {
            enabled: true,
            multiplier: 2.0   // Double strength on accent
        },
        
        // Pattern-specific pulse styles
        patternOverrides: {
            'waltz': {
                // Elegant 3/4 heartbeat
                amplitudeSync: { onBeat: 2.0, offBeat: 0.5 },
                durationSync: { beats: 3 }
            },
            'swing': {
                // Syncopated jazz pulse
                amplitudeSync: { onBeat: 1.8, offBeat: 0.6, curve: 'ease' },
                frequencySync: { subdivision: 'swing' }
            },
            'dubstep': {
                // Deep bass pulse on drop
                amplitudeSync: {
                    onBeat: 1.2,
                    dropBeat: 4.0,  // Massive pulse on beat 3
                    curve: 'pulse'
                }
            },
            'breakbeat': {
                // Erratic heartbeat
                frequencySync: { mode: 'random', range: [0.5, 2.0] },
                amplitudeSync: { onBeat: 2.5, offBeat: 0.3 }
            }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Calculate initial distance and angle from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        particle.gestureData.pulse = {
            baseDistance: distance,
            angle,
            startX: particle.x,
            startY: particle.y,
            initialized: true
        };
    },
    
    /**
     * Apply pulse motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.pulse?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.pulse;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Apply easing
        const easeProgress = this.easeInOutSine(progress);
        
        // Calculate pulse with optional peak hold
        let pulseValue;
        let {frequency} = config;
        let {amplitude} = config;
        
        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }
        
        const rawPulse = (easeProgress * frequency * 2) % 2;
        
        if (config.holdPeak > 0 && rawPulse > (1 - config.holdPeak) && rawPulse < (1 + config.holdPeak)) {
            // Hold at peak
            pulseValue = 1;
        } else {
            // Normal sine wave
            pulseValue = Math.sin(easeProgress * Math.PI * 2 * frequency);
        }
        
        // Calculate expansion amount
        const expansion = pulseValue * amplitude * strength * particle.scaleFactor;
        
        // Calculate target position
        const targetDistance = data.baseDistance + expansion;
        const targetX = centerX + Math.cos(data.angle) * targetDistance;
        const targetY = centerY + Math.sin(data.angle) * targetDistance;
        
        // Smoothly move toward target
        const moveSpeed = 0.15 * dt;
        particle.vx += (targetX - particle.x) * moveSpeed * 0.1;
        particle.vy += (targetY - particle.y) * moveSpeed * 0.1;
        
        // Fade effect at the end
        if (progress > 0.9) {
            const fadeFactor = 1 - ((progress - 0.9) * 10);
            particle.vx *= (0.9 + fadeFactor * 0.1);
            particle.vy *= (0.9 + fadeFactor * 0.1);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.pulse) {
            delete particle.gestureData.pulse;
        }
    },
    
    /**
     * Sine easing for smooth breathing motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    },

    /**
     * 3D core translation
     * Maps pulse motion to 3D transforms
     */
    '3d': {
        /**
         * Evaluate 3D properties at given progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration
         * @returns {Object} 3D transform properties {position, rotation, scale, glowIntensity, glowBoost}
         */
        evaluate(progress, motion) {
            const config = motion || {};
            const frequency = config.frequency || 1;
            const strength = config.strength || 0.15;
            const scaleAmount = config.scaleAmount || 0.2;
            const glowAmount = config.glowAmount || 0.3;

            // Apply easing
            const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;

            // Calculate pulse value
            const pulseValue = Math.sin(easeProgress * Math.PI * 2 * frequency);

            // Calculate glow variation (clamped to ±30% max for more visible effect)
            const glowVariation = Math.max(-0.3, Math.min(0.3, pulseValue * glowAmount * strength * 2));

            // Glow boost for screen-space halo - pulses with heartbeat
            const glowBoost = Math.max(0, pulseValue * 0.8);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0 + pulseValue * scaleAmount * strength,
                glowIntensity: 1.0 + glowVariation,
                glowBoost
            };
        }
    }
};