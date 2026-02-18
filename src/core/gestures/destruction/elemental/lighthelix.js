/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lighthelix gesture - double helix of light fragments spiraling upward
 * @module gestures/destruction/elemental/lighthelix
 *
 * VISUAL DIAGRAM:
 *       ✦             ✧        TOP — wide, brilliant
 *          ✧       ✦
 *           ✦   ✧
 *            ✧ ✦                ← Counter-rotating strands of prisms & sparkles
 *            ✦✧                    spiraling upward in DNA helix
 *            ★                  BOTTOM — tight seed
 *           /|\
 *
 * FEATURES:
 * - 10 fragments in DNA double helix (5 per strand, 180° offset)
 * - Strand A: prism-shard (refractive crystals), counter-clockwise
 * - Strand B: sparkle-star + light-ray (sparkles & beams), clockwise
 * - Tight seed at feet → wide expansion above head
 * - Camera billboard — floating shards of light
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTHELIX_CONFIG = {
    name: 'lighthelix',
    emoji: '🧬',
    type: 'blending',
    description: 'Double helix of light fragments counter-spiraling upward',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    radiance: 0.7,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.7,
            endScale: 1.8,
            startDiameter: 0.4,
            endDiameter: 2.8,
            orientation: 'camera'
        },
        formation: {
            type: 'spiral',
            count: 10,
            strands: 2,
            spacing: 0.08,
            arcOffset: 180,
            phaseOffset: 0.03
        },
        count: 10,
        scale: 1.2,
        models: ['sun-ring', 'sparkle-star', 'prism-shard', 'sun-ring', 'prism-shard', 'sparkle-star', 'sun-ring', 'prism-shard', 'sparkle-star', 'sun-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.40,
            stagger: 0.02,
            enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.4, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 4, easing: 'easeInOut', perElement: true },
            emissive: { min: 1.0, max: 2.0, frequency: 4, pattern: 'sine' },
            cutout: {
                strength: 0.4,
                primary: { pattern: 5, scale: 1.0, weight: 0.7 },    // EMBERS
                secondary: { pattern: 0, scale: 0.8, weight: 0.5 },  // CELLULAR
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                trailDissolve: { enabled: true, offset: -0.5, softness: 1.5 }
            },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'around',
                intensity: 0.35,
                sizeScale: 0.6,
                progressCurve: 'sustain',
                velocityInheritance: 0.5,
                centrifugal: { speed: 0.8, tangentialBias: 0.4 },
            }],
            rotate: [
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
            ],
            scaleVariance: 0.3,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 15,
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.92, 0.60],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.4,
    glowFlickerRate: 3,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildLightEffectGesture(LIGHTHELIX_CONFIG);
