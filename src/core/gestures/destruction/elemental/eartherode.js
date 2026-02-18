/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Erode Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Eartherode gesture - stone shell eroding off to reveal crystal beneath
 * @module gestures/destruction/elemental/eartherode
 *
 * FEATURES:
 * - Reversal of earthpetrify — mascot starts encased, stone breaks away
 * - Layer 1: Expanding orbit — rocks start close and spiral outward, SHRINKING as they go
 *   Petrification ramps DOWN (0.9 → 0.15) as stone dissolves
 * - Layer 2: Radial-burst debris — chunks breaking free and scattering outward
 *   Growing radius, shrinking scale — stone crumbling to dust as it flies
 * - Layer 3: Dust cloud — earth-ring expanding at feet (fallen debris spreading)
 * - Heavy earth-dust atmospherics throughout (crumbling stone particles)
 * - NOTE: Uses orbit instead of surface-shell to avoid phallic silhouettes
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHERODE_CONFIG = {
    name: 'eartherode',
    emoji: '🏜️',
    type: 'blending',
    description: 'Stone shell crumbles and erodes away, revealing the crystal beneath',
    duration: 3000,
    beats: 4,
    intensity: 0.9,
    category: 'transform',
    petrification: 0.9,

    spawnMode: [
        // ── Layer 1: Expanding orbit — rocks break free and spiral outward ──
        {
            type: 'orbit',
            orbit: {
                height: 'center',
                endHeight: 'center',
                radius: 0.35,
                endRadius: 1.8,
                speed: 1.0,
                easing: 'easeOutQuad',
                startScale: 1.0,
                endScale: 0.3,
                orientation: 'camera'
            },
            count: 5,
            scale: 0.7,
            models: ['boulder', 'rock-cluster', 'stone-slab', 'rock-chunk-medium', 'rock-cluster'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                stagger: 0.05,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: {
                    type: 'shrink',
                    duration: 0.25,
                    easing: 'easeInQuad'
                },
                parameterAnimation: {
                    petrification: {
                        start: 0.9,
                        peak: 0.6,
                        end: 0.15,
                        curve: 'fadeOut'
                    }
                },
                pulse: {
                    amplitude: 0.04,
                    frequency: 2,
                    easing: 'easeInOut'
                },
                emissive: { min: 0.3, max: 0.6, frequency: 1.5, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: 1.2, phase: 0 },
                    { axis: 'z', rotations: -0.8, phase: 72 },
                    { axis: 'y', rotations: 1.0, phase: 144 },
                    { axis: 'x', rotations: -0.9, phase: 216 },
                    { axis: 'z', rotations: 0.7, phase: 288 }
                ],
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.2, weight: 1.0 },
                    secondary: { pattern: 0, scale: 1.5, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.5
                },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 1.2,
                    progressCurve: 'sustain',
                }],
                scaleVariance: 0.3,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 6
            }
        },

        // ── Layer 2: Debris scattering outward — chunks breaking free ─────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 6,
                radius: 0.25,
                endRadius: 1.8,
                angleSpread: 360,
                startAngle: 15,
                orientation: 'camera',
                startScale: 0.5,
                endScale: 0.1,
                scaleEasing: 'easeInQuad'
            },
            count: 6,
            scale: 0.5,
            models: ['rock-chunk-small', 'rock-chunk-medium', 'rock-chunk-small',
                'rock-chunk-small', 'rock-cluster', 'rock-chunk-small'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.8,
                stagger: 0.06,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 0.8 },
                emissive: { min: 0.2, max: 0.5, frequency: 2, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 1.5, phase: 0 },
                    { axis: 'x', rotations: -1.2, phase: 60 },
                    { axis: 'y', rotations: 1.8, phase: 120 },
                    { axis: 'z', rotations: -1.0, phase: 180 },
                    { axis: 'x', rotations: 1.3, phase: 240 },
                    { axis: 'y', rotations: -1.5, phase: 300 }
                ],
                atmospherics: [{
                    preset: 'earth-gravel',
                    targets: null,
                    anchor: 'below',
                    intensity: 0.4,
                    sizeScale: 0.6,
                    progressCurve: 'burst',
                }],
                scaleVariance: 0.3,
                lifetimeVariance: 0.2,
                blending: 'normal',
                renderOrder: 10
            }
        },

        // ── Layer 3: Ground dust ring — fallen debris spreading ───────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'feet',
                offset: { x: 0, y: -0.02, z: 0 },
                orientation: 'flat',
                startScale: 0.4,
                endScale: 2.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.0,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.2,
                disappearAt: 0.75,
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 8, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 7, scale: 2.0, weight: 0.5 },
                    blend: 'add',
                    travel: 'radial',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.5
                },
                grain: {
                    type: 3, strength: 0.25, scale: 0.25, speed: 1.5, blend: 'multiply'
                },
                emissive: { min: 0.5, max: 1.0, frequency: 2, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['earth-ring'],
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 1.5,
                    progressCurve: 'sustain',
                }],
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.8,
                            arcSpeed: 1.0,
                            arcCount: 2
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        }
    ],

    fadeOut: true,
    fadeStartAt: 0.5,
    fadeEndAt: 0.95,
    fadeCurve: 'accelerating',
    scaleShrink: 0.08,
    decayRate: 0.25,
    glowColor: [0.70, 0.50, 0.25],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.6,
    glowFlickerRate: 1.5,
    tremor: 0.006,
    tremorFrequency: 3,
    tremorDecay: 0.7
};

export default buildEarthEffectGesture(EARTHERODE_CONFIG);
