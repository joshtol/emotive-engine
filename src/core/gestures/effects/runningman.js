/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Running Man Gesture
 *  └─○═╝                                                                             
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Running Man gesture - hip-hop shuffle dance move
 * @author Emotive Engine Team
 * @module gestures/effects/runningman
 */

export default {
    name: 'runningman',
    emoji: '🏃',
    type: 'effect',
    description: 'Hip-hop running man shuffle',
    
    // Default configuration
    config: {
        duration: 2000,        // Animation duration
        slideDistance: 30,     // Horizontal slide distance
        stepHeight: 15,        // Vertical step height
        speed: 1.2,            // Animation speed multiplier
        strength: 0.8,         // Overall effect intensity
        // Particle motion configuration
        particleMotion: {
            type: 'runningman',
            strength: 0.7
        }
    },
    
    // Rhythm configuration - synchronized to beat
    rhythm: {
        enabled: true,
        syncToBeat: true,      // Snap to beat grid
        beatMultiplier: 1,     // Steps per beat
        accentBeats: [1, 3]    // Emphasized steps
    },
    
    /**
     * Apply running man motion - handled by GestureAnimator
     * This is a placeholder for the gesture system
     */
    apply: function(particle, progress, motion, dt, centerX, centerY) {
        // Motion is handled by GestureAnimator.applyRunningMan()
        return false;
    },
    
    /**
     * Blend with existing motion
     */
    blend: function(particle, progress, motion) {
        // Allow blending with other gestures
        return false;
    }
}