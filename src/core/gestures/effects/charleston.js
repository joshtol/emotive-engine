/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Charleston Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Charleston gesture - classic hip-hop shuffle with modern twist
 * @author Emotive Engine Team
 * @module gestures/effects/charleston
 */

export default {
    name: 'charleston',
    emoji: '🕺',
    type: 'effect',
    description: 'Hip-hop Charleston shuffle with crisscross',
    
    // Default configuration
    config: {
        duration: 2500,        // Animation duration
        kickDistance: 35,      // Kick extension distance
        swivelRange: 40,       // Hip swivel range
        bounceHeight: 12,      // Vertical bounce
        strength: 0.9,         // Overall effect intensity
        // Particle motion configuration
        particleMotion: {
            type: 'charleston',
            strength: 0.8
        }
    },
    
    // Rhythm configuration - tight sync with beat
    rhythm: {
        enabled: true,
        syncToBeat: true,      // Lock to beat grid
        beatMultiplier: 2,     // Double-time feel
        accentBeats: [1, 2.5, 3, 4.5]  // Syncopated accents
    },
    
    /**
     * Apply charleston motion - handled by GestureAnimator
     * This is a placeholder for the gesture system
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        // Motion is handled by GestureAnimator.applyCharleston()
        return false;
    },
    
    /**
     * Blend with existing motion
     */
    blend(particle, progress, motion) {
        // Allow blending with other gestures
        return false;
    }
};