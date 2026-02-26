/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Barrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthbarrage gesture - tumbling rocks orbiting then launching outward
 * @module gestures/destruction/elemental/earthbarrage
 *
 * VISUAL DIAGRAM:
 *        ◉↗   ○↗
 *      ◉↗       ○↗     ← Rocks launch outward
 *       ╭─◉─╮
 *       │ ★  │          ← 5 rocks orbit close, tumbling
 *       ╰─○─╯
 *
 * FEATURES:
 * - 5 rock models orbiting mascot in ring formation
 * - 2 full revolutions (slower than light's 3)
 * - Per-element tumbling for rocky chaos
 * - Expanding orbit radius as they launch
 * - No cutout — tumbling provides variety
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHBARRAGE_CONFIG = {
    name: 'earthbarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Rocks orbit mascot then launch outward in all directions',
    duration: 2000,
    beats: 4,
    intensity: 1.3,
    category: 'manifestation',
    petrification: 0.7,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'above',
            radius: 1.0,
            endRadius: 2.5,
            speed: 2,
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.7,
            orientation: 'vertical',
        },
        formation: { type: 'ring', count: 5 },
        count: 5,
        scale: 1.2,
        models: [
            'rock-chunk-medium',
            'boulder',
            'rock-chunk-medium',
            'boulder',
            'rock-chunk-medium',
        ],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: { type: 'scale', duration: 0.12, easing: 'easeOutBack' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.2 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.06, frequency: 3, easing: 'easeInOut' },
            emissive: { min: 0.5, max: 0.9, frequency: 2, pattern: 'sine' },
            rotate: [
                { axis: 'x', rotations: 1.5, phase: 0 },
                { axis: 'y', rotations: -2, phase: 40 },
                { axis: 'z', rotations: 1.5, phase: 100 },
                { axis: 'x', rotations: -1.5, phase: 180 },
                { axis: 'y', rotations: 2, phase: 250 },
            ],
            atmospherics: [
                {
                    preset: 'earth-gravel',
                    targets: ['rock-chunk-medium', 'boulder'],
                    anchor: 'below',
                    intensity: 0.3,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                },
                {
                    preset: 'earth-dust',
                    targets: ['rock-chunk-medium'],
                    anchor: 'around',
                    intensity: 0.2,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                },
            ],
            scaleVariance: 0.25,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12,
        },
    },

    decayRate: 0.2,
    glowColor: [0.85, 0.6, 0.25],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.9,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    tremor: 0.005,
    tremorFrequency: 4,
};

export default buildEarthEffectGesture(EARTHBARRAGE_CONFIG);
