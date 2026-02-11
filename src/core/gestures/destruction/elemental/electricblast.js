/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Blast Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electricblast gesture - explosive electrical discharge burst
 * @module gestures/destruction/elemental/electricblast
 *
 * VISUAL DIAGRAM:
 *              ⚡              ← Center spike shoots UP
 *           ⚡    ⚡           ← Spark-spikes arc up/out
 *         •  •  •  •  •        ← Small arc particles (radial)
 *        ═══════════════       ← Expanding ring (discharge base)
 *            ○○○               ← Arc cluster at impact
 *
 * FEATURES:
 * - Layer 1: Central expanding arc-cluster (RADIAL cutout)
 * - Layer 2: 5 spark-spikes shooting UP and OUT (bolt arms)
 * - Layer 3: 8 arc-ring-small in radial burst (discharge fragments)
 * - Layer 4: 12 tiny spark-node particles (spark spray)
 * - Layer 5: arc-cluster at impact base
 * - TRUE BLAST: centered burst, not trailing
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICBLAST_CONFIG = {
    name: 'electricblast',
    emoji: '💥',
    type: 'blending',
    description: 'Explosive electrical discharge burst',
    duration: 1000,
    beats: 2,
    intensity: 1.5,
    category: 'electrocute',

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Central expanding arc-cluster — the discharge core
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.2, endScale: 2.0,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.3, models: ['arc-cluster'],
            animation: {
                appearAt: 0.0, disappearAt: 0.4,
                enter: { type: 'scale', duration: 0.05, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 2, scale: 1.5, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeOut'
                },
                grain: { type: 3, strength: 0.4, scale: 0.25, speed: 3.0, blend: 'multiply' },
                blending: 'additive', renderOrder: 8,
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                modelOverrides: {
                    'arc-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 5 spark-spikes shooting UP and OUT — bolt arms
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.3, endScale: 1.6, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 1.0, models: ['spark-spike'],
            animation: {
                appearAt: 0.0, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.03, geometryStability: true },
                cutout: { strength: 0.5, primary: { pattern: 1, scale: 1.0, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 1.2, strengthCurve: 'fadeOut' },
                drift: { speed: 1.4, distance: 0.8, direction: { x: 0, y: 1.0, z: 0 }, easing: 'easeOutQuad' },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'spark-spike': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.25, endScale: 1.3, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.9, models: ['spark-spike'],
            animation: {
                appearAt: 0.02, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                cutout: { strength: 0.5, primary: { pattern: 8, scale: 0.8, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                drift: { speed: 1.3, distance: 0.75, direction: { x: -0.7, y: 0.85, z: 0 }, easing: 'easeOutQuad' },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'spark-spike': { shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.25, endScale: 1.3, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.9, models: ['spark-spike'],
            animation: {
                appearAt: 0.02, disappearAt: 0.5,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                cutout: { strength: 0.5, primary: { pattern: 8, scale: 0.8, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.8, strengthCurve: 'fadeOut' },
                drift: { speed: 1.3, distance: 0.75, direction: { x: 0.7, y: 0.85, z: 0 }, easing: 'easeOutQuad' },
                blending: 'additive', renderOrder: 12,
                modelOverrides: { 'spark-spike': { shaderAnimation: { type: 1, arcWidth: 0.9, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.2, endScale: 1.1, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.8, models: ['spark-spike'],
            animation: {
                appearAt: 0.03, disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                cutout: { strength: 0.5, primary: { pattern: 1, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 1.0, strengthCurve: 'fadeOut' },
                drift: { speed: 1.1, distance: 0.6, direction: { x: -0.95, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                blending: 'additive', renderOrder: 11,
                modelOverrides: { 'spark-spike': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: 0, z: 0.05 }, orientation: 'camera', startScale: 0.2, endScale: 1.1, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.8, models: ['spark-spike'],
            animation: {
                appearAt: 0.03, disappearAt: 0.45,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
                cutout: { strength: 0.5, primary: { pattern: 1, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'vertical', travelSpeed: 1.0, strengthCurve: 'fadeOut' },
                drift: { speed: 1.1, distance: 0.6, direction: { x: 0.95, y: 0.5, z: 0 }, easing: 'easeOutQuad' },
                blending: 'additive', renderOrder: 11,
                modelOverrides: { 'spark-spike': { shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: 8 arc-ring-small — discharge fragments (radial burst)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8, radius: 0.05, endRadius: 0.65,
                angleSpread: 360, startAngle: 22,
                orientation: 'camera',
                startScale: 0.2, endScale: 0.9,
                scaleEasing: 'easeOutQuad'
            },
            count: 8, scale: 0.5, models: ['arc-ring-small'],
            animation: {
                appearAt: 0.02, disappearAt: 0.4, stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.02, geometryStability: true },
                cutout: { strength: 0.4, primary: { pattern: 3, scale: 0.7, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 1.0, strengthCurve: 'fadeOut' },
                scaleVariance: 0.3, lifetimeVariance: 0.15,
                blending: 'additive', renderOrder: 14,
                modelOverrides: { 'arc-ring-small': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 4: 12 tiny spark-node particles — spark spray
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 12, radius: 0.03, endRadius: 0.5,
                angleSpread: 360, startAngle: 0,
                orientation: 'camera',
                startScale: 0.1, endScale: 0.35,
                scaleEasing: 'easeOutQuad'
            },
            count: 12, scale: 0.2, models: ['spark-node'],
            animation: {
                appearAt: 0.01, disappearAt: 0.3, stagger: 0.005,
                enter: { type: 'scale', duration: 0.02, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                cutout: { strength: 0.3, primary: { pattern: 7, scale: 0.5, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 1.5, strengthCurve: 'fadeOut' },
                scaleVariance: 0.5, lifetimeVariance: 0.25,
                blending: 'additive', renderOrder: 16,
                modelOverrides: { 'spark-node': { shaderAnimation: { type: 1, arcWidth: 0.98, arcSpeed: 0, arcCount: 1 }, orientationOverride: 'camera' } }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 5: Arc cluster at base — impact core
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: { landmark: 'center', offset: { x: 0, y: -0.1, z: 0.12 }, orientation: 'camera', startScale: 0.2, endScale: 0.9, scaleEasing: 'easeOutQuad' },
            count: 1, scale: 0.6, models: ['arc-cluster'],
            animation: {
                appearAt: 0.05, disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.25, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.05, geometryStability: true },
                cutout: { strength: 0.5, primary: { pattern: 8, scale: 1.2, weight: 1.0 }, blend: 'multiply', travel: 'radial', travelSpeed: 0.5, strengthCurve: 'constant' },
                pulse: { amplitude: 0.1, frequency: 10, easing: 'easeInOut' },
                blending: 'additive', renderOrder: 6,
                modelOverrides: { 'arc-cluster': { shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 2 }, orientationOverride: 'camera' } }
            }
        }
    ],

    // Violent jitter from blast
    jitterFrequency: 60,
    jitterAmplitude: 0.02,
    jitterDecay: 0.25,
    glowColor: [0.4, 0.9, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.5,
    glowFlickerRate: 15,
    scaleVibration: 0.04,
    scaleFrequency: 10,
    scaleGrowth: 0.02
};

export default buildElectricEffectGesture(ELECTRICBLAST_CONFIG);
