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
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Wide flat ring at top
 *         ═══════════
 *          ═════════         ← Stacked horizontal rings
 *           ═══════            rising as unified pillar
 *            ═════
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - 6 flat horizontal rings stacked vertically
 * - Rises from below mascot to above
 * - WAVES + CELLULAR cutout for rippling texture
 * - Rings grow larger as pillar rises (inverted pyramid shape)
 * - All rings rotate together with phase offsets
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of water effects
 * - Divine/summoning power
 * - Majestic water displays
 * - Ascending power themes
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterpillar gesture configuration
 * Majestic rising pillar of stacked water rings
 */
const WATERPILLAR_CONFIG = {
    name: 'waterpillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of water',
    duration: 3000,             // Longer for majestic feel
    beats: 4,
    intensity: 1.3,
    category: 'ambient',
    turbulence: 0.25,

    // 3D Element spawning - rising pillar
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',         // Start below mascot
            end: 'above',           // Rise to above
            easing: 'easeOut',      // Decelerate for majestic feel
            startScale: 0.6,        // Start smaller
            endScale: 1.3,          // Grow larger at top
            startDiameter: 1.2,     // Narrow at base
            endDiameter: 2.2,       // Wide at top (inverted pyramid)
            orientation: 'flat'     // Horizontal flat rings
        },
        formation: {
            type: 'stack',
            count: 6,
            spacing: 0.25           // Even vertical spacing
        },
        count: 6,
        scale: 1.0,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.03,          // Slight wave from bottom
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
                turbulence: {
                    start: 0.15,
                    peak: 0.3,
                    end: 0.2,
                    curve: 'bell'
                }
            },
            // WAVES cutout for rippling pillar texture
            cutout: {
                strength: 0.45,
                primary: { pattern: 4, scale: 1.0, weight: 1.0 },    // WAVES - ripple texture
                secondary: { pattern: 0, scale: 0.6, weight: 0.25 }, // CELLULAR - organic gaps
                blend: 'multiply',
                travel: 'vertical',
                travelSpeed: 0.8,
                strengthCurve: 'fadeOut'
            },
            pulse: {
                amplitude: 0.06,
                frequency: 2.5,
                easing: 'easeInOut'
            },
            // Rings rotate with 120° phase offsets - breaks repeating pattern
            rotate: [
                { axis: 'z', rotations: 0.5, phase: 0 },
                { axis: 'z', rotations: 0.5, phase: 120 },
                { axis: 'z', rotations: 0.5, phase: 240 },
                { axis: 'z', rotations: 0.5, phase: 0 },
                { axis: 'z', rotations: 0.5, phase: 120 },
                { axis: 'z', rotations: 0.5, phase: 240 }
            ],
            scaleVariance: 0.03,    // Minimal variance for solid pillar
            lifetimeVariance: 0.02,
            blending: 'normal',
            renderOrder: 15,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.95,     // Nearly complete rings
                        arcSpeed: 0.8,      // Slow majestic rotation
                        arcCount: 3
                    }
                }
            }
        }
    },

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
 * Uses axis-travel with stack formation:
 * - 6 flat splash-ring models stacked vertically
 * - Rise from below to above with expanding diameter
 * - Rings rotate with 120° phase offsets (3 groups of 2)
 * - Inverted pyramid shape (narrow base, wide top)
 */
export default buildWaterEffectGesture(WATERPILLAR_CONFIG);
