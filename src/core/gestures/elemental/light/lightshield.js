/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lightshield Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightshield gesture - gyroscopic sun rings protecting mascot
 * @module gestures/destruction/elemental/lightshield
 *
 * CONCEPT: Six large sun-rings anchored at the mascot center on different axes,
 * each tumbling/flipping on an axis PERPENDICULAR to its plane — true gyroscopic
 * motion. Adjacent rings flip in opposite directions.
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

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
    grain: { type: 3, strength: 0.08, scale: 0.3, speed: 0.3, blend: 'multiply' },
    blending: 'additive',
};

const LIGHTSHIELD_CONFIG = {
    name: 'lightshield',
    emoji: '🛡️',
    type: 'blending',
    description: 'Gyroscopic light cage — six tumbling rings form a protective radiance',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.3,
    category: 'manifestation',
    radiance: 0.8,

    spawnMode: [
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'flat', bob: { amplitude: 0.008, frequency: 0.3 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.0,
                rotate: { axis: 'x', rotations: 0.75, phase: 0 }, renderOrder: 6,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 }, orientationOverride: 'flat' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'vertical', bob: { amplitude: 0.008, frequency: 0.35 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.03,
                rotate: { axis: 'y', rotations: -0.75, phase: 0 }, renderOrder: 8,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.45, arcCount: 2 }, orientationOverride: 'vertical' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'vertical', bob: { amplitude: 0.008, frequency: 0.4 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.06,
                rotate: { axis: 'x', rotations: 0.75, phase: 60 }, renderOrder: 10,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.5, arcCount: 2 }, orientationOverride: 'vertical' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'vertical', bob: { amplitude: 0.008, frequency: 0.45 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.09,
                rotate: { axis: 'y', rotations: -0.75, phase: 120 }, renderOrder: 12,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 0.45, arcCount: 2 }, orientationOverride: 'vertical' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'radial', bob: { amplitude: 0.008, frequency: 0.38 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.12,
                rotate: { axis: 'x', rotations: 0.75, phase: 45 }, renderOrder: 14,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.5, arcCount: 2 }, orientationOverride: 'radial' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0 }, orientation: 'radial', bob: { amplitude: 0.008, frequency: 0.42 } },
            count: 1, scale: 1.5, models: ['sun-ring'],
            animation: {
                ...SHARED_RING_ANIMATION, appearAt: 0.15,
                rotate: { axis: 'y', rotations: -0.75, phase: -45 },
                atmospherics: [{ preset: 'firefly', targets: ['sun-ring'], anchor: 'around', intensity: 0.2, sizeScale: 0.7, progressCurve: 'sustain' }],
                renderOrder: 16,
                modelOverrides: { 'sun-ring': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.55, arcCount: 2 }, orientationOverride: 'radial' } }
            }
        }
    ],

    glowColor: [1.0, 0.95, 0.75],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.85,
    glowFlickerRate: 2,
    scaleVibration: 0.005,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2,
    decayRate: 0.2
};

export default buildLightEffectGesture(LIGHTSHIELD_CONFIG);
