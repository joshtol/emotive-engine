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

            // Swell: slow build to peak, then gradual release
            // Like taking a deep breath and expanding
            let envelope;
            if (progress < 0.6) {
                // Slow build (60% of time for rising)
                const buildT = progress / 0.6;
                envelope = buildT * buildT; // Ease in - gradual buildup
            } else {
                // Gradual release (40% of time for falling)
                const releaseT = (progress - 0.6) / 0.4;
                envelope = 1 - (releaseT * releaseT); // Ease out - gentle release
            }

            // Rise up slightly during swell
            const rise = Math.sin(progress * Math.PI) * 0.03 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                scaleBoost: 1.0 + envelope * 0.1 * strength,
                glowBoost: envelope * 0.4 * strength,
                positionBoost: [0, rise, 0]
            };
        }
    }
};
