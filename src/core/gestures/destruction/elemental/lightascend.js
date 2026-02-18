/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Ascend Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Lightascend gesture - being beamed to heaven
 * @module gestures/destruction/elemental/lightascend
 *
 * VISUAL DIAGRAM:
 *                              ← Sparkle-stars spiral upward (helix)
 *      ✧  ✧                     being pulled into the portal
 *     ✧    ✧
 *    ════════════              ← Sun-ring descending from above (the portal)
 *      ✧  ✧
 *     ✧    ✧
 *        (✦)  ★               ← Light-burst at center (the divine flash)
 *         /|\
 *
 * CONCEPT: Heaven's Gate opens. A massive sun-ring DESCENDS from above
 * to the mascot's head — the portal opening. Sparkle-stars spiral upward
 * in a helix through the portal, being pulled to heaven. A light-burst
 * at center grows as the divine light fills the space.
 *
 * UNIQUE: Uses orbit mode for the helical rise — sparkles spiral upward
 * while converging (narrowing radius), creating a DNA-helix of light
 * being drawn through the descending portal. Visually distinct from
 * lightpillar (static column) and lightsurge (vertical geyser).
 *
 * FEATURES:
 * - 1 sun-ring descending from above (the heaven portal)
 * - 5 sparkle-stars in upward-spiraling orbit (being beamed up)
 * - 1 light-burst at center, growing (divine manifestation)
 * - Strong upward momentum and ethereal feel
 */

import { buildLightEffectGesture } from './lightEffectFactory.js';

const LIGHTASCEND_CONFIG = {
    name: 'lightascend',
    emoji: '👼',
    type: 'blending',
    description: 'Being beamed to heaven — a portal descends and draws light upward',
    duration: 3000,
    beats: 5,
    intensity: 1.3,
    category: 'transform',
    radiance: 0.85,

    spawnMode: [
        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 1: Sun-ring — the heavenly portal descending
        // Starts above and settles to head level, flat horizontal
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'axis-travel',
            axisTravel: {
                axis: 'y',
                start: 'above',
                end: 'top',
                easing: 'easeOut',              // Fast descent, gentle arrival
                startScale: 1.5,
                endScale: 1.2,                  // Slight focus as it settles
                startDiameter: 2.5,
                endDiameter: 1.8,
                orientation: 'flat'
            },
            count: 1, scale: 1.4, models: ['sun-ring'],
            animation: {
                appearAt: 0.0,
                disappearAt: 0.7,
                enter: { type: 'fade', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.1, geometryStability: true },
                pulse: { amplitude: 0.1, frequency: 2, easing: 'easeInOut' },
                emissive: { min: 1.0, max: 2.5, frequency: 2, pattern: 'sine' },
                rotate: { axis: 'z', rotations: 0.5, phase: 0 },
                cutout: {
                    strength: 0.5,
                    primary: { pattern: 6, scale: 1.5, weight: 1.0 },     // SPIRAL — divine swirl
                    secondary: { pattern: 4, scale: 2.0, weight: 0.4 },   // WAVES
                    blend: 'add',
                    travel: 'angular',
                    travelSpeed: 0.8,
                    strengthCurve: 'bell',
                    bellPeakAt: 0.5,
                    bellWidth: 1.0,
                },
                grain: {
                    type: 3, strength: 0.15, scale: 0.3, speed: 0.6, blend: 'multiply'
                },
                atmospherics: [{
                    preset: 'firefly',
                    targets: null,
                    anchor: 'above',
                    intensity: 0.6,
                    sizeScale: 1.2,
                    progressCurve: 'rampUp',
                    velocityInheritance: 0.3,
                }],
                blending: 'additive',
                renderOrder: 14,
                modelOverrides: {
                    'sun-ring': {
                        shaderAnimation: { type: 1, arcWidth: 0.85, arcSpeed: 0.8, arcCount: 2 },
                        orientationOverride: 'flat'
                    }
                }
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 2: 5 sparkle-stars — helical ascent through the portal
        // Orbit from bottom upward, narrowing radius (being pulled in)
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'orbit',
            orbit: {
                height: 'bottom',
                endHeight: 'above',             // Rising from feet to above head
                radius: 0.8,
                endRadius: 0.3,                 // Narrowing — drawn into portal
                speed: 2,                       // 2 full helix revolutions
                easing: 'easeIn',               // Accelerating toward heaven
                startScale: 0.4,
                endScale: 1.0,                  // Growing brighter as they rise
                orientation: 'camera'
            },
            formation: { type: 'ring', count: 5 },
            count: 5, scale: 0.8, models: ['sparkle-star'],
            animation: {
                appearAt: 0.05,
                disappearAt: 0.65,
                stagger: 0.04,
                enter: { type: 'fade', duration: 0.08, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.15, easing: 'easeIn' },
                emissive: { min: 1.0, max: 2.8, frequency: 4, pattern: 'sine' },
                scaleVariance: 0.25,
                lifetimeVariance: 0.1,
                blending: 'additive',
                renderOrder: 16,
            }
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // LAYER 3: Light-burst — divine light at center, growing
        // The manifestation of divine power as the portal opens
        // ═══════════════════════════════════════════════════════════════════════════
        {
            type: 'anchor',
            anchor: {
                landmark: 'center',
                offset: { x: 0, y: 0, z: 0.1 },
                orientation: 'camera',
                startScale: 0.3,
                endScale: 1.8,
                scaleEasing: 'easeOutQuad'
            },
            count: 1, scale: 1.5, models: ['light-burst'],
            animation: {
                appearAt: 0.1,
                disappearAt: 0.6,
                enter: { type: 'scale', duration: 0.15, easing: 'easeOut' },
                exit: { type: 'fade', duration: 0.2, easing: 'easeIn' },
                procedural: { scaleSmoothing: 0.08, geometryStability: true },
                pulse: { amplitude: 0.12, frequency: 3, easing: 'easeInOut' },
                emissive: { min: 1.2, max: 2.5, frequency: 3, pattern: 'sine' },
                blending: 'additive',
                renderOrder: 15,
            }
        }
    ],

    decayRate: 0.18,
    glowColor: [1.0, 0.95, 0.80],
    glowIntensityMin: 0.8,
    glowIntensityMax: 1.5,
    glowFlickerRate: 4,
    scaleVibration: 0.015,
    scaleFrequency: 3,
    scalePulse: true,
    riseAmount: 0.012,
    riseSpeed: 0.8
};

export default buildLightEffectGesture(LIGHTASCEND_CONFIG);
