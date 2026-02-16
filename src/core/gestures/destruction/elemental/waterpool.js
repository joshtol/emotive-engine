/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterpool Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterpool gesture - submerging/sinking with contracting rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterpool
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *
 *      ═══════════════        <- Large outer ring shrinking
 *       ═════════════          <- Rings at different heights
 *           ★                 <- Mascot being submerged
 *       ═════════════
 *          ○ ○ ○              <- Rising bubbles
 *      ═══════════════
 *
 * FEATURES:
 * - Horizontal rings contracting around mascot at multiple heights
 * - Rising bubbles for underwater ambiance
 * - Creates "sinking into water" sensation
 * - WAVES + CELLULAR cutout for underwater texture
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Submersion effects
 * - Sinking/drowning visuals
 * - Deep water ambiance
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterpool gesture configuration
 * Submerging - contracting rings + rising bubbles
 */
const WATERPOOL_CONFIG = {
    name: 'pool',
    emoji: '🫗',
    type: 'blending',
    description: 'Submerging sensation with contracting water rings',
    duration: 2800,
    beats: 4,
    intensity: 0.7,
    category: 'transform',
    turbulence: 0.2,

    // 3D Element spawning - contracting rings at multiple heights + bubbles
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Upper contracting ring
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startOffset: 0.35,
                endOffset: 0.35,
                easing: 'easeInOutQuad',
                startScale: 1.4,
                endScale: 0.5,
                startDiameter: 3.2,
                endDiameter: 0.6,
                orientation: 'flat'
            },
            formation: { type: 'ring', count: 1 },
            count: 1,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.12, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.6, weight: 1.0 },
                    secondary: { pattern: 0, scale: 0.6, weight: 0.35 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: -0.8,
                    strengthCurve: 'fadeIn'
                },
                grain: { type: 3, strength: 0.25, scale: 0.3, speed: 0.8, blend: 'multiply' },
                rotate: { axis: 'y', rotations: 0.15, phase: 0 },
                pulse: { amplitude: 0.05, frequency: 1.5, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 5,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 5, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 }
                    }
                },
                // No atmospherics — pooling water, no violent splash
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Center contracting ring (main)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startOffset: 0,
                endOffset: 0,
                easing: 'easeInOutQuad',
                startScale: 1.5,
                endScale: 0.4,
                startDiameter: 3.5,
                endDiameter: 0.5,
                orientation: 'flat'
            },
            formation: { type: 'ring', count: 1 },
            count: 1,
            scale: 1.1,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.9,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.12, geometryStability: true },
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 4, scale: 1.5, weight: 1.0 },
                    secondary: { pattern: 0, scale: 0.7, weight: 0.4 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: -1.0,
                    strengthCurve: 'fadeIn'
                },
                grain: { type: 3, strength: 0.25, scale: 0.3, speed: 1.0, blend: 'multiply' },
                rotate: { axis: 'y', rotations: -0.12, phase: 45 },
                pulse: { amplitude: 0.06, frequency: 1.5, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 6,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 5, arcWidth: 0.9, arcSpeed: 0.5, arcCount: 2 }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Lower contracting ring
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'center',
                startOffset: -0.35,
                endOffset: -0.35,
                easing: 'easeInOutQuad',
                startScale: 1.3,
                endScale: 0.5,
                startDiameter: 3.0,
                endDiameter: 0.7,
                orientation: 'flat'
            },
            formation: { type: 'ring', count: 1 },
            count: 1,
            scale: 0.95,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.85,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.12, geometryStability: true },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 4, scale: 1.4, weight: 1.0 },
                    secondary: { pattern: 0, scale: 0.6, weight: 0.35 },
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: -0.9,
                    strengthCurve: 'fadeIn'
                },
                grain: { type: 3, strength: 0.25, scale: 0.3, speed: 0.8, blend: 'multiply' },
                rotate: { axis: 'y', rotations: 0.18, phase: 90 },
                pulse: { amplitude: 0.05, frequency: 1.5, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 4,
                modelOverrides: {
                    'splash-ring': {
                        shaderAnimation: { type: 5, arcWidth: 0.85, arcSpeed: 0.4, arcCount: 2 }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 4: Rising bubbles (contrast with sinking)
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'center',
                startOffset: -0.2,
                endOffset: 0.3,
                easing: 'easeOutQuad',
                startScale: 0.3,
                endScale: 0.8,
                startDiameter: 0.8,
                endDiameter: 1.2,
                orientation: 'camera'
            },
            formation: { type: 'ring', count: 4, phaseOffset: 0.15 },
            count: 4,
            scale: 0.5,
            models: ['bubble-cluster'],
            animation: {
                appearAt: 0.15,
                disappearAt: 0.8,
                stagger: 0.1,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                cutout: {
                    strength: 0.4,
                    primary: { pattern: 0, scale: 1.0, weight: 1.0 },
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 0.8,
                    strengthCurve: 'constant'
                },
                grain: { type: 3, strength: 0.15, scale: 0.25, speed: 1.5, blend: 'multiply' },
                pulse: { amplitude: 0.1, frequency: 3, easing: 'easeInOut' },
                blending: 'additive',
                renderOrder: 8,
                modelOverrides: {
                    'bubble-cluster': {
                        shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0.6, arcCount: 2 },
                        orientationOverride: 'camera'
                    }
                }
            }
        }
    ],

    // Wobble - gentle underwater motion
    wobbleFrequency: 1.5,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.35,
    // Scale - breathing
    scaleWobble: 0.012,
    scaleFrequency: 1.5,
    // Glow - deep water blue
    glowColor: [0.2, 0.45, 0.8],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.3,
    glowPulseRate: 1.5
};

/**
 * Waterpool gesture - submerging sensation.
 *
 * Uses four-layer spawn mode:
 * - Layer 1-3: Contracting rings at upper/center/lower heights
 * - Layer 4: Rising bubbles for underwater ambiance
 * - Creates "sinking into water" feeling
 * - SURFACE_SHIMMER for underwater caustics
 */
export default buildWaterEffectGesture(WATERPOOL_CONFIG);
