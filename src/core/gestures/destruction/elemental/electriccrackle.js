/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Crackle Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Electric crackle gesture - dramatic whip-crack lightning bolt
 * @module gestures/destruction/elemental/electriccrackle
 *
 * VISUAL DIAGRAM:
 *          ╲
 *        ★──╱     ← Big dramatic arc + aftershock
 *          ╲        Single whip crack, no respawn
 *
 * FEATURES:
 * - Surface/spikes spawn: dramatic outward arcs
 * - Ephemeral whip crack: ONE flash + aftershock, no respawn
 * - No jitter (powered category) - controlled energy
 * - CRACKS cutout for branching fracture patterns
 * - RADIAL secondary for expanding discharge wave
 */

import { buildElectricEffectGesture } from './electricEffectFactory.js';

const ELECTRICCRACKLE_CONFIG = {
    name: 'crackle',
    emoji: '✨',
    type: 'blending',
    description: 'Ambient electrical energy crackling across surface',
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
        count: 2,
        scale: 1.3,
        models: ['arc-medium', 'arc-cluster'],
        minDistance: 0.2,
        ephemeral: {
            lifetime: { min: 250, max: 400 },
            flashIn: 15,
            fadeOut: 150,
            respawn: false,
            initialDelay: 333,
            stagger: 100
        },
        animation: {
            appearAt: 0.15,
            disappearAt: 0.85,
            stagger: 0.05,
            enter: { type: 'pop', duration: 0.015, easing: 'elasticOut', overshoot: 1.3 },
            exit: { type: 'fade', duration: 0.15, easing: 'easeOutCubic' },
            pulse: { amplitude: 0.15, frequency: 4, easing: 'snap', sync: 'global' },
            emissive: { min: 0.8, max: 2.5, frequency: 6, pattern: 'sine' },
            cutout: {
                strength: 0.5,
                primary: { pattern: 8, scale: 1.2, weight: 0.7 },
                secondary: { pattern: 2, scale: 0.8, weight: 0.3 },
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 1.0,
                strengthCurve: 'fadeOut'
            },
            grain: { type: 3, strength: 0.1, scale: 0.4, speed: 1.5, blend: 'multiply' },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'additive',
            renderOrder: 12,
            intensityScaling: { scale: 1.25, emissiveMax: 1.5 }
        }
    },

    // No jitter - controlled energy
    jitterFrequency: 0,
    jitterAmplitude: 0,
    jitterDecay: 0.2,
    // Glow - pulsing with energy
    glowColor: [0.4, 0.9, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 8,
    // Scale breathing
    scaleVibration: 0.02,
    scaleFrequency: 2,
    scalePulse: true,
    rotationDrift: 0.01
};

export default buildElectricEffectGesture(ELECTRICCRACKLE_CONFIG);
