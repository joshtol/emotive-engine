/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturebarrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturebarrage gesture - orbiting vine projectiles launching outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/naturebarrage
 *
 * VISUAL DIAGRAM:
 *          ~↗   ~↗          VINES LAUNCHED UPWARD
 *        ~↗       ~↗
 *         ╭─~─╮              ← Vine models orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─~─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 nature models (no ring) orbiting mascot
 * - Ring formation at 72° offsets with active orbital rotation
 * - Per-element tumbling rotation on multiple axes
 * - Elements start close at center height, orbit outward + upward
 * - 3 full revolutions with easeIn (slow orbit to fast launch)
 * - Burst-fade exit as they launch away
 * - ATTACK gesture: mascot is projecting nature outward
 * - NO cutout or grain (tumbling provides visual variety)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Nature attack effects
 * - Launching vine projectiles
 * - Offensive botanical power
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

/**
 * Naturebarrage gesture configuration
 * Orbiting vine projectiles launching outward
 */
const NATUREBARRAGE_CONFIG = {
    name: 'naturebarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Orbiting vine projectiles launching outward',
    duration: 1500,
    beats: 4,
    intensity: 1.3,
    category: 'afflicted',
    growth: 0.7,

    // 3D Element spawning - orbiting models launching upward
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center',
            endHeight: 'above',
            radius: 1.2,
            endRadius: 2.8,
            speed: 3,
            easing: 'easeIn',
            startScale: 1.0,
            endScale: 0.6,
            orientation: 'vertical'
        },
        formation: {
            type: 'ring',
            count: 5
        },
        count: 5,
        scale: 1.3,
        models: ['vine-cluster', 's-vine', 'u-vine', 'thorn-curl'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: {
                type: 'scale',
                duration: 0.08,
                easing: 'easeOutBack'
            },
            exit: {
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.3
            },
            pulse: {
                amplitude: 0.1,
                frequency: 5,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 2.0,
                frequency: 5,
                pattern: 'sine'
            },
            // Per-element tumbling - each spins on different axes for chaotic motion
            rotate: [
                { axis: 'x', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -3, phase: 40 },
                { axis: 'z', rotations: 2.5, phase: 100 },
                { axis: 'x', rotations: -2, phase: 180 },
                { axis: 'y', rotations: 3, phase: 250 }
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12
        }
    },

    // Glow - deep green for attack
    glowColor: [0.2, 0.65, 0.2],
    glowIntensityMin: 1.0,
    glowIntensityMax: 1.8,
    glowFlickerRate: 5,
    // Scale - slight expansion as elements launch
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrow: 0.02,
    // Tremor - aggressive energy
    tremor: 0.006,
    tremorFrequency: 5,
    decayRate: 0.15
    // NOTE: No cutout or grain for orbit gestures - tumbling provides visual variety
};

/**
 * Naturebarrage gesture - orbiting vine projectiles.
 *
 * Uses orbit spawn mode with ring formation:
 * - 5 nature models (vine-cluster, s-vine, u-vine, thorn-curl) at 72° offsets
 * - 3 revolutions with easeIn (slow orbit to fast launch)
 * - Per-element tumbling on x/y/z axes for dynamic motion
 * - Radius expands 1.2 to 2.8, height rises center to above
 * - Scale shrinks 1.0 to 0.6 as elements fly away
 * - ATTACK: mascot is projecting nature outward
 */
export default buildNatureEffectGesture(NATUREBARRAGE_CONFIG);
