/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Heartbeat Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Heartbeat gesture - rhythmic double-pump (lub-dub)
 * @author Emotive Engine Team
 * @module gestures/effects/heartbeat
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     ♥ → ♥♥ → ♥     lub-dub rhythm
 *    small BIG small  double pulse
 *
 * USED BY:
 * - Anticipation
 * - Love/affection
 * - Excitement/nervousness
 * - Life/vitality
 */

export default {
    name: 'heartbeat',
    emoji: '💓',
    type: 'effect',
    description: 'Rhythmic double-pump heartbeat (lub-dub)',

    config: {
        duration: 1000,
        musicalDuration: { musical: true, beats: 2 },
        lubStrength: 0.8, // First beat strength
        dubStrength: 1.0, // Second beat strength (slightly stronger)
        lubDubGap: 0.15, // Gap between lub and dub (0-1)
        strength: 1.0,
        particleMotion: {
            type: 'heartbeat',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 2 },
        timingSync: 'onBeat',
        amplitudeSync: {
            onBeat: 1.2,
            offBeat: 0.8,
        },
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;

        // Calculate heartbeat pulse
        const pulse = this._calculatePulse(progress, config);

        // Expand particles outward on pulse
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const expand = pulse * 10 * strength;
        particle.x += (dx / dist) * expand;
        particle.y += (dy / dist) * expand;
    },

    _calculatePulse(progress, config) {
        const lubDubGap = config.lubDubGap || 0.15;
        const lubStrength = config.lubStrength || 0.8;
        const dubStrength = config.dubStrength || 1.0;

        // Heartbeat has two pulses: lub (first) and dub (second)
        // Lub at ~0.1, Dub at ~0.3, rest is recovery

        let pulse = 0;

        // Lub (first beat) - peaks at 0.1
        const lubCenter = 0.1;
        const lubWidth = 0.08;
        const lubDist = Math.abs(progress - lubCenter);
        if (lubDist < lubWidth) {
            pulse = Math.cos((lubDist / lubWidth) * Math.PI * 0.5) * lubStrength;
        }

        // Dub (second beat) - peaks at 0.1 + gap
        const dubCenter = lubCenter + lubDubGap + 0.05;
        const dubWidth = 0.1;
        const dubDist = Math.abs(progress - dubCenter);
        if (dubDist < dubWidth) {
            const dubPulse = Math.cos((dubDist / dubWidth) * Math.PI * 0.5) * dubStrength;
            pulse = Math.max(pulse, dubPulse);
        }

        return pulse;
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const lubDubGap = config.lubDubGap || 0.15;
            const lubStrength = config.lubStrength || 0.8;
            const dubStrength = config.dubStrength || 1.0;

            // Calculate lub-dub pulse
            let pulse = 0;

            // Lub (first beat)
            const lubCenter = 0.1;
            const lubWidth = 0.08;
            const lubDist = Math.abs(progress - lubCenter);
            if (lubDist < lubWidth) {
                pulse = Math.cos((lubDist / lubWidth) * Math.PI * 0.5) * lubStrength;
            }

            // Dub (second beat)
            const dubCenter = lubCenter + lubDubGap + 0.05;
            const dubWidth = 0.1;
            const dubDist = Math.abs(progress - dubCenter);
            if (dubDist < dubWidth) {
                const dubPulse = Math.cos((dubDist / dubWidth) * Math.PI * 0.5) * dubStrength;
                pulse = Math.max(pulse, dubPulse);
            }

            // Scale expands on pulse
            const scale = 1.0 + pulse * 0.15 * strength;

            // Slight forward push on pulse
            const zOffset = pulse * 0.03 * strength;

            // Strong glow on pulse
            const glowIntensity = 1.0 + pulse * 0.5 * strength;
            const glowBoost = pulse * 0.8 * strength;

            return {
                position: [0, 0, zOffset],
                rotation: [0, 0, 0],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
