/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightflourish gesture - radial burst of light from center
 * @module gestures/destruction/elemental/lightflourish
 *
 * VISUAL DIAGRAM:
 *      ✦  ✧  ✦
 *    ✧    ★    ✧     ← Radial starburst of fragments exploding outward
 *      ✦  ✧  ✦
 *         /|\
 *
 * FEATURES:
 * - 8 fragments in radial-burst from center
 * - Mixed models: prism-shard, sparkle-star, light-ray
 * - Dramatic outward expansion
 * - Quick, flashy — a burst of divine power
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTFLOURISH_CONFIG = {
    name: 'lightflourish',
    emoji: '🌟',
    type: 'blending',
    description: 'Radial starburst of light fragments exploding outward from center',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    mascotGlow: 0.3,
    category: 'manifestation',
    radiance: 0.85,

    spawnMode: {
        type: 'radial-burst',
        radialBurst: {
            center: 'center',
            startRadius: 0.3,
            endRadius: 2.5,
            easing: 'easeOut',
            startScale: 0.5,
            endScale: 1.4,
            orientation: 'camera',
        },
        formation: { type: 'ring', count: 8 },
        count: 8,
        scale: 1.2,
        models: [
            'sun-ring',
            'sparkle-star',
            'prism-shard',
            'sun-ring',
            'sparkle-star',
            'prism-shard',
            'sun-ring',
            'sparkle-star',
        ],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.55,
            stagger: 0.01,
            enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
            exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.3 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.1, frequency: 6, easing: 'easeInOut' },
            emissive: { min: 1.2, max: 2.5, frequency: 5, pattern: 'sine' },
            cutout: {
                strength: 0.5,
                primary: { pattern: 5, scale: 1.0, weight: 0.8 }, // EMBERS
                secondary: { pattern: 1, scale: 1.5, weight: 0.4 }, // RADIAL
                blend: 'add',
                travel: 'radial',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.4,
            },
            atmospherics: [
                {
                    preset: 'firefly',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.4,
                    sizeScale: 1.0,
                    progressCurve: 'burst',
                    velocityInheritance: 0.6,
                },
            ],
            rotate: [
                { axis: 'z', rotations: 1, phase: 0 },
                { axis: 'z', rotations: -1.5, phase: 45 },
                { axis: 'z', rotations: 1, phase: 90 },
                { axis: 'z', rotations: -1.5, phase: 135 },
                { axis: 'z', rotations: 1, phase: 180 },
                { axis: 'z', rotations: -1.5, phase: 225 },
                { axis: 'z', rotations: 1, phase: 270 },
                { axis: 'z', rotations: -1.5, phase: 315 },
            ],
            scaleVariance: 0.25,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 18,
        },
    },

    decayRate: 0.15,
    glowColor: [1.0, 0.95, 0.7],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.6,
    glowFlickerRate: 6,
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTFLOURISH_CONFIG);
