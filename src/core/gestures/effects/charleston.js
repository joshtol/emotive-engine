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
 * @complexity ⭐⭐ Intermediate
 * @audience Good examples for creating custom gesture effects
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
    apply(_particle, _progress, _motion, _dt, _centerX, _centerY) {
        // Motion is handled by GestureAnimator.applyCharleston()
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
     * 3D core transformation for charleston gesture
     * Dance move with alternating XZ rotation and swivel
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const strength = config.strength || 0.9;

            // Charleston rhythm - double-time syncopation
            const beatProgress = progress * 8; // 8 beats per cycle

            // Alternating X rotation (kick forward/back)
            const kickDistance = (config.kickDistance || 35) * 0.01;
            const rotationX = Math.sin(beatProgress * Math.PI) * 20 * strength;
            const posZ = Math.sin(beatProgress * Math.PI) * kickDistance * strength;

            // Z rotation (hip swivel)
            const swivelRange = (config.swivelRange || 40) * 0.5;
            const rotationZ = Math.sin(beatProgress * Math.PI * 2) * swivelRange * strength;

            // Vertical bounce
            const bounceHeight = (config.bounceHeight || 12) * 0.01;
            const posY = Math.abs(Math.sin(beatProgress * Math.PI * 2)) * bounceHeight * strength;

            // Energetic glow pulse
            const glowIntensity = 1.0 + Math.sin(beatProgress * Math.PI * 2) * 0.3;

            return {
                position: [0, posY, posZ],
                rotation: [rotationX, 0, rotationZ],
                scale: 1.0,
                glowIntensity
            };
        }
    }
};