/**
 * =========================================================================================
 *  +===-+  emotive
 *    **  ENGINE - Seedburst Gesture
 *  +-=-=+
 * =========================================================================================
 *
 * @fileoverview Seedburst gesture - explosive seed/spore dispersal
 * @module gestures/destruction/elemental/seedburst
 *
 * CONCEPT: A seed pod detonates — organic fragments (thorns, leaves, vines)
 * blast outward in a radial burst from the mascot's center. A central
 * vine-ring expands rapidly as the shockwave, while 10 organic pieces
 * tumble outward in all directions like shrapnel from a bursting pod.
 * Fast, violent, organic.
 *
 * VISUAL DIAGRAM (top view):
 *       ~   ~   ~
 *     ~   \ | /   ~
 *    ~  ---[*]---  ~    <- Organic fragments radiating outward
 *     ~   / | \   ~
 *       ~   ~   ~
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const SEEDBURST_CONFIG = {
    name: 'seedburst',
    emoji: '💥',
    type: 'blending',
    description: 'Seed pod detonation — organic fragments blast outward in all directions',
    duration: 1200,
    beats: 2,
    intensity: 1.4,
    category: 'impact',
    growth: 0.9,

    spawnMode: [
        // =================================================================
        // LAYER 1: Central expanding vine-ring shockwave
        // =================================================================
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                orientation: 'camera',
                startScale: 0.2,
                endScale: 2.5,
                scaleEasing: 'easeOutQuad'
            },
            count: 1,
            scale: 2.0,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.4,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 2, scale: 1.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeOut',
                    trailDissolve: { enabled: true, offset: -0.25, softness: 1.2 }
                },
                grain: { type: 3, strength: 0.4, scale: 0.3, speed: 1.5, blend: 'multiply' },
                blending: 'normal',
                renderOrder: 8,
                rotate: { axis: 'z', rotations: 0.5, phase: 0 },
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // =================================================================
        // LAYER 2: 10 organic fragments exploding outward
        // =================================================================
        {
            type: 'radial-burst',
            radialBurst: {
                count: 10,
                radius: 0.05,
                endRadius: 2.0,
                angleSpread: 360,
                startAngle: 18,
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 10,
            scale: 0.8,
            models: ['thorn-curl', 'leaf-bunch', 's-vine', 'vine-twist', 'thorn-curl',
                'leaf-bunch', 's-vine', 'vine-twist', 'thorn-curl', 'leaf-bunch'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.5,
                stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                emissive: { min: 0.8, max: 1.5, frequency: 6, pattern: 'sine' },
                cutout: {
                    strength: 0.3,
                    primary: { pattern: 5, scale: 0.8, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeOut'
                },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 0.6,
                    progressCurve: 'burst',
                }],
                rotate: [
                    { axis: 'x', rotations: 3, phase: 0 },
                    { axis: 'z', rotations: -2.5, phase: 36 },
                    { axis: 'y', rotations: 4, phase: 72 },
                    { axis: 'x', rotations: -3, phase: 108 },
                    { axis: 'z', rotations: 2, phase: 144 },
                    { axis: 'y', rotations: -3.5, phase: 180 },
                    { axis: 'x', rotations: 2.5, phase: 216 },
                    { axis: 'z', rotations: -4, phase: 252 },
                    { axis: 'y', rotations: 3, phase: 288 },
                    { axis: 'x', rotations: -2, phase: 324 }
                ],
                scaleVariance: 0.35,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 14
            }
        }
    ],

    shakeAmount: 0.03,
    shakeFrequency: 15,
    decayRate: 0.12,
    glowColor: [0.5, 0.85, 0.3],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    scaleVibration: 0.025,
    scaleFrequency: 6,
    tremor: 0.015,
    tremorFrequency: 8
};

export default buildNatureEffectGesture(SEEDBURST_CONFIG);
