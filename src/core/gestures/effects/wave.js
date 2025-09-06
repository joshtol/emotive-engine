/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wave Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wave gesture - infinity pattern flow
 * @author Emotive Engine Team
 * @module gestures/effects/wave
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a flowing wave motion with particles moving in an infinity (∞) pattern.   
 * ║ This is an OVERRIDE gesture that creates smooth, hypnotic figure-8 movements.     
 * ║ Particles phase in and out for a dreamlike effect.                                
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *        ∞ Infinity Pattern
 *      ↗ → ↘     ↙ ← ↖
 *     ⭐     ⭐ ⭐     ⭐
 *      ↖ ← ↙     ↘ → ↗
 *         (continuous flow)
 * 
 * USED BY:
 * - Hypnotic/mesmerizing effects
 * - Dreamy transitions
 * - Magical gestures
 * - Flow states
 */

/**
 * Wave gesture configuration and implementation
 */
export default {
    name: 'wave',
    emoji: '🌊',
    type: 'override', // Completely replaces motion
    description: 'Infinity pattern flow with phasing',
    
    // Default configuration
    config: {
        duration: 2500,        // Animation duration (from gestureConfig)
        amplitude: 40,         // Width of the infinity pattern (from gestureConfig)
        frequency: 1,          // Number of complete cycles
        phaseShift: 0.3,       // Phase difference between particles
        liftHeight: 20,        // Vertical lift during wave
        fadeInOut: true,       // Fade particles during motion
        smoothness: 0.1,       // Movement smoothness
        easing: 'sine',        // Easing function
        strength: 1.0,         // Motion strength
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'wave',
            strength: 1.0,
            amplitude: 50
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
        
        // Calculate initial position relative to center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const angle = Math.atan2(dy, dx);
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        particle.gestureData.wave = {
            startX: particle.x,
            startY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            baseOpacity: particle.opacity || particle.life || 1,
            angle: angle,
            radius: radius,
            offset: Math.random() * Math.PI * 2, // Random phase offset
            role: Math.random(), // 0-1 for variation
            initialized: true
        };
    },
    
    /**
     * Apply wave motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.wave?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.wave;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Apply easing to progress
        const easeProgress = this.easeInOutSine(progress);
        
        // Add phase shift based on particle role (creates wave effect)
        const phaseShift = data.role * config.phaseShift;
        const adjustedPhase = Math.max(0, easeProgress - phaseShift);
        
        // Calculate infinity pattern (lemniscate)
        const t = adjustedPhase * Math.PI * 2 * config.frequency + data.offset;
        
        // Scale amplitude based on distance from center
        const radiusFactor = 0.5 + (data.radius / 100) * 0.5;
        const amplitude = config.amplitude * radiusFactor * strength * particle.scaleFactor;
        
        // Infinity pattern equations
        const infinityX = Math.sin(t) * amplitude;
        const infinityY = Math.sin(t * 2) * amplitude * 0.3; // Smaller vertical component
        
        // Add vertical lift effect
        const lift = -Math.abs(Math.sin(easeProgress * Math.PI)) * config.liftHeight * particle.scaleFactor;
        
        // Calculate target position
        const targetX = centerX + infinityX;
        const targetY = centerY + infinityY + lift;
        
        // Smooth movement with role-based variation
        const smoothness = config.smoothness + data.role * 0.12;
        
        // Apply position with smoothing
        particle.x += (targetX - particle.x) * smoothness;
        particle.y += (targetY - particle.y) * smoothness;
        
        // Set velocity for trails
        particle.vx = (targetX - particle.x) * 0.3;
        particle.vy = (targetY - particle.y) * 0.3;
        
        // Apply fade effect if enabled
        if (config.fadeInOut) {
            let fadeFactor;
            
            if (adjustedPhase < 0.1) {
                // Fade in
                fadeFactor = adjustedPhase / 0.1;
            } else if (adjustedPhase > 0.9) {
                // Fade out
                fadeFactor = (1 - adjustedPhase) / 0.1;
            } else {
                // Full opacity with sine variation
                fadeFactor = 0.5 + Math.sin(adjustedPhase * Math.PI) * 0.5;
            }
            
            particle.opacity = data.baseOpacity * (0.3 + fadeFactor * 0.7);
            
            // Update life for particles that use it instead of opacity
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
        }
        
        // Smooth ending
        if (progress >= 0.95) {
            const endFactor = (1 - progress) * 20;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
            
            // Restore opacity
            if (config.fadeInOut) {
                particle.opacity = data.baseOpacity * endFactor;
                if (particle.life !== undefined) {
                    particle.life = particle.opacity;
                }
            }
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        if (particle.gestureData?.wave) {
            const data = particle.gestureData.wave;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.opacity = data.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            delete particle.gestureData.wave;
        }
    },
    
    /**
     * Sine easing for smooth wave motion
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutSine: function(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
};