/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturepillar gesture - towering growth column of stacked vine rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/naturepillar
 *
 * VISUAL DIAGRAM:
 *          ═════          ← Layer 4: Top ring (smallest)
 *         ═══════
 *        ═════════        ← Layer 3
 *       ═══════════
 *      ═════════════      ← Layer 2
 *     ═══════════════     ← Layer 1: Bottom ring (largest)
 *            ★            ← Mascot at base
 *
 * FEATURES:
 * - 4 vine-ring models in stacked formation
 * - Tapered column: wide at bottom, narrow at top
 * - easeOut for fast initial growth that decelerates
 * - Staggered appearance for sequential ring-by-ring growth
 * - Synchronized global pulse for breathing column
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Towering nature displays
 * - Pillar of growth effects
 * - Divine/summoning botanical power
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Naturepillar gesture configuration
 * Towering growth column of stacked vine rings
 */
const NATUREPILLAR_CONFIG = {
    name: 'naturepillar',
    emoji: '🌴',
    type: 'blending',
    description: 'Towering growth column of stacked vine rings',
    duration: 2000,
    beats: 5,
    intensity: 1.2,
    category: 'emanating',
    growth: 0.85,

    // 3D Element spawning - stacked rings forming a tapered column
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeOut',
            startScale: 1.5,
            endScale: 0.8,
            startDiameter: 1.5,
            endDiameter: 0.8,
            orientation: 'flat'
        },
        formation: {
            type: 'stack',
            count: 4,
            spacing: 0.3
        },
        count: 4,
        scale: 2.2,
        models: ['vine-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85,
            stagger: 0.08,
            enter: {
                type: 'scale',
                duration: 0.12,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'fade',
                duration: 0.2,
                easing: 'easeIn'
            },
            pulse: {
                amplitude: 0.06,
                frequency: 2,
                easing: 'easeInOut',
                sync: 'global'
            },
            emissive: {
                min: 0.8,
                max: 1.5,
                frequency: 2,
                pattern: 'sine'
            },
            scaleVariance: 0.15,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12,
            modelOverrides: {
                'vine-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.7,
                        arcSpeed: 2.0,
                        arcCount: 1
                    },
                    orientationOverride: 'flat'
                }
            },
            cutout: {
                strength: 0.5,
                primary: { pattern: 3, scale: 3.0, weight: 1.0 },
                secondary: { pattern: 0, scale: 5.0, weight: 0.35 },
                blend: 'add',
                travel: 'vertical',
                travelSpeed: 1.5,
                strengthCurve: 'constant'
            },
            grain: {
                type: 3,
                strength: 0.03,
                scale: 0.3,
                speed: 0.35,
                blend: 'multiply'
            }
        }
    },

    // Glow - medium green column
    glowColor: [0.25, 0.7, 0.2],
    glowIntensityMin: 0.9,
    glowIntensityMax: 1.5,
    glowFlickerRate: 3,
    // Scale - pillar growth
    scaleVibration: 0.015,
    scaleFrequency: 2,
    scaleGrow: 0.03,
    // Tremor - stable pillar
    tremor: 0.004,
    tremorFrequency: 3,
    decayRate: 0.18
};

/**
 * Naturepillar gesture - towering growth column.
 *
 * Uses axis-travel spawn mode with stack formation:
 * - 4 vine-ring models stacked vertically
 * - Tapered column: wide at bottom (1.5), narrow at top (0.8)
 * - Staggered 0.08 appearance for sequential ring growth
 * - Synchronized global pulse for breathing column effect
 * - Slow arc animation (2.0 speed) for stable column feel
 */
export default buildNatureEffectGesture(NATUREPILLAR_CONFIG);
