/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jitter Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'jitter',
    type: 'blending',
    emoji: '🫨',
    description: 'Nervous jittery movement',
    
    config: {
        duration: 1000,
        intensity: 15,  // Increased for more visible jitter
        frequency: 30,  // Higher frequency
        strength: 1.0  // Full strength
    },
    
    // Rhythm configuration - jitter intensifies on beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        
        // Jitter intensity syncs to beat
        amplitudeSync: {
            onBeat: 2.0,      // Double jitter on beat
            offBeat: 0.5,     // Calmer between beats
            curve: 'pulse'    // Sharp attack
        },
        
        // Different patterns create different nervousness
        patternOverrides: {
            'breakbeat': {
                // Chaotic jitter for breakbeat
                amplitudeSync: { onBeat: 3.0, offBeat: 0.3 }
            },
            'dubstep': {
                // Freeze then explode
                amplitudeSync: { onBeat: 5.0, offBeat: 0.1, curve: 'pulse' }
            }
        }
    },
    
    /**
     * Apply jitter motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Store original values on first frame
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        if (!particle.gestureData.jitter) {
            particle.gestureData.jitter = {
                originalSize: particle.size
            };
        }
        
        const config = { ...this.config, ...motion };
        let intensity = config.intensity || this.config.intensity;
        const strength = config.strength || this.config.strength;
        
        // Apply rhythm modulation if present
        if (motion.rhythmModulation) {
            intensity *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            intensity *= (motion.rhythmModulation.accentMultiplier || 1);
        }
        
        // Random jitter in both directions
        const jitterX = (Math.random() - 0.5) * intensity * strength;
        const jitterY = (Math.random() - 0.5) * intensity * strength;
        
        // Apply jitter with decreasing intensity over time
        const fadeOut = 1 - progress * 0.5;
        particle.vx += jitterX * 0.1 * dt * fadeOut;
        particle.vy += jitterY * 0.1 * dt * fadeOut;
        
        // Slight size variation for nervous effect
        particle.size = particle.baseSize * (1 + (Math.random() - 0.5) * 0.1);
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        // Reset to original values
        if (particle.gestureData?.jitter) {
            particle.size = particle.gestureData.jitter.originalSize;
            delete particle.gestureData.jitter;
        } else {
            particle.size = particle.baseSize;
        }
        
        // Dampen velocity to help particle settle
        particle.vx *= 0.7;
        particle.vy *= 0.7;
    }
};