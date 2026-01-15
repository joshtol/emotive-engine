/**
 * Flare gesture - Combined scale + glow burst
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * The "big" accent for drops/hits - scale + glow burst.
 */

export default {
    name: 'flare',
    emoji: '🔥',
    type: 'blending',
    description: 'Scale + glow burst - the big accent for drops',

    config: {
        duration: 300,
        musicalDuration: { musical: true, beats: 0.75 },
        strength: 1.0
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 0.75 },
        interruptible: true,
        priority: 6,
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
                scaleBoost: 1.0 + envelope * 0.03 * strength,
                glowBoost: envelope * 0.25 * strength
            };
        }
    }
};
