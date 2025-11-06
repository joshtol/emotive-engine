/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Burst Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Burst gesture - explosive outward motion
 * @author Emotive Engine Team
 * @module gestures/effects/burst
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'burst',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive outward burst from center',
    
    // Default configuration
    config: {
        decay: 0.5,      // Force reduction over time
        strength: 2.0    // Initial explosion intensity
    },
    
    // Rhythm configuration - explosive bursts on strong beats
    rhythm: {
        enabled: true,
        syncMode: 'beat',  // Burst on strong beats and accents
        
        // Strength syncs to beat intensity
        strengthSync: {
            onBeat: 3.5,          // Powerful burst on beats
            offBeat: 1.0,         // Gentle burst off-beat
            curve: 'explosion'    // Sharp attack, rapid decay
        },
        
        // Decay rate responds to tempo
        decaySync: {
            mode: 'tempo',
            fast: 0.8,            // Quick decay for fast songs
            slow: 0.3,            // Slow decay for slow songs
            curve: 'exponential'
        },
        
        // Duration matches beat timing
        durationSync: {
            mode: 'beats',
            beats: 0.5,           // Half-beat burst duration
            sustain: false        // No sustain, pure burst
        },
        
        // Strong response to accents
        accentResponse: {
            enabled: true,
            multiplier: 2.5,      // Massive burst on accents
            type: 'strength'      // Accent affects burst power
        },
        
        // Pattern-specific burst styles
        patternOverrides: {
            'rock': {
                // Heavy, aggressive bursts
                strengthSync: { onBeat: 4.0, offBeat: 1.5 },
                decaySync: { fast: 0.6, slow: 0.4 }
            },
            'electronic': {
                // Sharp, precise bursts
                strengthSync: { onBeat: 3.8, offBeat: 0.8, curve: 'sharp' },
                decaySync: { fast: 0.9, slow: 0.7 }
            },
            'jazz': {
                // Syncopated, varied bursts
                strengthSync: { 
                    onBeat: 2.8, 
                    offBeat: 1.8,  // Strong off-beat emphasis
                    swing: true 
                },
                decaySync: { fast: 0.5, slow: 0.2 }
            },
            'orchestral': {
                // Dynamic, expressive bursts
                strengthSync: { onBeat: 3.2, offBeat: 0.5 },
                accentResponse: { multiplier: 3.0 }  // Very responsive to dynamics
            }
        },
        
        // Musical dynamics variations
        dynamics: {
            forte: {
                // Explosive, powerful bursts
                strengthSync: { 
                    onBeat: { multiplier: 2.0 },
                    offBeat: { multiplier: 1.5 }
                },
                decaySync: { multiplier: 0.7 },  // Slower decay for impact
                accentResponse: { multiplier: 3.5 }
            },
            piano: {
                // Subtle, gentle bursts
                strengthSync: { 
                    onBeat: { multiplier: 0.6 },
                    offBeat: { multiplier: 0.3 }
                },
                decaySync: { multiplier: 1.3 },  // Faster decay for gentleness
                accentResponse: { multiplier: 1.8 }
            }
        }
    },
    
    /**
     * Apply explosive burst motion to particle
     * Pushes particles radially outward with decaying force
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Calculate force decay over gesture duration
        const decay = motion.decay || this.config.decay;
        const strength = (motion.strength || this.config.strength) * (1 - progress * decay);

        // Calculate direction from center to particle
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply outward force if particle isn't at center
        if (distance > 1) {
            // Normalize direction and apply explosive force
            particle.vx += (dx / distance) * strength * 2 * dt;
            particle.vy += (dy / distance) * strength * 2 * dt;
        }
    },

    /**
     * 3D core transformation for burst gesture
     * Sudden expansion with scale spike and glow flash
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const decay = config.decay || 0.5;
            const strength = (motion.strength || 2.0) * (1 - progress * decay);

            // Explosive scale spike that decays
            const scale = 1.0 + (progress < 0.2 ? progress * 5 : (1 - progress) * 1.5) * strength;

            // Bright flash that fades quickly (normalized to ±30% max)
            // Early flash (0-30% progress) peaks at 1.3, then fades back to 1.0
            const flashIntensity = progress < 0.3 ? (0.3 - progress) : 0;
            const glowIntensity = 1.0 + Math.min(flashIntensity * 1.0, 0.3);

            // Minimal position/rotation for burst
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale,
                glowIntensity
            };
        }
    }
};