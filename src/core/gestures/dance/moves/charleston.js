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
        duration: 2500,        // Legacy fallback
        musicalDuration: { musical: true, bars: 1.5 }, // 1.5 bars (6 beats)
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
        durationSync: { mode: 'bars', bars: 1.5 }, // 1.5 bars duration
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
     * Smooth dance move with gentle swaying and bounce
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const strength = config.strength || 0.9;

            // Match 2D: Charleston - crisscross kicks with hop
            // 2D uses: kick = sin(progress * PI * 8) * 25, hop = -|sin(progress * PI * 8)| * 10
            // Scale down for 3D normalized coordinates (divide by ~200 for screen-to-world)

            const kick = Math.sin(progress * Math.PI * 8) * 0.12 * strength;
            const hop = Math.abs(Math.sin(progress * Math.PI * 8)) * 0.05 * strength;

            // Very subtle Z rotation - just a hint of tilt (~3 degrees = 0.05 radians)
            const rotationZ = Math.sin(progress * Math.PI * 8) * 0.05 * strength;

            // Scale squash on hop (2D uses scaleY, we use uniform scale)
            const scale = 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.04 * strength;

            // Glow on kick peaks
            const glowIntensity = 1.0 + Math.abs(Math.sin(progress * Math.PI * 8)) * 0.3;
            const glowBoost = Math.max(0, Math.abs(Math.sin(progress * Math.PI * 8))) * 0.4;

            return {
                position: [kick, hop, 0],  // Screen-space: X = left/right, Y = up/down
                rotation: [0, 0, rotationZ],  // Z rotation = screen tilt
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};