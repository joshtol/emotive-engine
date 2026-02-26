/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Rumble Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthrumble gesture - mandala of grinding stone rings at ground level
 * @module gestures/destruction/elemental/earthrumble
 *
 * FEATURES:
 * - Mandala formation: 1 large central earth-ring + 4 smaller stone-rings orbiting
 * - Flat orientation at feet level — grinding on the ground plane
 * - Heavy breathing pulse (amplitude 0.2) creating rhythmic tremors
 * - Counter-rotating rings for geological stress
 * - Wave formation for sinusoidal height variation
 * - Maximum tremor and shake for persistent ground vibration
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHRUMBLE_CONFIG = {
    name: 'earthrumble',
    emoji: '🫨',
    type: 'blending',
    description: 'Grinding mandala of stone rings trembling at ground level',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    mascotGlow: 0.3,
    category: 'emanating',
    petrification: 0.4,

    spawnMode: [
        // ── Layer 1: Central grinding earth-ring ────────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'feet',
                offset: { x: 0, y: 0.05, z: 0 },
                orientation: 'flat',
                startScale: 0.5,
                endScale: 1.0,
                scaleEasing: 'easeOutQuad',
            },
            count: 1,
            scale: 2.0,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.8,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                pulse: {
                    amplitude: 0.2,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global',
                },
                emissive: { min: 0.6, max: 1.2, frequency: 2, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 1.5, phase: 0 },
                atmospherics: [
                    {
                        preset: 'earth-dust',
                        targets: ['earth-ring'],
                        anchor: 'above',
                        intensity: 0.5,
                        sizeScale: 1.5,
                        progressCurve: 'sustain',
                    },
                ],
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'earth-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.7,
                            arcSpeed: 1.5,
                            arcCount: 2,
                        },
                        orientationOverride: 'flat',
                    },
                },
            },
        },

        // ── Layer 2: 4 orbiting rock-chunks (mandala satellites) ──────────
        {
            type: 'orbit',
            orbit: {
                height: 'feet',
                endHeight: 'feet',
                radius: 0.6,
                endRadius: 0.8,
                speed: 0.5,
                easing: 'linear',
                startScale: 0.6,
                endScale: 0.9,
                orientation: 'camera',
            },
            count: 4,
            scale: 0.8,
            models: ['rock-cluster', 'rock-chunk-medium', 'boulder', 'rock-chunk-medium'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.75,
                stagger: 0.04,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                pulse: {
                    amplitude: 0.15,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global',
                },
                emissive: { min: 0.5, max: 1.0, frequency: 2, pattern: 'sine' },
                rotate: [
                    { axis: 'x', rotations: -1.2, phase: 0 },
                    { axis: 'z', rotations: 1.4, phase: 90 },
                    { axis: 'y', rotations: -1.0, phase: 180 },
                    { axis: 'x', rotations: 1.6, phase: 270 },
                ],
                atmospherics: [
                    {
                        preset: 'earth-gravel',
                        targets: null,
                        anchor: 'below',
                        intensity: 0.3,
                        sizeScale: 0.5,
                        progressCurve: 'sustain',
                    },
                ],
                scaleVariance: 0.2,
                blending: 'normal',
                renderOrder: 9,
            },
        },
    ],

    shakeAmount: 0.025,
    shakeFrequency: 10,
    decayRate: 0.2,
    glowColor: [0.8, 0.55, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
    glowFlickerRate: 2,
    scaleVibration: 0.012,
    scaleFrequency: 2,
    tremor: 0.015,
    tremorFrequency: 8,
};

export default buildEarthEffectGesture(EARTHRUMBLE_CONFIG);
