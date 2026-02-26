/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firebarrage Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firebarrage gesture - fire models orbit mascot then launch upward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firebarrage
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *          🔥↗   🔥↗          FIRE LAUNCHED UPWARD
 *        🔥↗       🔥↗
 *         ╭─🔥─╮              ← Flames orbit close,
 *         │ ★  │                tumbling as they go,
 *         ╰─🔥─╯                then fly upward & out
 *
 * FEATURES:
 * - 5 fire models (no ring) orbiting mascot
 * - Ring formation at 72° offsets with active orbital rotation
 * - Per-element tumbling rotation on multiple axes
 * - Elements start close at center height, orbit outward + upward
 * - 3 full revolutions with easeIn (slow orbit → fast launch)
 * - Burst-fade exit as they launch away
 * - ATTACK gesture: mascot is projecting fire outward
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Fire attack effects
 * - Launching fire projectiles
 * - Offensive fire power
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firebarrage gesture configuration
 * Fire models orbit mascot then launch upward and outward
 */
const FIREBARRAGE_CONFIG = {
    name: 'firebarrage',
    emoji: '🏹',
    type: 'blending',
    description: 'Fire orbits mascot then launches upward',
    duration: 1500,
    beats: 4,
    intensity: 1.4,
    category: 'radiating',
    temperature: 0.8,

    // 3D Element spawning - orbiting flames launching upward
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
        scale: 1.8,
        models: ['flame-wisp', 'flame-tongue', 'ember-cluster'],
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
                temperature: {
                    start: 0.6,
                    peak: 0.9,
                    end: 0.4,
                    curve: 'fadeOut', // Heat fades as flames launch
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
            // Per-gesture atmospheric particles: smoke trailing from orbiting flames
            atmospherics: [
                {
                    preset: 'smoke',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.25,
                    sizeScale: 0.6,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.7,
                },
            ],
            // Per-element tumbling — each spins on different axes for chaotic, dynamic motion
            rotate: [
                { axis: 'x', rotations: 2, phase: 0 },
                { axis: 'y', rotations: -3, phase: 40 },
                { axis: 'z', rotations: 2.5, phase: 100 },
                { axis: 'x', rotations: -2, phase: 180 },
                { axis: 'y', rotations: 3, phase: 250 },
            ],
            scaleVariance: 0.2,
            lifetimeVariance: 0.1,
            blending: 'additive',
            renderOrder: 12,
        },
    },

    // Mesh effects - aggressive fire
    flickerFrequency: 14,
    flickerAmplitude: 0.012,
    glowColor: [1.0, 0.5, 0.15],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowFlickerRate: 8,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scaleGrowth: 0.02,
};

/**
 * Firebarrage gesture - fire orbits then launches upward.
 *
 * Uses orbit spawn mode with ring formation:
 * - 5 fire models (no ring) at 72° offsets
 * - 3 revolutions with easeIn (slow orbit → fast launch)
 * - Per-element tumbling on x/y/z axes for dynamic motion
 * - Radius expands 1.2 → 2.8, height rises center → above
 * - Scale shrinks 1.0 → 0.6 as flames fly away
 * - ATTACK: mascot is projecting fire outward
 */
export default buildFireEffectGesture(FIREBARRAGE_CONFIG);
