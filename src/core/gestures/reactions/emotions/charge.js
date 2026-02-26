/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Charge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Charge gesture - rushing forward attack
 * @author Emotive Engine Team
 * @module gestures/transforms/charge
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐        Ready
 *       ↘⭐        Crouch...
 *      →→⭐→→      CHARGE!
 *          ⭐←     Brake
 *        ⭐        Done
 *
 * USED BY:
 * - Attack rush
 * - Bull charge
 * - Aggressive advance
 * - Tackle motion
 */

export default {
    name: 'charge',
    emoji: '🐂',
    type: 'override',
    description: 'Bull charge - wind up and rush forward',

    config: {
        duration: 1200,
        musicalDuration: { musical: true, beats: 3 },
        strength: 1.0,
        particleMotion: {
            type: 'charge',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 3 },
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

            // CHARGE PHASES:
            // Phase 1 (0-0.2): Wind up - crouch and lean
            // Phase 2 (0.2-0.6): Charge - rush forward
            // Phase 3 (0.6-0.85): Impact/peak - at target
            // Phase 4 (0.85-1.0): Recovery - brake and return

            let posX = 0,
                posY = 0,
                posZ = 0;
            let rotX = 0,
                rotZ = 0;
            const rotY = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.2) {
                // Phase 1: Wind up
                const windT = progress / 0.2;
                const windEase = windT * windT;

                // Crouch
                posY = -windEase * 0.08 * strength;

                // Pull back
                posZ = windEase * 0.1 * strength;

                // Lean forward (preparing to charge)
                rotX = windEase * 0.25 * strength;

                // Slight compression
                scale = 1.0 - windEase * 0.05;

                // Building energy
                glowIntensity = 1.0 + windEase * 0.4;
            } else if (progress < 0.6) {
                // Phase 2: CHARGE!
                const chargeT = (progress - 0.2) / 0.4;
                const chargeEase = 1 - Math.pow(1 - chargeT, 2); // Accelerate

                // Rush forward (toward camera = negative Z)
                posZ = (0.1 - chargeEase * 0.35) * strength;

                // Maintain charge lean
                rotX = (0.25 + chargeEase * 0.1) * strength;

                // Rise from crouch during charge
                posY = (-0.08 + chargeEase * 0.06) * strength;

                // Expand with momentum
                scale = 0.95 + chargeEase * 0.15;

                // Charging glow
                glowIntensity = 1.4 + chargeEase * 0.6;
                glowBoost = chargeEase * 0.4;

                // Speed blur effect - slight wobble
                const blur = Math.sin(chargeT * Math.PI * 10) * chargeEase * 0.02;
                rotZ = blur * strength;
            } else if (progress < 0.85) {
                // Phase 3: Impact/peak
                const impactT = (progress - 0.6) / 0.25;

                // At forward position
                posZ = -0.25 * strength;

                // Leaning forward hard
                rotX = (0.35 - impactT * 0.1) * strength;

                // Impact shake
                const shake = Math.sin(impactT * Math.PI * 15) * (1 - impactT) * 0.04;
                rotZ = shake * strength;
                posX = shake * 0.02 * strength;

                // Peak scale with pulse
                scale = 1.1 + Math.sin(impactT * Math.PI) * 0.05;

                // Maximum intensity
                glowIntensity = 2.0 - impactT * 0.3;
                glowBoost = 0.4 * (1 - impactT * 0.5);
            } else {
                // Phase 4: Recovery
                const recoverT = (progress - 0.85) / 0.15;
                const recoverEase =
                    recoverT < 0.5
                        ? 4 * recoverT * recoverT * recoverT
                        : 1 - Math.pow(-2 * recoverT + 2, 3) / 2;

                // Return to center
                posZ = -0.25 * (1 - recoverEase) * strength;
                rotX = 0.25 * (1 - recoverEase) * strength;
                posY = -0.02 * (1 - recoverEase) * strength;

                // Scale normalize
                scale = 1.1 - recoverEase * 0.1;

                // Glow fade
                glowIntensity = 1.7 - recoverEase * 0.7;
                glowBoost = 0.2 * (1 - recoverEase);
            }

            // Use camera-relative for the forward charge direction
            return {
                cameraRelativePosition: [posX, posY, posZ],
                rotation: [rotX, rotY, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
