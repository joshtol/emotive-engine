/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Impact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidimpact gesture - void orbs converge inward to strike
 * @module gestures/destruction/elemental/voidimpact
 *
 * VISUAL DIAGRAM:
 *        ◉↘       ◉↙
 *          ╭─◉─╮              ← Void orbs converge INWARD
 *          │ ★  │                from wide orbit
 *          ╰─◉─╯                shrinking to mascot center
 *        ◉↗       ◉↖
 *
 * FEATURES:
 * - 5 void models orbiting, converging inward
 * - Reversed orbit: wide → narrow radius (collapse motion)
 * - 2 full revolutions with easeOut (fast start → slow collapse)
 * - Scale GROWS as orbs converge (impact intensifies)
 * - No cutout — tumbling provides variety
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDIMPACT_CONFIG = {
    name: 'voidimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Void orbs converge inward to strike the mascot',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'manifestation',
    depth: 0.8,

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'center',
            radius: 2.5,
            endRadius: 0.5,              // Converging inward
            speed: 2,
            easing: 'easeOut',
            startScale: 0.6,
            endScale: 1.3,              // Growing as they converge
            orientation: 'vertical'
        },
        formation: { type: 'ring', count: 5 },
        count: 5,
        scale: 1.6,
        models: ['void-orb', 'void-crack', 'corruption-patch'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.03,
            enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
            exit: { type: 'shrink', duration: 0.1, easing: 'easeInCubic' },
            procedural: { scaleSmoothing: 0.06, geometryStability: true },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeIn' },
            emissive: { min: 0.3, max: 1.0, frequency: 5, pattern: 'sine' },
            atmospherics: [{
                preset: 'darkness',
                targets: null,
                anchor: 'around',
                intensity: 0.6,
                sizeScale: 1.4,
                progressCurve: 'rampUp',
                velocityInheritance: 0.5,
            }],
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },
                { axis: 'x', rotations: -2.5, phase: 72 },
                { axis: 'z', rotations: 3, phase: 144 },
                { axis: 'y', rotations: -2, phase: 216 },
                { axis: 'x', rotations: 2.5, phase: 288 }
            ],
            scaleVariance: 0.15,
            lifetimeVariance: 0.08,
            blending: 'normal',
            renderOrder: 3
        }
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.15,
    glowColor: [0.15, 0.02, 0.25],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.5,
    glowFlickerRate: 8,
    dimStrength: 0.4,
    scaleVibration: 0.02,
    scaleFrequency: 5,
    scalePulse: true
};

export default buildVoidEffectGesture(VOIDIMPACT_CONFIG);
