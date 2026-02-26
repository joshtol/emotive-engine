/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Deflate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Deflate gesture - shrink down sadly
 * @author Emotive Engine Team
 * @module gestures/transforms/deflate
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *      ⭐⭐⭐       Normal
 *        ↓
 *        ·         Deflated/shrunk
 *
 * USED BY:
 * - Defeat/disappointment
 * - Sadness
 * - Losing energy
 * - Giving up
 */

export default {
    name: 'deflate',
    emoji: '💨',
    type: 'override',
    description: 'Shrink down sadly like a deflating balloon',

    config: {
        duration: 1000,
        musicalDuration: { musical: true, beats: 2.5 },
        minScale: 0.6, // Minimum deflated size
        droop: 0.15, // How much to droop down
        reinflate: true, // Return to normal
        strength: 1.0,
        particleMotion: {
            type: 'deflate',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2.5 },
        timingSync: 'onBeat',
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const minScale = config.minScale || 0.6;
            const droop = config.droop || 0.15;
            const reinflate = config.reinflate !== false;

            // Deflate envelope - slow sad deflation
            let deflateAmount;
            if (progress < 0.5) {
                // Slow deflation
                deflateAmount = progress / 0.5;
                deflateAmount = Math.pow(deflateAmount, 0.7); // Slower ease
            } else if (progress < 0.7 || !reinflate) {
                // Stay deflated
                deflateAmount = 1.0;
            } else {
                // Slow reinflation
                deflateAmount = 1 - (progress - 0.7) / 0.3;
                deflateAmount = Math.pow(deflateAmount, 1.5);
            }

            // Scale down
            const scaleAmount = 1 - (1 - minScale) * deflateAmount * strength;

            // Droop down
            const yOffset = -deflateAmount * droop * strength;

            // Slight sad tilt
            const tiltX = deflateAmount * 0.15 * strength;
            const tiltZ = deflateAmount * 0.1 * strength;

            // Dim glow when deflated
            const glowIntensity = 1.0 - deflateAmount * 0.4;
            const glowBoost = 0;

            return {
                position: [0, yOffset, 0],
                rotation: [tiltX, 0, tiltZ],
                scale: scaleAmount,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
