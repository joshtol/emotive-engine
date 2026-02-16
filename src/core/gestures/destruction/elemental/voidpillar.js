/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Pillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidpillar gesture - vertical column of stacked void rings
 * @module gestures/destruction/elemental/voidpillar
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Layer 3: Top rings (EMBERS, oscillate)
 *         ═══════════
 *          ═════════         ← Layer 2: Middle rings (DISSOLVE, radial)
 *           ═══════
 *            ═════           ← Layer 1: Bottom rings (WAVES, angular)
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations
 * - Layer 1: 2 bottom rings with WAVES + angular travel
 * - Layer 2: 2 middle rings with DISSOLVE + radial travel
 * - Layer 3: 2 top rings with SPIRAL + oscillate travel
 * - Each layer animates differently to break uniformity
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

// Shared animation base for all layers
const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.7,
    enter: {
        type: 'scale',
        duration: 0.2,
        easing: 'easeOut'
    },
    exit: {
        type: 'fade',
        duration: 0.3,
        easing: 'easeIn'
    },
    procedural: {
        scaleSmoothing: 0.1,
        geometryStability: true
    },
    pulse: {
        amplitude: 0.05,
        frequency: 3,
        easing: 'easeInOut'
    },
    emissive: {
        min: 0.3,
        max: 0.7,
        frequency: 4,
        pattern: 'sine'
    },
    atmospherics: [{
        preset: 'darkness',
        targets: ['void-wrap'],
        anchor: 'above',
        intensity: 0.6,
        sizeScale: 1.4,
        progressCurve: 'sustain',
        velocityInheritance: 0.5,
    }],
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 3,
    modelOverrides: {
        'void-wrap': {
            shaderAnimation: {
                type: 1,            // ROTATING_ARC
                arcWidth: 0.5,
                arcSpeed: 1.0,      // Stately column
                arcCount: 2
            },
            orientationOverride: 'flat'
        }
    }
};

const VOIDPILLAR_CONFIG = {
    name: 'voidpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic column of void rings',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    depth: 0.65,
    distortionStrength: 0.008,

    // THREE LAYERS - each with different cutout to break uniformity
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Bottom 2 rings - WAVES pattern, angular travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',    // void-wrap XY plane → 'flat' rotates to horizontal
                startOffset: 0
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 2.2,
            models: ['void-wrap'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 4, scale: 2.0, weight: 1.0 },    // WAVES
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },  // DISSOLVE
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                    geometricMask: {
                        type: 'distance',
                        core: 0.1,
                        tip: 0.25
                    },
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.2
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.3, phase: 0 },
                    { axis: 'z', rotations: 0.3, phase: 180 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Middle 2 rings - DISSOLVE pattern, radial travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',    // void-wrap XY plane → 'flat' rotates to horizontal
                startOffset: 0.5
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 2.2,
            models: ['void-wrap'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 7, scale: 1.8, weight: 1.0 },    // DISSOLVE
                    secondary: { pattern: 3, scale: 1.5, weight: 0.5 },  // VORONOI
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 0.5,
                    geometricMask: {
                        type: 'tip-boost',
                        core: 0.0,
                        tip: 0.2
                    },
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.5
                    }
                },
                rotate: [
                    { axis: 'z', rotations: -0.6, phase: 60 },
                    { axis: 'z', rotations: -0.6, phase: 240 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings - SPIRAL pattern, oscillate travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',    // void-wrap XY plane → 'flat' rotates to horizontal
                startOffset: 1.0
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 2.2,
            models: ['void-wrap'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },    // SPIRAL
                    secondary: { pattern: 3, scale: 2.0, weight: 0.4 },  // VORONOI
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.5,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    geometricMask: {
                        type: 'distance',
                        core: 0.15,
                        tip: 0.3
                    },
                    trailDissolve: {
                        enabled: true,
                        offset: -0.3,
                        softness: 1.8
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.9, phase: 90 },
                    { axis: 'z', rotations: 0.9, phase: 270 }
                ]
            }
        }
    ],

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.2, 0.08, 0.3],
    glowIntensityMin: 0.55,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2.5,
    dimStrength: 0.3,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.005
};

export default buildVoidEffectGesture(VOIDPILLAR_CONFIG);
