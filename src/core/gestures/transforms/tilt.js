/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Tilt Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Tilt gesture - particles gather and sway together
 * @author Emotive Engine Team
 * @module gestures/transforms/tilt
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a cohesive tilting motion where particles first gather toward the center, 
 * ║ then tilt and sway as a unified group. Perfect for curious or questioning         
 * ║ expressions, like a head tilt.                                                    
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Phase 1: Gather    Phase 2: Tilt Left    Phase 3: Tilt Right
 *      · · ·               ↖ ⭐                    ⭐ ↗
 *     · · · ·      →      ↖ ⭐ ⭐        →      ⭐ ⭐ ↗
 *      · · ·               ↖ ⭐                    ⭐ ↗
 *    (scattered)         (tilted left)         (tilted right)
 * 
 * USED BY:
 * - Curiosity/questioning states
 * - Contemplation animations
 * - Playful head-tilt effects
 * - Character personality expressions
 */

/**
 * Tilt gesture configuration and implementation
 */
export default {
    name: 'tilt',
    emoji: '🤔',
    type: 'override', // Completely replaces motion
    description: 'Gather particles then tilt as unified group',
    
    // Default configuration
    config: {
        duration: 500,         // Animation duration
        gatherPhase: 0.2,      // Gathering phase ratio
        tiltAngle: 45,         // Maximum tilt angle in degrees
        swayAmount: 80,        // Horizontal sway distance
        liftAmount: 60,        // Vertical lift distance during tilt
        frequency: 3,          // Number of tilt cycles
        homeRadius: 20,        // Gathering radius from center
        easing: 'sine',        // Animation curve type
        strength: 2.5,         // Overall motion intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'tilt',
            strength: 2.5,
            frequency: 3,
            swayAmount: 80,
            liftAmount: 60
        },
        smoothness: 0.25       // Movement smoothing factor
    },
    
    // Rhythm configuration - tilts sync to swing rhythm
    rhythm: {
        enabled: true,
        syncMode: 'swing',  // Tilt with swing feel
        
        // Tilt angle syncs to beat pattern
        angleSync: {
            onBeat: 45,                      // Full tilt on beat
            offBeat: -30,                    // Counter-tilt off beat
            swing: 15,                       // Extra tilt on swing beats
            subdivision: 'triplet',          // Triplet feel for smooth sway
            curve: 'ease-in-out'            // Smooth tilt transitions
        },
        
        // Gathering phase timing
        gatherSync: {
            beatsBefore: 0.5,                // Gather half beat before tilt
            releaseAfter: 0.25,              // Release quarter beat after
            intensity: 'dynamic'             // Gather speed varies with tempo
        },
        
        // Sway amount modulation
        swaySync: {
            verse: 60,                       // Gentle sway in verse
            chorus: 100,                     // Big sway in chorus
            bridge: 80,                      // Medium in bridge
            syncopated: true                 // Off-beat emphasis
        },
        
        // Lift coordination
        liftSync: {
            upOnTilt: true,                  // Lift when tilting
            heightOnAccent: 80,              // Higher lift on accents
            normalHeight: 40,                // Standard lift height
            curve: 'bounce'                  // Bouncy lift motion
        },
        
        // Musical expression
        dynamics: {
            forte: { tiltAngle: 60, swayAmount: 120, frequency: 4 },
            piano: { tiltAngle: 20, swayAmount: 40, frequency: 2 }
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        // Calculate initial position and angle
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Assign a role for variation (some particles lag slightly)
        const role = Math.random();
        
        // Calculate home position (where particle gathers to)
        const config = { ...this.config, ...motion };
        const homeRadius = (config.homeRadius + Math.random() * 20) * particle.scaleFactor;
        
        particle.gestureData.tilt = {
            startX: particle.x,
            startY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            angle,
            distance,
            homeRadius,
            homeX: centerX + Math.cos(angle) * homeRadius,
            homeY: centerY + Math.sin(angle) * homeRadius,
            role, // Variation factor for timing and smoothness
            initialized: true
        };
    },
    
    /**
     * Apply tilt motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.tilt?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.tilt;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        let targetX, targetY;
        
        if (progress < config.gatherPhase) {
            // PHASE 1: Gather toward center
            const gatherProgress = progress / config.gatherPhase;
            const easedGather = this.easeInOutCubic(gatherProgress);
            
            // Interpolate from start to home position
            targetX = data.startX + (data.homeX - data.startX) * easedGather;
            targetY = data.startY + (data.homeY - data.startY) * easedGather;
            
            // Apply gathering motion
            const speed = 0.6;  // Gathering speed factor
            particle.x += (targetX - particle.x) * speed;
            particle.y += (targetY - particle.y) * speed;
            
        } else {
            // PHASE 2: Tilting motion
            const tiltPhase = (progress - config.gatherPhase) / (1 - config.gatherPhase);
            const t = tiltPhase * Math.PI * config.frequency;
            const tiltProgress = Math.sin(t);
            
            // Convert tilt angle to radians
            const maxTiltRad = (config.tiltAngle * Math.PI / 180) * strength;
            
            // Calculate sway angle (oscillates left and right)
            const swayAngle = data.angle + (tiltProgress * maxTiltRad);
            
            // Add lift effect (particles rise slightly during tilt)
            const liftAmount = Math.abs(tiltProgress) * config.liftAmount * particle.scaleFactor;
            const currentRadius = data.homeRadius + liftAmount;
            
            // Calculate target position with tilt
            targetX = centerX + Math.cos(swayAngle) * currentRadius;
            targetY = centerY + Math.sin(swayAngle) * currentRadius - liftAmount * 0.3; // Add upward bias
            
            // Apply role-based variation (some particles lag)
            const smoothness = config.smoothness + data.role * 0.1;
            
            // Smooth movement to target
            particle.x += (targetX - particle.x) * smoothness;
            particle.y += (targetY - particle.y) * smoothness;
            
            // Add subtle rotation feel with velocity
            const tangentX = -Math.sin(swayAngle);
            const tangentY = Math.cos(swayAngle);
            particle.vx = tangentX * tiltProgress * 2;
            particle.vy = tangentY * tiltProgress * 2;
        }
        
        // Store current velocity for trails
        if (progress < config.gatherPhase) {
            particle.vx = (targetX - particle.x) * 0.25;
            particle.vy = (targetY - particle.y) * 0.25;
        }
        
        // Smooth ending - return to original velocities
        if (progress > 0.9) {
            const endFactor = (1 - progress) * 10;
            const returnX = data.startX + (particle.x - data.startX) * endFactor;
            const returnY = data.startY + (particle.y - data.startY) * endFactor;
            
            particle.x = returnX;
            particle.y = returnY;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.tilt) {
            const data = particle.gestureData.tilt;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.tilt;
        }
    },
    
    /**
     * Easing function for smooth animation
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
};