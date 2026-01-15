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
            const envelope = Math.sin(progress * Math.PI);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                rotationBoost: [0, 0, envelope * 0.04 * strength],
                positionBoost: [envelope * 0.01 * strength, 0, 0]
            };
        }
    }
};
