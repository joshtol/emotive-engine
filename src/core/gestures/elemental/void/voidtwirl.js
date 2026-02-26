/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Twirl Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidtwirl gesture - 3-ring relay illusion
 * @module gestures/destruction/elemental/voidtwirl
 *
 * CONCEPT: Three interlocked camera-billboarded void-rings arranged in an equilateral
 * triangle. Only one ring's arc segment is visible at a time, cycling between
 * rings so the void appears to weave through a trinity of rings.
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDTWIRL_CONFIG = {
    name: 'voidtwirl',
    emoji: '🕳️',
    type: 'blending',
    description: 'Relay void illusion — arc weaves through three interlocked rings',
    duration: 1500,
    beats: 2,
    intensity: 1.5,
    category: 'afflicted',
    growth: 0.9,
    distortionStrength: 0,

    spawnMode: [
        // Ring A — lower-left — relay 2, CW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.45, y: -0.26, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0,
            },
            count: 1,
            scale: 1.15,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                atmospherics: [
                    { preset: 'shadow', intensity: 0.2, sizeScale: 0.6, progressCurve: 'sustain' },
                ],
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 0.0,
                        relayIndex: 2,
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // Ring B — lower-right — relay 1, CCW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.45, y: -0.26, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0,
            },
            count: 1,
            scale: 1.15,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: 5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 3.14,
                        relayIndex: 1,
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // Ring C — upper-center — relay 0, CW
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: 0.52, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0,
            },
            count: 1,
            scale: 1.15,
            sizeVariance: 0,
            models: ['void-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
                rotate: [{ axis: 'z', rotations: -5, phase: 0 }],
                blending: 'normal',
                renderOrder: 10,
                modelOverrides: {
                    'void-ring': {
                        arcPhase: 4.71,
                        relayIndex: 0,
                        orientationOverride: 'camera',
                    },
                },
            },
        },
    ],

    glowColor: [0.25, 0.1, 0.35],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowFlickerRate: 6,
    scaleVibration: 0.025,
    scaleFrequency: 6,
    scaleContract: 0.05,
    tremor: 0.006,
    tremorFrequency: 8,
    shakeAmount: 0.01,
    shakeFrequency: 12,
    decayRate: 0.15,
};

export default buildVoidEffectGesture(VOIDTWIRL_CONFIG);
