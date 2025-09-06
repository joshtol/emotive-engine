/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Drift Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Drift gesture - controlled floating motion
 * @author Emotive Engine Team
 * @module gestures/effects/drift
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a dreamy drifting effect where particles float outward then return home.  
 * ║ This is an OVERRIDE gesture with smooth, controlled movement and fading effects.  
 * ║ Perfect for transitions, sleepy states, or ethereal moments.                      
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Start         Drift Out        Hold         Return
 *      ⭐           · · ⭐           · · ·          ⭐
 *     ⭐⭐    →    · ⭐ · ⭐    →   · · · ·    →   ⭐⭐
 *      ⭐           ⭐ · ·           · · ·          ⭐
 *   (grouped)     (spread)        (faded)      (regrouped)
 * 
 * USED BY:
 * - Sleepy/drowsy states
 * - Dreamy transitions
 * - Dispersal effects
 * - Meditation/calm states
 */

/**
 * Drift gesture configuration and implementation
 */
export default {
    name: 'drift',
    emoji: '☁️',
    type: 'override', // Completely replaces motion
    description: 'Controlled floating with fade effects',
    
    // Default configuration
    config: {
        duration: 800,         // Animation duration
        distance: 50,          // Maximum drift distance (from gestureConfig)
        angle: 45,             // Direction in degrees
        returnToOrigin: true,  // Return to starting position (was returnToCenter)
        fadeOut: true,         // Fade during drift
        holdTime: 0.2,         // Time to hold at drift peak (0-1)
        turbulence: 0.1,       // Random movement variation
        angleSpread: 45,       // Spread angle in degrees
        easing: 'sine',
        strength: 0.8,
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'drift',
            strength: 0.8,
            distance: 60,
            returnToOrigin: true
        },
        smoothness: 0.12       // Movement smoothness
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
        
        // Calculate drift direction
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        let driftAngle = Math.atan2(dy, dx);
        
        // Add some spread to the drift angle
        const config = { ...this.config, ...motion };
        const spreadRad = (config.angleSpread * Math.PI / 180);
        const angleOffset = (Math.random() - 0.5) * spreadRad;
        driftAngle += angleOffset;
        
        // Determine home position (closer to center)
        const homeRadius = 30 + Math.random() * 30;
        
        particle.gestureData.drift = {
            startX: particle.x,
            startY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            baseOpacity: particle.opacity || particle.life || 1,
            driftAngle: driftAngle,
            angleOffset: angleOffset,
            homeRadius: homeRadius * particle.scaleFactor,
            homeX: centerX + Math.cos(driftAngle) * homeRadius,
            homeY: centerY + Math.sin(driftAngle) * homeRadius,
            role: Math.random(), // 0-1 for timing variation
            turbulencePhase: Math.random() * Math.PI * 2,
            initialized: true
        };
    },
    
    /**
     * Apply drift motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.drift?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.drift;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Apply easing
        const easeProgress = this.easeInOutCubic(progress);
        
        // Add role-based phase shift for staggered movement
        const adjustedPhase = Math.max(0, easeProgress - data.role * 0.1);
        
        let targetX, targetY;
        let currentRadius;
        
        // Determine phase of drift
        if (!config.returnToOrigin) {
            // Simple outward drift
            const driftProgress = adjustedPhase;
            currentRadius = data.homeRadius + driftProgress * config.distance * strength * particle.scaleFactor;
            
        } else if (adjustedPhase < 0.4) {
            // Phase 1: Move to home position
            const homeProgress = adjustedPhase / 0.4;
            const easedHome = this.easeOutQuad(homeProgress);
            targetX = data.startX + (data.homeX - data.startX) * easedHome;
            targetY = data.startY + (data.homeY - data.startY) * easedHome;
            
        } else if (adjustedPhase < 0.6 + config.holdTime) {
            // Phase 2: Drift outward
            const driftPhase = (adjustedPhase - 0.4) / (0.2 + config.holdTime);
            currentRadius = data.homeRadius + 
                Math.sin(driftPhase * Math.PI * 0.5) * config.distance * strength * particle.scaleFactor;
            
        } else {
            // Phase 3: Return to origin
            const returnPhase = (adjustedPhase - 0.6 - config.holdTime) / (0.4 - config.holdTime);
            currentRadius = data.homeRadius + 
                Math.cos(returnPhase * Math.PI * 0.5) * config.distance * strength * particle.scaleFactor;
        }
        
        // Calculate position with turbulence
        if (currentRadius !== undefined) {
            // Add turbulence
            data.turbulencePhase += config.turbulence * dt;
            const turbulenceX = Math.sin(data.turbulencePhase) * config.turbulence * 10;
            const turbulenceY = Math.cos(data.turbulencePhase * 1.3) * config.turbulence * 10;
            
            const angle = data.driftAngle + data.angleOffset;
            targetX = centerX + Math.cos(angle) * currentRadius + turbulenceX;
            targetY = centerY + Math.sin(angle) * currentRadius + turbulenceY;
        }
        
        // Smooth movement with role variation
        const smoothness = config.smoothness + data.role * 0.08;
        particle.x += (targetX - particle.x) * smoothness;
        particle.y += (targetY - particle.y) * smoothness;
        
        // Set velocity for trails
        particle.vx = (targetX - particle.x) * 0.25;
        particle.vy = (targetY - particle.y) * 0.25;
        
        // Apply fade effect
        if (config.fadeOut) {
            let fadeFactor;
            
            if (progress < 0.25) {
                // Fade in
                fadeFactor = 0.3 + (progress / 0.25) * 0.7;
            } else if (progress < 0.75) {
                // Main phase with sine variation
                fadeFactor = 0.7 + Math.sin((progress - 0.25) * Math.PI / 0.5) * 0.3;
            } else {
                // Fade back
                fadeFactor = (1 - progress) * 4;
            }
            
            particle.opacity = data.baseOpacity * fadeFactor;
            if (particle.life !== undefined) {
                particle.life = particle.opacity;
            }
        }
        
        // Clean ending
        if (progress >= 0.99) {
            particle.vx = data.originalVx * 0.1;
            particle.vy = data.originalVy * 0.1;
            
            if (config.fadeOut) {
                particle.opacity = data.baseOpacity;
                if (particle.life !== undefined) {
                    particle.life = data.baseOpacity;
                }
            }
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup: function(particle) {
        if (particle.gestureData?.drift) {
            const data = particle.gestureData.drift;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            particle.opacity = data.baseOpacity;
            if (particle.life !== undefined) {
                particle.life = data.baseOpacity;
            }
            delete particle.gestureData.drift;
        }
    },
    
    /**
     * Easing functions
     */
    easeInOutCubic: function(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutQuad: function(t) {
        return t * (2 - t);
    }
};