/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Waterimpact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Waterimpact gesture - water models orbit then crash inward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterimpact
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        💧↘         💧↙       Water orbits inward
 *          ╭───────╮
 *     💧→   │  ★  ← │  💧      Crashing into mascot center
 *          ╰───────╯
 *        💧↗         💧↖
 *
 * FEATURES:
 * - 7 orbiting water models rushing inward with violent tumbling
 * - easeOut: fast inward rush → visible convergence at center
 * - Per-element tumbling rotation for chaotic motion
 * - ATTACKED gesture: mascot is being hit by water
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Water attack impact effects
 * - Being bombarded by water
 * - Defensive water being struck
 */

import { buildWaterEffectGesture } from './waterEffectFactory.js';

/**
 * Waterimpact gesture configuration
 * Water models orbit wide then crash inward
 */
const WATERIMPACT_CONFIG = {
    name: 'waterimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Water orbits then crashes inward with impact',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'transform',
    turbulence: 0.8,

    // Orbiting water crashing inward — fast rush → visible convergence
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'above',              // Start above mascot
            endHeight: 'center',           // Crash down to center
            radius: 3.5,                   // Far out — dramatic approach distance
            endRadius: 0.1,               // Slam tight into mascot center
            speed: 3,                      // 3 revolutions
            easing: 'easeOut',            // Fast inward rush → visible convergence
            startScale: 0.4,              // Small and distant at first
            endScale: 1.8,                // Loom huge as they barrel in
            orientation: 'vertical'
        },
        formation: {
            type: 'ring',
            count: 7
        },
        count: 7,
        scale: 1.4,
        models: ['bubble-cluster', 'wave-curl'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.06,
                easing: 'easeOut'
            },
            exit: {
                type: 'burst-fade',
                duration: 0.05,            // Snap-vanish on impact
                easing: 'easeOut',
                burstScale: 0.2            // Crushed small on impact
            },
            procedural: {
                scaleSmoothing: 0.04,
                geometryStability: true
            },
            parameterAnimation: {
                turbulence: {
                    start: 0.3,
                    peak: 0.9,
                    end: 0.85,
                    curve: 'fadeIn'         // Turbulence intensifies as water converges
                }
            },
            pulse: {
                amplitude: 0.12,
                frequency: 8,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.0,
                max: 3.0,
                frequency: 9,
                pattern: 'sine'
            },
            // Violent per-element tumbling — faster spins for aggressive motion
            rotate: [
                { axis: 'z', rotations: -4, phase: 0 },
                { axis: 'x', rotations: 3.5, phase: 50 },
                { axis: 'y', rotations: -3, phase: 100 },
                { axis: 'z', rotations: 4, phase: 155 },
                { axis: 'x', rotations: -3.5, phase: 210 },
                { axis: 'y', rotations: 3, phase: 260 },
                { axis: 'z', rotations: -4.5, phase: 315 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.08,
            blending: 'normal',
            renderOrder: 12
        }
    },

    // Wobble - intense impact water
    wobbleFrequency: 12,
    wobbleAmplitude: 0.018,
    glowColor: [0.15, 0.45, 1.0],
    glowIntensityMin: 1.6,
    glowIntensityMax: 2.8,
    glowPulseRate: 12,
    scaleWobble: 0.025,
    scaleFrequency: 6,
    scaleContract: 0.05,
    tremor: 0.018,
    tremorFrequency: 9
};

/**
 * Waterimpact gesture - water orbits then crashes inward.
 *
 * Uses orbit spawn mode with ring formation:
 * - 7 water models rushing inward
 * - 3 revolutions with easeOut (fast inward rush → visible convergence)
 * - Violent per-element tumbling on x/y/z axes
 * - Radius narrows 3.5 → 0.1, height drops above → center
 * - Scale grows 0.4 → 1.8 as water looms closer
 * - ATTACKED: mascot is being hit by water
 */
export default buildWaterEffectGesture(WATERIMPACT_CONFIG);
