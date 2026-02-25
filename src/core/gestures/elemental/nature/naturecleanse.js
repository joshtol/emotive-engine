/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Naturecleanse Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Naturecleanse gesture - purification scanner with vine sandwich
 * @module gestures/destruction/elemental/naturecleanse
 *
 * CONCEPT: A vine-ring scans upward through the mascot like a purification beam,
 * sandwiched between two u-vine wreaths spinning faster above and below it.
 * The three layers travel together, cleansing nature energy as they pass.
 *
 * Layer 1: vine-ring (center) — main purification scanner, 1 rotation
 * Layer 2: u-vine (above) — fast-spinning wreath above the ring, 3 rotations
 * Layer 3: u-vine (below) — fast-spinning wreath below the ring, 2 rotations, phase offset
 *
 * ORIENTATION NOTES:
 * - vine-ring: natively XY plane → 'flat' (90° X) makes it horizontal
 * - u-vine: natively XZ plane → 'vertical' (identity) keeps it horizontal
 *   Uses verticalEdgeAlign: false to skip the ring edge-alignment Y offset
 * - vine-ring rotation uses axis 'z' (flat's 90° X remaps local Z → world -Y)
 * - u-vine rotation uses axis 'y' directly (identity orientation, no remap)
 */

import { buildNatureEffectGesture } from './natureEffectFactory.js';

// Shared animation settings for all layers
const SHARED_ANIMATION = {
    blending: 'normal',
    renderOrder: 15
};

const NATURECLEANSE_CONFIG = {
    name: 'naturecleanse',
    emoji: '🌿',
    type: 'blending',
    description: 'Purification scanner — vine-ring sandwiched by spinning u-vine wreaths',
    duration: 3000,
    beats: 4,
    intensity: 1.4,
    category: 'afflicted',
    growth: 0.85,
    mascotGlow: 1.2,          // opt-in: mascot overlay emits green during this gesture

    // Three-layer sandwich: vine-ring center + u-vine above + u-vine below
    spawnMode: [
        // ── Layer 1: Vine-ring (purification scanner) — 1 rotation ──
        {
            type: 'axis-travel',
            axisTravel: {
                start: 'bottom',
                end: 'top',
                easing: 'easeInOut',
                holdAt: 0.85,
                orientation: 'flat',      // vine-ring is natively XY — 90° X to lie flat
                diameterUnit: 'mascot',
                uniformDiameter: true,    // scale all axes equally (preserve proportions)
                startDiameter: 1.3,       // 30% wider than mascot
            },
            count: 1,
            scale: 1.0,
            models: ['vine-ring'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                // axis 'z' because flat's 90° X maps local Z → world -Y (record spin)
                rotate: { axis: 'z', rotations: 1.0 },
                // Dense falling leaves from the scanner ring
                atmospherics: [{
                    preset: 'falling-leaves',
                    targets: ['vine-ring'],
                    anchor: 'around',
                    intensity: 0.7,
                    sizeScale: 1.0,
                    progressCurve: 'sustain',
                    velocityInheritance: 0.3,
                }]
            }
        },
        // ── Layer 2: U-vine above the ring — 3 rotations ──
        {
            type: 'axis-travel',
            axisTravel: {
                start: 'bottom',
                end: 'top',
                startOffset: 0.25,
                endOffset: 0.25,
                easing: 'easeInOut',
                holdAt: 0.85,
                orientation: 'vertical',  // u-vine is natively XZ — identity keeps it flat
                verticalEdgeAlign: false, // skip ring edge-alignment offset (not a ring)
                diameterUnit: 'mascot',
                uniformDiameter: true,    // scale all axes equally (preserve proportions)
                startDiameter: 1.1,
            },
            count: 1,
            scale: 1.0,
            models: ['u-vine'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                rotate: { axis: 'y', rotations: 3.0 }
            }
        },
        // ── Layer 3: U-vine below the ring — 2 rotations, 180° phase ──
        {
            type: 'axis-travel',
            axisTravel: {
                start: 'bottom',
                end: 'top',
                startOffset: -0.25,
                endOffset: -0.25,
                easing: 'easeInOut',
                holdAt: 0.85,
                orientation: 'vertical',  // u-vine is natively XZ — identity keeps it flat
                verticalEdgeAlign: false, // skip ring edge-alignment offset (not a ring)
                diameterUnit: 'mascot',
                uniformDiameter: true,    // scale all axes equally (preserve proportions)
                startDiameter: 1.1,
            },
            count: 1,
            scale: 1.0,
            models: ['u-vine'],
            animation: {
                ...SHARED_ANIMATION,
                appearAt: 0.0,
                disappearAt: 0.85,
                enter: {
                    type: 'scale',
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'scale',
                    duration: 0.2,
                    easing: 'easeIn'
                },
                rotate: { axis: 'y', rotations: 2.0, phase: 180 }
            }
        }
    ],

    // Enhanced glow for cleansing effect
    decayRate: 0.12,
    glowColor: [0.3, 0.85, 0.25],
    glowIntensityMin: 1.2,
    glowIntensityMax: 2.0,
    glowFlickerRate: 3,
    scaleVibration: 0.008,
    scaleFrequency: 2,
    tremor: 0.002,
    tremorFrequency: 2,

    // Parameter animation: growth builds then bursts at climax
    parameterAnimation: {
        growth: {
            keyframes: [
                { at: 0.0, value: 0.4 },
                { at: 0.3, value: 0.85 },
                { at: 0.6, value: 0.7 },
                { at: 0.78, value: 1.0 },
                { at: 0.88, value: 0.5 },
                { at: 0.92, value: 0.95 },
                { at: 1.0, value: 0.0 }
            ]
        },
        tremor: {
            keyframes: [
                { at: 0.0, value: 0.002 },
                { at: 0.75, value: 0.002 },
                { at: 0.85, value: 0.008 },
                { at: 0.95, value: 0.012 },
                { at: 1.0, value: 0.0 }
            ]
        },
        scaleVibration: {
            keyframes: [
                { at: 0.0, value: 0.008 },
                { at: 0.75, value: 0.008 },
                { at: 0.85, value: 0.025 },
                { at: 0.95, value: 0.04 },
                { at: 1.0, value: 0.0 }
            ]
        }
    }
};

export default buildNatureEffectGesture(NATURECLEANSE_CONFIG);
