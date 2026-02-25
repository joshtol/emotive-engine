/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Root Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Natureroot gesture - flat vine rings burrowing into the ground
 * @module gestures/destruction/elemental/root
 *
 * CONCEPT: Root system burrowing — flat vine-rings descend from center into
 * the ground, narrowing as they go. Surface tendrils grip the mascot base,
 * growing downward as the roots dig deeper.
 *
 * Layer 1: 5 flat vine-rings descending center → below (funneling into earth)
 * Layer 2: Surface root tendrils — vine-twist, s-vine gripping the lower body,
 *          drifting downward as the root system spreads.
 *
 * The drama is the descent itself — rings accelerate (easeIn) as roots
 * find purchase, and the surface grips anchor the root system to the mascot.
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

const NATUREROOT_CONFIG = {
    name: 'natureroot',
    emoji: '🌱',
    type: 'blending',
    description: 'Root system burrowing — vine rings descend while surface tendrils anchor below',
    duration: 2000,
    beats: 4,
    intensity: 1.0,
    category: 'afflicted',
    growth: 0.6,

    spawnMode: [
        // ── Layer 1: 5 flat vine-rings descending center → below ──
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'center',
                end: 'bottom',
                endOffset: -0.1,
                easing: 'easeIn',
                startScale: 1.0,
                endScale: 1.0,
                startDiameter: 1.0,
                endDiameter: 1.0,
                diameterUnit: 'mascot',
                holdAt: 0.75,
                orientation: 'flat'
            },
            formation: {
                type: 'spiral',
                count: 5,
                spacing: 0.12,
                arcOffset: 72,
                phaseOffset: 0.03
            },
            count: 5,
            scale: 1.3,
            models: ['vine-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.95,
                stagger: 0.06,
                enter: {
                    type: 'scale',
                    duration: 0.1,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'fade',
                    duration: 0.1,
                    easing: 'easeIn'
                },
                procedural: {
                    scaleSmoothing: 0.06,
                    geometryStability: true
                },
                parameterAnimation: {
                    growth: {
                        start: 0.4,
                        peak: 0.75,
                        end: 0.5,
                        curve: 'bell'
                    }
                },
                pulse: {
                    amplitude: 0.04,
                    frequency: 2,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.4,
                    max: 0.8,
                    frequency: 2,
                    pattern: 'sine'
                },
                cutout: {
                    strength: 0.55,
                    primary: { pattern: 8, scale: 1.2, weight: 1.0 },
                    secondary: { pattern: 3, scale: 1.5, weight: 0.4 },
                    blend: 'max',
                    travel: 'vertical',
                    travelSpeed: 1.5,
                    strengthCurve: 'fadeIn'
                },
                grain: {
                    type: 3,
                    strength: 0.15,
                    scale: 0.25,
                    speed: 0.5,
                    blend: 'multiply'
                },
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.35,
                    sizeScale: 0.8,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.2
                }],
                rotate: [
                    { axis: 'z', rotations: 0.5, phase: 0 },
                    { axis: 'z', rotations: -0.8, phase: 72 },
                    { axis: 'z', rotations: 0.6, phase: 144 },
                    { axis: 'z', rotations: -0.4, phase: 216 },
                    { axis: 'z', rotations: 0.7, phase: 288 }
                ],
                scaleVariance: 0.1,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 12,
                modelOverrides: {
                    'vine-ring': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.6,
                            arcSpeed: 1.0,
                            arcCount: 1
                        },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ── Layer 2: Surface root tendrils gripping mascot lower body ──
        {
            type: 'surface',
            pattern: 'crown',
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.15,
            minDistance: 0.15,
            count: 5,
            scale: 0.9,
            models: ['vine-twist', 's-vine', 'thorn-curl'],
            animation: {
                appearAt: 0.12,
                disappearAt: 0.85,
                stagger: 0.06,
                enter: { type: 'grow', duration: 0.15, easing: 'easeOutCubic' },
                exit: { type: 'shrink', duration: 0.15, easing: 'easeIn' },
                pulse: { amplitude: 0.05, frequency: 2, easing: 'easeInOut' },
                emissive: { min: 0.3, max: 0.7, frequency: 2, pattern: 'sine' },
                drift: { direction: 'down', speed: 0.01, noise: 0.06 },
                scaleVariance: 0.2,
                blending: 'normal',
                renderOrder: 8,
                modelOverrides: {
                    'vine-twist': {
                        scaling: { mode: 'non-uniform', axes: { x: 1.1, y: 0.7, z: 1.1 } }
                    },
                    's-vine': {
                        scaling: { mode: 'non-uniform', axes: { x: 0.7, y: 1.4, z: 0.7 } }
                    }
                }
            }
        }
    ],

    glowColor: [0.35, 0.5, 0.2],
    glowIntensityMin: 0.45,
    glowIntensityMax: 0.7,
    glowFlickerRate: 2,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 3,
    decayRate: 0.2,

    // Roots dig deeper, settle at hold
    parameterAnimation: {
        growth: {
            keyframes: [
                { at: 0.0, value: 0.2 },
                { at: 0.3, value: 0.6 },
                { at: 0.6, value: 0.75 },
                { at: 0.85, value: 0.5 },
                { at: 1.0, value: 0.0 }
            ]
        }
    }
};

export default buildNatureEffectGesture(NATUREROOT_CONFIG);
