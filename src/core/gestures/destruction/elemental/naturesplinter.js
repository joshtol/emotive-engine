/**
 * =========================================================================================
 *  +===-+  emotive
 *    **  ENGINE - Naturesplinter Gesture
 *  +-=-=+
 * =========================================================================================
 *
 * @fileoverview Naturesplinter gesture - wood/vine fragments shattering outward
 * @module gestures/destruction/elemental/naturesplinter
 *
 * CONCEPT: Organic matter shatters violently. Vine pieces, thorns, and wood
 * fragments explode outward from the mascot in a radial burst — like a tree
 * struck by lightning splintering into a thousand pieces. Fast tumbling
 * rotations on mixed axes for chaotic shrapnel. Shorter duration for
 * sudden impact feel.
 *
 * VISUAL DIAGRAM (front view):
 *      ╲  ╱  |  ╲  ╱
 *       ╲╱   |   ╲╱
 *    ----[  💥  ]----    <- Fragments exploding outward
 *       ╱╲   |   ╱╲
 *      ╱  ╲  |  ╱  ╲
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATURESPLINTER_CONFIG = {
    name: 'naturesplinter',
    emoji: '🪵',
    type: 'blending',
    description: 'Violent splintering — wood and vine fragments shatter outward',
    duration: 1000,
    beats: 2,
    intensity: 1.5,
    category: 'transform',
    growth: 0.8,

    spawnMode: {
        type: 'radial-burst',
        radialBurst: {
            count: 12,
            radius: 0.05,
            endRadius: 2.5,
            angleSpread: 360,
            startAngle: 15,
            orientation: 'camera',
            startScale: 0.3,
            endScale: 1.0,
            scaleEasing: 'easeOutQuad'
        },
        count: 12,
        scale: 0.7,
        models: ['s-vine', 'thorn-curl', 'vine-twist', 'leaf-bunch',
            's-vine', 'thorn-curl', 'vine-twist', 'leaf-bunch',
            's-vine', 'thorn-curl', 'vine-twist', 'leaf-bunch'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.5,
            stagger: 0.006,
            enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.04, geometryStability: true },
            emissive: { min: 0.7, max: 1.3, frequency: 6, pattern: 'sine' },
            cutout: {
                strength: 0.3,
                primary: { pattern: 5, scale: 0.8, weight: 1.0 },
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.2,
                strengthCurve: 'fadeOut'
            },
            grain: { type: 3, strength: 0.15, scale: 0.3, speed: 1.0, blend: 'multiply' },
            atmospherics: [{
                preset: 'falling-leaves',
                targets: null,
                anchor: 'around',
                intensity: 0.6,
                sizeScale: 0.5,
                progressCurve: 'burst',
            }],
            rotate: [
                { axis: 'x', rotations: 4, phase: 0 },
                { axis: 'z', rotations: -3, phase: 30 },
                { axis: 'y', rotations: 5, phase: 60 },
                { axis: 'x', rotations: -4, phase: 90 },
                { axis: 'z', rotations: 3.5, phase: 120 },
                { axis: 'y', rotations: -4.5, phase: 150 },
                { axis: 'x', rotations: 3, phase: 180 },
                { axis: 'z', rotations: -5, phase: 210 },
                { axis: 'y', rotations: 4, phase: 240 },
                { axis: 'x', rotations: -3.5, phase: 270 },
                { axis: 'z', rotations: 4.5, phase: 300 },
                { axis: 'y', rotations: -3, phase: 330 }
            ],
            scaleVariance: 0.4,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 14
        }
    },

    shakeAmount: 0.04,
    shakeFrequency: 18,
    decayRate: 0.1,
    glowColor: [0.45, 0.75, 0.2],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 10,
    scaleVibration: 0.03,
    scaleFrequency: 8,
    tremor: 0.02,
    tremorFrequency: 10
};

export default buildNatureEffectGesture(NATURESPLINTER_CONFIG);
