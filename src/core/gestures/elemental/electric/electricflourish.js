/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricflourish gesture - spinning sword flourish with lightning trails
 * @module gestures/destruction/elemental/electricflourish
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing plasma-rings (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: 3 spinning lightning-rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal slash arcs (tilted rings)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic lightning flourish
 * - Layer 1: 3 camera-facing spinning lightning-rings
 * - Layer 2: 2 crossing plasma-rings creating X sweep
 * - Layer 3: 2 tilted lightning-ring arcs at ±45° angles
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICFLOURISH_CONFIG = {
    name: 'electricflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Spinning lightning flourish with electric trails',
    duration: 1200,
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.3,
    category: 'powered',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: 3 spinning lightning-rings at center (camera-facing)
        // Matches fire/water/ice flourish Layer 1 structure
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                easing: 'linear',
                startScale: 0.7,
                endScale: 1.2,
                startDiameter: 1.8,
                endDiameter: 2.8,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 3,
                spacing: 0,
                arcOffset: 120,
                phaseOffset: 0.05,
                zOffset: 0
            },
            count: 3,
            scale: 2.0,
            models: ['lightning-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.45,
                stagger: 0.12,
                enter: {
                    type: 'fade',
                    duration: 0.03,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.85,
                    easing: 'easeIn',
                    burstScale: 1.15
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                flicker: {
                    intensity: 0.3,
                    rate: 14,
                    pattern: 'random'
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 5,
                    easing: 'easeInOut',
                    perElement: true
                },
                emissive: {
                    min: 1.0,
                    max: 2.2,
                    frequency: 6,
                    pattern: 'sine'
                },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.6, weight: 0.5 },
                    blend: 'multiply',
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply'
                },
                // Per-gesture atmospheric particles: ionized air from flourish
                atmospherics: [{
                    preset: 'ozone',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.15,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.4,
                }],
                drift: {
                    speed: 0.3,
                    distance: 0.18,
                    pattern: 'radial',
                    accelerate: true
                },
                opacityGradient: [1.0, 0.85, 0.7],
                rotate: [
                    { axis: 'z', rotations: 2.5, phase: 0 },
                    { axis: 'z', rotations: -2.0, phase: 120 },
                    { axis: 'z', rotations: 1.8, phase: 240 }
                ],
                tilt: {
                    axis: 'y',
                    oscillate: true,
                    range: 0.4,
                    speed: 3.5
                },
                wobble: {
                    axis: 'x',
                    oscillate: true,
                    range: 0.15,
                    speed: 2.0,
                    phase: 90
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'lightning-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.5,
                            arcSpeed: 1.0,
                            arcCount: 2
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: Crossing plasma-rings (diagonal X sweep)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.7, y: 0.4, z: 0.05 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.8, models: ['plasma-ring'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.04, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.7, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply' },
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: 1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic'
                },
                rotate: [{ axis: 'z', rotations: 1.0, phase: -45 }],
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.7, y: 0.4, z: 0.05 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1, scale: 1.8, models: ['plasma-ring'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.04, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.7, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply' },
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: -1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic'
                },
                rotate: [{ axis: 'z', rotations: 1.0, phase: 45 }],
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted lightning-rings at ±45°)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo'
            },
            count: 1, scale: 2.0, models: ['lightning-ring'],
            animation: {
                appearAt: 0.30,
                disappearAt: 0.70,
                enter: { type: 'fade', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.28, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                flicker: { intensity: 0.25, rate: 12, pattern: 'random' },
                emissive: { min: 1.0, max: 2.2, frequency: 6, pattern: 'sine' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 0.8, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply' },
                rotate: [{ axis: 'z', rotations: 0.001, phase: 45 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'lightning-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35,
                            arcSpeed: 1.5,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo'
            },
            count: 1, scale: 2.0, models: ['lightning-ring'],
            animation: {
                appearAt: 0.30,
                disappearAt: 0.70,
                enter: { type: 'fade', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.28, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                flicker: { intensity: 0.25, rate: 12, pattern: 'random' },
                emissive: { min: 1.0, max: 2.2, frequency: 6, pattern: 'sine' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 0.8, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply' },
                rotate: [{ axis: 'z', rotations: 0.001, phase: -45 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'lightning-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35,
                            arcSpeed: 1.5,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scalePulse: true
};

export default buildElectricEffectGesture(ELECTRICFLOURISH_CONFIG);
