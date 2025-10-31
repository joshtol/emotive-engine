/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Shake Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Shake gesture - random jitter motion
 * @author Emotive Engine Team
 * @module gestures/motions/shake
 * @complexity ⭐⭐ Intermediate
 * @audience Motion patterns for particle animations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a shaking/vibrating effect with random jitter. Perfect for expressing     
 * ║ nervousness, excitement, or impact effects. This is a BLENDING gesture.           
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *     Frame 1        Frame 2        Frame 3
 *        ⭐      →    ⭐       →      ⭐
 *       ↙↗↘↖         ↖↘↗↙          ↗↖↙↘
 *    (random)      (random)       (random)
 * 
 * USED BY:
 * - Nervous/anxious states
 * - Anger (trembling with rage)
 * - Cold/shivering effects
 * - Impact reactions
 */

/**
 * Shake gesture configuration and implementation
 */
export default {
    name: 'shake',
    emoji: '🫨',
    type: 'blending', // Adds to existing motion
    description: 'Random jitter movement for vibration effects',
    
    // Default configuration
    config: {
        duration: 400,      // Animation duration
        amplitude: 15,      // Shake movement range
        frequency: 15,      // Oscillation speed
        decay: 0.9,         // Intensity reduction over time
        smoothing: 0.1,     // Motion smoothness factor
        axes: 'both',       // Affected axes: 'both', 'horizontal', 'vertical'
        easing: 'linear',   // Animation curve type
        strength: 3.0,      // Overall shake intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'shake',
            strength: 3.0,      // Particle shake strength
            frequency: 15,      // Particle oscillation rate
            decay: false        // Maintain consistent intensity
        }
    },
    
    // Rhythm configuration - shake intensifies with tempo
    rhythm: {
        enabled: true,
        syncMode: 'subdivision',  // Shake on subdivisions
        
        // Shake intensity modulation
        amplitudeSync: {
            subdivision: 'sixteenth',  // Shake on 16th notes
            onBeat: 2.5,              // Violent shake on beat
            offBeat: 0.7,             // Gentler between beats
            curve: 'pulse'            // Sharp attack
        },
        
        // Frequency scales with tempo
        frequencySync: {
            mode: 'tempo',
            baseFrequency: 15,        // Base at 120 BPM
            scaling: 'linear'         // Linear scaling with BPM
        },
        
        // Duration in musical time
        durationSync: {
            mode: 'beats',
            beats: 2                  // Shake for 2 beats
        },
        
        // Pattern-specific shake styles
        patternOverrides: {
            'breakbeat': {
                // Chaotic broken shake
                amplitudeSync: { onBeat: 3.0, offBeat: 0.2 },
                frequencySync: { mode: 'random', range: [8, 20] }
            },
            'dubstep': {
                // Bass wobble shake
                amplitudeSync: {
                    subdivision: 'eighth',
                    onBeat: 4.0,
                    dropBeat: 6.0,  // Massive shake on drop
                    curve: 'pulse'
                }
            },
            'swing': {
                // Jazzy shimmy shake
                amplitudeSync: { onBeat: 1.8, offBeat: 1.0, curve: 'ease' }
            }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     */
    initialize(particle, _motion) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        particle.gestureData.shake = {
            originalX: particle.x,  // Store original position
            originalY: particle.y,  // Store original position
            randomAngle: Math.random() * Math.PI * 2, // Random shake direction per particle
            initialized: true
        };
    },
    
    /**
     * Apply shake motion to particle
     * Creates synchronized vibration effect matching orb shake
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, _dt, _centerX, _centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.shake?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.shake;
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Apply rhythm modulation if present
        let {amplitude} = config;
        let {frequency} = config;
        if (motion.rhythmModulation) {
            amplitude *= (motion.rhythmModulation.amplitudeMultiplier || 1);
            amplitude *= (motion.rhythmModulation.accentMultiplier || 1);
            if (motion.rhythmModulation.frequencyMultiplier) {
                frequency *= motion.rhythmModulation.frequencyMultiplier;
            }
        }
        
        // Match orb shake logic for synchronized movement
        // Apply decay if enabled to reduce intensity over time
        const decay = config.decay ? (1 - progress) : 1;
        const shake = Math.sin(progress * Math.PI * frequency) * amplitude * decay * strength * particle.scaleFactor;
        
        // Calculate directional offset using particle's random angle
        const offsetX = shake * Math.cos(data.randomAngle);
        const offsetY = shake * Math.sin(data.randomAngle);
        
        // Set particle position directly for perfect synchronization
        // Particles shake in unison with the orb
        particle.x = data.originalX + offsetX;
        particle.y = data.originalY + offsetY;
    },
    
    /**
     * Generate pseudo-random number from seed
     * @param {number} seed - Seed value
     * @returns {number} Pseudo-random value between 0 and 1
     */
    pseudoRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.shake) {
            // Restore original position
            particle.x = particle.gestureData.shake.originalX;
            particle.y = particle.gestureData.shake.originalY;
            delete particle.gestureData.shake;
        }
    },

    /**
     * 3D core translation
     * Maps shake motion to 3D transforms
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
            const amplitude = (config.amplitude || 15) * 0.015;
            const frequency = config.frequency || 15;
            const strength = config.strength || 1.0;
            const decay = config.decay ? (1 - progress) : 1;

            // High-frequency shake
            const shake = Math.sin(progress * Math.PI * frequency) * amplitude * decay * strength;

            // Random seed for consistent randomness per frame
            const seed = Math.floor(progress * frequency);
            const randomX = (Math.sin(seed) * 10000) % 1;
            const randomZ = (Math.sin(seed * 1.3) * 10000) % 1;
            const randomRoll = (Math.sin(seed * 1.7) * 10000) % 1;

            return {
                position: [
                    shake * (randomX - 0.5) * 2,
                    0,
                    shake * (randomZ - 0.5) * 2
                ],
                rotation: [0, 0, shake * (randomRoll - 0.5) * 0.5],
                scale: 1.0
            };
        }
    }
};