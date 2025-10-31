/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Jump Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Jump gesture - vertical jumping motion with squash and stretch
 * @author Emotive Engine Team
 * @module gestures/transforms/jump
 * @complexity ⭐⭐⭐ Advanced
 * @audience Transform patterns for jumping animations
 */

/**
 * Jump gesture configuration and implementation
 */
export default {
    name: 'jump',
    emoji: '🦘',
    type: 'override',
    description: 'Vertical jump with squash and stretch',

    // Default configuration
    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 },
        jumpHeight: 0.5,
        strength: 1.0
    },

    // Rhythm configuration
    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 2 },
        interruptible: true,
        priority: 5,
        blendable: false,
        crossfadePoint: 'anyBeat',
        maxQueue: 1
    },

    /**
     * Initialize gesture data for a particle
     */
    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) {
            particle.gestureData = {};
        }

        particle.gestureData.jump = {
            startX: particle.x,
            startY: particle.y,
            startSize: particle.size,
            initialized: true
        };
    },

    /**
     * Apply jump motion to particle (2D)
     */
    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.jump?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const data = particle.gestureData.jump;
        const config = { ...this.config, ...motion };

        // Jump arc calculation
        let yOffset = 0;
        let scale = 1.0;

        if (progress < 0.2) {
            // Squat phase
            const squatProgress = progress / 0.2;
            yOffset = squatProgress * 10;  // Move down slightly
            scale = 1.0 - squatProgress * 0.2;  // Squash
        } else if (progress < 0.8) {
            // Jump phase
            const jumpProgress = (progress - 0.2) / 0.6;
            const arc = Math.sin(jumpProgress * Math.PI);
            yOffset = -arc * 100;  // Move up (negative in 2D canvas)
            scale = 1.0 + arc * 0.3;  // Stretch
        } else {
            // Land phase
            const landProgress = (progress - 0.8) / 0.2;
            scale = 1.0 - (1.0 - landProgress) * 0.2;  // Squash on landing
        }

        particle.y = data.startY + yOffset;
        particle.size = data.startSize * scale;
    },

    /**
     * Clean up gesture data
     */
    cleanup(particle) {
        if (particle.gestureData?.jump) {
            const data = particle.gestureData.jump;
            particle.y = data.startY;
            particle.size = data.startSize;
            delete particle.gestureData.jump;
        }
    },

    /**
     * 3D transformation - Simple vertical jump following headBob pattern
     */
    '3d': {
        evaluate(progress, motion) {
            const strength = (motion && motion.strength) || 1.0;

            let yPosition = 0;
            let scale = 1.0;

            if (progress < 0.2) {
                // Squat down
                const squatProgress = progress / 0.2;
                yPosition = -squatProgress * 0.1 * strength;  // Negative = down
                scale = 1.0 - squatProgress * 0.2;  // Squash
            } else if (progress < 0.8) {
                // Jump up
                const jumpProgress = (progress - 0.2) / 0.6;
                const arc = Math.sin(jumpProgress * Math.PI);
                yPosition = arc * 0.5 * strength;  // Positive = up
                scale = 1.0 + arc * 0.3;  // Stretch
            } else {
                // Land
                const landProgress = (progress - 0.8) / 0.2;
                yPosition = 0;
                scale = 0.8 + landProgress * 0.2;  // Squash then recover
            }

            return {
                position: [0, yPosition, 0],
                rotation: [0, 0, 0],
                scale
            };
        }
    }
};
