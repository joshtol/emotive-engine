/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Drill Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturedrill gesture - fast tight descending vine spiral
 * @module gestures/destruction/elemental/naturedrill
 *
 * FEATURES:
 * - 6 vine-ring elements in tight spiral formation
 * - Fast descending helix (like a vine drill bit)
 * - VORONOI + CRACKS cutout for drilling motion
 * - High rotation speed for drilling effect
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREDRILL_CONFIG = {
    name: 'naturedrill',
    emoji: '🔩',
    type: 'blending',
    description: 'Fast tight descending vine helix',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'manifestation',
    growth: 0.7,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'feet',
            end: 'below',
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.8,
            startDiameter: 1.8,
            endDiameter: 1.4,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,
            spacing: 0.1,
            arcOffset: 60,
            phaseOffset: 0
        },
        count: 6,
        scale: 1.4,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03,
            enter: {
                type: 'fade',
                duration: 0.05,
                easing: 'linear'
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.05,
                geometryStability: true
            },
            parameterAnimation: {
                growth: {
                    start: 0.4,
                    peak: 0.8,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 8, scale: 0.8, weight: 0.35 },
                blend: 'add',
                travel: 'vertical',
                travelSpeed: 3.0,
                strengthCurve: 'constant'
            },
            grain: {
                type: 3,
                strength: 0.3,
                scale: 0.2,
                speed: 4.0,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 1.0, tangentialBias: 0.3 },
            }],
            pulse: {
                amplitude: 0.08,
                frequency: 10,
                easing: 'linear'
            },
            rotate: { axis: 'y', rotations: 4, phase: 0 },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 3.0,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    glowColor: [0.2, 0.6, 0.15],
    glowIntensityMin: 1.3,
    glowIntensityMax: 2.8,
    glowFlickerRate: 10,
    scaleVibration: 0.02,
    scaleFrequency: 8,
    scaleGrowth: 0.03,
    tremor: 0.006,
    tremorFrequency: 8
};

export default buildNatureEffectGesture(NATUREDRILL_CONFIG);
