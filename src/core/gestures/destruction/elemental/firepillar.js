/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firepillar gesture - majestic rising pillar of stacked flame rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firepillar
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Layer 3: Top rings (EMBERS, oscillate)
 *         ═══════════
 *          ═════════         ← Layer 2: Middle rings (DISSOLVE, radial)
 *           ═══════
 *            ═════           ← Layer 1: Bottom rings (WAVES, angular)
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations
 * - Layer 1: 2 bottom rings with WAVES + angular travel
 * - Layer 2: 2 middle rings with DISSOLVE + radial travel
 * - Layer 3: 2 top rings with EMBERS + oscillate travel
 * - Each layer animates differently to break uniformity
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of fire effects
 * - Divine/summoning power
 * - Majestic fire displays
 * - Ascending power themes
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

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
        type: 'fade',
        duration: 0.3,
        easing: 'easeIn'
    },
    procedural: {
        scaleSmoothing: 0.1,
        geometryStability: true
    },
    parameterAnimation: {
        temperature: {
            start: 0.55,
            peak: 0.8,
            end: 0.65,
            curve: 'bell'
        }
    },
    flicker: {
        intensity: 0.12,
        rate: 8,
        pattern: 'sine'
    },
    pulse: {
        amplitude: 0.05,
        frequency: 3,
        easing: 'easeInOut'
    },
    emissive: {
        min: 1.3,
        max: 2.5,
        frequency: 4,
        pattern: 'sine'
    },
    grain: {
        type: 2,
        strength: 0.5,
        scale: 0.15,
        speed: 2.5,
        blend: 'multiply'
    },
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'additive',
    renderOrder: 15,
    modelOverrides: {
        'flame-ring': {
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
 * Firepillar gesture configuration
 * Majestic rising pillar of stacked flame rings - THREE LAYERS
 */
const FIREPILLAR_CONFIG = {
    name: 'firepillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of flame',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.7,

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
            models: ['flame-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.03,
                // WAVES + angular - slow sweeping
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 4, scale: 2.0, weight: 1.0 },    // WAVES
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },  // DISSOLVE
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                    geometricMask: {
                        type: 'distance',
                        core: 0.1,
                        tip: 0.25
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
        // LAYER 2: Middle 2 rings - DISSOLVE pattern, radial travel
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
            models: ['flame-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.05,
                // DISSOLVE + radial - pulsing expansion
                cutout: {
                    strength: 0.65,
                    primary: { pattern: 7, scale: 1.8, weight: 1.0 },    // DISSOLVE
                    secondary: { pattern: 5, scale: 1.5, weight: 0.5 },  // EMBERS
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 0.5,
                    geometricMask: {
                        type: 'tip-boost',
                        core: 0.0,
                        tip: 0.2
                    }
                },
                // Layer 2: Medium counter-clockwise spin
                rotate: [
                    { axis: 'z', rotations: -0.6, phase: 60 },
                    { axis: 'z', rotations: -0.6, phase: 240 }
                ]
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top 2 rings - EMBERS pattern, oscillate travel
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
            models: ['flame-ring'],
            animation: {
                ...SHARED_ANIMATION,
                stagger: 0.07,
                // EMBERS + oscillate - chaotic flickering
                cutout: {
                    strength: 0.7,
                    primary: { pattern: 5, scale: 1.5, weight: 1.0 },    // EMBERS
                    secondary: { pattern: 6, scale: 2.0, weight: 0.4 },  // SPIRAL
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.5,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    geometricMask: {
                        type: 'distance',
                        core: 0.15,
                        tip: 0.3
                    }
                },
                // Layer 3: Fast clockwise spin
                rotate: [
                    { axis: 'z', rotations: 0.9, phase: 90 },
                    { axis: 'z', rotations: 0.9, phase: 270 }
                ]
            }
        }
    ],

    // Mesh effects - powerful warm glow
    flickerFrequency: 6,
    flickerAmplitude: 0.006,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.65, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 5,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.025,
    rotationEffect: false
};

/**
 * Firepillar gesture - majestic rising pillar of flame.
 *
 * Uses THREE SPAWN LAYERS with different cutouts:
 * - Layer 1: 2 bottom rings with WAVES + angular travel
 * - Layer 2: 2 middle rings with DISSOLVE + radial travel
 * - Layer 3: 2 top rings with EMBERS + oscillate travel
 *
 * Each layer animates independently, breaking the uniform pattern.
 */
export default buildFireEffectGesture(FIREPILLAR_CONFIG);
