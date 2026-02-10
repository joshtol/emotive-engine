/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icedance Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icedance gesture - vertical ice crystals dancing upward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icedance
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ╱│╲        TOP (expanding)
 *        ╱ │ ╲
 *       │  │  │      ← Vertical crystals
 *       │  ★  │        dancing upward
 *       │  │  │      ← 120° apart
 *        ╲ │ ╱
 *         ╲│╱        BOTTOM (converging)
 *
 * FEATURES:
 * - 3 ice-ring crystals with vertical orientation
 * - Crystals travel from bottom to top
 * - DANCING rotation: all spin on Y axis, 120° phase offset
 * - Two-layer cutout: VORONOI + CRACKS with angular travel
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Celebratory ice effects
 * - Dancing frost auras
 * - Rhythmic ice displays
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icedance gesture configuration
 * Vertical ice crystals dancing and rising around the mascot
 */
const ICEDANCE_CONFIG = {
    name: 'icedance',
    emoji: '💃',
    type: 'blending',
    description: 'Vertical ice crystals dancing and rising',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'transform',
    frost: 0.7,

    // 3D Element spawning - vertical dancing crystals
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.2,
            endScale: 1.6,
            startDiameter: 1.3,
            endDiameter: 2.0,
            orientation: 'vertical'     // Standing crystals for dance effect
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.0,
        models: ['ice-ring'],
        animation: {
            appearAt: 0.02,
            disappearAt: 0.5,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.08,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.5,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            // VORONOI + CRACKS for crystalline dance
            cutout: {
                strength: 0.65,
                primary: { pattern: 3, scale: 1.5, weight: 1.0 },    // VORONOI - crystalline cells
                secondary: { pattern: 8, scale: 1.2, weight: 0.5 },  // CRACKS - fracture lines
                blend: 'add',
                travel: 'angular',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                geometricMask: {
                    type: 'distance',
                    core: 0.12,
                    tip: 0.28
                }
            },
            // Grain: FILM for frost dust
            grain: {
                type: 3,
                strength: 0.2,
                scale: 0.25,
                speed: 2.0,
                blend: 'multiply'
            },
            parameterAnimation: {
                frost: {
                    start: 0.5,
                    peak: 0.75,
                    end: 0.55,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 1.6,
                frequency: 6,
                pattern: 'sine'
            },
            // Dance partners: two mirror each other, one does a flourish
            rotate: [
                { axis: 'y', rotations: 2, phase: 0 },      // Lead: 2 rotations
                { axis: 'y', rotations: -2, phase: 60 },    // Partner: counter-rotation
                { axis: 'y', rotations: 3, phase: 120 }     // Flourish: faster accent
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 11,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 1.5,
                        arcCount: 1
                    },
                    orientationOverride: 'vertical'
                }
            }
        }
    },

    // Glow - vibrant ice blue
    glowColor: [0.5, 0.8, 1.0],
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    // Scale - dynamic breathing
    scaleVibration: 0.018,
    scaleFrequency: 4,
    scaleGrowth: 0.025,
    // Tremor - rhythmic
    tremor: 0.005,
    tremorFrequency: 3
};

/**
 * Icedance gesture - vertical ice crystals dancing upward.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 ice-spike models travel from bottom to top
 * - Crystals are VERTICAL for dance effect
 * - 120° arcOffset spreads crystals around the mascot
 * - DANCING rotation: lead, partner (counter), flourish
 */
export default buildIceEffectGesture(ICEDANCE_CONFIG);
