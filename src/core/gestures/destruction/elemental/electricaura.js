/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Aura Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric aura gesture - emanating energy field, radiating power
 * @module gestures/destruction/elemental/electricaura
 *
 * VISUAL DIAGRAM:
 *       ~ ~ ~ ~
 *      ~ ⚡★⚡ ~      ← Full shell of slow-roaming arcs
 *       ~ ~ ~ ~        Majestic, sustained aura field
 *
 * FEATURES:
 * - Surface/shell spawn: full coverage aura with many elements
 * - Ephemeral mix: slow roaming (long) + fast traveling (short)
 * - No jitter, slow majestic rotation (powered category)
 * - CELLULAR cutout for organic ambient static fields
 * - STREAKS secondary for directional energy flow
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICAURA_CONFIG = {
    name: 'electricAuraEffect',
    emoji: '💫',
    type: 'blending',
    description: 'Emanating energy field, radiating power',
    duration: 3000,
    beats: 4,
    intensity: 1.0,
    category: 'powered',

    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.1,
        cameraFacing: 0.3,
        clustering: 0.1,
        count: 10,
        scale: 1.0,
        models: ['arc-cluster', 'arc-medium', 'arc-small', 'spark-node'],
        minDistance: 0.08,
        ephemeral: {
            lifetime: { min: 100, max: 700 },
            flashIn: 35,
            fadeOut: 120,
            respawn: true,
            stagger: 100,
            respawnDelay: { min: 50, max: 200 }
        },
        animation: {
            appearAt: 0.08,
            disappearAt: 0.88,
            stagger: 0.04,
            enter: { type: 'fade', duration: 0.08, easing: 'easeOutQuad' },
            exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
            pulse: { amplitude: 0.12, frequency: 2, easing: 'easeInOut', sync: 'global' },
            flicker: { intensity: 0.15, rate: 8, pattern: 'sine' },
            emissive: { min: 0.9, max: 1.8, frequency: 2.5, pattern: 'sine' },
            drift: { direction: 'outward', speed: 0.012, noise: 0.1 },
            rotate: { axis: 'y', speed: 0.025, oscillate: false },
            cutout: {
                strength: 0.4,
                primary: { pattern: 0, scale: 1.0, weight: 0.6 },
                secondary: { pattern: 1, scale: 0.8, weight: 0.4 },
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 0.6,
                strengthCurve: 'constant'
            },
            grain: { type: 3, strength: 0.08, scale: 0.4, speed: 1.5, blend: 'multiply' },
            scaleVariance: 0.2,
            lifetimeVariance: 0.25,
            blending: 'additive',
            renderOrder: 10,
            intensityScaling: { scale: 1.2, emissiveMax: 1.4 }
        }
    },

    // No jitter
    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.3,
    // Glow - strong sustained
    glowColor: [0.5, 0.85, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowFlickerRate: 4,
    // Scale - subtle breathing
    scaleVibration: 0.015,
    scaleFrequency: 1.5,
    scalePulse: true,
    rotationDrift: 0.02,
    hover: true,
    hoverAmount: 0.01
};

export default buildElectricEffectGesture(ELECTRICAURA_CONFIG);
