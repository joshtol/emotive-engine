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
    apply(particle, progress, motion, dt, _centerX, _centerY) {
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
    },

    /**
     * 3D translation for jitter gesture
     * Random micro-movements in all directions
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transform { position: [x,y,z], rotation: [x,y,z], scale: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            let intensity = config.intensity || this.config.intensity;
            const strength = config.strength || this.config.strength;

            // Apply rhythm modulation if present
            if (motion.rhythmModulation) {
                intensity *= (motion.rhythmModulation.amplitudeMultiplier || 1);
                intensity *= (motion.rhythmModulation.accentMultiplier || 1);
            }

            // Fade out over time
            const fadeOut = 1 - progress * 0.5;
            const jitterScale = intensity * strength * 0.2 * fadeOut;

            // Random micro-movements in all three axes
            const jitterX = (Math.random() - 0.5) * jitterScale;
            const jitterY = (Math.random() - 0.5) * jitterScale;
            const jitterZ = (Math.random() - 0.5) * jitterScale;

            // Micro rotation jitter
            const rotJitterX = (Math.random() - 0.5) * 0.03 * fadeOut;
            const rotJitterY = (Math.random() - 0.5) * 0.03 * fadeOut;
            const rotJitterZ = (Math.random() - 0.5) * 0.03 * fadeOut;

            // Nervous scale variation
            const scale = 1.0 + (Math.random() - 0.5) * 0.05 * fadeOut;

            return {
                position: [jitterX * 0.25, jitterY * 0.25, jitterZ * 0.25],
                rotation: [rotJitterX * 0.25, rotJitterY * 0.25, rotJitterZ * 0.25],
                scale
            };
        }
    }
};