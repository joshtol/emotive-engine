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
        strength: 1.0,
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 0.5 },
        interruptible: true,
        priority: 5,
        blendable: true,
    },

    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,

    '3d': {
        isAccent: true,
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Sharp attack, quick release - like a beat hit
            let envelope;
            if (progress < 0.15) {
                // Fast attack
                envelope = progress / 0.15;
                envelope = 1 - Math.pow(1 - envelope, 3); // Ease out for punch
            } else {
                // Quick decay
                envelope = 1 - (progress - 0.15) / 0.85;
                envelope = Math.pow(envelope, 2); // Ease in for snap back
            }

            // Pop: quick scale pulse with small bounce and glow
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                scaleBoost: 1.0 + envelope * 0.08 * strength,
                glowBoost: envelope * 0.3 * strength,
                // Slight upward pop
                positionBoost: [0, envelope * 0.02 * strength, 0],
            };
        },
    },
};
