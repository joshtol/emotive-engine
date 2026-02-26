/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturepillar gesture - towering growth column of vine rings
 * @module gestures/destruction/elemental/naturepillar
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations (mirrors earthpillar structure)
 * - Layer 1: 2 bottom rings with CELLULAR + angular travel
 * - Layer 2: 2 middle rings with VORONOI + radial travel
 * - Layer 3: 2 top rings with CRACKS + oscillate travel
 * - Tapered: wider at base, narrower at crown
 * - Alternating spin directions for organic twist
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.8,
    enter: {
        type: 'scale',
        duration: 0.15,
        easing: 'easeOutBack',
    },
    exit: {
        type: 'scale',
        duration: 0.2,
        easing: 'easeInCubic',
    },
    procedural: {
        scaleSmoothing: 0.08,
        geometryStability: true,
    },
    pulse: {
        amplitude: 0.04,
        frequency: 2,
        easing: 'easeInOut',
        sync: 'global',
    },
    emissive: {
        min: 0.7,
        max: 1.4,
        frequency: 2,
        pattern: 'sine',
    },
    grain: {
        type: 3,
        strength: 0.03,
        scale: 0.3,
        speed: 0.35,
        blend: 'multiply',
    },
    atmospherics: [
        {
            preset: 'falling-leaves',
            targets: null,
            anchor: 'around',
            intensity: 0.3,
            sizeScale: 0.8,
            progressCurve: 'sustain',
        },
    ],
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 12,
    modelOverrides: {
        'vine-ring': {
            shaderAnimation: {
                type: 1,
                arcWidth: 0.85,
                arcSpeed: 1.5,
                arcCount: 2,
            },
            orientationOverride: 'flat',
        },
    },
};

const NATUREPILLAR_CONFIG = {
    name: 'naturepillar',
    emoji: '🌴',
    type: 'blending',
    description: 'Towering growth — vine rings stack upward forming a tapered trunk',
    duration: 2500,
    beats: 5,
    intensity: 1.2,
    mascotGlow: 0.4,
    category: 'emanating',
    growth: 0.85,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Bottom 2 rings — CELLULAR + angular travel (wide base)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.8,
                endScale: 1.2,
                startDiameter: 1.3,
                endDiameter: 2.0,
                diameterUnit: 'mascot',
                orientation: 'flat',
                startOffset: 0,
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25,
            },
            count: 2,
            scale: 2.2,
            models: ['vine-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 1.2, weight: 1.0 },
                    secondary: { pattern: 8, scale: 1.5, weight: 0.35 },
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                },
                rotate: [
                    { axis: 'z', rotations: 0.3, phase: 0 },
                    { axis: 'z', rotations: -0.35, phase: 180 },
                ],
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Middle 2 rings — VORONOI + radial travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.8,
                endScale: 1.2,
                startDiameter: 1.3,
                endDiameter: 2.0,
                diameterUnit: 'mascot',
                orientation: 'flat',
                startOffset: 0.5,
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25,
            },
            count: 2,
            scale: 2.2,
            models: ['vine-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 3, scale: 1.4, weight: 1.0 },
                    secondary: { pattern: 6, scale: 1.2, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 0.5,
                },
                rotate: [
                    { axis: 'z', rotations: -0.4, phase: 60 },
                    { axis: 'z', rotations: 0.45, phase: 240 },
                ],
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings — CRACKS + oscillate travel (narrow crown)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.8,
                endScale: 1.2,
                startDiameter: 1.3,
                endDiameter: 2.0,
                diameterUnit: 'mascot',
                orientation: 'flat',
                startOffset: 1.0,
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25,
            },
            count: 2,
            scale: 2.2,
            models: ['vine-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 8, scale: 1.3, weight: 1.0 },
                    secondary: { pattern: 3, scale: 1.5, weight: 0.35 },
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                },
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: 90 },
                    { axis: 'z', rotations: -0.4, phase: 270 },
                ],
            },
        },
    ],

    glowColor: [0.25, 0.7, 0.2],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.5,
    glowFlickerRate: 3,
    scaleVibration: 0.015,
    scaleFrequency: 2,
    scaleGrow: 0.03,
    tremor: 0.004,
    tremorFrequency: 3,
    decayRate: 0.18,
};

export default buildNatureEffectGesture(NATUREPILLAR_CONFIG);
