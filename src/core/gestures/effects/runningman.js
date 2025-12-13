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
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
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
    apply(_particle, _progress, _motion, _dt, _centerX, _centerY) {
        // Motion is handled by GestureAnimator.applyRunningMan()
        return false;
    },
    
    /**
     * Blend with existing motion
     */
    blend(_particle, _progress, _motion) {
        // Allow blending with other gestures
        return false;
    },

    /**
     * 3D core transformation for running man gesture
     * Dance move with Y rotation and bounce
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const speed = config.speed || 1.2;
            const strength = config.strength || 0.8;

            // Running man rhythm - 4 steps per cycle
            // const stepProgress = (progress * speed * 4) % 1;

            // Y-axis rotation (turning left/right)
            const rotationY = Math.sin(progress * Math.PI * 4 * speed) * 15 * strength;

            // Vertical bounce with each step
            const bounceHeight = (config.stepHeight || 15) * 0.01;
            const posY = Math.abs(Math.sin(progress * Math.PI * 8 * speed)) * bounceHeight * strength;

            // Horizontal slide
            const slideDistance = (config.slideDistance || 30) * 0.01;
            const posX = Math.sin(progress * Math.PI * 2 * speed) * slideDistance * strength;

            // Slight glow pulse with rhythm
            const glowIntensity = 1.0 + Math.sin(progress * Math.PI * 8 * speed) * 0.2;

            // Glow boost for screen-space halo - rhythmic pulse
            const glowBoost = Math.max(0, Math.sin(progress * Math.PI * 8 * speed) * 0.4);

            return {
                position: [posX, posY, 0],
                rotation: [0, rotationY, 0],
                scale: 1.0,
                glowIntensity,
                glowBoost
            };
        }
    }
};