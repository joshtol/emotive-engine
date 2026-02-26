/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Snap Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Snap gesture - quick elastic snap to position then settle
 * @author Emotive Engine Team
 * @module gestures/effects/snap
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *     ⭐→→→⭐      Quick snap forward
 *        ←←       Overshoot back
 *         →       Settle
 *
 * USED BY:
 * - Decision made
 * - Attention grab
 * - Confirmation/click
 * - Snappy transitions
 */

export default {
    name: 'snap',
    emoji: '⚡',
    type: 'effect',
    description: 'Quick elastic snap with overshoot and settle',

    config: {
        duration: 500,
        musicalDuration: { musical: true, beats: 1 },
        snapDistance: 0.1, // How far to snap (3D units)
        overshoot: 1.3, // Overshoot multiplier
        bounces: 2, // Number of settle bounces
        strength: 1.0,
        particleMotion: {
            type: 'snap',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 1 },
        timingSync: 'onBeat',

        accentResponse: {
            enabled: true,
            multiplier: 1.5,
        },
    },

    apply(particle, progress, motion, dt, centerX, centerY) {
        const config = { ...this.config, ...motion };
        const strength = config.strength || 1.0;
        const snapDistance = (config.snapDistance || 0.1) * 100; // Scale for 2D
        const overshoot = config.overshoot || 1.3;

        // Calculate snap position with spring physics
        const snapValue = this._calculateSnap(progress, overshoot, config.bounces || 2);

        // Apply to particle (radial snap toward center)
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        particle.x += (dx / dist) * snapValue * snapDistance * strength * 0.1;
        particle.y += (dy / dist) * snapValue * snapDistance * strength * 0.1;
    },

    _calculateSnap(progress, overshoot, bounces) {
        // Spring physics simulation
        // Quick snap to overshoot, then damped oscillation back to 1.0

        if (progress < 0.2) {
            // Initial snap - quick ease to overshoot
            const t = progress / 0.2;
            const eased = 1 - Math.pow(1 - t, 3);
            return eased * overshoot;
        } else {
            // Damped settle
            const settleProgress = (progress - 0.2) / 0.8;
            const decay = Math.exp(-settleProgress * 4);
            const oscillation = Math.cos(settleProgress * Math.PI * bounces * 2);
            const deviation = (overshoot - 1) * oscillation * decay;
            return 1 + deviation;
        }
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const snapDistance = config.snapDistance || 0.1;
            const overshoot = config.overshoot || 1.3;
            const bounces = config.bounces || 2;

            // Calculate snap with spring physics
            let snapValue;

            if (progress < 0.2) {
                // Initial snap
                const t = progress / 0.2;
                const eased = 1 - Math.pow(1 - t, 3);
                snapValue = eased * overshoot;
            } else {
                // Damped settle
                const settleProgress = (progress - 0.2) / 0.8;
                const decay = Math.exp(-settleProgress * 4);
                const oscillation = Math.cos(settleProgress * Math.PI * bounces * 2);
                const deviation = (overshoot - 1) * oscillation * decay;
                snapValue = 1 + deviation;
            }

            // Forward snap motion
            const zOffset = (snapValue - 1) * snapDistance * strength;

            // Scale pulses with snap
            const scale = 1 + (snapValue - 1) * 0.15;

            // Slight rotation on snap
            const rotZ = (snapValue - 1) * 0.1 * strength;

            // Glow flash on snap
            const glowIntensity = 1.0 + Math.abs(snapValue - 1) * 0.5;
            const glowBoost = progress < 0.3 ? ((0.3 - progress) / 0.3) * 0.4 : 0;

            return {
                position: [0, 0, zOffset],
                rotation: [0, 0, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
