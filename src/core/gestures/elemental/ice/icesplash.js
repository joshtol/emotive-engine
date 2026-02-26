/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icesplash Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icesplash gesture - explosive ice shatter with multiple elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icesplash
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *              ❄️              ← Center spike shoots UP
 *           ❄️    ❄️           ← Side crystals arc up/out
 *         •  •  •  •  •        ← Tiny frost particles (radial)
 *        ═══════════════       ← Expanding ring (shatter base)
 *            ○○○               ← Crystal cluster at impact
 *
 * FEATURES:
 * - Central expanding crystal-cluster (RADIAL cutout)
 * - 5 ice-spikes shooting UP and OUT like shatter arms
 * - 8 crystal-small in radial burst (VORONOI cutout)
 * - 12 tiny crystal particles for fine frost (DISSOLVE cutout)
 * - Crystal cluster at impact base
 * - TRUE SHATTER: centered burst, not trailing
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ice impact effects
 * - Shatter reactions
 * - Dramatic ice bursts
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icesplash gesture configuration
 * Explosive shatter - ice crystals bursting outward
 */
const ICESPLASH_CONFIG = {
    name: 'icesplash',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive ice shatter with crystals and frost spray',
    duration: 1000,
    beats: 2,
    intensity: 1.3,
    category: 'transform',
    frost: 0.85,

    // 3D Element spawning - TRUE SHATTER: centered burst
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central expanding crystal-cluster - the shatter "base"
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.3,
            models: ['crystal-cluster'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.4,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 2, scale: 1.5, weight: 1.0 }, // RADIAL - burst lines
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeOut',
                },
                grain: { type: 3, strength: 0.4, scale: 0.3, speed: 1.5, blend: 'multiply' },
                // Per-gesture atmospheric particles: cold mist from shatter
                atmospherics: [
                    {
                        preset: 'mist',
                        targets: null,
                        anchor: 'below',
                        intensity: 0.3,
                        sizeScale: 1.0,
                        progressCurve: 'sustain',
                    },
                ],
                blending: 'normal',
                renderOrder: 8,
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                modelOverrides: {
                    'crystal-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: BIG ice-spikes shooting UP and OUT - main shatter arms (5 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.6,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 1.0,
            models: ['ice-spike'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.4,
                    distance: 0.8,
                    direction: { x: 0, y: 1.0, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'ice-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.9,
            models: ['ice-spike'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.6,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: -0.7, y: 0.85, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'ice-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 1.3,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.9,
            models: ['ice-spike'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.6,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.3,
                    distance: 0.75,
                    direction: { x: 0.7, y: 0.85, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'ice-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.8,
            models: ['ice-spike'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.1,
                    distance: 0.6,
                    direction: { x: -0.95, y: 0.5, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 11,
                modelOverrides: {
                    'ice-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.8,
            models: ['ice-spike'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.18, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                drift: {
                    speed: 1.1,
                    distance: 0.6,
                    direction: { x: 0.95, y: 0.5, z: 0 },
                    easing: 'easeOutQuad',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 11,
                modelOverrides: {
                    'ice-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: MEDIUM crystals - secondary shatter (radial burst, 8 directions)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.05,
                endRadius: 0.65,
                angleSpread: 360,
                startAngle: 22,
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 8,
            scale: 0.5,
            models: ['crystal-small'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.4,
                stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 3, scale: 0.7, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                scaleVariance: 0.3,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 14,
                modelOverrides: {
                    'crystal-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: TINY frost particles - fine mist (radial burst, 12 particles)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 12,
                radius: 0.03,
                endRadius: 0.5,
                angleSpread: 360,
                startAngle: 0,
                orientation: 'camera',
                startScale: 0.1,
                endScale: 0.35,
                scaleEasing: 'easeOutQuad',
            },
            count: 12,
            scale: 0.2,
            models: ['crystal-small'],
            animation: {
                appearAt: 0.01,
                disappearAt: 0.3,
                stagger: 0.005,
                enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: {
                    strength: 0.3,
                    primary: { pattern: 7, scale: 0.5, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeOut',
                },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                scaleVariance: 0.5,
                lifetimeVariance: 0.25,
                blending: 'normal',
                renderOrder: 16,
                modelOverrides: {
                    'crystal-small': {
                        shaderAnimation: { type: 1, arcWidth: 0.98, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 5: Crystal cluster at base - impact base
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: -0.1, z: 0.12 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 0.9,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 0.6,
            models: ['crystal-cluster'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 1.2, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.5,
                    strengthCurve: 'constant',
                },
                pulse: { amplitude: 0.1, frequency: 8, easing: 'easeInOut' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'crystal-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 2 },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    // Glow - bright ice flash
    glowColor: [0.5, 0.8, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.2,
    glowFlickerRate: 6,
    // Scale - burst expansion
    scaleVibration: 0.035,
    scaleFrequency: 7,
    scaleGrowth: 0.015,
    // Tremor - impact shake
    tremor: 0.01,
    tremorFrequency: 8,
};

/**
 * Icesplash gesture - centered impact burst.
 *
 * TRUE SHATTER design - crystals bursting from center point:
 * - Layer 1: Expanding crystal-cluster base (RADIAL cutout)
 * - Layer 2: 5 ice-spikes shooting UP and OUT (shatter arms)
 * - Layer 3: 8 crystal-small in radial burst (VORONOI cutout)
 * - Layer 4: 12 tiny crystal particles (DISSOLVE cutout)
 * - Layer 5: Crystal cluster at impact base (VORONOI cutout)
 * All elements burst FROM center OUTWARD - no trailing.
 */
export default buildIceEffectGesture(ICESPLASH_CONFIG);
