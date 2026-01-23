/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for electric effect gestures (shock, overload, glitch)
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/electricEffectFactory
 *
 * ## Electric Effect Gestures
 *
 * These gestures apply electrocution effects directly to the mascot mesh WITHOUT
 * shattering. The mascot appears to be electrified with:
 * - Rapid position jitter (being shocked)
 * - Cyan/blue glow color
 * - Flickering intensity
 * - Scale vibration
 *
 * ## Variants
 *
 * | Gesture   | Effect                                  | Intensity |
 * |-----------|----------------------------------------|-----------|
 * | shock     | Brief electric surge, jittery          | Medium    |
 * | overload  | Intense buildup, extreme vibration     | High      |
 * | glitch    | Digital corruption, displacement       | Low-Med   |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ELECTRIC_EFFECT_VARIANTS = {
    shock: {
        name: 'shock',
        emoji: '⚡',
        type: 'blending',
        description: 'Brief electric surge - mascot is shocked',
        duration: 1200,
        beats: 2,
        intensity: 1.0,
        // Jitter parameters
        jitterFrequency: 60,        // Hz - very rapid
        jitterAmplitude: 0.015,     // Position displacement
        jitterDecay: 0.3,           // Decay over time
        // Glow parameters
        glowColor: [0.3, 0.9, 1.0], // Cyan
        glowIntensityMin: 0.8,
        glowIntensityMax: 2.5,
        glowFlickerRate: 25,        // Hz
        // Scale vibration
        scaleVibration: 0.03,
        scaleFrequency: 40
    },
    overload: {
        name: 'overload',
        emoji: '💥',
        type: 'blending',
        description: 'Intense charge buildup, extreme shock',
        duration: 2500,
        beats: 4,
        intensity: 2.0,
        // Jitter parameters - more extreme
        jitterFrequency: 80,
        jitterAmplitude: 0.03,
        jitterDecay: 0.1,           // Stays intense longer
        // Glow parameters - brighter, more dramatic
        glowColor: [0.5, 0.95, 1.0], // Bright cyan-white
        glowIntensityMin: 1.0,
        glowIntensityMax: 4.0,
        glowFlickerRate: 35,
        // Scale vibration - more intense
        scaleVibration: 0.05,
        scaleFrequency: 50,
        // Buildup phase
        buildupPhase: 0.3,          // First 30% is buildup
        buildupGlowRamp: true
    },
    glitch: {
        name: 'glitch',
        emoji: '📺',
        type: 'blending',
        description: 'Digital corruption, static displacement',
        duration: 1800,
        beats: 3,
        intensity: 0.7,
        // Jitter parameters - irregular, digital
        jitterFrequency: 20,        // Slower but bigger jumps
        jitterAmplitude: 0.04,
        jitterDecay: 0.5,
        // Glow parameters - flickering static
        glowColor: [0.4, 0.8, 1.0], // Blue-cyan
        glowIntensityMin: 0.5,
        glowIntensityMax: 2.0,
        glowFlickerRate: 15,
        // Scale vibration - asymmetric
        scaleVibration: 0.04,
        scaleFrequency: 12,
        // Glitch-specific
        holdFrames: true,           // Freeze in random positions
        holdProbability: 0.15,      // Chance to freeze per frame
        holdDuration: 0.05          // How long to freeze (seconds)
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC JITTER
// ═══════════════════════════════════════════════════════════════════════════════════════

function hash(n) {
    return ((Math.sin(n * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
}

function noise1D(x) {
    const i = Math.floor(x);
    const f = x - i;
    const smooth = f * f * (3 - 2 * f);
    return hash(i) * (1 - smooth) + hash(i + 1) * smooth;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ELECTRIC EFFECT GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create an electric effect gesture (no shatter, just electrocution visuals)
 *
 * @param {string} variant - 'shock', 'overload', or 'glitch'
 * @returns {Object} Gesture configuration
 */
export function createElectricEffectGesture(variant) {
    const config = ELECTRIC_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`Unknown electric effect variant: ${variant}`);
        return null;
    }

    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            ...config
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            amplitudeSync: {
                onBeat: 1.5,
                offBeat: 1.0,
                curve: 'sharp'
            }
        },

        /**
         * 3D core transformation for electric effect
         * Applies jitter, glow color change, and flickering
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000; // Convert to seconds

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase for overload
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    if (cfg.buildupGlowRamp) {
                        // Ramp up glow during buildup
                        effectStrength = Math.pow(effectStrength, 0.5); // Faster ramp
                    }
                }

                // Decay in final phase
                if (progress > (1 - cfg.jitterDecay)) {
                    const decayProgress = (progress - (1 - cfg.jitterDecay)) / cfg.jitterDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION JITTER - Rapid displacement simulating electric shock
                // ═══════════════════════════════════════════════════════════════
                const jitterTime = time * cfg.jitterFrequency;

                // Glitch mode: occasional frame holds
                let holdMultiplier = 1.0;
                if (cfg.holdFrames) {
                    const holdCheck = hash(Math.floor(jitterTime * 3));
                    if (holdCheck < cfg.holdProbability) {
                        // Hold position from a previous frame
                        holdMultiplier = 0.1; // Almost freeze
                    }
                }

                // Multi-frequency noise for organic jitter
                const jitterX = (
                    noise1D(jitterTime) - 0.5 +
                    (noise1D(jitterTime * 2.3 + 50) - 0.5) * 0.5 +
                    (noise1D(jitterTime * 4.7 + 100) - 0.5) * 0.25
                ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                const jitterY = (
                    noise1D(jitterTime + 33) - 0.5 +
                    (noise1D(jitterTime * 2.1 + 83) - 0.5) * 0.5 +
                    (noise1D(jitterTime * 5.3 + 133) - 0.5) * 0.25
                ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                const jitterZ = (
                    noise1D(jitterTime + 66) - 0.5 +
                    (noise1D(jitterTime * 1.9 + 116) - 0.5) * 0.5 +
                    (noise1D(jitterTime * 3.7 + 166) - 0.5) * 0.25
                ) * cfg.jitterAmplitude * effectStrength * holdMultiplier * 0.5; // Less Z jitter

                // ═══════════════════════════════════════════════════════════════
                // ROTATION JITTER - Small rotational shake
                // ═══════════════════════════════════════════════════════════════
                const rotJitterAmt = cfg.jitterAmplitude * 2; // More rotation
                const rotX = (noise1D(jitterTime * 1.3 + 200) - 0.5) * rotJitterAmt * effectStrength;
                const rotY = (noise1D(jitterTime * 1.7 + 250) - 0.5) * rotJitterAmt * effectStrength;
                const rotZ = (noise1D(jitterTime * 2.1 + 300) - 0.5) * rotJitterAmt * effectStrength * 0.5;

                // ═══════════════════════════════════════════════════════════════
                // SCALE VIBRATION - Rapid scale oscillation
                // ═══════════════════════════════════════════════════════════════
                const scaleTime = time * cfg.scaleFrequency;
                const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                  Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                const scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // GLOW INTENSITY FLICKERING
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                const flicker2 = Math.sin(flickerTime * Math.PI * 5.3 + 1.7);
                const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.7 ? 1 : 0; // Random spikes

                const flickerValue = (flicker1 * 0.4 + flicker2 * 0.3 + flicker3 * 0.5 + 0.5);
                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                // Glow boost for screen-space effect
                const glowBoost = (flickerValue * 0.8 + 0.2) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [jitterX, jitterY, jitterZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    // Electric-specific: override glow color to cyan
                    glowColorOverride: cfg.glowColor,
                    // Electric shader overlay - applies lightning material to mesh
                    electricOverlay: {
                        enabled: effectStrength > 0.1,
                        charge: effectStrength * cfg.intensity,
                        time  // Pass time for shader animation
                    }
                };
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const shock = createElectricEffectGesture('shock');
export const overload = createElectricEffectGesture('overload');
export const glitch = createElectricEffectGesture('glitch');

export {
    ELECTRIC_EFFECT_VARIANTS
};

export default {
    shock,
    overload,
    glitch,
    createElectricEffectGesture,
    ELECTRIC_EFFECT_VARIANTS
};
