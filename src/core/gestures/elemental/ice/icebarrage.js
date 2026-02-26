/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icebarrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icebarrage gesture - ice crystals orbit mascot then launch upward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icebarrage
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *          ❄↗   ❄↗          ICE LAUNCHED UPWARD
 *        ❄↗       ❄↗
 *         ╭─❄─╮              ← Crystals orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─❄─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 ice crystal models (no ring) orbiting mascot
 * - Ring formation at 72° offsets with active orbital rotation
 * - Per-crystal tumbling rotation on multiple axes
 * - Crystals start close at center height, orbit outward + upward
 * - 3 full revolutions with easeIn (slow orbit → fast launch)
 * - Burst-fade exit as they launch away
 * - ATTACK gesture: mascot is projecting ice outward
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Ice attack effects
 * - Launching ice projectiles
 * - Offensive ice power
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icebarrage gesture configuration
 * Ice crystals orbit mascot then launch upward and outward
 */
const ICEBARRAGE_CONFIG = {
    name: 'icebarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Ice crystals orbit mascot then launch upward',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    category: 'transform',
    frost: 0.75,

    // 3D Element spawning - orbiting crystals launching upward
    spawnMode: {
        type: 'orbit',
        orbit: {
            height: 'center', // Start at mascot center
            endHeight: 'above', // Launch upward
            radius: 1.2, // Close orbit at start
            endRadius: 2.8, // Expand outward as they launch
            speed: 3, // 3 full revolutions
            easing: 'easeIn', // Slow orbit → fast launch
            startScale: 1.0,
            endScale: 0.6, // Shrink as they fly away
            orientation: 'vertical',
        },
        formation: {
            type: 'ring',
            count: 5,
        },
        count: 5,
        scale: 1.4,
        models: ['crystal-cluster', 'crystal-medium', 'crystal-small', 'ice-spike'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.65,
            stagger: 0.04,
            enter: {
                type: 'scale',
                duration: 0.08,
                easing: 'easeOutBack',
            },
            exit: {
                type: 'burst-fade',
                duration: 0.15,
                easing: 'easeIn',
                burstScale: 1.3, // Pop outward on exit
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            parameterAnimation: {
                frost: {
                    start: 0.6,
                    peak: 0.85,
                    end: 0.4,
                    curve: 'fadeOut', // Frost fades as crystals launch
                },
            },
            pulse: {
                amplitude: 0.12,
                frequency: 6,
                easing: 'easeInOut',
            },
            emissive: {
                min: 1.0,
                max: 2.2,
                frequency: 6,
                pattern: 'sine',
            },
            // Per-gesture atmospheric particles: cold mist from orbiting crystals
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
            // Per-crystal tumbling — each spins on different axes for chaotic, dynamic motion
            rotate: [
                { axis: 'x', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -3, phase: 40 },
                { axis: 'z', rotations: 2.5, phase: 100 },
                { axis: 'x', rotations: -2, phase: 180 },
                { axis: 'y', rotations: 3, phase: 250 },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 12,
        },
    },

    // Glow - intense ice blue for attack
    glowColor: [0.5, 0.8, 1.0],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowFlickerRate: 6,
    // Scale - slight expansion as crystals launch
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrowth: 0.02,
    // Tremor - aggressive energy
    tremor: 0.006,
    tremorFrequency: 5,
};

/**
 * Icebarrage gesture - ice crystals orbit then launch upward.
 *
 * Uses orbit spawn mode with ring formation:
 * - 5 crystal models (no ring) at 72° offsets
 * - 3 revolutions with easeIn (slow orbit → fast launch)
 * - Per-crystal tumbling on x/y/z axes for dynamic motion
 * - Radius expands 1.2 → 2.8, height rises center → above
 * - Scale shrinks 1.0 → 0.6 as crystals fly away
 * - ATTACK: mascot is projecting ice outward
 */
export default buildIceEffectGesture(ICEBARRAGE_CONFIG);
