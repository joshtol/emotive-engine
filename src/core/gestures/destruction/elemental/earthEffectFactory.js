/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for earth/stone/rock effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/earthEffectFactory
 *
 * ## Earth Effect Gestures
 *
 * Three categories of earth gestures:
 *
 * ### Afflicted (being petrified)
 * - Stone spreading across mascot
 * - Becoming heavy, immobile
 * - Mascot is being PETRIFIED
 *
 * ### Emanating (projecting earth power)
 * - Ground shaking, tremors
 * - Rocks and debris floating
 * - Mascot is CONTROLLING earth
 *
 * ### Transform (becoming stone)
 * - Crystallizing into solid rock
 * - Cracking, shattering stone
 * - Mascot is BECOMING stone
 *
 * ## Variants
 *
 * | Gesture   | Category   | Effect                              |
 * |-----------|------------|-------------------------------------|
 * | petrify   | Afflicted  | Turning to stone, freezing in place |
 * | burden    | Afflicted  | Weighed down by earth               |
 * | encase    | Transform  | Encased in rock shell               |
 * | rumble    | Emanating  | Ground shaking, tremors             |
 * | quake     | Emanating  | Violent earthquake effect           |
 * | crumble   | Transform  | Stone crumbling apart               |
 * | shatter   | Transform  | Rock shattering explosively         |
 * | erode     | Transform  | Slowly wearing away                 |
 * | fossilize | Transform  | Ancient stone transformation        |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// EARTH EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const EARTH_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is being petrified
    // ═══════════════════════════════════════════════════════════════════════════════════════

    petrify: {
        name: 'earthPetrify',
        emoji: '🗿',
        type: 'blending',
        description: 'Turning to stone, movement freezing',
        duration: 3500,
        beats: 5,
        intensity: 1.2,
        category: 'afflicted',
        petrification: 0.85,           // High stone coverage
        // 3D Element spawning - stone spreading up from base
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Coverage spreading up
            embedDepth: 0.35,           // Heavy embed for stone feel
            cameraFacing: 0.25,         // More natural stone orientation
            clustering: 0.15,           // Slight clustering
            scale: 1.0                  // Use φ-based model sizes
        },
        // Spreading stone
        spreadRate: 0.4,
        spreadFromBase: true,
        // Glow - gray stone
        glowColor: [0.6, 0.55, 0.5],   // Stone gray
        glowIntensityMin: 0.4,
        glowIntensityMax: 0.7,
        glowFlickerRate: 2,            // Slow, solid
        // Scale - slight compression
        scaleVibration: 0.008,
        scaleFrequency: 2,
        scaleContract: 0.01,
        // Position - freezing in place
        tremor: 0.003,
        tremorFrequency: 6,
        tremorDecay: 0.8,              // Movement stops
        // Decay
        decayRate: 0.15
    },

    burden: {
        name: 'earthBurden',
        emoji: '⚖️',
        type: 'blending',
        description: 'Weighed down by immense weight',
        duration: 3000,
        beats: 4,
        intensity: 0.9,
        category: 'afflicted',
        petrification: 0.5,
        // Weight effect
        weightAmount: 0.8,
        crushingForce: true,
        // Glow - heavy brown
        glowColor: [0.5, 0.45, 0.35],  // Heavy earth
        glowIntensityMin: 0.45,
        glowIntensityMax: 0.7,
        glowFlickerRate: 2,
        // Scale - compression from weight
        scaleVibration: 0.015,
        scaleFrequency: 3,
        scaleSquash: 0.04,             // Flattening under weight
        // Position - sinking down
        sinkAmount: 0.02,
        sinkAcceleration: 0.5,
        // Decay
        decayRate: 0.18
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is controlling earth
    // ═══════════════════════════════════════════════════════════════════════════════════════

    rumble: {
        name: 'earthRumble',
        emoji: '🌋',
        type: 'blending',
        description: 'Ground shaking, tremors emanating',
        duration: 2800,
        beats: 4,
        intensity: 1.0,
        category: 'emanating',
        petrification: 0.4,
        // Rumble effect
        rumbleIntensity: 0.7,
        groundWave: true,
        // 3D Element spawning - rocks floating from tremors
        spawnMode: 'orbit',
        // Glow - earthy brown
        glowColor: [0.55, 0.45, 0.3],  // Earthy brown
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.85,
        glowFlickerRate: 8,            // Shaking rhythm
        // Scale - vibrating
        scaleVibration: 0.035,
        scaleFrequency: 10,
        // Position - shaking
        shakeAmount: 0.015,
        shakeFrequency: 15,
        // Decay
        decayRate: 0.18
    },

    quake: {
        name: 'earthQuake',
        emoji: '🌍',
        type: 'blending',
        description: 'Violent earthquake, ground splitting',
        duration: 2500,
        beats: 4,
        intensity: 1.5,
        category: 'emanating',
        petrification: 0.6,
        // Quake effect
        quakeIntensity: 1.0,
        crackPattern: true,
        // Glow - intense earth
        glowColor: [0.6, 0.4, 0.25],   // Intense earth
        glowIntensityMin: 0.55,
        glowIntensityMax: 1.0,
        glowFlickerRate: 12,           // Violent shaking
        // Scale - chaotic vibration
        scaleVibration: 0.05,
        scaleFrequency: 15,
        // Position - violent shaking
        shakeAmount: 0.025,
        shakeFrequency: 20,
        // Decay
        decayRate: 0.15
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot is becoming/breaking stone
    // ═══════════════════════════════════════════════════════════════════════════════════════

    encase: {
        name: 'earthEncase',
        emoji: '🪨',
        type: 'blending',
        description: 'Encased in rock shell, stone armor forming',
        duration: 3500,
        beats: 5,
        intensity: 1.1,
        category: 'transform',
        petrification: 0.9,
        // 3D Element spawning - rock shell armor formation
        spawnMode: {
            type: 'surface',
            pattern: 'shell',           // Full armor coverage
            embedDepth: 0.45,           // Deep embed for encasement
            cameraFacing: 0.2,          // Natural stone look
            clustering: 0.0,            // Even shell distribution
            count: 14,                  // Dense coverage
            scale: 1.2                  // Slightly larger for armor plates
        },
        // Encasement spreading
        encaseProgress: 0.8,
        shellFormation: true,
        // Glow - dark stone
        glowColor: [0.45, 0.42, 0.38], // Dark stone
        glowIntensityMin: 0.4,
        glowIntensityMax: 0.65,
        glowFlickerRate: 1.5,
        // Scale - slight growth from shell
        scaleVibration: 0.012,
        scaleFrequency: 2,
        scaleGrow: 0.03,
        // Position - rooted
        tremor: 0.002,
        tremorFrequency: 3,
        tremorDecay: 0.9,
        // Decay
        decayRate: 0.12
    },

    crumble: {
        name: 'earthCrumble',
        emoji: '🏚️',
        type: 'blending',
        description: 'Stone crumbling apart, falling to pieces',
        duration: 3000,
        beats: 4,
        intensity: 1.2,
        category: 'transform',
        petrification: 0.7,
        // Crumble effect
        crumbleRate: 0.5,
        debrisFall: true,
        // 3D Element spawning - rocks falling off
        spawnMode: 'burst',
        // Glow - dusty gray
        glowColor: [0.55, 0.5, 0.45],  // Dusty
        glowIntensityMin: 0.45,
        glowIntensityMax: 0.75,
        glowFlickerRate: 5,            // Crumbling rhythm
        // Scale - shrinking as crumbling
        scaleVibration: 0.025,
        scaleFrequency: 6,
        scaleShrink: 0.06,
        // Position - pieces falling
        tremor: 0.008,
        tremorFrequency: 8,
        sinkAmount: 0.01,
        sinkAcceleration: 0.3,
        // Opacity - fading
        fadeOut: true,
        fadeStartAt: 0.5,
        fadeEndAt: 0.95,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.15
    },

    shatter: {
        name: 'earthShatter',
        emoji: '💥',
        type: 'blending',
        description: 'Rock shattering explosively',
        duration: 2000,
        beats: 3,
        intensity: 1.8,
        category: 'transform',
        petrification: 0.8,
        // Shatter effect
        shatterPoint: 0.35,
        explosionForce: 0.8,
        fragmentCount: 12,
        // 3D Element spawning - rock fragments flying
        spawnMode: 'burst',
        // Glow - flash then dust
        glowColor: [0.7, 0.65, 0.55],  // Bright dust
        glowIntensityMin: 0.5,
        glowIntensityMax: 1.3,
        glowFlickerRate: 15,           // Rapid
        // Scale - expand then scatter
        scaleVibration: 0.06,
        scaleFrequency: 12,
        // Position - explosive scatter
        shakeAmount: 0.04,
        shakeFrequency: 25,
        // Opacity - rapid fade after shatter
        fadeOut: true,
        fadeStartAt: 0.4,
        fadeEndAt: 0.9,
        fadeCurve: 'accelerating',
        // Decay
        decayRate: 0.08
    },

    erode: {
        name: 'earthErode',
        emoji: '🏜️',
        type: 'blending',
        description: 'Slowly wearing away, weathering',
        duration: 4500,
        beats: 6,
        intensity: 0.7,
        category: 'transform',
        petrification: 0.6,
        // Erosion effect
        erosionRate: 0.25,
        windPattern: true,
        // Glow - sandy
        glowColor: [0.65, 0.55, 0.4],  // Sandy
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.75,
        glowFlickerRate: 2,            // Slow, gradual
        // Scale - gradual shrinking
        scaleVibration: 0.01,
        scaleFrequency: 2,
        scaleShrink: 0.04,
        // Position - slight drift like sand
        driftAmount: 0.004,
        driftSpeed: 0.5,
        // Opacity - slow fade
        fadeOut: true,
        fadeStartAt: 0.5,
        fadeEndAt: 0.95,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.2
    },

    fossilize: {
        name: 'earthFossilize',
        emoji: '🦴',
        type: 'blending',
        description: 'Ancient stone transformation, becoming fossil',
        duration: 4000,
        beats: 6,
        intensity: 1.0,
        category: 'transform',
        petrification: 0.95,
        // 3D Element spawning - ancient fossilized stone
        spawnMode: {
            type: 'surface',
            pattern: 'scattered',       // Ancient, worn distribution
            embedDepth: 0.5,            // Deep embed (fossil in stone)
            cameraFacing: 0.15,         // Very natural orientation
            clustering: 0.4,            // Some clustering (fossil deposits)
            count: 10,                  // Moderate coverage
            scale: 0.9                  // Weathered, moderate size
        },
        // Fossilization
        ageProgression: 0.6,
        ancientPattern: true,
        // Glow - ancient brown
        glowColor: [0.5, 0.4, 0.3],    // Ancient brown
        glowIntensityMin: 0.35,
        glowIntensityMax: 0.6,
        glowFlickerRate: 1,            // Very slow, ancient
        // Scale - slight compression
        scaleVibration: 0.006,
        scaleFrequency: 1,
        scaleContract: 0.02,
        // Position - completely still
        tremor: 0.001,
        tremorFrequency: 1,
        tremorDecay: 0.95,
        // Decay
        decayRate: 0.1
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
 * Create an earth effect gesture
 * @param {string} variant - Variant name from EARTH_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createEarthEffectGesture(variant) {
    const config = EARTH_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[EARTH_EFFECT] Unknown variant: ${variant}, using petrify`);
        return createEarthEffectGesture('petrify');
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
                onBeat: config.category === 'emanating' ? 1.5 : 1.2,
                offBeat: 1.0,
                curve: 'sharp'
            }
        },

        /**
         * 3D core transformation for earth effect
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

                // Afflicted: gradual petrification
                if (category === 'afflicted') {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                }

                // Emanating: sudden onset, sustained
                if (category === 'emanating') {
                    if (progress < 0.1) {
                        effectStrength = progress / 0.1;
                    }
                }

                // Transform: building or sudden (shatter)
                if (category === 'transform') {
                    if (cfg.shatterPoint) {
                        if (progress < cfg.shatterPoint) {
                            effectStrength = progress / cfg.shatterPoint;
                            effectStrength = Math.pow(effectStrength, 0.5); // Build tension
                        } else {
                            // Post-shatter
                            effectStrength = 1.0;
                        }
                    } else {
                        effectStrength = Math.min(1, progress / 0.25);
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Shake, sink, tremor, drift
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Shake (rumble, quake, shatter)
                if (cfg.shakeAmount > 0) {
                    const shakeTime = time * cfg.shakeFrequency;
                    let shakeStrength = cfg.shakeAmount * effectStrength;

                    // Shatter: explosive after shatter point
                    if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                        const explodeProgress = (progress - cfg.shatterPoint) / (1 - cfg.shatterPoint);
                        shakeStrength *= (1 + explodeProgress * cfg.explosionForce);
                    }

                    posX += (noise1D(shakeTime) - 0.5) * shakeStrength;
                    posY += (noise1D(shakeTime + 33) - 0.5) * shakeStrength * 0.7;
                    posZ += (noise1D(shakeTime + 66) - 0.5) * shakeStrength * 0.5;
                }

                // Tremor (petrify, encase)
                if (cfg.tremor > 0) {
                    let tremorStrength = cfg.tremor;
                    if (cfg.tremorDecay) {
                        tremorStrength *= (1 - progress * cfg.tremorDecay);
                    }
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * tremorStrength * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * tremorStrength * 0.5 * effectStrength;
                }

                // Sink (burden, crumble)
                if (cfg.sinkAmount > 0) {
                    const sinkProgress = progress * (1 + cfg.sinkAcceleration * progress);
                    posY -= cfg.sinkAmount * sinkProgress * effectStrength;
                }

                // Drift (erode - like sand in wind)
                if (cfg.driftAmount > 0) {
                    const driftTime = time * cfg.driftSpeed;
                    posX += Math.sin(driftTime * Math.PI * 2) * cfg.driftAmount * effectStrength;
                    posZ += Math.cos(driftTime * Math.PI * 1.7) * cfg.driftAmount * 0.5 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Squash, shrink, grow
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                let scaleY = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                  Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;

                // Contract (petrify, fossilize)
                if (cfg.scaleContract > 0) {
                    scale -= cfg.scaleContract * progress * effectStrength;
                }

                // Shrink (crumble, erode)
                if (cfg.scaleShrink > 0) {
                    scale -= cfg.scaleShrink * progress * effectStrength;
                }

                // Grow (encase)
                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }

                // Squash (burden - flattening under weight)
                if (cfg.scaleSquash > 0) {
                    scaleY = scale * (1 - cfg.scaleSquash * progress * effectStrength);
                } else {
                    scaleY = scale;
                }

                scale = Math.max(0.1, scale);
                scaleY = Math.max(0.1, scaleY);

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY - Fade for crumbling/eroding
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
                // GLOW - Earthy, stone-like
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (category === 'emanating') {
                    // Rumble/quake: rapid, harsh
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                    flickerValue *= (0.8 + hash(Math.floor(flickerTime * 3)) * 0.4);
                } else if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    // Shatter: bright flash
                    flickerValue = 1.0 + (noise1D(flickerTime * 5) * 0.5);
                } else {
                    // Default: slow, solid
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.2 + 0.8;
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Earth glow - subtle, grounded
                const glowBoost = 0.1 * effectStrength * cfg.intensity * cfg.petrification;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    earthOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        petrification: cfg.petrification,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,  // 'orbit' | 'impact' | 'burst' | null
                        time
                    },
                    position: [posX, posY, posZ],
                    rotation: [0, 0, 0],
                    scale,
                    scaleY: cfg.scaleSquash > 0 ? scaleY : undefined,
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

// Afflicted variants (being petrified)
export const petrify = createEarthEffectGesture('petrify');
export const burden = createEarthEffectGesture('burden');

// Emanating variants (controlling earth)
export const rumble = createEarthEffectGesture('rumble');
export const quake = createEarthEffectGesture('quake');

// Transform variants (becoming/breaking stone)
export const encase = createEarthEffectGesture('encase');
export const crumble = createEarthEffectGesture('crumble');
export const shatter = createEarthEffectGesture('shatter');
export const erode = createEarthEffectGesture('erode');
export const fossilize = createEarthEffectGesture('fossilize');

export {
    EARTH_EFFECT_VARIANTS
};

export default {
    // Afflicted
    petrify,
    burden,
    // Emanating
    rumble,
    quake,
    // Transform
    encase,
    crumble,
    shatter,
    erode,
    fossilize,
    // Factory
    createEarthEffectGesture,
    EARTH_EFFECT_VARIANTS
};
