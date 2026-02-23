/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Charge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric charge gesture - building up electrical power
 * @module gestures/destruction/elemental/electriccharge
 *
 * VISUAL DIAGRAM:
 *         ⚡  ⚡
 *        ⚡ ★ ⚡      ← Sparks gathering upward (crown pattern)
 *         ⚡  ⚡        Growing intensity over 2500ms
 *          ↑↑↑
 *
 * FEATURES:
 * - Surface/crown spawn: energy gathering upward
 * - Ephemeral with progression: quick sparks → sustained arcs as power builds
 * - Upward drift and slight growth over duration
 * - RADIAL cutout for expanding discharge waves
 * - SPIRAL secondary for rotating energy vortex
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICCHARGE_CONFIG = {
    name: 'chargeUp',
    emoji: '🔋',
    type: 'blending',
    description: 'Building up electrical power, growing intensity',
    duration: 2500,
    beats: 4,
    intensity: 1.2,
    category: 'powered',

    spawnMode: {
        type: 'surface',
        pattern: 'crown',
        embedDepth: 0.1,
        cameraFacing: 0.4,
        clustering: 0.3,
        count: 6,
        scale: 1.0,
        models: ['spark-node', 'arc-small', 'arc-medium'],
        minDistance: 0.12,
        ephemeral: {
            lifetime: { min: 50, max: 100 },
            flashIn: 12,
            fadeOut: 30,
            respawn: true,
            stagger: 50,
            progression: {
                duration: 2500,
                lifetime: [50, 100, 400, 700],
                flashIn: [12, 60],
                fadeOut: [30, 200],
                respawnDelay: [0, 20, 100, 250]
            }
        },
        animation: {
            appearAt: 0.05,
            disappearAt: 0.92,
            stagger: 0.03,
            enter: { type: 'grow', duration: 0.04, easing: 'easeOutQuad' },
            exit: { type: 'flash', duration: 0.02, easing: 'linear' },
            pulse: { amplitude: 0.18, frequency: 3, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 0.6, max: 2.8, frequency: 4, pattern: 'sine' },
            drift: { direction: 'up', speed: 0.025, noise: 0.15 },
            rotate: { axis: 'y', speed: 0.08, oscillate: false },
            cutout: {
                strength: 0.45,
                primary: { pattern: 2, scale: 1.3, weight: 0.65 },
                secondary: { pattern: 6, scale: 0.7, weight: 0.35 },
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.2,
                strengthCurve: 'fadeIn'
            },
            grain: { type: 3, strength: 0.1, scale: 0.35, speed: 2.0, blend: 'multiply' },
            // Per-gesture atmospheric particles: ionized air from charge
            atmospherics: [{
                preset: 'ozone',
                targets: null,
                anchor: 'above',
                intensity: 0.1,
                sizeScale: 0.6,
                progressCurve: 'rampUp',
            }],
            scaleVariance: 0.25,
            lifetimeVariance: 0.2,
            blending: 'additive',
            renderOrder: 12,
            intensityScaling: { scale: 1.35, emissiveMax: 1.6, driftSpeed: 1.3 }
        }
    },

    // Minimal jitter - slight tremble at peak
    jitterFrequency: 30,
    jitterAmplitude: 0.005,
    jitterDecay: 0.2,
    // Glow - ramping up
    glowColor: [0.3, 0.95, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 3.0,
    glowFlickerRate: 12,
    // Scale - growing with power
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    scaleGrowth: 0.08,
    rampUp: true,
    riseAmount: 0.02
};

export default buildElectricEffectGesture(ELECTRICCHARGE_CONFIG);
