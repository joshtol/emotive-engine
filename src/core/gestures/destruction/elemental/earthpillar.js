/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Pillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthpillar gesture - majestic rising pillar of stacked stone rings
 * @module gestures/destruction/elemental/earthpillar
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations
 * - Layer 1: 2 bottom rings with CELLULAR + angular travel
 * - Layer 2: 2 middle rings with CRACKS + radial travel
 * - Layer 3: 2 top rings with VORONOI + oscillate travel
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

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
        petrification: {
            start: 0.55,
            peak: 0.85,
            end: 0.65,
            curve: 'bell'
        }
    },
    pulse: {
        amplitude: 0.05,
        frequency: 3,
        easing: 'easeInOut'
    },
    emissive: {
        min: 0.9,
        max: 1.8,
        frequency: 4,
        pattern: 'sine'
    },
    grain: {
        type: 3,
        strength: 0.35,
        scale: 0.2,
        speed: 1.5,
        blend: 'multiply'
    },
    wetness: {
        wetness: 0.55,
        wetSpeed: 0.3
    },
    atmospherics: [{
        preset: 'earth-dust',
        targets: ['earth-ring'],
        anchor: 'below',
        anchorOffset: -0.1,
        intensity: 0.4,
        sizeScale: 1.5,
        progressCurve: 'sustain',
    }],
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 15,
    modelOverrides: {
        'earth-ring': {
            shaderAnimation: {
                type: 1,
                arcWidth: 0.95,
                arcSpeed: 0.8,
                arcCount: 2
            }
        }
    }
};

const EARTHPILLAR_CONFIG = {
    name: 'earthpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of stone',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    category: 'manifestation',
    petrification: 0.8,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Bottom 2 rings - CELLULAR pattern, angular travel
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
            scale: 1.6,
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 0, scale: 1.2, weight: 1.0 },
                    secondary: { pattern: 8, scale: 1.5, weight: 0.4 },
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
        // LAYER 2: Middle 2 rings - CRACKS pattern, radial travel
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
            scale: 1.6,
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 8, scale: 1.4, weight: 1.0 },
                    secondary: { pattern: 3, scale: 1.2, weight: 0.5 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
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
                    { axis: 'z', rotations: -0.5, phase: 60 },
                    { axis: 'z', rotations: -0.5, phase: 240 }
                ]
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings - VORONOI pattern, oscillate travel
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
            scale: 1.6,
            models: ['earth-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                cutout: {
                    strength: 0.65,
                    primary: { pattern: 3, scale: 1.3, weight: 1.0 },
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    geometricMask: {
                        type: 'distance',
                        core: 0.15,
                        tip: 0.3
                    }
                },
                rotate: [
                    { axis: 'z', rotations: 0.7, phase: 90 },
                    { axis: 'z', rotations: 0.7, phase: 270 }
                ]
            }
        }
    ],

    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 5,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.025,
    tremor: 0.002,
    tremorFrequency: 2
};

export default buildEarthEffectGesture(EARTHPILLAR_CONFIG);
