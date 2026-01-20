/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Rage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Rage gesture - barbarian psyching up for battle
 * @author Emotive Engine Team
 * @module gestures/transforms/rage
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐        Start
 *       ⭐⭐        Tensing...
 *      ⭐💢⭐       BUILDING...
 *     🔥⭐🔥       RAAAAAGE!
 *        ⭐        Release
 *
 * USED BY:
 * - Intense emotion buildup
 * - Battle preparation
 * - Frustration explosion
 * - Power charging
 */

export default {
    name: 'rage',
    emoji: '💢',
    type: 'override',
    description: 'Barbarian rage - intense buildup and release',

    config: {
        duration: 2000,
        musicalDuration: { musical: true, bars: 1 },
        strength: 1.0,
        particleMotion: {
            type: 'rage',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 1 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.6
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // RAGE PHASES:
            // Phase 1 (0-0.2): Tension begins - crouch and shake
            // Phase 2 (0.2-0.6): Building rage - vibrate intensifies, grow
            // Phase 3 (0.6-0.8): Peak rage - explosive expansion
            // Phase 4 (0.8-1.0): Release - settle down

            let posX = 0, posY = 0;
            const posZ = 0;
            let rotX = 0;
            const rotY = 0;
            let rotZ = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.2) {
                // Phase 1: Tension begins
                const tensionT = progress / 0.2;
                const tensionEase = tensionT * tensionT;

                // Crouch slightly
                posY = -tensionEase * 0.05 * strength;

                // Slight lean forward (preparing)
                rotX = tensionEase * 0.15 * strength;

                // Start to shake
                const shake = Math.sin(progress * 80) * tensionEase * 0.02;
                rotZ = shake * strength;
                posX = shake * 0.02 * strength;

                // Beginning glow
                glowIntensity = 1.0 + tensionEase * 0.3;

            } else if (progress < 0.6) {
                // Phase 2: Building rage - intensifying
                const buildT = (progress - 0.2) / 0.4;
                const buildEase = buildT * buildT;

                // Stay crouched, building
                posY = (-0.05 - buildEase * 0.03) * strength;

                // Lean forward more
                rotX = (0.15 + buildEase * 0.1) * strength;

                // Intense shaking
                const shakeIntensity = 0.02 + buildEase * 0.04;
                const shakeFreq = 100 + buildT * 50; // Getting faster
                const shake = Math.sin(progress * shakeFreq) * shakeIntensity;
                rotZ = shake * strength;
                posX = shake * 0.03 * strength;

                // Growing with rage
                scale = 1.0 + buildEase * 0.1;

                // Building glow
                glowIntensity = 1.3 + buildEase * 0.7;
                glowBoost = buildEase * 0.5;

            } else if (progress < 0.8) {
                // Phase 3: Peak rage - EXPLOSION
                const peakT = (progress - 0.6) / 0.2;

                // Rise up with power
                posY = (-0.08 + peakT * 0.15) * strength;

                // Head back in primal scream
                rotX = (0.25 - peakT * 0.4) * strength;

                // Dramatic shake
                const shake = Math.sin(progress * 150) * (1 - peakT * 0.5) * 0.05;
                rotZ = shake * strength;

                // Maximum expansion
                const expandPulse = Math.sin(peakT * Math.PI) * 0.08;
                scale = 1.1 + expandPulse;

                // INTENSE glow
                glowIntensity = 2.0 - peakT * 0.3;
                glowBoost = 0.5 + Math.sin(peakT * Math.PI) * 0.3;

            } else {
                // Phase 4: Release - settling
                const releaseT = (progress - 0.8) / 0.2;
                const releaseEase = releaseT < 0.5
                    ? 4 * releaseT * releaseT * releaseT
                    : 1 - Math.pow(-2 * releaseT + 2, 3) / 2;

                // Return to normal
                posY = (0.07 - releaseEase * 0.07) * strength;
                rotX = (-0.15 + releaseEase * 0.15) * strength;

                // Residual shake dying down
                const residualShake = Math.sin(progress * 50) * (1 - releaseEase) * 0.02;
                rotZ = residualShake * strength;

                // Scale down
                scale = 1.1 - releaseEase * 0.1;

                // Glow fades
                glowIntensity = 1.7 - releaseEase * 0.7;
                glowBoost = 0.5 * (1 - releaseEase);
            }

            return {
                position: [posX, posY, posZ],
                rotation: [rotX, rotY, rotZ],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
