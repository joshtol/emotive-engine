/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Poison Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for poison/acid/toxic effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/poisonEffectFactory
 *
 * ## Poison Effect Gestures
 *
 * Three categories of poison gestures:
 *
 * ### Afflicted (being poisoned)
 * - Toxins spreading through mascot
 * - Sickening, weakening effect
 * - Mascot is being POISONED
 *
 * ### Emanating (exuding toxins)
 * - Toxic aura spreading outward
 * - Dripping, oozing poison
 * - Mascot is EMANATING poison
 *
 * ### Transform (becoming toxic)
 * - Dissolving into acid
 * - Melting, decaying form
 * - Mascot is CORRODING
 *
 * ## Variants
 *
 * | Gesture  | Category   | Effect                              |
 * |----------|------------|-------------------------------------|
 * | infect   | Afflicted  | Poison spreading through body       |
 * | sicken   | Afflicted  | Nausea, weakening effect            |
 * | corrode  | Transform  | Acid eating away at form            |
 * | ooze     | Emanating  | Toxic slime dripping off            |
 * | seep     | Emanating  | Poison slowly leaking out           |
 * | toxic    | Emanating  | Toxic cloud surrounding             |
 * | dissolve | Transform  | Melting into toxic puddle           |
 * | melt     | Transform  | Acid melting form                   |
 * | decay    | Transform  | Rotting, decomposing                |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// POISON EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const POISON_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is being poisoned
    // ═══════════════════════════════════════════════════════════════════════════════════════

    infect: {
        name: 'poisonInfect',
        emoji: '🦠',
        type: 'blending',
        description: 'Poison spreading through body, veins turning toxic',
        duration: 3500,
        beats: 5,
        intensity: 1.0,
        category: 'afflicted',
        toxicity: 0.7,                 // High toxicity
        // Spreading infection
        spreadRate: 0.4,
        spreadFromCenter: false,       // Spreads from edges inward
        veinPattern: true,
        // Glow - sickly green
        glowColor: [0.3, 0.8, 0.2],    // Toxic green
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.85,
        glowFlickerRate: 4,
        // Scale - slight swelling
        scaleVibration: 0.02,
        scaleFrequency: 3,
        scaleSwell: 0.015,
        // Position - sickly tremor
        tremor: 0.006,
        tremorFrequency: 7,
        // Decay
        decayRate: 0.18
    },

    sicken: {
        name: 'poisonSicken',
        emoji: '🤢',
        type: 'blending',
        description: 'Nausea and weakness, poisoned feeling',
        duration: 3000,
        beats: 4,
        intensity: 0.7,
        category: 'afflicted',
        toxicity: 0.5,
        // Sickening wobble
        wobbleAmount: 0.025,
        wobbleSpeed: 2,
        nauseaWave: true,
        // Glow - pale sick green
        glowColor: [0.5, 0.75, 0.35],  // Pale sick green
        glowIntensityMin: 0.55,
        glowIntensityMax: 0.8,
        glowFlickerRate: 3,
        // Scale - unstable
        scaleVibration: 0.025,
        scaleFrequency: 4,
        // Position - swaying, unsteady
        swayAmount: 0.012,
        swaySpeed: 1.5,
        droopAmount: 0.008,
        droopAcceleration: 0.4,
        // Decay
        decayRate: 0.2
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is exuding poison
    // ═══════════════════════════════════════════════════════════════════════════════════════

    ooze: {
        name: 'poisonOoze',
        emoji: '🫠',
        type: 'blending',
        description: 'Toxic slime dripping off body',
        duration: 3200,
        beats: 4,
        intensity: 0.9,
        category: 'emanating',
        toxicity: 0.65,
        // Dripping effect
        dripRate: 0.5,
        dripSpeed: 1.2,
        slimeTrail: true,
        // Glow - bright toxic
        glowColor: [0.35, 0.85, 0.25], // Bright toxic
        glowIntensityMin: 0.6,
        glowIntensityMax: 0.95,
        glowFlickerRate: 5,
        // Scale - slight sag
        scaleVibration: 0.018,
        scaleFrequency: 3,
        // Position - dripping downward
        droopAmount: 0.01,
        droopAcceleration: 0.3,
        // Decay
        decayRate: 0.18
    },

    seep: {
        name: 'poisonSeep',
        emoji: '💧',
        type: 'blending',
        description: 'Poison slowly leaking out',
        duration: 4000,
        beats: 6,
        intensity: 0.6,
        category: 'emanating',
        toxicity: 0.4,
        // Slow leaking
        leakRate: 0.25,
        seepPattern: true,
        // Glow - subtle green
        glowColor: [0.4, 0.7, 0.3],    // Subtle toxic
        glowIntensityMin: 0.6,
        glowIntensityMax: 0.85,
        glowFlickerRate: 2,            // Slow pulse
        // Scale - slight deflation
        scaleVibration: 0.01,
        scaleFrequency: 2,
        scaleShrink: 0.01,
        // Position - slow droop
        droopAmount: 0.006,
        droopAcceleration: 0.2,
        // Decay
        decayRate: 0.22
    },

    toxic: {
        name: 'poisonToxic',
        emoji: '☠️',
        type: 'blending',
        description: 'Toxic cloud surrounding, poisonous aura',
        duration: 3000,
        beats: 4,
        intensity: 1.1,
        category: 'emanating',
        toxicity: 0.8,
        // Cloud effect
        cloudSpread: 0.5,
        cloudDensity: 0.7,
        bubbleEffect: true,
        // Glow - intense toxic
        glowColor: [0.25, 0.9, 0.2],   // Intense toxic green
        glowIntensityMin: 0.55,
        glowIntensityMax: 1.0,
        glowFlickerRate: 6,            // Bubbling rhythm
        // Scale - pulsing with toxicity
        scaleVibration: 0.03,
        scaleFrequency: 4,
        scalePulse: true,
        // Position - slight float in cloud
        floatAmount: 0.004,
        floatSpeed: 1.5,
        // Decay
        decayRate: 0.15
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot is becoming toxic/dissolving
    // ═══════════════════════════════════════════════════════════════════════════════════════

    corrode: {
        name: 'poisonCorrode',
        emoji: '🔥',
        type: 'blending',
        description: 'Acid eating away at form, corrosion spreading',
        duration: 3500,
        beats: 5,
        intensity: 1.3,
        category: 'transform',
        toxicity: 0.85,
        // Corrosion effect
        corrosionRate: 0.5,
        etchPattern: true,
        // Glow - acidic yellow-green
        glowColor: [0.6, 0.85, 0.15],  // Acid yellow-green
        glowIntensityMin: 0.6,
        glowIntensityMax: 1.1,
        glowFlickerRate: 7,            // Sizzling
        // Scale - eroding
        scaleVibration: 0.025,
        scaleFrequency: 5,
        scaleShrink: 0.04,
        // Position - unstable
        jitterAmount: 0.008,
        jitterFrequency: 10,
        // Decay
        decayRate: 0.15
    },

    melt: {
        name: 'poisonMelt',
        emoji: '🫠',
        type: 'blending',
        description: 'Melting from acid, losing form',
        duration: 3000,
        beats: 4,
        intensity: 1.4,
        category: 'transform',
        toxicity: 0.9,
        // Melting effect
        meltRate: 0.6,
        meltFromTop: true,
        // Glow - hot acid
        glowColor: [0.5, 0.9, 0.2],    // Hot acid green
        glowIntensityMin: 0.65,
        glowIntensityMax: 1.15,
        glowFlickerRate: 5,
        // Scale - collapsing
        scaleVibration: 0.03,
        scaleFrequency: 3,
        scaleShrink: 0.08,
        scaleSquash: true,             // Flattens as melts
        // Position - sinking
        droopAmount: 0.02,
        droopAcceleration: 0.5,
        // Opacity
        fadeOut: true,
        fadeStartAt: 0.5,
        fadeEndAt: 0.95,
        fadeCurve: 'accelerating',
        // Decay
        decayRate: 0.1
    },

    decay: {
        name: 'poisonDecay',
        emoji: '🍂',
        type: 'blending',
        description: 'Rotting and decomposing, falling apart',
        duration: 4000,
        beats: 6,
        intensity: 1.0,
        category: 'transform',
        toxicity: 0.7,
        // Decay effect
        decayPattern: 'organic',
        crumbleRate: 0.35,
        // Glow - sickly brown-green
        glowColor: [0.45, 0.6, 0.25],  // Decay brown-green
        glowIntensityMin: 0.5,
        glowIntensityMax: 0.8,
        glowFlickerRate: 3,
        // Scale - crumbling
        scaleVibration: 0.02,
        scaleFrequency: 4,
        scaleShrink: 0.05,
        // Position - sagging, falling apart
        droopAmount: 0.015,
        droopAcceleration: 0.4,
        tremor: 0.005,
        tremorFrequency: 6,
        // Opacity - fading
        fadeOut: true,
        fadeStartAt: 0.4,
        fadeEndAt: 0.9,
        fadeCurve: 'smooth',
        // Decay
        decayRate: 0.12
    },

    dissolve: {
        name: 'poisonDissolve',
        emoji: '💀',
        type: 'blending',
        description: 'Dissolving into toxic puddle',
        duration: 2800,
        beats: 4,
        intensity: 1.5,
        category: 'transform',
        toxicity: 0.95,
        // Dissolve effect
        dissolveRate: 0.7,
        puddleSpread: true,
        // Glow - bright dissolving
        glowColor: [0.4, 0.95, 0.2],   // Bright acid
        glowIntensityMin: 0.7,
        glowIntensityMax: 1.2,
        glowFlickerRate: 8,
        // Scale - rapid shrink
        scaleVibration: 0.035,
        scaleFrequency: 6,
        scaleShrink: 0.12,
        scaleSquash: true,
        // Position - collapsing
        droopAmount: 0.025,
        droopAcceleration: 0.6,
        // Opacity - dissolving
        fadeOut: true,
        fadeStartAt: 0.3,
        fadeEndAt: 0.9,
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
 * Create a poison effect gesture
 * @param {string} variant - Variant name from POISON_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createPoisonEffectGesture(variant) {
    const config = POISON_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[POISON_EFFECT] Unknown variant: ${variant}, using infect`);
        return createPoisonEffectGesture('infect');
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
                onBeat: config.category === 'transform' ? 1.4 : 1.2,
                offBeat: 1.0,
                curve: 'smooth'
            }
        },

        /**
         * 3D core transformation for poison effect
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

                // Afflicted: gradual onset
                if (category === 'afflicted') {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                    // Nausea wave
                    if (cfg.nauseaWave) {
                        const wave = Math.sin(time * Math.PI * 2) * 0.15;
                        effectStrength *= (1 + wave);
                    }
                }

                // Emanating: sustained with bubbles
                if (category === 'emanating') {
                    if (progress < 0.15) {
                        effectStrength = progress / 0.15;
                    }
                    if (cfg.bubbleEffect) {
                        const bubble = Math.sin(time * Math.PI * 4) * 0.1 + 0.9;
                        effectStrength *= bubble;
                    }
                }

                // Transform: accelerating deterioration
                if (category === 'transform') {
                    effectStrength = Math.pow(progress, 0.7);
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Droop, sway, tremor, jitter
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Droop (ooze, melt, decay, dissolve)
                if (cfg.droopAmount > 0) {
                    const droopProgress = progress * (1 + cfg.droopAcceleration * progress);
                    posY -= cfg.droopAmount * droopProgress * effectStrength;
                }

                // Sway (sicken)
                if (cfg.swayAmount > 0) {
                    const swayTime = time * cfg.swaySpeed;
                    posX += Math.sin(swayTime * Math.PI * 2) * cfg.swayAmount * effectStrength;
                    posZ += Math.cos(swayTime * Math.PI * 1.7) * cfg.swayAmount * 0.5 * effectStrength;
                }

                // Wobble (sicken)
                if (cfg.wobbleAmount > 0) {
                    const wobbleTime = time * cfg.wobbleSpeed;
                    posX += Math.sin(wobbleTime * Math.PI * 2) * cfg.wobbleAmount * effectStrength;
                    posY += Math.sin(wobbleTime * Math.PI * 3.1 + 1) * cfg.wobbleAmount * 0.3 * effectStrength;
                }

                // Tremor (infect)
                if (cfg.tremor > 0) {
                    const tremorTime = time * cfg.tremorFrequency;
                    posX += (noise1D(tremorTime) - 0.5) * cfg.tremor * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * cfg.tremor * 0.5 * effectStrength;
                }

                // Jitter (corrode)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    posX += (noise1D(jitterTime) - 0.5) * cfg.jitterAmount * effectStrength;
                    posY += (noise1D(jitterTime + 33) - 0.5) * cfg.jitterAmount * 0.5 * effectStrength;
                }

                // Float (toxic cloud)
                if (cfg.floatAmount > 0) {
                    const floatTime = time * cfg.floatSpeed;
                    posY += Math.sin(floatTime * Math.PI * 2) * cfg.floatAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Swell, shrink, squash
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                let scaleY = 1.0; // For squash effect
                const scaleTime = time * cfg.scaleFrequency;

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * cfg.scaleVibration * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.6 +
                                      Math.sin(scaleTime * Math.PI * 3.3) * 0.4;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Swell (infect)
                if (cfg.scaleSwell > 0) {
                    scale += cfg.scaleSwell * progress * effectStrength;
                }

                // Shrink (seep, corrode, melt, decay, dissolve)
                if (cfg.scaleShrink > 0) {
                    const shrinkProgress = category === 'transform'
                        ? Math.pow(progress, 1.3)
                        : progress;
                    scale -= cfg.scaleShrink * shrinkProgress * effectStrength;
                }

                // Squash (melt, dissolve - flattens as melts)
                if (cfg.scaleSquash) {
                    scaleY = scale * (1 - progress * 0.4 * effectStrength);
                } else {
                    scaleY = scale;
                }

                scale = Math.max(0.1, scale);
                scaleY = Math.max(0.1, scaleY);

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY - Fade for dissolving
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
                // GLOW - Sickly toxic glow
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (cfg.bubbleEffect) {
                    // Bubbling: irregular pulses
                    const bubble1 = Math.sin(flickerTime * Math.PI * 2);
                    const bubble2 = Math.sin(flickerTime * Math.PI * 3.3 + 1);
                    flickerValue = 0.5 + bubble1 * 0.25 + bubble2 * 0.2;
                } else {
                    // Default: slow sick pulse
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.25 + 0.75;
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Poison glow boost - toxic emanation
                const glowBoost = 0.2 * effectStrength * cfg.intensity * cfg.toxicity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    poisonOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        toxicity: cfg.toxicity,
                        category: cfg.category,
                        time
                    },
                    position: [posX, posY, posZ],
                    rotation: [0, 0, 0],
                    scale,
                    scaleY: cfg.scaleSquash ? scaleY : undefined,
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

// Afflicted variants (being poisoned)
export const infect = createPoisonEffectGesture('infect');
export const sicken = createPoisonEffectGesture('sicken');

// Emanating variants (exuding poison)
export const ooze = createPoisonEffectGesture('ooze');
export const seep = createPoisonEffectGesture('seep');
export const toxic = createPoisonEffectGesture('toxic');

// Transform variants (becoming toxic)
export const corrode = createPoisonEffectGesture('corrode');
export const melt = createPoisonEffectGesture('melt');
export const decay = createPoisonEffectGesture('decay');
export const dissolve = createPoisonEffectGesture('dissolve');

export {
    POISON_EFFECT_VARIANTS
};

export default {
    // Afflicted
    infect,
    sicken,
    // Emanating
    ooze,
    seep,
    toxic,
    // Transform
    corrode,
    melt,
    decay,
    dissolve,
    // Factory
    createPoisonEffectGesture,
    POISON_EFFECT_VARIANTS
};
