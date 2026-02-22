/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Sprout Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Sprout gesture - new growth emerging, shoots appearing
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/sprout
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Sprout gesture configuration
 * Fresh shoots and new growth emerging from the mascot surface
 */
const CONFIG = {
    name: 'sprout',
    emoji: '🌱',
    type: 'blending',
    description: 'New growth emerging, shoots appearing',
    duration: 2800,
    beats: 4,
    intensity: 0.6,
    category: 'emanating',
    growth: 0.5,

    // Nature-specific parameters
    sproutCount: 5,
    sproutSpeed: 0.4,
    freshGrowth: true,

    // 3D Element spawning - leaves and tendrils sprouting upward
    spawnMode: {
        type: 'surface',
        pattern: 'crown',
        embedDepth: 0.15,
        cameraFacing: 0.3,
        clustering: 0.2,
        count: 6,
        scale: 1.0,
        models: ['leaf-bunch', 'vine-cluster', 's-vine'],
        minDistance: 0.18,
        animation: {
            appearAt: 0.1,
            disappearAt: 0.88,
            stagger: 0.05,
            enter: { type: 'grow', duration: 0.12, easing: 'easeOutCubic' },
            exit: { type: 'fade', duration: 0.12, easing: 'easeIn' },
            pulse: { amplitude: 0.08, frequency: 2.5, easing: 'easeInOut' },
            emissive: { min: 0.5, max: 0.85, frequency: 2.5, pattern: 'sine' },
            drift: { direction: 'up', speed: 0.012, noise: 0.08 },
            scaleVariance: 0.18,
            lifetimeVariance: 0.12,
            blending: 'normal',
            renderOrder: 7,
            intensityScaling: { scale: 1.18, emissiveMax: 1.2 }
        }
    },

    // Glow - bright spring green
    glowColor: [0.5, 0.9, 0.35],
    glowIntensityMin: 0.6,
    glowIntensityMax: 0.95,
    glowFlickerRate: 4,

    // Scale dynamics - upward growth
    scaleVibration: 0.018,
    scaleFrequency: 3,
    scaleGrow: 0.025,

    // Rising motion
    riseAmount: 0.008,
    riseSpeed: 0.6,
    decayRate: 0.18,

    // Post-processing
    cutout: {
        primary: { pattern: 'sprout', scale: 3.5, blend: 'multiply', travelSpeed: 0.35 },
        secondary: { pattern: 'organic', scale: 6.0, blend: 'overlay', travelSpeed: 0.2 }
    },
    grain: { type: 3, strength: 0.03, blend: 'multiply', speed: 0.4 }
};

export default buildNatureEffectGesture(CONFIG);
