/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Crackle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric crackle gesture - rapid stuttering bolts on mascot surface
 * @module gestures/destruction/elemental/electriccrackle
 *
 * CONCEPT: Spark-spikes and arc-smalls on the mascot surface with aggressive
 * high-rate flicker (rate 20) and flash events that create actual crackling —
 * rapid on/off stuttering like static discharge.
 *
 * Uses spark-spike (underused model) for spiky crackle geometry.
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICCRACKLE_CONFIG = {
    name: 'crackle',
    emoji: '✨',
    type: 'blending',
    description: 'Rapid stuttering bolts crackling across surface',
    duration: 2000,
    beats: 3,
    intensity: 0.8,
    category: 'powered',

    spawnMode: {
        type: 'surface',
        pattern: 'spikes',
        embedDepth: 0.08,
        cameraFacing: 0.5,
        clustering: 0.3,
        count: 3,
        scale: 1.2,
        models: ['spark-spike', 'arc-small', 'spark-spike'],
        minDistance: 0.2,
        animation: {
            appearAt: 0.1,
            disappearAt: 0.85,
            stagger: 0.08,
            enter: { type: 'pop', duration: 0.015, easing: 'elasticOut', overshoot: 1.3 },
            exit: { type: 'fade', duration: 0.15, easing: 'easeOutCubic' },
            flicker: { intensity: 0.5, rate: 20, pattern: 'random' },
            emissive: { min: 0.8, max: 2.5, frequency: 8, pattern: 'sine' },
            cutout: {
                strength: 0.5,
                primary: { pattern: 8, scale: 1.2, weight: 0.7 },
                secondary: { pattern: 2, scale: 0.8, weight: 0.3 },
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 1.5,
                strengthCurve: 'fadeOut',
            },
            grain: { type: 3, strength: 0.15, scale: 0.4, speed: 2.0, blend: 'multiply' },
            // Per-gesture atmospheric particles: ionized air from crackle
            atmospherics: [
                {
                    preset: 'ozone',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.1,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                },
            ],
            flash: {
                events: [
                    { at: 0.2, intensity: 2.0 },
                    { at: 0.35, intensity: 1.5 },
                    { at: 0.5, intensity: 2.5 },
                    { at: 0.65, intensity: 1.0 },
                    { at: 0.75, intensity: 1.8 },
                ],
                decay: 0.015,
            },
            scaleVariance: 0.3,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 12,
        },
    },

    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    glowColor: [0.4, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 10,
    scaleVibration: 0.02,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.01,
};

export default buildElectricEffectGesture(ELECTRICCRACKLE_CONFIG);
