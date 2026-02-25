/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Lightmeditation Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightmeditation gesture - triple concentric light hexagons
 * @module gestures/destruction/elemental/lightmeditation
 *
 * CONCEPT: Three concentric Star-of-David hexagons (inner / middle / outer), each built
 * from two interlocked triangles — DOUBLED with a counter-rotating mirror set. 36 rings
 * total. Each layer has a 120° arc-phase offset; the counter set adds another 180° offset
 * so arcs appear on both sides of every ring. Inner spins fastest, outer slowest.
 *
 * RELAY WAVE: All 36 rings are always visible (relay floor=0.5). A brightness wave
 * sweeps through 3 relay steps, but the indices are STAGGERED across hexagons
 * (inner [0,1,2], middle [1,2,0], outer [2,0,1]) creating a rotating diagonal band
 * of peak brightness — the light appears to spiral through the mandala.
 *
 * Uses the relay arc system (aRandomSeed >= 100 encoding) for per-instance arc control.
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

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
    relay: { count: 3, arcWidth: Math.PI, floor: 0.5 }
};

function createHexLayer(radius, ringScale, baseRotations, arcPhaseOffset, relayIndices, delay = 0, atmospherics = null) {
    const S = 0.866;
    const round = v => Math.round(v * 100) / 100;

    const rings = [
        // Triangle 1 (upright)
        { x: 0,        y: radius,      relay: relayIndices[0], arc: 4.71, dir: -1 },
        { x: S*radius, y: -0.5*radius, relay: relayIndices[1], arc: 3.14, dir:  1 },
        { x:-S*radius, y: -0.5*radius, relay: relayIndices[2], arc: 0.0,  dir: -1 },
        // Triangle 2 (inverted)
        { x: 0,        y: -radius,     relay: relayIndices[0], arc: 4.71, dir:  1 },
        { x:-S*radius, y:  0.5*radius, relay: relayIndices[1], arc: 3.14, dir: -1 },
        { x: S*radius, y:  0.5*radius, relay: relayIndices[2], arc: 0.0,  dir:  1 },
    ];

    return rings.map((r, i) => ({
        type: 'anchor',
        anchor: { ...SHARED_ANCHOR, offset: { x: round(r.x), y: round(r.y), z: 0 } },
        count: 1,
        scale: ringScale,
        sizeVariance: 0,
        models: ['sun-ring'],
        animation: {
            ...SHARED_ANIMATION,
            appearAt: delay,
            rotate: [{ axis: 'z', rotations: r.dir * baseRotations, phase: 0 }],
            ...(i === 0 && atmospherics ? { atmospherics } : {}),
            modelOverrides: {
                'sun-ring': {
                    arcPhase: (r.arc + arcPhaseOffset) % 6.28,
                    relayIndex: r.relay,
                    orientationOverride: 'camera'
                }
            }
        }
    }));
}

const LIGHTMEDITATION_CONFIG = {
    name: 'lightmeditation',
    emoji: '🧘',
    type: 'blending',
    description: 'Triple light hexagon mandala — three concentric relay hexagons with differential rotation',
    duration: 3000,
    beats: 6,
    intensity: 1.5,
    mascotGlow: 0.3,
    category: 'emanating',
    luminosity: 0.5,

    spawnMode: [
        // ═══ FORWARD SET (inner/outer CW, middle CCW) ═══
        ...createHexLayer(0.28, 0.70,  2,    0.0,  [0, 1, 2], 0.0, [{ preset: 'firefly', intensity: 0.15, sizeScale: 0.5, progressCurve: 'sustain' }]),
        ...createHexLayer(0.52, 1.15, -1.5, 2.09, [1, 2, 0], 0.08),
        ...createHexLayer(0.78, 1.55,  1,   4.19, [2, 0, 1], 0.16),

        // ═══ COUNTER SET (opposite rotation, +180° arc offset) ═══
        ...createHexLayer(0.28, 0.70, -2,    3.14, [0, 1, 2], 0.0),
        ...createHexLayer(0.52, 1.15,  1.5,  5.23, [1, 2, 0], 0.08),
        ...createHexLayer(0.78, 1.55, -1,    1.05, [2, 0, 1], 0.16),
    ],

    glowColor: [1.0, 0.92, 0.65],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.0,
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

export default buildLightEffectGesture(LIGHTMEDITATION_CONFIG);
