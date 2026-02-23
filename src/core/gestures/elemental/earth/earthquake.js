/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earthquake Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthquake gesture - catastrophic upheaval with falling rocks
 * @module gestures/destruction/elemental/earthquake
 *
 * FEATURES:
 * - Layer 1: Ground fissure — flat earth-ring at feet, expanding with cracks cutout
 * - Layer 2: Falling rocks — 6 mixed stones raining down from above
 *   Axis-travel top→below, tumbling, growing as they accelerate downward
 * - Layer 3: Surface spikes — stone-spikes erupting upward through the mascot
 * - Layer 4: Radial debris burst — chunks flying outward from the impact zone
 * - Maximum tremor + shake. Violent (1200ms).
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHQUAKE_CONFIG = {
    name: 'earthquake',
    emoji: '🌍',
    type: 'blending',
    description: 'Ground splits, rocks rain from above, spikes erupt, debris explodes outward',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'emanating',
    petrification: 0.6,

    spawnMode: [
        // ── Layer 1: Ground fissure ring ──────────────────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'feet',
                offset: { x: 0, y: 0.0, z: 0 },
                orientation: 'flat',
                startScale: 0.3,
                endScale: 2.5,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 1.8,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.6,
                enter: { type: 'fade', duration: 0.04, easing: 'linear' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                emissive: { min: 1.0, max: 2.0, frequency: 2, pattern: 'sine' },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['earth-ring'],
                    anchor: 'above',
                    intensity: 0.6,
                    sizeScale: 2.0,
                    progressCurve: 'burst',
                }],
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.9,
                            arcSpeed: 2.0,
                            arcCount: 2
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ── Layer 2: Falling rocks from above ─────────────────────────────
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'above',
                end: 'below',
                easing: 'easeIn',
                startScale: 0.4,
                endScale: 1.2,
                startDiameter: 1.8,
                endDiameter: 0.8,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 6,
                spacing: 0,
                arcOffset: 60,
                phaseOffset: 0
            },
            count: 6,
            scale: 0.7,
            models: ['boulder', 'rock-chunk-medium', 'rock-cluster', 'rock-chunk-medium', 'boulder', 'rock-chunk-small'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.55,
                stagger: 0.05,
                enter: { type: 'fade', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.1, easing: 'easeIn', burstScale: 1.3 },
                emissive: { min: 0.6, max: 1.2, frequency: 3, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: 2.0, phase: 0 },
                    { axis: 'z', rotations: -1.5, phase: 60 },
                    { axis: 'y', rotations: 2.5, phase: 120 },
                    { axis: 'x', rotations: -1.8, phase: 180 },
                    { axis: 'z', rotations: 1.2, phase: 240 },
                    { axis: 'y', rotations: -2.0, phase: 300 }
                ],
                atmospherics: [{
                    preset: 'earth-gravel',
                    targets: null,
                    anchor: 'below',
                    intensity: 0.5,
                    sizeScale: 0.8,
                    progressCurve: 'burst',
                }],
                scaleVariance: 0.3,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 10
            }
        },

        // ── Layer 3: Surface spikes erupting upward ───────────────────────
        {
            type: 'surface',
            pattern: 'spikes',
            embedDepth: 0.18,
            cameraFacing: 0.3,
            clustering: 0.1,
            count: 3,
            scale: 1.3,
            minDistance: 0.15,
            models: ['stone-spike', 'stone-spike', 'stone-spike'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.65,
                stagger: 0.06,
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.15,
                    easing: 'easeIn',
                    burstScale: 1.2
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                emissive: { min: 0.8, max: 1.8, frequency: 3, pattern: 'sine' },
                pulse: {
                    amplitude: 0.06,
                    frequency: 6,
                    easing: 'easeInOut'
                },
                scaleVariance: 0.3,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'stone-spike': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.6 },
                                y: { expand: true, rate: 2.5 },
                                z: { expand: false, rate: 0.6 }
                            }
                        }
                    }
                }
            }
        },

        // ── Layer 4: Radial debris burst ──────────────────────────────────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 5,
                radius: 0.2,
                endRadius: 2.0,
                angleSpread: 360,
                startAngle: 36,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 0.7,
                scaleEasing: 'easeOutQuad'
            },
            count: 5,
            scale: 0.45,
            models: ['rock-chunk-small', 'rock-chunk-medium', 'rock-chunk-small', 'rock-chunk-small', 'rock-chunk-medium'],
            speedCurve: 'burst',
            animation: {
                appearAt: 0.15,
                disappearAt: 0.7,
                stagger: 0.01,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.1 },
                emissive: { min: 0.5, max: 1.0, frequency: 3, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: 2.5, phase: 0 },
                    { axis: 'z', rotations: -2.0, phase: 72 },
                    { axis: 'y', rotations: 1.8, phase: 144 },
                    { axis: 'x', rotations: -1.5, phase: 216 },
                    { axis: 'z', rotations: 2.2, phase: 288 }
                ],
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 1.5,
                    progressCurve: 'sustain',
                }],
                scaleVariance: 0.3,
                blending: 'normal',
                renderOrder: 12
            }
        }
    ],

    shakeAmount: 0.04,
    shakeFrequency: 16,
    endFlash: true,
    decayRate: 0.1,
    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.5,
    glowFlickerRate: 8,
    tremor: 0.02,
    tremorFrequency: 12
};

export default buildEarthEffectGesture(EARTHQUAKE_CONFIG);
