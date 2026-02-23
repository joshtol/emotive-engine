/**
 * =========================================================================================
 *  +===-+  emotive
 *    **  ENGINE - Seedpod Gesture
 *  +-=-=+
 * =========================================================================================
 *
 * @fileoverview Seedpod gesture - closing organic enclosure around the mascot
 * @module gestures/destruction/elemental/seedpod
 *
 * CONCEPT: A venus flytrap closing. Vine rings descend from above and
 * rise from below simultaneously, meeting at the mascot's center to form
 * a sealed pod. The top rings shrink as they close in (tapering to a point),
 * while bottom rings hold wider (the pod's base). A central vine-cluster
 * appears at the seam where the halves meet.
 *
 * VISUAL DIAGRAM (side view, closing sequence):
 *     ═══          ← Top rings descend, narrowing
 *      ═════
 *       ═══════
 *         [★]        ← Mascot encased at center
 *       ═══════
 *      ═════
 *     ═══          ← Bottom rings rise, narrowing
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const SEEDPOD_CONFIG = {
    name: 'seedpod',
    emoji: '🫘',
    type: 'blending',
    description: 'Closing enclosure — vine rings converge from above and below to seal the mascot in a pod',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'transform',
    growth: 0.7,

    spawnMode: [
        // =================================================================
        // LAYER 1: 3 rings descending from above (top half of pod)
        // =================================================================
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'above',
                end: 'center',
                easing: 'easeInOutCubic',
                startScale: 0.6,
                endScale: 1.0,
                startDiameter: 0.8,
                endDiameter: 1.6,
                diameterUnit: 'mascot',
                holdAt: 0.65,
                orientation: 'flat'
            },
            formation: {
                type: 'stack',
                count: 3,
                spacing: 0.15
            },
            count: 3,
            scale: 2.0,
            models: ['u-vine'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                stagger: 0.06,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.15, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.03, frequency: 2, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.7, max: 1.4, frequency: 2, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 0.4, phase: 0 },
                    { axis: 'z', rotations: -0.3, phase: 60 },
                    { axis: 'z', rotations: 0.35, phase: 120 }
                ],
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 3, scale: 2.0, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'rampUp'
                },
                grain: { type: 3, strength: 0.05, scale: 0.3, speed: 0.4, blend: 'multiply' },
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.6, arcCount: 2 },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // =================================================================
        // LAYER 2: 3 rings rising from below (bottom half of pod)
        // =================================================================
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'center',
                easing: 'easeInOutCubic',
                startScale: 0.6,
                endScale: 1.0,
                startDiameter: 0.8,
                endDiameter: 1.6,
                diameterUnit: 'mascot',
                holdAt: 0.65,
                orientation: 'flat'
            },
            formation: {
                type: 'stack',
                count: 3,
                spacing: 0.15
            },
            count: 3,
            scale: 2.0,
            models: ['u-vine'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.85,
                stagger: 0.06,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
                exit: { type: 'scale', duration: 0.15, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.03, frequency: 2, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.7, max: 1.4, frequency: 2, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: -0.35, phase: 30 },
                    { axis: 'z', rotations: 0.4, phase: 90 },
                    { axis: 'z', rotations: -0.3, phase: 150 }
                ],
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 3, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 6, scale: 2.0, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.8,
                    strengthCurve: 'rampUp'
                },
                grain: { type: 3, strength: 0.05, scale: 0.3, speed: 0.4, blend: 'multiply' },
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'u-vine': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.6, arcCount: 2 },
                        orientationOverride: 'vertical'
                    }
                }
            }
        },

        // =================================================================
        // LAYER 3: Central vine-cluster at the seam where halves meet
        // =================================================================
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.0,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic',
                bob: { amplitude: 0.008, frequency: 0.4 }
            },
            count: 1,
            scale: 2.5,
            models: ['vine-cluster'],
            animation: {
                appearAt: 0.45,
                disappearAt: 0.88,
                enter: { type: 'scale', duration: 0.25, easing: 'easeOutCubic' },
                exit: { type: 'scale', duration: 0.1, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.05, frequency: 2, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.8, max: 1.6, frequency: 2, pattern: 'sine' },
                rotate: { axis: 'z', rotations: -0.3, phase: 45 },
                cutout: {
                    strength: 0.3,
                    primary: { pattern: 3, scale: 2.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.4,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.6
                },
                grain: { type: 3, strength: 0.05, scale: 0.3, speed: 0.3, blend: 'multiply' },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.7,
                    progressCurve: 'rampUp',
                }],
                blending: 'normal',
                renderOrder: 6,
                modelOverrides: {
                    'vine-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.3, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.35, 0.75, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    tremor: 0.003,
    tremorFrequency: 3,
    decayRate: 0.18
};

export default buildNatureEffectGesture(SEEDPOD_CONFIG);
