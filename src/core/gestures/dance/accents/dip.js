/**
 * Dip gesture - Downward bob with tiny squish
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * Y-position dip with tiny squish - groove dip feel.
 */

export default {
    name: 'dip',
    emoji: '⬇️',
    type: 'blending',
    description: 'Downward bob - groove dip feel',

    config: {
        duration: 250,
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
                positionBoost: [0, -envelope * 0.015 * strength, 0],
                scaleBoost: 1.0 - envelope * 0.015 * strength
            };
        }
    }
};
