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
        strength: 1.0,
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        timingSync: 'nextBeat',
        durationSync: { mode: 'beats', beats: 1 },
        interruptible: true,
        priority: 6,
        blendable: true,
    },

    apply: (_particle, _progress, _params) => false,
    blend: (_particle, _progress, _params) => false,

    '3d': {
        isAccent: true,
        evaluate(progress, motion) {
            const strength = motion?.strength || 1.0;

            // FLARE: Explosive expansion like a solar flare
            // Instant attack, dramatic hold, glowing trail-off
            let envelope;
            if (progress < 0.1) {
                // Instant explosive attack
                const attackT = progress / 0.1;
                envelope = 1 - Math.pow(1 - attackT, 4); // Very fast ease out
            } else if (progress < 0.3) {
                // Hold at peak with slight pulse
                const holdT = (progress - 0.1) / 0.2;
                envelope = 1.0 - Math.sin(holdT * Math.PI) * 0.1; // Subtle pulse
            } else {
                // Slow glowing decay
                const decayT = (progress - 0.3) / 0.7;
                envelope = 1.0 - decayT;
                envelope = Math.pow(envelope, 0.6); // Slow decay curve
            }

            // Secondary pulse for energy feel
            const pulse = Math.sin(progress * Math.PI * 4) * 0.15 * (1 - progress);

            // Dramatic scale expansion
            const scaleAmount = envelope * 0.15 + pulse * 0.02;

            // Intense glow with fadeout
            const glowAmount = envelope * 0.8;

            // Slight upward motion (heat rises)
            const rise = envelope * 0.04 * strength;

            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1.0,
                scaleBoost: 1.0 + scaleAmount * strength,
                glowBoost: glowAmount * strength,
                positionBoost: [0, rise, 0],
            };
        },
    },
};
