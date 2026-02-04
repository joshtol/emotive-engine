/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Blaze Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Blaze gesture - flagship fire aura with pulsing flame star
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/blaze
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *         ✴️              ← Pulsing 5-point flame star
 *                           drifts upward as it pulses
 *
 * FEATURES:
 * - SINGLE SPAWN LAYER for flagship fire effect
 * - Pulsing flame-tongue star with upward drift
 * - Mascot is SOURCE of fire (radiating category)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Power-up fire aura
 * - Flagship fire effect
 * - Intense controlled burning
 * - Fire mastery display
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Blaze gesture configuration
 * Flagship fire aura with pulsing flame star
 */
const BLAZE_CONFIG = {
    name: 'blaze',
    emoji: '🔆',
    type: 'blending',
    description: 'Flagship fire aura with pulsing flame star',
    duration: 1200,
    beats: 3,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.75,

    // SINGLE LAYER for flagship fire effect
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Pulsing flame-tongue star (the hero element)
        // 5 flame-tongues in a star pattern with upward drift
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: -0.35,                  // Start near feet
                radius: 0.25,                   // Tight cluster
                plane: 'horizontal',
                orientation: 'radial'           // Point outward like star rays
            },
            formation: {
                type: 'ring',
                count: 5,
                startAngle: 0
            },
            count: 5,
            scale: 2.0,
            models: ['flame-tongue'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                stagger: 0.08,                    // Staggered appearance
                staggerExit: 0.06,                // Staggered exit
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'burst-fade',
                    duration: 0.18,
                    easing: 'easeInCubic',
                    burstScale: 1.2
                },
                // Drift upward during animation
                drift: {
                    direction: 'up',
                    distance: 0.8,
                    noise: 0.1
                },
                procedural: {
                    scaleSmoothing: 0.05,
                    geometryStability: true
                },
                parameterAnimation: {
                    temperature: {
                        start: 0.6,
                        peak: 0.85,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                flicker: {
                    intensity: 0.2,
                    rate: 8,
                    pattern: 'sine'
                },
                // Strong pulsing for dramatic star effect
                pulse: {
                    amplitude: 0.35,
                    frequency: 3,
                    easing: 'easeInOut',
                    perElement: true              // Each pulses independently
                },
                emissive: {
                    min: 2.5,
                    max: 4.5,
                    frequency: 3,
                    pattern: 'sine'
                },
                // Varied rotation speeds for each star point (reduced for triplet)
                rotate: [
                    { axis: 'y', rotations: 0.8, phase: 0 },
                    { axis: 'y', rotations: 0.5, phase: 72 },
                    { axis: 'y', rotations: 0.7, phase: 144 },
                    { axis: 'y', rotations: 0.4, phase: 216 },
                    { axis: 'y', rotations: 0.6, phase: 288 }
                ],
                // Varied scales for each star point
                scalePerElement: [1.0, 0.7, 0.85, 0.6, 0.75],
                blending: 'additive',
                renderOrder: 16
            }
        }
    ],

    // Mesh effects - powerful sustained glow
    flickerFrequency: 4,
    flickerAmplitude: 0.008,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.55, 0.12],    // Hot orange
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.0,
    glowFlickerRate: 5,
    scaleVibration: 0.015,
    scaleFrequency: 2,
    scalePulse: true,
    scaleGrowth: 0.03,
    hover: true,
    hoverAmount: 0.01
};

/**
 * Blaze gesture - flagship fire aura with pulsing flame star.
 *
 * Uses SINGLE SPAWN LAYER:
 * - 5 flame-tongues in star pattern with varied sizes/speeds
 * - Drifts upward while pulsing
 * - Staggered appearance and exit for dynamic feel
 *
 * Creates dramatic power aura with a bold flame star.
 */
export default buildFireEffectGesture(BLAZE_CONFIG);
