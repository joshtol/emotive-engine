/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterdrench Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterdrench gesture - concentric ripples expanding outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterdrench
 * @complexity ⭐ Basic
 *
 * VISUAL DIAGRAM:
 *
 *        ╭───────╮
 *       ╭─────────╮
 *      ╭───────────╮     ← Concentric rings expanding outward
 *         ★              ← Mascot at center
 *      ╰───────────╯
 *       ╰─────────╯
 *        ╰───────╯
 *
 * FEATURES:
 * - 4 concentric splash rings expanding outward
 * - Staggered appearance for ripple wave effect
 * - Camera-facing rings for clean visibility
 * - CELLULAR cutout for organic water texture
 * - Simple, classic water ripple effect
 *
 * USED BY:
 * - Water impact effects
 * - Splash reactions
 * - Ripple emanation
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterdrench gesture configuration
 * Concentric ripples expanding from center
 */
const WATERDRENCH_CONFIG = {
    name: 'drench',
    emoji: '🌊',
    type: 'blending',
    description: 'Concentric water ripples expanding outward',
    duration: 1500,
    beats: 3,
    intensity: 1.0,
    category: 'impact',
    turbulence: 0.4,

    // 3D Element spawning - CONCENTRIC RIPPLES
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',              // Stay at center
            easing: 'linear',
            startScale: 0.3,
            endScale: 2.0,              // Expand dramatically
            startDiameter: 0.4,
            endDiameter: 2.8,           // Wide ripple spread
            orientation: 'camera'        // Face camera for visibility
        },
        formation: {
            type: 'stack',
            count: 3,
            spacing: 0                  // All at same position, stagger does the work
        },
        count: 3,
        scale: 1.0,
        models: ['splash-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85,
            stagger: 0.15,              // Each ring appears after previous - creates ripple wave
            enter: {
                type: 'scale',
                duration: 0.1,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'fade',
                duration: 0.25,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.06,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.5,
                    peak: 0.3,
                    end: 0.1,
                    curve: 'bell'
                }
            },
            // Cutout: organic cellular water texture
            cutout: {
                strength: 0.5,
                primary: { pattern: 0, scale: 0.9, weight: 1.0 },   // CELLULAR - bubbles
                blend: 'multiply',
                travel: 'radial',           // Expand outward with ring
                travelSpeed: 1.0,
                strengthCurve: 'fadeOut',   // Fade as ripple dissipates
                trailDissolve: {
                    enabled: true,
                    offset: -0.3,
                    softness: 1.2
                }
            },
            pulse: {
                amplitude: 0.05,
                frequency: 2,
                easing: 'easeOut'
            },
            blending: 'additive',
            renderOrder: 10,
            modelOverrides: {
                'splash-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.95,     // Nearly complete ring
                        arcSpeed: 0.3,
                        arcCount: 1
                    },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Wobble - ripple impact
    wobbleFrequency: 2,
    wobbleAmplitude: 0.01,
    wobbleDecay: 0.6,
    // Scale
    scaleWobble: 0.02,
    scaleFrequency: 2,
    scaleGrowth: 0,
    // Glow - water blue
    glowColor: [0.2, 0.5, 0.9],
    glowIntensityMin: 0.7,
    glowIntensityMax: 1.3,
    glowPulseRate: 2
};

/**
 * Waterdrench gesture - concentric ripples.
 *
 * Simple single-layer effect:
 * - 4 splash rings at center, staggered appearance
 * - Each ring expands outward as it ages
 * - Creates classic ripple-in-water effect
 */
export default buildWaterEffectGesture(WATERDRENCH_CONFIG);
