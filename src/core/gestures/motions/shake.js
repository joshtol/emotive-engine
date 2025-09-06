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
    
    // Default configuration (from gestureConfig.js)
    config: {
        duration: 400,      // Animation duration in ms
        amplitude: 15,      // VIOLENT shake intensity
        frequency: 15,      // Higher frequency for chaos
        decay: 0.9,         // Less decay for sustained violence
        smoothing: 0.1,     // Less smoothing for sharper shakes
        axes: 'both',       // 'both', 'horizontal', 'vertical'
        easing: 'linear',   // Animation easing
        strength: 3.0,      // MUCH stronger particle motion
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'jitter',
            strength: 3.0,
            frequency: 15,
            decay: false    // No decay for consistent violence
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
        
        // EXACTLY MATCH THE ORB SHAKE LOGIC from EmotiveRenderer
        const decay = config.decay ? (1 - progress) : 1;
        const shake = Math.sin(progress * Math.PI * config.frequency) * config.amplitude * decay * strength * particle.scaleFactor;
        
        // Calculate offset using the same formula as the orb
        const offsetX = shake * Math.cos(data.randomAngle);
        const offsetY = shake * Math.sin(data.randomAngle);
        
        // DIRECTLY SET PARTICLE POSITION (like the orb does)
        // This makes particles shake in perfect sync with the orb
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