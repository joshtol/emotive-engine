/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Float Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'float',
    type: 'blending',
    emoji: '🎈',
    description: 'Gentle floating upward motion',
    
    config: {
        duration: 2000,
        amplitude: 80,  // Increased for more visible effect
        wobbleAmount: 20,  // More wobble
        strength: 1.0  // Full strength
    },
    
    /**
     * Apply float motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Store original values on first frame
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        if (!particle.gestureData.float) {
            particle.gestureData.float = {
                originalSize: particle.size,
                originalOpacity: particle.opacity || 1
            };
        }
        
        const config = { ...this.config, ...motion };
        const amplitude = config.amplitude || this.config.amplitude;
        const wobbleAmount = config.wobbleAmount || this.config.wobbleAmount;
        const strength = config.strength || this.config.strength;
        
        // Upward floating with slight wobble
        const wobble = Math.sin(progress * Math.PI * 4) * wobbleAmount;
        
        // Apply upward force and wobble
        particle.vy -= amplitude * 0.01 * dt * strength * (1 - progress * 0.5);
        particle.vx += wobble * 0.01 * dt * strength;
        
        // Slight size variation for depth effect
        particle.size = particle.baseSize * (1 + progress * 0.1);
        
        // Fade slightly as it floats up
        particle.opacity = 1 - progress * 0.3;
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        // Reset to original values
        if (particle.gestureData?.float) {
            particle.opacity = particle.gestureData.float.originalOpacity;
            particle.size = particle.gestureData.float.originalSize;
            delete particle.gestureData.float;
        } else {
            // Fallback if no data stored
            particle.opacity = 1;
            particle.size = particle.baseSize;
        }
        
        // Dampen velocity to help particle settle
        particle.vx *= 0.5;
        particle.vy *= 0.5;
    }
};