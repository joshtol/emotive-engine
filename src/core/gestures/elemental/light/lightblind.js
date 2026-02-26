/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Blind Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightblind gesture - KAAAAZAAAM pulsar flash bang
 * @module gestures/destruction/elemental/lightblind
 *
 * VISUAL DIAGRAM:
 *   ✧ ✧ ✧ ✧ ✧ ✧ ✧ ✧           ← 8 sparkle fragments erupting
 *  ✧  ╔═══════════╗  ✧         ← Light-burst SUPERNOVA at center
 * ✧   ║  ═══════  ║   ✧          (zero → massive in 10ms)
 *  ✧  ║    ═══    ║  ✧         ← 2 ring shockwaves
 *   ✧ ╚═══════════╝ ✧
 *
 * CONCEPT: KAAAAZAAAM! A pulsar flash bang — the most violent non-blast
 * gesture. Everything happens in 600ms. Light-burst supernova EXPLODES,
 * TWO ring shockwaves ripple, 8 sparkle-star fragments shatter in all
 * directions. Screen distortion adds to the impact. Pure overwhelming light.
 *
 * FEATURES:
 * - Light-burst supernova: 0.1 → 4.0 scale INSTANTLY
 * - 2 light-ring shockwaves (staggered expanding)
 * - 8 sparkle-star fragments in radial-burst
 * - 600ms duration — flash bang speed
 * - distortionStrength: 0.8 — screen warp on impact
 * - Emissive peaks at 4.0+ — truly blinding
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTBLIND_CONFIG = {
    name: 'lightblind',
    emoji: '☀️',
    type: 'blending',
    description: 'KAAAAZAAAM! Blinding pulsar flash bang — overwhelming radiance',
    duration: 600,
    beats: 1,
    intensity: 2.0,
    category: 'afflicted',
    radiance: 1.0,
    distortionStrength: 0.8,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Light-burst SUPERNOVA — the flash itself
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.1,
                endScale: 4.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 2.8,
            models: ['light-burst'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.35,
                enter: { type: 'flash', duration: 0.01, easing: 'linear' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                pulse: { amplitude: 0.18, frequency: 15, easing: 'easeOut' },
                emissive: { min: 2.5, max: 4.5, frequency: 18, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 20,
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Light-ring shockwave 1
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 4.0,
                scaleEasing: 'easeOutCubic',
            },
            count: 1,
            scale: 2.2,
            models: ['light-ring'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.3,
                enter: { type: 'flash', duration: 0.01, easing: 'linear' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                emissive: { min: 1.8, max: 3.5, frequency: 12, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 19,
                modelOverrides: {
                    'light-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // Shockwave 2 — second ripple
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.15,
                endScale: 3.0,
                scaleEasing: 'easeOutCubic',
            },
            count: 1,
            scale: 1.8,
            models: ['light-ring'],
            animation: {
                appearAt: 0.06,
                disappearAt: 0.35,
                enter: { type: 'flash', duration: 0.01, easing: 'linear' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                emissive: { min: 1.5, max: 3.0, frequency: 10, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 18,
                modelOverrides: {
                    'light-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 8 sparkle-star fragments — radial shrapnel
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.1,
                endRadius: 2.2,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 8,
            scale: 0.9,
            models: ['sparkle-star'],
            animation: {
                appearAt: 0.01,
                disappearAt: 0.4,
                stagger: 0.003,
                enter: { type: 'flash', duration: 0.01, easing: 'linear' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                emissive: { min: 1.8, max: 4.0, frequency: 15, pattern: 'sine' },
                atmospherics: [
                    {
                        preset: 'firefly',
                        targets: null,
                        anchor: 'around',
                        intensity: 1.0,
                        sizeScale: 2.5,
                        progressCurve: 'pulse',
                    },
                ],
                rotate: [
                    { axis: 'z', rotations: 2.5, phase: 0 },
                    { axis: 'z', rotations: -3.0, phase: 45 },
                    { axis: 'z', rotations: 3.5, phase: 90 },
                    { axis: 'z', rotations: -2.5, phase: 135 },
                    { axis: 'z', rotations: 3.0, phase: 180 },
                    { axis: 'z', rotations: -3.5, phase: 225 },
                    { axis: 'z', rotations: 2.5, phase: 270 },
                    { axis: 'z', rotations: -3.0, phase: 315 },
                ],
                scaleVariance: 0.3,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 21,
            },
        },
    ],

    decayRate: 0.08,
    endFlash: true,
    glowColor: [1.0, 0.98, 0.9],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 12,
    scaleVibration: 0.04,
    scaleFrequency: 10,
    recoilAmount: 0.02,
    recoilSpeed: 4,
};

export default buildLightEffectGesture(LIGHTBLIND_CONFIG);
