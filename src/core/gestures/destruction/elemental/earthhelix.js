/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthhelix gesture - DNA-style double helix ascending stone
 * @module gestures/destruction/elemental/earthhelix
 *
 * FEATURES:
 * - 6 earth-ring elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - CRACKS + VORONOI cutout for fractured stone look
 * - Moderate rotation to show helix structure
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHHELIX_CONFIG = {
    name: 'earthhelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA-style double helix ascending stone',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    petrification: 0.75,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.8,
            endScale: 1.1,
            startDiameter: 1.6,
            endDiameter: 1.8,
            orientation: 'vertical'
        },
        formation: {
            type: 'spiral',
            count: 6,
            strands: 2,
            spacing: 0.2,
            arcOffset: 120,
            phaseOffset: 0.05
        },
        count: 6,
        scale: 1.2,
        models: ['earth-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.15,
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
            parameterAnimation: {
                petrification: {
                    start: 0.5,
                    peak: 0.85,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.9,
                max: 2.0,
                frequency: 6,
                pattern: 'smooth'
            },
            cutout: {
                strength: 0.7,
                primary: { pattern: 8, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 3, scale: 1.2, weight: 0.5 },
                blend: 'max',
                travel: 'angular',
                travelSpeed: 2.5,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.1,
                    tip: 0.25
                }
            },
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.2,
                speed: 1.0,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'below',
                intensity: 0.3,
                sizeScale: 1.0,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 0.8, tangentialBias: 0.4 },
            }],
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'earth-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.2,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    scaleVibration: 0.012,
    scaleFrequency: 5,
    scaleGrowth: 0.02,
    tremor: 0.003,
    tremorFrequency: 4
};

export default buildEarthEffectGesture(EARTHHELIX_CONFIG);
