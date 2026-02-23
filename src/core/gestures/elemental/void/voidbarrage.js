/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Barrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidbarrage gesture - void orbs orbit then launch outward
 * @module gestures/destruction/elemental/voidbarrage
 *
 * VISUAL DIAGRAM:
 *          ◉↗   ◉↗          ORBS LAUNCHED OUTWARD
 *        ◉↗       ◉↗
 *         ╭─◉─╮              ← Void orbs orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─◉─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 void models orbiting mascot in ring formation
 * - 3 full revolutions with easeIn (slow orbit → fast launch)
 * - Per-element tumbling for chaotic void motion
 * - Expanding orbit radius as they launch away
 * - No cutout — tumbling provides sufficient variety
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDBARRAGE_CONFIG = {
    name: 'voidbarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Void orbs orbit mascot then launch outward',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    category: 'manifestation',
    depth: 0.7,

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
        scale: 1.6,
        models: ['void-orb', 'void-shard', 'shadow-tendril'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: { type: 'scale', duration: 0.1, easing: 'easeOutBack' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.2 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            pulse: { amplitude: 0.1, frequency: 5, easing: 'easeInOut' },
            emissive: { min: 0.2, max: 0.7, frequency: 4, pattern: 'sine' },
            atmospherics: [{
                preset: 'darkness',
                targets: null,
                anchor: 'around',
                intensity: 0.5,
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
            blending: 'normal',
            renderOrder: 3
        }
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.2, 0.05, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.2,
    glowFlickerRate: 6,
    dimStrength: 0.35,
    scaleVibration: 0.012,
    scaleFrequency: 4,
    scalePulse: true
};

export default buildVoidEffectGesture(VOIDBARRAGE_CONFIG);
