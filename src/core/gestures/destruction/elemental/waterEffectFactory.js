/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for water effect gestures (no shatter, just fluid visuals)
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/waterEffectFactory
 *
 * ## Water Effect Gestures
 *
 * Three categories of water gestures:
 *
 * ### Impact (water hitting mascot)
 * - Quick wobble burst, ripple outward
 * - Mascot is HIT by water
 *
 * ### Ambient (mascot emanates water)
 * - Continuous flowing motion
 * - Mascot is SOURCE of water/fluid
 *
 * ### Transform (becoming water)
 * - Losing rigid form, becoming fluid
 * - Mascot TRANSFORMS into water
 *
 * ## Variants
 *
 * | Gesture  | Category  | Effect                                   |
 * |----------|-----------|------------------------------------------|
 * | splash   | Impact    | Quick burst wobble, ripple settle        |
 * | drench   | Impact    | Heavy water hit, dripping weight         |
 * | soak     | Impact    | Gradual saturation, slight expansion     |
 * | flow     | Ambient   | Continuous S-curve undulation            |
 * | ripple   | Ambient   | Concentric pulse waves                   |
 * | tide     | Ambient   | Side-to-side fluid sway                  |
 * | liquefy  | Transform | Losing form, wobbly edges, melting       |
 * | pool     | Transform | Settling downward, spreading wide        |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const WATER_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // IMPACT VARIANTS - Water hitting the mascot
    // ═══════════════════════════════════════════════════════════════════════════════════════

    splash: {
        name: 'splash',
        emoji: '💦',
        type: 'blending',
        description: 'Quick water burst, wobble then settle',
        duration: 1200,
        beats: 2,
        intensity: 1.0,
        category: 'impact',
        // Wobble parameters - quick burst then decay
        wobbleFrequency: 8,          // Fast initial wobble
        wobbleAmplitude: 0.04,       // Strong initial displacement
        wobbleDecay: 0.7,            // Decays quickly
        // Scale - brief expansion then contract
        scaleWobble: 0.06,
        scaleFrequency: 6,
        // Glow - wet sheen
        glowColor: [0.3, 0.6, 1.0],  // Blue
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.6,
        glowPulseRate: 4,
        // Impact-specific
        impactBurst: true,           // Initial burst at start
        burstDuration: 0.2           // First 20% is burst phase
    },

    drench: {
        name: 'drench',
        emoji: '🌊',
        type: 'blending',
        description: 'Heavy water hit, dripping with weight',
        duration: 2000,
        beats: 3,
        intensity: 1.2,
        category: 'impact',
        // Wobble - slower, heavier feeling
        wobbleFrequency: 3,
        wobbleAmplitude: 0.025,
        wobbleDecay: 0.4,
        // Scale - slight compression from weight
        scaleWobble: 0.03,
        scaleFrequency: 2,
        scaleCompression: -0.02,     // Gets slightly smaller (weighted down)
        // Glow - saturated wet look
        glowColor: [0.2, 0.5, 0.9],
        glowIntensityMin: 1.2,
        glowIntensityMax: 1.8,
        glowPulseRate: 2,
        // Drench-specific
        sinkAmount: 0.015,           // Slight downward drift
        dripEffect: true             // Vertical stretch at bottom
    },

    soak: {
        name: 'soak',
        emoji: '💧',
        type: 'blending',
        description: 'Gradual water saturation, absorbing',
        duration: 2500,
        beats: 4,
        intensity: 0.6,
        category: 'impact',
        // Wobble - very gentle
        wobbleFrequency: 1.5,
        wobbleAmplitude: 0.01,
        wobbleDecay: 0.2,
        // Scale - gradual expansion (absorbing water)
        scaleWobble: 0.01,
        scaleFrequency: 1,
        scaleGrowth: 0.04,           // Grows 4% as it absorbs
        // Glow - building saturation
        glowColor: [0.3, 0.55, 0.85],
        glowIntensityMin: 0.9,
        glowIntensityMax: 1.5,
        glowPulseRate: 1,
        // Soak-specific
        rampUp: true,                // Effect builds over time
        saturationBuild: true
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // AMBIENT VARIANTS - Mascot is SOURCE of water/fluid energy
    // ═══════════════════════════════════════════════════════════════════════════════════════

    flow: {
        name: 'flow',
        emoji: '〰️',
        type: 'blending',
        description: 'Continuous fluid S-curve motion',
        duration: 3000,
        beats: 4,
        intensity: 0.8,
        category: 'ambient',
        // Flow motion - smooth S-curve
        flowFrequency: 0.8,          // Slow wave
        flowAmplitude: 0.02,         // Gentle side-to-side
        flowPhaseOffset: 0.5,        // Creates S-curve with Y offset
        // Scale - gentle breathing
        scaleWobble: 0.015,
        scaleFrequency: 0.6,
        // Glow - steady wet sheen
        glowColor: [0.35, 0.65, 1.0],
        glowIntensityMin: 1.1,
        glowIntensityMax: 1.4,
        glowPulseRate: 0.5,
        // Flow-specific
        rotationFlow: 0.01,          // Slight rotation drift
        continuous: true
    },

    ripple: {
        name: 'ripple',
        emoji: '🔵',
        type: 'blending',
        description: 'Concentric pulse waves expanding',
        duration: 2000,
        beats: 3,
        intensity: 0.7,
        category: 'ambient',
        // Ripple motion - pulsing outward
        wobbleFrequency: 2,
        wobbleAmplitude: 0.008,
        wobbleDecay: 0.1,            // Minimal decay - continuous
        // Scale - breathing pulse
        scaleWobble: 0.025,
        scaleFrequency: 1.5,
        // Glow - pulsing rings
        glowColor: [0.4, 0.7, 1.0],
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.7,
        glowPulseRate: 3,            // Matches ripple frequency
        // Ripple-specific
        concentricPulse: true,
        pulseCount: 3                // Multiple wave peaks
    },

    tide: {
        name: 'tide',
        emoji: '🌊',
        type: 'blending',
        description: 'Side-to-side fluid sway like waves',
        duration: 3500,
        beats: 4,
        intensity: 0.9,
        category: 'ambient',
        // Tide motion - slow lateral sway
        flowFrequency: 0.4,          // Very slow
        flowAmplitude: 0.03,         // Broader movement
        flowPhaseOffset: 0,          // Simple side-to-side
        // Scale - wave-like compression
        scaleWobble: 0.02,
        scaleFrequency: 0.4,
        // Glow - ocean blue
        glowColor: [0.2, 0.5, 0.9],
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.5,
        glowPulseRate: 0.4,
        // Tide-specific
        rotationSway: 0.015,         // Tilt with the sway
        verticalBob: 0.01            // Slight up/down bob
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // TRANSFORM VARIANTS - Mascot becoming water/fluid
    // ═══════════════════════════════════════════════════════════════════════════════════════

    liquefy: {
        name: 'liquefy',
        emoji: '💧',
        type: 'blending',
        description: 'Losing solid form, becoming fluid',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        category: 'transform',
        // Wobble - increasing instability
        wobbleFrequency: 4,
        wobbleAmplitude: 0.02,
        wobbleDecay: -0.3,           // NEGATIVE = wobble INCREASES over time
        // Scale - irregular wobbling
        scaleWobble: 0.04,
        scaleFrequency: 3,
        // Glow - becoming translucent
        glowColor: [0.3, 0.6, 0.95],
        glowIntensityMin: 1.0,
        glowIntensityMax: 2.0,
        glowPulseRate: 5,
        // Liquefy-specific
        meltDown: true,              // Slight downward drift
        formLoss: true,              // Increasing wobble amplitude
        stretchVertical: 0.03        // Vertical stretch (dripping)
    },

    pool: {
        name: 'pool',
        emoji: '🫗',
        type: 'blending',
        description: 'Settling into a pool, spreading wide',
        duration: 2000,
        beats: 3,
        intensity: 0.8,
        category: 'transform',
        // Wobble - gentle settling ripples
        wobbleFrequency: 2,
        wobbleAmplitude: 0.015,
        wobbleDecay: 0.5,
        // Scale - squash (flatten)
        scaleWobble: 0.01,
        scaleFrequency: 1,
        scaleSquash: 0.08,           // Flatten vertically
        scaleStretch: 0.05,          // Spread horizontally
        // Glow - calm pool
        glowColor: [0.25, 0.55, 0.9],
        glowIntensityMin: 1.1,
        glowIntensityMax: 1.4,
        glowPulseRate: 1,
        // Pool-specific
        settleDown: 0.03,            // Sink downward
        spreadOut: true
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOOTH NOISE FOR ORGANIC MOTION
// ═══════════════════════════════════════════════════════════════════════════════════════

function smoothNoise(x) {
    // Combination of sine waves at different frequencies for organic motion
    return (
        Math.sin(x * 1.0) * 0.5 +
        Math.sin(x * 2.3 + 1.3) * 0.3 +
        Math.sin(x * 4.1 + 2.7) * 0.2
    );
}

function smoothNoise2(x, y) {
    return (
        Math.sin(x * 1.0 + y * 0.7) * 0.4 +
        Math.sin(x * 1.7 - y * 1.3 + 1.5) * 0.35 +
        Math.sin(x * 2.9 + y * 2.1 + 3.2) * 0.25
    );
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WATER EFFECT GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Create a water effect gesture (no shatter, just fluid visuals)
 *
 * @param {string} variant - 'splash', 'drench', 'soak', 'flow', 'ripple', 'tide', 'liquefy', 'pool'
 * @returns {Object} Gesture configuration
 */
export function createWaterEffectGesture(variant) {
    const config = WATER_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`Unknown water effect variant: ${variant}`);
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
            syncMode: 'phrase',
            amplitudeSync: {
                onBeat: 1.3,
                offBeat: 1.0,
                curve: 'smooth'        // Smooth for water, not sharp
            }
        },

        /**
         * 3D core transformation for water effect
         * Handles impact (burst), ambient (flow), and transform (liquefy) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000; // Convert to seconds
                const {category} = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH - Varies by category
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Impact: burst then decay
                if (category === 'impact') {
                    if (cfg.impactBurst && progress < cfg.burstDuration) {
                        // Burst phase - quick ramp up
                        effectStrength = progress / cfg.burstDuration;
                        effectStrength = Math.pow(effectStrength, 0.3); // Fast attack
                    } else if (cfg.rampUp) {
                        // Soak - gradual build
                        effectStrength = Math.pow(progress, 0.5);
                    } else {
                        // Standard decay
                        const decayStart = cfg.burstDuration || 0.2;
                        if (progress > decayStart) {
                            const decayProgress = (progress - decayStart) / (1 - decayStart);
                            effectStrength = 1 - Math.pow(decayProgress, cfg.wobbleDecay + 0.5);
                        }
                    }
                }

                // Transform: increasing effect
                if (category === 'transform') {
                    if (cfg.formLoss) {
                        // Liquefy - wobble increases
                        effectStrength = 0.3 + progress * 0.7;
                    } else {
                        // Pool - settle then stable
                        effectStrength = Math.min(progress * 2, 1.0);
                    }
                }

                // Ambient: sustained with gentle pulse
                if (category === 'ambient') {
                    const pulse = Math.sin(progress * Math.PI * 2) * 0.1;
                    effectStrength = 0.8 + pulse + progress * 0.2;
                }

                // Fade out in final phase
                if (progress > 0.85) {
                    const fadeProgress = (progress - 0.85) / 0.15;
                    effectStrength *= (1 - fadeProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flowing/wobbling motion
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.flowFrequency) {
                    // Flow motion - smooth S-curve
                    const flowTime = time * cfg.flowFrequency * Math.PI * 2;
                    posX = Math.sin(flowTime) * cfg.flowAmplitude * effectStrength;

                    if (cfg.flowPhaseOffset) {
                        // S-curve: Y moves opposite to create wave
                        posY = Math.sin(flowTime + Math.PI * cfg.flowPhaseOffset) *
                               cfg.flowAmplitude * 0.5 * effectStrength;
                    }

                    if (cfg.verticalBob) {
                        posY += Math.sin(flowTime * 0.5) * cfg.verticalBob * effectStrength;
                    }
                }

                if (cfg.wobbleAmplitude > 0) {
                    // Wobble motion - multi-frequency for organic feel
                    const wobbleTime = time * cfg.wobbleFrequency;
                    let wobbleStrength = cfg.wobbleAmplitude * effectStrength;

                    // Negative decay = increasing wobble (liquefy)
                    if (cfg.wobbleDecay < 0) {
                        wobbleStrength *= (1 + progress * Math.abs(cfg.wobbleDecay) * 2);
                    }

                    posX += smoothNoise(wobbleTime) * wobbleStrength;
                    posY += smoothNoise(wobbleTime + 33) * wobbleStrength * 0.7;
                    posZ += smoothNoise(wobbleTime + 66) * wobbleStrength * 0.5;
                }

                // Sink/settle effects
                if (cfg.sinkAmount) {
                    posY -= cfg.sinkAmount * effectStrength;
                }
                if (cfg.settleDown) {
                    posY -= cfg.settleDown * progress * effectStrength;
                }
                if (cfg.meltDown) {
                    posY -= 0.02 * progress * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Fluid sway
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationFlow) {
                    // Gentle rotation drift
                    rotY = time * cfg.rotationFlow * effectStrength;
                }

                if (cfg.rotationSway) {
                    // Tilt with flow motion
                    const swayTime = time * (cfg.flowFrequency || 1) * Math.PI * 2;
                    rotZ = Math.sin(swayTime) * cfg.rotationSway * effectStrength;
                }

                // Wobble adds slight rotation instability
                if (cfg.wobbleAmplitude > 0 && category !== 'ambient') {
                    const wobbleTime = time * cfg.wobbleFrequency;
                    const rotWobble = cfg.wobbleAmplitude * 0.3 * effectStrength;
                    rotX += smoothNoise(wobbleTime * 0.7 + 100) * rotWobble;
                    rotZ += smoothNoise(wobbleTime * 0.9 + 150) * rotWobble;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Wobble, breathing, squash/stretch
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0;

                // Base scale wobble
                if (cfg.scaleWobble) {
                    const scaleTime = time * cfg.scaleFrequency * Math.PI * 2;
                    const scaleWave = Math.sin(scaleTime) * 0.5 + 0.5; // 0-1

                    if (cfg.concentricPulse && cfg.pulseCount) {
                        // Multiple ripple peaks
                        const multiPulse = Math.sin(scaleTime * cfg.pulseCount) * 0.5 + 0.5;
                        scale = 1.0 + multiPulse * cfg.scaleWobble * effectStrength;
                    } else {
                        scale = 1.0 + scaleWave * cfg.scaleWobble * effectStrength;
                    }
                }

                // Growth (soak absorbing water)
                if (cfg.scaleGrowth) {
                    scale += cfg.scaleGrowth * progress * effectStrength;
                }

                // Compression (drench weight)
                if (cfg.scaleCompression) {
                    scale += cfg.scaleCompression * effectStrength;
                }

                // Squash and stretch (pool settling)
                if (cfg.scaleSquash) {
                    scaleY = scale - cfg.scaleSquash * progress * effectStrength;
                    scaleX = scale + (cfg.scaleStretch || cfg.scaleSquash * 0.5) * progress * effectStrength;
                    scaleZ = scaleX;
                } else if (cfg.stretchVertical) {
                    // Liquefy drip stretch
                    scaleY = scale + cfg.stretchVertical * progress * effectStrength;
                    scaleX = scale - cfg.stretchVertical * 0.3 * progress * effectStrength;
                    scaleZ = scaleX;
                } else {
                    scaleX = scaleY = scaleZ = scale;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Wet sheen, pulsing
                // ═══════════════════════════════════════════════════════════════
                const glowTime = time * cfg.glowPulseRate * Math.PI * 2;
                let glowPulse = Math.sin(glowTime) * 0.5 + 0.5; // 0-1

                // Impact burst glow
                if (cfg.impactBurst && progress < cfg.burstDuration) {
                    glowPulse = 1.0;
                }

                // Saturation build
                if (cfg.saturationBuild) {
                    glowPulse = Math.max(glowPulse, progress);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * glowPulse * effectStrength;

                const glowBoost = glowPulse * 0.6 * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale: (scaleX + scaleY + scaleZ) / 3, // Average for uniform
                    scaleXYZ: [scaleX, scaleY, scaleZ],    // Non-uniform if needed
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    waterOverlay: {
                        enabled: effectStrength > 0.1,
                        wetness: effectStrength * cfg.intensity,
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

// Impact variants (water hitting mascot)
export const splash = createWaterEffectGesture('splash');
export const drench = createWaterEffectGesture('drench');
export const soak = createWaterEffectGesture('soak');

// Ambient variants (emanating water/fluid)
export const flow = createWaterEffectGesture('flow');
export const ripple = createWaterEffectGesture('ripple');
export const tide = createWaterEffectGesture('tide');

// Transform variants (becoming water)
export const liquefy = createWaterEffectGesture('liquefy');
export const pool = createWaterEffectGesture('pool');

export {
    WATER_EFFECT_VARIANTS
};

export default {
    // Impact
    splash,
    drench,
    soak,
    // Ambient
    flow,
    ripple,
    tide,
    // Transform
    liquefy,
    pool,
    // Factory
    createWaterEffectGesture,
    WATER_EFFECT_VARIANTS
};
