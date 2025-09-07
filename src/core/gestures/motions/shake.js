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
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     */
    initialize: function(particle, motion) {
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
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.shake?.initialized) {
            this.initialize(particle, motion);
        }
        
        const data = particle.gestureData.shake;
        const config = { ...this.config, ...motion };
        const strength = config.strength || this.config.strength || 1.0;
        
        // Match orb shake logic for synchronized movement
        // Apply decay if enabled to reduce intensity over time
        const decay = config.decay ? (1 - progress) : 1;
        const shake = Math.sin(progress * Math.PI * config.frequency) * config.amplitude * decay * strength * particle.scaleFactor;
        
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
    pseudoRandom: function(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        if (particle.gestureData?.shake) {
            // Restore original position
            particle.x = particle.gestureData.shake.originalX;
            particle.y = particle.gestureData.shake.originalY;
            delete particle.gestureData.shake;
        }
    }
};