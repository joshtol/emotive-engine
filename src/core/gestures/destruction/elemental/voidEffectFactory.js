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
export const singularity = createVoidEffectGesture('singularity');

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
    // Factory
    createVoidEffectGesture,
    VOID_EFFECT_VARIANTS
};
