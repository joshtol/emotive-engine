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
 *        ╲     ╱           ← Layer 2: Crossing accent rings (X sweep)
 *         ╲   ╱
 *      ────★────           ← Layer 1: Spinning splash rings (bigger)
 *         ╱   ╲
 *        ╱     ╲           ← Layer 3: Diagonal arc rings (tilted)
 *
 * FEATURES:
 * - THREE SPAWN LAYERS for dramatic water flourish
 * - Layer 1: 5 camera-facing spinning splash rings with CELLULAR cutout
 * - Layer 2: 2 crossing splash-rings with STREAKS cutout (X sweep)
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
    duration: 1200, // Fast triplet flourish
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.3,
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
                end: 'center', // Stay at center (no travel)
                easing: 'linear',
                startScale: 0.7,
                endScale: 1.2,
                startDiameter: 1.8,
                endDiameter: 2.8,
                orientation: 'camera', // Billboard: always face camera
            },
            formation: {
                type: 'spiral',
                count: 5,
                spacing: 0,
                arcOffset: 72,
                phaseOffset: 0.05,
                zOffset: 0, // No z offset - use renderOrder only
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
                    easing: 'easeOut',
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.85,
                    easing: 'easeIn',
                    burstScale: 1.15,
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true,
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.35,
                        peak: 0.7,
                        end: 0.2,
                        curve: 'bell',
                    },
                },
                // Cutout with trail dissolve - cellular holes fade at ring bottoms
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 0, scale: 1.0, weight: 1.0 }, // CELLULAR
                    secondary: { pattern: 3, scale: 0.6, weight: 0.5 }, // VORONOI - chunky edges
                    blend: 'multiply',
                    strengthCurve: 'constant',
                    // Trail dissolve: organic fade at bottom of camera-facing rings
                    trailDissolve: {
                        enabled: true,
                        offset: -0.6, // Floor 0.6 units below instance center
                        softness: 1.5, // Wide gradient for visible dissolve
                    },
                },
                // Grain: film grain for flourish spray texture
                grain: {
                    type: 3, // FILM
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply',
                },
                pulse: {
                    amplitude: 0.15,
                    frequency: 5,
                    easing: 'easeInOut',
                    perElement: true,
                },
                drift: {
                    speed: 0.3,
                    distance: 0.18,
                    pattern: 'radial',
                    accelerate: true,
                },
                opacityGradient: [1.0, 0.9, 0.8, 0.7, 0.6],
                rotate: [
                    { axis: 'z', rotations: 2.5, phase: 0 },
                    { axis: 'z', rotations: -2.0, phase: 72 },
                    { axis: 'z', rotations: 1.8, phase: 144 },
                    { axis: 'z', rotations: -2.3, phase: 216 },
                    { axis: 'z', rotations: 2.0, phase: 288 },
                ],
                tilt: {
                    axis: 'y',
                    oscillate: true,
                    range: 0.4,
                    speed: 3.5,
                },
                wobble: {
                    axis: 'x',
                    oscillate: true,
                    range: 0.15,
                    speed: 2.0,
                    phase: 90,
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: -8, // Behind mascot
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.5,
                            arcSpeed: 1.0,
                            arcCount: 2,
                        },
                        orientationOverride: 'camera',
                    },
                },
                // Sustained spray trailing from theatrical sweep
                atmospherics: [
                    {
                        preset: 'spray',
                        targets: ['splash-ring'],
                        anchor: 'above',
                        intensity: 0.25,
                        sizeScale: 1.0,
                        progressCurve: 'sustain',
                        velocityInheritance: 0.4,
                    },
                ],
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Crossing accent rings (diagonal X sweep)
        // Two splash-rings that sweep across in an X pattern with cutouts
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.7, y: 0.4, z: 0 }, // Start top-left
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic',
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
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'fade',
                    duration: 0.3,
                    easing: 'easeIn',
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true,
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell',
                    },
                },
                // STREAKS cutout for motion blur effect
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 }, // STREAKS - motion blur
                    secondary: { pattern: 0, scale: 0.7, weight: 0.4 }, // CELLULAR - organic breaks
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply',
                },
                // Diagonal sweep: top-left to bottom-right
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: 1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic',
                },
                rotate: [{ axis: 'z', rotations: 1.0, phase: -45 }],
                blending: 'additive',
                renderOrder: -6, // Behind mascot
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 2.0,
                            arcCount: 1,
                        },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.7, y: 0.4, z: 0 }, // Start top-right
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.2,
                scaleEasing: 'easeOutCubic',
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
                    easing: 'easeOutBack',
                },
                exit: {
                    type: 'fade',
                    duration: 0.3,
                    easing: 'easeIn',
                },
                procedural: {
                    scaleSmoothing: 0.04,
                    geometryStability: true,
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.6,
                        end: 0.2,
                        curve: 'bell',
                    },
                },
                // STREAKS cutout for motion blur effect
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 1.0 }, // STREAKS - motion blur
                    secondary: { pattern: 0, scale: 0.7, weight: 0.4 }, // CELLULAR - organic breaks
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.5,
                    blend: 'multiply',
                },
                // Diagonal sweep: top-right to bottom-left
                drift: {
                    speed: 0.9,
                    distance: 0.35,
                    direction: { x: -1.0, y: -0.7, z: -0.15 },
                    easing: 'easeInOutCubic',
                },
                rotate: [{ axis: 'z', rotations: 1.0, phase: 45 }],
                blending: 'additive',
                renderOrder: -6, // Behind mascot
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 2.0,
                            arcCount: 1,
                        },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Diagonal slash arcs (tilted splash-rings at ±45° angles)
        // Two splash-rings creating an X - camera-facing with fixed Z tilt
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 }, // No z offset - use renderOrder only
                orientation: 'camera', // Face camera (tidally locked)
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo',
            },
            count: 1,
            scale: 0.9,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.7,
                enter: {
                    type: 'fade',
                    duration: 0.06,
                    easing: 'easeOut',
                },
                exit: {
                    type: 'fade',
                    duration: 0.28,
                    easing: 'easeInCubic',
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true,
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell',
                    },
                },
                // Two-layer cutout for slash arc texture
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 }, // CELLULAR
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 }, // STREAKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant',
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.0,
                    blend: 'multiply',
                },
                // Tilted 45° clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: 45 }, // Near-static 45° tilt
                ],
                blending: 'normal',
                renderOrder: -10, // Behind mascot
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35, // Narrow slash arc
                            arcSpeed: 1.5, // Fast sweep
                            arcCount: 1, // Single blade
                        },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 }, // No z offset - use renderOrder only
                orientation: 'camera', // Face camera (tidally locked)
                startScale: 0.5,
                endScale: 1.8,
                scaleEasing: 'easeOutExpo',
            },
            count: 1,
            scale: 0.9,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.3,
                disappearAt: 0.7,
                enter: {
                    type: 'fade',
                    duration: 0.06,
                    easing: 'easeOut',
                },
                exit: {
                    type: 'fade',
                    duration: 0.28,
                    easing: 'easeInCubic',
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true,
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.4,
                        peak: 0.7,
                        end: 0.25,
                        curve: 'bell',
                    },
                },
                // Two-layer cutout for slash arc texture
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 0.8, weight: 1.0 }, // CELLULAR
                    secondary: { pattern: 1, scale: 0.6, weight: 0.4 }, // STREAKS
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'constant',
                },
                grain: {
                    type: 3,
                    strength: 0.2,
                    scale: 0.25,
                    speed: 2.0,
                    blend: 'multiply',
                },
                // Tilted 45° counter-clockwise (Z rotation on top of camera-facing)
                rotate: [
                    { axis: 'z', rotations: 0.001, phase: -45 }, // Near-static -45° tilt
                ],
                blending: 'normal',
                renderOrder: -10, // Behind mascot
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.35,
                            arcSpeed: 1.5,
                            arcCount: 1,
                        },
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    // Mesh effects - bright water display
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.15,
    glowColor: [0.3, 0.6, 1.0], // Cool blue
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 6,
    scaleWobble: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
};

/**
 * Waterflourish gesture - dramatic water flourish with X arch.
 *
 * Uses THREE SPAWN LAYERS:
 * - Layer 1: Spinning splash rings with CELLULAR cutout
 * - Layer 2: Crossing accent rings with STREAKS cutout (X sweep)
 * - Layer 3: Tilted splash-ring arcs at ±45° angles
 *
 * Creates theatrical trident-flourish water effect with crossing arcs.
 */
export default buildWaterEffectGesture(WATERFLOURISH_CONFIG);
