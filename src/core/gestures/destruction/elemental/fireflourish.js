/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireflourish Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireflourish gesture - flaming sword flourish with trailing arcs
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireflourish
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *                    ╱
 *                  ╱          ← Trailing flame arcs
 *                ╱              like a sword swing
 *              ╱   ★
 *            ╱
 *          ╱
 *
 * FEATURES:
 * - 5 vertical rings sweeping in an arc
 * - Heavy stagger creates trailing blade effect
 * - Partial arcs (not full rings) for sword-like appearance
 * - Sweeping from low to high like a sword flourish
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Theatrical fire displays
 * - Martial arts flame effects
 * - Sword flourish trails
 * - Combat celebration
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireflourish gesture configuration
 * Flaming sword flourish - trailing arcs sweep through space
 */
const FIREFLOURISH_CONFIG = {
    name: 'fireflourish',
    emoji: '⚔️',
    type: 'blending',
    description: 'Flaming sword flourish with trailing arcs',
    duration: 1500,             // Quick flourish
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.65,          // Hot orange-white

    // 3D Element spawning - sweeping arc
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',             // Start low
            end: 'above',               // Sweep high
            easing: 'easeOut',          // Fast start, slow finish (sword swing)
            startScale: 0.8,
            endScale: 1.0,
            startDiameter: 1.6,
            endDiameter: 1.8,
            orientation: 'vertical'     // Standing arcs like a blade
        },
        formation: {
            type: 'stack',
            count: 5,
            spacing: 0.12               // Close together for blade feel
        },
        count: 5,
        scale: 0.9,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.12,              // Heavy stagger for trailing effect
            enter: {
                type: 'fade',
                duration: 0.08,         // Very quick fade in
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.4,          // Longer fade for trail
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.6,
                    peak: 0.8,
                    end: 0.5,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.2,
                rate: 18,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.05,
                frequency: 8,
                easing: 'linear'
            },
            emissive: {
                min: 1.5,
                max: 3.0,
                frequency: 10,
                pattern: 'sine'
            },
            // Fast rotation for sword-spin effect
            rotate: { axis: 'y', rotations: 1.5, phase: 0 },
            scaleVariance: 0.08,
            lifetimeVariance: 0.15,     // More variance for organic trail
            blending: 'additive',
            renderOrder: 12,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.35,     // Narrow arc - blade-like
                        arcSpeed: 3.0,      // Fast internal animation
                        arcCount: 1         // Single arc (not full ring)
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Mesh effects - bright intense fire
    flickerFrequency: 15,
    flickerAmplitude: 0.01,
    flickerDecay: 0.15,
    glowColor: [1.0, 0.55, 0.15],   // Hot orange
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 12,
    scaleVibration: 0.012,
    scaleFrequency: 8,
    scaleGrowth: 0.015,
    rotationEffect: false
};

/**
 * Fireflourish gesture - flaming sword flourish.
 *
 * Uses axis-travel with stack formation:
 * - 5 vertical flame arcs sweeping from below to above
 * - Heavy stagger (0.12) creates trailing blade effect
 * - Narrow arcWidth (0.35) for sword-like appearance
 * - Fast swing motion with trailing fire
 */
export default buildFireEffectGesture(FIREFLOURISH_CONFIG);
