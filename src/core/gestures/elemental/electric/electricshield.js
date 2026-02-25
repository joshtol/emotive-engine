/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electricshield Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricshield gesture - gyroscopic lightning rings protecting mascot
 * @module gestures/destruction/elemental/electricshield
 *
 * CONCEPT: Four lightning-rings anchored at the mascot center on different axes,
 * each tumbling/flipping on an axis PERPENDICULAR to its plane — true gyroscopic
 * motion. Adjacent rings flip in opposite directions. Reduced from 6 for perf
 * (3D Voronoi per ring is expensive).
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const SHARED_RING_ANIMATION = {
    disappearAt: 0.9,
    enter: { type: 'scale', duration: 0.15, easing: 'easeOutBack' },
    exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
    procedural: { scaleSmoothing: 0.08, geometryStability: true },
    pulse: { amplitude: 0.03, frequency: 2, easing: 'easeInOut', sync: 'global' },
    emissive: { min: 0.5, max: 1.0, frequency: 2, pattern: 'sine' },
    cutout: {
        strength: 0.4,
        primary: { pattern: 0, scale: 3.0, weight: 1.0 },
        secondary: { pattern: 3, scale: 2.0, weight: 0.3 },
        blend: 'add',
        travel: 'angular',
        travelSpeed: 0.5,
        strengthCurve: 'constant'
    },
    grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.6, blend: 'multiply' },
    blending: 'additive',
};

const ELECTRICSHIELD_CONFIG = {
    name: 'electricshield',
    emoji: '🛡️',
    type: 'blending',
    description: 'Gyroscopic lightning cage — four tumbling rings form a protective storm',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.4,
    category: 'powered',

    spawnMode: [
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'flat', bob: { amplitude: 0.008, frequency: 0.3 } },
            count: 1, scale: 1.5, models: ['lightning-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.0,
                rotate: { axis: 'x', rotations: 0.75, phase: 0 }, renderOrder: 6,
                modelOverrides: { 'lightning-ring': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 }, orientationOverride: 'flat' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'vertical', bob: { amplitude: 0.008, frequency: 0.35 } },
            count: 1, scale: 1.5, models: ['lightning-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.04,
                rotate: { axis: 'y', rotations: -0.75, phase: 0 }, renderOrder: 8,
                modelOverrides: { 'lightning-ring': { shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.45, arcCount: 2 }, orientationOverride: 'vertical' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'vertical', bob: { amplitude: 0.008, frequency: 0.4 } },
            count: 1, scale: 1.5, models: ['lightning-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.08,
                rotate: { axis: 'x', rotations: 0.75, phase: 90 }, renderOrder: 10,
                modelOverrides: { 'lightning-ring': { shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.5, arcCount: 2 }, orientationOverride: 'vertical' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'radial', bob: { amplitude: 0.008, frequency: 0.42 } },
            count: 1, scale: 1.5, models: ['lightning-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.12,
                rotate: { axis: 'y', rotations: -0.75, phase: -45 },
                atmospherics: [{ preset: 'ozone', targets: ['lightning-ring'], anchor: 'around', intensity: 0.2, sizeScale: 0.7, progressCurve: 'sustain' }],
                renderOrder: 12,
                modelOverrides: { 'lightning-ring': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.55, arcCount: 2 }, orientationOverride: 'radial' } }
            }
        }
    ],

    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,
    scaleVibration: 0.005,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2,
    decayRate: 0.2
};

export default buildElectricEffectGesture(ELECTRICSHIELD_CONFIG);
