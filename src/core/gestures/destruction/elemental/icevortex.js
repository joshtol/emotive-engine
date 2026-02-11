/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Ice Vortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Ice Vortex gesture - spiraling ice tornado around mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icevortex
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal crystal walls
 *       │ │ │            spinning around in funnel
 *        ╲│╱           ← 3 crystals at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 crystal-clusters in spiral formation (120° apart)
 * - Crystals travel from bottom to top of mascot
 * - Crystals oriented FLAT (horizontal tornado funnel)
 * - Funnel shape: narrower at bottom, wider at top
 * - VORONOI + CRACKS cutout patterns for vortex motion
 * - Trail dissolve: organic fade at crystal bottoms as they rise
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ice tornado/blizzard effects
 * - Intense ice power-ups
 * - Dramatic frozen aura
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Ice Vortex gesture configuration
 * Ice tornado with horizontal crystal walls spinning around mascot
 */
const ICE_VORTEX_CONFIG = {
    name: 'icevortex',
    emoji: '🌀',
    type: 'blending',
    description: 'Ice tornado spiraling around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.4,
    category: 'transform',
    frost: 0.8,

    // 3D Element spawning - spiraling crystals with cutout patterns
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.2,
            endScale: 1.5,
            startDiameter: 0.6,     // Narrow at bottom for cone
            endDiameter: 2.0,       // Wider at top for dramatic funnel
            orientation: 'flat'     // Horizontal crystals stacking upward
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0
        },
        count: 3,
        scale: 1.5,
        models: ['ice-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut'
            },
            exit: {
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.1
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                frost: {
                    start: 0.5,
                    peak: 0.9,
                    end: 0.6,
                    curve: 'bell'
                }
            },
            pulse: {
                amplitude: 0.12,
                frequency: 6,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 2.0,
                frequency: 5,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.5,
                primary: { pattern: 3, scale: 1.2, weight: 1.0 },     // VORONOI - crystalline cells
                secondary: { pattern: 8, scale: 0.8, weight: 0.5 },   // CRACKS - fracture lines
                blend: 'add',
                travel: 'angular',
                travelSpeed: 2.0,
                strengthCurve: 'bell',
                trailDissolve: {
                    enabled: true,
                    offset: -0.4,
                    softness: 1.2
                }
            },
            grain: {
                type: 3,
                strength: 0.2,
                scale: 0.3,
                speed: 2.5,
                blend: 'multiply'
            },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 5.0,
                        arcCount: 1
                    },
                    scaling: {
                        mode: 'non-uniform',
                        axes: {
                            x: { expand: true, rate: 1.1 },
                            y: { expand: false, rate: 0.3 },
                            z: { expand: true, rate: 1.1 }
                        }
                    },
                    orientationOverride: 'flat'
                }
            }
        }
    },

    // Glow - intense ice blue
    glowColor: [0.4, 0.75, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.2,
    glowFlickerRate: 6,
    // Scale - slight expansion with tornado
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scaleGrowth: 0.03,
    // Tremor - vortex energy
    tremor: 0.008,
    tremorFrequency: 5
};

/**
 * Ice Vortex gesture - ice tornado with horizontal walls.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 crystal-cluster models travel from bottom to top
 * - Crystals are FLAT (orientation: 'flat') for tornado funnel effect
 * - 120° arcOffset creates cage of ice around the mascot
 * - Funnel shape expands as crystals travel upward
 * - VORONOI cutout with CRACKS overlay for dynamic vortex holes
 */
export default buildIceEffectGesture(ICE_VORTEX_CONFIG);
