/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Shock Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric shock gesture - brief electric surge, mascot is victim
 * @module gestures/destruction/elemental/electricshock
 *
 * VISUAL DIAGRAM:
 *        ⚡   ⚡
 *      ⚡  ★  ⚡     ← Random arcs jumping across surface
 *        ⚡   ⚡       Rapid jitter, chaotic flicker
 *
 * FEATURES:
 * - Surface/scattered spawn: random arc placements
 * - Ephemeral arcs: flash in, hold briefly, fade out, respawn
 * - Violent jitter and rotation shake (electrocution category)
 * - STREAKS cutout for directional lightning bolt paths
 * - DISSOLVE secondary for dissipating charge
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICSHOCK_CONFIG = {
    name: 'shock',
    emoji: '⚡',
    type: 'blending',
    description: 'Brief electric surge - mascot is shocked',
    duration: 1200,
    beats: 2,
    intensity: 1.0,
    category: 'electrocute',

    spawnMode: {
        type: 'surface',
        pattern: 'scattered',
        embedDepth: 0.1,
        cameraFacing: 0.4,
        clustering: 0.35,
        count: 6,
        scale: 1.0,
        models: ['arc-small', 'spark-node', 'arc-medium'],
        minDistance: 0.12,
        ephemeral: {
            lifetime: { min: 100, max: 300 },
            flashIn: 30,
            fadeOut: 80,
            respawn: true
        },
        animation: {
            appearAt: 0.02,
            disappearAt: 0.95,
            stagger: 0.01,
            enter: { type: 'flash', duration: 0.01, easing: 'linear' },
            exit: { type: 'flash', duration: 0.02, easing: 'linear' },
            flicker: { intensity: 0.5, rate: 30, pattern: 'random' },
            emissive: { min: 1.0, max: 3.0, frequency: 25, pattern: 'random', dutyCycle: 0.6 },
            rotate: { axis: [1, 1, 0], speed: 0.5, oscillate: true, range: Math.PI / 3 },
            cutout: {
                strength: 0.55,
                primary: { pattern: 1, scale: 1.2, weight: 0.7 },
                secondary: { pattern: 7, scale: 0.8, weight: 0.3 },
                blend: 'multiply',
                travel: 'oscillate',
                travelSpeed: 2.5,
                strengthCurve: 'bell'
            },
            grain: { type: 3, strength: 0.25, scale: 0.3, speed: 3.0, blend: 'multiply' },
            flash: {
                events: [
                    { at: 0.15, intensity: 2.0 },
                    { at: 0.50, intensity: 3.0 }
                ],
                decay: 0.02
            },
            scaleVariance: 0.4,
            lifetimeVariance: 0.5,
            delayVariance: 0.2,
            blending: 'additive',
            renderOrder: 15,
            intensityScaling: { scale: 1.3, flickerIntensity: 1.5, emissiveMax: 1.8 }
        }
    },

    // Jitter - rapid violent shaking
    jitterFrequency: 60,
    jitterAmplitude: 0.015,
    jitterDecay: 0.3,
    // Glow - erratic cyan flicker
    glowColor: [0.3, 0.9, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 2.5,
    glowFlickerRate: 25,
    // Scale vibration
    scaleVibration: 0.03,
    scaleFrequency: 40
};

export default buildElectricEffectGesture(ELECTRICSHOCK_CONFIG);
