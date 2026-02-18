/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthvortex gesture - funnel of stone rings narrowing at top
 * @module gestures/destruction/elemental/earthvortex
 *
 * FEATURES:
 * - 4 earth-rings in spiral formation (90° apart)
 * - Funnel shape: narrow at bottom, wide at top — tornado
 * - Fast spinning rotation (2.5-3 full revolutions)
 * - No cutout — stone material surface unbroken
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHVORTEX_CONFIG = {
    name: 'earthvortex',
    emoji: '🌪️',
    type: 'blending',
    description: 'Funnel of stone rings narrowing at top, wide at base',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
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
            endScale: 1.2,
            startDiameter: 0.6,
            endDiameter: 2.0,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.5,
        models: ['earth-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.1 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.0, frequency: 5, pattern: 'sine' },
            atmospherics: [{
                preset: 'earth-dust',
                targets: ['earth-ring'],
                anchor: 'around',
                intensity: 0.4,
                sizeScale: 1.2,
                progressCurve: 'sustain',
            }, {
                preset: 'earth-gravel',
                targets: ['earth-ring'],
                anchor: 'around',
                intensity: 0.2,
                sizeScale: 0.6,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'earth-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 5.0,
                        arcCount: 1
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 2,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scalePulse: true,
    tremor: 0.006,
    tremorFrequency: 4
};

export default buildEarthEffectGesture(EARTHVORTEX_CONFIG);
