/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Corrupt Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidcorrupt gesture - descending spiral of darkness
 * @module gestures/destruction/elemental/voidcorrupt
 *
 * VISUAL DIAGRAM:
 *
 *     ╭─────────────╮         ← Wide void-wraps at the top
 *      ╲           ╱            falling and tightening
 *       ╲    ↓    ╱
 *        ╲  ★  ╱              ← Darkness engulfs mascot
 *         ╲│╱
 *          ·                  ← Surface corruption-patches
 *         ·····                 where the darkness has landed
 *
 * CONCEPT: Darkness descends from above and engulfs the mascot.
 * Horizontal void-wraps spiral DOWN in a tightening funnel —
 * wide at the top, tight at the bottom. As they descend, corruption
 * patches erupt on the mascot's surface where the darkness touches.
 *
 * DESIGN NOTES:
 * - UNIQUE: Only void gesture with DOWNWARD motion
 * - Flat orientation — horizontal ring wraps descending like a closing iris
 * - Tightening diameter: 2.2 at top → 0.6 at bottom = funnel/noose
 * - Counter-clockwise rotation — ominous, unnatural
 * - Surface layer delayed — corruption arrives after the darkness
 * - Fade exit everywhere — no snap on cleanup
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDCORRUPT_CONFIG = {
    name: 'voidcorrupt',
    emoji: '🦠',
    type: 'blending',
    description: 'Descending corruption — darkness spirals down and engulfs',
    duration: 3000,
    beats: 5,
    intensity: 1.2,
    category: 'corruption',
    depth: 0.6,
    distortionStrength: 0.003,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: Descending Spiral — void-wraps falling from above
        // Horizontal rings funneling down like a dark vortex closing in
        // Wide at top, tight at bottom — the noose tightens
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'above',          // Starts HIGH — darkness descends
                end: 'bottom',           // Falls DOWN — unique among void gestures
                easing: 'easeIn',        // Accelerates — gravity pulling darkness
                startScale: 1.2,         // Large at top
                endScale: 0.6,           // Compressed at bottom
                startDiameter: 2.2,      // Wide at top
                endDiameter: 0.6,        // Tight at bottom — funnel closes
                orientation: 'flat'      // Horizontal rings
            },
            formation: {
                type: 'spiral',
                count: 5,
                spacing: 0.1,
                arcOffset: 72,           // 360/5 = evenly spaced
                phaseOffset: 0.06
            },
            count: 5,
            scale: 0.9,
            models: ['void-wrap'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.65,
                stagger: 0.06,
                enter: { type: 'fade', duration: 0.1, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.4, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.1, frequency: 3, easing: 'easeInOut', perElement: true },
                emissive: { min: 0.2, max: 0.6, frequency: 4, pattern: 'sine' },
                cutout: {
                    strength: 0.45,
                    primary: { pattern: 6, scale: 1.0, weight: 0.7 },    // SPIRAL — vortex
                    secondary: { pattern: 3, scale: 0.8, weight: 0.4 },  // VORONOI — organic
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 1.5,
                    strengthCurve: 'bell',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.4,
                        softness: 1.3
                    }
                },
                atmospherics: [{
                    preset: 'darkness',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.6,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.3,
                }],
                rotate: [
                    { axis: 'y', rotations: -2, phase: 0 },
                    { axis: 'y', rotations: -2, phase: 72 },
                    { axis: 'y', rotations: -2, phase: 144 },
                    { axis: 'y', rotations: -2, phase: 216 },
                    { axis: 'y', rotations: -2, phase: 288 }
                ],
                scaleVariance: 0.2,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 3,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,            // ROTATING_ARC
                            arcWidth: 0.5,
                            arcSpeed: 1.5,
                            arcCount: 2
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Surface Scars — corruption marks where darkness has landed
        // Delayed appearance — the darkness must reach the mascot first
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.15,
            cameraFacing: 0.2,
            clustering: 0.5,
            count: 5,
            scale: 0.9,
            models: ['corruption-patch', 'void-crack'],
            minDistance: 0.12,
            animation: {
                appearAt: 0.2,           // Delayed — corruption arrives after darkness
                disappearAt: 0.75,
                stagger: 0.08,
                enter: { type: 'grow', duration: 0.15, easing: 'easeOutQuad' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                pulse: { amplitude: 0.06, frequency: 2, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.2, max: 0.5, frequency: 2, pattern: 'sine' },
                atmospherics: [{
                    preset: 'darkness',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.3,
                    sizeScale: 0.4,
                    progressCurve: 'rampUp',
                }],
                scaleVariance: 0.2,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.3 },
                                y: { expand: false, rate: 0.5 },
                                z: { expand: true, rate: 1.3 }
                            }
                        },
                        orientationOverride: 'flat'
                    },
                    'void-crack': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2 },
                                y: { expand: true, rate: 1.0 },
                                z: { expand: true, rate: 0.8 }
                            }
                        }
                    }
                }
            }
        }
    ],

    // Corruption effects — aggressive, descending
    glowColor: [0.15, 0.05, 0.2],
    glowIntensityMin: 0.4,
    glowIntensityMax: 0.7,
    glowFlickerRate: 4,
    dimStrength: 0.3,
    scaleVibration: 0.02,
    scaleFrequency: 5,
    scalePulse: true,
    jitterAmount: 0.006,
    jitterFrequency: 7,
    decayRate: 0.22
};

export default buildVoidEffectGesture(VOIDCORRUPT_CONFIG);
