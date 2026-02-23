/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Drain Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voiddrain gesture - soul extraction through a dark portal
 * @module gestures/destruction/elemental/voiddrain
 *
 * VISUAL DIAGRAM:
 *
 *        ╭═══════╮           ← void-ring portal at top (flat, horizontal)
 *       ( ◉◉◉◉◉ )              the drain destination
 *        ╰═══════╯
 *           ○ ○              ← void-orbs ascending — drained energy rising
 *          ○   ○                from center up into the portal
 *           ★                ← mascot being drained
 *          /|\
 *         ·····              ← surface void-shards — drain damage
 *
 * CONCEPT: Energy extracted upward through a dark portal above the mascot.
 * A void-ring hovers at the top like a dark drain. Void-orbs rise from
 * the mascot's center up toward the portal — visible streams of drained
 * energy. Surface shards show the damage left behind.
 *
 * DESIGN NOTES:
 * - Layer 1 (portal) is stationary anchor with slow rotation — ominous presence
 * - Layer 2 (orbs) uses axis-travel center→above with spiral formation
 *   → ascending energy streams that get absorbed into the portal
 * - Surface spawn is sparse — drain is subtle, insidious
 * - Slowest category (absorption) — gradual, mournful energy loss
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDDRAIN_CONFIG = {
    name: 'voiddrain',
    emoji: '🕳️',
    type: 'blending',
    description: 'Soul extraction — energy drained upward through dark portal',
    duration: 3500,
    beats: 5,
    intensity: 0.7,
    category: 'absorption',
    depth: 0.4,
    distortionStrength: 0.002,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Dark Portal — void-ring hovering at top, the drain destination
        // Stationary but slowly rotating — ominous presence above the mascot
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'top',
                offset: { x: 0, y: 0.2, z: 0 },   // Higher than crown position
                orientation: 'flat',                // Horizontal — portal opening
                startScale: 0.3,
                endScale: 1.0,
                scaleEasing: 'easeOutCubic'
            },
            count: 1,
            scale: 0.9,                  // Moderate size — not as big as crown
            models: ['void-wrap'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: { type: 'scale', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 1.5, easing: 'easeInOut' },
                emissive: { min: 0.2, max: 0.6, frequency: 2, pattern: 'sine' },
                cutout: {
                    strength: 0.35,
                    primary: { pattern: 6, scale: 0.7, weight: 0.8 },    // SPIRAL — vortex pull
                    secondary: { pattern: 3, scale: 1.0, weight: 0.3 },  // VORONOI
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.0,
                    strengthCurve: 'bell',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.3,
                        softness: 1.0
                    }
                },
                atmospherics: [{
                    preset: 'darkness',
                    targets: ['void-wrap'],
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                }],
                rotate: { axis: 'z', rotations: 0.3, phase: 0 },   // Slow drain rotation
                blending: 'normal',
                renderOrder: 2,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,            // ROTATING_ARC
                            arcWidth: 0.5,      // Half-ring — portal vortex feel
                            arcSpeed: 1.0,      // Slow pull rotation
                            arcCount: 2         // Two arcs — symmetrical portal
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Drained Energy — 3 void-orbs ascending from center to above
        // Visible streams of energy being pulled upward into the portal
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'above',           // Rising toward the portal
                easing: 'easeIn',       // Accelerates upward — pulled into portal
                startScale: 1.0,
                endScale: 0.3,          // Shrinks as it gets absorbed
                startDiameter: 0.8,
                endDiameter: 0.4,       // Narrows — converges on portal
                orientation: 'camera'
            },
            formation: {
                type: 'spiral',
                count: 3,
                spacing: 0,
                arcOffset: 120,
                phaseOffset: 0.1
            },
            count: 3,
            scale: 0.5,
            models: ['void-orb'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.8,
                stagger: 0.12,          // Staggered — continuous stream feel
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'shrink', duration: 0.1, easing: 'easeInCubic' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                pulse: { amplitude: 0.1, frequency: 2, easing: 'easeInOut', perElement: true },
                emissive: { min: 0.15, max: 0.5, frequency: 3, pattern: 'sine' },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 3, scale: 0.5, weight: 1.0 },    // VORONOI — dissolving
                    blend: 'multiply',
                    travel: 'vertical',
                    travelSpeed: 2.0,
                    strengthCurve: 'fadeIn',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.5,
                        softness: 1.5
                    }
                },
                rotate: [
                    { axis: 'y', rotations: 1.0, phase: 0 },
                    { axis: 'y', rotations: 1.0, phase: 120 },
                    { axis: 'y', rotations: 1.0, phase: 240 }
                ],
                opacityGradient: [1.0, 0.8, 0.5],   // Fades as it rises
                scaleVariance: 0.2,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 3,
                modelOverrides: {
                    'void-orb': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.5,
                            arcSpeed: 1.5,
                            arcCount: 1
                        }
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Drain Damage — surface void-shards showing energy loss
        // Sparse, subtle — drain is insidious, not violent
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.2,
            cameraFacing: 0.2,
            clustering: 0.3,
            count: 5,
            scale: 0.9,
            models: ['void-shard', 'corruption-patch'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.9,
                stagger: 0.06,
                enter: { type: 'fade', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'shrink', duration: 0.12, easing: 'easeInCubic' },
                pulse: { amplitude: 0.08, frequency: 1, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.2, max: 0.5, frequency: 1.5, pattern: 'sine' },
                drift: { direction: 'inward', speed: 0.012, noise: 0.05 },
                rotate: { axis: 'y', speed: 0.015, oscillate: false },
                scaleVariance: 0.15,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 4,
                modelOverrides: {
                    'void-shard': {
                        drift: { direction: 'inward', speed: 0.015, noise: 0.05 },
                        opacityLink: 'dissipate'
                    },
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2 },
                                y: { expand: false, rate: 0.6 },
                                z: { expand: true, rate: 1.2 }
                            }
                        },
                        drift: { direction: 'outward-flat', speed: 0.01, adherence: 0.6 },
                        orientationOverride: 'flat'
                    }
                }
            }
        }
    ],

    // Absorption effects — slow, mournful
    dimRate: 0.3,
    dimPulse: true,
    pullStrength: 0.005,
    glowColor: [0.3, 0.2, 0.4],
    glowIntensityMin: 0.4,
    glowIntensityMax: 0.7,
    glowFlickerRate: 2,
    dimStrength: 0.25,
    scaleVibration: 0.01,
    scaleFrequency: 1.5,
    scaleShrink: 0.03,
    scalePulse: true,
    decayRate: 0.25
};

export default buildVoidEffectGesture(VOIDDRAIN_CONFIG);
