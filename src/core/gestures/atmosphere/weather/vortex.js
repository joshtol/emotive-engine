/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Vortex gesture - spiral inward or outward tornado pattern
 * @author Emotive Engine Team
 * @module gestures/transforms/vortex
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *      ↻ ↻ ↻        Particles spiral
 *       ↻ ↻         toward center
 *        ⭐         Vortex center
 *       ↺ ↺         or outward
 *      ↺ ↺ ↺
 *
 * USED BY:
 * - Thinking/processing
 * - Confusion/disorientation
 * - Power-up/charging
 * - Mystical/magical effects
 */

export default {
    name: 'vortex',
    emoji: '🌀',
    type: 'override',
    description: 'Spiral tornado pattern inward or outward',

    config: {
        duration: 2000,
        musicalDuration: { musical: true, bars: 1 },
        direction: 'inward', // 'inward' or 'outward'
        rotationSpeed: 2.0, // Rotations during gesture
        pullStrength: 1.0, // How strongly pulled to/from center
        liftAmount: 0.5, // Vertical lift during vortex
        strength: 1.0,
        particleMotion: {
            type: 'vortex',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat',

        rotationSync: {
            onBeat: 1.5,
            offBeat: 0.8,
        },
    },

    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) particle.gestureData = {};

        const dx = particle.x - (centerX || 0);
        const dy = particle.y - (centerY || 0);

        particle.gestureData.vortex = {
            originalX: particle.x,
            originalY: particle.y,
            startAngle: Math.atan2(dy, dx),
            startDistance: Math.sqrt(dx * dx + dy * dy),
            initialized: true,
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.vortex?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const config = { ...this.config, ...motion };
        const data = particle.gestureData.vortex;

        const isInward = config.direction !== 'outward';
        const rotationSpeed = config.rotationSpeed || 2.0;
        const pullStrength = config.pullStrength || 1.0;

        // Rotation around center
        const rotationAmount = progress * rotationSpeed * Math.PI * 2;
        const currentAngle = data.startAngle + rotationAmount;

        // Distance change (pull inward or push outward)
        let distanceMultiplier;
        if (isInward) {
            // Spiral inward
            distanceMultiplier = 1 - progress * pullStrength * 0.8;
        } else {
            // Spiral outward
            distanceMultiplier = 1 + progress * pullStrength * 0.5;
        }

        const currentDistance = data.startDistance * distanceMultiplier;

        // New position
        particle.x = centerX + Math.cos(currentAngle) * currentDistance;
        particle.y = centerY + Math.sin(currentAngle) * currentDistance;

        // Fade based on direction
        if (isInward && progress > 0.7) {
            particle.opacity = 1 - (progress - 0.7) / 0.3;
        }
    },

    cleanup(particle) {
        if (particle.gestureData?.vortex) {
            const data = particle.gestureData.vortex;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.opacity = 1;
            delete particle.gestureData.vortex;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const isInward = config.direction !== 'outward';
            const rotationSpeed = config.rotationSpeed || 2.0;
            const liftAmount = config.liftAmount || 0.5;

            // Y-axis rotation (spinning)
            const yRotation = progress * rotationSpeed * Math.PI * 2 * strength;

            // Vertical lift
            const lift = Math.sin(progress * Math.PI) * liftAmount * 0.1 * strength;

            // Scale changes with vortex
            let scale;
            if (isInward) {
                // Shrink as vortex closes
                scale = 1 - progress * 0.3 * strength;
            } else {
                // Grow as vortex expands
                scale = 1 + progress * 0.2 * strength;
            }

            // Tilt into the spin
            const tiltX = Math.sin(yRotation) * 0.1 * strength;
            const tiltZ = Math.cos(yRotation) * 0.1 * strength;

            // Glow builds up
            const glowIntensity = 1.0 + progress * 0.4;
            const glowBoost = progress * 0.3;

            // Fade envelope at end
            const fadeEnvelope = progress > 0.85 ? (1 - progress) / 0.15 : 1.0;

            return {
                position: [0, lift * fadeEnvelope, 0],
                rotation: [tiltX * fadeEnvelope, yRotation, tiltZ * fadeEnvelope],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
