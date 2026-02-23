/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Dance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthdance gesture - vertical stone rings dancing upward
 * @module gestures/destruction/elemental/earthdance
 *
 * FEATURES:
 * - 3 earth-ring elements with vertical orientation
 * - Rings travel from bottom to top
 * - DANCING rotation: all spin on Y axis, 120° phase offset
 * - Two-layer cutout: VORONOI + CRACKS with angular travel
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHDANCE_CONFIG = {
    name: 'earthdance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical stone rings dancing and rising',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'manifestation',
    petrification: 0.7,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.2,
            endScale: 1.6,
            startDiameter: 1.3,
            endDiameter: 2.0,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['earth-ring'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.5,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            cutout: {
                strength: 0.65,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 8, scale: 1.2, weight: 0.5 },
                blend: 'add',
                travel: 'angular',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.12,
                    tip: 0.28
                }
            },
            grain: {
                type: 3,
                strength: 0.2,
                scale: 0.25,
                speed: 2.0,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 1.0,
                progressCurve: 'sustain',
                velocityInheritance: 0.4,
                centrifugal: { speed: 0.5, tangentialBias: 0.5 },
            }],
            parameterAnimation: {
                petrification: {
                    start: 0.5,
                    peak: 0.75,
                    end: 0.55,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 1.6,
                frequency: 6,
                pattern: 'sine'
            },
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -2, phase: 60 },
                { axis: 'y', rotations: 3, phase: 120 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 11,
            modelOverrides: {
                'earth-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.018,
    scaleFrequency: 4,
    scaleGrowth: 0.025,
    tremor: 0.005,
    tremorFrequency: 3
};

export default buildEarthEffectGesture(EARTHDANCE_CONFIG);
