/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterflourish gesture - spinning water flourish with wave trails
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterflourish
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing wave curls (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: Spinning splash rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal arc rings (tilted)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic water flourish
 * - Layer 1: 5 camera-facing spinning splash rings (enlarged)
 * - Layer 2: 2 crossing wave-curls creating X sweep
 * - Layer 3: 2 tilted splash-ring arcs at ±45° angles
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical water displays
 * - Martial arts water effects
 * - Trident flourish trails
 * - Aquatic celebration
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterflourish gesture configuration
 * Spinning water flourish - arcs trace circular blade path
 */
const WATERFLOURISH_CONFIG = {
    name: 'waterflourish',
    emoji: '🔱',
    type: 'blending',
    description: 'Spinning water flourish with wave trails',
    duration: 1200,             // Fast triplet flourish
    beats: 4,
    intensity: 1.3,
    category: 'ambient',
    turbulence: 0.5,

    // 3D Element spawning - THREE LAYERS for dramatic water flourish
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Spinning splash rings (made bigger)
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
                zOffset: 0.02
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
                parameterAnimation: {
                    turbulence: {
                        start: 0.35,
                        peak: 0.7,
                        end: 0.2,
                        curve: 'bell'
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
                renderOrder: 12,
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
        // LAYER 2: Crossing wave curls (diagonal X sweep)
        // Two wave-curls that sweep across in an X pattern
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.8, y: 0.5, z: 0.3 },   // Start top-left
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.4,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 1.0,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.55,
                enter: {
                    type: 'fade',
                    duration: 0.08,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.35,
                    easing: 'easeOutQuad'
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.5,
                        peak: 0.8,
                        end: 0.3,
                        curve: 'bell'
                    }
                },
                // Diagonal sweep: top-left to bottom-right
                drift: {
                    speed: 0.8,
                    distance: 0.4,
                    direction: { x: 1.2, y: -0.8, z: -0.2 },  // Diagonal down-right
                    easing: 'easeInOutCubic'
                },
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: -45 }  // Tilt along slash direction
                ],
                blending: 'normal',
                renderOrder: 14
            }
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.8, y: 0.5, z: 0.3 },    // Start top-right
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.4,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 1.0,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.55,
                enter: {
                    type: 'fade',
                    duration: 0.08,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.35,
                    easing: 'easeOutQuad'
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.5,
                        peak: 0.8,
                        end: 0.3,
                        curve: 'bell'
                    }
                },
                // Diagonal sweep: top-right to bottom-left
                drift: {
                    speed: 0.8,
                    distance: 0.4,
                    direction: { x: -1.2, y: -0.8, z: -0.2 },  // Diagonal down-left
                    easing: 'easeInOutCubic'
                },
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: 45 }   // Tilt along slash direction
                ],
                blending: 'normal',
                renderOrder: 14
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted splash-rings at ±45° angles)
        // Two splash-rings creating an X - camera-facing with fixed Z tilt
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.2 },
                orientation: 'camera',                 // Face camera (tidally locked)
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
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                // Tilted 45° clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }   // Near-static 45° tilt
                ],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35,           // Narrow slash arc
                            arcSpeed: 1.5,            // Fast sweep
                            arcCount: 1               // Single blade
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
                offset: { x: 0, y: 0, z: 0.2 },
                orientation: 'camera',                 // Face camera (tidally locked)
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
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell'
                    }
                },
                // Tilted 45° counter-clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }  // Near-static -45° tilt
                ],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'splash-ring': {
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

    // Mesh effects - bright water display
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.15,
    glowColor: [0.3, 0.6, 1.0],     // Cool blue
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 6,
    scaleWobble: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015
};

/**
 * Waterflourish gesture - dramatic water flourish with X arch.
 *
 * Uses THREE SPAWN LAYERS:
 * - Layer 1: Spinning splash rings (enlarged) for central flourish
 * - Layer 2: Crossing wave curls sweeping in X pattern
 * - Layer 3: Tilted splash-ring arcs at ±45° for blade slashes
 *
 * Creates theatrical trident-flourish water effect with crossing arcs.
 */
export default buildWaterEffectGesture(WATERFLOURISH_CONFIG);
