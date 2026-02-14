/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Scorch Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Scorch gesture - core meltdown, internal heat escaping outward
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/scorch
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *
 *        🔥 🔥 🔥
 *       🔥  ★  🔥      ← Fire on mascot surface
 *        🔥 🔥 🔥        internal heat escaping
 *
 * FEATURES:
 * - Surface-spawned flames on mascot body
 * - Multiple fire model types for variety
 * - Mascot is VICTIM of fire (burning category)
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Intense heat exposure
 * - Being scorched/charred
 * - Internal combustion effect
 * - Core meltdown visualization
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Scorch gesture configuration
 * Core meltdown - internal heat escaping outward
 */
const SCORCH_CONFIG = {
    name: 'scorch',
    emoji: '🫠',
    type: 'blending',
    description: 'Core meltdown, internal heat escaping',
    duration: 1200,
    beats: 3,
    intensity: 1.3,
    category: 'burning',
    temperature: 0.8,

    // Surface spawn - flames on mascot body
    spawnMode: {
        type: 'surface',
        pattern: 'shell',
        embedDepth: 0.1,
        cameraFacing: 0.3,
        clustering: 0.2,
        count: 12,
        scale: 0.9,
        models: ['flame-wisp', 'ember-cluster'],
        minDistance: 0.12,
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.03,
            enter: {
                type: 'fade',
                duration: 0.12,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.5,
                    peak: 0.8,
                    end: 0.4,
                    curve: 'sustained'
                }
            },
            flicker: {
                intensity: 0.3,
                rate: 12,
                pattern: 'random'
            },
            emissive: {
                min: 1.5,
                max: 3.0,
                frequency: 6,
                pattern: 'sine'
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 7, scale: 1.5, weight: 1.0 },    // DISSOLVE
                secondary: { pattern: 5, scale: 1.2, weight: 0.4 },  // EMBERS
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 2.0,
                trailDissolve: {
                    offset: -0.1,
                    softness: 0.25
                }
            },
            grain: {
                type: 3,
                strength: 0.08,
                scale: 0.2,
                speed: 0.8,
                blend: 'multiply'
            },
            // Per-gesture atmospheric particles: smoke from scorched surface
            atmospherics: [{
                preset: 'smoke',
                targets: null,
                anchor: 'above',
                intensity: 0.3,
                sizeScale: 0.7,
                progressCurve: 'sustain',
            }],
            drift: {
                speed: 0.3,
                distance: 0.3,
                direction: { x: 0, y: 1, z: 0 },
                easing: 'easeOutCubic'
            },
            scaleVariance: 0.25,
            lifetimeVariance: 0.2,
            blending: 'additive',
            renderOrder: 12
        }
    },

    // Mesh effects - intense yellow/white heat
    flickerFrequency: 6,
    flickerAmplitude: 0.008,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.8, 0.3],     // Yellow-white
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.5,
    glowFlickerRate: 8,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    heatExpansion: 0.03,
    shimmerEffect: true,
    shimmerIntensity: 0.02
};

/**
 * Scorch gesture - core meltdown effect.
 *
 * Uses surface spawn mode:
 * - 12 flame-wisps and ember-clusters on mascot surface
 * - DISSOLVE + EMBERS cutout for burning texture
 * - Gentle upward drift as heat escapes
 */
export default buildFireEffectGesture(SCORCH_CONFIG);
