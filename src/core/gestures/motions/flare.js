/**
 * Flare gesture - Dramatic scale burst with glow
 *
 * ACCENT GESTURE: Uses boost multipliers, not absolute values.
 * The "big" accent for drops/hits - dramatic scale expansion + intense glow.
 * Think: solar flare, dramatic emphasis, impact moment.
 */

export default {
    name: 'flare',
    emoji: '🔥',
    type: 'blending',
    description: 'Dramatic scale burst with intense glow - for big moments',

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
        priority: 6,
        blendable: true
    },

    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,

    '3d': {
        isAccent: true,
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // Sharp attack, slower decay (explosion feel)
            // Fast rise in first 20%, slow decay over remaining 80%
            let envelope;
            if (progress < 0.2) {
                // Quick attack
                envelope = progress / 0.2;
            } else {
                // Slow decay
                envelope = 1.0 - ((progress - 0.2) / 0.8);
            }
            // Add some punch with power curve
            envelope = Math.pow(envelope, 0.7);

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                // More dramatic scale burst (was 0.03, now 0.08)
                scaleBoost: 1.0 + envelope * 0.08 * strength,
                // More intense glow (was 0.25, now 0.5)
                glowBoost: envelope * 0.5 * strength
            };
        }
    }
};
