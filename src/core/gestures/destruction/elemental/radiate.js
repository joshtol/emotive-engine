/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Radiate Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Radiate gesture - expanding flame rings radiating outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/radiate
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *         ═══════            ← Rings at center height
 *        ╱       ╲
 *       │    ★    │          ← 3 vertical rings at 120° apart
 *        ╲       ╱             expanding diameter as they rise
 *         ═══════
 *
 * FEATURES:
 * - 3 flame rings with vertical orientation
 * - Rings travel from below center to above
 * - Expanding diameter creates radiating effect
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Warmth/comfort effects
 * - Ambient fire aura
 * - Heat wave emanation
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Radiate gesture configuration
 * Expanding flame rings radiating outward
 */
const RADIATE_CONFIG = {
    name: 'radiate',
    emoji: '☀️',
    type: 'blending',
    description: 'Expanding flame rings radiating outward',
    duration: 3000,
    beats: 4,
    intensity: 0.8,
    category: 'radiating',
    temperature: 0.4,

    // 3D Element spawning - RADIATING rings at feet level
    // Key visual: flaming coins circling at mascot's feet, expanding outward
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',              // Spawn at feet
            end: 'bottom',                // STAY at feet (no vertical travel)
            easing: 'linear',
            startScale: 1.2,
            endScale: 1.8,                // Grow slightly as they radiate
            startDiameter: 1.2,           // Start circling close to mascot
            endDiameter: 3.5,             // Expand outward dramatically
            orientation: 'vertical'       // Standing rings (coins)
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,               // 3 rings at 120° apart
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.70,            // Fade as they radiate out
            stagger: 0.03,                // Near-simultaneous spawn
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.30,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.7,           // Hot at center
                    peak: 0.6,
                    end: 0.35,            // Cool as they radiate out
                    curve: 'linear'
                }
            },
            flicker: {
                intensity: 0.25,
                rate: 10,
                pattern: 'smooth'
            },
            pulse: {
                amplitude: 0.12,
                frequency: 3,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 2.8,
                frequency: 4,
                pattern: 'sine'
            },
            // Coins spinning as they circle and radiate
            rotate: [
                { axis: 'y', rotations: 1.5, phase: 0 },
                { axis: 'y', rotations: 1.5, phase: 120 },
                { axis: 'y', rotations: 1.5, phase: 240 }
            ],
            scaleVariance: 0.1,
            lifetimeVariance: 0.05,
            blending: 'additive',
            renderOrder: 8,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,          // CRITICAL: must be 1
                        arcWidth: 0.8,    // Fuller rings
                        arcSpeed: 0.8,
                        arcCount: 1       // CRITICAL: must be >= 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Mesh effects
    flickerFrequency: 8,
    flickerAmplitude: 0.01,
    flickerDecay: 0.2,
    glowColor: [1.0, 0.7, 0.3],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scaleGrowth: 0.02,
    rotationEffect: true,
    rotationSpeed: 0.3
};

/**
 * Radiate gesture - expanding flame rings radiating outward.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 flame-ring models travel from below to above
 * - Rings are VERTICAL (orientation: 'vertical')
 * - Expanding diameter creates radiating heat wave effect
 * - 120° arcOffset spreads rings around the mascot
 */
export default buildFireEffectGesture(RADIATE_CONFIG);
