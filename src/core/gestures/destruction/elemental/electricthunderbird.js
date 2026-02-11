/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Thunderbird Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricthunderbird gesture - mythic storm bird spreading lightning wings
 * @module gestures/destruction/elemental/electricthunderbird
 *
 * VISUAL DIAGRAM:
 *     ⚡──────⚡──────⚡
 *      ╲      ↑      ╱     ← Layer 2: Wing rings spreading ±45°
 *       ╲   ⚡⚡⚡   ╱      ← Layer 3: Spark-spike feather bolts
 *        ╲  ★★★  ╱         ← Layer 1: Central rising plasma-ring (body)
 *         ╲     ╱
 *      ····⚡⚡⚡····        ← Layer 4: Arc-ring-small discharge particles
 *           ○○○             ← Layer 5: Grounding arc-cluster at base
 *
 * FEATURES:
 * - Layer 1: Central plasma-ring rising (the thunderbird's body/crest)
 * - Layer 2: 2 lightning-rings angled ±45° sweeping outward (wings)
 * - Layer 3: 5 spark-spikes shooting outward (feather bolts)
 * - Layer 4: 8 arc-ring-small radial discharge (electric corona)
 * - Layer 5: Grounding arc-cluster at base (tail/grounding)
 * - DRAMATIC: the electricity equivalent of a phoenix
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICTHUNDERBIRD_CONFIG = {
    name: 'electricthunderbird',
    emoji: '🦅',
    type: 'blending',
    description: 'Mythic thunderbird spreading lightning wings',
    duration: 2500,
    beats: 4,
    intensity: 1.6,
    category: 'powered',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central rising plasma-ring — the thunderbird's crest/body
        // Rising from center upward, expanding as it ascends
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.1, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.8,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.5, models: ['plasma-ring'],
            animation: {
                appearAt: 0.0, disappearAt: 0.7,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.2, easing: 'easeIn', burstScale: 1.2 },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 2, scale: 1.5, weight: 0.6 },
                    secondary: { pattern: 6, scale: 0.8, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 0.8,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.2, scale: 0.3, speed: 1.5, blend: 'multiply' },
                drift: { speed: 0.5, distance: 0.4, direction: { x: 0, y: 1.0, z: 0 }, easing: 'easeOutQuad' },
                pulse: { amplitude: 0.1, frequency: 3, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.5, frequency: 4, pattern: 'sine' },
                blending: 'additive', renderOrder: 10,
                modelOverrides: {
                    'plasma-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.8, arcSpeed: 2.0, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2a: Right wing — lightning-ring sweeping right at +45°
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.05, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3, endScale: 1.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.4, models: ['lightning-ring'],
            animation: {
                appearAt: 0.05, disappearAt: 0.65,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.15 },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.2, weight: 0.7 },
                    secondary: { pattern: 8, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'bell'
                },
                grain: { type: 3, strength: 0.15, scale: 0.35, speed: 2.0, blend: 'multiply' },
                drift: { speed: 0.8, distance: 0.6, direction: { x: 0.85, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: 1, phase: 0 },
                tilt: { angle: Math.PI / 4, wobble: 0.03, wobbleFreq: 2 },
                blending: 'additive', renderOrder: 12,
                modelOverrides: {
                    'lightning-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2b: Left wing — lightning-ring sweeping left at -45°
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0.05, z: 0.05 },
                orientation: 'camera',
                startScale: 0.3, endScale: 1.6,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.4, models: ['lightning-ring'],
            animation: {
                appearAt: 0.05, disappearAt: 0.65,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOutBack' },
                exit: { type: 'burst-fade', duration: 0.15, easing: 'easeIn', burstScale: 1.15 },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 1, scale: 1.2, weight: 0.7 },
                    secondary: { pattern: 8, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 2.0,
                    strengthCurve: 'bell'
                },
                grain: { type: 3, strength: 0.15, scale: 0.35, speed: 2.0, blend: 'multiply' },
                drift: { speed: 0.8, distance: 0.6, direction: { x: -0.85, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                rotate: { axis: 'z', rotations: -1, phase: 90 },
                tilt: { angle: -Math.PI / 4, wobble: 0.03, wobbleFreq: 2 },
                blending: 'additive', renderOrder: 12,
                modelOverrides: {
                    'lightning-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.6, arcSpeed: 4.0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 5 spark-spikes shooting outward — feather bolts in star pattern
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 5, radius: 0.05, endRadius: 0.7,
                angleSpread: 180, startAngle: 0,
                orientation: 'camera',
                startScale: 0.15, endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 5, scale: 0.7, models: ['spark-spike'],
            animation: {
                appearAt: 0.08, disappearAt: 0.55, stagger: 0.015,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 1, scale: 1.0, weight: 0.7 },
                    secondary: { pattern: 3, scale: 0.7, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.2, scale: 0.3, speed: 2.5, blend: 'multiply' },
                scaleVariance: 0.3, lifetimeVariance: 0.15,
                blending: 'additive', renderOrder: 14,
                modelOverrides: {
                    'spark-spike': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: 8 arc-ring-small — electric corona (full radial)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8, radius: 0.03, endRadius: 0.55,
                angleSpread: 360, startAngle: 15,
                orientation: 'camera',
                startScale: 0.1, endScale: 0.5,
                scaleEasing: 'easeOutQuad'
            },
            count: 8, scale: 0.3, models: ['arc-ring-small'],
            animation: {
                appearAt: 0.03, disappearAt: 0.45, stagger: 0.006,
                enter: { type: 'scale', duration: 0.025, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                cutout: { strength: 0.35, primary: { pattern: 7, scale: 0.6, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 1.2, strengthCurve: 'fadeOut' },
                scaleVariance: 0.4, lifetimeVariance: 0.2,
                blending: 'additive', renderOrder: 16,
                modelOverrides: { 'arc-ring-small': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 5: Grounding arc-cluster at base — tail/earth connection
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: -0.15, z: 0.1 },
                orientation: 'camera',
                startScale: 0.3, endScale: 1.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 0.7, models: ['arc-cluster'],
            animation: {
                appearAt: 0.1, disappearAt: 0.8,
                enter: { type: 'scale', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 8, scale: 1.0, weight: 0.7 },
                    secondary: { pattern: 0, scale: 0.8, weight: 0.3 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 0.5,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.15, scale: 0.4, speed: 1.5, blend: 'multiply' },
                pulse: { amplitude: 0.08, frequency: 4, easing: 'easeInOut' },
                emissive: { min: 0.8, max: 1.8, frequency: 3, pattern: 'sine' },
                blending: 'additive', renderOrder: 6,
                modelOverrides: {
                    'arc-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 1.0, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    // Minimal jitter — controlled power
    jitterFrequency: 5,
    jitterAmplitude: 0.003,
    jitterDecay: 0.2,
    glowColor: [0.35, 0.9, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scaleGrowth: 0.02,
    scalePulse: true,
    riseAmount: 0.015
};

export default buildElectricEffectGesture(ELECTRICTHUNDERBIRD_CONFIG);
