/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Battlecry Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Battlecry gesture - warrior roar/call
 * @author Emotive Engine Team
 * @module gestures/transforms/battlecry
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐        Ready
 *       /⭐\       Inhale...
 *      / ⭐ \      Expand...
 *     📢⭐📢      BATTLECRY!
 *        ⭐        Done
 *
 * USED BY:
 * - Victory shout
 * - Rally cry
 * - Intimidation
 * - Triumphant moment
 */

export default {
    name: 'battlecry',
    emoji: '📣',
    type: 'override',
    description: 'Warrior battlecry - inhale, expand, roar',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, bars: 1 },
        strength: 1.0,
        particleMotion: {
            type: 'battlecry',
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
            multiplier: 1.5
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // BATTLECRY PHASES:
            // Phase 1 (0-0.25): Inhale - draw back, gather
            // Phase 2 (0.25-0.4): Build - lean back, expand
            // Phase 3 (0.4-0.6): CRY - thrust forward, maximum
            // Phase 4 (0.6-1.0): Sustain and fade

            let posY = 0, posZ = 0;
            let rotX = 0, rotZ = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.25) {
                // Phase 1: Inhale - drawing in power
                const inhaleT = progress / 0.25;
                const inhaleEase = inhaleT * inhaleT;

                // Pull back (gathering)
                posZ = inhaleEase * 0.08 * strength;
                rotX = -inhaleEase * 0.15 * strength; // Lean back

                // Slight crouch
                posY = -inhaleEase * 0.03 * strength;

                // Growing
                scale = 1.0 + inhaleEase * 0.05;

                // Building glow
                glowIntensity = 1.0 + inhaleEase * 0.4;

            } else if (progress < 0.4) {
                // Phase 2: Build - maximum gather
                const buildT = (progress - 0.25) / 0.15;
                const buildEase = buildT;

                // Maximum pullback
                posZ = (0.08 + buildEase * 0.02) * strength;
                rotX = (-0.15 - buildEase * 0.1) * strength;

                // Rising tension
                posY = (-0.03 + buildEase * 0.05) * strength;

                // Expanding
                scale = 1.05 + buildEase * 0.08;

                // Bright before release
                glowIntensity = 1.4 + buildEase * 0.5;
                glowBoost = buildEase * 0.4;

            } else if (progress < 0.6) {
                // Phase 3: THE CRY - explosive release
                const cryT = (progress - 0.4) / 0.2;
                const cryEase = 1 - Math.pow(1 - cryT, 3); // Fast attack

                // Thrust forward
                posZ = (0.1 - cryEase * 0.2) * strength;
                rotX = (-0.25 + cryEase * 0.4) * strength; // Lean into cry

                // Rise up
                posY = (0.02 + cryEase * 0.08) * strength;

                // Maximum expansion
                scale = 1.13 + cryEase * 0.12;

                // MAXIMUM glow
                glowIntensity = 1.9 + cryEase * 0.6;
                glowBoost = 0.4 + cryEase * 0.4;

                // Vibration during cry
                const vib = Math.sin(cryT * Math.PI * 20) * (1 - cryT) * 0.02;
                rotZ = vib * strength;

            } else {
                // Phase 4: Sustain and fade
                const fadeT = (progress - 0.6) / 0.4;
                const fadeEase = fadeT < 0.5
                    ? 2 * fadeT * fadeT
                    : 1 - Math.pow(-2 * fadeT + 2, 2) / 2;

                // Return to neutral
                posZ = -0.1 * (1 - fadeEase) * strength;
                rotX = 0.15 * (1 - fadeEase) * strength;
                posY = 0.1 * (1 - fadeEase) * strength;

                // Scale down
                scale = 1.25 - fadeEase * 0.25;

                // Residual vibration
                const residual = Math.sin(fadeT * Math.PI * 8) * (1 - fadeEase) * 0.015;
                rotZ = residual * strength;

                // Glow fades
                glowIntensity = 2.5 - fadeEase * 1.5;
                glowBoost = 0.8 - fadeEase * 0.8;
            }

            return {
                position: [0, posY, posZ],
                rotation: [rotX, 0, rotZ],
                scale,
                glowIntensity,
                glowBoost
            };
        }
    }
};
