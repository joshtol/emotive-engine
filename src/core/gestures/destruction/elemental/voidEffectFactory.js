/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Void Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for void effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/voidEffectFactory
 *
 * ## Void Effect Gestures
 *
 * Three categories of void gestures:
 *
 * ### Absorption (draining, pulling inward)
 * - Energy draining from mascot
 * - Pulling light and color inward
 * - Mascot is becoming VOID
 *
 * ### Corruption (spreading darkness)
 * - Dark tendrils spreading across surface
 * - Life force being drained
 * - Mascot is being CORRUPTED by void
 *
 * ### Annihilation (total erasure)
 * - Being consumed by void completely
 * - Fading from existence
 * - Mascot is being ERASED
 *
 * ## Variants
 *
 * | Gesture    | Category     | Effect                              |
 * |------------|--------------|-------------------------------------|
 * | drain      | Absorption   | Slowly draining energy, dimming     |
 * | siphon     | Absorption   | Active pull of energy inward        |
 * | hollow     | Absorption   | Becoming empty inside               |
 * | corrupt    | Corruption   | Darkness spreading across surface   |
 * | taint      | Corruption   | Subtle dark infection               |
 * | wither     | Corruption   | Life force being consumed           |
 * | consume    | Annihilation | Being swallowed by void             |
 * | erase      | Annihilation | Fading from existence               |
 * | singularity| Annihilation | Collapsing to a point               |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// VOID EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const VOID_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ABSORPTION VARIANTS - Mascot is becoming void, draining energy
    // ═══════════════════════════════════════════════════════════════════════════════════════

    drain: {
        name: 'drain',
        emoji: '🕳️',
        type: 'blending',
        description: 'Slowly draining energy, light dims and color fades',
        duration: 3500,
        beats: 5,
        intensity: 0.7,
        category: 'absorption',
        depth: 0.4,                    // Moderate void depth
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.2,
            cameraFacing: 0.2,
            clustering: 0.3,
            count: 5,
            scale: 0.9,
            models: ['void-shard', 'corruption-patch'],
            minDistance: 0.15,
            animation: {
                appearAt: 0.1,
                disappearAt: 0.9,
                stagger: 0.06,
                enter: {
                    type: 'fade',       // Emerges from darkness
                    duration: 0.15,
                    easing: 'easeOut'
                },
                exit: {
                    type: 'shrink',     // Collapses to nothing
                    duration: 0.12,
                    easing: 'easeInCubic'
                },
                // Slow draining pulse
                pulse: {
                    amplitude: 0.08,
                    frequency: 1,       // Very slow void pulse
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.2,           // Dark
                    max: 0.5,
                    frequency: 1.5,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'inward', // Draining inward
                    speed: 0.012,
                    noise: 0.05
                },
                rotate: {
                    axis: 'y',
                    speed: 0.015,
                    oscillate: false
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 3,
                intensityScaling: {
                    scale: 0.9,         // Void shrinks things
                    emissiveMax: 0.8
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'void-shard': {
                        drift: { direction: 'inward', speed: 0.015, noise: 0.05 },
                        opacityLink: 'dissipate'
                    },
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.2 },
                                y: { expand: false, rate: 0.6 },
                                z: { expand: true, rate: 1.2 }
                            }
                        },
                        drift: { direction: 'outward-flat', speed: 0.01, adherence: 0.6 },
                        orientationOverride: 'flat'
                    }
                }
            }
        },
        // Slow dimming effect
        dimRate: 0.3,
        dimPulse: true,
        // Glow - inverse glow (dimming)
        glowColor: [0.3, 0.2, 0.4],    // Dark purple
        glowIntensityMin: 0.4,
        glowIntensityMax: 0.7,
        glowFlickerRate: 2,            // Slow pulse
        // Scale - slight shrinkage
        scaleVibration: 0.01,
        scaleFrequency: 1.5,
        scaleShrink: 0.03,             // Shrinks as energy drains
        // Position - slight pull toward center
        pullStrength: 0.005,
        // Decay
        decayRate: 0.25
    },

    siphon: {
        name: 'siphon',
        emoji: '🌀',
        type: 'blending',
        description: 'Active pull of energy inward, swirling absorption',
        duration: 2800,
        beats: 4,
        intensity: 1.0,
        category: 'absorption',
        depth: 0.6,                    // Stronger void
        spawnMode: {
            type: 'surface',
            pattern: 'ring',
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 6,
            scale: 0.85,
            models: ['void-crack', 'shadow-tendril', 'void-shard'],
            minDistance: 0.12
        },
        // Active pulling motion
        pullStrength: 0.015,
        spiralRate: 1.5,               // Spinning pull
        // Glow - deep dimming
        glowColor: [0.2, 0.1, 0.3],    // Deep purple
        glowIntensityMin: 0.3,
        glowIntensityMax: 0.6,
        glowFlickerRate: 4,            // Faster pulse with siphon rhythm
        // Scale - pulsing shrinkage
        scaleVibration: 0.02,
        scaleFrequency: 3,
        scaleShrink: 0.05,
        scalePulse: true,
        // Rotation - slow spiral
        rotationSpeed: 0.3,
        // Decay
        decayRate: 0.2
    },

    hollow: {
        name: 'hollow',
        emoji: '👁️',
        type: 'blending',
        description: 'Becoming empty inside, shell of former self',
        duration: 4000,
        beats: 6,
        intensity: 0.8,
        category: 'absorption',
        depth: 0.5,
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.25,
            cameraFacing: 0.15,
            clustering: 0.4,
            count: 4,
            scale: 0.8,
            models: ['void-crack', 'void-shard'],
            minDistance: 0.18
        },
        // Emptying effect - core transparency
        hollowCore: true,
        hollowProgress: 0.7,           // How much interior becomes void
        // Glow - cold and empty
        glowColor: [0.25, 0.25, 0.35], // Cold gray-purple
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.75,
        glowFlickerRate: 1.5,          // Very slow
        // Scale - slight compression
        scaleVibration: 0.008,
        scaleFrequency: 1,
        scaleShrink: 0.02,
        // Position - subtle tremor
        tremor: 0.003,
        tremorFrequency: 6,
        // Decay
        decayRate: 0.2
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // CORRUPTION VARIANTS - Mascot is being corrupted by darkness
    // ═══════════════════════════════════════════════════════════════════════════════════════

    corrupt: {
        name: 'corrupt',
        emoji: '🦠',
        type: 'blending',
        description: 'Darkness spreading across surface, being overtaken',
        duration: 3200,
        beats: 5,
        intensity: 1.2,
        category: 'corruption',
        depth: 0.65,
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.1,
            cameraFacing: 0.2,
            clustering: 0.5,
            count: 8,
            scale: 1.0,
            models: ['corruption-patch', 'shadow-tendril', 'void-crack'],
            minDistance: 0.1
        },
        // Spreading darkness
        spreadRate: 0.4,               // How fast corruption spreads
        spreadPulse: true,
        // Glow - sickly dark
        glowColor: [0.15, 0.05, 0.2],  // Very dark purple
        glowIntensityMin: 0.35,
        glowIntensityMax: 0.65,
        glowFlickerRate: 5,            // Erratic flicker
        // Scale - unstable
        scaleVibration: 0.025,
        scaleFrequency: 6,
        // Position - corrupted jitter
        jitterAmount: 0.01,
        jitterFrequency: 8,
        // Rotation - unsettling tilt
        rotationWobble: 0.02,
        rotationWobbleSpeed: 2,
        // Decay
        decayRate: 0.22
    },

    taint: {
        name: 'taint',
        emoji: '💜',
        type: 'blending',
        description: 'Subtle dark infection, insidious corruption',
        duration: 4500,
        beats: 6,
        intensity: 0.5,
        category: 'corruption',
        depth: 0.35,                   // Light corruption
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.12,
            cameraFacing: 0.15,
            clustering: 0.35,
            count: 4,
            scale: 0.7,
            models: ['corruption-patch', 'void-shard'],
            minDistance: 0.2
        },
        // Subtle spreading
        spreadRate: 0.2,
        // Glow - barely noticeable darkening
        glowColor: [0.4, 0.3, 0.5],    // Light purple tint
        glowIntensityMin: 0.7,
        glowIntensityMax: 0.9,
        glowFlickerRate: 2,
        // Scale - minimal effect
        scaleVibration: 0.005,
        scaleFrequency: 2,
        // Position - subtle drift
        driftAmount: 0.003,
        driftSpeed: 0.8,
        // Decay
        decayRate: 0.18
    },

    wither: {
        name: 'wither',
        emoji: '🥀',
        type: 'blending',
        description: 'Life force being consumed, vitality draining',
        duration: 3800,
        beats: 5,
        intensity: 0.9,
        category: 'corruption',
        depth: 0.55,
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.18,
            cameraFacing: 0.2,
            clustering: 0.4,
            count: 6,
            scale: 0.85,
            models: ['shadow-tendril', 'corruption-patch', 'void-shard'],
            minDistance: 0.12
        },
        // Withering effect
        witherRate: 0.35,
        // Glow - fading life
        glowColor: [0.3, 0.2, 0.25],   // Desaturated
        glowIntensityMin: 0.45,
        glowIntensityMax: 0.7,
        glowFlickerRate: 3,
        // Scale - definite shrinkage
        scaleVibration: 0.012,
        scaleFrequency: 2,
        scaleShrink: 0.06,             // Noticeable wither
        // Position - drooping
        droopAmount: 0.015,            // Sinking down
        droopAcceleration: 0.5,
        // Decay
        decayRate: 0.2
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ANNIHILATION VARIANTS - Mascot is being erased from existence
    // ═══════════════════════════════════════════════════════════════════════════════════════

    consume: {
        name: 'consume',
        emoji: '⚫',
        type: 'blending',
        description: 'Being swallowed by void, total absorption',
        duration: 2500,
        beats: 4,
        intensity: 1.5,
        category: 'annihilation',
        depth: 0.85,                   // Deep void
        spawnMode: {
            type: 'surface',
            pattern: 'crown',
            embedDepth: 0.1,
            cameraFacing: 0.35,
            clustering: 0.3,
            count: 10,
            scale: 1.1,
            models: ['void-crack', 'shadow-tendril', 'corruption-patch', 'void-shard'],
            minDistance: 0.08,
            animation: {
                appearAt: 0.05,
                disappearAt: 0.88,
                stagger: 0.02,
                enter: {
                    type: 'grow',       // Void tendrils extend
                    duration: 0.06,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'shrink',     // Collapse to center
                    duration: 0.08,
                    easing: 'easeInCubic'
                },
                // Consuming spiral
                pulse: {
                    amplitude: 0.12,
                    frequency: 3,
                    easing: 'easeIn'
                },
                emissive: {
                    min: 0.1,           // Near-darkness
                    max: 0.4,
                    frequency: 4,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'inward', // Pull toward center
                    speed: 0.035,
                    noise: 0.1
                },
                rotate: {
                    axis: 'y',
                    speed: 0.12,        // Spiraling faster
                    oscillate: false
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 2,
                intensityScaling: {
                    scale: 0.85,
                    driftSpeed: 1.5,
                    rotateSpeed: 1.4
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'void-crack': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.6 },
                                y: { expand: true, rate: 1.4 },
                                z: { expand: true, rate: 0.8 }
                            }
                        },
                        drift: { direction: 'inward', speed: 0.04, noise: 0.1 }
                    },
                    'shadow-tendril': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.7 },
                                y: { expand: true, rate: 1.8 },
                                z: { expand: false, rate: 0.7 }
                            },
                            wobbleFrequency: 3, wobbleAmplitude: 0.15
                        },
                        drift: { direction: 'inward', speed: 0.035 }
                    },
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.5 },
                                y: { expand: false, rate: 0.5 },
                                z: { expand: true, rate: 1.5 }
                            }
                        },
                        drift: { direction: 'inward', speed: 0.03 },
                        orientationOverride: 'flat'
                    },
                    'void-shard': {
                        drift: { direction: 'inward', speed: 0.045, noise: 0.08 },
                        opacityLink: 'inverse-scale'
                    }
                }
            }
        },
        // Consumption effect
        pullStrength: 0.025,
        spiralRate: 2.0,               // Fast spiral into void
        // Glow - nearly black
        glowColor: [0.1, 0.05, 0.15],  // Near black purple
        glowIntensityMin: 0.2,
        glowIntensityMax: 0.5,
        glowFlickerRate: 8,            // Rapid flicker
        // Scale - dramatic shrinkage
        scaleVibration: 0.03,
        scaleFrequency: 5,
        scaleShrink: 0.15,             // Shrinks significantly
        // Rotation - spinning into void
        rotationSpeed: 1.2,
        // Opacity fade
        fadeOut: true,
        fadeStartAt: 0.3,
        fadeEndAt: 0.85,
        fadeCurve: 'accelerating',
        // Decay
        decayRate: 0.15
    },

    erase: {
        name: 'erase',
        emoji: '👻',
        type: 'blending',
        description: 'Fading from existence, becoming nothing',
        duration: 3000,
        beats: 4,
        intensity: 1.3,
        category: 'annihilation',
        depth: 0.7,
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.35,
            count: 7,
            scale: 0.95,
            models: ['void-crack', 'void-shard', 'corruption-patch'],
            minDistance: 0.1
        },
        // Erasure effect - smooth fade
        erasePattern: 'dissolve',      // Pixels dissolve away
        // Glow - fading to nothing
        glowColor: [0.2, 0.2, 0.3],    // Cold gray
        glowIntensityMin: 0.3,
        glowIntensityMax: 0.6,
        glowFlickerRate: 3,
        // Scale - gentle shrink
        scaleVibration: 0.015,
        scaleFrequency: 2,
        scaleShrink: 0.08,
        // Position - drifting away
        driftAmount: 0.01,
        driftSpeed: 0.5,
        riseAmount: 0.008,             // Slight float up
        // Opacity fade
        fadeOut: true,
        fadeStartAt: 0.2,
        fadeEndAt: 0.9,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.1
    },

    singularity: {
        name: 'singularity',
        emoji: '💫',
        type: 'blending',
        description: 'Collapsing to a point, ultimate compression',
        duration: 2000,
        beats: 3,
        intensity: 2.0,
        category: 'annihilation',
        depth: 1.0,                    // Maximum void
        spawnMode: {
            type: 'surface',
            pattern: 'shell',
            embedDepth: 0.05,
            cameraFacing: 0.4,
            clustering: 0.15,
            count: 12,
            scale: 1.2,
            models: ['void-crack', 'shadow-tendril', 'corruption-patch', 'void-shard'],
            minDistance: 0.06,
            animation: {
                appearAt: 0.02,
                disappearAt: 0.95,
                stagger: 0.015,
                enter: {
                    type: 'flash',      // Instant void appearance
                    duration: 0.02,
                    easing: 'linear'
                },
                exit: {
                    type: 'shrink',     // Collapses to point
                    duration: 0.05,
                    easing: 'easeInCubic'
                },
                // Violent collapse
                pulse: {
                    amplitude: 0.2,
                    frequency: 8,       // Frantic
                    easing: 'snap'
                },
                flicker: {
                    intensity: 0.25,
                    rate: 15,
                    pattern: 'random'
                },
                emissive: {
                    min: 0.05,          // Near-total darkness
                    max: 0.3,
                    frequency: 10,
                    pattern: 'random'
                },
                drift: {
                    direction: 'inward', // Violent pull to center
                    speed: 0.06,
                    noise: 0.15
                },
                rotate: {
                    axis: 'y',
                    speed: 0.25,        // Rapid spin
                    oscillate: false
                },
                scaleVariance: 0.25,
                lifetimeVariance: 0.2,
                blending: 'normal',
                renderOrder: 1,         // Render behind everything
                intensityScaling: {
                    scale: 0.7,         // Dramatic shrinkage
                    driftSpeed: 1.8,
                    rotateSpeed: 1.6
                },
                // Model-specific behavior overrides (Phase 11)
                modelOverrides: {
                    'void-crack': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 2.0 },
                                y: { expand: true, rate: 1.8 },
                                z: { expand: false, rate: 0.6 }
                            },
                            wobbleFrequency: 6, wobbleAmplitude: 0.2
                        },
                        drift: { direction: 'inward', speed: 0.06, noise: 0.15 }
                    },
                    'shadow-tendril': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: false, rate: 0.6 },
                                y: { expand: true, rate: 2.2 },
                                z: { expand: false, rate: 0.6 }
                            },
                            wobbleFrequency: 5, wobbleAmplitude: 0.2
                        },
                        drift: { direction: 'inward', speed: 0.055 }
                    },
                    'corruption-patch': {
                        scaling: {
                            mode: 'non-uniform',
                            axes: {
                                x: { expand: true, rate: 1.8 },
                                y: { expand: false, rate: 0.4 },
                                z: { expand: true, rate: 1.8 }
                            }
                        },
                        drift: { direction: 'inward', speed: 0.05 },
                        orientationOverride: 'flat'
                    },
                    'void-shard': {
                        drift: { direction: 'inward', speed: 0.065, noise: 0.1 },
                        opacityLink: 'inverse-scale'
                    }
                }
            }
        },
        // Collapse effect
        collapsePhase: 0.7,            // 70% collapse, 30% release
        pullStrength: 0.04,
        spiralRate: 3.0,               // Violent spiral
        // Glow - pure darkness
        glowColor: [0.05, 0.0, 0.1],   // Almost black
        glowIntensityMin: 0.1,
        glowIntensityMax: 0.4,
        glowFlickerRate: 15,           // Frantic
        // Scale - extreme shrinkage
        scaleVibration: 0.04,
        scaleFrequency: 10,
        scaleShrink: 0.35,             // Collapses to near-point
        // Rotation - extreme spin
        rotationSpeed: 2.5,
        // Opacity fade
        fadeOut: true,
        fadeStartAt: 0.5,
        fadeEndAt: 0.95,
        fadeCurve: 'accelerating',
        // Decay
        decayRate: 0.05
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════

function hash(n) {
    return ((Math.sin(n) * 43758.5453) % 1 + 1) % 1;
}

function noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create a void effect gesture (NO shatter - mesh stays intact)
 * @param {string} variant - Variant name from VOID_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createVoidEffectGesture(variant) {
    const config = VOID_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[VOID_EFFECT] Unknown variant: ${variant}, using drain`);
        return createVoidEffectGesture('drain');
    }

    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            beats: config.beats,
            intensity: config.intensity,
            ...config
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',

            amplitudeSync: {
                onBeat: config.category === 'annihilation' ? 1.5 : 1.2,
                offBeat: 1.0,
                curve: config.category === 'absorption' ? 'smooth' : 'sharp'
            }
        },

        /**
         * 3D core transformation for void effect
         * Handles absorption (draining), corruption (spreading), and annihilation (erasure)
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH - Varies by category
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Absorption: gradual buildup
                if (category === 'absorption') {
                    if (progress < 0.25) {
                        effectStrength = progress / 0.25;
                        effectStrength = Math.pow(effectStrength, 0.7);
                    }
                }

                // Corruption: spreading effect
                if (category === 'corruption') {
                    if (progress < 0.3) {
                        effectStrength = progress / 0.3;
                    }
                    // Corruption pulses
                    if (cfg.spreadPulse) {
                        const spreadPulse = Math.sin(time * Math.PI * 3) * 0.15;
                        effectStrength *= (1 + spreadPulse);
                    }
                }

                // Annihilation: collapse phase
                if (category === 'annihilation' && cfg.collapsePhase) {
                    if (progress < cfg.collapsePhase) {
                        // Accelerating collapse
                        effectStrength = Math.pow(progress / cfg.collapsePhase, 1.5);
                    } else {
                        // Rapid finish
                        effectStrength = 1.0;
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Pull, drift, droop, jitter depending on category
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Pull toward center (absorption/annihilation)
                if (cfg.pullStrength > 0) {
                    const pullTime = time * (cfg.spiralRate || 1);
                    // Spiral pull motion
                    const spiralX = Math.cos(pullTime * Math.PI * 2);
                    const spiralZ = Math.sin(pullTime * Math.PI * 2);
                    const pullAmount = cfg.pullStrength * effectStrength * (1 - progress * 0.5);
                    posX += spiralX * pullAmount;
                    posZ += spiralZ * pullAmount;
                }

                // Jitter (corruption)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    posX += (noise1D(jitterTime * 3) - 0.5) * cfg.jitterAmount * effectStrength;
                    posY += (noise1D(jitterTime * 3 + 33) - 0.5) * cfg.jitterAmount * effectStrength * 0.5;
                    posZ += (noise1D(jitterTime * 3 + 66) - 0.5) * cfg.jitterAmount * effectStrength * 0.3;
                }

                // Tremor (hollow)
                if (cfg.tremor > 0) {
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * cfg.tremor * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * cfg.tremor * effectStrength * 0.5;
                }

                // Drift (taint, erase)
                if (cfg.driftAmount > 0) {
                    const driftTime = time * cfg.driftSpeed;
                    posX += Math.sin(driftTime * Math.PI) * cfg.driftAmount * effectStrength;
                    posZ += Math.cos(driftTime * Math.PI * 0.7) * cfg.driftAmount * effectStrength * 0.5;
                }

                // Droop (wither)
                if (cfg.droopAmount > 0) {
                    const droopProgress = progress * (1 + cfg.droopAcceleration * progress);
                    posY -= cfg.droopAmount * droopProgress * effectStrength;
                }

                // Rise (erase - floating away)
                if (cfg.riseAmount > 0) {
                    posY += cfg.riseAmount * progress * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Shrinkage, vibration, collapse
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * cfg.scaleVibration * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Shrinkage
                if (cfg.scaleShrink > 0) {
                    const shrinkProgress = category === 'annihilation'
                        ? Math.pow(progress, 1.5)  // Accelerating for annihilation
                        : progress;
                    scale -= cfg.scaleShrink * shrinkProgress * effectStrength;
                    scale = Math.max(0.01, scale); // Don't go negative
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Spiral, wobble
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                // Spiral rotation (absorption/annihilation)
                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                    // Accelerate during annihilation
                    if (category === 'annihilation') {
                        rotY *= (1 + progress);
                    }
                }

                // Wobble (corruption)
                if (cfg.rotationWobble > 0) {
                    const wobbleTime = time * cfg.rotationWobbleSpeed;
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ = Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) * cfg.rotationWobble * 0.7 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY - Fade for annihilation
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.2;
                    const endAt = cfg.fadeEndAt || 0.9;

                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        let fadeFactor;

                        if (cfg.fadeCurve === 'accelerating') {
                            // Accelerating fade - slow then fast
                            fadeFactor = 1 - Math.pow(fadeProgress, 2);
                        } else {
                            // Smooth linear fade
                            fadeFactor = 1 - fadeProgress;
                        }

                        meshOpacity = Math.max(0, fadeFactor);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Dimming effect (opposite of fire)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (category === 'absorption') {
                    // Absorption: slow pulsing dim
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else if (category === 'corruption') {
                    // Corruption: erratic flicker
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 3.3 + 1);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.5 ? 0.8 : 1.2;
                    flickerValue = (flicker1 * 0.2 + flicker2 * 0.2 + 0.3) * flicker3;
                } else {
                    // Annihilation: rapid desperate flicker
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.4 + 0.6;
                    flickerValue *= (1 - progress * 0.5); // Dims as it collapses
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Negative glow boost - void DIMS rather than brightens
                const glowBoost = -0.3 * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    voidOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        depth: cfg.depth,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        time,
                        progress,
                        duration: cfg.duration,
                        // Phase 11: Pass animation config to ElementSpawner
                        // Use config.spawnMode (not cfg.spawnMode) because motion may override with string
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth,
                        distortionStrength: config.distortionStrength,
                    },
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    meshOpacity,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODERN GESTURE FACTORY (config-based — for individual gesture files)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a void effect gesture from a config object.
 * Use this when defining gestures in their own files (crown, vortex, barrage, etc.)
 *
 * Categories:
 * - absorption: draining energy, pulling inward
 * - corruption: spreading darkness, life force being consumed
 * - annihilation: total erasure, collapsing to nothing
 * - manifestation: controlled void energy, rings and spectacles
 *
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildVoidEffectGesture(config) {
    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            beats: config.beats,
            intensity: config.intensity,
            ...config
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            amplitudeSync: {
                onBeat: config.category === 'annihilation' ? 1.5 : 1.2,
                offBeat: 1.0,
                curve: config.category === 'manifestation' ? 'smooth' : 'sharp'
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;
                const isManifestation = category === 'manifestation';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = Math.pow(progress / cfg.buildupPhase, 0.7);
                }

                // Absorption: gradual buildup
                if (category === 'absorption' && !cfg.buildupPhase && progress < 0.25) {
                    effectStrength = Math.pow(progress / 0.25, 0.7);
                }

                // Corruption: spreading with pulse
                if (category === 'corruption') {
                    if (!cfg.buildupPhase && progress < 0.3) {
                        effectStrength = progress / 0.3;
                    }
                    if (cfg.spreadPulse) {
                        effectStrength *= (1 + Math.sin(time * Math.PI * 3) * 0.15);
                    }
                }

                // Annihilation: collapse phase
                if (category === 'annihilation' && cfg.collapsePhase) {
                    if (progress < cfg.collapsePhase) {
                        effectStrength = Math.pow(progress / cfg.collapsePhase, 1.5);
                    }
                }

                // Decay in final phase
                const decayRate = cfg.decayRate || 0.2;
                if (progress > (1 - decayRate)) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Pull toward center (absorption/annihilation)
                if (cfg.pullStrength > 0) {
                    const pullTime = time * (cfg.spiralRate || 1);
                    const pullAmount = cfg.pullStrength * effectStrength * (1 - progress * 0.5);
                    posX += Math.cos(pullTime * Math.PI * 2) * pullAmount;
                    posZ += Math.sin(pullTime * Math.PI * 2) * pullAmount;
                }

                // Jitter (corruption)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    posX += (noise1D(jitterTime * 3) - 0.5) * cfg.jitterAmount * effectStrength;
                    posY += (noise1D(jitterTime * 3 + 33) - 0.5) * cfg.jitterAmount * effectStrength * 0.5;
                    posZ += (noise1D(jitterTime * 3 + 66) - 0.5) * cfg.jitterAmount * effectStrength * 0.3;
                }

                // Tremor (hollow)
                if (cfg.tremor > 0) {
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * cfg.tremor * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * cfg.tremor * effectStrength * 0.5;
                }

                // Drift
                if (cfg.driftAmount > 0) {
                    const driftTime = time * cfg.driftSpeed;
                    posX += Math.sin(driftTime * Math.PI) * cfg.driftAmount * effectStrength;
                    posZ += Math.cos(driftTime * Math.PI * 0.7) * cfg.driftAmount * effectStrength * 0.5;
                }

                // Droop (wither — sinking down)
                if (cfg.droopAmount > 0) {
                    posY -= cfg.droopAmount * progress * (1 + cfg.droopAcceleration * progress) * effectStrength;
                }

                // Rise (erase — floating away)
                if (cfg.riseAmount > 0) {
                    posY += cfg.riseAmount * progress * effectStrength;
                }

                // Hover (manifestation — gentle float)
                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * (cfg.scaleFrequency || 2);

                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * (cfg.scaleVibration || 0.01) * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * (cfg.scaleVibration || 0.01) * effectStrength;
                }

                if (cfg.scaleShrink > 0) {
                    const shrinkProgress = category === 'annihilation'
                        ? Math.pow(progress, 1.5)
                        : progress;
                    scale -= cfg.scaleShrink * shrinkProgress * effectStrength;
                    scale = Math.max(0.01, scale);
                }

                if (cfg.scaleGrowth) {
                    scale += cfg.scaleGrowth * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                    if (category === 'annihilation') {
                        rotY *= (1 + progress);
                    }
                }

                if (cfg.rotationWobble > 0) {
                    const wobbleTime = time * cfg.rotationWobbleSpeed;
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ = Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) * cfg.rotationWobble * 0.7 * effectStrength;
                }

                if (cfg.rotationDrift) {
                    rotY += time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY — fade for annihilation
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.2;
                    const endAt = cfg.fadeEndAt || 0.9;
                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        meshOpacity = cfg.fadeCurve === 'accelerating'
                            ? Math.max(0, 1 - Math.pow(fadeProgress, 2))
                            : Math.max(0, 1 - fadeProgress);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW — void DIMS rather than brightens
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 2);
                let flickerValue;

                if (isManifestation) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else if (category === 'absorption') {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else if (category === 'corruption') {
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 3.3 + 1);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.5 ? 0.8 : 1.2;
                    flickerValue = (flicker1 * 0.2 + flicker2 * 0.2 + 0.3) * flicker3;
                } else {
                    // Annihilation: rapid desperate flicker
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.4 + 0.6;
                    flickerValue *= (1 - progress * 0.5);
                }

                const glowIntensity = (cfg.glowIntensityMin || 0.4) +
                    ((cfg.glowIntensityMax || 0.7) - (cfg.glowIntensityMin || 0.4)) * flickerValue * effectStrength;

                // Negative glow boost — void DIMS
                const glowBoost = -(cfg.dimStrength || 0.3) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    meshOpacity,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    voidOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        depth: cfg.depth || 0.5,
                        category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth,
                        distortionStrength: config.distortionStrength,
                    }
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Absorption variants (becoming void)
export const drain = createVoidEffectGesture('drain');
export const siphon = createVoidEffectGesture('siphon');
export const hollow = createVoidEffectGesture('hollow');

// Corruption variants (being corrupted)
export const corrupt = createVoidEffectGesture('corrupt');
export const taint = createVoidEffectGesture('taint');
export const wither = createVoidEffectGesture('wither');

// Annihilation variants (being erased)
export const consume = createVoidEffectGesture('consume');
export const erase = createVoidEffectGesture('erase');
// singularity: now uses modern pattern from voidsingularity.js (void-orb black hole)

// ═══════════════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL GESTURE IMPORTS (modern pattern — each gesture in its own file)
// ═══════════════════════════════════════════════════════════════════════════════════════

// Ring gestures (void-ring/void-wrap — spectacle effects)
import crownGesture from './voidcrown.js';
import danceGesture from './voiddance.js';
import helixGesture from './voidhelix.js';
import pillarGesture from './voidpillar.js';
import drillGesture from './voiddrill.js';
import flourishGesture from './voidflourish.js';
import vortexGesture from './voidvortex.js';
import barrageGesture from './voidbarrage.js';
import impactGesture from './voidimpact.js';
import singularityGesture from './voidsingularity.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS — Both legacy and new pattern
// ═══════════════════════════════════════════════════════════════════════════════════════

// Ring gesture exports
export const voidCrown = crownGesture;
export const voidDance = danceGesture;
export const voidHelix = helixGesture;
export const voidPillar = pillarGesture;
export const voidDrill = drillGesture;
export const voidFlourish = flourishGesture;
export const voidVortex = vortexGesture;
export const voidBarrage = barrageGesture;
export const voidImpact = impactGesture;
export const voidSingularity = singularityGesture;
export const singularity = singularityGesture;  // Backwards compat alias

export {
    VOID_EFFECT_VARIANTS
};

export default {
    // Absorption
    drain,
    siphon,
    hollow,
    // Corruption
    corrupt,
    taint,
    wither,
    // Annihilation
    consume,
    erase,
    singularity,
    // Ring gestures
    voidCrown,
    voidDance,
    voidHelix,
    voidPillar,
    voidDrill,
    voidFlourish,
    voidVortex,
    voidBarrage,
    voidImpact,
    voidSingularity,
    // Factories
    createVoidEffectGesture,
    buildVoidEffectGesture,
    VOID_EFFECT_VARIANTS
};
