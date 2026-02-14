/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Icemist Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Icemist gesture - cold mist/fog emanating from mascot
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/icemist
 * @complexity ⭐⭐ Standard
 *
 * VISUAL DIAGRAM:
 *
 *      ╭─────────╮
 *     ╭───────────╮        ← Frost ring expands outward slowly
 *    ╭─────────────╮
 *         ★                ← Mascot radiating cold
 *    ╰─────────────╯
 *     ╰───────────╯
 *      ╰─────────╯
 *
 * FEATURES:
 * - Slowly expanding ice-ring emanation
 * - Low frost parameter - subtle cold aura
 * - CELLULAR cutout for crystalline fog texture
 * - Gentle pulse for breathing mist effect
 * - EMANATING: mascot is radiating cold outward
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Cold aura effects
 * - Frost emanation
 * - Ambient ice presence
 */

import { buildIceEffectGesture } from './iceEffectFactory.js';

/**
 * Icemist gesture configuration
 * Cold mist/fog slowly emanating from mascot
 */
const ICEMIST_CONFIG = {
    name: 'icemist',
    emoji: '🌫️',
    type: 'blending',
    description: 'Cold mist emanating outward from mascot',
    duration: 3000,
    beats: 4,
    intensity: 0.7,
    category: 'emanating',
    frost: 0.4,

    // 3D Element spawning - slow expanding frost ring
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'center',
            end: 'center',
            easing: 'linear',
            startScale: 0.4,
            endScale: 2.2,
            startDiameter: 0.5,
            endDiameter: 2.5,
            orientation: 'camera'
        },
        formation: { type: 'stack', count: 1, spacing: 0 },
        count: 1,
        scale: 1.3,
        models: ['ice-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.85,
            enter: { type: 'fade', duration: 0.15, easing: 'easeOut' },
            exit: { type: 'fade', duration: 0.3, easing: 'easeIn' },
            procedural: { scaleSmoothing: 0.08, geometryStability: true },
            parameterAnimation: {
                frost: {
                    start: 0.2,
                    peak: 0.5,
                    end: 0.3,
                    curve: 'bell'
                }
            },
            cutout: {
                strength: 0.55,
                primary: { pattern: 3, scale: 1.2, weight: 1.0 },    // VORONOI - crystalline fracture
                secondary: { pattern: 8, scale: 1.5, weight: 0.4 },  // CRACKS - frost fractures
                blend: 'multiply',
                travel: 'radial',
                travelSpeed: 0.8,
                strengthCurve: 'constant',
                trailDissolve: {
                    enabled: true,
                    offset: -0.3,
                    softness: 1.5
                }
            },
            grain: { type: 3, strength: 0.2, scale: 0.35, speed: 0.6, blend: 'multiply' },
            // Per-gesture atmospheric particles: ground-level cold mist
            atmospherics: [{
                preset: 'mist',
                targets: null,
                anchor: 'below',
                intensity: 0.4,
                sizeScale: 1.5,
                progressCurve: 'sustain',
            }],
            pulse: {
                amplitude: 0.08,
                frequency: 2,
                easing: 'easeInOut'
            },
            emissive: {
                min: 0.8,
                max: 1.8,
                frequency: 3,
                pattern: 'sine'
            },
            blending: 'normal',
            renderOrder: 8,
            modelOverrides: {
                'ice-ring': {
                    shaderAnimation: { type: 1, arcWidth: 0.95, arcSpeed: 0.2, arcCount: 1 },
                    orientationOverride: 'camera'
                }
            }
        }
    },

    // Glow - soft icy blue
    glowColor: [0.4, 0.7, 1.0],
    glowIntensityMin: 0.6,
    glowIntensityMax: 1.2,
    glowFlickerRate: 3,
    // Scale - gentle breathing
    scaleVibration: 0.008,
    scaleFrequency: 2,
    scaleGrowth: 0.01
};

/**
 * Icemist gesture - cold mist emanating outward.
 *
 * Uses axis-travel spawn mode:
 * - Single camera-facing ice-ring at center
 * - Expands slowly outward (0.4 → 2.2 scale)
 * - CELLULAR + DISSOLVE cutout for crystalline fog
 * - Gentle pulse for breathing mist effect
 * - EMANATING: mascot is radiating cold
 */
export default buildIceEffectGesture(ICEMIST_CONFIG);
