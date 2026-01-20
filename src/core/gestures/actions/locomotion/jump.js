/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jump Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Jump gesture - squash, leap, and land animation
 * @author Emotive Engine Team
 * @module gestures/transforms/jump
 * @complexity ⭐⭐⭐ Intermediate-Advanced
 * @audience Transform patterns for complex animations
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Creates a classic jump animation with squash & stretch principles. Particles       
 * ║ compress before jumping, stretch during flight, and squash on landing.            
 * ║ This is an OVERRIDE gesture that completely controls particle motion.             
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * VISUAL DIAGRAM:
 *    Phase 1: Squash    Phase 2: Jump      Phase 3: Land
 *         ⭐              ↗ ⭐ ↘              ⭐
 *         ___            /     \             ___
 *     (compressed)     (stretched)       (squashed)
 * 
 * USED BY:
 * - Joy/excitement expressions
 * - Surprise reactions
 * - Celebration animations
 * - Playful interactions
 */

/**
 * Jump gesture configuration and implementation
 */
export default {
    name: 'jump',
    emoji: '🦘',
    type: 'override', // Completely replaces motion
    description: 'Squash, leap, and land with classic animation principles',
    
    // Default configuration
    config: {
        duration: 800,         // Legacy fallback
        musicalDuration: { musical: true, beats: 2 }, // 2 beats
        jumpHeight: 60,        // Maximum vertical leap distance
        squashAmount: 0.8,     // Compression ratio during squash
        stretchAmount: 1.2,    // Extension ratio during stretch
        anticipation: 0.2,     // Pre-jump preparation duration ratio
        hangTime: 0.1,         // Pause duration at jump peak
        landingImpact: true,   // Enable landing squash effect
        driftOutward: true,    // Particles spread during jump
        easing: 'quad',        // Animation curve type
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'jump',
            strength: 0.9,         // Jump motion intensity
            jumpHeight: 60,        // Particle jump height
            squash: 0.8,          // Particle compression amount
            stretch: 1.2          // Particle extension amount
        }
    },
    
    // Rhythm configuration - jump lands on beat
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Jump timing syncs to beat
        durationSync: { mode: 'beats', beats: 2 }, // 2 beats duration

        // Jump phases sync to rhythm
        phaseSync: {
            anticipation: 'eighth',    // Squash on 8th note before beat
            jump: 'beat',              // Launch on the beat
            landing: 'sixteenth'       // Land on 16th after beat
        },
        
        // Jump height modulation
        heightSync: {
            onBeat: 1.5,              // Higher jumps on strong beats
            offBeat: 0.8,             // Lower jumps on weak beats
            accent: 2.0,              // Extra high on accented beats
            curve: 'exponential'      // Sharp takeoff
        },
        
        // Squash and stretch intensity
        deformationSync: {
            squashOnBeat: 0.6,        // More squash on beat
            stretchOnBeat: 1.4,       // More stretch on beat
            timing: 'anticipatory'    // Deform before beat hits
        },
        
        // Hang time varies with tempo
        hangTimeSync: {
            mode: 'tempo',
            baseDuration: 0.1,        // Base hang at 120 BPM
            scaling: 'inverse'        // Slower tempo = longer hang
        },
        
        // Musical dynamics
        dynamics: {
            forte: { jumpHeight: 80, stretch: 1.3 },   // Big jumps on loud
            piano: { jumpHeight: 30, stretch: 1.1 }    // Small hops on soft
        }
    },
    
    /**
     * Initialize gesture data for a particle
     * @param {Particle} particle - The particle to initialize
     * @param {Object} motion - Gesture motion configuration
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    initialize(particle, motion, centerX, _centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        
        particle.gestureData.jump = {
            startX: particle.x,
            startY: particle.y,
            startSize: particle.size,
            originalVx: particle.vx,
            originalVy: particle.vy,
            driftDirection: (particle.x - centerX) * 0.1, // Drift away from center
            initialized: true
        };
    },
    
    /**
     * Apply jump motion to particle
     * @param {Particle} particle - The particle to animate
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @param {number} dt - Delta time
     * @param {number} centerX - Orb center X
     * @param {number} centerY - Orb center Y
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Initialize on first frame
        if (!particle.gestureData?.jump?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.jump;
        const config = { ...this.config, ...motion };
        const strength = motion.strength || 1.0;
        
        const jumpHeight = config.jumpHeight * strength * particle.scaleFactor;
        const squash = config.squashAmount;
        const stretch = config.stretchAmount;
        
        // Define phase breakpoints
        const anticipationEnd = config.anticipation;
        const jumpEnd = 1 - config.anticipation * 0.5; // Leave time for landing
        
        if (progress < anticipationEnd) {
            // PHASE 1: Anticipation (squash down)
            const squashProgress = progress / anticipationEnd;
            const easedSquash = this.easeOutQuad(squashProgress);
            
            // Squash size
            particle.size = data.startSize * (1 - (1 - squash) * easedSquash);
            
            // Slightly lower position (crouch)
            particle.y = data.startY + easedSquash * 5 * particle.scaleFactor;
            
            // Stop horizontal movement during anticipation
            particle.vx = 0;
            particle.vy = 0;
            
        } else if (progress < jumpEnd) {
            // PHASE 2: Jump (arc motion with stretch)
            const jumpProgress = (progress - anticipationEnd) / (jumpEnd - anticipationEnd);
            
            // Use sine curve for smooth arc
            let jumpCurve = Math.sin(jumpProgress * Math.PI);
            
            // Add hang time at peak
            if (config.hangTime > 0 && jumpProgress > 0.4 && jumpProgress < 0.6) {
                const hangProgress = (jumpProgress - 0.4) / 0.2;
                const hangCurve = this.easeInOutCubic(hangProgress);
                jumpCurve = 0.95 + hangCurve * 0.05; // Flatten at peak
            }
            
            // Vertical position
            particle.y = data.startY - jumpCurve * jumpHeight;
            
            // Horizontal drift if enabled
            if (config.driftOutward) {
                particle.x = data.startX + jumpCurve * data.driftDirection;
            }
            
            // Stretch/squash based on velocity
            if (jumpProgress < 0.5) {
                // Going up - stretch
                const stretchProgress = jumpProgress * 2;
                particle.size = data.startSize * (squash + (stretch - squash) * stretchProgress);
            } else {
                // Coming down - return to normal then squash slightly
                const fallProgress = (jumpProgress - 0.5) * 2;
                particle.size = data.startSize * (stretch - (stretch - 1) * fallProgress * 0.8);
            }
            
            // Set velocity for motion blur/trails
            particle.vx = data.driftDirection * 0.5;
            particle.vy = -Math.cos(jumpProgress * Math.PI) * jumpHeight * 0.1;
            
        } else {
            // PHASE 3: Landing (impact squash)
            const landProgress = (progress - jumpEnd) / (1 - jumpEnd);
            const easedLand = this.easeOutBounce(landProgress);
            
            // Return to ground with bounce
            particle.y = data.startY;
            
            if (config.landingImpact) {
                // Landing squash effect
                if (landProgress < 0.3) {
                    const impactProgress = landProgress / 0.3;
                    particle.size = data.startSize * (1 - (1 - squash * 0.8) * (1 - impactProgress));
                } else {
                    // Recover from squash
                    const recoverProgress = (landProgress - 0.3) / 0.7;
                    particle.size = data.startSize * (squash * 0.8 + (1 - squash * 0.8) * recoverProgress);
                }
            } else {
                // Simple size recovery
                particle.size = data.startSize * (squash + (1 - squash) * easedLand);
            }
            
            // Gradually stop motion
            particle.vx = data.originalVx * easedLand;
            particle.vy = data.originalVy * easedLand;
        }
    },
    
    /**
     * Clean up gesture data when complete
     * @param {Particle} particle - The particle to clean up
     */
    cleanup(particle) {
        if (particle.gestureData?.jump) {
            const data = particle.gestureData.jump;
            // Restore original properties
            particle.size = data.startSize;
            particle.vx = data.originalVx;
            particle.vy = data.originalVy;
            delete particle.gestureData.jump;
        }
    },
    
    /**
     * Easing functions
     */
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    /**
     * 3D translation for WebGL rendering
     * Maps the 3-phase jump animation (squash, jump, land) to 3D space
     */
    '3d': {
        /**
         * Evaluate 3D transform for current progress
         * @param {number} progress - Animation progress (0-1)
         * @param {Object} motion - Gesture configuration with particle data
         * @returns {Object} Transform with position, rotation, scale
         */
        evaluate(progress, motion) {
            const config = motion.config || motion || {};
            const strength = motion.strength || 1.0;

            // Scale pixels to 3D units - jump should be noticeable but not off-screen
            const PIXEL_TO_3D = 0.004; // 60px = 0.24 units max
            const jumpHeightPixels = config.jumpHeight || 60;
            const jumpHeight = jumpHeightPixels * PIXEL_TO_3D * strength;

            const squash = config.squashAmount || 0.8;
            const stretch = config.stretchAmount || 1.2;

            // Define phase breakpoints
            const anticipationEnd = config.anticipation || 0.2;
            const jumpEnd = 1 - anticipationEnd * 0.5;

            let yPosition = 0;
            let scale = 1.0;
            let xRotation = 0; // Slight tilt during jump

            if (progress < anticipationEnd) {
                // PHASE 1: Anticipation (squash down)
                const squashProgress = progress / anticipationEnd;
                const easedSquash = squashProgress * (2 - squashProgress); // easeOutQuad

                scale = 1.0 - (1 - squash) * easedSquash;
                yPosition = -easedSquash * 0.02; // Slightly lower (scaled to 3D)

            } else if (progress < jumpEnd) {
                // PHASE 2: Jump (arc motion with stretch)
                const jumpProgress = (progress - anticipationEnd) / (jumpEnd - anticipationEnd);
                const jumpCurve = Math.sin(jumpProgress * Math.PI);

                yPosition = jumpCurve * jumpHeight;

                // Stretch/squash based on velocity
                if (jumpProgress < 0.5) {
                    // Going up - stretch
                    const stretchProgress = jumpProgress * 2;
                    scale = squash + (stretch - squash) * stretchProgress;
                } else {
                    // Coming down - return to normal
                    const fallProgress = (jumpProgress - 0.5) * 2;
                    scale = stretch - (stretch - 1) * fallProgress * 0.8;
                }

                // Slight forward rotation at peak
                xRotation = Math.sin(jumpProgress * Math.PI) * 0.05;

            } else {
                // PHASE 3: Landing (impact squash with bounce back)
                const landProgress = (progress - jumpEnd) / (1 - jumpEnd);

                // Small bounce back on landing
                if (landProgress < 0.5) {
                    const bounceProgress = landProgress * 2;
                    yPosition = -Math.sin(bounceProgress * Math.PI) * jumpHeight * 0.15;
                } else {
                    yPosition = 0;
                }

                if (config.landingImpact !== false) {
                    if (landProgress < 0.3) {
                        // Landing squash
                        const impactProgress = landProgress / 0.3;
                        scale = 1.0 - (1 - squash * 0.8) * (1 - impactProgress);
                    } else {
                        // Recover from squash
                        const recoverProgress = (landProgress - 0.3) / 0.7;
                        scale = squash * 0.8 + (1 - squash * 0.8) * recoverProgress;
                    }
                } else {
                    scale = squash + (1 - squash) * landProgress;
                }
            }

            return {
                position: [0, yPosition, 0], // Jump is vertical Y movement only
                rotation: [xRotation, 0, 0],
                scale
            };
        }
    }
};