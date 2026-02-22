/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Twirl Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturetwirl gesture - 3-ring relay illusion
 * @module gestures/destruction/elemental/naturetwirl
 *
 * CONCEPT: Three interlocked camera-billboarded rings arranged in an equilateral
 * triangle. Only one ring's arc segment is visible at a time, cycling between
 * rings so the element appears to weave through a trinity of rings.
 * Arc is FIXED in model space; ring rotation carries it in world space.
 * Relay shader handles cyclic visibility + crossfade.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATURETWIRL_CONFIG = {
    name: 'naturetwirl',
    emoji: '🌿',
    type: 'blending',
    description: 'Relay vine illusion — arc weaves through three interlocked rings',
    duration: 1500,
    beats: 2,
    intensity: 1.5,
    category: 'afflicted',
    growth: 0.9,

    spawnMode: [
        // ── Three interlocked relay rings in equilateral triangle ─────────
        // Ring A — lower-left — relay 2, CW (third in cycle)
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: -0.45, y: -0.26, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['vine-ring'],
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
                    'vine-ring': {
                        arcPhase: 0.0,
                        relayIndex: 2,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring B — lower-right — relay 1, CCW (second in cycle)
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.45, y: -0.26, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['vine-ring'],
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
                    'vine-ring': {
                        arcPhase: 3.14,
                        relayIndex: 1,
                        orientationOverride: 'camera'
                    }
                }
            }
        },

        // Ring C — upper-center — relay 0, CW (first in cycle)
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0.0, y: 0.52, z: 0 },
                orientation: 'camera',
                cameraOffset: 1.0,
                relativeOffset: true,
                startScale: 1.0,
                endScale: 1.0
            },
            count: 1,
            scale: 3.0,
            sizeVariance: 0,
            models: ['vine-ring'],
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
                    'vine-ring': {
                        arcPhase: 4.71,
                        relayIndex: 0,
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    glowColor: [0.25, 0.75, 0.2],
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
    decayRate: 0.15
};

export default buildNatureEffectGesture(NATURETWIRL_CONFIG);
