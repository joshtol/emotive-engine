/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Static Discharge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric static discharge - low-level ambient sparks
 * @module gestures/destruction/elemental/electricstatic
 *
 * VISUAL DIAGRAM:
 *          ·
 *        · ★ ·        ← Very sparse, occasional pop sparks
 *          ·            Long gaps between discharges
 *
 * FEATURES:
 * - Surface/scattered spawn: random sparse sparks
 * - Ephemeral occasional: brief pop then long wait
 * - Minimal jitter, barely perceptible (low-energy powered)
 * - VORONOI cutout for spark discharge cell zones
 * - CELLULAR secondary for ambient static patterns
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICSTATIC_CONFIG = {
    name: 'staticDischarge',
    emoji: '⚡',
    type: 'blending',
    description: 'Low-level static electricity, ambient sparks',
    duration: 1500,
    beats: 2,
    intensity: 0.4,
    category: 'powered',

    spawnMode: {
        type: 'surface',
        pattern: 'scattered',
        embedDepth: 0.15,
        cameraFacing: 0.35,
        clustering: 0.3,
        count: 2,
        scale: 0.6,
        models: ['spark-node'],
        minDistance: 0.3,
        ephemeral: {
            lifetime: { min: 40, max: 100 },
            flashIn: 10,
            fadeOut: 30,
            respawn: true,
            stagger: 200,
            respawnDelay: { min: 250, max: 600 }
        },
        animation: {
            appearAt: 0.05,
            disappearAt: 0.92,
            stagger: 0.03,
            enter: { type: 'flash', duration: 0.008, easing: 'linear' },
            exit: { type: 'fade', duration: 0.05, easing: 'easeOut' },
            emissive: { min: 0.6, max: 1.5, frequency: 20, pattern: 'random', dutyCycle: 0.3 },
            cutout: {
                strength: 0.35,
                primary: { pattern: 3, scale: 0.8, weight: 0.6 },
                secondary: { pattern: 0, scale: 0.6, weight: 0.4 },
                blend: 'multiply',
                travel: 'oscillate',
                travelSpeed: 0.8,
                strengthCurve: 'bell'
            },
            grain: { type: 3, strength: 0.1, scale: 0.45, speed: 1.5, blend: 'multiply' },
            // Per-gesture atmospheric particles: static ionized air
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'around',
                intensity: 0.08,
                sizeScale: 0.8,
                progressCurve: 'sustain',
            }],
            scaleVariance: 0.3,
            lifetimeVariance: 0.4,
            blending: 'additive',
            renderOrder: 10,
            intensityScaling: { scale: 1.0, emissiveMax: 1.2 }
        }
    },

    // Very minimal jitter - occasional twitch
    jitterFrequency: 5,
    jitterAmplitude: 0.002,
    jitterDecay: 0.4,
    // Glow - subtle
    glowColor: [0.5, 0.8, 1.0],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.3,
    glowFlickerRate: 20,
    // Scale - barely perceptible
    scaleVibration: 0.005,
    scaleFrequency: 8,
    scalePulse: false,
    sparkBursts: true,
    sparkProbability: 0.1
};

export default buildElectricEffectGesture(ELECTRICSTATIC_CONFIG);
