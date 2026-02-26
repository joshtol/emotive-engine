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
        duration: 2000, // Legacy fallback
        musicalDuration: { musical: true, bars: 1 }, // 1 bar (4 beats)
        slideDistance: 30, // Horizontal slide distance
        stepHeight: 15, // Vertical step height
        speed: 1.2, // Animation speed multiplier
        strength: 0.8, // Overall effect intensity
        // Particle motion configuration
        particleMotion: {
            type: 'runningman',
            strength: 0.7,
        },
    },

    // Rhythm configuration - synchronized to beat
    rhythm: {
        enabled: true,
        syncToBeat: true, // Snap to beat grid
        durationSync: { mode: 'bars', bars: 1 }, // 1 bar duration
        beatMultiplier: 1, // Steps per beat
        accentBeats: [1, 3], // Emphasized steps
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
     * Smooth jogging motion with rhythmic bounce
     * @param {number} progress - Gesture progress (0-1)
     * @param {Object} motion - Gesture configuration
     * @returns {Object} 3D transformation { position: [x,y,z], rotation: [x,y,z], scale: number, glowIntensity: number }
     */
    '3d': {
        evaluate(progress, motion) {
            const config = { ...this.config, ...motion };
            const strength = config.strength || 0.8;

            // Match 2D: Running man - quick slide and step
            // 2D uses: slide = sin(progress * PI * 4) * 20, step = -|sin(progress * PI * 8)| * 10
            // Scale down for 3D normalized coordinates

            const slide = Math.sin(progress * Math.PI * 4) * 0.1 * strength;
            const step = Math.abs(Math.sin(progress * Math.PI * 8)) * 0.05 * strength;

            // Very subtle Z rotation - just a hint of tilt (~2 degrees = 0.035 radians)
            const rotationZ = Math.sin(progress * Math.PI * 4) * 0.035 * strength;

            // Scale squash on step (2D uses scaleY)
            const scale = 1 - Math.abs(Math.sin(progress * Math.PI * 8)) * 0.035 * strength;

            // Glow on step
            const glowIntensity = 1.0 + Math.abs(Math.sin(progress * Math.PI * 8)) * 0.25;
            const glowBoost = Math.max(0, Math.abs(Math.sin(progress * Math.PI * 8))) * 0.35;

            return {
                position: [slide, step, 0], // Screen-space: X = slide, Y = step up
                rotation: [0, 0, rotationZ], // Z rotation = screen tilt
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
