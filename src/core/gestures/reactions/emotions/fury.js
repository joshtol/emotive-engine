/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fury Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fury gesture - quick intense burst of anger
 * @author Emotive Engine Team
 * @module gestures/transforms/fury
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐        Normal
 *       💢⭐💢      FURY!
 *        ⭐        Back
 *
 * USED BY:
 * - Quick anger flash
 * - Frustration burst
 * - Intense reaction
 * - Combat intensity
 */

export default {
    name: 'fury',
    emoji: '😤',
    type: 'override',
    description: 'Quick fury burst - intense flash of anger',

    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 },
        strength: 1.0,
        particleMotion: {
            type: 'fury',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.5,
        },
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // FURY: Quick intense burst
            // Phase 1 (0-0.2): Instant flare up
            // Phase 2 (0.2-0.5): Peak fury with shake
            // Phase 3 (0.5-1.0): Cool down

            let posX = 0;
            const posY = 0,
                posZ = 0;
            let rotX = 0;
            const rotY = 0;
            let rotZ = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.2) {
                // Phase 1: Instant flare
                const flareT = progress / 0.2;
                const flareEase = 1 - Math.pow(1 - flareT, 3);

                // Quick expansion
                scale = 1.0 + flareEase * 0.15 * strength;

                // Intense shake starts
                const shake = Math.sin(progress * 120) * flareEase * 0.04;
                rotZ = shake * strength;
                posX = shake * 0.02 * strength;

                // Bright flash
                glowIntensity = 1.0 + flareEase * 1.2;
                glowBoost = flareEase * 0.7;
            } else if (progress < 0.5) {
                // Phase 2: Peak fury
                const peakT = (progress - 0.2) / 0.3;

                // Maximum expansion with slight pulse
                const pulse = Math.sin(peakT * Math.PI * 3) * 0.03;
                scale = 1.15 + pulse;

                // Intense shaking
                const shake = Math.sin(progress * 150) * 0.05 * (1 - peakT * 0.3);
                rotZ = shake * strength;
                posX = shake * 0.025 * strength;

                // Fury lean
                rotX = Math.sin(peakT * Math.PI) * 0.1 * strength;

                // Sustain glow
                glowIntensity = 2.2 - peakT * 0.3;
                glowBoost = 0.7 - peakT * 0.2;
            } else {
                // Phase 3: Cool down
                const coolT = (progress - 0.5) / 0.5;
                const coolEase = coolT * coolT;

                // Contract back
                scale = 1.15 - coolEase * 0.15;

                // Shake dies down
                const residualShake = Math.sin(progress * 80) * (1 - coolEase) * 0.03;
                rotZ = residualShake * strength;

                // Return posture
                rotX = 0.1 * (1 - coolEase) * strength;

                // Glow fades
                glowIntensity = 1.9 - coolEase * 0.9;
                glowBoost = 0.5 * (1 - coolEase);
            }

            return {
                position: [posX, posY, posZ],
                rotation: [rotX, rotY, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
