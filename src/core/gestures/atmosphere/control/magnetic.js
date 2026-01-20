/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Magnetic Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Magnetic gesture - particles attracted to or repelled from center
 * @author Emotive Engine Team
 * @module gestures/effects/magnetic
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     Attract:        Repel:
 *    · → ⭐ ← ·      · ← ⭐ → ·
 *    · → ⭐ ← ·      · ← ⭐ → ·
 *
 * USED BY:
 * - Interaction/curiosity
 * - Attraction/pull
 * - Repulsion/push away
 * - Focus/attention
 */

export default {
    name: 'magnetic',
    emoji: '🧲',
    type: 'effect',
    description: 'Particles attracted to or repelled from center',

    config: {
        duration: 1200,
        musicalDuration: { musical: true, beats: 3 },
        mode: 'attract',      // 'attract' or 'repel'
        pullStrength: 1.0,    // Force strength
        returnToOrigin: true, // Whether to return at end
        strength: 1.0,
        particleMotion: {
            type: 'magnetic',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 3 },
        timingSync: 'onBeat',

        strengthSync: {
            onBeat: 1.5,
            offBeat: 0.7
        }
    },

    initialize(particle, motion, centerX, centerY) {
        if (!particle.gestureData) particle.gestureData = {};

        particle.gestureData.magnetic = {
            originalX: particle.x,
            originalY: particle.y,
            originalOpacity: particle.opacity ?? 1,
            initialized: true
        };
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        if (!particle.gestureData?.magnetic?.initialized) {
            this.initialize(particle, motion, centerX, centerY);
        }

        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const pullStrength = config.pullStrength || 1.0;
        const isAttract = config.mode !== 'repel';
        const returnToOrigin = config.returnToOrigin !== false;
        const data = particle.gestureData.magnetic;

        // Effect envelope - builds up then (optionally) returns
        let effectStrength;
        if (returnToOrigin) {
            // Bell curve - strongest in middle
            effectStrength = Math.sin(progress * Math.PI);
        } else {
            // Ease in, hold
            effectStrength = Math.min(1, progress * 2);
        }

        // Calculate direction to/from center
        const dx = centerX - data.originalX;
        const dy = centerY - data.originalY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Magnetic force (inverse square falloff for realism)
        const forceFactor = 50 / Math.max(dist, 20); // Prevent extreme forces
        const force = effectStrength * pullStrength * strength * forceFactor;

        // Apply force
        const moveX = (dx / dist) * force * (isAttract ? 1 : -1);
        const moveY = (dy / dist) * force * (isAttract ? 1 : -1);

        particle.x = data.originalX + moveX;
        particle.y = data.originalY + moveY;
    },

    cleanup(particle) {
        if (particle.gestureData?.magnetic) {
            const data = particle.gestureData.magnetic;
            particle.x = data.originalX;
            particle.y = data.originalY;
            particle.opacity = data.originalOpacity;
            delete particle.gestureData.magnetic;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const isAttract = config.mode !== 'repel';
            const returnToOrigin = config.returnToOrigin !== false;

            // Effect envelope
            let effectStrength;
            if (returnToOrigin) {
                effectStrength = Math.sin(progress * Math.PI);
            } else {
                effectStrength = Math.min(1, progress * 2);
            }

            // Z position - pull toward/away from camera
            const zOffset = effectStrength * 0.15 * strength * (isAttract ? 1 : -1);

            // Scale contracts when attracted, expands when repelled
            const scale = 1 + effectStrength * 0.1 * strength * (isAttract ? -1 : 1);

            // Glow intensifies with magnetic field
            const glowIntensity = 1.0 + effectStrength * 0.4;
            const glowBoost = effectStrength * 0.3;

            // Slight vibration at peak magnetism
            const vibration = effectStrength > 0.5 ? Math.sin(progress * Math.PI * 20) * 0.01 * (effectStrength - 0.5) * 2 : 0;

            return {
                position: [vibration, 0, zOffset],
                rotation: [0, 0, 0],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
