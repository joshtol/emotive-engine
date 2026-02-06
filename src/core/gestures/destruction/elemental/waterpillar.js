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
 * - WAVES + CELLULAR cutout with oscillating travel
 * - Trail dissolve: base fades as pillar rises (water draining upward)
 * - Per-ring cutout variations with different scales and phases
 * - Rings grow larger as pillar rises (inverted pyramid shape)
 * - Cascading pulse wave travels up the pillar
 * - Gentle tilt wobble for majestic swaying
 * - Burst-fade exit disperses upward
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
                type: 'burst-fade',
                duration: 0.4,
                easing: 'easeIn',
                burstScale: 1.2,            // Expand slightly as pillar disperses
                burstDirection: 'up'        // Disperse upward
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
            // WAVES cutout with trail dissolve - pillar fades at base as it rises
            cutout: {
                strength: 0.55,
                primary: { pattern: 4, scale: 1.4, weight: 1.0 },    // WAVES - ripple texture (larger scale)
                secondary: { pattern: 0, scale: 0.8, weight: 0.35 }, // CELLULAR - organic gaps (stronger)
                blend: 'multiply',
                travel: 'oscillate',                                  // Oscillating for rippling feel
                travelSpeed: 1.2,                                     // Faster for dynamic ripples
                strengthCurve: 'bell',                                // Peak intensity mid-animation
                // Trail dissolve: water drains upward, base fades
                trailDissolve: {
                    enabled: true,
                    offset: -0.5,           // Dissolve 0.5 units below each ring
                    softness: 1.2           // Soft gradient for ethereal fade
                },
                // Per-ring cutout variations for visual interest
                perElement: [
                    { pattern: 4, scale: 1.2, travelPhase: 0 },      // Ring 1: standard
                    { pattern: 4, scale: 1.5, travelPhase: 60 },     // Ring 2: larger, offset
                    { pattern: 4, scale: 1.3, travelPhase: 120 },    // Ring 3: medium
                    { pattern: 4, scale: 1.6, travelPhase: 180 },    // Ring 4: larger
                    { pattern: 4, scale: 1.4, travelPhase: 240 },    // Ring 5: medium
                    { pattern: 4, scale: 1.8, travelPhase: 300 }     // Ring 6: largest at top
                ]
            },
            // Grain: cinematic film grain for realistic water pillar
            grain: {
                type: 3,              // FILM - perlin + white hybrid
                strength: 0.3,        // Visible grain (0.1 was too subtle)
                scale: 0.35,          // Coarser for visible texture
                speed: 0.6,           // Slow, majestic
                blend: 'multiply'     // Darkens for depth and texture
            },
            pulse: {
                amplitude: 0.08,
                frequency: 3,
                easing: 'easeInOut',
                perElement: true,           // Each ring pulses independently
                phaseOffset: 30             // 30° phase between adjacent rings - wave up pillar
            },
            // Slow upward drift - enhances rising sensation
            drift: {
                speed: 0.15,
                distance: 0.08,
                direction: { x: 0, y: 1, z: 0 },    // Pure upward
                easing: 'easeOut'
            },
            // Rings rotate with varied speeds and phase offsets - breaks repeating pattern
            rotate: [
                { axis: 'z', rotations: 0.4, phase: 0 },
                { axis: 'z', rotations: 0.5, phase: 120 },
                { axis: 'z', rotations: 0.45, phase: 240 },
                { axis: 'z', rotations: 0.55, phase: 60 },
                { axis: 'z', rotations: 0.5, phase: 180 },
                { axis: 'z', rotations: 0.6, phase: 300 }
            ],
            // Gentle tilt wobble - majestic swaying
            tilt: {
                axis: 'x',
                oscillate: true,
                range: 0.08,
                speed: 1.5,
                perElement: true,
                phaseOffset: 15             // Cascading tilt up the pillar
            },
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
 * - Inverted pyramid shape (narrow base, wide top)
 *
 * Enhanced cutout animations:
 * - WAVES + CELLULAR with oscillating travel for rippling texture
 * - Trail dissolve fades base as pillar rises (water draining upward)
 * - Per-ring cutout variations with different scales/phases
 * - Cascading pulse wave travels up the pillar (30° phase offset)
 * - Gentle tilt wobble for majestic swaying motion
 * - Burst-fade exit disperses rings upward
 */
export default buildWaterEffectGesture(WATERPILLAR_CONFIG);
