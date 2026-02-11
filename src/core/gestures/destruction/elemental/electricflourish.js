/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricflourish gesture - spinning sword flourish with lightning trails
 * @module gestures/destruction/elemental/electricflourish
 *
 * VISUAL DIAGRAM:
 *      ⚡─────⚡
 *       ╲   ╱          ← Layer 1: 5 rings spinning camera-facing
 *        ★ ╱
 *       ╱ ╲            ← Layer 2: 2 X-sweep arcs
 *      ⚡───⚡
 *
 * FEATURES:
 * - Layer 1: 5 lightning-rings spinning around mascot (camera-facing)
 * - Layer 2: 2 plasma-rings in diagonal X sweep arcs
 * - Layer 3: 2 arc-ring-small tilted accent rings
 * - Per-element rotation with varied phases for dynamic layering
 * - STREAKS + CRACKS cutout for branching slash trails
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICFLOURISH_CONFIG = {
    name: 'electricflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Spinning lightning flourish with electric trails',
    duration: 1200,
    beats: 2,
    intensity: 1.3,
    category: 'powered',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // Layer 1: 5 rings spinning around mascot (camera-facing)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y', start: 'bottom', end: 'top',
                easing: 'easeInOut',
                startScale: 0.9, endScale: 1.2,
                startDiameter: 1.3, endDiameter: 1.6,
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 5,
                spacing: 0,
                arcOffset: 72,
                phaseOffset: 0
            },
            count: 5, scale: 1.3, models: ['lightning-ring'],
            animation: {
                appearAt: 0.0, disappearAt: 0.85, stagger: 0.03,
                enter: { type: 'scale', duration: 0.06, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.12, easing: 'easeIn', burstScale: 1.1 },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                pulse: { amplitude: 0.1, frequency: 6, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.2, frequency: 7, pattern: 'sine' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.0, weight: 0.65 },
                    secondary: { pattern: 8, scale: 0.8, weight: 0.35 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.5,
                    strengthCurve: 'bell'
                },
                grain: { type: 3, strength: 0.2, scale: 0.3, speed: 2.5, blend: 'multiply' },
                rotate: [
                    { axis: 'z', rotations: 3, phase: 0 },
                    { axis: 'z', rotations: -2, phase: 45 },
                    { axis: 'z', rotations: 3, phase: 90 },
                    { axis: 'z', rotations: -2.5, phase: 135 },
                    { axis: 'z', rotations: 2, phase: 180 }
                ],
                opacityGradient: [1.0, 0.85, 0.7, 0.55, 0.4],
                blending: 'additive',
                renderOrder: 12
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // Layer 2: X-sweep diagonal arcs (2 plasma-rings)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.5, endScale: 1.4,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.2, models: ['plasma-ring'],
            animation: {
                appearAt: 0.05, disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.04, geometryStability: true },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 8, scale: 1.2, weight: 0.7 },
                    secondary: { pattern: 3, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'bell'
                },
                grain: { type: 3, strength: 0.15, scale: 0.35, speed: 2.0, blend: 'multiply' },
                drift: { speed: 0.6, distance: 0.5, direction: { x: 0.7, y: 0.7, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 2, phase: 0 },
                tilt: { angle: Math.PI / 4, wobble: 0.05, wobbleFreq: 3 },
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera',
                startScale: 0.5, endScale: 1.4,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.2, models: ['plasma-ring'],
            animation: {
                appearAt: 0.05, disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.04, geometryStability: true },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 8, scale: 1.2, weight: 0.7 },
                    secondary: { pattern: 3, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'bell'
                },
                grain: { type: 3, strength: 0.15, scale: 0.35, speed: 2.0, blend: 'multiply' },
                drift: { speed: 0.6, distance: 0.5, direction: { x: -0.7, y: 0.7, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: -2, phase: 90 },
                tilt: { angle: -Math.PI / 4, wobble: 0.05, wobbleFreq: 3 },
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scalePulse: true
};

export default buildElectricEffectGesture(ELECTRICFLOURISH_CONFIG);
