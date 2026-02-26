/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturehelix gesture - DNA-style double helix ascending vine
 * @module gestures/destruction/elemental/naturehelix
 *
 * FEATURES:
 * - 6 vine-ring elements in double helix formation (strands: 2)
 * - DNA-style interleaved spiral ascending
 * - CRACKS + VORONOI cutout for fractured vine look
 * - Moderate rotation to show helix structure
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREHELIX_CONFIG = {
    name: 'naturehelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA-style double helix ascending vine',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    growth: 0.75,

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
            orientation: 'vertical',
        },
        formation: {
            type: 'spiral',
            count: 6,
            strands: 2,
            spacing: 0.2,
            arcOffset: 120,
            phaseOffset: 0.05,
        },
        count: 6,
        scale: 2.0,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.06,
            enter: {
                type: 'scale',
                duration: 0.15,
                easing: 'easeOut',
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            parameterAnimation: {
                growth: {
                    start: 0.5,
                    peak: 0.85,
                    end: 0.6,
                    curve: 'bell',
                },
            },
            pulse: {
                amplitude: 0.06,
                frequency: 4,
                easing: 'easeInOut',
            },
            emissive: {
                min: 0.9,
                max: 2.0,
                frequency: 6,
                pattern: 'smooth',
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
                    tip: 0.25,
                },
            },
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.2,
                speed: 1.0,
                blend: 'multiply',
            },
            atmospherics: [
                {
                    preset: 'falling-leaves',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.4,
                    sizeScale: 0.9,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                    centrifugal: { speed: 0.8, tangentialBias: 0.4 },
                },
            ],
            rotate: { axis: 'y', rotations: 2, phase: 0 },
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 16,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.2,
                        arcCount: 1,
                    },
                    orientationOverride: 'vertical',
                },
            },
        },
    },

    glowColor: [0.25, 0.7, 0.2],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    scaleVibration: 0.012,
    scaleFrequency: 5,
    scaleGrowth: 0.02,
    tremor: 0.003,
    tremorFrequency: 4,
};

export default buildNatureEffectGesture(NATUREHELIX_CONFIG);
