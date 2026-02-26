/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Consume Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidconsume gesture - being swallowed by void, total absorption
 * @module gestures/destruction/elemental/voidconsume
 *
 * VISUAL DIAGRAM:
 *
 *     ═══════════          ← void-ring rises from below, passing OVER mascot
 *        ╲   ╱               like a mouth swallowing upward
 *         ╲ ╱
 *     ····★····            ← Surface void-shards crumble inward
 *         ╱ ╲
 *        ╱   ╲              ← void-wraps burst outward — displaced reality
 *     ═══════════
 *
 * CONCEPT: The void opens its maw BENEATH the mascot and swallows upward.
 * A horizontal void-ring rises from bottom to top like a scanner of annihilation.
 * As it passes, void-wraps burst outward (displaced reality fragments).
 * Surface shards crumble inward showing the mascot being consumed.
 *
 * DESIGN NOTES:
 * - void-ring is `large` class + NormalBlending = 100% opaque
 *   → arcWidth 0.5, single arc — half-ring sweeping like a jaw
 * - Radial burst of void-wraps = dramatic shockwave of displaced matter
 * - Surface spawn adds visceral "skin crumbling" detail
 * - Fastest void gesture (2500ms) — annihilation is sudden
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDCONSUME_CONFIG = {
    name: 'voidconsume',
    emoji: '⚫',
    type: 'blending',
    description: 'Being swallowed by void — the maw rises and consumes',
    duration: 2500,
    beats: 4,
    intensity: 1.5,
    category: 'annihilation',
    depth: 0.85,
    distortionStrength: 0.005,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: The Maw — void-ring rising from below to above (horizontal)
        // The ring IS the void's mouth, passing over the mascot as it swallows
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeIn', // Accelerates — the void gains momentum
                startScale: 0.8,
                endScale: 1.5, // Widens as it rises — maw opening
                startDiameter: 1.2,
                endDiameter: 2.5,
                orientation: 'flat', // Horizontal — a scanning plane of annihilation
            },
            formation: {
                type: 'spiral',
                count: 1,
                spacing: 0,
                arcOffset: 0,
                phaseOffset: 0,
            },
            count: 1,
            scale: 0.5, // Smaller for void's opaque large class
            models: ['void-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                pulse: { amplitude: 0.08, frequency: 4, easing: 'easeIn' },
                emissive: { min: 0.2, max: 0.6, frequency: 5, pattern: 'sine' },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 6, scale: 1.2, weight: 0.8 }, // SPIRAL — swirling void
                    secondary: { pattern: 3, scale: 0.8, weight: 0.4 }, // VORONOI — organic breakup
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 3.0, // Fast vertical travel — matches the rising motion
                    strengthCurve: 'fadeIn',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.5,
                    },
                },
                atmospherics: [
                    {
                        preset: 'darkness',
                        targets: ['void-ring'],
                        anchor: 'below',
                        intensity: 0.8,
                        sizeScale: 1.5,
                        progressCurve: 'sustain',
                    },
                ],
                blending: 'normal',
                renderOrder: 2,
                modelOverrides: {
                    'void-ring': {
                        shaderAnimation: {
                            type: 1, // ROTATING_ARC
                            arcWidth: 0.5, // Half-ring — a sweeping jaw
                            arcSpeed: 2.0, // Moderate rotation as it rises
                            arcCount: 1,
                        },
                        orientationOverride: 'flat',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Displaced Reality — 3 void-wraps bursting outward from center
        // As the void consumes, fragments of reality are flung aside
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 3,
                radius: 0.05,
                endRadius: 0.8,
                angleSpread: 360,
                startAngle: 60,
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.2,
                scaleEasing: 'easeOutQuad',
            },
            count: 3,
            scale: 0.5,
            models: ['void-wrap'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.6,
                stagger: 0.05,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 1, scale: 1.2, weight: 1.0 }, // STREAKS — shattered
                    secondary: { pattern: 0, scale: 0.7, weight: 0.3 }, // CELLULAR
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeIn',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.2,
                    },
                },
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: 0 },
                    { axis: 'z', rotations: -0.4, phase: 120 },
                    { axis: 'z', rotations: 0.6, phase: 240 },
                ],
                scaleVariance: 0.25,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35,
                            arcSpeed: 2.5,
                            arcCount: 2,
                        },
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Crumbling Surface — void-shards + corruption-patches on mascot skin
        // The mascot's surface crumbles inward as the void passes through
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'crown',
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.3,
            count: 8,
            scale: 1.1,
            models: ['void-crack', 'shadow-tendril', 'corruption-patch', 'void-shard'],
            minDistance: 0.08,
            animation: {
                appearAt: 0.05,
                disappearAt: 0.85,
                stagger: 0.02,
                enter: { type: 'grow', duration: 0.06, easing: 'easeOutQuad' },
                exit: { type: 'shrink', duration: 0.08, easing: 'easeInCubic' },
                pulse: { amplitude: 0.12, frequency: 3, easing: 'easeIn' },
                emissive: { min: 0.1, max: 0.4, frequency: 4, pattern: 'sine' },
                drift: { direction: 'inward', speed: 0.035, noise: 0.1 },
                rotate: { axis: 'y', speed: 0.12, oscillate: false },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 1,
                modelOverrides: {
                    'void-crack': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.6 },
                                y: { expand: true, rate: 1.4 },
                                z: { expand: true, rate: 0.8 },
                            },
                        },
                        drift: { direction: 'inward', speed: 0.04, noise: 0.1 },
                    },
                    'shadow-tendril': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.7 },
                                y: { expand: true, rate: 1.8 },
                                z: { expand: false, rate: 0.7 },
                            },
                            wobbleFrequency: 3,
                            wobbleAmplitude: 0.15,
                        },
                        drift: { direction: 'inward', speed: 0.035 },
                    },
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.5 },
                                y: { expand: false, rate: 0.5 },
                                z: { expand: true, rate: 1.5 },
                            },
                        },
                        drift: { direction: 'inward', speed: 0.03 },
                        orientationOverride: 'flat',
                    },
                    'void-shard': {
                        drift: { direction: 'inward', speed: 0.045, noise: 0.08 },
                        opacityLink: 'inverse-scale',
                    },
                },
            },
        },
    ],

    // Annihilation effects
    pullStrength: 0.025,
    spiralRate: 2.0,
    glowColor: [0.1, 0.05, 0.15],
    glowIntensityMin: 0.2,
    glowIntensityMax: 0.5,
    glowFlickerRate: 8,
    dimStrength: 0.4,
    scaleVibration: 0.03,
    scaleFrequency: 5,
    scaleShrink: 0.15,
    scalePulse: true,
    rotationSpeed: 1.2,
    fadeOut: true,
    fadeStartAt: 0.3,
    fadeEndAt: 0.85,
    fadeCurve: 'accelerating',
    decayRate: 0.15,
};

export default buildVoidEffectGesture(VOIDCONSUME_CONFIG);
