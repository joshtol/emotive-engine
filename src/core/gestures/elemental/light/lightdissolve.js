/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Dissolve Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightdissolve gesture - light fading reluctantly, dispersing into nothing
 * @module gestures/destruction/elemental/lightdissolve
 *
 * VISUAL DIAGRAM:
 *     ·  ·  ·  ·  ·         ← Fragments scattering outward, dimming
 *       · · · · ·
 *         ✧ ✧ ✧             ← Started bright, now fading
 *          ★
 *         /|\
 *
 * CONCEPT: Light is going away and it's NOT happy about it. Fragments
 * of light start tight around the mascot, then reluctantly drift apart
 * and dim. Like fireflies scattering when disturbed — they don't WANT
 * to leave. Scale shrinks, emissive drops. Sad dissolution.
 *
 * FEATURES:
 * - 6 mixed fragments starting tight, drifting outward (reluctant dispersal)
 * - Orbit mode: tight start → wide end (scattering)
 * - Scale SHRINKS as they drift (losing power)
 * - Emissive DROPS from bright to dim (fading light)
 * - Slow easeOut — fast initial scatter, then reluctant trailing
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTDISSOLVE_CONFIG = {
    name: 'lightdissolve',
    emoji: '💨',
    type: 'blending',
    description: 'Light fading reluctantly — fragments scatter and dim unwillingly',
    duration: 3000,
    beats: 4,
    intensity: 0.8,
    category: 'transform',
    radiance: 0.5,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'above', // Drifting upward as they scatter
            radius: 0.4, // Start tight
            endRadius: 2.5, // Scatter far
            speed: 1.5, // 1.5 revolutions
            easing: 'easeOut', // Fast initial scatter, then trailing
            startScale: 1.2, // Start bright and full
            endScale: 0.3, // Shrink to nothing
            orientation: 'camera',
        },
        formation: { type: 'ring', count: 6 },
        count: 6,
        scale: 1.0,
        models: [
            'sparkle-star',
            'prism-shard',
            'sparkle-star',
            'prism-shard',
            'sparkle-star',
            'prism-shard',
        ],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85, // Long tail — reluctant to leave
            stagger: 0.04,
            enter: { type: 'fade', duration: 0.05, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.12, geometryStability: true },
            // Emissive DROPS — bright start, dim end
            emissive: { min: 0.4, max: 2.0, frequency: 2, pattern: 'sine' },
            // Slow sad pulse
            pulse: { amplitude: 0.06, frequency: 1.5, easing: 'easeInOut' },
            atmospherics: [
                {
                    preset: 'firefly',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.5,
                    progressCurve: 'fadeOut', // Particles fade too
                    velocityInheritance: 0.4,
                },
            ],
            rotate: [
                { axis: 'z', rotations: 1, phase: 0 },
                { axis: 'z', rotations: -1.5, phase: 60 },
                { axis: 'z', rotations: 1, phase: 120 },
                { axis: 'z', rotations: -1, phase: 180 },
                { axis: 'z', rotations: 1.5, phase: 240 },
                { axis: 'z', rotations: -1, phase: 300 },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 15,
        },
    },

    decayRate: 0.25,
    glowColor: [1.0, 0.92, 0.65], // Fading gold
    glowIntensityMin: 0.4,
    glowIntensityMax: 1.0,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTDISSOLVE_CONFIG);
