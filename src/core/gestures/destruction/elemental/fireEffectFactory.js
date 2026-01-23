/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for fire effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/fireEffectFactory
 *
 * ## Fire Effect Gestures
 *
 * Two categories of fire gestures:
 *
 * ### Burning (being heated/on fire)
 * - Flames licking across surface
 * - Intense heat effects
 * - Mascot is VICTIM of fire
 *
 * ### Radiating (emanating heat/fire)
 * - Controlled fire aura
 * - Heat wave emanation
 * - Mascot is SOURCE of fire
 *
 * ## Variants
 *
 * | Gesture  | Category  | Effect                              |
 * |----------|-----------|-------------------------------------|
 * | burn     | Burning   | Flames flickering across surface    |
 * | scorch   | Burning   | Intense heat, darkening effect      |
 * | combust  | Burning   | Building pressure, flame burst      |
 * | radiate  | Radiating | Emitting heat waves, warm glow      |
 * | blaze    | Radiating | Powerful fire aura, torch-like      |
 * | smolder  | Radiating | Low simmer, faint ember glow        |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// FIRE EFFECT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const FIRE_EFFECT_VARIANTS = {
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // BURNING VARIANTS - Mascot is being heated/on fire
    // ═══════════════════════════════════════════════════════════════════════════════════════

    burn: {
        name: 'burn',
        emoji: '🔥',
        type: 'blending',
        description: 'Flames flickering across surface, being consumed',
        duration: 2500,
        beats: 4,
        intensity: 1.0,
        category: 'burning',
        temperature: 0.6,              // Active flame temperature
        // Flame flicker motion
        flickerFrequency: 12,          // Fast flickering
        flickerAmplitude: 0.015,       // Subtle position jitter
        flickerDecay: 0.2,
        // Glow - orange/red pulsing
        glowColor: [1.0, 0.5, 0.1],    // Orange
        glowIntensityMin: 1.2,
        glowIntensityMax: 2.5,
        glowFlickerRate: 15,           // Fast erratic flicker
        // Scale - slight pulsing with flames
        scaleVibration: 0.02,
        scaleFrequency: 8,
        // Rise effect - flames rise
        riseAmount: 0.01
    },

    scorch: {
        name: 'scorch',
        emoji: '🫠',
        type: 'blending',
        description: 'Intense heat exposure, surface heating',
        duration: 3000,
        beats: 5,
        intensity: 1.3,
        category: 'burning',
        temperature: 0.8,              // High heat
        // Minimal flicker - more sustained heat
        flickerFrequency: 6,
        flickerAmplitude: 0.008,
        flickerDecay: 0.25,
        // Glow - intense yellow/white
        glowColor: [1.0, 0.8, 0.3],    // Yellow-white
        glowIntensityMin: 1.5,
        glowIntensityMax: 3.5,
        glowFlickerRate: 8,
        // Scale - slight expansion from heat
        scaleVibration: 0.01,
        scaleFrequency: 3,
        heatExpansion: 0.03,           // Grows slightly from heat
        // Heat shimmer
        shimmerEffect: true,
        shimmerIntensity: 0.02
    },

    combust: {
        name: 'combust',
        emoji: '💥',
        type: 'blending',
        description: 'Building heat then sudden flame burst',
        duration: 2000,
        beats: 4,
        intensity: 1.5,
        category: 'burning',
        temperature: 0.9,              // Very hot at burst
        // Buildup then burst
        buildupPhase: 0.6,             // 60% buildup
        burstPhase: 0.4,               // 40% burst
        // Minimal flicker during buildup
        flickerFrequency: 20,
        flickerAmplitude: 0.025,       // Stronger at burst
        flickerDecay: 0.15,
        // Glow - ramps up dramatically
        glowColor: [1.0, 0.6, 0.2],    // Orange-yellow
        glowIntensityMin: 0.8,
        glowIntensityMax: 4.0,         // Bright burst
        glowFlickerRate: 25,
        // Scale - compress then burst
        scaleVibration: 0.03,
        scaleFrequency: 15,
        scaleBurst: 0.08,              // Expands 8% at burst
        // Position burst
        burstJitter: 0.03              // Violent shake at burst
    },

    // ═══════════════════════════════════════════════════════════════════════════════════════
    // RADIATING VARIANTS - Mascot is SOURCE of fire/heat
    // ═══════════════════════════════════════════════════════════════════════════════════════

    radiate: {
        name: 'radiate',
        emoji: '☀️',
        type: 'blending',
        description: 'Emitting heat waves, warm ambient glow',
        duration: 3000,
        beats: 4,
        intensity: 0.8,
        category: 'radiating',
        temperature: 0.4,              // Warm, not hot
        // No jitter - controlled emission
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.3,
        // Glow - gentle warm pulsing
        glowColor: [1.0, 0.7, 0.3],    // Warm orange
        glowIntensityMin: 1.0,
        glowIntensityMax: 1.6,
        glowFlickerRate: 3,            // Slow breathing pulse
        // Scale - gentle breathing
        scaleVibration: 0.015,
        scaleFrequency: 1.5,
        scalePulse: true,              // Smooth sine pulse
        // Heat wave effect
        heatWaves: true,
        waveFrequency: 2
    },

    blaze: {
        name: 'blaze',
        emoji: '🔆',
        type: 'blending',
        description: 'Powerful fire aura, controlled intensity',
        duration: 2500,
        beats: 4,
        intensity: 1.2,
        category: 'radiating',
        temperature: 0.7,              // Hot flame
        // Controlled flicker
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.2,
        // Glow - strong sustained
        glowColor: [1.0, 0.6, 0.15],   // Bright orange
        glowIntensityMin: 1.5,
        glowIntensityMax: 2.8,
        glowFlickerRate: 6,            // Medium pulse
        // Scale - power breathing
        scaleVibration: 0.025,
        scaleFrequency: 2,
        scalePulse: true,
        scaleGrowth: 0.04,             // Grows with power
        // Slight rise
        hover: true,
        hoverAmount: 0.008
    },

    smolder: {
        name: 'smolder',
        emoji: '🪨',
        type: 'blending',
        description: 'Low simmer, faint ember glow',
        duration: 4000,
        beats: 6,
        intensity: 0.4,
        category: 'radiating',
        temperature: 0.15,             // Embers
        // Very subtle flicker
        flickerFrequency: 0,
        flickerAmplitude: 0,
        flickerDecay: 0.4,
        // Glow - deep red, subtle
        glowColor: [0.9, 0.3, 0.1],    // Deep red
        glowIntensityMin: 0.8,
        glowIntensityMax: 1.2,
        glowFlickerRate: 2,            // Very slow
        // Scale - minimal
        scaleVibration: 0.005,
        scaleFrequency: 1,
        scalePulse: true,
        // Smoke hint
        smokeHint: true
    }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM HASH FOR DETERMINISTIC FLICKER
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
 * Create a fire effect gesture (NO shatter - mesh stays intact)
 * @param {string} variant - Variant name from FIRE_EFFECT_VARIANTS
 * @returns {Object} Gesture configuration
 */
export function createFireEffectGesture(variant) {
    const config = FIRE_EFFECT_VARIANTS[variant];
    if (!config) {
        console.warn(`[FIRE_EFFECT] Unknown variant: ${variant}, using burn`);
        return createFireEffectGesture('burn');
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
                onBeat: 1.8,
                offBeat: 1.0,
                curve: config.category === 'radiating' ? 'smooth' : 'sharp'
            }
        },

        /**
         * 3D core transformation for fire effect
         * Handles both burning (victim) and radiating (source) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const isRadiating = cfg.category === 'radiating';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase for combust
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    // Exponential ramp for dramatic buildup
                    effectStrength = Math.pow(effectStrength, 1.5);
                }

                // Burst phase for combust
                if (cfg.burstPhase && progress >= cfg.buildupPhase) {
                    const burstProgress = (progress - cfg.buildupPhase) / cfg.burstPhase;
                    // Quick peak then decay
                    effectStrength = burstProgress < 0.3
                        ? 1.0 + burstProgress * 3.33  // Ramp to 2.0
                        : 2.0 * (1 - (burstProgress - 0.3) / 0.7);  // Decay from 2.0
                }

                // Decay in final phase
                if (progress > (1 - cfg.flickerDecay)) {
                    const decayProgress = (progress - (1 - cfg.flickerDecay)) / cfg.flickerDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flicker (burning) or stable (radiating)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.flickerAmplitude > 0) {
                    const flickerTime = time * cfg.flickerFrequency;

                    // Multi-frequency noise for organic flame flicker
                    posX = (
                        noise1D(flickerTime) - 0.5 +
                        (noise1D(flickerTime * 2.1 + 50) - 0.5) * 0.4
                    ) * cfg.flickerAmplitude * effectStrength;

                    posY = (
                        noise1D(flickerTime + 33) - 0.5 +
                        (noise1D(flickerTime * 1.8 + 83) - 0.5) * 0.5
                    ) * cfg.flickerAmplitude * effectStrength;

                    posZ = (
                        noise1D(flickerTime + 66) - 0.5
                    ) * cfg.flickerAmplitude * effectStrength * 0.5;

                    // Burst jitter for combust
                    if (cfg.burstJitter && progress >= cfg.buildupPhase) {
                        const burstMult = effectStrength > 1.0 ? effectStrength : 0;
                        posX += (noise1D(time * 50) - 0.5) * cfg.burstJitter * burstMult;
                        posY += (noise1D(time * 50 + 100) - 0.5) * cfg.burstJitter * burstMult;
                        posZ += (noise1D(time * 50 + 200) - 0.5) * cfg.burstJitter * burstMult * 0.5;
                    }
                }

                // Rise effect (flames rise)
                if (cfg.riseAmount) {
                    posY += cfg.riseAmount * effectStrength;
                }

                // Hover effect (radiating)
                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Vibration (burning) or breathing (radiating)
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    // Radiating: smooth sine breathing
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;

                    // Growth during blaze/charge
                    if (cfg.scaleGrowth) {
                        scale += cfg.scaleGrowth * effectStrength;
                    }
                } else {
                    // Burning: erratic vibration
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.3) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Heat expansion
                if (cfg.heatExpansion) {
                    scale += cfg.heatExpansion * effectStrength;
                }

                // Burst expansion for combust
                if (cfg.scaleBurst && progress >= cfg.buildupPhase) {
                    const burstMult = effectStrength > 1.0 ? (effectStrength - 1.0) : 0;
                    scale += cfg.scaleBurst * burstMult;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Flickering (burning) or pulsing (radiating)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (isRadiating) {
                    // Radiating: smooth pulsing glow
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else {
                    // Burning: erratic flame flicker
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 4.7 + 1.3);
                    const flicker3 = hash(Math.floor(flickerTime * 3)) > 0.6 ? 1 : 0;
                    flickerValue = (flicker1 * 0.3 + flicker2 * 0.2 + flicker3 * 0.4 + 0.5);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                const glowBoost = (flickerValue * 0.7 + 0.3) * effectStrength * cfg.intensity;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [0, 0, 0],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    fireOverlay: {
                        enabled: effectStrength > 0.1,
                        heat: effectStrength * cfg.intensity,
                        temperature: cfg.temperature,
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

// Burning variants (being heated)
export const burn = createFireEffectGesture('burn');
export const scorch = createFireEffectGesture('scorch');
export const combust = createFireEffectGesture('combust');

// Radiating variants (emanating heat)
export const radiate = createFireEffectGesture('radiate');
export const blaze = createFireEffectGesture('blaze');
export const smolder = createFireEffectGesture('smolder');

export {
    FIRE_EFFECT_VARIANTS
};

export default {
    // Burning
    burn,
    scorch,
    combust,
    // Radiating
    radiate,
    blaze,
    smolder,
    // Factory
    createFireEffectGesture,
    FIRE_EFFECT_VARIANTS
};
