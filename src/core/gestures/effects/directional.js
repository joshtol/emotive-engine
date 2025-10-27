/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Directional Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Directional gesture - move particles in specific direction
 * @author Emotive Engine Team
 * @module gestures/effects/directional
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'directional',
    emoji: '➡️',
    type: 'blending',
    description: 'Move particles in a specific direction',
    
    // Default configuration
    config: {
        angle: 0,                // Movement direction in degrees
        returnToOrigin: false,   // Whether particles return to start
        strength: 1.0           // Force intensity
    },
    
    // Rhythm configuration - directional movement following musical flow
    rhythm: {
        enabled: true,
        syncMode: 'flow',  // Follow musical flow and direction
        
        // Direction changes with musical progression
        angleSync: {
            verse: 0,             // Right movement in verses
            chorus: 90,           // Upward movement in choruses  
            bridge: 180,          // Left movement in bridges
            outro: 270,           // Downward movement in outros
            transition: 'smooth'  // Smooth direction changes
        },
        
        // Strength pulses with rhythm
        strengthSync: {
            onBeat: 1.8,          // Strong push on beats
            offBeat: 0.6,         // Gentle drift off-beat
            curve: 'wave'         // Wave-like motion curve
        },
        
        // Return motion syncs to musical sections
        returnSync: {
            enabled: true,
            onSectionChange: true, // Return on section changes
            duration: 'transition', // Use transition timing
            strength: 1.2
        },
        
        // Accent response affects direction
        accentResponse: {
            enabled: true,
            multiplier: 2.0,      // Sharp directional push on accents
            type: 'strength'      // Accent affects movement force
        },
        
        // Pattern-specific directional styles
        patternOverrides: {
            'march': {
                // Military-style directional movement
                angleSync: { verse: 0, chorus: 0 }, // Always forward
                strengthSync: { onBeat: 2.5, offBeat: 1.0 }
            },
            'waltz': {
                // Flowing, circular directional movement
                angleSync: { 
                    verse: 45, 
                    chorus: 135,
                    bridge: 225,
                    outro: 315,
                    transition: 'circular'
                }
            },
            'swing': {
                // Syncopated directional swaying
                strengthSync: { 
                    onBeat: 1.6, 
                    offBeat: 1.4,  // Strong off-beat emphasis
                    swing: true 
                }
            },
            'electronic': {
                // Sharp, precise directional cuts
                angleSync: { transition: 'instant' },
                strengthSync: { onBeat: 2.2, offBeat: 0.4, curve: 'sharp' }
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Powerful, decisive direction changes
                strengthSync: { 
                    onBeat: { multiplier: 1.6 },
                    offBeat: { multiplier: 1.2 }
                },
                angleSync: { transition: 'sharp' },
                accentResponse: { multiplier: 2.5 }
            },
            piano: {
                // Gentle, subtle directional drift
                strengthSync: { 
                    onBeat: { multiplier: 0.7 },
                    offBeat: { multiplier: 0.8 }
                },
                angleSync: { transition: 'gradual' },
                accentResponse: { multiplier: 1.4 }
            }
        }
    },
    
    /**
     * Initialize directional movement data
     * Stores particle's starting position for return motion
     */
    initialize(particle) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        particle.gestureData.directional = {
            initialX: particle.x,
            initialY: particle.y
        };
    },
    
    /**
     * Apply directional force to particle
     * Pushes particles in specified direction with optional return
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.directional) {
            this.initialize(particle);
        }
        
        // Convert angle to radians for calculation
        const angle = (motion.angle || this.config.angle) * Math.PI / 180;
        const strength = motion.strength || this.config.strength;
        
        // Apply directional force
        particle.vx += Math.cos(angle) * strength * 0.3 * dt;
        particle.vy += Math.sin(angle) * strength * 0.3 * dt;
        
        // Optional return motion in second half of gesture
        if (motion.returnToOrigin && progress > 0.5) {
            const returnProgress = (progress - 0.5) * 2;
            const data = particle.gestureData.directional;
            // Calculate return force toward initial position
            const dx = data.initialX - particle.x;
            const dy = data.initialY - particle.y;
            particle.vx += dx * returnProgress * 0.02 * dt;
            particle.vy += dy * returnProgress * 0.02 * dt;
        }
    }
};