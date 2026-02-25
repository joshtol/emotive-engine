/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icepillar gesture - majestic rising pillar of stacked ice crystals
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icepillar
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Layer 3: Top crystal (VORONOI, oscillate)
 *          ═════════         ← Layer 2: Middle crystal (CRACKS, radial)
 *            ═════           ← Layer 1: Bottom crystal (CELLULAR, angular)
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - THREE LAYERS with different cutout animations (1 ring per layer = 3 total)
 * - Layer 1: 1 bottom crystal with CELLULAR + angular travel
 * - Layer 2: 1 middle crystal with CRACKS + radial travel
 * - Layer 3: 1 top crystal with VORONOI + oscillate travel
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of ice effects
 * - Divine/summoning power
 * - Majestic ice displays
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

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
        frost: {
            start: 0.55,
            peak: 0.85,
            end: 0.65,
            curve: 'bell'
        }
    },
    pulse: {
        amplitude: 0.05,
        frequency: 3,
        easing: 'easeInOut'
    },
    emissive: {
        min: 0.9,
        max: 1.8,
        frequency: 4,
        pattern: 'sine'
    },
    grain: {
        type: 3,
        strength: 0.35,
        scale: 0.2,
        speed: 1.5,
        blend: 'multiply'
    },
    // Per-gesture atmospheric particles: cold mist pooling below ice column
    atmospherics: [{
        preset: 'mist',
        targets: ['ice-ring'],
        anchor: 'below',
        anchorOffset: -0.1,
        intensity: 0.4,
        sizeScale: 1.5,
        progressCurve: 'sustain',
    }],
    scaleVariance: 0.03,
    lifetimeVariance: 0.02,
    blending: 'normal',
    renderOrder: 15,
    modelOverrides: {
        'ice-ring': {
            shaderAnimation: {
                type: 1,
                arcWidth: 0.95,
                arcSpeed: 0.8,
                arcCount: 2
            }
        }
    }
};

/**
 * Icepillar gesture configuration
 * Majestic rising pillar of stacked ice crystals - THREE LAYERS
 */
const ICEPILLAR_CONFIG = {
    name: 'icepillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of ice',
    duration: 3000,
    beats: 4,
    intensity: 1.3,
    mascotGlow: 0.4,
    category: 'transform',
    frost: 0.8,

    // THREE LAYERS - 1 ring per layer = 3 total for pillar effect
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Bottom crystal - CELLULAR pattern, angular travel
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
                startOffset: 0
            },
            count: 1,
            scale: 1.6,
            models: ['ice-ring'],
            animation: {
                ...SHARED_ANIMATION,
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 0, scale: 1.2, weight: 1.0 },    // CELLULAR
                    secondary: { pattern: 8, scale: 1.5, weight: 0.4 },  // CRACKS
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 1.2,
                    strengthCurve: 'fadeIn',
                    fadeInDuration: 0.3,
                    geometricMask: { type: 'distance', core: 0.1, tip: 0.25 }
                },
                rotate: { axis: 'z', rotations: 0.3, phase: 0 }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Middle crystal - CRACKS pattern, radial travel
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
                startOffset: 0.5
            },
            count: 1,
            scale: 1.6,
            models: ['ice-ring'],
            animation: {
                ...SHARED_ANIMATION,
                cutout: {
                    strength: 0.6,
                    primary: { pattern: 8, scale: 1.4, weight: 1.0 },    // CRACKS
                    secondary: { pattern: 3, scale: 1.2, weight: 0.5 },  // VORONOI
                    blend: 'multiply',
                    travel: 'radial',
                    travelSpeed: 1.5,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 0.5,
                    geometricMask: { type: 'tip-boost', core: 0.0, tip: 0.2 }
                },
                rotate: { axis: 'z', rotations: -0.5, phase: 60 }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Top crystal - VORONOI pattern, oscillate travel
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
                startOffset: 1.0
            },
            count: 1,
            scale: 1.6,
            models: ['ice-ring'],
            animation: {
                ...SHARED_ANIMATION,
                cutout: {
                    strength: 0.65,
                    primary: { pattern: 3, scale: 1.3, weight: 1.0 },    // VORONOI
                    secondary: { pattern: 7, scale: 1.5, weight: 0.4 },  // DISSOLVE
                    blend: 'add',
                    travel: 'oscillate',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeOut',
                    fadeOutDuration: 0.4,
                    geometricMask: { type: 'distance', core: 0.15, tip: 0.3 }
                },
                rotate: { axis: 'z', rotations: 0.7, phase: 90 }
            }
        }
    ],

    // Glow - crystalline ice
    glowColor: [0.55, 0.8, 1.0],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 5,
    // Scale - pillar growth
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.025,
    // Tremor - stable
    tremor: 0.002,
    tremorFrequency: 2
};

/**
 * Icepillar gesture - majestic rising pillar of ice.
 *
 * Uses THREE SPAWN LAYERS with different cutouts:
 * - Layer 1: 1 bottom crystal with CELLULAR + angular travel
 * - Layer 2: 1 middle crystal with CRACKS + radial travel
 * - Layer 3: 1 top crystal with VORONOI + oscillate travel
 */
export default buildIceEffectGesture(ICEPILLAR_CONFIG);
