/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Glitch Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric glitch gesture - digital corruption, erratic displacement
 * @module gestures/destruction/elemental/electricglitch
 *
 * VISUAL DIAGRAM:
 *        ·⚡·
 *       · ★ ·       ← Very few sparks, erratic timing
 *        ·⚡·         Big position jumps, frame holds
 *
 * FEATURES:
 * - Surface/scattered spawn: sparse glitchy spark placement
 * - Ephemeral erratic: very short flashes with random gaps
 * - Big position jumps with frame freezes (holdFrames)
 * - VORONOI cutout for cell boundary spark zones
 * - STREAKS secondary for directional interference
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICGLITCH_CONFIG = {
    name: 'glitch',
    emoji: '📺',
    type: 'blending',
    description: 'Digital corruption, static displacement',
    duration: 1800,
    beats: 3,
    intensity: 0.7,
    category: 'electrocute',

    spawnMode: {
        type: 'surface',
        pattern: 'scattered',
        embedDepth: 0.15,
        cameraFacing: 0.5,
        clustering: 0.4,
        count: 2,
        scale: 0.7,
        models: ['spark-node'],
        minDistance: 0.25,
        ephemeral: {
            lifetime: { min: 25, max: 80 },
            flashIn: 8,
            fadeOut: 15,
            respawn: true,
            respawnDelay: { min: 80, max: 400 }
        },
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: { type: 'flash', duration: 0.005, easing: 'linear' },
            exit: { type: 'flash', duration: 0.01, easing: 'linear' },
            flicker: { intensity: 0.4, rate: 20, pattern: 'random' },
            emissive: { min: 0.8, max: 2.5, frequency: 15, pattern: 'random', dutyCycle: 0.4 },
            cutout: {
                strength: 0.5,
                primary: { pattern: 3, scale: 1.0, weight: 0.65 },
                secondary: { pattern: 1, scale: 0.7, weight: 0.35 },
                blend: 'multiply',
                travel: 'oscillate',
                travelSpeed: 1.5,
                strengthCurve: 'bell'
            },
            grain: { type: 3, strength: 0.2, scale: 0.35, speed: 2.0, blend: 'multiply' },
            scaleVariance: 0.5,
            lifetimeVariance: 0.6,
            delayVariance: 0.4,
            blending: 'additive',
            renderOrder: 15,
            intensityScaling: { scale: 1.1, flickerIntensity: 1.3, emissiveMax: 1.5 }
        }
    },

    // Jitter - big irregular jumps
    jitterFrequency: 20,
    jitterAmplitude: 0.04,
    jitterDecay: 0.5,
    // Glow - flickering static
    glowColor: [0.4, 0.8, 1.0],
    glowIntensityMin: 0.5,
    glowIntensityMax: 2.0,
    glowFlickerRate: 15,
    // Scale vibration - asymmetric
    scaleVibration: 0.04,
    scaleFrequency: 12,
    // Glitch-specific
    holdFrames: true,
    holdProbability: 0.15,
    holdDuration: 0.05
};

export default buildElectricEffectGesture(ELECTRICGLITCH_CONFIG);
