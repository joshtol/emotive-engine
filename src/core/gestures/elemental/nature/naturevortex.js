/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturevortex Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturevortex gesture - spinning leaf tornado around mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/naturevortex
 *
 * VISUAL DIAGRAM:
 *        ╱│╲           TOP (wider)
 *       │ │ │
 *      │  ★  │         ← Horizontal vine rings
 *       │ │ │            spinning in funnel
 *        ╲│╱           ← 3 rings at 120° offsets
 *                      BOTTOM (narrower)
 *
 * FEATURES:
 * - 3 vine-ring models in spiral formation (120° apart)
 * - Rings travel from bottom to top of mascot
 * - Funnel shape: narrow at bottom, wide at top
 * - Arc shader animation for partial ring visibility
 * - Intense energy with high pulse frequency
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Leaf tornado effects
 * - Intense nature power-ups
 * - Dramatic botanical whirlwind
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Naturevortex gesture configuration
 * Spinning leaf tornado around mascot
 */
const NATUREVORTEX_CONFIG = {
    name: 'naturevortex',
    emoji: '🌪️',
    type: 'blending',
    description: 'Spinning leaf tornado around mascot',
    duration: 1500,
    beats: 5,
    intensity: 1.3,
    category: 'emanating',
    growth: 0.8,

    // 3D Element spawning - spiraling rings in tornado funnel
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'top',
            easing: 'easeInOut',
            startScale: 1.0,
            endScale: 1.4,
            startDiameter: 0.8,
            endDiameter: 2.5,
            orientation: 'flat',
        },
        formation: {
            type: 'spiral',
            count: 3,
            spacing: 0,
            arcOffset: 120,
            phaseOffset: 0,
        },
        count: 3,
        scale: 1.4,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.9,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.1,
                easing: 'easeOut',
            },
            exit: {
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.1,
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut',
            },
            emissive: {
                min: 0.8,
                max: 1.8,
                frequency: 4,
                pattern: 'sine',
            },
            scaleVariance: 0.2,
            lifetimeVariance: 0.15,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.5,
                        arcSpeed: 4.0,
                        arcCount: 1,
                    },
                    orientationOverride: 'flat',
                },
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 6, scale: 3.0, weight: 1.0 },
                secondary: { pattern: 0, scale: 5.0, weight: 0.35 },
                blend: 'add',
                travel: 'spiral',
                travelSpeed: 2.5,
                strengthCurve: 'constant',
            },
            grain: {
                type: 3,
                strength: 0.04,
                scale: 0.25,
                speed: 0.5,
                blend: 'multiply',
            },
            atmospherics: [
                {
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.5,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                },
            ],
        },
    },

    // Glow - bright green energy
    glowColor: [0.3, 0.75, 0.25],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 5,
    // Scale - expansion with tornado
    scaleVibration: 0.02,
    scaleFrequency: 4,
    scaleGrow: 0.03,
    // Tremor - vortex energy
    tremor: 0.007,
    tremorFrequency: 5,
    decayRate: 0.15,
};

/**
 * Naturevortex gesture - spinning leaf tornado.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 vine-ring models travel from bottom to top
 * - Rings oriented flat for tornado funnel effect
 * - 120° arcOffset creates cage of leaves around mascot
 * - Funnel shape expands as rings travel upward
 */
export default buildNatureEffectGesture(NATUREVORTEX_CONFIG);
