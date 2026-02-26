/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Knockout Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Knockout gesture - theatrical KO with failed rise attempt
 * @author Emotive Engine Team
 * @module gestures/transforms/knockout
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ⭐        Standing
 *      💫⭐        Hit! Stars
 *       \⭐        Falling
 *        ⭐___     Down
 *       /⭐        Try to rise...
 *        ⭐___     Fail, back down
 *        ⭐___     Stay down
 *        ⭐/       Slowly rise
 *        ⭐        Shake it off
 *
 * USED BY:
 * - Defeat/loss
 * - Dramatic impact
 * - Comedy KO
 * - Game over moments
 */

export default {
    name: 'knockout',
    emoji: '💫',
    type: 'override',
    description: 'Theatrical knockout with failed rise attempt, then recovery',

    config: {
        duration: 4000, // Long animation for full drama
        musicalDuration: { musical: true, bars: 2 },
        strength: 1.0,
        particleMotion: {
            type: 'knockout',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'bars', bars: 2 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.3,
        },
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;

            // KNOCKOUT PHASES:
            // Phase 1 (0-0.1): Impact hit - stars, reel back
            // Phase 2 (0.1-0.25): Fall down - dramatic collapse
            // Phase 3 (0.25-0.35): Down/dazed
            // Phase 4 (0.35-0.45): Try to rise - hopeful
            // Phase 5 (0.45-0.55): Fail and fall back down
            // Phase 6 (0.55-0.75): Stay down - really knocked out
            // Phase 7 (0.75-0.9): Slowly rise
            // Phase 8 (0.9-1.0): Shake it off - recovery wobble

            const posX = 0;
            let posY = 0,
                posZ = 0;
            let rotX = 0,
                rotY = 0,
                rotZ = 0;
            let scale = 1.0;
            let glowIntensity = 1.0;
            let glowBoost = 0;

            if (progress < 0.1) {
                // Phase 1: Impact hit - reel back with stars
                const hitT = progress / 0.1;
                const hitEase = 1 - Math.pow(1 - hitT, 3);

                // Reel back from hit
                posZ = hitEase * 0.15 * strength;
                rotX = -hitEase * 0.3 * strength; // Lean back

                // Star flash
                glowIntensity = 1.0 + hitEase * 0.8;
                glowBoost = hitEase * 0.6;

                // Slight wobble
                rotZ = Math.sin(hitT * Math.PI * 4) * 0.1 * hitEase;
            } else if (progress < 0.25) {
                // Phase 2: Fall down - dramatic collapse
                const fallT = (progress - 0.1) / 0.15;
                const fallEase = fallT * fallT; // Accelerate down

                // Fall forward and down
                posY = -fallEase * 0.25 * strength;
                rotX = (-0.3 + fallEase * 0.8) * strength; // Tip forward as falling

                // Rotate to side as falling
                rotZ = fallEase * 0.4 * strength;

                // Squash on landing
                if (fallT > 0.8) {
                    const landT = (fallT - 0.8) / 0.2;
                    scale = 1.0 - landT * 0.15;
                }

                glowIntensity = 1.8 - fallT * 0.6;
                glowBoost = 0.6 - fallT * 0.4;
            } else if (progress < 0.35) {
                // Phase 3: Down and dazed - on the ground
                const dazeT = (progress - 0.25) / 0.1;

                // Stay down
                posY = -0.25 * strength;
                rotX = 0.5 * strength;
                rotZ = 0.4 * strength;

                // Slight twitch/wobble while dazed
                const twitch = Math.sin(dazeT * Math.PI * 6) * 0.03 * (1 - dazeT);
                rotZ += twitch;

                // Squashed
                scale = 0.85;

                // Dim glow while down
                glowIntensity = 1.0 - dazeT * 0.3;
            } else if (progress < 0.45) {
                // Phase 4: Try to rise - hopeful attempt
                const riseT = (progress - 0.35) / 0.1;
                const riseEase = 1 - Math.pow(1 - riseT, 2);

                // Start to get up
                posY = (-0.25 + riseEase * 0.15) * strength;
                rotX = (0.5 - riseEase * 0.3) * strength;
                rotZ = (0.4 - riseEase * 0.2) * strength;

                // Uncrumple
                scale = 0.85 + riseEase * 0.1;

                // Hope flickers
                glowIntensity = 0.7 + riseEase * 0.4;
            } else if (progress < 0.55) {
                // Phase 5: Fail and fall back - nope!
                const failT = (progress - 0.45) / 0.1;
                const failEase = failT * failT;

                // Fall back down
                posY = (-0.1 - failEase * 0.15) * strength;
                rotX = (0.2 + failEase * 0.35) * strength;
                rotZ = (0.2 + failEase * 0.25) * strength;

                // Crumple again
                scale = 0.95 - failEase * 0.12;

                // Dramatic
                if (failT > 0.7) {
                    glowBoost = ((failT - 0.7) / 0.3) * 0.3;
                }
                glowIntensity = 1.1 - failT * 0.4;
            } else if (progress < 0.75) {
                // Phase 6: Stay down - really KO'd
                const koT = (progress - 0.55) / 0.2;

                // Fully down
                posY = -0.25 * strength;
                rotX = 0.55 * strength;
                rotZ = 0.45 * strength;

                // Flattened
                scale = 0.83;

                // Occasional twitch
                const twitch = Math.sin(koT * Math.PI * 4) * 0.02 * Math.sin(koT * Math.PI);
                rotZ += twitch;

                // Very dim
                glowIntensity = 0.6 + twitch * 2;
            } else if (progress < 0.9) {
                // Phase 7: Slowly rise - recovery begins
                const recoverT = (progress - 0.75) / 0.15;
                const recoverEase =
                    recoverT < 0.5
                        ? 2 * recoverT * recoverT
                        : 1 - Math.pow(-2 * recoverT + 2, 2) / 2;

                // Gradually get up
                posY = (-0.25 + recoverEase * 0.25) * strength;
                rotX = (0.55 - recoverEase * 0.55) * strength;
                rotZ = (0.45 - recoverEase * 0.45) * strength;

                // Uncrumple
                scale = 0.83 + recoverEase * 0.17;

                // Life returns
                glowIntensity = 0.6 + recoverEase * 0.5;
            } else {
                // Phase 8: Shake it off - recovery wobble
                const shakeT = (progress - 0.9) / 0.1;

                // Mostly upright
                posY = 0;
                rotX = 0;

                // Recovery wobble
                const wobble = Math.sin(shakeT * Math.PI * 6) * (1 - shakeT) * 0.08;
                rotZ = wobble * strength;

                // Head shake
                rotY = Math.sin(shakeT * Math.PI * 8) * (1 - shakeT) * 0.1 * strength;

                // Return to normal
                scale = 1.0;

                // Glow pulses back
                glowIntensity = 1.0 + Math.sin(shakeT * Math.PI * 3) * 0.2 * (1 - shakeT);
                glowBoost = Math.sin(shakeT * Math.PI) * 0.2;
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
