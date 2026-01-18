/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Knockdown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Knockdown gesture - quick knockdown with recovery
 * @author Emotive Engine Team
 * @module gestures/transforms/knockdown
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐        Standing
 *       💥⭐       Hit!
 *        ⭐___     Quick down
 *        ⭐/       Get back up
 *        ⭐        Recovered
 *
 * USED BY:
 * - Quick hit reactions
 * - Stumble/trip
 * - Light combat impact
 * - Quick recovery moments
 */

export default {
    name: 'knockdown',
    emoji: '💥',
    type: 'override',
    description: 'Quick knockdown with fast recovery',

    config: {
        duration: 1500,  // Shorter than knockout
        musicalDuration: { musical: true, bars: 1 },
        strength: 1.0,
        particleMotion: {
            type: 'knockdown',
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
            multiplier: 1.4
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // KNOCKDOWN PHASES:
            // Phase 1 (0-0.15): Impact - quick hit
            // Phase 2 (0.15-0.4): Fall down
            // Phase 3 (0.4-0.6): Brief down time
            // Phase 4 (0.6-1.0): Recovery - get back up

            const posX = 0;
            let posY = 0, posZ = 0;
            let rotX = 0;
            const rotY = 0;
            let rotZ = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.15) {
                // Phase 1: Impact - quick hit
                const hitT = progress / 0.15;
                const hitEase = 1 - Math.pow(1 - hitT, 2);

                // Reel from hit
                posZ = hitEase * 0.1 * strength;
                rotX = -hitEase * 0.2 * strength;

                // Flash
                glowIntensity = 1.0 + hitEase * 0.6;
                glowBoost = hitEase * 0.5;

            } else if (progress < 0.4) {
                // Phase 2: Fall down - faster than knockout
                const fallT = (progress - 0.15) / 0.25;
                const fallEase = fallT * fallT;

                // Fall
                posY = -fallEase * 0.2 * strength;
                rotX = (-0.2 + fallEase * 0.6) * strength;
                rotZ = fallEase * 0.3 * strength;

                // Slight squash on landing
                if (fallT > 0.7) {
                    const landT = (fallT - 0.7) / 0.3;
                    scale = 1.0 - landT * 0.1;
                }

                glowIntensity = 1.6 - fallT * 0.5;
                glowBoost = 0.5 - fallT * 0.4;

            } else if (progress < 0.6) {
                // Phase 3: Brief down time
                const downT = (progress - 0.4) / 0.2;

                // Stay down briefly
                posY = -0.2 * strength;
                rotX = 0.4 * strength;
                rotZ = 0.3 * strength;

                // Slight stir
                const stir = Math.sin(downT * Math.PI * 2) * 0.02;
                rotZ += stir;

                scale = 0.9;
                glowIntensity = 0.8;

            } else {
                // Phase 4: Recovery - get back up
                const recoverT = (progress - 0.6) / 0.4;
                const recoverEase = recoverT < 0.5
                    ? 4 * recoverT * recoverT * recoverT
                    : 1 - Math.pow(-2 * recoverT + 2, 3) / 2;

                // Rise up
                posY = (-0.2 + recoverEase * 0.2) * strength;
                rotX = (0.4 - recoverEase * 0.4) * strength;
                rotZ = (0.3 - recoverEase * 0.3) * strength;

                // Uncompress
                scale = 0.9 + recoverEase * 0.1;

                // Light recovery wobble at end
                if (recoverT > 0.7) {
                    const wobbleT = (recoverT - 0.7) / 0.3;
                    rotZ += Math.sin(wobbleT * Math.PI * 4) * 0.03 * (1 - wobbleT);
                }

                glowIntensity = 0.8 + recoverEase * 0.2;

                // Final pulse
                if (recoverT > 0.9) {
                    glowBoost = (recoverT - 0.9) / 0.1 * 0.2;
                }
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
