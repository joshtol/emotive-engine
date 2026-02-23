/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthflourish gesture - spinning stone flourish with crossing arcs
 * @module gestures/destruction/elemental/earthflourish
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic earth flourish
 * - Layer 1: 5 camera-facing spinning earth rings with VORONOI cutout
 * - Layer 2: 2 crossing earth-rings with CRACKS cutout (X sweep)
 * - Layer 3: 2 tilted earth-ring arcs at +/-45 angles
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHFLOURISH_CONFIG = {
    name: 'earthflourish',
    emoji: '🎭',
    type: 'blending',
    description: 'Spinning stone flourish with crossing arcs',
    duration: 1200,
    beats: 4,
    intensity: 1.3,
    category: 'manifestation',
    petrification: 0.6,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Spinning earth rings (camera-facing)
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
            scale: 1.5,
            models: ['earth-ring'],
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
                parameterAnimation: {
                    petrification: {
                        start: 0.35,
                        peak: 0.7,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 3, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.6, weight: 0.5 },
                    blend: 'multiply',
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6,
                        softness: 1.5
                    }
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply'
                },
                atmospherics: [{
                    preset: 'earth-dust',
                    targets: ['earth-ring'],
                    anchor: 'below',
                    intensity: 0.3,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.4,
                }],
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
                depthWrite: false,
                renderOrder: -8,
                modelOverrides: {
                    'earth-ring': {
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
            scale: 1.2,
            models: ['earth-ring'],
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
                parameterAnimation: {
                    petrification: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 3, scale: 0.7, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply'
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
                depthWrite: false,
                renderOrder: -6,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 2.0,
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
                offset: { x: 0.7, y: 0.4, z: 0 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 1.2,
            models: ['earth-ring'],
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
                parameterAnimation: {
                    petrification: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 3, scale: 0.7, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply'
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
                depthWrite: false,
                renderOrder: -6,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 2.0,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted earth-rings at +/-45 angles)
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
            scale: 1.5,
            models: ['earth-ring'],
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
                parameterAnimation: {
                    petrification: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.6, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply'
                },
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }
                ],
                blending: 'normal',
                depthWrite: false,
                renderOrder: -10,
                modelOverrides: {
                    'earth-ring': {
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
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 1.5,
            models: ['earth-ring'],
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
                parameterAnimation: {
                    petrification: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },
                    secondary: { pattern: 8, scale: 0.6, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply'
                },
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }
                ],
                blending: 'normal',
                depthWrite: false,
                renderOrder: -10,
                modelOverrides: {
                    'earth-ring': {
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

    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
    tremor: 0.003,
    tremorFrequency: 4
};

export default buildEarthEffectGesture(EARTHFLOURISH_CONFIG);
