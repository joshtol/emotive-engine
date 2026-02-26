/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Helix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Voidhelix gesture - DNA double helix of void fragments spiraling upward
 * @module gestures/destruction/elemental/voidhelix
 *
 * VISUAL DIAGRAM:
 *       ◉             ○        TOP — wide funnel, large fragments
 *          ○       ◉
 *           ◉   ○
 *            ○ ◉                ← Counter-rotating strands
 *            ◉○                    wraps + orbs + cracks
 *            ★                  BOTTOM — tight seed
 *           /|\
 *
 * CONCEPT: Dark matter DNA — two counter-rotating strands of mixed void
 * fragments (wraps, orbs, cracks) spiral upward in a double helix.
 * Starts as a tight seed at the feet, expands dramatically as it rises.
 * Small numerous fragments vs voiddance's few large flat rings.
 *
 * DISTINCT FROM VOIDDANCE:
 * - Dance = 3 large FLAT RINGS spinning like coins, gentle rise
 * - Helix = 10 small BILLBOARD FRAGMENTS in counter-rotating DNA spiral
 * - Dance = wide from start, uniform sizes
 * - Helix = tight seed → dramatic funnel expansion, varied sizes
 * - Dance = all same model (void-wrap), same orientation
 * - Helix = mixed models (wrap/orb/crack), billboard facing camera
 *
 * FEATURES:
 * - 10 fragments in true double helix (180° offset, 5 per strand)
 * - Strand A = void-wrap (wraith tendrils), counter-clockwise
 * - Strand B = void-orb + void-crack (dark masses + sharp shards), clockwise
 * - Dramatic funnel: 0.4 tight → 3.0 wide (much more extreme than dance)
 * - Camera billboard — ghostly floating dark matter vs dance's flat rings
 * - 4 full counter-rotations per strand — dense tight spiral
 * - CELLULAR + VORONOI cutout — organic fracturing (vs dance's spiral+dissolve)
 * - Rapid sequential appearance — DNA "unzipping" effect
 */

import { buildVoidEffectGesture } from './voidEffectFactory.js';

const VOIDHELIX_CONFIG = {
    name: 'voidhelix',
    emoji: '🧬',
    type: 'blending',
    description: 'DNA double helix of void fragments counter-spiraling upward',
    duration: 2000,
    beats: 4,
    intensity: 1.2,
    category: 'manifestation',
    depth: 0.6,

    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',
            easing: 'easeInOut',
            startScale: 0.7, // Visible at bottom — seed of corruption
            endScale: 2.0, // Large at top — fully manifested
            startDiameter: 0.4, // Very tight at bottom — dramatic funnel
            endDiameter: 3.0, // Very wide at top — 7.5× expansion ratio
            orientation: 'camera', // Billboard — floating dark matter
        },
        formation: {
            type: 'spiral',
            count: 10,
            strands: 2,
            spacing: 0.08, // Dense packing — tight helix rungs
            arcOffset: 180, // True double helix — strands opposite
            phaseOffset: 0.03,
        },
        count: 10,
        scale: 1.2, // Larger fragments — visible dark matter (vs dance's 1.0)
        // Strand A (even indices): void-wrap — wraith tendrils
        // Strand B (odd indices): alternating void-orb + void-crack — dark mass + sharp shards
        models: [
            'void-wrap',
            'void-orb',
            'void-wrap',
            'void-crack',
            'void-wrap',
            'void-orb',
            'void-wrap',
            'void-crack',
            'void-wrap',
            'void-orb',
        ],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.4, // Early exit — all 10 elements fully gone before gesture end
            stagger: 0.02, // Rapid sequential — DNA unzipping effect
            enter: {
                type: 'scale',
                duration: 0.1,
                easing: 'easeOut',
            },
            exit: {
                type: 'fade',
                duration: 0.4,
                easing: 'easeIn',
            },
            procedural: {
                scaleSmoothing: 0.08,
                geometryStability: true,
            },
            pulse: {
                amplitude: 0.12,
                frequency: 4,
                easing: 'easeInOut',
                perElement: true, // Each fragment pulses independently
            },
            emissive: {
                min: 0.15,
                max: 0.55,
                frequency: 4,
                pattern: 'sine',
            },
            cutout: {
                strength: 0.4,
                primary: { pattern: 0, scale: 1.0, weight: 0.7 }, // CELLULAR — organic fracturing
                secondary: { pattern: 3, scale: 0.8, weight: 0.5 }, // VORONOI — cracked cells (vs dance's spiral)
                blend: 'multiply',
                travel: 'angular',
                travelSpeed: 3.0,
                strengthCurve: 'bell',
                bellPeakAt: 0.5,
                trailDissolve: {
                    enabled: true,
                    offset: -0.5,
                    softness: 1.5,
                },
            },
            atmospherics: [
                {
                    preset: 'darkness',
                    targets: null,
                    anchor: 'around',
                    intensity: 0.6,
                    sizeScale: 0.8, // Smaller wisps — matching smaller fragments
                    progressCurve: 'sustain',
                    velocityInheritance: 0.5,
                    centrifugal: { speed: 0.8, tangentialBias: 0.4 },
                },
            ],
            // Per-strand counter-rotation: strand A clockwise, strand B counter-clockwise
            // Creates visible "unwinding DNA" motion vs dance's same-direction spin
            rotate: [
                { axis: 'y', rotations: 4, phase: 0 }, // strand A ↻
                { axis: 'y', rotations: -4, phase: 180 }, // strand B ↺
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
                { axis: 'y', rotations: 4, phase: 0 },
                { axis: 'y', rotations: -4, phase: 180 },
            ],
            scaleVariance: 0.3, // High variance — organic, uneven fragments
            lifetimeVariance: 0.1,
            blending: 'normal',
            renderOrder: 3,
            modelOverrides: {
                'void-wrap': {
                    shaderAnimation: {
                        type: 1, // ROTATING_ARC
                        arcWidth: 0.35, // Narrow arcs — wraith-like tendrils
                        arcSpeed: 2.0, // Faster — agitated
                        arcCount: 2,
                    },
                },
                'void-orb': {
                    shaderAnimation: {
                        type: 1, // ROTATING_ARC
                        arcWidth: 0.7, // Wide arcs — solid dark mass
                        arcSpeed: 0.8, // Slow — heavy, ponderous
                        arcCount: 1,
                    },
                },
                'void-crack': {
                    shaderAnimation: {
                        type: 1, // ROTATING_ARC
                        arcWidth: 0.5, // Medium arcs — jagged shards
                        arcSpeed: 1.2,
                        arcCount: 3, // More arcs — fragmented, splintered
                    },
                },
            },
        },
    },

    jitterAmount: 0,
    jitterFrequency: 0,
    decayRate: 0.2,
    glowColor: [0.25, 0.1, 0.35],
    glowIntensityMin: 0.5,
    glowIntensityMax: 0.8,
    glowFlickerRate: 3,
    dimStrength: 0.25,
    scaleVibration: 0.01,
    scaleFrequency: 3,
    scalePulse: true,
    rotationDrift: 0.01,
};

export default buildVoidEffectGesture(VOIDHELIX_CONFIG);
