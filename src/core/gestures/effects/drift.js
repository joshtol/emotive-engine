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
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
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
        distance: 50,          // Maximum drift distance
        angle: 45,             // Primary drift direction
        returnToOrigin: true,  // Return to starting position
        fadeOut: false,        // Apply fade effect during drift (disabled to prevent disappearing)
        holdTime: 0.2,         // Pause duration at drift peak
        turbulence: 0.1,       // Random movement variation amount
        angleSpread: 45,       // Directional spread range
        smoothness: 0.08,      // Movement fluidity factor
        easing: 'ease',        // Animation curve type
        strength: 1.0,         // Overall drift intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'drift',
            strength: 1.0,     // Drift motion strength
            distance: 60       // Maximum drift distance
        }
    },
    
    // Rhythm configuration - ethereal drift following ambient musical textures
    rhythm: {
        enabled: true,
        syncMode: 'ambient',  // Sync to ambient musical textures
        
        // Distance varies with musical dynamics
        distanceSync: {
            quiet: 30,            // Small drift in quiet sections
            loud: 80,             // Large drift in loud sections
            crescendo: 'expand',  // Expand drift on crescendos
            diminuendo: 'contract' // Contract drift on diminuendos
        },
        
        // Angle follows harmonic progression
        angleSync: {
            major: 45,            // Upward drift in major keys
            minor: 225,           // Downward drift in minor keys
            modulation: 'smooth', // Smooth angle changes
            cadence: 'return'     // Return to center on cadences
        },
        
        // Hold time syncs to phrase length
        holdSync: {
            shortPhrase: 0.1,     // Brief hold for short phrases
            longPhrase: 0.4,      // Extended hold for long phrases
            fermata: 'sustain'    // Sustain hold on fermatas
        },
        
        // Gentle accent response
        accentResponse: {
            enabled: true,
            multiplier: 1.3,      // Subtle drift increase on accents
            type: 'distance'      // Accent affects drift distance
        },
        
        // Pattern-specific drift styles
        patternOverrides: {
            'ambient': {
                // Slow, ethereal drifting
                distanceSync: { quiet: 40, loud: 100 },
                holdSync: { shortPhrase: 0.3, longPhrase: 0.6 }
            },
            'classical': {
                // Elegant, controlled drifting
                angleSync: { major: 30, minor: 210 },
                distanceSync: { quiet: 25, loud: 60 }
            },
            'jazz': {
                // Syncopated, unpredictable drifting
                angleSync: { 
                    major: 60, 
                    minor: 240,
                    swing: true,
                    syncopated: true
                }
            },
            'new_age': {
                // Meditative, flowing drift
                distanceSync: { quiet: 35, loud: 70 },
                holdSync: { shortPhrase: 0.4, longPhrase: 0.8 },
                angleSync: { modulation: 'gradual' }
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Expansive, bold drifting
                distanceSync: { 
                    quiet: { multiplier: 1.5 },
                    loud: { multiplier: 1.8 }
                },
                holdSync: { multiplier: 1.2 },
                accentResponse: { multiplier: 1.6 }
            },
            piano: {
                // Delicate, subtle drifting
                distanceSync: { 
                    quiet: { multiplier: 0.6 },
                    loud: { multiplier: 0.8 }
                },
                holdSync: { multiplier: 0.8 },
                accentResponse: { multiplier: 1.1 }
            }
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
            driftAngle,
            angleOffset,
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
    apply(particle, progress, motion, dt, centerX, centerY) {
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
    cleanup(particle) {
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
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutQuad(t) {
        return t * (2 - t);
    }
};