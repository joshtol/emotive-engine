/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Natureconstrict Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureconstrict gesture - massive vine sculptures squeeze inward
 * @module gestures/destruction/elemental/natureconstrict
 *
 * CONCEPT: Giant organic vine pieces orbit wide and CONSTRICT inward onto the
 * mascot like a fist closing. Each piece is a different model — s-vines, twisted
 * vines, thorn curls, u-vines — rendered LARGE with arc shader animation. They
 * start spread out and squeeze to center while slowly revolving, creating
 * visceral tightening pressure. A vine-cluster centerpiece materializes at peak
 * squeeze as the knot that locks everything tight.
 *
 * Layer 1: 4 large organic pieces orbiting — start wide, squeeze to center
 *          while slowly revolving. Arc animation sweeps life across them.
 * Layer 2: 1 large vine-cluster anchored at center — the knot, appears at
 *          peak squeeze with falling-leaves volumetrics.
 *
 * The squeeze is the motion itself — no extra ring needed.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATURECONSTRICT_CONFIG = {
    name: 'natureconstrict',
    emoji: '🌺',
    type: 'blending',
    description: 'Living squeeze — giant vine shapes orbit wide then constrict onto the mascot',
    duration: 2500,
    beats: 4,
    intensity: 1.0,
    category: 'emanating',
    growth: 0.85,

    spawnMode: [
        // ═════════════════════════════════════════════════════════════════════
        // LAYER 1: 4 organic models — orbit wide, squeeze inward
        // ═════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 0.5,
                endRadius: 0.0,
                speed: 0.4,
                easing: 'easeInCubic',
                startScale: 0.0,
                endScale: 1.0,
                orientation: 'camera',
            },
            formation: {
                type: 'ring',
                count: 4,
            },
            count: 4,
            scale: 2.5,
            models: ['s-vine', 'vine-twist', 'thorn-curl', 'u-vine'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.8,
                stagger: 0.12,
                enter: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'scale',
                    duration: 0.25,
                    easing: 'easeInCubic',
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true,
                },
                pulse: {
                    amplitude: 0.06,
                    frequency: 1.5,
                    easing: 'easeInOut',
                    sync: 'global',
                },
                emissive: {
                    min: 0.6,
                    max: 1.3,
                    frequency: 1.5,
                    pattern: 'sine',
                },
                rotate: [
                    { axis: 'z', rotations: 0.15, phase: 0 },
                    { axis: 'z', rotations: -0.25, phase: 45 },
                    { axis: 'z', rotations: 0.1, phase: 120 },
                    { axis: 'z', rotations: -0.2, phase: 200 },
                ],
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 6, scale: 1.2, weight: 1.0 },
                    secondary: { pattern: 3, scale: 2.0, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'spiral',
                    travelSpeed: 0.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                },
                grain: {
                    type: 3,
                    strength: 0.08,
                    scale: 0.3,
                    speed: 0.4,
                    blend: 'multiply',
                },
                scaleVariance: 0.2,
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    's-vine': {
                        shaderAnimation: { type: 1, arcWidth: 0.5, arcSpeed: 0.6, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                    'vine-twist': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.5, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                    'thorn-curl': {
                        shaderAnimation: { type: 1, arcWidth: 0.4, arcSpeed: 0.7, arcCount: 2 },
                        orientationOverride: 'camera',
                    },
                    'u-vine': {
                        shaderAnimation: { type: 1, arcWidth: 0.55, arcSpeed: 0.5, arcCount: 1 },
                        orientationOverride: 'vertical',
                    },
                },
            },
        },

        // ═════════════════════════════════════════════════════════════════════
        // LAYER 2: Centerpiece — vine-cluster at center, appears at peak squeeze
        // ═════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.0,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.01, frequency: 0.3 },
            },
            count: 1,
            scale: 2.0,
            models: ['vine-cluster'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.8,
                enter: {
                    type: 'scale',
                    duration: 0.25,
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'scale',
                    duration: 0.25,
                    easing: 'easeInCubic',
                },
                procedural: {
                    scaleSmoothing: 0.1,
                    geometryStability: true,
                },
                pulse: {
                    amplitude: 0.05,
                    frequency: 1.5,
                    easing: 'easeInOut',
                    sync: 'global',
                },
                emissive: {
                    min: 0.7,
                    max: 1.4,
                    frequency: 1.5,
                    pattern: 'sine',
                },
                rotate: { axis: 'z', rotations: -0.2, phase: 90 },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 6, scale: 2.5, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.6,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                },
                grain: {
                    type: 3,
                    strength: 0.06,
                    scale: 0.3,
                    speed: 0.3,
                    blend: 'multiply',
                },
                atmospherics: [
                    {
                        preset: 'falling-leaves',
                        targets: null,
                        anchor: 'around',
                        intensity: 0.4,
                        sizeScale: 0.8,
                        progressCurve: 'sustain',
                    },
                ],
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'vine-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 0.4, arcCount: 2 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    glowColor: [0.4, 0.85, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    tremor: 0.003,
    tremorFrequency: 3,
    decayRate: 0.18,

    // Squeeze tension: calm → accelerating close → peak tremor → release
    parameterAnimation: {
        growth: {
            keyframes: [
                { at: 0.0, value: 0.3 },
                { at: 0.2, value: 0.6 },
                { at: 0.5, value: 0.85 },
                { at: 0.7, value: 0.95 },
                { at: 0.85, value: 0.6 },
                { at: 1.0, value: 0.0 },
            ],
        },
        tremor: {
            keyframes: [
                { at: 0.0, value: 0.003 },
                { at: 0.4, value: 0.003 },
                { at: 0.6, value: 0.008 },
                { at: 0.75, value: 0.018 },
                { at: 0.85, value: 0.005 },
                { at: 1.0, value: 0.0 },
            ],
        },
        scaleVibration: {
            keyframes: [
                { at: 0.0, value: 0.01 },
                { at: 0.5, value: 0.01 },
                { at: 0.7, value: 0.03 },
                { at: 0.85, value: 0.01 },
                { at: 1.0, value: 0.0 },
            ],
        },
    },
};

export default buildNatureEffectGesture(NATURECONSTRICT_CONFIG);
