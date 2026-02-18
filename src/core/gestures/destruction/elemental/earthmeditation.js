/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Meditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthmeditation gesture - zen stone garden mandala formation
 * @module gestures/destruction/elemental/earthmeditation
 *
 * FEATURES:
 * - Axis-travel spawn: stationary mandala centered on mascot
 * - Camera-facing earth-ring models in mandala formation
 * - Cutout waves + spiral blend for organic stone patterns
 * - Gentle rotation and minimal tremor for meditative calm
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHMEDITATION_CONFIG = {
    name: 'earthmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Zen stone garden mandala — earth rings orbit in calm meditative formation',
    duration: 4000,
    beats: 4,
    intensity: 0.6,
    category: 'emanating',
    petrification: 0.3,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.0,
            startDiameter: 1.8,
            endDiameter: 1.8,
            orientation: 'camera'
        },
        formation: { type: 'mandala', count: 5, radius: 0.5, arcOffset: 45, scales: [1.0, 0.6, 0.6, 0.6, 0.6] },
        count: 5,
        scale: 1.0,
        models: ['earth-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.8,
            stagger: 0,
            enter: { type: 'fade', duration: 0.5, easing: 'easeInOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeInOut' },
            pulse: { amplitude: 0.1, frequency: 1.2, easing: 'easeInOut' },
            emissive: { min: 0.5, max: 0.9, frequency: 1.2, pattern: 'sine' },
            cutout: {
                strength: 0.5,
                primary: { pattern: 4, weight: 1.0 },
                secondary: { pattern: 6, weight: 0.5 },
                blend: 'add',
                travel: 'angular',
                travelSpeed: 0.5
            },
            grain: {
                type: 3,
                strength: 0.25,
                scale: 0.4,
                speed: 0.4,
                blend: 'multiply'
            },
            atmospherics: [{
                preset: 'earth-dust',
                targets: ['earth-ring', 'stone-ring'],
                anchor: 'above',
                intensity: 0.2,
                sizeScale: 0.9,
                progressCurve: 'sustain',
            }],
            rotate: [
                { axis: 'z', rotations: 0.25 },
                { axis: 'z', rotations: -0.3 },
                { axis: 'z', rotations: 0.35 },
                { axis: 'z', rotations: -0.25 },
                { axis: 'z', rotations: 0.3 }
            ],
            blending: 'normal',
            depthWrite: false,
            renderOrder: -5,
            modelOverrides: {
                'earth-ring': {
                    orientationOverride: 'camera',
                    shaderAnimation: { type: 1 },
                    arcWidth: 0.8,
                    arcSpeed: 0.4,
                    arcCount: 2
                }
            }
        }
    },

    decayRate: 0.2,
    glowColor: [0.80, 0.55, 0.25],
    glowIntensityMin: 0.3,
    glowIntensityMax: 0.6,
    scaleVibration: 0.003,
    tremor: 0.002
};

export default buildEarthEffectGesture(EARTHMEDITATION_CONFIG);
