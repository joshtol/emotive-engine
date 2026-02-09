/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterpillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterpillar gesture - majestic rising pillar of stacked water rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterpillar
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Layer 3: Top rings (RIPPLES, oscillate)
 *         ═══════════
 *          ═════════         ← Layer 2: Middle rings (CELLULAR, radial)
 *           ═══════
 *            ═════           ← Layer 1: Bottom rings (WAVES, angular)
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations
 * - Layer 1: 2 bottom rings with WAVES + angular travel
 * - Layer 2: 2 middle rings with CELLULAR + radial travel
 * - Layer 3: 2 top rings with RIPPLES + oscillate travel
 * - Each layer animates differently to break uniformity
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of water effects
 * - Divine/summoning power
 * - Majestic water displays
 * - Ascending power themes
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

// Shared animation base for all layers
const SHARED_ANIMATION = {
    appearAt: 0.0,
    disappearAt: 0.7,
    enter: {
        type: 'scale',
        duration: 0.2,
        easing: 'easeOut'
    },
    exit: {
        type: 'burst-fade',
        duration: 0.4,
        easing: 'easeIn',
        burstScale: 1.2,
        burstDirection: 'up'
    },
    procedural: {
        scaleSmoothing: 0.1,
        geometryStability: true
    },
    parameterAnimation: {
        turbulence: {
            start: 0.15,
            peak: 0.3,
            end: 0.2,
            curve: 'bell'
        }
    },
    pulse: {
        amplitude: 0.08,
        frequency: 3,
        easing: 'easeInOut',
        perElement: true,
        phaseOffset: 30
    },
    // Grain: cinematic film grain for realistic water pillar
    grain: {
        type: 3,              // FILM - perlin + white hybrid
        strength: 0.3,
        scale: 0.35,
        speed: 0.6,
        blend: 'multiply'
    },
    // Slow upward drift - enhances rising sensation
    drift: {
        speed: 0.15,
        distance: 0.08,
        direction: { x: 0, y: 1, z: 0 },
        easing: 'easeOut'
    },
    // Gentle tilt wobble - majestic swaying
    tilt: {
        axis: 'x',
        oscillate: true,
        range: 0.08,
        speed: 1.5,
        perElement: true,
        phaseOffset: 15
    },
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 15,
    modelOverrides: {
        'splash-ring': {
            shaderAnimation: {
                type: 1,
                arcWidth: 0.95,
                arcSpeed: 0.8,
                arcCount: 3
            }
        }
    }
};

/**
 * Waterpillar gesture configuration
 * Majestic rising pillar of stacked water rings - THREE LAYERS
 */
const WATERPILLAR_CONFIG = {
    name: 'waterpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of water',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    category: 'ambient',
    turbulence: 0.25,

    // THREE LAYERS - each with different cutout to break uniformity
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Bottom 2 rings - WAVES pattern, angular travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',
                startOffset: 0          // Bottom layer (positions 0, 0.25)
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                // WAVES + CELLULAR - flowing ripples
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 4, scale: 1.4, weight: 1.0 },    // WAVES
                    secondary: { pattern: 0, scale: 0.8, weight: 0.35 }, // CELLULAR
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.0,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.2
                    }
                },
                // Layer 1: Slow clockwise spin
                rotate: [
                    { axis: 'z', rotations: 0.3, phase: 0 },
                    { axis: 'z', rotations: 0.3, phase: 180 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Middle 2 rings - CELLULAR pattern, radial travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',
                startOffset: 0.5        // Middle layer (positions 0.5, 0.75)
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                // CELLULAR + RIPPLES - organic bubbling
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 0, scale: 1.2, weight: 1.0 },    // CELLULAR
                    secondary: { pattern: 1, scale: 1.5, weight: 0.5 },  // RIPPLES
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 0.5,
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.0
                    }
                },
                // Layer 2: Medium counter-clockwise spin
                rotate: [
                    { axis: 'z', rotations: -0.5, phase: 60 },
                    { axis: 'z', rotations: -0.5, phase: 240 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings - RIPPLES pattern, oscillate travel
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'below',
                end: 'above',
                easing: 'easeOut',
                startScale: 0.6,
                endScale: 1.3,
                startDiameter: 1.2,
                endDiameter: 2.2,
                orientation: 'flat',
                startOffset: 1.0        // Top layer (positions 1.0, 1.25)
            },
            formation: {
                type: 'stack',
                count: 2,
                spacing: 0.25
            },
            count: 2,
            scale: 1.0,
            models: ['splash-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                // RIPPLES + DISSOLVE - dispersing spray
                cutout: {
                    strength: 0.65,
                    primary: { pattern: 1, scale: 1.8, weight: 1.0 },    // RIPPLES
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },  // DISSOLVE
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    trailDissolve: {
                        enabled: true,
                        offset: -0.3,
                        softness: 0.8
                    }
                },
                // Layer 3: Fast clockwise spin
                rotate: [
                    { axis: 'z', rotations: 0.7, phase: 90 },
                    { axis: 'z', rotations: 0.7, phase: 270 }
                ]
            }
        }
    ],

    // Wobble - minimal for solid pillar
    wobbleFrequency: 1.5,
    wobbleAmplitude: 0.005,
    wobbleDecay: 0.3,
    // Scale - stable with slight breathing
    scaleWobble: 0.008,
    scaleFrequency: 2,
    scaleGrowth: 0.025,
    // Glow - powerful water blue
    glowColor: [0.25, 0.55, 0.9],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowPulseRate: 3
};

/**
 * Waterpillar gesture - majestic rising pillar of water.
 *
 * Uses THREE SPAWN LAYERS with different cutouts:
 * - Layer 1: 2 bottom rings with WAVES + angular travel
 * - Layer 2: 2 middle rings with CELLULAR + radial travel
 * - Layer 3: 2 top rings with RIPPLES + oscillate travel
 *
 * Each layer animates independently, breaking the uniform pattern.
 */
export default buildWaterEffectGesture(WATERPILLAR_CONFIG);
