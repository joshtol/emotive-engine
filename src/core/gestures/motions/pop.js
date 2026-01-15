/**
 * Pop gesture - Pure scale pulse accent
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * Works WITH groove as punctuation rather than fighting it.
 */

export default {
    name: 'pop',
    emoji: '💥',
    type: 'blending',
    description: 'Quick scale pulse - the classic beat hit',

    config: {
        duration: 200,
        musicalDuration: { musical: true, beats: 0.5 },
        strength: 1.0
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 0.5 },
        interruptible: true,
        priority: 5,
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
                scaleBoost: 1.0 + envelope * 0.025 * strength
            };
        }
    }
};
