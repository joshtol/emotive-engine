/**
 * Swell gesture - Glow build with scale
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * For transitions and builds - like breathing in deeply.
 */

export default {
    name: 'swell',
    emoji: '🌟',
    type: 'blending',
    description: 'Glow build with scale - for transitions and builds',

    config: {
        duration: 600,
        musicalDuration: { musical: true, beats: 1.5 },
        strength: 1.0
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 1.5 },
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

            // Smooth bell curve envelope
            const envelope = Math.sin(progress * Math.PI);
            // Slight ease-out for organic feel
            const eased = 1 - Math.pow(1 - envelope, 2);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                scaleBoost: 1.0 + eased * 0.02 * strength,
                glowBoost: eased * 0.15 * strength
            };
        }
    }
};
