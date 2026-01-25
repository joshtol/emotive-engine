/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Light Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for light/holy effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/lightEffectFactory
 *
 * ## Light Effect Gestures
 *
 * Three categories of light gestures:
 *
 * ### Afflicted (overwhelmed by light)
 * - Being blinded by radiance
 * - Purified/cleansed by light
 * - Mascot is being ILLUMINATED
 *
 * ### Emanating (projecting radiance)
 * - Holy aura emanating outward
 * - Glowing with inner light
 * - Mascot is RADIATING light
 *
 * ### Transform (becoming light)
 * - Ascending into pure light
 * - Dissolving into radiance
 * - Mascot is TRANSCENDING
 *
 * ## Variants
 *
 * | Gesture    | Category   | Effect                              |
 * |------------|------------|-------------------------------------|
 * | blind      | Afflicted  | Overwhelmed by blinding light       |
 * | purify     | Afflicted  | Cleansed by holy radiance           |
 * | cleanse    | Afflicted  | Gentle purifying glow               |
 * | radiate    | Emanating  | Powerful light rays emanating       |
 * | glow       | Emanating  | Soft inner radiance                 |
 * | beacon     | Emanating  | Bright signal of light              |
 * | ascend     | Transform  | Rising into divine light            |
 * | illuminate | Transform  | Becoming pure illumination          |
 * | dissolve   | Transform  | Dissolving into particles of light  |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// LIGHT EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const LIGHT_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is being illuminated
    // ═══════════════════════════════════════════════════════════════════════════════════════

    blind: {
        name: 'lightBlind',
        emoji: '☀️',
        type: 'blending',
        description: 'Overwhelmed by blinding radiance, unable to see',
        duration: 2500,
        beats: 4,
        intensity: 1.5,
        category: 'afflicted',
        radiance: 1.0,                 // Maximum radiance
        // Blinding flash
        flashPeak: 0.3,                // Peak intensity point
        flashDecay: 0.5,
        // Glow - pure white
        glowColor: [1.0, 0.98, 0.9],   // Warm white
        glowIntensityMin: 0.8,
        glowIntensityMax: 1.8,         // Very bright
        glowFlickerRate: 8,            // Rapid flash
        // Scale - slight recoil
        scaleVibration: 0.02,
        scaleFrequency: 6,
        // Position - recoiling from light
        recoilAmount: 0.01,
        recoilSpeed: 2,
        // Decay
        decayRate: 0.2
    },

    purify: {
        name: 'lightPurify',
        emoji: '✨',
        type: 'blending',
        description: 'Cleansed by holy radiance, impurities burning away',
        duration: 3500,
        beats: 5,
        intensity: 1.2,
        category: 'afflicted',
        radiance: 0.8,
        // Purification waves
        waveRate: 0.4,
        waveSpread: true,
        // Glow - golden purifying
        glowColor: [1.0, 0.9, 0.6],    // Golden
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.2,
        glowFlickerRate: 4,
        // Scale - pulsing with purification
        scaleVibration: 0.025,
        scaleFrequency: 3,
        scalePulse: true,
        // Position - slight rise
        riseAmount: 0.008,
        riseSpeed: 0.5,
        // Decay
        decayRate: 0.18
    },

    cleanse: {
        name: 'lightCleanse',
        emoji: '🌟',
        type: 'blending',
        description: 'Gentle purifying glow, soothing radiance',
        duration: 4000,
        beats: 6,
        intensity: 0.7,
        category: 'afflicted',
        radiance: 0.5,
        // Gentle effect
        gentleWave: true,
        // Glow - soft warm
        glowColor: [1.0, 0.95, 0.85],  // Soft warm
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.0,
        glowFlickerRate: 2,            // Slow pulse
        // Scale - gentle breathing
        scaleVibration: 0.012,
        scaleFrequency: 2,
        scalePulse: true,
        // Position - slight float
        floatAmount: 0.004,
        floatSpeed: 1.5,
        // Decay
        decayRate: 0.22
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is projecting light
    // ═══════════════════════════════════════════════════════════════════════════════════════

    radiate: {
        name: 'lightRadiate',
        emoji: '💫',
        type: 'blending',
        description: 'Powerful light rays emanating in all directions',
        duration: 3000,
        beats: 4,
        intensity: 1.3,
        category: 'emanating',
        radiance: 0.85,
        // Ray projection
        rayCount: 8,
        raySpeed: 1.5,
        rayLength: 0.6,
        // Glow - brilliant gold
        glowColor: [1.0, 0.88, 0.5],   // Brilliant gold
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.4,
        glowFlickerRate: 5,
        // Scale - expanding pulses
        scaleVibration: 0.03,
        scaleFrequency: 4,
        scalePulse: true,
        scaleExpand: 0.02,
        // Rotation - slow majestic
        rotationSpeed: 0.1,
        // Decay
        decayRate: 0.15
    },

    glow: {
        name: 'lightGlow',
        emoji: '💡',
        type: 'blending',
        description: 'Soft inner radiance, warmth from within',
        duration: 3500,
        beats: 5,
        intensity: 0.6,
        category: 'emanating',
        radiance: 0.45,
        // Soft emanation
        innerGlow: true,
        glowSpread: 0.3,
        // Glow - warm amber
        glowColor: [1.0, 0.9, 0.7],    // Warm amber
        glowIntensityMin: 0.65,
        glowIntensityMax: 0.95,
        glowFlickerRate: 2.5,
        // Scale - gentle breathing
        scaleVibration: 0.015,
        scaleFrequency: 2,
        scalePulse: true,
        // Position - slight hover
        floatAmount: 0.003,
        floatSpeed: 1,
        // Decay
        decayRate: 0.2
    },

    beacon: {
        name: 'lightBeacon',
        emoji: '🔦',
        type: 'blending',
        description: 'Bright signal of light, calling attention',
        duration: 2800,
        beats: 4,
        intensity: 1.1,
        category: 'emanating',
        radiance: 0.75,
        // Beacon pulse
        beaconPulse: true,
        pulseRate: 1.5,
        // Glow - bright white-yellow
        glowColor: [1.0, 0.95, 0.8],   // Bright beacon
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.3,
        glowFlickerRate: 6,            // Rhythmic flash
        // Scale - pulse with beacon
        scaleVibration: 0.025,
        scaleFrequency: 3,
        // Position - stable
        tremor: 0.002,
        tremorFrequency: 4,
        // Decay
        decayRate: 0.18
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot is becoming light
    // ═══════════════════════════════════════════════════════════════════════════════════════

    ascend: {
        name: 'lightAscend',
        emoji: '👼',
        type: 'blending',
        description: 'Rising into divine light, transcending form',
        duration: 4000,
        beats: 6,
        intensity: 1.4,
        category: 'transform',
        radiance: 0.9,
        // Ascending motion
        ascendRate: 0.6,
        ascendAcceleration: 0.3,
        // Glow - heavenly gold
        glowColor: [1.0, 0.92, 0.65],  // Heavenly
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.5,
        glowFlickerRate: 3,
        // Scale - slight growth as ascending
        scaleVibration: 0.02,
        scaleFrequency: 2,
        scaleGrow: 0.04,
        // Position - rising upward
        riseAmount: 0.03,
        riseSpeed: 0.4,
        // Rotation - gentle spin
        rotationSpeed: 0.08,
        // Opacity - fade to light
        fadeOut: true,
        fadeStartAt: 0.6,
        fadeEndAt: 0.95,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.1
    },

    illuminate: {
        name: 'lightIlluminate',
        emoji: '🌞',
        type: 'blending',
        description: 'Becoming pure illumination, merging with light',
        duration: 3500,
        beats: 5,
        intensity: 1.5,
        category: 'transform',
        radiance: 0.95,
        // Illumination spreading
        spreadFromCore: true,
        spreadRate: 0.5,
        // Glow - pure radiance
        glowColor: [1.0, 0.95, 0.85],  // Pure light
        glowIntensityMin: 0.8,
        glowIntensityMax: 1.6,
        glowFlickerRate: 4,
        // Scale - expanding into light
        scaleVibration: 0.03,
        scaleFrequency: 3,
        scaleGrow: 0.06,
        scalePulse: true,
        // Position - slight float
        floatAmount: 0.006,
        floatSpeed: 1.2,
        // Opacity - becoming transparent
        fadeOut: true,
        fadeStartAt: 0.4,
        fadeEndAt: 0.9,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.12
    },

    dissolve: {
        name: 'lightDissolve',
        emoji: '✴️',
        type: 'blending',
        description: 'Dissolving into particles of light',
        duration: 3000,
        beats: 4,
        intensity: 1.3,
        category: 'transform',
        radiance: 0.8,
        // Particle dissolution
        particleDisperse: true,
        disperseRate: 0.4,
        // Glow - sparkling
        glowColor: [1.0, 0.98, 0.9],   // Sparkling white
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.4,
        glowFlickerRate: 10,           // Sparkle rate
        // Scale - fragmenting
        scaleVibration: 0.04,
        scaleFrequency: 6,
        scaleShrink: 0.03,
        // Position - drifting particles
        driftAmount: 0.015,
        driftSpeed: 1.5,
        // Opacity - dissolving
        fadeOut: true,
        fadeStartAt: 0.3,
        fadeEndAt: 0.95,
        fadeCurve: 'accelerating',
        // Decay
        decayRate: 0.08
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
 * Create a light effect gesture
 * @param {string} variant - Variant name from LIGHT_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createLightEffectGesture(variant) {
    const config = LIGHT_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[LIGHT_EFFECT] Unknown variant: ${variant}, using glow`);
        return createLightEffectGesture('glow');
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
                onBeat: config.category === 'transform' ? 1.5 : 1.3,
                offBeat: 1.0,
                curve: 'smooth'
            }
        },

        /**
         * 3D core transformation for light effect
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

                // Afflicted: flash peak then decay
                if (category === 'afflicted') {
                    if (cfg.flashPeak) {
                        if (progress < cfg.flashPeak) {
                            effectStrength = progress / cfg.flashPeak;
                            effectStrength = Math.pow(effectStrength, 0.5); // Quick rise
                        } else {
                            effectStrength = 1 - ((progress - cfg.flashPeak) * cfg.flashDecay);
                            effectStrength = Math.max(0.3, effectStrength);
                        }
                    } else if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                }

                // Emanating: sustained with pulses
                if (category === 'emanating') {
                    if (cfg.beaconPulse) {
                        const beaconTime = time * cfg.pulseRate;
                        effectStrength = 0.6 + Math.sin(beaconTime * Math.PI * 2) * 0.4;
                    } else {
                        effectStrength = Math.min(1, progress / 0.15);
                    }
                }

                // Transform: building to transcendence
                if (category === 'transform') {
                    if (progress < 0.25) {
                        effectStrength = progress / 0.25;
                        effectStrength = Math.pow(effectStrength, 0.7);
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress * 0.7);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Rise, float, recoil, drift
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Rise (ascend, purify)
                if (cfg.riseAmount > 0) {
                    const riseProgress = Math.pow(progress, 1 + (cfg.ascendAcceleration || 0));
                    posY += cfg.riseAmount * riseProgress * effectStrength;
                }

                // Float (glow, cleanse, illuminate)
                if (cfg.floatAmount > 0) {
                    const floatTime = time * cfg.floatSpeed;
                    posY += Math.sin(floatTime * Math.PI * 2) * cfg.floatAmount * effectStrength;
                }

                // Recoil (blind)
                if (cfg.recoilAmount > 0) {
                    const recoilTime = time * cfg.recoilSpeed;
                    const recoilPulse = Math.sin(recoilTime * Math.PI);
                    posZ -= cfg.recoilAmount * recoilPulse * effectStrength;
                }

                // Drift (dissolve)
                if (cfg.driftAmount > 0) {
                    const driftTime = time * cfg.driftSpeed;
                    posX += (noise1D(driftTime) - 0.5) * cfg.driftAmount * effectStrength;
                    posY += (noise1D(driftTime + 50) - 0.5) * cfg.driftAmount * 0.5 * effectStrength;
                    posZ += (noise1D(driftTime + 100) - 0.5) * cfg.driftAmount * 0.3 * effectStrength;
                }

                // Tremor (beacon)
                if (cfg.tremor > 0) {
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * cfg.tremor * effectStrength;
                    posY += (noise1D(tremorTime + 33) - 0.5) * cfg.tremor * 0.5 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Pulse, grow, shrink
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * cfg.scaleVibration * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2);
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Growth (radiate, ascend, illuminate)
                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }
                if (cfg.scaleExpand > 0) {
                    scale += cfg.scaleExpand * progress * effectStrength;
                }

                // Shrink (dissolve)
                if (cfg.scaleShrink > 0) {
                    scale -= cfg.scaleShrink * progress * effectStrength;
                }

                scale = Math.max(0.1, scale);

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Majestic, gentle
                // ═══════════════════════════════════════════════════════════════
                const rotX = 0, rotZ = 0;
                let rotY = 0;

                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY - Fade for transcendence
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.4;
                    const endAt = cfg.fadeEndAt || 0.9;

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
                // GLOW - Brilliant radiance
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (category === 'afflicted' && cfg.flashPeak) {
                    // Flash: bright peak
                    if (progress < cfg.flashPeak * 2) {
                        flickerValue = 1.0 + Math.sin(flickerTime * Math.PI * 4) * 0.3;
                    } else {
                        flickerValue = 0.7 + Math.sin(flickerTime * Math.PI * 2) * 0.2;
                    }
                } else if (cfg.beaconPulse) {
                    // Beacon: rhythmic flash
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.4 + 0.6;
                } else {
                    // Default: gentle shimmer
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.25 + 0.75;
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Light glow boost - additive brightness
                const glowBoost = 0.4 * effectStrength * cfg.intensity * cfg.radiance;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    lightOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        radiance: cfg.radiance,
                        category: cfg.category,
                        time
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

// Afflicted variants (being illuminated)
export const blind = createLightEffectGesture('blind');
export const purify = createLightEffectGesture('purify');
export const cleanse = createLightEffectGesture('cleanse');

// Emanating variants (projecting light)
export const radiate = createLightEffectGesture('radiate');
export const glow = createLightEffectGesture('glow');
export const beacon = createLightEffectGesture('beacon');

// Transform variants (becoming light)
export const ascend = createLightEffectGesture('ascend');
export const illuminate = createLightEffectGesture('illuminate');
export const dissolve = createLightEffectGesture('dissolve');

export {
    LIGHT_EFFECT_VARIANTS
};

export default {
    // Afflicted
    blind,
    purify,
    cleanse,
    // Emanating
    radiate,
    glow,
    beacon,
    // Transform
    ascend,
    illuminate,
    dissolve,
    // Factory
    createLightEffectGesture,
    LIGHT_EFFECT_VARIANTS
};
