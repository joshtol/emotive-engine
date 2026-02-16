/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Barrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricbarrage gesture - arc models orbit then launch outward
 * @module gestures/destruction/elemental/electricbarrage
 *
 * VISUAL DIAGRAM:
 *          ⚡↗   ⚡↗          ARCS LAUNCHED OUTWARD
 *        ⚡↗       ⚡↗
 *         ╭─⚡─╮              ← Arcs orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─⚡─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 arc/spark models orbiting mascot in ring formation
 * - 3 full revolutions with easeIn (slow orbit → fast launch)
 * - Per-element tumbling for chaotic electric motion
 * - ATTACK: mascot projecting electricity outward
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICBARRAGE_CONFIG = {
    name: 'electricbarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Electric arcs orbit mascot then launch outward',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    category: 'powered',

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
        scale: 1.8,
        models: ['arc-cluster', 'arc-medium', 'spark-node'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: { type: 'scale', duration: 0.08, easing: 'easeOutBack' },
            exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.3 },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            flicker: { intensity: 0.4, rate: 16, pattern: 'random' },
            grain: { type: 3, strength: 0.12, scale: 0.3, speed: 2.0, blend: 'multiply' },
            // Per-gesture atmospheric particles: ionized air from barrage
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'around',
                intensity: 0.25,
                sizeScale: 0.8,
                progressCurve: 'sustain',
                velocityInheritance: 0.7,
            }],
            flash: {
                events: [
                    { at: 0.10, intensity: 1.5 },
                    { at: 0.30, intensity: 2.5 },
                    { at: 0.50, intensity: 3.0 }
                ],
                decay: 0.02
            },
            pulse: { amplitude: 0.12, frequency: 6, easing: 'easeInOut' },
            emissive: { min: 1.2, max: 3.0, frequency: 8, pattern: 'sine' },
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
            renderOrder: 12
        }
    },

    jitterFrequency: 10,
    jitterAmplitude: 0.005,
    jitterDecay: 0.2,
    glowColor: [0.4, 0.9, 1.0],
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.0,
    glowFlickerRate: 12,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrowth: 0.02,
    scalePulse: true
};

export default buildElectricEffectGesture(ELECTRICBARRAGE_CONFIG);
