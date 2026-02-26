/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wobble Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wobble gesture - unsteady circular wobbling
 * @author Emotive Engine Team
 * @module gestures/transforms/wobble
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *       ↺ ⭐ ↻
 *      Circular wobble
 *        🥴
 *
 * USED BY:
 * - Dizzy/disoriented
 * - Confused
 * - Drunk/woozy
 * - Jelly/gelatin effect
 */

export default {
    name: 'wobble',
    emoji: '🥴',
    type: 'override',
    description: 'Unsteady circular wobbling motion',

    config: {
        duration: 1500,
        musicalDuration: { musical: true, beats: 4 },
        wobbleRadius: 0.08, // Circular wobble radius
        wobbleAngle: 0.2, // Tilt angle during wobble
        rotations: 2, // Wobble rotations
        decay: 0.5, // How much wobble reduces
        strength: 1.0,
        particleMotion: {
            type: 'wobble',
            strength: 1.0,
        },
    },

    rhythm: {
        enabled: true,
        syncMode: 'beat',
        durationSync: { mode: 'beats', beats: 4 },
        timingSync: 'onBeat',
    },

    '3d': {
        evaluate(progress, motion) {
            const config = motion.config || this.config || {};
            const strength = config.strength || 1.0;
            const wobbleRadius = config.wobbleRadius || 0.08;
            const wobbleAngle = config.wobbleAngle || 0.2;
            const rotations = config.rotations || 2;
            const decay = config.decay || 0.5;

            // Circular wobble with decay
            const phase = progress * rotations * Math.PI * 2;
            const decayFactor = 1 - decay * progress;

            // Circular position offset
            const xOffset = Math.sin(phase) * wobbleRadius * decayFactor * strength;
            const zOffset = Math.cos(phase) * wobbleRadius * decayFactor * strength;

            // Tilting follows the wobble
            const rotX = Math.cos(phase) * wobbleAngle * decayFactor * strength;
            const rotZ = Math.sin(phase) * wobbleAngle * decayFactor * strength;

            // Slight Y variation
            const yOffset = Math.sin(phase * 2) * 0.02 * decayFactor * strength;

            // Wobbly scale
            const scale = 1.0 + Math.sin(phase * 2) * 0.05 * decayFactor;

            // Disoriented glow
            const glowIntensity = 1.0 + Math.sin(phase) * 0.2 * decayFactor;
            const glowBoost = 0;

            return {
                position: [xOffset, yOffset, zOffset],
                rotation: [rotX, 0, rotZ],
                scale,
                glowIntensity,
                glowBoost,
            };
        },
    },
};
