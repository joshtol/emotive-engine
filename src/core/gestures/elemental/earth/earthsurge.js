/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Surge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthsurge gesture - seismic shockwave expanding from mascot
 * @module gestures/destruction/elemental/earthsurge
 *
 * FEATURES:
 * - Layer 1: Single massive earth-ring shockwave expanding outward (camera-facing)
 *   with radial travel + trailDissolve for dissipating wave edge
 * - Layer 2: 4 boulders in radial-burst flying outward from impact
 * - speedCurve 'surge' for seismic wave physics
 * - Heavy screen distortion
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHSURGE_CONFIG = {
    name: 'earthsurge',
    emoji: '🌊',
    type: 'blending',
    description: 'Seismic shockwave ripples outward from the mascot',
    duration: 1200,
    beats: 2,
    intensity: 1.5,
    category: 'emanating',
    petrification: 0.8,

    spawnMode: [
        // ── Layer 1: Expanding shockwave ring ───────────────────────────
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                easing: 'linear',
                speedCurve: 'surge',
                startScale: 0.4,
                endScale: 2.5,
                startDiameter: 0.5,
                endDiameter: 3.5,
                orientation: 'camera',
            },
            formation: {
                type: 'spiral',
                count: 1,
                spacing: 0,
                arcOffset: 0,
                phaseOffset: 0,
            },
            count: 1,
            scale: 2.0,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: {
                    type: 'fade',
                    duration: 0.03,
                    easing: 'linear',
                },
                exit: {
                    type: 'fade',
                    duration: 0.5,
                    easing: 'easeIn',
                },
                procedural: {
                    scaleSmoothing: 0.03,
                    geometryStability: true,
                },
                cutout: {
                    strength: 0.7,
                    primary: { pattern: 8, scale: 0.8, weight: 1.0 },
                    secondary: { pattern: 3, scale: 1.2, weight: 0.5 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.8,
                    },
                },
                grain: {
                    type: 3,
                    strength: 0.3,
                    scale: 0.2,
                    speed: 3.0,
                    blend: 'multiply',
                },
                emissive: {
                    min: 1.2,
                    max: 2.5,
                    frequency: 1,
                    pattern: 'sine',
                },
                atmospherics: [
                    {
                        preset: 'earth-dust',
                        targets: ['earth-ring'],
                        anchor: 'around',
                        intensity: 0.5,
                        sizeScale: 1.5,
                        progressCurve: 'burst',
                    },
                ],
                blending: 'normal',
                depthWrite: false,
                renderOrder: -5,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.95,
                            arcSpeed: 0.3,
                            arcCount: 1,
                        },
                        orientationOverride: 'camera',
                    },
                },
            },
        },

        // ── Layer 2: Boulder radial-burst ───────────────────────────────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 4,
                radius: 0.15,
                endRadius: 2.0,
                angleSpread: 360,
                startAngle: 45,
                orientation: 'camera',
                startScale: 0.4,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 4,
            scale: 0.7,
            models: ['rock-chunk-medium', 'rock-cluster', 'rock-chunk-medium', 'rock-chunk-small'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.55,
                stagger: 0.01,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.3 },
                emissive: { min: 0.6, max: 1.0, frequency: 2, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: 1.5, phase: 0 },
                    { axis: 'z', rotations: -1.2, phase: 90 },
                    { axis: 'y', rotations: 1.8, phase: 180 },
                    { axis: 'x', rotations: -1.0, phase: 270 },
                ],
                atmospherics: [
                    {
                        preset: 'earth-gravel',
                        targets: null,
                        anchor: 'around',
                        intensity: 0.4,
                        sizeScale: 0.6,
                        progressCurve: 'burst',
                    },
                ],
                scaleVariance: 0.3,
                blending: 'normal',
                renderOrder: 12,
            },
        },
    ],

    distortionStrength: 1.5,
    decayRate: 0.15,
    glowColor: [0.85, 0.6, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 4,
    beaconPulse: true,
    scaleVibration: 0.015,
    scaleFrequency: 6,
    tremor: 0.012,
    tremorFrequency: 8,
    shakeAmount: 0.015,
    shakeFrequency: 14,
};

export default buildEarthEffectGesture(EARTHSURGE_CONFIG);
