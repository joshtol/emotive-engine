/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Shatter Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthshatter gesture - violent shattering explosion of stone
 * @module gestures/destruction/elemental/earthshatter
 *
 * VISUAL DIAGRAM:
 *      ◉↗ ○↗ ◉↗ ○↗         ← 10 rock fragments exploding outward
 *    ◉↗             ○↗
 *         ╭─────╮
 *         │  ★  │           ← Build-up then SHATTER at 30%
 *         ╰─────╯
 *    ○↙             ◉↙
 *      ○↙ ◉↙ ○↙ ◉↙
 *
 * FEATURES:
 * - Shatter point at 30% — build tension then explode
 * - 10 rock fragments in massive radial burst
 * - Heavy screen shake during and after shatter
 * - End flash for dramatic finish
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHSHATTER_CONFIG = {
    name: 'earthshatter',
    emoji: '💥',
    type: 'blending',
    description: 'Violent shattering explosion — stone builds tension then detonates into fragments',
    duration: 1200,
    beats: 2,
    intensity: 1.6,
    category: 'transform',
    petrification: 0.8,
    shatterPoint: 0.3,

    spawnMode: {
        type: 'radial-burst',
        radialBurst: {
            count: 10,
            radius: 0.05,
            endRadius: 2.5,
            angleSpread: 360,
            startAngle: 18,
            orientation: 'camera',
            startScale: 0.3,
            endScale: 1.0,
            scaleEasing: 'easeOutQuad'
        },
        count: 10,
        scale: 0.8,
        models: ['rock-chunk-small', 'boulder', 'rock-chunk-small', 'boulder', 'rock-chunk-small',
            'boulder', 'rock-chunk-small', 'boulder', 'rock-chunk-small', 'boulder'],
        animation: {
            appearAt: 0.25,
            disappearAt: 0.55,
            stagger: 0.008,
            enter: { type: 'flash', duration: 0.02, easing: 'linear' },
            exit: { type: 'burst-fade', duration: 0.12, easing: 'easeIn', burstScale: 1.4 },
            procedural: { scaleSmoothing: 0.05, geometryStability: true },
            emissive: { min: 0.6, max: 1.2, frequency: 6, pattern: 'sine' },
            atmospherics: [{
                preset: 'earth-gravel',
                targets: ['rock-cluster', 'stone-slab'],
                anchor: 'below',
                intensity: 0.5,
                sizeScale: 0.8,
                progressCurve: 'burst',
            }, {
                preset: 'earth-dust',
                targets: ['rock-cluster'],
                anchor: 'above',
                intensity: 0.4,
                sizeScale: 1.2,
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
    },

    shakeAmount: 0.05,
    shakeFrequency: 20,
    explosionForce: 1.0,
    endFlash: true,
    decayRate: 0.1,
    glowColor: [0.90, 0.65, 0.20],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.3,
    glowFlickerRate: 8,
    scaleVibration: 0.02,
    scaleFrequency: 8,
    tremor: 0.02,
    tremorFrequency: 10
};

export default buildEarthEffectGesture(EARTHSHATTER_CONFIG);
