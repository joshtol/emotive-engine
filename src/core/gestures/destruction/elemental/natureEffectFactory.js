/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Nature Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for nature/plant/growth effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/natureEffectFactory
 *
 * ## Nature Effect Gestures
 *
 * Three categories of nature gestures:
 *
 * ### Afflicted (being overgrown)
 * - Vines and plants wrapping mascot
 * - Being consumed by nature
 * - Mascot is being ENTANGLED
 *
 * ### Emanating (projecting growth)
 * - Plants and flowers blooming
 * - Life force radiating outward
 * - Mascot is FLOURISHING
 *
 * ### Transform (becoming nature)
 * - Transforming into plant form
 * - Wilting, decaying naturally
 * - Mascot is BECOMING nature
 *
 * ## Variants
 *
 * | Gesture   | Category   | Effect                              |
 * |-----------|------------|-------------------------------------|
 * | entangle  | Afflicted  | Vines wrapping around               |
 * | root      | Afflicted  | Roots growing, anchoring            |
 * | constrict | Afflicted  | Plants squeezing tight              |
 * | bloom     | Emanating  | Flowers blooming outward            |
 * | sprout    | Emanating  | New growth emerging                 |
 * | flourish  | Emanating  | Lush vegetation spreading           |
 * | wilt      | Transform  | Dying, drooping plants              |
 * | overgrow  | Transform  | Completely covered by growth        |
 * | blossom   | Transform  | Transforming into flower form       |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// NATURE EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const NATURE_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is being overtaken by nature
    // ═══════════════════════════════════════════════════════════════════════════════════════

    entangle: {
        name: 'natureEntangle',
        emoji: '🌿',
        type: 'blending',
        description: 'Vines wrapping around, being tangled',
        duration: 3500,
        beats: 5,
        intensity: 1.0,
        category: 'afflicted',
        growth: 0.7,                   // High vine coverage
        // Vine wrapping
        vineCount: 6,
        wrapRate: 0.4,
        spiralWrap: true,
        // 3D element spawning - vines reaching outward
        spawnMode: {
            type: 'surface',
            pattern: 'spikes',         // Vines reaching out like spikes
            embedDepth: 0.15,
            cameraFacing: 0.2,
            clustering: 0.2,
            count: 8,
            scale: 1.0,
            models: ['vine-tendril', 'vine-coil', 'thorn-vine'],
            minDistance: 0.15,         // Vines can be close but not overlapping
            animation: {
                appearAt: 0.1,
                disappearAt: 0.88,
                stagger: 0.05,         // Vines grow sequentially
                enter: {
                    type: 'grow',      // Organic vine growth
                    duration: 0.15,
                    easing: 'easeOutCubic'
                },
                exit: {
                    type: 'shrink',
                    duration: 0.12,
                    easing: 'easeIn'
                },
                // Living plant motion
                pulse: {
                    amplitude: 0.08,
                    frequency: 2,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.4,
                    max: 0.7,
                    frequency: 2,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'outward',
                    speed: 0.01,
                    noise: 0.15        // Organic movement
                },
                rotate: {
                    axis: [0, 1, 0.5], // Slight twist axis
                    speed: 0.008,
                    oscillate: true,
                    range: Math.PI / 10
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 6,
                intensityScaling: {
                    scale: 1.2,
                    driftSpeed: 1.15
                }
            }
        },
        // Glow - deep green
        glowColor: [0.2, 0.7, 0.25],   // Deep vine green
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.8,
        glowFlickerRate: 3,
        // Scale - slight compression from vines
        scaleVibration: 0.015,
        scaleFrequency: 2,
        scaleContract: 0.02,
        // Position - restricted movement
        restrictMovement: true,
        tremor: 0.004,
        tremorFrequency: 5,
        tremorDecay: 0.7,
        // Rotation - slight twist from vines
        rotationTwist: 0.03,
        rotationTwistSpeed: 0.5,
        // Decay
        decayRate: 0.18
    },

    root: {
        name: 'natureRoot',
        emoji: '🌱',
        type: 'blending',
        description: 'Roots growing, anchoring to ground',
        duration: 3000,
        beats: 4,
        intensity: 0.9,
        category: 'afflicted',
        growth: 0.6,
        // Rooting effect
        rootDepth: 0.5,
        anchorStrength: 0.8,
        spreadFromBase: true,
        // 3D element spawning - roots spreading from base
        spawnMode: {
            type: 'surface',
            pattern: 'shell',          // Roots spread across surface
            embedDepth: 0.25,          // Deeper embedding for roots
            cameraFacing: 0.1,
            clustering: 0.3,           // Roots cluster near base
            count: 6,
            scale: 1.0,
            models: ['root-tendril', 'moss-patch'],
            minDistance: 0.18,         // Roots spread out organically
            animation: {
                appearAt: 0.08,
                disappearAt: 0.9,
                stagger: 0.06,         // Roots grow progressively
                enter: {
                    type: 'grow',      // Roots spread out
                    duration: 0.12,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                // Grounded plant motion
                pulse: {
                    amplitude: 0.05,
                    frequency: 1.2,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.3,
                    max: 0.55,
                    frequency: 1.5,
                    pattern: 'sine'
                },
                // Minimal drift - roots anchor
                drift: {
                    direction: 'down',
                    speed: 0.005,
                    noise: 0.05
                },
                scaleVariance: 0.15,
                lifetimeVariance: 0.1,
                blending: 'normal',
                renderOrder: 4,
                intensityScaling: {
                    scale: 1.15,
                    emissiveMax: 1.2
                }
            }
        },
        // Glow - earthy green-brown
        glowColor: [0.35, 0.5, 0.2],   // Root brown-green
        glowIntensityMin: 0.45,
        glowIntensityMax: 0.7,
        glowFlickerRate: 2,
        // Scale - grounded, stable
        scaleVibration: 0.008,
        scaleFrequency: 2,
        // Position - sinking into ground
        sinkAmount: 0.015,
        sinkAcceleration: 0.3,
        tremor: 0.002,
        tremorFrequency: 3,
        tremorDecay: 0.9,              // Becomes very still
        // Decay
        decayRate: 0.2
    },

    constrict: {
        name: 'natureConstrict',
        emoji: '🐍',
        type: 'blending',
        description: 'Plants squeezing tight, crushing grip',
        duration: 2800,
        beats: 4,
        intensity: 1.3,
        category: 'afflicted',
        growth: 0.8,
        // Constriction
        crushForce: 0.6,
        pulsingGrip: true,
        vineThickness: 0.4,
        // 3D element spawning - tight vine wrap
        spawnMode: {
            type: 'surface',
            pattern: 'shell',          // Full wrapping coverage
            embedDepth: 0.1,
            cameraFacing: 0.25,
            clustering: 0.4,           // Tight clustering
            count: 10,
            scale: 1.0,
            models: ['vine-coil', 'thorn-vine', 'vine-tendril'],
            minDistance: 0.1,          // Tight wrapping allows close proximity
            animation: {
                appearAt: 0.05,
                disappearAt: 0.85,
                stagger: 0.025,        // Rapid tightening
                enter: {
                    type: 'grow',
                    duration: 0.08,
                    easing: 'easeOutQuad'
                },
                exit: {
                    type: 'shrink',
                    duration: 0.1,
                    easing: 'easeInCubic'
                },
                // Constricting pulse
                pulse: {
                    amplitude: 0.12,
                    frequency: 4,      // Pulsing grip
                    easing: 'snap'     // Sharp pulse like tightening
                },
                emissive: {
                    min: 0.4,
                    max: 0.8,
                    frequency: 4,
                    pattern: 'sine'
                },
                // Inward squeeze
                drift: {
                    direction: 'inward',
                    speed: 0.015,
                    noise: 0.08
                },
                scaleVariance: 0.18,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 7,
                intensityScaling: {
                    scale: 1.25,
                    pulseAmplitude: 1.4,
                    driftSpeed: 1.3
                }
            }
        },
        // Glow - intense green
        glowColor: [0.25, 0.75, 0.2],  // Intense green
        glowIntensityMin: 0.55,
        glowIntensityMax: 0.9,
        glowFlickerRate: 5,            // Pulsing with grip
        // Scale - compression
        scaleVibration: 0.025,
        scaleFrequency: 4,
        scaleContract: 0.05,           // Significant squeeze
        scalePulse: true,
        // Position - minimal, trapped
        tremor: 0.006,
        tremorFrequency: 8,
        // Decay
        decayRate: 0.15
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is projecting growth
    // ═══════════════════════════════════════════════════════════════════════════════════════

    bloom: {
        name: 'natureBloom',
        emoji: '🌸',
        type: 'blending',
        description: 'Flowers blooming outward, petals spreading',
        duration: 3200,
        beats: 4,
        intensity: 0.8,
        category: 'emanating',
        growth: 0.75,
        // Blooming effect
        bloomRate: 0.5,
        petalSpread: 0.6,
        flowerCount: 8,
        // 3D element spawning - flowers and petals scattered
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',      // Flowers scattered organically
            embedDepth: 0.1,
            cameraFacing: 0.4,         // Flowers face viewer
            clustering: 0.15,
            count: 10,
            scale: 1.0,
            models: ['flower-bloom', 'flower-bud', 'petal-scatter'],
            minDistance: 0.15,         // Flowers need space to be visible
            animation: {
                appearAt: 0.12,
                disappearAt: 0.9,
                stagger: 0.06,         // Flowers bloom sequentially
                enter: {
                    type: 'pop',       // Flowers pop open
                    duration: 0.1,
                    easing: 'easeOutBack',
                    overshoot: 1.2
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                // Gentle flower sway
                pulse: {
                    amplitude: 0.1,
                    frequency: 1.8,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.5,
                    max: 0.9,
                    frequency: 2,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',
                    speed: 0.008,
                    noise: 0.12
                },
                rotate: {
                    axis: 'y',
                    speed: 0.012,
                    oscillate: true,
                    range: Math.PI / 8
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.15,
                blending: 'normal',
                renderOrder: 8,
                intensityScaling: {
                    scale: 1.2,
                    emissiveMax: 1.25
                }
            }
        },
        // Glow - flower pink/soft colors
        glowColor: [0.9, 0.6, 0.7],    // Soft pink
        glowIntensityMin: 0.65,
        glowIntensityMax: 1.0,
        glowFlickerRate: 3,
        // Scale - gentle expansion
        scaleVibration: 0.02,
        scaleFrequency: 2,
        scaleGrow: 0.03,
        scalePulse: true,
        // Position - slight float
        floatAmount: 0.005,
        floatSpeed: 1.2,
        // Rotation - gentle spin with petals
        rotationSpeed: 0.05,
        // Decay
        decayRate: 0.2
    },

    sprout: {
        name: 'natureSprout',
        emoji: '🌱',
        type: 'blending',
        description: 'New growth emerging, shoots appearing',
        duration: 2800,
        beats: 4,
        intensity: 0.6,
        category: 'emanating',
        growth: 0.5,
        // Sprouting
        sproutCount: 5,
        sproutSpeed: 0.4,
        freshGrowth: true,
        // 3D element spawning - new shoots emerging upward
        spawnMode: {
            type: 'surface',
            pattern: 'crown',          // Growth emerging from top
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.2,
            count: 6,
            scale: 1.0,
            models: ['leaf-single', 'leaf-cluster', 'fern-frond'],
            minDistance: 0.18,         // New growth spreads out
            animation: {
                appearAt: 0.1,
                disappearAt: 0.88,
                stagger: 0.05,
                enter: {
                    type: 'grow',      // Shoots emerge from surface
                    duration: 0.12,
                    easing: 'easeOutCubic'
                },
                exit: {
                    type: 'fade',
                    duration: 0.12,
                    easing: 'easeIn'
                },
                // Fresh spring growth
                pulse: {
                    amplitude: 0.08,
                    frequency: 2.5,
                    easing: 'easeInOut'
                },
                emissive: {
                    min: 0.5,
                    max: 0.85,
                    frequency: 2.5,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'up',
                    speed: 0.012,
                    noise: 0.08
                },
                scaleVariance: 0.18,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 7,
                intensityScaling: {
                    scale: 1.18,
                    emissiveMax: 1.2
                }
            }
        },
        // Glow - bright spring green
        glowColor: [0.5, 0.9, 0.35],   // Spring green
        glowIntensityMin: 0.6,
        glowIntensityMax: 0.95,
        glowFlickerRate: 4,
        // Scale - growing upward
        scaleVibration: 0.018,
        scaleFrequency: 3,
        scaleGrow: 0.025,
        // Position - rising energy
        riseAmount: 0.008,
        riseSpeed: 0.6,
        // Decay
        decayRate: 0.18
    },

    flourish: {
        name: 'natureFlourish',
        emoji: '🌳',
        type: 'blending',
        description: 'Lush vegetation spreading, abundant growth',
        duration: 3500,
        beats: 5,
        intensity: 1.1,
        category: 'emanating',
        growth: 0.9,
        // Flourishing
        vegetationDensity: 0.8,
        spreadRate: 0.5,
        layeredGrowth: true,
        // 3D element spawning - lush full coverage
        spawnMode: {
            type: 'surface',
            pattern: 'shell',          // Full lush coverage
            embedDepth: 0.15,
            cameraFacing: 0.3,
            clustering: 0.1,           // Even spread
            count: 12,
            scale: 1.0,
            models: ['leaf-cluster', 'fern-frond', 'vine-tendril', 'flower-bloom'],
            minDistance: 0.12,         // Dense lush coverage
            animation: {
                appearAt: 0.08,
                disappearAt: 0.9,
                stagger: 0.035,
                enter: {
                    type: 'grow',
                    duration: 0.1,
                    easing: 'easeOutBack',
                    overshoot: 1.15
                },
                exit: {
                    type: 'fade',
                    duration: 0.15,
                    easing: 'easeIn'
                },
                // Lush abundant growth
                pulse: {
                    amplitude: 0.1,
                    frequency: 2,
                    easing: 'easeInOut',
                    sync: 'global'
                },
                emissive: {
                    min: 0.55,
                    max: 0.95,
                    frequency: 2,
                    pattern: 'sine'
                },
                drift: {
                    direction: 'outward',
                    speed: 0.01,
                    noise: 0.1
                },
                rotate: {
                    axis: 'y',
                    speed: 0.01,
                    oscillate: true,
                    range: Math.PI / 10
                },
                scaleVariance: 0.2,
                lifetimeVariance: 0.12,
                blending: 'normal',
                renderOrder: 8,
                intensityScaling: {
                    scale: 1.25,
                    emissiveMax: 1.3
                }
            }
        },
        // Glow - rich forest green
        glowColor: [0.3, 0.8, 0.3],    // Forest green
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.0,
        glowFlickerRate: 3,
        // Scale - significant growth
        scaleVibration: 0.025,
        scaleFrequency: 2,
        scaleGrow: 0.05,
        scalePulse: true,
        // Position - expanding presence
        tremor: 0.003,
        tremorFrequency: 4,
        // Rotation - slow majestic
        rotationSpeed: 0.03,
        // Decay
        decayRate: 0.15
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot is becoming nature
    // ═══════════════════════════════════════════════════════════════════════════════════════

    wilt: {
        name: 'natureWilt',
        emoji: '🥀',
        type: 'blending',
        description: 'Wilting and drooping, losing vitality',
        duration: 3500,
        beats: 5,
        intensity: 0.8,
        category: 'transform',
        growth: 0.3,                   // Low growth - dying
        // Wilting effect
        wiltRate: 0.5,
        droopPattern: true,
        // 3D element spawning - sparse wilting elements
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',      // Sparse, drooping coverage
            embedDepth: 0.1,
            cameraFacing: 0.2,
            clustering: 0.25,
            count: 5,
            scale: 0.9,                // Slightly smaller - wilted
            models: ['leaf-single', 'petal-scatter', 'flower-bud'],
            minDistance: 0.2           // Sparse coverage, more spacing
        },
        // Glow - fading yellow-green
        glowColor: [0.6, 0.65, 0.3],   // Fading green
        glowIntensityMin: 0.4,
        glowIntensityMax: 0.65,
        glowFlickerRate: 2,
        // Scale - shrinking, sagging
        scaleVibration: 0.012,
        scaleFrequency: 2,
        scaleShrink: 0.04,
        // Position - drooping down
        droopAmount: 0.02,
        droopAcceleration: 0.4,
        // Rotation - tilting over
        rotationTilt: 0.05,
        rotationTiltSpeed: 0.3,
        // Opacity - fading
        fadeOut: true,
        fadeStartAt: 0.5,
        fadeEndAt: 0.95,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.18
    },

    overgrow: {
        name: 'natureOvergrow',
        emoji: '🌲',
        type: 'blending',
        description: 'Completely covered by growth, consumed by nature',
        duration: 4000,
        beats: 6,
        intensity: 1.3,
        category: 'transform',
        growth: 1.0,                   // Maximum growth
        // Overgrowth
        coverageRate: 0.6,
        layerCount: 4,
        completeEnvelopment: true,
        // 3D element spawning - complete dense coverage
        spawnMode: {
            type: 'surface',
            pattern: 'shell',          // Complete coverage
            embedDepth: 0.2,
            cameraFacing: 0.25,
            clustering: 0.15,
            count: 15,                 // High count for full overgrowth
            scale: 1.1,                // Slightly larger for overgrown feel
            models: ['vine-coil', 'leaf-cluster', 'fern-frond', 'moss-patch', 'mushroom-cap'],
            minDistance: 0.1           // Very dense overgrowth
        },
        // Glow - deep jungle green
        glowColor: [0.15, 0.6, 0.2],   // Deep jungle
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.85,
        glowFlickerRate: 2,
        // Scale - expanding with growth
        scaleVibration: 0.02,
        scaleFrequency: 2,
        scaleGrow: 0.08,
        // Position - enveloped
        tremor: 0.003,
        tremorFrequency: 3,
        sinkAmount: 0.005,
        sinkAcceleration: 0.2,
        // Rotation - twisted by growth
        rotationTwist: 0.04,
        rotationTwistSpeed: 0.3,
        // Opacity - hidden beneath growth
        fadeOut: true,
        fadeStartAt: 0.6,
        fadeEndAt: 0.95,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.1
    },

    blossom: {
        name: 'natureBlossom',
        emoji: '🌺',
        type: 'blending',
        description: 'Transforming into flower form, becoming one with nature',
        duration: 3500,
        beats: 5,
        intensity: 1.0,
        category: 'transform',
        growth: 0.85,
        // Blossom transformation
        transformRate: 0.5,
        petalFormation: true,
        colorShift: true,
        // 3D element spawning - flower transformation
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',      // Flowers scattered in transformation
            embedDepth: 0.1,
            cameraFacing: 0.5,         // Flowers prominently face viewer
            clustering: 0.2,
            count: 10,
            scale: 1.0,
            models: ['flower-bloom', 'petal-scatter', 'flower-bud', 'leaf-single'],
            minDistance: 0.15          // Flowers need visibility
        },
        // Glow - vibrant flower colors
        glowColor: [0.95, 0.5, 0.6],   // Vibrant pink
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.05,
        glowFlickerRate: 4,
        // Scale - blooming expansion
        scaleVibration: 0.025,
        scaleFrequency: 3,
        scaleGrow: 0.04,
        scalePulse: true,
        // Position - gentle float
        floatAmount: 0.006,
        floatSpeed: 1.0,
        riseAmount: 0.01,
        riseSpeed: 0.4,
        // Rotation - flower spin
        rotationSpeed: 0.06,
        // Decay
        decayRate: 0.15
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
 * Create a nature effect gesture
 * @param {string} variant - Variant name from NATURE_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createNatureEffectGesture(variant) {
    const config = NATURE_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[NATURE_EFFECT] Unknown variant: ${variant}, using entangle`);
        return createNatureEffectGesture('entangle');
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
                onBeat: config.category === 'emanating' ? 1.4 : 1.2,
                offBeat: 1.0,
                curve: 'smooth'
            }
        },

        /**
         * 3D core transformation for nature effect
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Afflicted: gradual envelopment
                if (category === 'afflicted') {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                    // Pulsing grip for constrict
                    if (cfg.pulsingGrip) {
                        const pulse = Math.sin(time * Math.PI * 3) * 0.15 + 0.85;
                        effectStrength *= pulse;
                    }
                }

                // Emanating: blooming growth
                if (category === 'emanating') {
                    if (progress < 0.15) {
                        effectStrength = progress / 0.15;
                    }
                    // Gentle pulse
                    const growthPulse = Math.sin(time * Math.PI * 2) * 0.1 + 0.9;
                    effectStrength *= growthPulse;
                }

                // Transform: organic progression
                if (category === 'transform') {
                    effectStrength = Math.pow(progress, 0.7);
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Float, droop, sink, rise
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Float (bloom, blossom)
                if (cfg.floatAmount > 0) {
                    const floatTime = time * cfg.floatSpeed;
                    posY += Math.sin(floatTime * Math.PI * 2) * cfg.floatAmount * effectStrength;
                }

                // Rise (sprout, blossom)
                if (cfg.riseAmount > 0) {
                    posY += cfg.riseAmount * progress * effectStrength;
                }

                // Droop (wilt)
                if (cfg.droopAmount > 0) {
                    const droopProgress = progress * (1 + cfg.droopAcceleration * progress);
                    posY -= cfg.droopAmount * droopProgress * effectStrength;
                }

                // Sink (root, overgrow)
                if (cfg.sinkAmount > 0) {
                    const sinkProgress = progress * (1 + cfg.sinkAcceleration * progress);
                    posY -= cfg.sinkAmount * sinkProgress * effectStrength;
                }

                // Tremor (various - restricted movement)
                if (cfg.tremor > 0) {
                    let tremorStrength = cfg.tremor;
                    if (cfg.tremorDecay) {
                        tremorStrength *= (1 - progress * cfg.tremorDecay);
                    }
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * tremorStrength * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * tremorStrength * 0.5 * effectStrength;
                    posZ += (noise1D(tremorTime + 100) - 0.5) * tremorStrength * 0.3 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Grow, shrink, contract, pulse
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * cfg.scaleVibration * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.6 +
                                      Math.sin(scaleTime * Math.PI * 2.7) * 0.4;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Grow (bloom, sprout, flourish, overgrow, blossom)
                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }

                // Contract (entangle, constrict)
                if (cfg.scaleContract > 0) {
                    scale -= cfg.scaleContract * progress * effectStrength;
                }

                // Shrink (wilt)
                if (cfg.scaleShrink > 0) {
                    scale -= cfg.scaleShrink * progress * effectStrength;
                }

                scale = Math.max(0.1, scale);

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Twist, tilt, spin
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                // Gentle spin (bloom, flourish, blossom)
                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }

                // Twist from vines (entangle, overgrow)
                if (cfg.rotationTwist > 0) {
                    const twistTime = time * cfg.rotationTwistSpeed;
                    rotZ = Math.sin(twistTime * Math.PI * 2) * cfg.rotationTwist * effectStrength;
                }

                // Tilt from wilting
                if (cfg.rotationTilt > 0) {
                    const tiltProgress = progress * cfg.rotationTiltSpeed;
                    rotX = cfg.rotationTilt * tiltProgress * effectStrength;
                    rotZ = cfg.rotationTilt * 0.5 * tiltProgress * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY - Fade for wilting/overgrowth
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.5;
                    const endAt = cfg.fadeEndAt || 0.95;

                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        let fadeFactor;

                        if (cfg.fadeCurve === 'accelerating') {
                            fadeFactor = 1 - Math.pow(fadeProgress, 2);
                        } else {
                            fadeFactor = 1 - fadeProgress;
                        }

                        meshOpacity = Math.max(0, fadeFactor);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Natural, organic greens and flower colors
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (category === 'emanating') {
                    // Blooming: gentle pulse
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.2 + 0.8;
                } else if (cfg.pulsingGrip) {
                    // Constrict: rhythmic squeeze
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.25 + 0.75;
                } else {
                    // Default: organic sway
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.15 + 0.85;
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Nature glow - organic, life energy
                const glowBoost = 0.2 * effectStrength * cfg.intensity * cfg.growth;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    natureOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        growth: cfg.growth,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        time,
                        // Extract spawn options from spawnMode (like fire does)
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth
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
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Afflicted variants (being overtaken)
export const entangle = createNatureEffectGesture('entangle');
export const root = createNatureEffectGesture('root');
export const constrict = createNatureEffectGesture('constrict');

// Emanating variants (projecting growth)
export const bloom = createNatureEffectGesture('bloom');
// NOTE: sprout removed due to crash - needs investigation
export const flourish = createNatureEffectGesture('flourish');

// Transform variants (becoming nature)
// NOTE: wilt and overgrow removed due to crash - needs investigation
export const blossom = createNatureEffectGesture('blossom');

export {
    NATURE_EFFECT_VARIANTS
};

export default {
    // Afflicted
    entangle,
    root,
    constrict,
    // Emanating
    bloom,
    flourish,
    // Transform
    blossom,
    // Factory
    createNatureEffectGesture,
    NATURE_EFFECT_VARIANTS
};
