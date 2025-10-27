/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Settle Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Settle gesture - gradually reduce velocity
 * @author Emotive Engine Team
 * @module gestures/effects/settle
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
 */

export default {
    name: 'settle',
    emoji: '🍃',
    type: 'blending',
    description: 'Gradually settle particles to rest',
    
    // Default configuration
    config: {
        damping: 0.02,     // Velocity reduction rate
        threshold: 0.01    // Minimum velocity before stop
    },
    
    // Rhythm configuration - gradual settling synchronized to musical resolution
    rhythm: {
        enabled: true,
        syncMode: 'resolution', // Settle during chord resolutions and phrase endings
        
        // Damping rate responds to musical tension/release
        dampingSync: {
            onResolution: 0.035,    // Faster settling on resolution
            onTension: 0.015,       // Slower settling during tension
            curve: 'gradual'        // Smooth, natural decay
        },
        
        // Threshold adapts to dynamic level
        thresholdSync: {
            mode: 'dynamics',
            forte: 0.02,            // Higher threshold for loud music
            piano: 0.005,           // Lower threshold for quiet music
            curve: 'exponential'
        },
        
        // Duration follows musical phrase structure
        durationSync: {
            mode: 'phrase',
            minBeats: 2,            // Minimum 2-beat settling
            maxBeats: 12,           // Maximum phrase-length settling
            sustain: true           // Maintain settling through resolution
        },
        
        // Response to cadential movements
        cadenceResponse: {
            enabled: true,
            multiplier: 1.6,        // Enhanced settling on cadences
            type: 'damping'         // Affects settling rate
        },
        
        // Style variations for different music types
        patternOverrides: {
            'ambient': {
                // Slow, atmospheric settling
                dampingSync: { onResolution: 0.025, onTension: 0.008, curve: 'atmospheric' },
                durationSync: { minBeats: 8, maxBeats: 32 }
            },
            'jazz': {
                // Smooth settling with swing feel
                dampingSync: { onResolution: 0.040, onTension: 0.020 },
                cadenceResponse: { multiplier: 1.8 }
            },
            'classical': {
                // Expressive settling following harmonic rhythm
                dampingSync: { onResolution: 0.045, onTension: 0.012, curve: 'expressive' },
                cadenceResponse: { multiplier: 2.0 }
            },
            'minimalist': {
                // Very gradual, meditative settling
                dampingSync: { onResolution: 0.020, onTension: 0.005 },
                durationSync: { minBeats: 16, maxBeats: 64 }
            }
        },
        
        // Musical dynamics
        dynamics: {
            forte: {
                // Decisive, clear settling
                dampingSync: { 
                    onResolution: { multiplier: 1.4 },
                    onTension: { multiplier: 0.8 }
                },
                thresholdSync: { multiplier: 2.0 },
                cadenceResponse: { multiplier: 2.2 }
            },
            piano: {
                // Gentle, soft settling
                dampingSync: { 
                    onResolution: { multiplier: 0.7 },
                    onTension: { multiplier: 1.2 }
                },
                thresholdSync: { multiplier: 0.5 },
                cadenceResponse: { multiplier: 1.3 }
            }
        }
    },
    
    /**
     * Apply settling effect to particle
     * Gradually reduces velocity until particles come to rest
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        const damping = motion.damping || this.config.damping;
        const threshold = motion.threshold || this.config.threshold;
        
        // Apply exponential velocity damping
        particle.vx *= Math.max(0, 1 - damping * dt * 60);
        particle.vy *= Math.max(0, 1 - damping * dt * 60);
        
        // Stop completely when velocity falls below threshold
        if (Math.abs(particle.vx) < threshold) particle.vx = 0;
        if (Math.abs(particle.vy) < threshold) particle.vy = 0;
    }
};