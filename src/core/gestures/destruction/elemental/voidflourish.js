/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidflourish gesture - spinning void flourish with crossing arcs
 * @module gestures/destruction/elemental/voidflourish
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing accent rings (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: Spinning splash rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal slash arcs (tilted)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS (identical structure to waterflourish)
 * - Layer 1: 5 camera-facing spinning splash rings with cutout
 * - Layer 2: 2 crossing splash-rings with STREAKS cutout (X sweep)
 * - Layer 3: 2 tilted splash-ring arcs at ±45° angles
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDFLOURISH_CONFIG = {
    name: 'voidflourish',
    emoji: '✨',
    type: 'blending',
    description: 'Spinning void flourish with crossing arcs',
    duration: 1200,
    beats: 4,
    intensity: 1.3,
    category: 'manifestation',
    depth: 0.55,
    distortionStrength: 0.008,

    // THREE LAYERS — mirrors waterflourish exactly
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Spinning splash rings (made bigger)
        // ═══════════════════════════════════════════════════════════════════════════════════
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
                count: 5,
                spacing: 0,
                arcOffset: 72,
                phaseOffset: 0.05,
                zOffset: 0
            },
            count: 5,
            scale: 0.9,
            models: ['splash-ring'],
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
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 0, scale: 1.0, weight: 1.0 },    // CELLULAR
                    secondary: { pattern: 3, scale: 0.6, weight: 0.5 },  // VORONOI
                    blend: 'multiply',
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6,
                        softness: 1.5
                    }
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 5,
                    easing: 'easeInOut',
                    perElement: true
                },
                drift: {
                    speed: 0.3,
                    distance: 0.18,
                    pattern: 'radial',
                    accelerate: true
                },
                opacityGradient: [1.0, 0.9, 0.8, 0.7, 0.6],
                rotate: [
                    { axis: 'z', rotations: 2.5, phase: 0 },
                    { axis: 'z', rotations: -2.0, phase: 72 },
                    { axis: 'z', rotations: 1.8, phase: 144 },
                    { axis: 'z', rotations: -2.3, phase: 216 },
                    { axis: 'z', rotations: 2.0, phase: 288 }
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
                blending: 'normal',
                renderOrder: 3,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,            // ROTATING_ARC
                            arcWidth: 0.5,
                            arcSpeed: 1.0,
                            arcCount: 2
                        },
                        orientationOverride: 'camera'
                    }
                },
                atmospherics: [{
                    preset: 'darkness',
                    targets: ['splash-ring'],
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 1.2,
                    progressCurve: 'sustain',
                }],
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Crossing accent rings (diagonal X sweep)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.7, y: 0.4, z: 0 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 0.7,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.5,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.3,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },    // STREAKS
                    secondary: { pattern: 0, scale: 0.7, weight: 0.4 },  // CELLULAR
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.5
                    }
                },
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: 1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic'
                },
                rotate: [
                    { axis: 'z', rotations: 1.0, phase: -45 }
                ],
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'splash-ring': {
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
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.7, y: 0.4, z: 0 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 0.7,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.5,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.3,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },    // STREAKS
                    secondary: { pattern: 0, scale: 0.7, weight: 0.4 },  // CELLULAR
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.5
                    }
                },
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: -1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic'
                },
                rotate: [
                    { axis: 'z', rotations: 1.0, phase: 45 }
                ],
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'splash-ring': {
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

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted splash-rings at ±45° angles)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 0.9,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.30,
                disappearAt: 0.70,
                enter: {
                    type: 'fade',
                    duration: 0.06,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.28,
                    easing: 'easeInCubic'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 },    // CELLULAR
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 },  // STREAKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6,
                        softness: 1.8
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }
                ],
                blending: 'normal',
                renderOrder: 2,
                modelOverrides: {
                    'splash-ring': {
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
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 0.9,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.30,
                disappearAt: 0.70,
                enter: {
                    type: 'fade',
                    duration: 0.06,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.28,
                    easing: 'easeInCubic'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 },    // CELLULAR
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 },  // STREAKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6,
                        softness: 1.8
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }
                ],
                blending: 'normal',
                renderOrder: 2,
                modelOverrides: {
                    'splash-ring': {
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
        }
    ],

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.3, 0.15, 0.4],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.75,
    glowFlickerRate: 2,
    dimStrength: 0.2,
    scaleVibration: 0.012,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.008
};

export default buildVoidEffectGesture(VOIDFLOURISH_CONFIG);
