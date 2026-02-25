/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Crown Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthcrown gesture - stone ring crown hovering above head
 * @module gestures/destruction/elemental/earthcrown
 *
 * FEATURES:
 * - Single earth-ring anchored at head, horizontal
 * - Slow heavy rotation — grinding stone
 * - Minimal bob — stone is heavy
 * - NormalBlending — opaque stone crown
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHCROWN_CONFIG = {
    name: 'earthcrown',
    emoji: '👑',
    type: 'blending',
    description: 'Heavy stone crown hovering above the head, grinding with seismic energy',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    mascotGlow: 0.2,
    category: 'manifestation',
    petrification: 0.6,

    spawnMode: {
        type: 'anchor',
        anchor: {
            landmark: 'top',
            offset: { x: 0, y: 0.05, z: 0 },
            orientation: 'flat',
            bob: {
                amplitude: 0.008,
                frequency: 0.2
            }
        },
        count: 1,
        scale: 2.2,
        models: ['earth-crown'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.75,
            stagger: 0,
            enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.1, geometryStability: true },
            pulse: { amplitude: 0.03, frequency: 1.5, easing: 'easeInOut' },
            emissive: { min: 0.6, max: 1.0, frequency: 1, pattern: 'sine' },
            rotate: { axis: 'z', rotations: 0.3, phase: 0 },
            wetness: {
                wetness: 0.65,
                wetSpeed: 0.4
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: ['earth-crown'],
                anchor: 'above',
                intensity: 0.25,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0,
            lifetimeVariance: 0,
            blending: 'normal',
            renderOrder: 10,
            modelOverrides: {
                'earth-crown': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.8,
                        arcSpeed: 0.4,
                        arcCount: 2
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [0.85, 0.60, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.8,
    glowFlickerRate: 1.5,
    scaleVibration: 0.005,
    scaleFrequency: 1.5,
    scalePulse: true,
    rotationDrift: 0.008,
    tremor: 0.003,
    tremorFrequency: 3
};

export default buildEarthEffectGesture(EARTHCROWN_CONFIG);
