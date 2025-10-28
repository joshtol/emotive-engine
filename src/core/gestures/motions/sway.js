/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sway Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export default {
    name: 'sway',
    type: 'blending',
    emoji: '🌊',
    description: 'Gentle side-to-side swaying motion',
    
    config: {
        duration: 2000,
        amplitude: 20,
        frequency: 1,
        strength: 0.5
    },
    
    // Rhythm configuration - sway naturally follows the beat
    rhythm: {
        enabled: true,
        syncMode: 'bar',  // Sway completes one cycle per bar
        
        // Amplitude increases on downbeats
        amplitudeSync: {
            onBeat: 1.2,
            offBeat: 0.9,
            curve: 'ease'  // Smooth transitions
        },
        
        // Duration syncs to bars for natural rhythm
        durationSync: {
            mode: 'bars',
            bars: 1  // One full sway per bar
        },
        
        // Pattern-specific swaying
        patternOverrides: {
            'waltz': {
                // 3/4 time creates elegant waltz sway
                durationSync: { bars: 1 },
                amplitudeSync: { onBeat: 1.5, curve: 'ease' }
            },
            'swing': {
                // Jazzy swing sway
                amplitudeSync: { onBeat: 1.3, offBeat: 0.7, curve: 'bounce' }
            }
        }
    },
    
    /**
     * Apply sway motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, _centerX, _centerY) {
        const config = { ...this.config, ...motion };
        const amplitude = config.amplitude || this.config.amplitude;
        const frequency = config.frequency || this.config.frequency;
        const strength = config.strength || this.config.strength;
        
        // Smooth side-to-side motion
        const sway = Math.sin(progress * Math.PI * 2 * frequency) * amplitude;
        
        // Apply horizontal sway
        particle.vx += sway * 0.01 * dt * strength;
        
        // Slight vertical drift for natural feel
        particle.vy += Math.cos(progress * Math.PI * 4) * 0.5 * dt * strength;
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(_particle) {
        // No cleanup needed for sway
    }
};