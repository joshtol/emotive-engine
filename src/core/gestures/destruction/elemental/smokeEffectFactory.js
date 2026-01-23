/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Smoke Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for smoke effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/smokeEffectFactory
 *
 * ## Smoke Effect Gestures
 *
 * Two categories of smoke gestures:
 *
 * ### Emanating (producing smoke)
 * - Smoke rising from mascot
 * - Controlled emission with edge wisps
 * - Mascot is SOURCE of smoke
 * - Uses additive blending
 *
 * ### Afflicted (affected by smoke)
 * - Smoke surrounding and obscuring mascot
 * - Swirling, darkening effect
 * - Mascot is VICTIM of smoke
 * - Uses normal blending for darkening
 *
 * ## Variants
 *
 * | Gesture | Category  | Effect                              | Tint        |
 * |---------|-----------|-------------------------------------|-------------|
 * | puff    | Emanating | Quick burst of smoke                | Light gray  |
 * | billow  | Emanating | Rolling clouds rising slowly        | Medium gray |
 * | fume    | Emanating | Steady low emission, fuming         | Yellow-gray |
 * | shroud  | Afflicted | Smoke enveloping, obscuring         | Dark gray   |
 * | haze    | Afflicted | Light foggy overlay                 | Blue-gray   |
 * | choke   | Afflicted | Dense suffocating smoke             | Dark green  |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOKE EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const SMOKE_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // EMANATING VARIANTS - Mascot is producing smoke
    // ═══════════════════════════════════════════════════════════════════════════════════════

    puff: {
        name: 'puff',
        emoji: '💨',
        type: 'blending',
        description: 'Quick burst of smoke puff',
        duration: 1500,
        beats: 2,
        intensity: 1.0,
        category: 'emanating',
        density: 0.4,                  // Light smoke
        // Quick rise motion
        riseSpeed: 0.02,
        riseAcceleration: 0.5,
        decayRate: 0.3,
        // Color tint - light warm gray
        tint: [0.95, 0.93, 0.9],
        // Wind - slight drift
        windDir: [0.1, 0.0],
        // No swirl for puff
        swirl: 0.0,
        // Glow - slight gray tint
        glowColor: [0.7, 0.7, 0.75],
        glowIntensityMin: 0.9,
        glowIntensityMax: 1.1,
        glowFlickerRate: 5,
        // Scale - quick expansion then fade
        scaleVibration: 0.01,
        scaleFrequency: 4,
        scalePulse: true,
        scaleBurst: 0.05
    },

    billow: {
        name: 'billow',
        emoji: '🌫️',
        type: 'blending',
        description: 'Rolling clouds of smoke rising slowly',
        duration: 3500,
        beats: 5,
        intensity: 0.8,
        category: 'emanating',
        density: 0.6,                  // Medium smoke
        // Slow rolling rise
        riseSpeed: 0.008,
        riseAcceleration: 0.2,
        decayRate: 0.2,
        // Color tint - medium gray
        tint: [0.85, 0.85, 0.87],
        // Wind - gentle sway
        windDir: [0.05, 0.03],
        // Slight swirl for rolling effect
        swirl: 0.15,
        // Turbulence for rolling effect
        turbulenceAmount: 0.015,
        turbulenceSpeed: 2,
        // Glow - slightly darker
        glowColor: [0.6, 0.6, 0.65],
        glowIntensityMin: 0.85,
        glowIntensityMax: 1.0,
        glowFlickerRate: 3,
        // Scale - slow breathing expansion
        scaleVibration: 0.02,
        scaleFrequency: 1.5,
        scalePulse: true,
        scaleGrowth: 0.03
    },

    fume: {
        name: 'fume',
        emoji: '♨️',
        type: 'blending',
        description: 'Steady low smoke emission, fuming angrily',
        duration: 4000,
        beats: 6,
        intensity: 0.5,
        category: 'emanating',
        density: 0.3,                  // Light wispy smoke
        // Very slow rise
        riseSpeed: 0.005,
        riseAcceleration: 0.1,
        decayRate: 0.15,
        // Color tint - yellow-ish (angry fumes)
        tint: [1.0, 0.95, 0.8],
        // Wind - minimal
        windDir: [0.02, 0.0],
        // No swirl
        swirl: 0.0,
        // Subtle turbulence
        turbulenceAmount: 0.008,
        turbulenceSpeed: 1.5,
        // Glow - subtle warm
        glowColor: [0.8, 0.78, 0.7],
        glowIntensityMin: 0.95,
        glowIntensityMax: 1.05,
        glowFlickerRate: 2,
        // Scale - minimal breathing
        scaleVibration: 0.008,
        scaleFrequency: 1,
        scalePulse: true
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AFFLICTED VARIANTS - Mascot is surrounded/affected by smoke
    // ═══════════════════════════════════════════════════════════════════════════════════════

    shroud: {
        name: 'shroud',
        emoji: '🌑',
        type: 'blending',
        description: 'Smoke enveloping and obscuring - ominous and claustrophobic',
        duration: 3200,
        beats: 4,
        intensity: 1.4,
        category: 'afflicted',
        density: 0.5,                  // Less dense - more ethereal
        // Closing in motion (no rise)
        riseSpeed: 0.0,
        riseAcceleration: 0.0,
        decayRate: 0.22,
        // Color tint - cold blue-gray (eerier)
        tint: [0.52, 0.54, 0.62],
        // Wind - subtle inward pull
        windDir: [-0.02, 0.0],
        // Moderate swirl - less concentrated
        swirl: 0.4,
        // Swirling turbulence
        turbulenceAmount: 0.025,
        turbulenceSpeed: 2.5,
        // Glow - much darker for true shrouding
        glowColor: [0.32, 0.34, 0.42],
        glowIntensityMin: 0.55,
        glowIntensityMax: 0.78,
        glowFlickerRate: 3.5,
        // Scale - noticeable contraction (closing in)
        scaleVibration: 0.018,
        scaleFrequency: 1.8,
        scalePulse: false,
        scaleContraction: 0.035,
        // Rotation wobble - unsettling organic motion
        rotationWobble: 0.015,
        rotationWobbleSpeed: 1.2
    },

    haze: {
        name: 'haze',
        emoji: '🌁',
        type: 'blending',
        description: 'Light foggy haze overlay',
        duration: 3500,
        beats: 4,
        intensity: 0.5,
        category: 'afflicted',
        density: 0.2,                  // Very light
        // Minimal motion
        riseSpeed: 0.0,
        riseAcceleration: 0.0,
        decayRate: 0.1,
        // Color tint - cool blue-gray (misty)
        tint: [0.85, 0.88, 0.95],
        // Wind - gentle drift
        windDir: [0.08, 0.04],
        // Light swirl
        swirl: 0.1,
        // Gentle drift
        turbulenceAmount: 0.005,
        turbulenceSpeed: 1,
        // Glow - light, desaturated
        glowColor: [0.8, 0.8, 0.85],
        glowIntensityMin: 0.9,
        glowIntensityMax: 1.0,
        glowFlickerRate: 1.5,
        // Scale - stable
        scaleVibration: 0.005,
        scaleFrequency: 0.8,
        scalePulse: true
    },

    choke: {
        name: 'choke',
        emoji: '😶‍🌫️',
        type: 'blending',
        description: 'Dense suffocating smoke',
        duration: 2500,
        beats: 4,
        intensity: 1.5,
        category: 'afflicted',
        density: 0.9,                  // Very dense
        // Oppressive, no movement
        riseSpeed: 0.0,
        riseAcceleration: 0.0,
        decayRate: 0.2,
        // Color tint - toxic greenish-gray
        tint: [0.7, 0.75, 0.65],
        // No wind - oppressive stillness
        windDir: [0.0, 0.0],
        // Heavy swirl - disorienting
        swirl: 0.6,
        // Heavy turbulence
        turbulenceAmount: 0.025,
        turbulenceSpeed: 4,
        // Glow - very dark
        glowColor: [0.3, 0.35, 0.3],
        glowIntensityMin: 0.6,
        glowIntensityMax: 0.8,
        glowFlickerRate: 6,
        // Scale - compression (difficulty breathing)
        scaleVibration: 0.025,
        scaleFrequency: 5,
        scalePulse: false,
        scaleContraction: 0.03,
        // Position jitter (struggling)
        jitterAmount: 0.008,
        jitterFrequency: 8
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // DISAPPEARANCE VARIANTS - Mascot vanishes into smoke
    // ═══════════════════════════════════════════════════════════════════════════════════════

    smokebomb: {
        name: 'smokebomb',
        emoji: '💨',
        type: 'blending',
        description: 'Ninja smokebomb - instant thick smoke, ninja gone in a flash',
        duration: 1400,                // Fast and punchy
        beats: 2,
        intensity: 2.5,
        category: 'explosive',         // Special category for burst effect
        density: 1.0,                  // Maximum density - instant cover
        // Explosive burst (handled by particle system)
        riseSpeed: 0.0,
        riseAcceleration: 0.0,
        decayRate: 0.50,               // Smoke clears quickly after ninja is gone
        // Color tint - classic gray smoke (NOT white)
        tint: [0.55, 0.55, 0.58],
        // Wind - explosive outward burst
        windDir: [0.0, 0.0],
        // Strong swirl for chaotic poof
        swirl: 0.5,
        // Turbulent explosion
        turbulenceAmount: 0.05,
        turbulenceSpeed: 8,
        // Glow - dim during smoke
        glowColor: [0.5, 0.5, 0.55],
        glowIntensityMin: 0.3,
        glowIntensityMax: 0.7,
        glowFlickerRate: 12,
        // Scale - stays full size
        scaleVibration: 0.01,
        scaleFrequency: 5,
        scalePulse: false,
        // OPACITY FADE: ninja vanishes FAST while smoke covers
        fadeOut: true,
        fadeStartAt: 0.05,             // Start almost immediately (smoke covers instantly)
        fadeEndAt: 0.28,               // Fully gone by 28% - ninja is FAST
        fadeCurve: 'quick'
    },

    vanish: {
        name: 'vanish',
        emoji: '👻',
        type: 'blending',
        description: 'Magician vanish - elegant smoke envelops, graceful disappearance',
        duration: 2800,                // Theatrical timing
        beats: 4,
        intensity: 1.3,
        category: 'emanating',
        density: 0.90,                 // Dense enough to obscure elegantly
        // Graceful rise
        riseSpeed: 0.025,
        riseAcceleration: 1.2,
        decayRate: 0.32,               // Smoke lingers mysteriously
        // Color tint - ethereal gray-blue
        tint: [0.80, 0.83, 0.90],
        // Wind - elegant drift
        windDir: [0.06, 0.03],
        // Enveloping swirl
        swirl: 0.40,
        // Gentle turbulence
        turbulenceAmount: 0.018,
        turbulenceSpeed: 2.5,
        // Glow - mysterious fade
        glowColor: [0.68, 0.70, 0.78],
        glowIntensityMin: 0.45,
        glowIntensityMax: 0.85,
        glowFlickerRate: 3,
        // Scale - subtle breathing
        scaleVibration: 0.006,
        scaleFrequency: 1.5,
        scalePulse: true,
        // OPACITY FADE: graceful theatrical fade
        fadeOut: true,
        fadeStartAt: 0.18,             // Wait for smoke to build elegantly
        fadeEndAt: 0.52,               // Gone before smoke fully clears
        fadeCurve: 'smooth'
    },

    materialize: {
        name: 'materialize',
        emoji: '✨',
        type: 'blending',
        description: 'Magician appear - smoke condenses, mascot emerges from nothing',
        duration: 2500,                // Dramatic reveal
        beats: 4,
        intensity: 1.6,
        category: 'emanating',
        density: 0.95,                 // Dense condensing smoke
        // Smoke pulls inward (negative rise)
        riseSpeed: -0.018,
        riseAcceleration: 1.0,
        decayRate: 0.38,               // Clears to reveal mascot
        // Color tint - bright ethereal white
        tint: [0.94, 0.94, 0.97],
        // Wind - inward pull
        windDir: [-0.10, -0.05],
        // Inward condensing swirl
        swirl: 0.50,
        // Condensing turbulence
        turbulenceAmount: 0.028,
        turbulenceSpeed: 3.5,
        // Glow - building up to dramatic reveal
        glowColor: [0.88, 0.88, 0.92],
        glowIntensityMin: 0.55,
        glowIntensityMax: 1.4,
        glowFlickerRate: 5,
        // Scale - stable
        scaleVibration: 0.008,
        scaleFrequency: 2,
        scalePulse: false,
        // OPACITY FADE IN: dramatic emergence
        fadeIn: true,
        fadeStartAt: 0.32,             // Stay hidden while smoke condenses
        fadeEndAt: 0.78,               // Fully visible as smoke clears
        fadeCurve: 'smooth'
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
 * Create a smoke effect gesture (NO shatter - mesh stays intact)
 * @param {string} variant - Variant name from SMOKE_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createSmokeEffectGesture(variant) {
    const config = SMOKE_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[SMOKE_EFFECT] Unknown variant: ${variant}, using puff`);
        return createSmokeEffectGesture('puff');
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
                onBeat: config.category === 'afflicted' ? 1.3 : 1.5,
                offBeat: 1.0,
                curve: 'smooth'
            }
        },

        /**
         * 3D core transformation for smoke effect
         * Handles both emanating (source) and afflicted (victim) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const isAfflicted = cfg.category === 'afflicted';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Emanating: burst then decay
                if (!isAfflicted) {
                    // Quick rise to full strength
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                        effectStrength = Math.pow(effectStrength, 0.5);
                    }
                }

                // Afflicted: gradual envelop
                if (isAfflicted) {
                    if (progress < 0.3) {
                        effectStrength = progress / 0.3;
                        effectStrength = Math.pow(effectStrength, 0.7);
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.decayRate)) {
                    const decayProgress = (progress - (1 - cfg.decayRate)) / cfg.decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Rise (emanating) or jitter (afflicted)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Rise effect (emanating - smoke rises)
                if (cfg.riseSpeed > 0) {
                    const riseAmount = cfg.riseSpeed * (1 + time * cfg.riseAcceleration);
                    posY += riseAmount * effectStrength;
                }

                // Turbulence (swaying motion)
                if (cfg.turbulenceAmount > 0) {
                    const turbTime = time * cfg.turbulenceSpeed;
                    posX += (noise1D(turbTime) - 0.5) * cfg.turbulenceAmount * effectStrength;
                    posZ += (noise1D(turbTime + 50) - 0.5) * cfg.turbulenceAmount * effectStrength * 0.5;
                }

                // Jitter for afflicted/choke (struggling)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    posX += (noise1D(jitterTime * 3) - 0.5) * cfg.jitterAmount * effectStrength;
                    posY += (noise1D(jitterTime * 3 + 33) - 0.5) * cfg.jitterAmount * effectStrength * 0.5;
                    posZ += (noise1D(jitterTime * 3 + 66) - 0.5) * cfg.jitterAmount * effectStrength * 0.3;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Expansion (emanating) or contraction (afflicted)
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    // Smooth breathing pulse
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;
                } else {
                    // Erratic vibration (for afflicted)
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.1) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Burst expansion (puff)
                if (cfg.scaleBurst) {
                    const burstProgress = Math.min(progress / 0.3, 1);
                    const burstCurve = burstProgress < 1 ? Math.pow(burstProgress, 0.5) : 1;
                    scale += cfg.scaleBurst * burstCurve * effectStrength;
                }

                // Gradual growth (billow)
                if (cfg.scaleGrowth) {
                    scale += cfg.scaleGrowth * effectStrength;
                }

                // Contraction (shroud, choke - closing in)
                if (cfg.scaleContraction) {
                    scale -= cfg.scaleContraction * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Organic wobble (shroud - unsettling)
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationWobble) {
                    const wobbleTime = time * cfg.rotationWobbleSpeed;
                    // Organic multi-frequency wobble
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ = Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) * cfg.rotationWobble * 0.7 * effectStrength;
                    // Slow Y rotation for enveloping feel
                    rotY = Math.sin(wobbleTime * Math.PI * 0.8) * cfg.rotationWobble * 0.4 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // OPACITY FADE OUT - Mascot fades while hidden by smoke
                // (smokebomb, vanish - NO shrinking, just opacity)
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.15;
                    const endAt = cfg.fadeEndAt || 0.5;

                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        let fadeFactor;

                        if (cfg.fadeCurve === 'quick') {
                            // Quick fade - ninja is GONE fast
                            fadeFactor = 1 - Math.pow(fadeProgress, 0.5);
                        } else {
                            // Smooth gradual fade
                            fadeFactor = 1 - (fadeProgress * fadeProgress);
                        }

                        meshOpacity = Math.max(0, fadeFactor);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // OPACITY FADE IN - Mascot fades into existence (materialize)
                // ═══════════════════════════════════════════════════════════════
                if (cfg.fadeIn) {
                    const startAt = cfg.fadeStartAt || 0.25;
                    const endAt = cfg.fadeEndAt || 0.75;

                    if (progress < startAt) {
                        // Before appearance - fully invisible
                        meshOpacity = 0;
                    } else if (progress < endAt) {
                        const fadeProgress = (progress - startAt) / (endAt - startAt);
                        let fadeFactor;

                        if (cfg.fadeCurve === 'quick') {
                            // Quick appear
                            fadeFactor = Math.pow(fadeProgress, 0.5);
                        } else {
                            // Smooth gradual appear
                            fadeFactor = fadeProgress * fadeProgress * (3 - 2 * fadeProgress); // smoothstep
                        }

                        meshOpacity = fadeFactor;
                    } else {
                        meshOpacity = 1.0;
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Subtle dimming/brightening
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                const flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Smoke tends to dim rather than brighten
                const glowBoost = isAfflicted
                    ? -0.15 * effectStrength * cfg.intensity  // Negative boost = dimming
                    : 0.05 * effectStrength * cfg.intensity;  // Slight brightening

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    meshOpacity,  // Controls mascot visibility (for smokebomb/vanish/materialize)
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    smokeOverlay: {
                        enabled: effectStrength > 0.1,
                        thickness: effectStrength * cfg.intensity,
                        density: cfg.density,
                        category: cfg.category,
                        tint: cfg.tint,
                        windDir: cfg.windDir,
                        swirl: cfg.swirl * effectStrength,
                        time
                    }
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Emanating variants (producing smoke)
export const puff = createSmokeEffectGesture('puff');
export const billow = createSmokeEffectGesture('billow');
export const fume = createSmokeEffectGesture('fume');

// Afflicted variants (affected by smoke)
export const shroud = createSmokeEffectGesture('shroud');
export const haze = createSmokeEffectGesture('haze');
export const choke = createSmokeEffectGesture('choke');

// Disappearance variants (mascot vanishes into smoke)
export const smokebomb = createSmokeEffectGesture('smokebomb');
export const vanish = createSmokeEffectGesture('vanish');
export const materialize = createSmokeEffectGesture('materialize');

export {
    SMOKE_EFFECT_VARIANTS
};

export default {
    // Emanating
    puff,
    billow,
    fume,
    // Afflicted
    shroud,
    haze,
    choke,
    // Disappearance
    smokebomb,
    vanish,
    materialize,
    // Factory
    createSmokeEffectGesture,
    SMOKE_EFFECT_VARIANTS
};
