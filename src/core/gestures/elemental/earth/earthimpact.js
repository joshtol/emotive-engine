/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Impact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthimpact gesture - converging orbital rocks that slam inward
 * @module gestures/destruction/elemental/earthimpact
 *
 * VISUAL DIAGRAM:
 *      ○↘         ◉↙
 *        ○↘     ◉↙       ← Rocks converge from above
 *          ╭───╮
 *          │ ★ │          ← Slam into center
 *          ╰───╯
 *        ◉↗     ○↗       ← Impact shrapnel
 *
 * FEATURES:
 * - 5 rocks start wide above, spiral inward to center
 * - Orbit shrinks from radius 2.5 to 0.3 (reverse barrage)
 * - Scale grows on approach for dramatic impact
 * - End flash on convergence
 * - No cutout — tumbling provides variety
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHIMPACT_CONFIG = {
    name: 'earthimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Converging orbital rocks slam inward to mascot center',
    duration: 1500,
    beats: 3,
    intensity: 1.5,
    category: 'manifestation',
    petrification: 0.8,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'above',
            endHeight: 'center',
            radius: 2.5,
            endRadius: 0.3,
            speed: 2,
            easing: 'easeOut',
            startScale: 0.6,
            endScale: 1.2,
            orientation: 'vertical',
        },
        formation: { type: 'ring', count: 5 },
        count: 5,
        scale: 1.0,
        models: [
            'rock-chunk-small',
            'rock-cluster',
            'rock-chunk-small',
            'rock-cluster',
            'rock-chunk-small',
        ],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.03,
            enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'burst-fade', duration: 0.1, easing: 'easeIn', burstScale: 1.5 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.08, frequency: 4, easing: 'easeInOut' },
            emissive: { min: 0.6, max: 1.1, frequency: 3, pattern: 'sine' },
            rotate: [
                { axis: 'x', rotations: 2, phase: 0 },
                { axis: 'z', rotations: -1.5, phase: 72 },
                { axis: 'y', rotations: 2.5, phase: 144 },
                { axis: 'x', rotations: -2, phase: 216 },
                { axis: 'z', rotations: 1.5, phase: 288 },
            ],
            atmospherics: [
                {
                    preset: 'earth-gravel',
                    targets: ['rock-chunk-medium', 'boulder'],
                    anchor: 'below',
                    intensity: 0.4,
                    sizeScale: 0.7,
                    progressCurve: 'burst',
                },
                {
                    preset: 'earth-dust',
                    targets: ['boulder'],
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 1.0,
                    progressCurve: 'burst',
                },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.08,
            blending: 'normal',
            renderOrder: 12,
        },
    },

    decayRate: 0.15,
    glowColor: [0.85, 0.6, 0.25],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    shakeAmount: 0.015,
    shakeFrequency: 15,
    tremor: 0.008,
    tremorFrequency: 5,
    endFlash: true,
};

export default buildEarthEffectGesture(EARTHIMPACT_CONFIG);
