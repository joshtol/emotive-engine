/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fireimpact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Fireimpact gesture - fire models orbit then crash inward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireimpact
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        🔥↘         🔥↙       Fire orbits inward
 *          ╭───────╮
 *     🔥→   │  ★  ← │  🔥      Crashing into mascot center
 *          ╰───────╯
 *        🔥↗         🔥↖
 *
 * FEATURES:
 * - 7 orbiting fire models rushing inward with violent tumbling
 * - easeOut: fast inward rush → visible convergence at center
 * - Per-element tumbling rotation for chaotic motion
 * - ATTACKED gesture: mascot is being hit by fire
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Fire attack impact effects
 * - Being bombarded by fire
 * - Defensive fire being struck
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Fireimpact gesture configuration
 * Fire models orbit wide then crash inward
 */
const FIREIMPACT_CONFIG = {
    name: 'fireimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Fire orbits then crashes inward with impact',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'transform',
    temperature: 0.9,

    // Orbiting fire crashing inward — fast rush → visible convergence
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'above', // Start above mascot
            endHeight: 'center', // Crash down to center
            radius: 3.5, // Far out — dramatic approach distance
            endRadius: 0.1, // Slam tight into mascot center
            speed: 3, // 3 revolutions
            easing: 'easeOut', // Fast inward rush → visible convergence
            startScale: 0.4, // Small and distant at first
            endScale: 1.8, // Loom huge as they barrel in
            orientation: 'vertical',
        },
        formation: {
            type: 'ring',
            count: 7,
        },
        count: 7,
        scale: 1.4,
        models: ['flame-wisp', 'flame-tongue', 'ember-cluster', 'fire-burst'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.6,
            stagger: 0.02,
            enter: {
                type: 'fade',
                duration: 0.06,
                easing: 'easeOut',
            },
            exit: {
                type: 'burst-fade',
                duration: 0.05, // Snap-vanish on impact
                easing: 'easeOut',
                burstScale: 0.2, // Crushed small on impact
            },
            procedural: {
                scaleSmoothing: 0.04,
                geometryStability: true,
            },
            parameterAnimation: {
                temperature: {
                    start: 0.4,
                    peak: 0.95,
                    end: 0.9,
                    curve: 'fadeIn', // Heat intensifies as fire converges
                },
            },
            pulse: {
                amplitude: 0.12,
                frequency: 8,
                easing: 'easeInOut',
            },
            emissive: {
                min: 1.0,
                max: 3.0,
                frequency: 9,
                pattern: 'sine',
            },
            // Per-gesture atmospheric particles: impact smoke
            atmospherics: [
                {
                    preset: 'smoke',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.3,
                    sizeScale: 0.7,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.7,
                },
            ],
            // Violent per-element tumbling — faster spins for aggressive motion
            rotate: [
                { axis: 'z', rotations: -4, phase: 0 },
                { axis: 'x', rotations: 3.5, phase: 50 },
                { axis: 'y', rotations: -3, phase: 100 },
                { axis: 'z', rotations: 4, phase: 155 },
                { axis: 'x', rotations: -3.5, phase: 210 },
                { axis: 'y', rotations: 3, phase: 260 },
                { axis: 'z', rotations: -4.5, phase: 315 },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.08,
            blending: 'additive',
            renderOrder: 12,
        },
    },

    // Mesh effects - intense impact fire
    flickerFrequency: 18,
    flickerAmplitude: 0.018,
    glowColor: [1.0, 0.4, 0.1],
    glowIntensityMin: 1.6,
    glowIntensityMax: 2.8,
    glowFlickerRate: 12,
    scaleVibration: 0.025,
    scaleFrequency: 6,
    scaleContract: 0.05,
    tremor: 0.018,
    tremorFrequency: 9,
};

/**
 * Fireimpact gesture - fire orbits then crashes inward.
 *
 * Uses orbit spawn mode with ring formation:
 * - 7 fire models rushing inward
 * - 3 revolutions with easeOut (fast inward rush → visible convergence)
 * - Violent per-element tumbling on x/y/z axes
 * - Radius narrows 3.5 → 0.1, height drops above → center
 * - Scale grows 0.4 → 1.8 as fire looms closer
 * - ATTACKED: mascot is being hit by fire
 */
export default buildFireEffectGesture(FIREIMPACT_CONFIG);
