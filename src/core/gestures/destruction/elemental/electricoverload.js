/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Overload Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric overload gesture - intense buildup to extreme shock
 * @module gestures/destruction/elemental/electricoverload
 *
 * VISUAL DIAGRAM:
 *      ⚡⚡⚡⚡⚡⚡⚡
 *     ⚡  ★★★  ⚡     ← Full shell coverage, arcs everywhere
 *      ⚡⚡⚡⚡⚡⚡⚡       Builds from small sparks to intense bolts
 *
 * FEATURES:
 * - Surface/shell spawn: full coverage for overload effect
 * - Ephemeral with progression: brief sparks → sustained arcs over 2500ms
 * - Extreme jitter and vibration (most intense electrocute)
 * - CRACKS cutout for branching electrical breakdown
 * - EMBERS secondary for dissipating sparks
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICOVERLOAD_CONFIG = {
    name: 'overload',
    emoji: '💥',
    type: 'blending',
    description: 'Intense charge buildup, extreme shock',
    duration: 2500,
    beats: 4,
    intensity: 2.0,
    category: 'electrocute',

    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.1,
        cameraFacing: 0.35,
        clustering: 0.2,
        count: 12,
        scale: 1.1,
        models: ['arc-small', 'arc-medium', 'arc-cluster', 'spark-node'],
        minDistance: 0.1,
        ephemeral: {
            lifetime: { min: 80, max: 150 },
            flashIn: 15,
            fadeOut: 40,
            respawn: true,
            stagger: 30,
            progression: {
                duration: 2500,
                lifetime: [80, 150, 300, 600],
                flashIn: [15, 40],
                fadeOut: [40, 150],
                respawnDelay: [0, 30, 0, 0]
            }
        },
        animation: {
            appearAt: 0.02,
            disappearAt: 0.92,
            stagger: 0.015,
            enter: { type: 'flash', duration: 0.01, easing: 'linear' },
            exit: { type: 'flash', duration: 0.03, easing: 'linear' },
            flicker: { intensity: 0.6, rate: 35, pattern: 'random' },
            emissive: { min: 1.2, max: 4.0, frequency: 30, pattern: 'random', dutyCycle: 0.7 },
            cutout: {
                strength: 0.6,
                primary: { pattern: 8, scale: 1.0, weight: 0.7 },
                secondary: { pattern: 5, scale: 0.6, weight: 0.3 },
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 1.8,
                strengthCurve: 'fadeIn'
            },
            grain: { type: 3, strength: 0.3, scale: 0.25, speed: 2.5, blend: 'multiply' },
            flash: {
                events: [
                    { at: 0.30, intensity: 1.5 },
                    { at: 0.55, intensity: 2.5 },
                    { at: 0.75, intensity: 3.5 }
                ],
                decay: 0.02
            },
            scaleVariance: 0.35,
            lifetimeVariance: 0.4,
            blending: 'additive',
            renderOrder: 15,
            intensityScaling: { scale: 1.4, flickerIntensity: 1.6, emissiveMax: 2.0 }
        }
    },

    // Jitter - extreme shaking
    jitterFrequency: 80,
    jitterAmplitude: 0.03,
    jitterDecay: 0.1,
    // Glow - dramatic buildup
    glowColor: [0.5, 0.95, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 4.0,
    glowFlickerRate: 35,
    // Scale vibration - intense
    scaleVibration: 0.05,
    scaleFrequency: 50,
    // Buildup phase
    buildupPhase: 0.3,
    buildupGlowRamp: true
};

export default buildElectricEffectGesture(ELECTRICOVERLOAD_CONFIG);
