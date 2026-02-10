/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterliquefy Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterliquefy gesture - dramatic tears falling with dissolve trails
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterliquefy
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *
 *            ★              <- Mascot weeping
 *          💧  💧
 *         ↓    ↓
 *        💧 •  💧           <- Large and small tears
 *       ↓  •   ↓
 *      ···  · ···           <- Trail dissolve streaks
 *
 * FEATURES:
 * - Mixed large and small droplets falling
 * - Trail dissolve effect for emotional tear streaks
 * - Gravity easing (accelerating fall)
 * - DISSOLVE cutout that increases as tears fall
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Sadness/crying effects
 * - Melting visuals
 * - Emotional water reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterliquefy gesture configuration
 * Dramatic tears - mixed droplets with trail dissolve
 */
const WATERLIQUEFY_CONFIG = {
    name: 'liquefy',
    emoji: '💧',
    type: 'blending',
    description: 'Dramatic tears falling with dissolve trails',
    duration: 2200,
    beats: 3,
    intensity: 0.9,
    category: 'transform',
    turbulence: 0.4,

    // 3D Element spawning - two layers: large prominent tears + small accent drops
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Large dramatic tears
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'top',
                end: 'bottom',
                startOffset: 0.15,
                endOffset: -0.3,
                easing: 'easeInQuad',       // Gravity acceleration
                startScale: 0.5,
                endScale: 1.3,              // Grow as they fall
                startDiameter: 0.7,
                endDiameter: 1.1,
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 4,
                phaseOffset: 0.15
            },
            count: 4,
            scale: 1.1,
            models: ['droplet-large'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.9,
                stagger: 0.12,
                enter: { type: 'grow', duration: 0.12, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                // DISSOLVE cutout with trail
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 7, scale: 1.3, weight: 1.0 },    // DISSOLVE
                    secondary: { pattern: 0, scale: 0.5, weight: 0.25 }, // CELLULAR
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 1.8,
                    strengthCurve: 'fadeIn',
                    // Trail dissolve - emotional tear streaks
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.8
                    }
                },
                grain: { type: 3, strength: 0.25, scale: 0.2, speed: 2.0, blend: 'multiply' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },  // No rotation
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'droplet-large': {
                        shaderAnimation: { type: 3, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Small accent drops (faster, more numerous)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'top',
                end: 'bottom',
                startOffset: 0.05,
                endOffset: -0.15,
                easing: 'easeInCubic',      // Faster gravity
                startScale: 0.4,
                endScale: 0.9,
                startDiameter: 0.6,
                endDiameter: 0.9,
                orientation: 'camera'
            },
            formation: {
                type: 'ring',
                count: 6,
                phaseOffset: 0.1
            },
            count: 6,
            scale: 0.6,
            models: ['droplet-small'],
            animation: {
                appearAt: 0.08,
                disappearAt: 0.85,
                stagger: 0.08,
                enter: { type: 'grow', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 7, scale: 1.0, weight: 1.0 },
                    secondary: { pattern: 0, scale: 0.4, weight: 0.2 },
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 2.5,
                    strengthCurve: 'fadeIn',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.2
                    }
                },
                grain: { type: 3, strength: 0.2, scale: 0.15, speed: 2.5, blend: 'multiply' },
                rotate: { axis: 'z', rotations: 0, phase: 0 },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'additive',
                renderOrder: 10,
                modelOverrides: {
                    'droplet-small': {
                        shaderAnimation: { type: 3, arcWidth: 0.98, arcSpeed: 0, arcCount: 1 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    // Wobble - minimal for falling motion
    wobbleFrequency: 2,
    wobbleAmplitude: 0.006,
    wobbleDecay: 0.2,
    // Scale - subtle variation
    scaleWobble: 0.02,
    scaleFrequency: 3,
    // Glow - emotional blue
    glowColor: [0.25, 0.5, 0.9],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.6,
    glowPulseRate: 3
};

/**
 * Waterliquefy gesture - dramatic tears.
 *
 * Uses two-layer axis-travel:
 * - Layer 1: 4 large prominent tears falling slowly
 * - Layer 2: 6 small accent drops falling faster
 * - Both have trail dissolve for tear streak effect
 * - DISSOLVE+CELLULAR cutout increasing as they fall
 */
export default buildWaterEffectGesture(WATERLIQUEFY_CONFIG);
