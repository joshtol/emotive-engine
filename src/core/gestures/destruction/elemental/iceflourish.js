/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Iceflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Iceflourish gesture - spinning ice flourish with crystal trails
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/iceflourish
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing accent rings (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: Spinning ice rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal arc rings (tilted)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic ice flourish
 * - Layer 1: 5 camera-facing spinning ice rings with VORONOI cutout
 * - Layer 2: 2 crossing ice-rings with CRACKS cutout (X sweep)
 * - Layer 3: 2 tilted ice-ring arcs at ±45° angles
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical ice displays
 * - Martial arts ice effects
 * - Crystal flourish trails
 * - Frozen celebration
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Iceflourish gesture configuration
 * Spinning ice flourish - arcs trace circular blade path
 */
const ICEFLOURISH_CONFIG = {
    name: 'iceflourish',
    emoji: '❄',
    type: 'blending',
    description: 'Spinning ice flourish with crystal trails',
    duration: 1200,             // Fast triplet flourish
    beats: 4,
    intensity: 1.3,
    category: 'ambient',
    frost: 0.6,

    // 3D Element spawning - THREE LAYERS for dramatic ice flourish
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Spinning ice rings (made bigger)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',              // Stay at center (no travel)
                easing: 'linear',
                startScale: 0.7,
                endScale: 1.2,
                startDiameter: 1.8,
                endDiameter: 2.8,
                orientation: 'camera'       // Billboard: always face camera
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
            models: ['ice-ring'],
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
                    frost: {
                        start: 0.35,
                        peak: 0.7,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                // VORONOI cutout for crystalline holes
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 3, scale: 1.0, weight: 1.0 },    // VORONOI - crystalline
                    secondary: { pattern: 8, scale: 0.6, weight: 0.5 },  // CRACKS - fracture edges
                    blend: 'multiply',
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6,
                        softness: 1.5
                    }
                },
                // Grain: film grain for icy spray texture
                grain: {
                    type: 3,              // FILM
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply'
                },
                // Per-gesture atmospheric particles: cold mist from flourish
                atmospherics: [{
                    preset: 'mist',
                    targets: ['ice-ring'],
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
                renderOrder: -8,    // Behind mascot
                modelOverrides: {
                    'ice-ring': {
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
        // Two ice-rings that sweep across in an X pattern
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.7, y: 0.4, z: 0 },     // Start top-left
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 1.2,
            models: ['ice-ring'],
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
                    frost: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                // CRACKS cutout for motion blur effect
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 1.0 },    // CRACKS - fracture motion
                    secondary: { pattern: 3, scale: 0.7, weight: 0.4 },  // VORONOI - crystalline breaks
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply'
                },
                // Diagonal sweep: top-left to bottom-right
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
                renderOrder: -6,    // Behind mascot
                modelOverrides: {
                    'ice-ring': {
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
                offset: { x: 0.7, y: 0.4, z: 0 },      // Start top-right
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 1.2,
            models: ['ice-ring'],
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
                    frost: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                // CRACKS cutout for motion blur effect
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 1.0 },    // CRACKS
                    secondary: { pattern: 3, scale: 0.7, weight: 0.4 },  // VORONOI
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.5, blend: 'multiply'
                },
                // Diagonal sweep: top-right to bottom-left
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
                renderOrder: -6,    // Behind mascot
                modelOverrides: {
                    'ice-ring': {
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
        // LAYER 3: Diagonal slash arcs (tilted ice-rings at ±45° angles)
        // Two ice-rings creating an X - camera-facing with fixed Z tilt
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
            models: ['ice-ring'],
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
                    frost: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                // VORONOI + CRACKS for slash arc texture
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },    // VORONOI
                    secondary: { pattern: 8, scale: 0.6, weight: 0.4 },  // CRACKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply'
                },
                // Tilted 45° clockwise
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }
                ],
                blending: 'normal',
                depthWrite: false,
                renderOrder: -10,   // Behind mascot
                modelOverrides: {
                    'ice-ring': {
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
            models: ['ice-ring'],
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
                    frost: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                // VORONOI + CRACKS for slash arc texture
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 0.8, weight: 1.0 },    // VORONOI
                    secondary: { pattern: 8, scale: 0.6, weight: 0.4 },  // CRACKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3, strength: 0.2, scale: 0.25, speed: 2.0, blend: 'multiply'
                },
                // Tilted 45° counter-clockwise
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }
                ],
                blending: 'normal',
                depthWrite: false,
                renderOrder: -10,   // Behind mascot
                modelOverrides: {
                    'ice-ring': {
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

    // Glow - bright ice display
    glowColor: [0.5, 0.8, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    // Scale
    scaleVibration: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
    // Tremor
    tremor: 0.003,
    tremorFrequency: 4
};

/**
 * Iceflourish gesture - dramatic ice flourish with X arch.
 *
 * Uses THREE SPAWN LAYERS:
 * - Layer 1: Spinning ice rings with VORONOI cutout
 * - Layer 2: Crossing accent rings with CRACKS cutout (X sweep)
 * - Layer 3: Tilted ice-ring arcs at ±45° angles
 *
 * Creates theatrical crystal-flourish ice effect with crossing arcs.
 */
export default buildIceEffectGesture(ICEFLOURISH_CONFIG);
