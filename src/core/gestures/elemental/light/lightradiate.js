/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Radiate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightradiate gesture - high-level divine radiance in all directions
 * @module gestures/destruction/elemental/lightradiate
 *
 * VISUAL DIAGRAM:
 *       ✦    ═══    ✦
 *     ═══    ★    ═══      ← Sun-rings expanding outward
 *       ✦    ═══    ✦        + light-ray arms radiating
 *            /|\
 *
 * CONCEPT: The sun itself. Maximum radiance pouring outward.
 * A vertical pillar of 4 sun-rings rising while 4 light-rays
 * radiate outward from center like solar flare arms. POWERFUL.
 *
 * FEATURES:
 * - 4 sun-rings in axis-travel (ascending radiance column)
 * - 4 light-rays in radial-burst (solar flare arms)
 * - High emissive, fast pulses
 * - Brilliant golden white
 * - Intense firefly atmospherics
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTRADIATE_CONFIG = {
    name: 'lightradiate',
    emoji: '💫',
    type: 'blending',
    description: 'Powerful divine radiance emanating in all directions like a sun',
    duration: 2500,
    beats: 4,
    intensity: 1.4,
    mascotGlow: 0.8,
    category: 'emanating',
    radiance: 0.9,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: 4 sun-rings — ascending radiance column
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'above',
                easing: 'easeInOut',
                startScale: 1.2,
                endScale: 1.6,
                startDiameter: 1.0,
                endDiameter: 1.8,
                orientation: 'flat',
            },
            formation: {
                type: 'spiral',
                count: 4,
                spacing: 0.05,
                arcOffset: 90,
                phaseOffset: 0,
            },
            count: 4,
            scale: 1.1,
            models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.5,
                stagger: 0.03,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.12, frequency: 4, easing: 'easeInOut' },
                emissive: { min: 1.2, max: 2.8, frequency: 5, pattern: 'sine' },
                atmospherics: [
                    {
                        preset: 'firefly',
                        targets: null,
                        anchor: 'above',
                        intensity: 0.5,
                        sizeScale: 1.2,
                        progressCurve: 'sustain',
                        velocityInheritance: 0.4,
                    },
                ],
                rotate: { axis: 'z', rotations: 0.6, phase: 0 },
                blending: 'additive',
                renderOrder: 15,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.75, arcSpeed: 1.0, arcCount: 2 },
                        orientationOverride: 'flat',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 4 light-rays — solar flare arms radiating from center
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 4,
                radius: 0.15,
                endRadius: 1.2,
                angleSpread: 360,
                startAngle: 45, // Offset so rays sit between rings
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.5,
                scaleEasing: 'easeOutQuad',
            },
            count: 4,
            scale: 1.3,
            models: ['light-ray'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.55,
                stagger: 0.02,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.2 },
                emissive: { min: 1.3, max: 2.5, frequency: 4, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: 0 },
                    { axis: 'z', rotations: -0.5, phase: 90 },
                    { axis: 'z', rotations: 0.5, phase: 180 },
                    { axis: 'z', rotations: -0.5, phase: 270 },
                ],
                scaleVariance: 0.2,
                blending: 'additive',
                renderOrder: 17,
            },
        },
    ],

    decayRate: 0.15,
    glowColor: [1.0, 0.88, 0.5], // Brilliant gold
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 5,
    scaleVibration: 0.025,
    scaleFrequency: 4,
    scalePulse: true,
    scaleExpand: 0.02,
};

export default buildLightEffectGesture(LIGHTRADIATE_CONFIG);
