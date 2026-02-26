/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Surge Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightsurge gesture - divine energy eruption, vertical light geyser
 * @module gestures/destruction/elemental/lightsurge
 *
 * VISUAL DIAGRAM:
 *         ✧ ✧ ✧             ← Sparkle debris at top
 *        ═══════             ← Flat sun-ring erupting up (top)
 *       ═════════            ← Flat sun-ring (mid)
 *         ★                  ← Mascot at epicenter
 *     ═══════════            ← Flat sun-ring (base, widest)
 *
 * CONCEPT: A divine energy geyser. Three flat sun-rings ERUPT
 * vertically from the mascot's base — the bottom ring is widest
 * (the eruption source), stacking upward and narrowing like a
 * geyser plume. Sparkle-star debris shoots from the top.
 * Fast, powerful, directional — energy SURGING upward.
 *
 * FEATURES:
 * - 3 sun-rings in axis-travel: base → above (the geyser column)
 * - Funnel shape: wide at base, narrow at top (geyser plume)
 * - Fast stagger — sequential eruption bottom to top
 * - 3 sparkle-stars launching from the top (geyser spray)
 * - Flat horizontal orientation — horizontal discs erupting vertically
 * - Strong upward momentum
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTSURGE_CONFIG = {
    name: 'lightsurge',
    emoji: '⚡',
    type: 'blending',
    description: 'Divine energy geyser — light erupts vertically in a surging plume',
    duration: 1500,
    beats: 3,
    intensity: 1.3,
    category: 'emanating',
    radiance: 0.8,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: 3 sun-rings — the geyser column erupting upward
        // Wide base narrowing to tight top, fast upward sweep
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'bottom',
                end: 'above',
                easing: 'easeOut', // Fast start, slowing at peak
                startScale: 1.4,
                endScale: 0.9, // Narrowing at top
                startDiameter: 2.0, // Wide eruption base
                endDiameter: 1.0, // Tight plume top
                orientation: 'flat',
            },
            formation: {
                type: 'stack',
                count: 3,
                spacing: 0.1,
                phaseOffset: 0.03,
            },
            count: 3,
            scale: 1.2,
            models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.55,
                stagger: 0.04, // Fast sequential eruption
                enter: { type: 'scale', duration: 0.06, easing: 'easeOutBack' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.06, geometryStability: true },
                pulse: { amplitude: 0.1, frequency: 5, easing: 'easeInOut' },
                emissive: { min: 1.2, max: 2.5, frequency: 6, pattern: 'sine' },
                atmospherics: [
                    {
                        preset: 'firefly',
                        targets: null,
                        anchor: 'above',
                        intensity: 0.4,
                        sizeScale: 1.0,
                        progressCurve: 'rampUp',
                        velocityInheritance: 0.5,
                    },
                ],
                rotate: { axis: 'z', rotations: 0.5, phase: 0 },
                blending: 'additive',
                renderOrder: 15,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.7, arcSpeed: 2.0, arcCount: 1 },
                        orientationOverride: 'flat',
                    },
                },
            },
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 3 sparkle-stars — geyser spray shooting from the top
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'radial-burst',
            radialBurst: {
                count: 3,
                radius: 0.1,
                endRadius: 0.6,
                angleSpread: 120, // Narrow upward cone
                startAngle: 60, // Mostly upward (60°-180°)
                orientation: 'camera',
                startScale: 0.4,
                endScale: 0.7,
                scaleEasing: 'easeOutQuad',
            },
            count: 3,
            scale: 0.7,
            models: ['sparkle-star'],
            animation: {
                appearAt: 0.15, // After geyser column starts
                disappearAt: 0.5,
                stagger: 0.03,
                enter: { type: 'scale', duration: 0.04, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                emissive: { min: 1.3, max: 2.5, frequency: 8, pattern: 'sine' },
                drift: {
                    speed: 0.8,
                    distance: 0.4,
                    direction: { x: 0, y: 1.0, z: 0 },
                    easing: 'easeOut',
                },
                scaleVariance: 0.25,
                blending: 'additive',
                renderOrder: 17,
            },
        },
    ],

    decayRate: 0.15,
    glowColor: [1.0, 0.95, 0.7],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.6,
    glowFlickerRate: 5,
    scaleVibration: 0.015,
    scaleFrequency: 4,
    scalePulse: true,
};

export default buildLightEffectGesture(LIGHTSURGE_CONFIG);
