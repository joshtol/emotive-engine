/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Firepillar Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Firepillar gesture - majestic rising pillar of stacked flame rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/firepillar
 * @complexity ⭐⭐ Intermediate
 *
 * VISUAL DIAGRAM:
 *         ═══════════        ← Wide flat ring at top
 *         ═══════════
 *          ═════════         ← Stacked horizontal rings
 *           ═══════            rising as unified pillar
 *            ═════
 *             ★              ← Mascot at base
 *
 * FEATURES:
 * - 6 flat horizontal rings stacked vertically
 * - Rises from below mascot to above
 * - Rings grow larger as pillar rises (pyramid shape)
 * - All rings rotate together in same direction
 * - Majestic pillar of divine flame
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Pillar of fire effects
 * - Divine/summoning power
 * - Majestic fire displays
 * - Ascending power themes
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Firepillar gesture configuration
 * Majestic rising pillar of stacked flame rings
 */
const FIREPILLAR_CONFIG = {
    name: 'firepillar',
    emoji: '🏛️',
    type: 'blending',
    description: 'Majestic rising pillar of flame',
    duration: 3000,             // Longer for majestic feel
    beats: 4,
    intensity: 1.3,
    category: 'radiating',
    temperature: 0.7,           // Hot white-orange

    // 3D Element spawning - rising pillar
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'below',         // Start below mascot
            end: 'above',           // Rise to above
            easing: 'easeOut',      // Decelerate for majestic feel
            startScale: 0.6,        // Start smaller
            endScale: 1.3,          // Grow larger at top
            startDiameter: 1.2,     // Narrow at base
            endDiameter: 2.2,       // Wide at top (inverted pyramid)
            orientation: 'flat'     // Horizontal flat rings
        },
        formation: {
            type: 'stack',
            count: 6,
            spacing: 0.25           // Even vertical spacing
        },
        count: 6,
        scale: 1.0,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.0,
            disappearAt: 0.7,
            stagger: 0.03,          // Slight wave from bottom
            enter: {
                type: 'scale',
                duration: 0.2,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.3,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.55,
                    peak: 0.8,
                    end: 0.65,
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.12,
                rate: 8,
                pattern: 'sine'
            },
            pulse: {
                amplitude: 0.05,
                frequency: 3,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.3,
                max: 2.5,
                frequency: 4,
                pattern: 'sine'
            },
            // Grain: white noise for sharp, gritty fire texture
            // NOTE: Uses MULTIPLY blend (not overlay) because overlay has no effect on bright fire colors
            grain: {
                type: 2,              // WHITE - sharp granular noise for gritty texture
                strength: 0.5,        // Strong grain for visible grit
                scale: 0.15,          // Fine grain for dense texture
                speed: 2.5,           // Fast flickering for dynamic grit
                blend: 'multiply'     // Darkens bright areas for visible grit
            },
            // Rings rotate with 120° phase offsets - breaks repeating pattern
            rotate: [
                { axis: 'z', rotations: 0.5, phase: 0 },
                { axis: 'z', rotations: 0.5, phase: 120 },
                { axis: 'z', rotations: 0.5, phase: 240 },
                { axis: 'z', rotations: 0.5, phase: 0 },
                { axis: 'z', rotations: 0.5, phase: 120 },
                { axis: 'z', rotations: 0.5, phase: 240 }
            ],
            scaleVariance: 0.03,    // Minimal variance for solid pillar
            lifetimeVariance: 0.02,
            blending: 'additive',
            renderOrder: 15,
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,
                        arcWidth: 0.95,     // Nearly complete rings
                        arcSpeed: 0.8,      // Slow majestic rotation
                        arcCount: 3
                    }
                }
            }
        }
    },

    // Mesh effects - powerful warm glow
    flickerFrequency: 6,
    flickerAmplitude: 0.006,
    flickerDecay: 0.25,
    glowColor: [1.0, 0.65, 0.25],   // Warm orange-gold
    glowIntensityMin: 1.0,
    glowIntensityMax: 2.0,
    glowFlickerRate: 5,
    scaleVibration: 0.008,
    scaleFrequency: 3,
    scaleGrowth: 0.025,
    rotationEffect: false
};

/**
 * Firepillar gesture - majestic rising pillar of flame.
 *
 * Uses axis-travel with stack formation:
 * - 6 flat flame-ring models stacked vertically
 * - Rise from below to above with expanding diameter
 * - Rings rotate with 120° phase offsets (3 groups of 2)
 * - Inverted pyramid shape (narrow base, wide top)
 */
export default buildFireEffectGesture(FIREPILLAR_CONFIG);
