/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Iceimpact Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Iceimpact gesture - ice crystals orbit then crash inward with shatter burst
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/iceimpact
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *        ❄↘         ❄↙       Crystals orbit inward
 *          ╭───────╮
 *     ❄→   │  ★  ← │  ❄      Crashing into mascot center
 *          ╰───────╯
 *        ❄↗         ❄↖
 *
 * FEATURES:
 * - 7 orbiting crystals rushing inward with violent tumbling
 * - easeOut: fast inward rush → visible convergence at center
 * - Per-crystal tumbling rotation for chaotic motion
 * - ATTACKED gesture: mascot is being hit by ice
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ice attack impact effects
 * - Being bombarded by ice
 * - Defensive ice being struck
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Iceimpact gesture configuration
 * Ice crystals orbit wide then crash inward with impact burst
 */
const ICEIMPACT_CONFIG = {
    name: 'iceimpact',
    emoji: '💥',
    type: 'blending',
    description: 'Ice crystals orbit then crash inward with impact burst',
    duration: 1500,
    beats: 4,
    intensity: 1.5,
    category: 'transform',
    frost: 0.8,

    // Orbiting crystals accelerating inward — slow wind-up → violent crash
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'above', // Start above mascot
            endHeight: 'center', // Crash down to center
            radius: 3.5, // Far out — dramatic approach distance
            endRadius: 0.1, // Slam tight into mascot center
            speed: 3, // 3 revolutions — long wind-up
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
        models: ['crystal-cluster', 'crystal-medium', 'crystal-small', 'ice-spike'],
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
                frost: {
                    start: 0.3,
                    peak: 0.95,
                    end: 0.9,
                    curve: 'fadeIn', // Frost intensifies as crystals converge
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
            // Per-gesture atmospheric particles: cold mist on impact
            atmospherics: [
                {
                    preset: 'mist',
                    targets: null,
                    anchor: 'below',
                    intensity: 0.3,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.7,
                },
            ],
            // Violent per-crystal tumbling — faster spins for aggressive motion
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
            blending: 'normal',
            renderOrder: 12,
        },
    },

    // Glow - intense flash on impact
    glowColor: [0.45, 0.75, 1.0],
    glowIntensityMin: 1.6,
    glowIntensityMax: 2.8,
    glowFlickerRate: 10,
    // Scale - heavy contraction as ice slams in
    scaleVibration: 0.025,
    scaleFrequency: 6,
    scaleContract: 0.05,
    // Tremor - violent impact shaking
    tremor: 0.018,
    tremorFrequency: 9,
};

/**
 * Iceimpact gesture - ice crystals orbit then crash inward.
 *
 * Uses orbit spawn mode with ring formation:
 * - 7 crystal models accelerating inward
 * - 3 revolutions with easeOut (fast inward rush → visible convergence)
 * - Violent per-crystal tumbling on x/y/z axes
 * - Radius narrows 3.5 → 0.1, height drops above → center
 * - Scale grows 0.4 → 1.8 as crystals loom closer
 * - ATTACKED: mascot is being hit by ice
 */
export default buildIceEffectGesture(ICEIMPACT_CONFIG);
