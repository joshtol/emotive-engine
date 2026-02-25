/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidflourish gesture - dark energy arcs sweeping around mascot
 * @module gestures/destruction/elemental/voidflourish
 *
 * VISUAL DIAGRAM (front view):
 *
 *        ╲     ╱           ← Layer 2: Crossing void-wrap sweeps (X slash)
 *         ╲   ╱
 *      ────★────           ← Layer 1: 3 thin dark arc slivers (fast spin)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Expanding void ring slashes (±45°)
 *
 * DESIGN NOTES:
 * - void-ring is `large` class + NormalBlending = 100% opaque everywhere
 *   → NARROW arcs (arcWidth 0.2–0.3) so only thin slivers show, not full circles
 *   → SMALLER scale (0.35–0.4) vs fire/water (0.9) which have transparent alpha areas
 * - Layer 2 uses void-wrap (medium class) for geometric variety
 * - Strong cutout dissolves away large portions for airy feel
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDFLOURISH_CONFIG = {
    name: 'voidflourish',
    emoji: '✨',
    type: 'blending',
    description: 'Dark void flourish — sweeping arcs of consumed light',
    duration: 1200,
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.2,
    category: 'manifestation',
    depth: 0.55,
    distortionStrength: 0.003,

    // THREE LAYERS — adapted for void's opaque nature
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Sweeping dark arc slivers (3 void-rings, camera-facing)
        // Thin narrow arcs that sweep around — NOT full opaque circles
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                easing: 'linear',
                startScale: 0.8,
                endScale: 1.3,
                startDiameter: 1.0,
                endDiameter: 2.0,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 3,               // 3 arcs (not 5) — less clutter, more ominous
                spacing: 0,
                arcOffset: 120,
                phaseOffset: 0.08,
                zOffset: 0
            },
            count: 3,
            scale: 0.4,                 // Small — void is fully opaque, needs less coverage
            models: ['void-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.50,
                stagger: 0.1,
                enter: {
                    type: 'fade',
                    duration: 0.04,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.7,
                    easing: 'easeIn',
                    burstScale: 1.1
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.7,
                    primary: { pattern: 6, scale: 1.5, weight: 0.8 },    // SPIRAL — swirling void
                    secondary: { pattern: 3, scale: 0.8, weight: 0.4 },  // VORONOI — organic breakup
                    blend: 'multiply',
                    travel: 'spiral',
                    travelSpeed: 2.0,
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.5
                    }
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 5,
                    easing: 'easeInOut',
                    perElement: true
                },
                emissive: {
                    min: 0.3,
                    max: 0.7,
                    frequency: 4,
                    pattern: 'sine'
                },
                drift: {
                    speed: 0.25,
                    distance: 0.15,
                    pattern: 'radial',
                    accelerate: true
                },
                opacityGradient: [1.0, 0.85, 0.7],
                rotate: [
                    { axis: 'z', rotations: 2.0, phase: 0 },
                    { axis: 'z', rotations: -1.5, phase: 120 },
                    { axis: 'z', rotations: 1.8, phase: 240 }
                ],
                tilt: {
                    axis: 'y',
                    oscillate: true,
                    range: 0.3,
                    speed: 3.0
                },
                wobble: {
                    axis: 'x',
                    oscillate: true,
                    range: 0.1,
                    speed: 2.0,
                    phase: 90
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 3,
                modelOverrides: {
                    'void-ring': {
                        shaderAnimation: {
                            type: 1,            // ROTATING_ARC
                            arcWidth: 0.25,     // NARROW slivers — not full circles
                            arcSpeed: 3.0,      // Fast sweep
                            arcCount: 1         // Single arc — clean dark slash
                        },
                        orientationOverride: 'camera'
                    }
                },
                atmospherics: [{
                    preset: 'darkness',
                    targets: ['void-ring'],
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                }],
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Crossing void-wrap sweeps (diagonal X slash)
        // Different model (void-wrap, medium class) for geometric variety
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.5, y: 0.3, z: 0 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 0.7,                 // void-wrap is 'medium' (0.180) — same as splash-ring
            models: ['void-wrap'],
            animation: {
                appearAt: 0.10,
                disappearAt: 0.50,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 },    // STREAKS — directional
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
                    { axis: 'z', rotations: 0.8, phase: -45 }
                ],
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.4,
                            arcSpeed: 1.5,
                            arcCount: 2
                        }
                    }
                }
            }
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.5, y: 0.3, z: 0 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 0.7,
            models: ['void-wrap'],
            animation: {
                appearAt: 0.10,
                disappearAt: 0.50,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
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
                    { axis: 'z', rotations: 0.8, phase: 45 }
                ],
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.4,
                            arcSpeed: 1.5,
                            arcCount: 2
                        }
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Expanding void ring slashes (2 thin arcs at ±45° angles)
        // Very narrow single arc — dramatic expanding dark slash
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 2.2,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 0.75,
            models: ['void-ring'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.65,
                enter: {
                    type: 'fade',
                    duration: 0.05,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
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
                    'void-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.2,      // Very narrow — thin dark slash
                            arcSpeed: 2.0,      // Fast sweep
                            arcCount: 1         // Single blade
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
                startScale: 0.3,
                endScale: 2.2,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 0.75,
            models: ['void-ring'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.65,
                enter: {
                    type: 'fade',
                    duration: 0.05,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
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
                    'void-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.2,
                            arcSpeed: 2.0,
                            arcCount: 1
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
