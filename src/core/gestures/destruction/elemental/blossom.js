/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Blossom Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureblossom gesture - flat vine rings expanding outward like petals
 * @module gestures/destruction/elemental/blossom
 *
 * CONCEPT: A flower opening its petals — flat vine-rings expand outward from
 * the mascot's center. Clean single-layer axis-travel with arc animation.
 *
 * FEATURES:
 * - 3 flat vine-rings expanding outward (petal unfurl)
 * - Diameter grows 1.0 → 3.0 as rings open
 * - Flat orientation — horizontal rings spreading like petals
 * - Arc animation creates sweeping petal reveals
 * - Gentle easeOut for organic bloom timing
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREBLOSSOM_CONFIG = {
    name: 'natureblossom',
    emoji: '🌺',
    type: 'blending',
    description: 'Flower opening — flat vine rings expand outward like petals unfurling',
    duration: 2000,
    beats: 4,
    intensity: 1.0,
    category: 'emanating',
    growth: 0.85,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'easeOut',
            startScale: 0.8,
            endScale: 1.6,
            startDiameter: 1.0,
            endDiameter: 3.0,
            orientation: 'flat'
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0.08,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.2,
        models: ['vine-ring'],
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
                duration: 0.4,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                growth: {
                    start: 0.5,
                    peak: 0.9,
                    end: 0.7,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.06,
                frequency: 2,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.7,
                max: 1.4,
                frequency: 2,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.5,
                primary: { pattern: 6, scale: 1.5, weight: 1.0 },
                secondary: { pattern: 0, scale: 2.0, weight: 0.3 },
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 1.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5
            },
            grain: {
                type: 3,
                strength: 0.15,
                scale: 0.3,
                speed: 0.8,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: null,
                anchor: 'around',
                intensity: 0.3,
                sizeScale: 0.8,
                progressCurve: 'sustain'
            }],
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },
                { axis: 'z', rotations: -0.3, phase: 120 },
                { axis: 'z', rotations: 0.35, phase: 240 }
            ],
            scaleVariance: 0.1,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 10,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 0.8,
                        arcCount: 2
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    glowColor: [0.4, 0.85, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scaleGrow: 0.02,
    tremor: 0.002,
    tremorFrequency: 2,
    decayRate: 0.18
};

export default buildNatureEffectGesture(NATUREBLOSSOM_CONFIG);
