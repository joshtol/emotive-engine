/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterpool Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterpool gesture - expanding pool rings with rising bubbles
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterpool
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *            ○  ○           ← Rising bubbles
 *           ○    ○
 *             ★             ← Mascot
 *            /|\
 *        ═══════════        ← Expanding pool rings
 *       ═════════════
 *
 * FEATURES:
 * - Two-layer effect: expanding rings + rising bubbles
 * - axis-travel for horizontal pool rings
 * - Spiral formation for rising bubbles
 * - Non-uniform scaling for ring expansion
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pool/puddle effects
 * - Water settling visuals
 * - Cascade reactions
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterpool gesture configuration
 * Expanding pool rings with rising bubbles
 */
const WATERPOOL_CONFIG = {
    name: 'pool',
    emoji: '🫗',
    type: 'blending',
    description: 'Cascade - expanding pool rings with rising bubbles',
    duration: 2000,
    beats: 3,
    intensity: 0.8,
    category: 'transform',
    turbulence: 0.1,

    // 3D Element spawning - TWO LAYERS: expanding rings + rising bubbles
    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Expanding pool rings at feet
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'bottom',
                startDiameter: 0.5,
                endDiameter: 3.0,
                orientation: 'horizontal'
            },
            formation: { type: 'ring', count: 3, phaseOffset: 0.15 },
            count: 3,
            models: ['splash-ring'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.92,
                stagger: 0.12,
                enter: {
                    type: 'grow',
                    duration: 0.1,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.12,
                    geometryStability: true
                },
                parameterAnimation: {
                    turbulence: {
                        start: 0.3,
                        peak: 0.2,
                        end: 0.05,
                        curve: 'linear'
                    }
                },
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'splash-ring': {
                        opacityLink: 'inverse-scale',
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.8,
                            arcSpeed: 0.5,
                            arcCount: 2
                        }
                    }
                }
            }
        },
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Rising bubbles from pool
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'center',
                easing: 'easeOutQuad',
                startDiameter: 1.0,
                endDiameter: 1.5,
                startScale: 0.6,
                endScale: 1.0
            },
            formation: { type: 'spiral', count: 6, arcOffset: 60, phaseOffset: 0.04 },
            count: 6,
            models: ['bubble-cluster'],
            animation: {
                appearAt: 0.25,
                disappearAt: 0.9,
                stagger: 0.05,
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutBack'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                blending: 'normal',
                renderOrder: 7
            }
        }
    ],

    // Wobble - gentle settling ripples
    wobbleFrequency: 2,
    wobbleAmplitude: 0.015,
    wobbleDecay: 0.5,
    // Scale - squash (flatten)
    scaleWobble: 0.01,
    scaleFrequency: 1,
    scaleSquash: 0.08,           // Flatten vertically
    // Glow - still water reflection
    glowColor: [0.25, 0.5, 0.85],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.3,
    glowPulseRate: 1,
    // Pool-specific
    settleDown: 0.02
};

/**
 * Waterpool gesture - expanding pool rings with rising bubbles.
 *
 * Uses multi-layer spawn mode:
 * - Layer 1: axis-travel horizontal pool rings
 * - Layer 2: axis-travel rising bubbles
 */
export default buildWaterEffectGesture(WATERPOOL_CONFIG);
