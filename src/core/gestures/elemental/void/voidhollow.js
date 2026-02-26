/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Hollow Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidhollow gesture - becoming empty inside, consumed from within
 * @module gestures/destruction/elemental/voidhollow
 *
 * VISUAL DIAGRAM:
 *
 *        ╭──────╮
 *       │╱  ──  ╲│          ← void-wraps slowly orbiting like visible gaps
 *       │  ◉◉◉◉  │            in the mascot's structure
 *       │   ★    │          ← void-orb growing at center — the expanding void
 *       │╲  ──  ╱│              consuming the mascot from inside out
 *        ╰──────╯
 *         ·····              ← surface void-cracks — structural failure
 *
 * CONCEPT: The mascot is becoming a hollow shell. The emptiness grows
 * from within — a void-orb at center slowly expanding. Void-wraps orbit
 * around the mascot at different heights like visible seams where the
 * hollowness peeks through. Surface void-cracks show structural failure.
 *
 * DESIGN NOTES:
 * - Slowest, most atmospheric gesture (4000ms, 6 beats)
 * - Very low intensity (0.8) — not violent, just... empty
 * - void-orb at center with cameraOffset — the "nothing inside" made visible
 * - void-wraps orbit at speed=0.5 (very slow) — eerie drifting, not spinning
 * - Surface cracks are structural, not corruption — shell pattern for even coverage
 * - Tremor on mascot sells "about to collapse" feeling
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDHOLLOW_CONFIG = {
    name: 'voidhollow',
    emoji: '👁️',
    type: 'blending',
    description: 'Becoming empty inside — the void grows from within',
    duration: 4000,
    beats: 6,
    intensity: 0.8,
    category: 'absorption',
    depth: 0.5,
    distortionStrength: 0, // No distortion — hollow is still, cold

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 1: The Emptiness — smaller void-disk at center
        // Darkness particles spawn in a ring around it, get sucked inward and consumed
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0 },
                cameraOffset: 2.5,
                orientation: 'camera',
            },
            count: 1,
            scale: 0.6,
            models: ['void-disk'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.9,
                stagger: 0,
                enter: { type: 'scale', duration: 0.3, easing: 'easeOut' },
                exit: { type: 'shrink', duration: 0.15, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.04, frequency: 0.8, easing: 'easeInOut' },
                atmospherics: [
                    {
                        preset: 'darkness',
                        targets: ['void-disk'],
                        anchor: 'around',
                        intensity: 0.8,
                        sizeScale: 0.5,
                        speedScale: 0.1, // Near-zero initial velocity — gravity does the work
                        lifetimeScale: 0.4, // Short-lived (0.8-1.6s) — consumed quickly
                        progressCurve: 'sustain',
                        gravity: {
                            strength: 1.5, // Strong inward pull
                            spawnRadius: 0.35, // Spawn in ring around disk — NOT at center
                        },
                    },
                ],
                scaleVariance: 0,
                lifetimeVariance: 0,
                blending: 'normal',
                renderOrder: 1,
                modelOverrides: {
                    'void-disk': {
                        diskMode: true,
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 2: Visible Seams — 2 void-wraps orbiting slowly at different heights
        // The hollowness peeking through cracks — eerie drifting fragments
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: -0.2,
                endHeight: 0.1,
                radius: 0.6,
                endRadius: 0.5,
                speed: 0.5, // Very slow orbit — eerie drift
                easing: 'linear',
                startScale: 0.6,
                endScale: 1.0,
                orientation: 'camera',
            },
            count: 2,
            scale: 0.4,
            models: ['void-wrap'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.8,
                stagger: 0.15,
                enter: { type: 'fade', duration: 0.2, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.05, frequency: 1.0, easing: 'easeInOut', perElement: true },
                emissive: { min: 0.15, max: 0.45, frequency: 1.5, pattern: 'sine' },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 0, scale: 0.8, weight: 0.7 }, // CELLULAR — organic gaps
                    secondary: { pattern: 6, scale: 0.6, weight: 0.3 }, // SPIRAL — subtle motion
                    blend: 'multiply',
                    travel: 'angular',
                    travelSpeed: 0.6,
                    strengthCurve: 'constant',
                    trailDissolve: {
                        enabled: true,
                        offset: -0.3,
                        softness: 1.0,
                    },
                },
                atmospherics: [
                    {
                        preset: 'darkness',
                        targets: ['void-wrap'],
                        anchor: 'around',
                        intensity: 0.4,
                        sizeScale: 0.4,
                        progressCurve: 'rampUp',
                    },
                ],
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 3,
                modelOverrides: {
                    'void-wrap': {
                        shaderAnimation: {
                            type: 1,
                            arcWidth: 0.4,
                            arcSpeed: 0.5, // Crawling rotation
                            arcCount: 1,
                        },
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // LAYER 3: Structural Failure — surface void-cracks as the shell breaks
        // Even shell coverage — the WHOLE mascot is hollowing out, not just patches
        // ═══════════════════════════════════════════════════════════════════════════════════
        {
            type: 'surface',
            pattern: 'shell', // Even coverage — whole mascot is failing
            embedDepth: 0.25, // Deep embed — cracks go INTO the shell
            cameraFacing: 0.15, // Mostly surface-aligned — structural
            clustering: 0.4,
            count: 5,
            scale: 0.8,
            models: ['void-crack', 'void-shard'],
            minDistance: 0.18,
            animation: {
                appearAt: 0.15,
                disappearAt: 0.9,
                stagger: 0.08, // Slow progression — cracks spread gradually
                enter: { type: 'grow', duration: 0.2, easing: 'easeOutQuad' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                pulse: { amplitude: 0.04, frequency: 0.8, easing: 'easeInOut', sync: 'global' },
                emissive: { min: 0.2, max: 0.5, frequency: 1, pattern: 'sine' },
                atmospherics: [
                    {
                        preset: 'darkness',
                        targets: null,
                        anchor: 'around',
                        intensity: 0.3,
                        sizeScale: 0.3,
                        progressCurve: 'rampUp',
                    },
                ],
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 5,
                modelOverrides: {
                    'void-crack': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.3 },
                                y: { expand: true, rate: 1.1 },
                                z: { expand: true, rate: 0.9 },
                            },
                        },
                    },
                    'void-shard': {
                        opacityLink: 'dissipate',
                    },
                },
            },
        },
    ],

    // Absorption effects — cold, empty, trembling
    hollowCore: true,
    hollowProgress: 0.7,
    glowColor: [0.25, 0.25, 0.35], // Cold gray-purple — not warm corruption
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.75,
    glowFlickerRate: 1.5, // Very slow — emptiness doesn't flicker
    dimStrength: 0.2,
    scaleVibration: 0.008,
    scaleFrequency: 1,
    scaleShrink: 0.02,
    scalePulse: true,
    tremor: 0.003,
    tremorFrequency: 6,
    decayRate: 0.2,
};

export default buildVoidEffectGesture(VOIDHOLLOW_CONFIG);
