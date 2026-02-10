/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Iceshiver Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Iceshiver gesture - convulsive cold with frost forming on surface
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/iceshiver
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *        ❄  ❄
 *       ❄ ★ ❄      ← Frost crystals forming on surface
 *        ❄  ❄        mascot shivering from cold
 *
 * FEATURES:
 * - Small crystals scattered across mascot surface
 * - Rapid shiver/tremor on mascot mesh
 * - Frost slowly building up
 * - Multiple crystal models for variety
 * - Mascot is VICTIM of cold (afflicted category)
 *
 * USED BY:
 * - Taking cold damage
 * - Being chilled to the bone
 * - Hypothermia effects
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Iceshiver gesture configuration
 * Frost crystals forming on surface, mascot shivering
 */
const ICESHIVER_CONFIG = {
    name: 'iceshiver',
    emoji: '🥶',
    type: 'blending',
    description: 'Convulsive cold with frost forming on surface',
    duration: 2500,
    beats: 4,
    intensity: 0.9,
    category: 'afflicted',
    frost: 0.5,

    // 3D Element spawning - frost crystals on surface
    spawnMode: {
        type: 'surface',
        pattern: 'scattered',
        embedDepth: 0.1,
        cameraFacing: 0.3,
        clustering: 0.2,
        count: 8,
        scale: 0.9,
        models: ['crystal-small', 'crystal-medium', 'crystal-cluster'],
        minDistance: 0.1,
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.04,
            enter: {
                type: 'scale',
                duration: 0.12,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'fade',
                duration: 0.2,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                frost: {
                    start: 0.2,
                    peak: 0.6,
                    end: 0.3,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.12,
                frequency: 6,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 1.8,
                frequency: 8,
                pattern: 'sine'
            },
            scaleVariance: 0.35,
            lifetimeVariance: 0.25,
            delayVariance: 0.1,
            blending: 'normal',
            renderOrder: 10
        }
    },

    // Shiver - rapid tremor
    shiverAmount: 0.015,
    shiverFrequency: 14,
    // Glow - pale icy blue
    glowColor: [0.5, 0.75, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 10,
    // Scale - shivering vibration
    scaleVibration: 0.018,
    scaleFrequency: 10,
    scaleContract: 0.02,
    // Tremor
    tremor: 0.012,
    tremorFrequency: 14
};

/**
 * Iceshiver gesture - convulsive cold with surface frost.
 *
 * Uses surface spawn mode with scattered pattern:
 * - Small crystals placed on mascot surface
 * - Rapid shiver/tremor on mascot mesh
 * - No cutout - clean crystal models
 * - AFFLICTED: mascot is victim of cold
 */
export default buildIceEffectGesture(ICESHIVER_CONFIG);
