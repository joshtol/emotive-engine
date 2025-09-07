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
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize: function(particle, motion, centerX, centerY) {
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
            angle: angle,
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
    apply: function(particle, progress, motion, dt, centerX, centerY) {
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
        const frequency = config.frequency;
        const rawPulse = (easeProgress * frequency * 2) % 2;
        
        if (config.holdPeak > 0 && rawPulse > (1 - config.holdPeak) && rawPulse < (1 + config.holdPeak)) {
            // Hold at peak
            pulseValue = 1;
        } else {
            // Normal sine wave
            pulseValue = Math.sin(easeProgress * Math.PI * 2 * frequency);
        }
        
        // Calculate expansion amount
        const expansion = pulseValue * config.amplitude * strength * particle.scaleFactor;
        
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
    cleanup: function(particle) {
        if (particle.gestureData?.pulse) {
            delete particle.gestureData.pulse;
        }
    },
    
    /**
     * Sine easing for smooth breathing motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine: function(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
};