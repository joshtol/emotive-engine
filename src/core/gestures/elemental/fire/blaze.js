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
    duration: 1800,
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
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'feet',
                end: 'center',
                easing: 'easeOut',
                startScale: 1.0,
                endScale: 0.7,
                startDiameter: 0.8,
                endDiameter: 1.4,
                orientation: 'radial'           // Point outward like star rays
            },
            formation: {
                type: 'spiral',
                count: 6,
                spacing: 0.15,
                arcOffset: 60,
                phaseOffset: 0
            },
            count: 6,
            scale: 3.0,
            // Mix of 3 different fire models for variety
            models: ['ember-cluster', 'flame-wisp', 'ember-cluster', 'ember-cluster', 'flame-wisp', 'flame-wisp'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.75,
                stagger: 0.12,                    // More staggered appearance
                staggerExit: 0.10,                // More staggered exit
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
                drift: {
                    direction: 'up',
                    distance: 0.4,                // Reduced drift distance
                    noise: 0.25                   // Much more erratic drift
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
                    intensity: 0.6,               // Very high flicker
                    rate: 30,                     // Extremely fast flicker
                    pattern: 'random'             // Random for chaos
                },
                pulse: {
                    amplitude: 0.55,              // Very big pulses
                    frequency: 8,                 // Much faster pulsing
                    easing: 'linear',             // Linear for jittery feel
                    perElement: true              // Each pulses independently
                },
                emissive: {
                    min: 2.5,             // Brighter base
                    max: 8.0,             // Much brighter peaks
                    frequency: 12,        // Very fast emissive changes
                    pattern: 'random'     // Random for erratic brightness
                },
                // Two-layer cutout: DISSOLVE + EMBERS for edge erosion
                // tip-boost mask ensures tips get eroded from the start
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 7, scale: 0.8, weight: 1.0 },    // DISSOLVE - erodes from edges
                    secondary: { pattern: 5, scale: 1.2, weight: 0.6 },  // EMBERS - burning holes
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 6.0,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.6,      // Peak slightly late
                    bellWidth: 0.4,       // Moderate plateau
                    // Boost erosion at tips while keeping body dissolve intact
                    geometricMask: {
                        type: 'tip-boost',
                        core: 0.0,        // Full boost at very tip
                        tip: 0.15         // Transition zone
                    }
                },
                // Grain: very subtle film grain texture
                grain: {
                    type: 3,              // FILM - cinematic grain
                    strength: 0.03,       // Barely visible
                    scale: 0.1,
                    speed: 0.3,
                    blend: 'multiply'
                },
                // Per-gesture atmospheric particles: smoke from blazing column
                atmospherics: [{
                    preset: 'smoke',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                }],
                rotate: [
                    { axis: 'y', rotations: 2.3, phase: 0 },
                    { axis: 'y', rotations: -1.7, phase: 67 },
                    { axis: 'y', rotations: 3.1, phase: 155 },
                    { axis: 'y', rotations: -2.2, phase: 98 },
                    { axis: 'y', rotations: 1.4, phase: 233 },
                    { axis: 'y', rotations: -2.8, phase: 301 }
                ],
                // Scale variation for each petal - wide range for organic variety
                scalePerElement: [1.6, 0.65, 1.4, 0.7, 1.5, 0.68],
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
