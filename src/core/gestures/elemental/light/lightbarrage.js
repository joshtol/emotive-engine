/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Barrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightbarrage gesture - light orbs orbit then launch outward
 * @module gestures/destruction/elemental/lightbarrage
 *
 * VISUAL DIAGRAM:
 *          ✦↗   ✧↗          FRAGMENTS LAUNCHED OUTWARD
 *        ✦↗       ✧↗
 *         ╭─✦─╮              ← Light fragments orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─✧─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 light models orbiting mascot in ring formation
 * - 3 full revolutions with easeIn (slow orbit → fast launch)
 * - Per-element tumbling for dynamic light scatter
 * - Expanding orbit radius as they launch away
 * - No cutout — tumbling provides sufficient variety
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTBARRAGE_CONFIG = {
    name: 'lightbarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Light fragments orbit mascot then launch outward',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    category: 'manifestation',
    radiance: 0.8,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'above',
            radius: 1.2,
            endRadius: 2.8,
            speed: 3,
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.6,
            orientation: 'vertical'
        },
        formation: { type: 'ring', count: 5 },
        count: 5,
        scale: 1.4,
        models: ['prism-shard', 'sparkle-star', 'light-ray', 'prism-shard', 'sparkle-star'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: { type: 'scale', duration: 0.1, easing: 'easeOutBack' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.3 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.1, frequency: 5, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 2.5, frequency: 4, pattern: 'sine' },
            atmospherics: [{
                preset: 'firefly',
                targets: null,
                anchor: 'around',
                intensity: 0.4,
                sizeScale: 1.2,
                progressCurve: 'sustain',
                velocityInheritance: 0.6,
            }],
            rotate: [
                { axis: 'x', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -3, phase: 40 },
                { axis: 'z', rotations: 2.5, phase: 100 },
                { axis: 'x', rotations: -2, phase: 180 },
                { axis: 'y', rotations: 3, phase: 250 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 18
        }
    },

    decayRate: 0.2,
    glowColor: [1.0, 0.95, 0.65],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.6,
    glowFlickerRate: 6,
    scaleVibration: 0.012,
    scaleFrequency: 4,
    scalePulse: true
};

export default buildLightEffectGesture(LIGHTBARRAGE_CONFIG);
