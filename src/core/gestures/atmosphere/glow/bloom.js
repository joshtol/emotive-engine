/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Bloom Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Bloom gesture - particles unfold outward like flower petals
 * @author Emotive Engine Team
 * @module gestures/effects/bloom
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ·          Closed
 *       ·⭐·        Opening
 *      · ⭐ ·       Blooming
 *     ·  ⭐  ·      Full bloom
 *
 * USED BY:
 * - Joy/happiness
 * - Realization/enlightenment
 * - Welcoming/opening up
 * - Growth/flourishing
 */

export default {
    name: 'bloom',
    emoji: '🌸',
    type: 'effect',
    description: 'Particles unfold outward like flower petals opening',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, bars: 1 },
        petalCount: 6,        // Conceptual petal layers
        openingSpeed: 1.0,    // How fast petals open
        rotationAmount: 0.3,  // How much petals rotate while opening
        strength: 1.0,
        particleMotion: {
            type: 'bloom',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat',

        amplitudeSync: {
            onBeat: 1.3,
            offBeat: 0.8
        }
    },

    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) particle.gestureData = {};

        const dx = particle.x - (centerX || 0);
        const dy = particle.y - (centerY || 0);

        particle.gestureData.bloom = {
            originalX: particle.x,
            originalY: particle.y,
            originalOpacity: particle.opacity ?? 1,
            startAngle: Math.atan2(dy, dx),
            startDistance: Math.sqrt(dx * dx + dy * dy),
            initialized: true
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.bloom?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const data = particle.gestureData.bloom;

        // Smooth opening curve
        const openProgress = Math.pow(progress, 0.7); // Ease-out feel

        // Rotation as petals unfold
        const rotationAmount = (config.rotationAmount || 0.3) * Math.PI;
        const rotation = Math.sin(openProgress * Math.PI) * rotationAmount;

        // Distance expands as bloom opens
        const expandFactor = 1 + openProgress * 0.5 * strength;
        const newDistance = data.startDistance * expandFactor;
        const newAngle = data.startAngle + rotation;

        // Calculate new position
        particle.x = centerX + Math.cos(newAngle) * newDistance;
        particle.y = centerY + Math.sin(newAngle) * newDistance;

        // Brightness increases as bloom opens
        particle.opacity = Math.min(1, data.originalOpacity * (0.7 + openProgress * 0.3));
    },

    cleanup(particle) {
        if (particle.gestureData?.bloom) {
            const data = particle.gestureData.bloom;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.opacity = data.originalOpacity;
            delete particle.gestureData.bloom;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const rotationAmount = config.rotationAmount || 0.3;

            // Smooth opening
            const openProgress = Math.pow(progress, 0.7);

            // Scale expands as bloom opens
            const scale = 1 + openProgress * 0.2 * strength;

            // Gentle rotation during opening
            const rotY = Math.sin(openProgress * Math.PI) * rotationAmount * strength;
            const rotZ = Math.sin(openProgress * Math.PI * 0.5) * 0.1 * strength;

            // Slight upward lift as bloom opens
            const yOffset = Math.sin(openProgress * Math.PI) * 0.05 * strength;

            // Glow increases with bloom
            const glowIntensity = 1.0 + openProgress * 0.4;
            const glowBoost = openProgress * 0.3;

            // Slight settle at end
            const settleEnvelope = progress > 0.85 ? 1 - (progress - 0.85) / 0.15 * 0.3 : 1.0;

            return {
                position: [0, yOffset * settleEnvelope, 0],
                rotation: [0, rotY * settleEnvelope, rotZ * settleEnvelope],
                scale: scale * (0.7 + settleEnvelope * 0.3),
                glowIntensity,
                glowBoost
            };
        }
    }
};
