/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Elastic Bounce Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Elastic bounce gesture - drop and bounce with damped oscillation
 * @author Emotive Engine Team
 * @module gestures/effects/elasticBounce
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐         Start position
 *        ↓          Fall
 *     ═══════       Ground
 *        ↑↓         Bounce
 *        ↑↓↑        Damped oscillation
 *
 * USED BY:
 * - Playfulness
 * - Energy/enthusiasm
 * - Landing/arrival
 * - Rubber ball physics
 */

export default {
    name: 'elasticBounce',
    emoji: '🏀',
    type: 'effect',
    description: 'Drop and bounce with elastic oscillation',

    config: {
        duration: 1200,
        musicalDuration: { musical: true, beats: 3 },
        dropHeight: 0.15,     // Initial drop distance (3D units)
        bounceCount: 3,       // Number of bounces
        elasticity: 0.6,      // How much energy retained per bounce (0-1)
        strength: 1.0,
        particleMotion: {
            type: 'elasticBounce',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 3 },
        timingSync: 'onBeat',

        amplitudeSync: {
            onBeat: 1.3,
            offBeat: 0.8
        }
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const dropHeight = (config.dropHeight || 0.15) * 200; // Scale for 2D
        const bounceCount = config.bounceCount || 3;
        const elasticity = config.elasticity || 0.6;

        // Calculate bounce position using physics
        const bounceY = this._calculateBounce(progress, dropHeight, bounceCount, elasticity);

        // Apply vertical offset (positive Y is down in 2D)
        particle.y += bounceY * strength;

        // Squash on impact
        const squash = Math.max(0, -bounceY / dropHeight) * 0.3;
        particle.scaleY = 1 - squash * strength;
        particle.scaleX = 1 + squash * 0.5 * strength;
    },

    _calculateBounce(progress, height, bounceCount, elasticity) {
        // Simulate bouncing ball physics
        // Each bounce takes less time and reaches less height

        let currentHeight = height;
        let timeUsed = 0;
        let bounceIndex = 0;

        // Time for first drop (gravity: t = sqrt(2h/g), normalized)
        let dropTime = 0.3; // First drop takes 30% of animation

        while (bounceIndex < bounceCount && timeUsed < 1) {
            const bounceTime = dropTime * Math.pow(elasticity, bounceIndex * 0.5);

            if (progress < timeUsed + bounceTime) {
                // We're in this bounce
                const bounceProgress = (progress - timeUsed) / bounceTime;
                // Parabolic motion
                const parabola = 4 * bounceProgress * (1 - bounceProgress);
                return -currentHeight * parabola; // Negative = up in return value
            }

            timeUsed += bounceTime;
            currentHeight *= elasticity;
            bounceIndex++;
            dropTime *= elasticity;
        }

        return 0; // Settled
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const dropHeight = config.dropHeight || 0.15;
            const bounceCount = config.bounceCount || 3;
            const elasticity = config.elasticity || 0.6;

            // Calculate bounce height
            let currentHeight = dropHeight;
            let timeUsed = 0;
            let bounceIndex = 0;
            let dropTime = 0.3;
            let yOffset = 0;
            let isOnGround = false;

            while (bounceIndex < bounceCount && timeUsed < 1) {
                const bounceTime = dropTime * Math.pow(elasticity, bounceIndex * 0.5);

                if (progress < timeUsed + bounceTime) {
                    const bounceProgress = (progress - timeUsed) / bounceTime;
                    const parabola = 4 * bounceProgress * (1 - bounceProgress);
                    yOffset = currentHeight * parabola * strength;

                    // Check if at ground (bottom of parabola)
                    isOnGround = bounceProgress > 0.45 && bounceProgress < 0.55;
                    break;
                }

                timeUsed += bounceTime;
                currentHeight *= elasticity;
                bounceIndex++;
                dropTime *= elasticity;
            }

            // Squash on ground contact
            let scaleX = 1.0, scaleY = 1.0;
            if (isOnGround) {
                const squashAmount = 0.15 * strength * Math.pow(elasticity, bounceIndex);
                scaleX = 1 + squashAmount;
                scaleY = 1 - squashAmount;
            }

            // Average scale for uniform 3D
            const scale = (scaleX + scaleY) / 2;

            // Glow on impact
            const glowIntensity = 1.0 + (isOnGround ? 0.3 : 0);

            return {
                position: [0, yOffset, 0],
                rotation: [0, 0, 0],
                scale,
                glowIntensity
            };
        }
    }
};
