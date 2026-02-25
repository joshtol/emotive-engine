/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterpillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterpillar gesture - majestic rising pillar of stacked water rings
 * @module gestures/destruction/elemental/waterpillar
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
 * - Layer 3: 2 top rings with EMBERS + oscillate travel
 * - Each layer animates differently to break uniformity
 * - GPU-instanced rendering via ElementInstancedSpawner
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

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
    parameterAnimation: {
        turbulence: {
            start: 0.15,
            peak: 0.3,
            end: 0.2,
            curve: 'bell'
        }
    },
    pulse: {
        amplitude: 0.05,
        frequency: 3,
        easing: 'easeInOut'
    },
    emissive: {
        min: 0.8,
        max: 1.6,
        frequency: 4,
        pattern: 'sine'
    },
    // No grain — multiply grain on transparent refraction = dark speckles
    atmospherics: [{
        preset: 'spray',
        targets: ['splash-ring'],
        anchor: 'above',
        intensity: 0.4,
        sizeScale: 1.0,
        progressCurve: 'sustain',
        velocityInheritance: 0.5,
    }],
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 15,
    modelOverrides: {
        'splash-ring': {
            shaderAnimation: {
                type: 1,
                arcWidth: 0.95,
                arcSpeed: 0.8,
                arcCount: 3
            }
        }
    }
};

/**
 * Waterpillar gesture configuration
 * Majestic rising pillar of stacked water rings - THREE LAYERS
 */
const WATERPILLAR_CONFIG = {
    name: 'waterpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of water',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.4,
    category: 'ambient',
    turbulence: 0.25,

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
                orientation: 'flat',
                startOffset: 0
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 4, scale: 2.0, weight: 1.0 },
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                    geometricMask: {
                        type: 'distance',
                        core: 0.1,
                        tip: 0.25
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
                orientation: 'flat',
                startOffset: 0.5
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                cutout: {
                    strength: 0.65,
                    primary: { pattern: 7, scale: 1.8, weight: 1.0 },
                    secondary: { pattern: 5, scale: 1.5, weight: 0.5 },
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
                    }
                },
                rotate: [
                    { axis: 'z', rotations: -0.6, phase: 60 },
                    { axis: 'z', rotations: -0.6, phase: 240 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings - EMBERS pattern, oscillate travel
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
                orientation: 'flat',
                startOffset: 1.0
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                cutout: {
                    strength: 0.7,
                    primary: { pattern: 5, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 6, scale: 2.0, weight: 0.4 },
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.5,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    geometricMask: {
                        type: 'distance',
                        core: 0.15,
                        tip: 0.3
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.9, phase: 90 },
                    { axis: 'z', rotations: 0.9, phase: 270 }
                ]
            }
        }
    ],

    // Glow - powerful water blue
    glowColor: [0.25, 0.55, 0.9],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 3,
    // Scale - stable with slight breathing
    scaleVibration: 0.008,
    scaleFrequency: 3,
};

export default buildWaterEffectGesture(WATERPILLAR_CONFIG);
