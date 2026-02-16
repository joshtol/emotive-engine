/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Impact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricimpact gesture - arcs orbit then crash inward
 * @module gestures/destruction/elemental/electricimpact
 *
 * VISUAL DIAGRAM:
 *        ⚡↘         ⚡↙       Arcs orbit inward
 *          ╭───────╮
 *     ⚡→   │  ★  ← │  ⚡      Crashing into mascot center
 *          ╰───────╯
 *        ⚡↗         ⚡↖
 *
 * FEATURES:
 * - 7 orbiting arc models rushing inward with violent tumbling
 * - easeOut: fast inward rush → convergence at center
 * - Per-element tumbling for chaotic aggressive motion
 * - ATTACKED: mascot is being struck by electricity
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICIMPACT_CONFIG = {
    name: 'electricimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Electric arcs orbit then crash inward',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'electrocute',

    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'above',
            endHeight: 'center',
            radius: 3.5,
            endRadius: 0.1,
            speed: 3,
            easing: 'easeOut',
            startScale: 0.4,
            endScale: 1.8,
            orientation: 'vertical'
        },
        formation: { type: 'ring', count: 7 },
        count: 7,
        scale: 1.4,
        models: ['arc-cluster', 'arc-medium', 'arc-small', 'spark-spike'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.02,
            enter: { type: 'fade', duration: 0.06, easing: 'easeOut' },
            exit: { type: 'burst-fade', duration: 0.05, easing: 'easeOut', burstScale: 0.2 },
            procedural: { scaleSmoothing: 0.04, geometryStability: true },
            grain: { type: 3, strength: 0.15, scale: 0.3, speed: 2.5, blend: 'multiply' },
            // Per-gesture atmospheric particles: ionized air from impact
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'around',
                intensity: 0.5,
                sizeScale: 1.0,
                progressCurve: 'burst',
                velocityInheritance: 0.7,
            }],
            pulse: { amplitude: 0.12, frequency: 8, easing: 'easeInOut' },
            emissive: { min: 1.0, max: 3.0, frequency: 9, pattern: 'sine' },
            rotate: [
                { axis: 'z', rotations: -4, phase: 0 },
                { axis: 'x', rotations: 3.5, phase: 50 },
                { axis: 'y', rotations: -3, phase: 100 },
                { axis: 'z', rotations: 4, phase: 155 },
                { axis: 'x', rotations: -3.5, phase: 210 },
                { axis: 'y', rotations: 3, phase: 260 },
                { axis: 'z', rotations: -4.5, phase: 315 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.08,
            blending: 'additive',
            renderOrder: 12
        }
    },

    // Violent jitter from impact
    jitterFrequency: 70,
    jitterAmplitude: 0.02,
    jitterDecay: 0.15,
    glowColor: [0.45, 0.9, 1.0],
    glowIntensityMin: 1.6,
    glowIntensityMax: 2.8,
    glowFlickerRate: 20,
    scaleVibration: 0.03,
    scaleFrequency: 15
};

export default buildElectricEffectGesture(ELECTRICIMPACT_CONFIG);
