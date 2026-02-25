/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Bloom Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturebloom gesture - canopy growth (tree in fast-forward)
 * @module gestures/destruction/elemental/bloom
 *
 * CONCEPT: A tree growing in fast-forward. Layer 1 is the trunk — three
 * tight flat vine-rings ascending rapidly from feet to above head.
 * Layer 2 is the canopy — five vine-rings anchored above the mascot,
 * tilted outward at different angles like branches spreading into a crown.
 *
 * Trunk grows FIRST (fast upward rush), then canopy SPREADS (slower unfurl)
 * with falling-leaves cascading from the branches.
 * Together they create the unmistakable shape of a tree blossoming overhead.
 *
 * VISUAL DIAGRAM (side view):
 *          ╱═══╲
 *        ╱═══════╲       ← Canopy: 5 tilted rings spreading outward
 *       ╱═══════════╲
 *           ║║║
 *           ║║║          ← Trunk: 3 flat rings ascending
 *           ║║║
 *            ★           ← Mascot at base
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREBLOOM_CONFIG = {
    name: 'naturebloom',
    emoji: '🌸',
    type: 'blending',
    description: 'Canopy growth — trunk rises, then branches spread with falling leaves',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'emanating',
    growth: 0.8,
    mascotGlow: 0.8,

    spawnMode: [
        // ═════════════════════════════════════════════════════════════════════
        // LAYER 1: Trunk — 3 tight flat rings ascending rapidly
        // ═════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'center',
                easing: 'easeOutCubic',
                startScale: 1.0,
                endScale: 0.7,
                startDiameter: 0.5,
                endDiameter: 0.3,
                diameterUnit: 'mascot',
                holdAt: 0.4,
                orientation: 'flat'
            },
            formation: {
                type: 'stack',
                count: 3,
                spacing: 0.25
            },
            count: 3,
            scale: 2.0,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.80,
                stagger: 0.06,
                enter: {
                    type: 'scale',
                    duration: 0.1,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeInCubic'
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                pulse: {
                    amplitude: 0.03,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.6,
                    max: 1.2,
                    frequency: 2,
                    pattern: 'sine'
                },
                rotate: [
                    { axis: 'z', rotations: 0.2, phase: 0 },
                    { axis: 'z', rotations: -0.25, phase: 60 },
                    { axis: 'z', rotations: 0.15, phase: 120 }
                ],
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 3, scale: 3.0, weight: 1.0 },
                    secondary: { pattern: 0, scale: 5.0, weight: 0.3 },
                    blend: 'add',
                    travel: 'vertical',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant'
                },
                grain: {
                    type: 3,
                    strength: 0.05,
                    scale: 0.3,
                    speed: 0.4,
                    blend: 'multiply'
                },
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.85,
                            arcSpeed: 1.5,
                            arcCount: 1
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ═════════════════════════════════════════════════════════════════════
        // LAYER 2: Canopy — 5 tilted rings spreading outward above head
        // ═════════════════════════════════════════════════════════════════════

        // ── Branch 1: directly above center, slightly tilted ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.15, z: 0 },
                orientation: 'flat',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.01, frequency: 0.3 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeInCubic'
                },
                procedural: {
                    scaleSmoothing: 0.08,
                    geometryStability: true
                },
                pulse: {
                    amplitude: 0.04,
                    frequency: 1.5,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                rotate: { axis: 'x', rotations: 0.4, phase: 0 },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 0, scale: 2.5, weight: 0.3 },
                    blend: 'add',
                    travel: 'spiral',
                    travelSpeed: 0.5,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5
                },
                grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 0.9,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.3,
                }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 0.35, arcCount: 2 },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ── Branch 2: tilted at 0° (radial) ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.1, z: 0 },
                orientation: 'radial',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.008, frequency: 0.35 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.30,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.2, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 1.5, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                rotate: { axis: 'y', rotations: -0.35, phase: 0 },
                grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.25,
                }],
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        },

        // ── Branch 3: tilted at 90° ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.1, z: 0 },
                orientation: 'radial',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.008, frequency: 0.4 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.35,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.2, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 1.5, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                rotate: { axis: 'x', rotations: 0.35, phase: 90 },
                grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.25,
                }],
                blending: 'normal',
                renderOrder: 14,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        },

        // ── Branch 4: tilted at 180° ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.1, z: 0 },
                orientation: 'radial',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.008, frequency: 0.45 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.40,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.2, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 1.5, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                rotate: { axis: 'y', rotations: -0.4, phase: 180 },
                grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
                blending: 'normal',
                renderOrder: 16,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        },

        // ── Branch 5: tilted at 270° ──
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.1, z: 0 },
                orientation: 'radial',
                startScale: 0.2,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.008, frequency: 0.38 }
            },
            count: 1,
            scale: 4.5,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.45,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.2, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 1.5, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.5, max: 1.0, frequency: 1.5, pattern: 'sine' },
                rotate: { axis: 'x', rotations: 0.3, phase: 270 },
                grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
                blending: 'normal',
                renderOrder: 18,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'radial'
                    }
                }
            }
        }
    ],

    glowColor: [0.3, 0.8, 0.25],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    tremor: 0.003,
    tremorFrequency: 3,
    decayRate: 0.16,

    // Tree growth: trunk rush → canopy unfurl → full bloom → fade
    parameterAnimation: {
        growth: {
            keyframes: [
                { at: 0.0, value: 0.3 },
                { at: 0.15, value: 0.6 },
                { at: 0.35, value: 0.75 },
                { at: 0.6, value: 0.95 },
                { at: 0.8, value: 0.7 },
                { at: 1.0, value: 0.0 }
            ]
        },
        scaleVibration: {
            keyframes: [
                { at: 0.0, value: 0.01 },
                { at: 0.5, value: 0.01 },
                { at: 0.7, value: 0.02 },
                { at: 0.85, value: 0.03 },
                { at: 1.0, value: 0.0 }
            ]
        }
    }
};

export default buildNatureEffectGesture(NATUREBLOOM_CONFIG);
