/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Stretch Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Stretch gesture - scale particles along axes
 * @author Emotive Engine Team
 * @module gestures/transforms/stretch
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Stretches or squashes the particle cloud along X and Y axes independently.        
 * ║ This is an OVERRIDE gesture that directly controls particle positions to          
 * ║ create elastic deformation effects.                                               
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Normal          Stretch X         Stretch Y        Squash
 *      ⭐             ← ⭐ →             ↑               ___
 *     ·⭐·           · · ⭐ · ·          ⭐              ·⭐·
 *      ⭐                                ·               ‾‾‾
 *                                        ·
 *                                        ↓
 * 
 * USED BY:
 * - Elastic animations
 * - Impact effects (squash on hit)
 * - Breathing/pulsing variations
 * - Transition effects
 */

/**
 * Stretch gesture configuration and implementation
 */
export default {
    name: 'stretch',
    emoji: '↔️',
    type: 'override', // Completely replaces motion
    description: 'Scale particles along X and Y axes',
    
    // Default configuration
    config: {
        duration: 2000,        // Animation duration
        scaleX: 1.3,           // Horizontal scale factor
        scaleY: 0.9,           // Vertical scale factor
        alternate: false,      // Alternate between X and Y stretch
        elastic: true,         // Add elastic overshoot
        overshoot: 0.1,        // Elastic overshoot amount
        frequency: 1,          // Number of stretches
        easing: 'sine',        // Animation curve type
        strength: 1.0,         // Motion strength
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'stretch',
            scaleX: 1.8,       // Particle horizontal scale
            scaleY: 0.6,       // Particle vertical scale
            strength: 1.0
        },
        centerBased: true,     // Scale from center vs. origin
        preserveArea: false    // Keep total area constant
    },
    
    // Rhythm configuration - stretch pulses with rhythm
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Stretch on beats
        
        // Scale modulation with rhythm
        scaleSync: {
            onBeat: { x: 1.5, y: 0.7 },     // Stretch wide on beat
            offBeat: { x: 0.8, y: 1.3 },     // Stretch tall off beat
            subdivision: 'eighth',            // Change every 8th note
            curve: 'elastic'                 // Bouncy stretch
        },
        
        // Alternation pattern
        alternateSync: {
            pattern: 'XYXY',                 // X stretch, Y stretch pattern
            beatsPerChange: 1,               // Change axis each beat
            overlap: 0.1                      // Slight overlap in transitions
        },
        
        // Elastic overshoot on accents
        overshootSync: {
            normal: 0.1,                     // Standard overshoot
            accent: 0.3,                     // Big overshoot on accent
            downbeat: 0.2,                   // Medium on downbeat
            curve: 'spring'                  // Spring-like motion
        },
        
        // Area preservation modes
        preservationSync: {
            verse: true,                     // Maintain area in verse
            chorus: false,                   // Free deformation in chorus
            bridge: true                     // Back to preservation
        },
        
        // Musical dynamics
        dynamics: {
            forte: { scaleX: 2.0, scaleY: 0.5, overshoot: 0.4 },
            piano: { scaleX: 1.1, scaleY: 0.95, overshoot: 0.05 }
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
        
        // Calculate offset from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        particle.gestureData.stretch = {
            offsetX: dx,
            offsetY: dy,
            startX: particle.x,
            startY: particle.y,
            originalVx: particle.vx,
            originalVy: particle.vy,
            initialized: true
        };
    },
    
    /**
     * Apply stretch motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.stretch?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.stretch;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        // Calculate scale factors
        let {scaleX} = config;
        let {scaleY} = config;
        
        // Apply area preservation if enabled
        if (config.preserveArea && scaleX !== 1 && scaleY !== 1) {
            // Adjust scales to maintain area
            const targetArea = scaleX * scaleY;
            const factor = Math.sqrt(1 / targetArea);
            scaleX *= factor;
            scaleY *= factor;
        }
        
        // Handle alternating stretch
        if (config.alternate) {
            // First half: stretch X
            // Second half: stretch Y
            if (progress < 0.5) {
                const altProgress = progress * 2;
                scaleX = 1 + (scaleX - 1) * this.getElasticProgress(altProgress, config);
                scaleY = 1 + (1 / scaleX - 1) * (config.preserveArea ? 1 : 0); // Area compensation
            } else {
                const altProgress = (progress - 0.5) * 2;
                scaleX = scaleX + (1 - scaleX) * this.getElasticProgress(altProgress, config);
                scaleY = 1 + (scaleY - 1) * this.getElasticProgress(altProgress, config);
            }
        } else {
            // Apply both scales simultaneously
            const easeProgress = this.getElasticProgress(progress, config);
            scaleX = 1 + (scaleX - 1) * easeProgress * strength;
            scaleY = 1 + (scaleY - 1) * easeProgress * strength;
        }
        
        // Calculate target position
        let targetX, targetY;
        
        if (config.centerBased) {
            // Scale from center point
            targetX = centerX + data.offsetX * scaleX;
            targetY = centerY + data.offsetY * scaleY;
        } else {
            // Scale from original position
            targetX = data.startX * scaleX;
            targetY = data.startY * scaleY;
        }
        
        // Apply position
        particle.x = targetX;
        particle.y = targetY;
        
        // Set velocity based on stretch direction
        particle.vx = data.offsetX * (scaleX - 1) * strength * 0.1;
        particle.vy = data.offsetY * (scaleY - 1) * strength * 0.1;
        
        // Smooth ending
        if (progress > 0.9) {
            const endFactor = (1 - progress) * 10;
            particle.vx = particle.vx * endFactor + data.originalVx * (1 - endFactor);
            particle.vy = particle.vy * endFactor + data.originalVy * (1 - endFactor);
        }
    },
    
    /**
     * Calculate progress with optional elastic overshoot
     * @param {number} progress - Raw progress (0-1)
     * @param {Object} config - Configuration with elastic settings
     * @returns {number} Modified progress value
     */
    getElasticProgress(progress, config) {
        if (!config.elastic) {
            return this.easeInOutCubic(progress);
        }
        
        // Elastic easing with overshoot
        if (progress === 0) return 0;
        if (progress === 1) return 1;
        
        const overshoot = config.overshoot || 0.1;
        const p = 0.3;
        const s = p / 4;
        
        if (progress < 0.5) {
            // Ease in with slight pull back
            const t = progress * 2;
            return 0.5 * this.easeInElastic(t, overshoot);
        } else {
            // Ease out with overshoot
            const t = (progress - 0.5) * 2;
            return 0.5 + 0.5 * this.easeOutElastic(t, overshoot);
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.stretch) {
            const data = particle.gestureData.stretch;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.stretch;
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
    
    easeInElastic(t, overshoot) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return -(Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p)) * (1 + overshoot);
    },
    
    easeOutElastic(t, overshoot) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        const s = p / 4;
        return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) * (1 + overshoot) + 1;
    }
};