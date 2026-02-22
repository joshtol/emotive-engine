/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Flourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Flourish gesture - lush vegetation spreading, abundant growth
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/flourish
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Flourish gesture configuration
 * Abundant vegetation spreading outward with layered organic growth
 */
const CONFIG = {
    name: 'flourish',
    emoji: '🌳',
    type: 'blending',
    description: 'Lush vegetation spreading, abundant growth',
    duration: 3500,
    beats: 5,
    intensity: 1.1,
    category: 'emanating',
    growth: 0.9,

    // Nature-specific parameters
    vegetationDensity: 0.8,
    spreadRate: 0.5,
    layeredGrowth: true,

    // 3D Element spawning - dense multi-model vegetation shell
    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.15,
        cameraFacing: 0.3,
        clustering: 0.1,
        count: 12,
        scale: 1.0,
        models: ['vine-cluster', 'leaf-bunch', 's-vine', 'vine-twist'],
        minDistance: 0.12,
        animation: {
            appearAt: 0.08,
            disappearAt: 0.9,
            stagger: 0.035,
            enter: { type: 'grow', duration: 0.1, easing: 'easeOutBack', overshoot: 1.15 },
            exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
            pulse: { amplitude: 0.1, frequency: 2, easing: 'easeInOut', sync: 'global' },
            emissive: { min: 0.55, max: 0.95, frequency: 2, pattern: 'sine' },
            drift: { direction: 'outward', speed: 0.01, noise: 0.1 },
            rotate: { axis: 'y', speed: 0.01, oscillate: true, range: Math.PI / 10 },
            scaleVariance: 0.2,
            lifetimeVariance: 0.12,
            blending: 'normal',
            renderOrder: 8,
            intensityScaling: { scale: 1.25, emissiveMax: 1.3 }
        }
    },

    // Glow - rich forest green
    glowColor: [0.3, 0.8, 0.3],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
    glowFlickerRate: 3,

    // Scale dynamics - expanding growth
    scaleVibration: 0.025,
    scaleFrequency: 2,
    scaleGrow: 0.05,
    scalePulse: true,

    // Organic tremor and rotation
    tremor: 0.003,
    tremorFrequency: 4,
    rotationSpeed: 0.03,
    decayRate: 0.15,

    // Post-processing
    cutout: {
        primary: { pattern: 'leaf', scale: 3.0, blend: 'multiply', travelSpeed: 0.3 },
        secondary: { pattern: 'organic', scale: 5.0, blend: 'overlay', travelSpeed: 0.2 }
    },
    grain: { type: 3, strength: 0.03, blend: 'multiply', speed: 0.35 }
};

export default buildNatureEffectGesture(CONFIG);
