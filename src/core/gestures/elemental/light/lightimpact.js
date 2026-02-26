/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Impact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightimpact gesture - light fragments converge inward to strike
 * @module gestures/destruction/elemental/lightimpact
 *
 * VISUAL DIAGRAM:
 *        ✦↘       ✧↙
 *          ╭─✦─╮              ← Light fragments converge INWARD
 *          │ ★  │                from wide orbit
 *          ╰─✧─╯                shrinking to mascot center
 *        ✦↗       ✧↖
 *
 * FEATURES:
 * - 5 light models orbiting, converging inward
 * - Reversed orbit: wide → narrow radius (gathering motion)
 * - 2 full revolutions with easeOut (fast start → slow convergence)
 * - Scale GROWS as fragments converge (impact intensifies)
 * - No cutout — tumbling provides variety
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTIMPACT_CONFIG = {
    name: 'lightimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Light fragments converge inward to strike the mascot',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'manifestation',
    radiance: 0.85,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'center',
            radius: 2.5,
            endRadius: 0.5, // Converging inward
            speed: 2,
            easing: 'easeOut',
            startScale: 0.6,
            endScale: 1.3, // Growing as they converge
            orientation: 'vertical',
        },
        formation: { type: 'ring', count: 5 },
        count: 5,
        scale: 1.4,
        models: ['prism-shard', 'light-ray', 'sparkle-star', 'prism-shard', 'light-ray'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.03,
            enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
            exit: { type: 'shrink', duration: 0.1, easing: 'easeInCubic' },
            procedural: { scaleSmoothing: 0.06, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeIn' },
            emissive: { min: 1.2, max: 2.8, frequency: 5, pattern: 'sine' },
            atmospherics: [
                {
                    preset: 'firefly',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 1.4,
                    progressCurve: 'rampUp',
                    velocityInheritance: 0.5,
                },
            ],
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'x', rotations: -2.5, phase: 72 },
                { axis: 'z', rotations: 3, phase: 144 },
                { axis: 'y', rotations: -2, phase: 216 },
                { axis: 'x', rotations: 2.5, phase: 288 },
            ],
            scaleVariance: 0.15,
            lifetimeVariance: 0.08,
            blending: 'additive',
            renderOrder: 18,
        },
    },

    decayRate: 0.15,
    glowColor: [1.0, 0.9, 0.55],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    scaleVibration: 0.02,
    scaleFrequency: 5,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTIMPACT_CONFIG);
