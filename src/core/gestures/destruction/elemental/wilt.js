/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Wilt Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Wilt gesture - wilting and drooping, losing vitality
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/wilt
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Wilt gesture configuration
 * Plants wilting and drooping as vitality drains away
 */
const CONFIG = {
    name: 'wilt',
    emoji: '🥀',
    type: 'blending',
    description: 'Wilting and drooping, losing vitality',
    duration: 3500,
    beats: 5,
    intensity: 0.8,
    category: 'transform',
    growth: 0.3,

    // Nature-specific parameters
    wiltRate: 0.5,
    droopPattern: true,

    // 3D Element spawning - sparse wilting elements
    spawnMode: {
        type: 'surface',
        pattern: 'scattered',
        embedDepth: 0.1,
        cameraFacing: 0.2,
        clustering: 0.25,
        count: 5,
        scale: 0.9,
        models: ['leaf-bunch', 'u-vine', 'vine-cluster'],
        minDistance: 0.2,
        animation: {
            appearAt: 0.1,
            disappearAt: 0.85,
            stagger: 0.08,
            enter: { type: 'grow', duration: 0.15, easing: 'easeOutQuad' },
            exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
            pulse: { amplitude: 0.04, frequency: 1.0, easing: 'easeInOut' },
            emissive: { min: 0.25, max: 0.45, frequency: 1.5, pattern: 'sine' },
            drift: { direction: 'down', speed: 0.01, noise: 0.06 },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 6
        }
    },

    // Glow - faded yellow-green
    glowColor: [0.6, 0.65, 0.3],
    glowIntensityMin: 0.4,
    glowIntensityMax: 0.65,
    glowFlickerRate: 2,

    // Scale dynamics - shrinking decay
    scaleVibration: 0.012,
    scaleFrequency: 2,
    scaleShrink: 0.04,

    // Drooping motion
    droopAmount: 0.02,
    droopAcceleration: 0.4,

    // Tilting rotation
    rotationTilt: 0.05,
    rotationTiltSpeed: 0.3,

    // Fade out over time
    fadeOut: true,
    fadeStartAt: 0.5,
    fadeEndAt: 0.95,
    fadeCurve: 'smooth',
    decayRate: 0.18,

    // Post-processing
    cutout: {
        primary: { pattern: 'decay', scale: 4.0, blend: 'multiply', travelSpeed: 0.25 },
        secondary: { pattern: 'organic', scale: 6.0, blend: 'overlay', travelSpeed: 0.15 }
    },
    grain: { type: 3, strength: 0.04, blend: 'multiply', speed: 0.3 }
};

export default buildNatureEffectGesture(CONFIG);
