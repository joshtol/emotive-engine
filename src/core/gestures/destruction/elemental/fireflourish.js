/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireflourish gesture - spinning sword flourish with fire trail
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireflourish
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing flame tongues (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: Spinning flame rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal slash arcs (tilted rings)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic sword flourish
 * - Layer 1: 5 camera-facing spinning flame rings (enlarged)
 * - Layer 2: 2 crossing flame tongues creating X sweep
 * - Layer 3: 2 tilted flame-ring arcs at ±45° angles
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical fire displays
 * - Martial arts flame effects
 * - Sword flourish trails
 * - Combat celebration
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireflourish gesture configuration
 * Spinning sword flourish - arcs trace circular blade path
 */
const FIREFLOURISH_CONFIG = {
    name: 'fireflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Spinning sword flourish with fire trail',
    duration: 1200,             // Fast triplet flourish
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.65,          // Hot orange-white

    // 3D Element spawning - THREE LAYERS for dramatic sword flourish
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Spinning flame rings (made bigger)
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
                startDiameter: 1.4,
                endDiameter: 2.2,
                orientation: 'camera'       // Face camera
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
            models: ['flame-ring'],
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
                    temperature: {
                        start: 0.65,
                        peak: 0.95,
                        end: 0.3,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 10,
                    pattern: 'sine'
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 5,
                    easing: 'easeInOut',
                    perElement: true
                },
                emissive: {
                    min: 2.0,
                    max: 5.0,
                    frequency: 6,
                    pattern: 'sine',
                    decayOnExit: true,
                    perElementScale: [1.0, 0.95, 0.88, 0.8, 0.72]
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
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'flame-ring': {
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
        // LAYER 2: Crossing flame tongues (diagonal X sweep)
        // Two flame-tongues that sweep across in an X pattern
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
            models: ['flame-tongue'],
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
                    temperature: {
                        start: 0.8,
                        peak: 0.95,
                        end: 0.4,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.3,
                    rate: 15,
                    pattern: 'random'
                },
                emissive: {
                    min: 2.5,
                    max: 4.5,
                    frequency: 8,
                    pattern: 'sine'
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
                blending: 'additive',
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
            models: ['flame-tongue'],
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
                    temperature: {
                        start: 0.8,
                        peak: 0.95,
                        end: 0.4,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.3,
                    rate: 15,
                    pattern: 'random'
                },
                emissive: {
                    min: 2.5,
                    max: 4.5,
                    frequency: 8,
                    pattern: 'sine'
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
                blending: 'additive',
                renderOrder: 14
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted flame-rings at ±45° angles)
        // Two flame-rings creating an X - camera-facing with fixed Z tilt
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
            models: ['flame-ring'],
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
                    temperature: {
                        start: 0.7,
                        peak: 0.9,
                        end: 0.35,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.25,
                    rate: 12,
                    pattern: 'smooth'
                },
                emissive: {
                    min: 2.0,
                    max: 4.0,
                    frequency: 6,
                    pattern: 'sine'
                },
                // Tilted 45° clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }   // Near-static 45° tilt
                ],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'flame-ring': {
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
            models: ['flame-ring'],
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
                    temperature: {
                        start: 0.7,
                        peak: 0.9,
                        end: 0.35,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.25,
                    rate: 12,
                    pattern: 'smooth'
                },
                emissive: {
                    min: 2.0,
                    max: 4.0,
                    frequency: 6,
                    pattern: 'sine'
                },
                // Tilted 45° counter-clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }  // Near-static -45° tilt
                ],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'flame-ring': {
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

    // Mesh effects - bright intense fire
    flickerFrequency: 15,
    flickerAmplitude: 0.01,
    flickerDecay: 0.15,
    glowColor: [1.0, 0.55, 0.15],   // Hot orange
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 12,
    scaleVibration: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
    rotationEffect: false
};

/**
 * Fireflourish gesture - dramatic sword flourish with X arch.
 *
 * Uses THREE SPAWN LAYERS:
 * - Layer 1: Spinning flame rings (enlarged) for central flourish
 * - Layer 2: Crossing flame tongues sweeping in X pattern
 * - Layer 3: Tilted flame-ring arcs at ±45° for blade slashes
 *
 * Creates theatrical sword-flourish fire effect with crossing arcs.
 */
export default buildFireEffectGesture(FIREFLOURISH_CONFIG);
