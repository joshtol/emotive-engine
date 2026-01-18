/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Inflate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Inflate gesture - puff up dramatically
 * @author Emotive Engine Team
 * @module gestures/transforms/inflate
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *        ⭐         Normal
 *        ↓
 *      ⭐⭐⭐       Inflated/puffed up
 *
 * USED BY:
 * - Pride/confidence
 * - Anger (puffing up)
 * - Taking a deep breath
 * - Power-up effect
 */

export default {
    name: 'inflate',
    emoji: '🎈',
    type: 'override',
    description: 'Puff up dramatically like a balloon',

    config: {
        duration: 800,
        musicalDuration: { musical: true, beats: 2 },
        maxScale: 1.4,        // Maximum inflation size
        holdTime: 0.3,        // Time to hold at max
        deflate: true,        // Return to normal size
        strength: 1.0,
        particleMotion: {
            type: 'inflate',
            strength: 1.0
        }
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2 },
        timingSync: 'onBeat',

        strengthSync: {
            onBeat: 1.3,
            offBeat: 0.8
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const maxScale = config.maxScale || 1.4;
            const holdTime = config.holdTime || 0.3;
            const deflate = config.deflate !== false;

            // Inflate envelope
            let inflateAmount;
            const inflatePhase = (1 - holdTime) * 0.5;
            const deflateStart = 1 - inflatePhase;

            if (progress < inflatePhase) {
                // Inflating
                inflateAmount = progress / inflatePhase;
                inflateAmount = 1 - Math.pow(1 - inflateAmount, 2); // Ease out
            } else if (progress < deflateStart || !deflate) {
                // Holding
                inflateAmount = 1.0;
            } else {
                // Deflating
                inflateAmount = 1 - ((progress - deflateStart) / inflatePhase);
                inflateAmount = Math.pow(inflateAmount, 2); // Ease in
            }

            // Scale up
            const scaleAmount = 1 + (maxScale - 1) * inflateAmount * strength;

            // Rise slightly when inflated
            const yOffset = inflateAmount * 0.08 * strength;

            // Glow increases with inflation
            const glowIntensity = 1.0 + inflateAmount * 0.4 * strength;
            const glowBoost = inflateAmount * 0.3;

            // Slight wobble at peak inflation
            const wobble = inflateAmount > 0.8 ? Math.sin(progress * Math.PI * 8) * 0.02 : 0;

            return {
                position: [wobble, yOffset, 0],
                rotation: [0, 0, wobble * 2],
                scale: scaleAmount,
                glowIntensity,
                glowBoost
            };
        }
    }
};
