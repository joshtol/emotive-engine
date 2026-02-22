/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Bloom Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturebloom gesture - vertical vine rings erupting upward
 * @module gestures/destruction/elemental/bloom
 *
 * CONCEPT: Life force shooting upward — vertical vine-rings ascending from
 * the mascot's base. Like firedance but with explosive upward energy.
 *
 * FEATURES:
 * - 4 vertical vine-rings ascending bottom → above
 * - Arc animation creates animated growth appearance
 * - easeOut — explosive start, settling as energy dissipates
 * - Spiral formation with 90° offsets
 * - Scale shrinks as rings rise (energy spreading)
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREBLOOM_CONFIG = {
    name: 'naturebloom',
    emoji: '🌸',
    type: 'blending',
    description: 'Life force erupting — vertical vine rings shoot upward',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'emanating',
    growth: 0.8,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeOut',
            startScale: 1.2,
            endScale: 0.9,
            startDiameter: 1.4,
            endDiameter: 2.2,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 4,
            spacing: 0.1,
            arcOffset: 90,
            phaseOffset: 0
        },
        count: 4,
        scale: 1.0,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.04,
            enter: {
                type: 'scale',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.45,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.06,
                geometryStability: true
            },
            parameterAnimation: {
                growth: {
                    start: 0.5,
                    peak: 0.85,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.08,
                frequency: 5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.9,
                max: 1.8,
                frequency: 5,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.6,
                primary: { pattern: 4, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 3, scale: 1.2, weight: 0.4 },
                blend: 'add',
                travel: 'radial',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5
            },
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.2,
                speed: 1.5,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'above',
                intensity: 0.35,
                sizeScale: 0.8,
                progressCurve: 'sustain',
                velocityInheritance: 0.4
            }],
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -1.5, phase: 90 },
                { axis: 'y', rotations: 2.5, phase: 180 },
                { axis: 'y', rotations: -2, phase: 270 }
            ],
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.6,
                        arcSpeed: 2.0,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    glowColor: [0.3, 0.8, 0.25],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 5,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrow: 0.02,
    tremor: 0.004,
    tremorFrequency: 4,
    decayRate: 0.15
};

export default buildNatureEffectGesture(NATUREBLOOM_CONFIG);
