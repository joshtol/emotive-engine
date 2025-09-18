/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Expand Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Expand gesture - particles move outward from center
 * @author Emotive Engine Team
 * @module gestures/effects/expand
 */

export default {
    name: 'expand',
    emoji: '💫',
    type: 'blending',
    description: 'Radial expansion from center',
    
    // Default configuration
    config: {
        duration: 600,        // Gesture duration
        scaleAmount: 3.0,     // Core scale expansion amount
        scaleTarget: 3.0,     // Target expansion distance ratio
        glowAmount: 0.5,      // Glow intensity increase
        easing: 'back',       // Overshoot animation curve
        strength: 3.0,        // Outward push force intensity
        // Particle motion configuration for AnimationController
        particleMotion: {
            type: 'pulse',
            strength: 3.0,        // Particle push strength
            direction: 'outward', // Movement away from center
            persist: true         // Maintain expanded position
        }
    },
    
    // Rhythm configuration - expansive growth synced to musical crescendos
    rhythm: {
        enabled: true,
        syncMode: 'crescendo',  // Expand during musical crescendos
        
        // Expansion strength follows dynamics
        strengthSync: {
            pianissimo: 1.5,      // Gentle expansion in quiet sections
            fortissimo: 5.0,      // Massive expansion in loud sections
            crescendo: 'build',   // Gradual build during crescendos
            sforzando: 'burst'    // Sudden expansion on sforzandos
        },
        
        // Scale target responds to musical intensity
        scaleTargetSync: {
            verse: 2.0,           // Moderate expansion in verses
            chorus: 4.5,          // Large expansion in choruses
            climax: 6.0,          // Maximum expansion at climax
            curve: 'exponential'  // Exponential growth curve
        },
        
        // Duration matches musical phrasing
        durationSync: {
            mode: 'phrases',
            build: 1.2,           // Extended duration during builds
            release: 0.8,         // Quick expansion on releases
            sustain: 'hold'       // Hold expansion during sustains
        },
        
        // Strong accent response
        accentResponse: {
            enabled: true,
            multiplier: 2.8,      // Massive expansion on accents
            type: 'strength'      // Accent affects expansion force
        },
        
        // Pattern-specific expansion styles
        patternOverrides: {
            'orchestral': {
                // Epic, cinematic expansion
                strengthSync: { 
                    pianissimo: 2.0, 
                    fortissimo: 6.5,
                    crescendo: 'dramatic'
                },
                scaleTargetSync: { climax: 8.0 }
            },
            'rock': {
                // Aggressive, powerful expansion
                strengthSync: { 
                    pianissimo: 1.8, 
                    fortissimo: 5.5,
                    curve: 'power'
                },
                accentResponse: { multiplier: 3.2 }
            },
            'ambient': {
                // Gentle, organic expansion
                strengthSync: { 
                    pianissimo: 1.2, 
                    fortissimo: 3.5,
                    crescendo: 'organic'
                },
                durationSync: { build: 1.8, release: 1.2 }
            },
            'electronic': {
                // Sharp, controlled expansion
                strengthSync: { 
                    pianissimo: 1.6, 
                    fortissimo: 4.8,
                    curve: 'digital'
                },
                scaleTargetSync: { curve: 'linear' }
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Powerful, overwhelming expansion
                strengthSync: { 
                    pianissimo: { multiplier: 1.4 },
                    fortissimo: { multiplier: 1.8 }
                },
                scaleTargetSync: { multiplier: 1.6 },
                accentResponse: { multiplier: 3.5 }
            },
            piano: {
                // Delicate, controlled expansion
                strengthSync: { 
                    pianissimo: { multiplier: 0.8 },
                    fortissimo: { multiplier: 1.2 }
                },
                scaleTargetSync: { multiplier: 0.7 },
                accentResponse: { multiplier: 2.0 }
            }
        }
    },
    
    initialize: function(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        particle.gestureData.expand = {
            startX: particle.x,
            startY: particle.y,
            angle: Math.atan2(dy, dx),
            baseRadius: Math.sqrt(dx * dx + dy * dy),
            initialized: true
        };
    },
    
    /**
     * Apply expansion motion to particle
     * Pushes particles outward from center with explosive force
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.expand?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }
        
        const data = particle.gestureData.expand;
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        
        // Calculate expansion amount based on progress
        const expandFactor = 1 + (config.scaleTarget - 1) * progress * strength;
        const targetRadius = data.baseRadius * expandFactor;
        
        // Calculate target position farther from center
        const targetX = centerX + Math.cos(data.angle) * targetRadius;
        const targetY = centerY + Math.sin(data.angle) * targetRadius;
        
        // Apply strong outward push forces
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        particle.vx += dx * 0.8 * dt;  // Strong explosive push
        particle.vy += dy * 0.8 * dt;  // Strong explosive push
        
        // Apply velocity damping for controlled motion
        particle.vx *= 0.95;
        particle.vy *= 0.95;
    },
    
    cleanup: function(particle) {
        if (particle.gestureData?.expand) {
            delete particle.gestureData.expand;
        }
    }
};