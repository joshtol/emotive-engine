/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Blast Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Earthblast gesture - seismic detonation with shockwave and debris
 * @module gestures/destruction/elemental/earthblast
 *
 * VISUAL DIAGRAM:
 *           ○  ◉     ○
 *        ◉    ╱───╲    ◉     ← Boulder shrapnel flies outward
 *      ○    ╱ ═══ ╲    ○     ← Earth-ring shockwave expands
 *        ◉  ╲  ★  ╱  ◉       ← Mascot at epicenter
 *      ○    ╲═══╱    ○
 *        ◉    ╲───╱    ◉     ← Rock-cluster debris trails behind
 *           ○  ◉     ○
 *
 * FEATURES:
 * - 3-layer seismic detonation effect
 * - Layer 1: Earth-ring shockwave expanding from center (camera-facing)
 * - Layer 2: 8 boulder shrapnel pieces in radial burst
 * - Layer 3: 4 rock-cluster debris with slower spread
 * - Strong screen shake and distortion
 * - End flash on detonation peak
 * - No cutout — burst chaos provides variety
 */

import { buildEarthEffectGesture } from './earthEffectFactory.js';

const EARTHBLAST_CONFIG = {
    name: 'earthblast',
    emoji: '💥',
    type: 'blending',
    description: 'Seismic detonation with expanding shockwave and rock debris',
    duration: 1200,
    beats: 2,
    intensity: 1.8,
    category: 'manifestation',
    petrification: 0.9,
    distortionStrength: 1.5,

    spawnMode: [
        // ── Layer 1: Earth-ring shockwave ──────────────────────────────────
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.05 },
                orientation: 'camera'
            },
            startScale: 0.2,
            endScale: 3.5,
            scaleEasing: 'easeOutCubic',
            count: 1,
            scale: 1.8,
            models: ['earth-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.3,
                enter: { type: 'flash', duration: 0.02, easing: 'linear' },
                exit: { type: 'fade', duration: 0.1, easing: 'easeIn' },
                emissive: { min: 0.8, max: 1.5, frequency: 8, pattern: 'sine' },
                blending: 'normal',
                renderOrder: 10
            },
            modelOverrides: {
                'earth-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0, arcCount: 1 },
                    orientationOverride: 'camera'
                }
            }
        },

        // ── Layer 2: Boulder shrapnel ──────────────────────────────────────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 8,
                radius: 0.15,
                endRadius: 2.0,
                angleSpread: 360,
                startAngle: 22,
                orientation: 'camera'
            },
            startScale: 0.2,
            endScale: 1.0,
            scaleEasing: 'easeOutQuad',
            count: 8,
            scale: 0.9,
            models: ['boulder'],
            animation: {
                appearAt: 0.02,
                disappearAt: 0.45,
                stagger: 0.005,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'burst-fade', duration: 0.12, easing: 'easeIn', burstScale: 1.3 },
                emissive: { min: 0.5, max: 1.0, frequency: 5, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 2, phase: 0 },
                    { axis: 'z', rotations: -3, phase: 45 },
                    { axis: 'z', rotations: 2.5, phase: 90 },
                    { axis: 'z', rotations: -2, phase: 135 },
                    { axis: 'z', rotations: 3, phase: 180 },
                    { axis: 'z', rotations: -2.5, phase: 225 },
                    { axis: 'z', rotations: 2, phase: 270 },
                    { axis: 'z', rotations: -3, phase: 315 }
                ],
                atmospherics: [{
                    preset: 'earth-gravel',
                    targets: ['rock-chunk-medium', 'boulder'],
                    anchor: 'below',
                    intensity: 0.5,
                    sizeScale: 0.8,
                    progressCurve: 'burst',
                }, {
                    preset: 'earth-dust',
                    targets: ['rock-chunk-medium'],
                    anchor: 'above',
                    intensity: 0.4,
                    sizeScale: 1.2,
                    progressCurve: 'burst',
                }],
                scaleVariance: 0.3,
                blending: 'normal',
                renderOrder: 14
            }
        },

        // ── Layer 3: Rock-cluster debris ───────────────────────────────────
        {
            type: 'radial-burst',
            radialBurst: {
                count: 4,
                radius: 0.2,
                endRadius: 1.5,
                angleSpread: 360,
                startAngle: 67,
                orientation: 'camera'
            },
            startScale: 0.3,
            endScale: 0.7,
            scaleEasing: 'easeOutQuad',
            count: 4,
            scale: 0.7,
            models: ['rock-cluster'],
            animation: {
                appearAt: 0.03,
                disappearAt: 0.5,
                stagger: 0.008,
                enter: { type: 'scale', duration: 0.03, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                emissive: { min: 0.5, max: 0.9, frequency: 4, pattern: 'sine' },
                rotate: [
                    { axis: 'z', rotations: 1.5, phase: 0 },
                    { axis: 'z', rotations: -2, phase: 90 },
                    { axis: 'z', rotations: 1.5, phase: 180 },
                    { axis: 'z', rotations: -2, phase: 270 }
                ],
                scaleVariance: 0.25,
                blending: 'normal',
                renderOrder: 15
            }
        }
    ],

    decayRate: 0.1,
    endFlash: true,
    glowColor: [0.90, 0.65, 0.20],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 5,
    shakeAmount: 0.025,
    shakeFrequency: 18,
    tremor: 0.01,
    tremorFrequency: 6,
    scaleVibration: 0.03,
    scaleFrequency: 8
};

export default buildEarthEffectGesture(EARTHBLAST_CONFIG);
