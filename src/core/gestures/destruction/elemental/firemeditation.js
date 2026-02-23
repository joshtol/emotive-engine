/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firemeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firemeditation gesture - triple concentric flame hexagons
 * @module gestures/destruction/elemental/firemeditation
 *
 * CONCEPT: Three concentric Star-of-David hexagons (inner / middle / outer), each built
 * from two interlocked triangles — DOUBLED with a counter-rotating mirror set. 36 rings
 * total. Each layer has a 120° arc-phase offset; the counter set adds another 180° offset
 * so arcs appear on both sides of every ring. Inner spins fastest, outer slowest.
 *
 * RELAY WAVE: All 36 rings are always visible (relay floor=0.5). A brightness wave
 * sweeps through 3 relay steps, but the indices are STAGGERED across hexagons
 * (inner [0,1,2], middle [1,2,0], outer [2,0,1]) creating a rotating diagonal band
 * of peak brightness — the fire appears to spiral through the mandala.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

const SHARED_ANCHOR = {
    landmark: 'center',
    orientation: 'camera',
    cameraOffset: 1.0,
    relativeOffset: true,
    startScale: 1.0,
    endScale: 1.0
};

const SHARED_ANIMATION = {
    disappearAt: 0.85,
    enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
    exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
    emissive: { min: 1.0, max: 1.0, frequency: 0, pattern: 'sine' },
    blending: 'normal',
    renderOrder: 10,
    relay: { count: 3, arcWidth: Math.PI, floor: 0.5 }  // 3-step spiral wave, all rings always visible
};

/**
 * Generate 6 rings forming a Star-of-David hexagon at a given radius.
 * Two interlocked equilateral triangles, relay-paired (top/bottom, left pair, right pair).
 * @param {number[]} relayIndices - Relay indices for each vertex pair [top/bot, right, left]
 *   Staggering these across hexagons creates a spiral brightness wave through the mandala.
 * @param {number} delay - appearAt delay (0 = immediate, 0.08 = 8% into gesture) for blooming entrance
 */
function createHexLayer(radius, ringScale, baseRotations, arcPhaseOffset, relayIndices, delay = 0, atmospherics = null) {
    const S = 0.866; // sin(60°)
    const round = v => Math.round(v * 100) / 100;

    //                     position                    relay           arcBase  CW/CCW
    const rings = [
        // Triangle 1 (upright)
        { x: 0,        y: radius,      relay: relayIndices[0], arc: 4.71, dir: -1 }, // top
        { x: S*radius, y: -0.5*radius, relay: relayIndices[1], arc: 3.14, dir:  1 }, // lower-right
        { x:-S*radius, y: -0.5*radius, relay: relayIndices[2], arc: 0.0,  dir: -1 }, // lower-left
        // Triangle 2 (inverted)
        { x: 0,        y: -radius,     relay: relayIndices[0], arc: 4.71, dir:  1 }, // bottom
        { x:-S*radius, y:  0.5*radius, relay: relayIndices[1], arc: 3.14, dir: -1 }, // upper-left
        { x: S*radius, y:  0.5*radius, relay: relayIndices[2], arc: 0.0,  dir:  1 }, // upper-right
    ];

    return rings.map((r, i) => ({
        type: 'anchor',
        anchor: { ...SHARED_ANCHOR, offset: { x: round(r.x), y: round(r.y), z: 0 } },
        count: 1,
        scale: ringScale,
        sizeVariance: 0,
        models: ['flame-ring'],
        animation: {
            ...SHARED_ANIMATION,
            appearAt: delay,
            rotate: [{ axis: 'z', rotations: r.dir * baseRotations, phase: 0 }],
            ...(i === 0 && atmospherics ? { atmospherics } : {}),
            modelOverrides: {
                'flame-ring': {
                    arcPhase: (r.arc + arcPhaseOffset) % 6.28,
                    relayIndex: r.relay,
                    orientationOverride: 'camera'
                }
            }
        }
    }));
}

const FIREMEDITATION_CONFIG = {
    name: 'firemeditation',
    emoji: '🔥',
    type: 'blending',
    description: 'Triple flame hexagon mandala — three concentric relay hexagons with differential rotation',
    duration: 3000,
    beats: 6,
    intensity: 1.5,
    category: 'afflicted',
    temperature: 0.5,

    spawnMode: [
        // ═══ FORWARD SET (inner/outer CW, middle CCW) ═══
        // Spiral wave: staggered relay indices create rotating diagonal brightness band
        //           radius  scale  rotations  arcPhase  relayIndices
        ...createHexLayer(0.28, 0.70,  2,    0.0,  [0, 1, 2], 0.0, [{ preset: 'smoke', intensity: 0.15, sizeScale: 0.5, progressCurve: 'sustain' }]),    // inner — appears first
        ...createHexLayer(0.52, 1.15, -1.5, 2.09, [1, 2, 0], 0.08),  // middle — blooms outward
        ...createHexLayer(0.78, 1.55,  1,   4.19, [2, 0, 1], 0.16),  // outer — last to arrive

        // ═══ COUNTER SET (opposite rotation, +180° arc offset) ═══
        // Same timing as forward — mirrored pairs bloom together
        ...createHexLayer(0.28, 0.70, -2,    3.14, [0, 1, 2], 0.0),
        ...createHexLayer(0.52, 1.15,  1.5,  5.23, [1, 2, 0], 0.08),
        ...createHexLayer(0.78, 1.55, -1,    1.05, [2, 0, 1], 0.16),
    ],

    glowColor: [1.0, 0.7, 0.3],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.1,
    glowFlickerRate: 2,
    scaleVibration: 0.01,
    scaleFrequency: 2,
    scaleContract: 0.02,
    tremor: 0.002,
    tremorFrequency: 3,
    shakeAmount: 0.003,
    shakeFrequency: 4,
    decayRate: 0.1
};

export default buildFireEffectGesture(FIREMEDITATION_CONFIG);
