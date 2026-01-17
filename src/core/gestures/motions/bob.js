/**
 * Bob gesture - Forward tilt accent
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * Like nodding to the beat - rotation only.
 */

export default {
    name: 'bob',
    emoji: '🙂',
    type: 'blending',
    description: 'Forward tilt accent - head nod feel',

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

            // Increased amplitude by 20% (0.025 -> 0.03)
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                rotationBoost: [envelope * 0.03 * strength, 0, 0]
            };
        }
    }
};
