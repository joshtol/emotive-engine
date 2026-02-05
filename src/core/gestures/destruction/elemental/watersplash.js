/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Watersplash Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Watersplash gesture - scorch-style 4-layer water geyser
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/watersplash
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM (SCORCH-STYLE 4-LAYER):
 *
 *         💧💧💧💧         ← Layer 4: Radial droplet burst at peak
 *        ╭───────────╮
 *       (  ═══════  )      ← Layer 3: Horizontal expanding ring
 *        ╰───────────╯
 *           │ │ │          ← Layer 2: Rising vertical columns
 *           │ ★ │
 *        ═══════════       ← Layer 1: Ground splash rings
 *
 * FEATURES:
 * - FOUR SPAWN LAYERS for intense water geyser
 * - Layer 1: Ground splash rings expanding outward
 * - Layer 2: Rising vertical splash columns
 * - Layer 3: Horizontal ring at peak height
 * - Layer 4: Radial droplet burst spray
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Powerful water impact effects
 * - Geyser eruption visuals
 * - Water explosion reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Watersplash gesture configuration
 * Scorch-style 4-layer water geyser
 */
const WATERSPLASH_CONFIG = {
    name: 'splash',
    emoji: '💦',
    type: 'blending',
    description: 'Scorch-style 4-layer water geyser',
    duration: 1200,
    beats: 2,
    intensity: 1.3,
    category: 'impact',
    turbulence: 0.9,

    // 3D Element spawning - SCORCH-STYLE: 4 layers for intense geyser
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Ground splash rings expanding outward
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'bottom',              // Stay at ground level
                startDiameter: 0.4,
                endDiameter: 2.5,           // Expand outward
                orientation: 'flat'
            },
            formation: {
                type: 'ring',
                count: 2,
                phaseOffset: 0.1
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.6,
                stagger: 0.08,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                // Gesture glow: wet sheen intensifies during splash impact
                // Base values reduced in shader, so we can use wider range here
                gestureGlow: {
                    baseGlow: 0.6,      // Start subtle
                    peakGlow: 2.2,      // Ramp up dramatically for impact
                    curve: 'easeOut'    // Quick intensity burst then settle
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.7,
                        peak: 0.9,
                        end: 0.4,
                        curve: 'bell'
                    }
                },
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'splash-ring': {
                        opacityLink: 'inverse-scale',
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.8,
                            arcSpeed: 1.0,
                            arcCount: 2
                        }
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Rising vertical splash columns
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'above',
                easing: 'easeOutQuad',
                startDiameter: 0.6,
                endDiameter: 1.2,
                startScale: 0.7,
                endScale: 1.3,
                orientation: 'vertical'     // Standing rings for column effect
            },
            formation: {
                type: 'spiral',
                count: 3,
                arcOffset: 120,
                phaseOffset: 0.04
            },
            count: 3,
            scale: 0.8,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.75,
                stagger: 0.05,
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutBack'
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
                parameterAnimation: {
                    turbulence: {
                        start: 0.8,
                        peak: 1.0,
                        end: 0.4,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.1,
                    frequency: 5,
                    easing: 'easeInOut'
                },
                rotate: [
                    { axis: 'y', rotations: 1.5, phase: 0 },
                    { axis: 'y', rotations: -1.5, phase: 120 },
                    { axis: 'y', rotations: 1.5, phase: 240 }
                ],
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.5,
                            arcSpeed: 2.0,
                            arcCount: 2
                        },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Horizontal ring at peak height
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.2, z: 0 },
                orientation: 'flat',
                startScale: 0.4,
                endScale: 1.6,
                scaleEasing: 'easeOutExpo'
            },
            count: 1,
            scale: 1.2,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.8,
                enter: {
                    type: 'scale',
                    duration: 0.1,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.6,
                        peak: 0.9,
                        end: 0.3,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.12,
                    frequency: 4,
                    easing: 'easeInOut'
                },
                rotate: { axis: 'z', rotations: 0.8, phase: 0 },
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
                            arcSpeed: 1.2,
                            arcCount: 3
                        }
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: Radial droplet burst spray at peak
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                startRadius: 0.2,
                endRadius: 1.8,
                height: 0.5,                // Above mascot
                easing: 'easeOutExpo'
            },
            formation: {
                type: 'ring',
                count: 8
            },
            count: 8,
            scale: 0.9,
            models: ['droplet-small', 'droplet-large', 'droplet-small', 'droplet-large', 'droplet-small', 'droplet-large', 'droplet-small', 'droplet-large'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.9,
                stagger: 0.02,
                enter: {
                    type: 'scale',
                    duration: 0.06,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.18,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.9,
                        peak: 0.7,
                        end: 0.2,
                        curve: 'bell'
                    }
                },
                // Arc trajectory - droplets fly up then down
                arcTrajectory: {
                    peakHeight: 0.4,
                    easing: 'parabolic'
                },
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'droplet-large': {
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.5,
                            maxStretch: 2.0
                        }
                    },
                    'droplet-small': {
                        scaling: {
                            mode: 'velocity-stretch',
                            stretchFactor: 1.2
                        }
                    }
                }
            }
        }
    ],

    // Wobble parameters - energetic
    wobbleFrequency: 4,
    wobbleAmplitude: 0.02,
    wobbleDecay: 0.5,
    // Scale - expansion burst
    scaleWobble: 0.08,
    scaleFrequency: 6,
    scaleGrowth: 0.02,
    // Glow - bright wet sheen
    glowColor: [0.3, 0.6, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowPulseRate: 5,
    // Splash-specific
    impactBurst: true,
    burstDuration: 0.15
};

/**
 * Watersplash gesture - scorch-style 4-layer water geyser.
 *
 * Uses multi-layer spawn mode:
 * - Layer 1: Ground splash rings expanding outward
 * - Layer 2: Rising vertical splash columns
 * - Layer 3: Horizontal ring at peak height
 * - Layer 4: Radial droplet burst spray
 */
export default buildWaterEffectGesture(WATERSPLASH_CONFIG);
