/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Spin Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Spin gesture - orbital rotation around center
 * @author Emotive Engine Team
 * @module gestures/transforms/spin
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a spinning vortex effect with particles orbiting around the center.       
 * ║ This is an OVERRIDE gesture that completely replaces particle motion.             
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ↻ Clockwise rotation
 *      · → ·
 *     ↓     ↑
 *    · ← ⭐ → ·
 *     ↑     ↓  
 *      · ← ·
 * 
 * USED BY:
 * - Dizzy/confused states
 * - Celebration spins
 * - Whirlwind effects
 * - Portal/vortex animations
 */

/**
 * Spin gesture configuration and implementation
 */
export default {
    name: 'spin',
    emoji: '🌀',
    type: 'override', // Completely replaces motion
    description: 'Orbital rotation around center point',
    
    // Default configuration (from gestureConfig.js)
    config: {
        duration: 600,          // Animation duration in ms
        rotations: 1,           // Number of full rotations (was 2, now from config)
        direction: 'clockwise', // 'clockwise' or 'counter-clockwise'
        radiusMultiplier: 1.0,  // Orbital radius on orb perimeter (was 1.2)
        spiralOut: false,       // Spiral outward while spinning
        accelerate: true,       // Speed up then slow down
        maintainDistance: true, // Keep relative distance from center
        scaleAmount: 0.1,       // Scale change during spin (from config)
        easing: 'linear',       // Linear for complete rotation
        strength: 0.7,          // Particle motion strength (from config)
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'orbital',
            strength: 0.7,
            rotations: 1,
            radius: 1.0
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
        
        // Calculate starting position relative to center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.spin = {
            startAngle: Math.atan2(dy, dx),
            startRadius: Math.sqrt(dx * dx + dy * dy) || 30, // Min radius if at center
            originalX: particle.x,
            originalY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            initialized: true
        };
    },
    
    /**
     * Apply spin motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.spin?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.spin;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Apply acceleration curve if enabled
        let speedProgress = progress;
        if (config.accelerate) {
            // Speed up for first half, slow down for second half
            if (progress < 0.5) {
                speedProgress = this.easeInQuad(progress * 2) * 0.5;
            } else {
                speedProgress = 0.5 + this.easeOutQuad((progress - 0.5) * 2) * 0.5;
            }
        }
        
        // Calculate rotation angle
        const rotationAmount = config.rotations * Math.PI * 2 * strength;
        const direction = config.direction === 'counter-clockwise' ? -1 : 1;
        const currentAngle = data.startAngle + (rotationAmount * speedProgress * direction);
        
        // Calculate radius (with optional spiral)
        let currentRadius = data.startRadius;
        if (config.spiralOut) {
            currentRadius *= (1 + progress * 0.5); // Expand by 50%
        }
        if (config.radiusMultiplier !== 1) {
            // Apply radius multiplier with smooth curve
            const radiusCurve = Math.sin(progress * Math.PI); // Peak at middle
            currentRadius *= (1 + (config.radiusMultiplier - 1) * radiusCurve);
        }
        
        // Calculate target position
        const targetX = centerX + Math.cos(currentAngle) * currentRadius;
        const targetY = centerY + Math.sin(currentAngle) * currentRadius;
        
        // For override gesture, directly set position with smooth interpolation
        const moveSpeed = 0.25; // Adjust for smoothness
        particle.x += (targetX - particle.x) * moveSpeed;
        particle.y += (targetY - particle.y) * moveSpeed;
        
        // Set velocity to match movement (for trail effects)
        particle.vx = (targetX - particle.x) * 0.5;
        particle.vy = (targetY - particle.y) * 0.5;
        
        // Smooth ending - return to original velocities
        if (progress > 0.9) {
            const endFactor = (1 - progress) * 10;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        if (particle.gestureData?.spin) {
            // Restore original velocities
            const data = particle.gestureData.spin;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.spin;
        }
    },
    
    /**
     * Easing function for acceleration
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInQuad: function(t) {
        return t * t;
    },
    
    /**
     * Easing function for deceleration
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeOutQuad: function(t) {
        return t * (2 - t);
    }
};