/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Phoenix Gesture
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Phoenix gesture - rising rebirth with gyroscoping vertical rings
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/phoenix
 * @complexity ⭐⭐⭐ Advanced
 *
 * VISUAL DIAGRAM:
 *         ═══════        TOP (fading)
 *        ═══════         ← Horizontal halos
 *       ═══════            rising upward
 *          ★            ← Peak brightness
 *       ═══════
 *        ═══════         ← Emerging
 *         ═══════        BOTTOM (birth)
 *
 * FEATURES:
 * - 3 flame rings in spiral formation
 * - Rings oriented FLAT (horizontal halos rising)
 * - Rings travel from bottom to above mascot
 * - Inverse funnel: starts larger, shrinks as it rises
 * - GPU-instanced rendering via ElementInstancedSpawner
 *
 * USED BY:
 * - Rebirth/resurrection effects
 * - Power-up transformations
 * - Dramatic fire aura reveals
 */

import { buildFireEffectGesture } from './fireEffectFactory.js';

/**
 * Phoenix gesture configuration
 * Rising rebirth with horizontal flame halos ascending
 */
const PHOENIX_CONFIG = {
    name: 'phoenix',
    emoji: '🦅',
    type: 'blending',
    description: 'Rising rebirth - gyroscoping flame rings ascending',
    duration: 4000,
    beats: 6,
    intensity: 1.6,
    category: 'radiating',
    temperature: 0.85,              // Hot ascending flames

    // 3D Element spawning - rising vertical rings (gyroscope effect)
    spawnMode: {
        type: 'axis-travel',
        axisTravel: {
            axis: 'y',
            start: 'bottom',
            end: 'above',           // Rises above mascot
            easing: 'easeOut',      // Dramatic rise, slowing at top
            startScale: 1.6,        // Larger at birth
            endScale: 1.2,          // Still visible at top
            startDiameter: 1.4,     // Wider at start
            endDiameter: 1.0,       // Narrower as it rises (inverse funnel)
            orientation: 'camera'  // Rings face the camera as they rise
        },
        formation: {
            type: 'spiral',         // Spiral for rotation offset
            count: 3,
            spacing: 0,             // All rings at SAME position (gyroscope)
            arcOffset: 120,         // 120 degrees between each ring
            phaseOffset: 0          // All rotate together
        },
        count: 3,
        scale: 1.0,
        models: ['flame-ring'],
        animation: {
            appearAt: 0.05,
            disappearAt: 0.85,
            stagger: 0.08,          // More stagger for wave effect
            enter: {
                type: 'fade',
                duration: 0.15,
                easing: 'easeOut'
            },
            exit: {
                type: 'fade',
                duration: 0.2,
                easing: 'easeIn'
            },
            procedural: {
                scaleSmoothing: 0.1,
                geometryStability: true
            },
            parameterAnimation: {
                temperature: {
                    start: 0.6,
                    peak: 0.95,     // Hot at mid-rise (rebirth moment)
                    end: 0.5,       // Cooling as it fades
                    curve: 'bell'
                }
            },
            flicker: {
                intensity: 0.35,
                rate: 14,
                pattern: 'random'
            },
            pulse: {
                amplitude: 0.15,
                frequency: 4,
                easing: 'easeInOut'
            },
            emissive: {
                min: 1.2,
                max: 3.5,           // Bright rebirth glow
                frequency: 6,
                pattern: 'sine'
            },
            scaleVariance: 0.25,
            lifetimeVariance: 0.2,
            blending: 'additive',
            renderOrder: 14,
            intensityScaling: {
                scale: 1.5,
                emissiveMax: 1.8,
                pulseAmplitude: 1.4
            },
            modelOverrides: {
                'flame-ring': {
                    shaderAnimation: {
                        type: 1,            // ROTATING_ARC
                        arcWidth: 0.6,      // Wider arc visibility
                        arcSpeed: 1.0,      // 1 full rotation per gesture
                        arcCount: 1
                    },
                    orientationOverride: 'camera'  // Face camera
                }
            }
        }
    },

    // Phoenix glow - bright ascending
    flickerFrequency: 12,
    flickerAmplitude: 0.015,
    flickerDecay: 0.12,
    glowColor: [1.0, 0.6, 0.2],     // Golden-orange
    glowIntensityMin: 1.5,
    glowIntensityMax: 3.2,
    glowFlickerRate: 10,
    scaleVibration: 0.025,
    scaleFrequency: 3,
    scaleGrowth: 0.04,
    rotationEffect: true,
    rotationSpeed: 0.3
};

/**
 * Phoenix gesture - rising rebirth with horizontal flame halos.
 *
 * Uses axis-travel spawn mode with spiral formation:
 * - 3 flame-ring models travel from bottom to above
 * - Rings are FLAT (orientation: 'flat') for rising halo effect
 * - 120° arcOffset staggers the rings rotationally
 * - Inverse funnel shape (shrinks as it rises)
 */
export default buildFireEffectGesture(PHOENIX_CONFIG);
