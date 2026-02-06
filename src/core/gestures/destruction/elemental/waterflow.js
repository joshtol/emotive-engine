/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterflow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterflow gesture - horizontal water current with multiple elements
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterflow
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *      • •                    ← Small droplets carried in flow
 *     〰️ →  〰️ →              ← Wave-curls flowing right
 *              ★
 *        ← 〰️  ← 〰️           ← Wave-curls flowing left
 *          ○○○  ○○○           ← Bubble clusters in undercurrent
 *
 * FEATURES:
 * - Wave-curls flowing horizontally in both directions
 * - Upper current: left to right
 * - Lower counter-current: right to left
 * - Small droplets carried in the upper flow
 * - Bubble clusters drifting in the undercurrent
 * - WAVES+STREAKS cutout for wave-curls (motion blur)
 * - CELLULAR cutout for droplets and bubbles
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water current effects
 * - Flowing stream visuals
 * - Dynamic water movements
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterflow gesture configuration
 * Horizontal current - wave-curls and droplets flowing through mascot
 */
const WATERFLOW_CONFIG = {
    name: 'flow',
    emoji: '〰️',
    type: 'blending',
    description: 'Horizontal water current with curling waves',
    duration: 2200,
    beats: 3,
    intensity: 0.9,
    category: 'ambient',
    turbulence: 0.35,

    // 3D Element spawning - horizontal flowing current with multiple model types
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Wave-curls flowing left to right (main current - upper)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -1.4, y: 0.25, z: 0 },
                orientation: 'camera',
                startScale: 0.6,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.9,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.55,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.07,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.3, weight: 1.0 },    // WAVES - flowing water
                    secondary: { pattern: 1, scale: 0.8, weight: 0.3 },  // STREAKS - motion blur
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.65,
                    distance: 1.2,
                    direction: { x: 2.8, y: 0, z: 0 },
                    easing: 'linear'
                },
                rotate: [{ axis: 'z', rotations: 0.6, phase: 15 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'wave-curl': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
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
                offset: { x: -0.7, y: 0.3, z: 0.15 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.85,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.65,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.07,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.3, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.65,
                    distance: 1.2,
                    direction: { x: 2.8, y: 0, z: 0 },
                    easing: 'linear'
                },
                rotate: [{ axis: 'z', rotations: -0.5, phase: -20 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'wave-curl': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
                            arcSpeed: 1.5,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Wave-curls flowing right to left (counter current - lower)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 1.4, y: -0.2, z: 0 },
                orientation: 'camera',
                startScale: 0.6,
                endScale: 1.1,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.9,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.7,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.07,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.3, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.65,
                    distance: 1.2,
                    direction: { x: -2.8, y: 0, z: 0 },
                    easing: 'linear'
                },
                rotate: [{ axis: 'z', rotations: -0.6, phase: 165 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'wave-curl': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
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
                offset: { x: 0.7, y: -0.25, z: 0.15 },
                orientation: 'camera',
                startScale: 0.5,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.85,
            models: ['wave-curl'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.8,
                enter: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.07,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.3, weight: 1.0 },
                    secondary: { pattern: 1, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.65,
                    distance: 1.2,
                    direction: { x: -2.8, y: 0, z: 0 },
                    easing: 'linear'
                },
                rotate: [{ axis: 'z', rotations: 0.5, phase: -165 }],
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'wave-curl': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
                            arcSpeed: 1.5,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Small droplets carried in the current (upper flow)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -1.0, y: 0.45, z: 0.08 },
                orientation: 'camera',
                startScale: 0.4,
                endScale: 0.8,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.5,
            models: ['droplet-small'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.5,
                enter: {
                    type: 'fade',
                    duration: 0.08,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 0, scale: 0.9, weight: 1.0 },    // CELLULAR - droplet texture
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.8,
                    distance: 1.0,
                    direction: { x: 2.5, y: 0.1, z: 0 },
                    easing: 'linear'
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-small': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.9,
                            arcSpeed: 1.0,
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
                offset: { x: -0.3, y: 0.5, z: -0.05 },
                orientation: 'camera',
                startScale: 0.35,
                endScale: 0.7,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.45,
            models: ['droplet-small'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.57,
                enter: {
                    type: 'fade',
                    duration: 0.08,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 0, scale: 0.9, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.8,
                    distance: 1.0,
                    direction: { x: 2.5, y: 0.05, z: 0 },
                    easing: 'linear'
                },
                blending: 'additive',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-small': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.9,
                            arcSpeed: 1.0,
                            arcCount: 1
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: Bubble clusters in the undercurrent
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.9, y: -0.4, z: 0.1 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 0.7,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.5,
            models: ['bubble-cluster'],
            animation: {
                appearAt: 0.2,
                disappearAt: 0.75,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 0, scale: 1.0, weight: 1.0 },    // CELLULAR - bubble texture
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 0.8,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.6,
                    distance: 0.9,
                    direction: { x: -2.2, y: 0.15, z: 0 },
                    easing: 'linear'
                },
                pulse: {
                    amplitude: 0.08,
                    frequency: 4,
                    easing: 'easeInOut'
                },
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'bubble-cluster': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.95,
                            arcSpeed: 0.6,
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
                offset: { x: 0.2, y: -0.35, z: -0.08 },
                orientation: 'camera',
                startScale: 0.25,
                endScale: 0.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 0.45,
            models: ['bubble-cluster'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.25,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 0, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 0.8,
                    strengthCurve: 'constant'
                },
                drift: {
                    speed: 0.6,
                    distance: 0.9,
                    direction: { x: -2.2, y: 0.1, z: 0 },
                    easing: 'linear'
                },
                pulse: {
                    amplitude: 0.08,
                    frequency: 4,
                    easing: 'easeInOut'
                },
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'bubble-cluster': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.95,
                            arcSpeed: 0.6,
                            arcCount: 2
                        },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    // Wobble - smooth flowing motion
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.25,
    // Scale - gentle breathing
    scaleWobble: 0.012,
    scaleFrequency: 2.5,
    scaleGrowth: 0.018,
    // Glow - cool water
    glowColor: [0.3, 0.58, 0.92],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.5,
    glowPulseRate: 2.5
};

/**
 * Waterflow gesture - horizontal water current.
 *
 * Uses 4 spawn layer types (8 total anchors):
 * - Layer 1: 2 wave-curls flowing left to right (upper current)
 * - Layer 2: 2 wave-curls flowing right to left (lower counter-current)
 * - Layer 3: 2 small droplets carried in upper flow
 * - Layer 4: 2 bubble clusters in the undercurrent
 * WAVES+STREAKS cutout for wave-curls, CELLULAR for droplets/bubbles.
 */
export default buildWaterEffectGesture(WATERFLOW_CONFIG);
