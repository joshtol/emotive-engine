/**
 * Swagger gesture - Side lean with slight drift
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * Z-rotation lean with slight X drift - confident feel.
 */

export default {
    name: 'swagger',
    emoji: '😎',
    type: 'blending',
    description: 'Side lean with drift - confident swagger',

    config: {
        duration: 400,
        musicalDuration: { musical: true, beats: 1 },
        strength: 1.0
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 1 },
        interruptible: true,
        priority: 4,
        blendable: true
    },

    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,

    '3d': {
        isAccent: true,
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Swagger: confident side-to-side lean with attitude
            // Quick lean one way, hold, then return with style
            let leanAmount;
            if (progress < 0.3) {
                // Quick lean to the side
                const leanT = progress / 0.3;
                leanAmount = 1 - Math.pow(1 - leanT, 2); // Ease out
            } else if (progress < 0.7) {
                // Hold the pose with confidence
                leanAmount = 1.0;
            } else {
                // Return with style
                const returnT = (progress - 0.7) / 0.3;
                leanAmount = 1 - (returnT * returnT); // Ease in
            }

            // Alternate direction based on time for variety
            // (When chained, will alternate sides naturally)
            const direction = 1; // Could randomize in future

            // Confident lean with shoulder roll feel
            const rotZ = leanAmount * 0.12 * strength * direction;
            const posX = leanAmount * 0.04 * strength * direction;

            // Slight scale boost at peak (chest out)
            const scaleBoost = leanAmount * 0.03;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                rotationBoost: [0, 0, rotZ],
                positionBoost: [posX, leanAmount * 0.01 * strength, 0],
                scaleBoost: 1.0 + scaleBoost * strength
            };
        }
    }
};
