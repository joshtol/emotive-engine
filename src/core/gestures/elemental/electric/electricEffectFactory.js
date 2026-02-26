/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Electric Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for electric effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/electricEffectFactory
 *
 * ## Electric Effect Gestures
 *
 * Two categories of electric gestures:
 *
 * ### Electrocution (being shocked)
 * - Rapid position jitter
 * - Violent shaking
 * - Mascot is VICTIM of electricity
 *
 * ### Powered (emanating energy)
 * - Gentle scale pulsing
 * - Controlled motion
 * - Mascot is SOURCE of electricity
 *
 * ## Variants
 *
 * | Gesture            | Category    | Effect                              |
 * |--------------------|-------------|-------------------------------------|
 * | shock              | Electrocute | Brief electric surge, jittery       |
 * | overload           | Electrocute | Intense buildup, extreme vibration  |
 * | glitch             | Electrocute | Digital corruption, displacement    |
 * | crackle            | Powered     | Ambient energy, gentle pulse        |
 * | chargeUp           | Powered     | Building power, growing intensity   |
 * | electricAuraEffect | Powered     | Emanating field, slow rotation      |
 * | staticDischarge    | Powered     | Low-level ambient, subtle sparks    |
 */

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
 * Build an electric effect gesture from a full config object.
 * This is the modern pattern matching fire/water/ice.
 *
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildElectricEffectGesture(config) {
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
                onBeat: 1.5,
                offBeat: 1.0,
                curve: config.category === 'powered' ? 'smooth' : 'sharp'
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const isPowered = cfg.category === 'powered';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = progress / cfg.buildupPhase;
                    if (cfg.buildupGlowRamp) {
                        effectStrength = Math.pow(effectStrength, 0.5);
                    }
                }

                if (cfg.rampUp) {
                    effectStrength = Math.pow(progress, 0.7);
                }

                if (progress > (1 - cfg.jitterDecay)) {
                    const decayProgress = (progress - (1 - cfg.jitterDecay)) / cfg.jitterDecay;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Jitter (electrocution) or controlled (powered)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.jitterAmplitude > 0) {
                    const jitterTime = time * cfg.jitterFrequency;

                    let holdMultiplier = 1.0;
                    if (cfg.holdFrames) {
                        const holdCheck = hash(Math.floor(jitterTime * 3));
                        if (holdCheck < cfg.holdProbability) {
                            holdMultiplier = 0.1;
                        }
                    }

                    posX = (
                        noise1D(jitterTime) - 0.5 +
                        (noise1D(jitterTime * 2.3 + 50) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 4.7 + 100) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posY = (
                        noise1D(jitterTime + 33) - 0.5 +
                        (noise1D(jitterTime * 2.1 + 83) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 5.3 + 133) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier;

                    posZ = (
                        noise1D(jitterTime + 66) - 0.5 +
                        (noise1D(jitterTime * 1.9 + 116) - 0.5) * 0.5 +
                        (noise1D(jitterTime * 3.7 + 166) - 0.5) * 0.25
                    ) * cfg.jitterAmplitude * effectStrength * holdMultiplier * 0.5;
                }

                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }
                if (cfg.riseAmount) {
                    posY += cfg.riseAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (!isPowered && cfg.jitterAmplitude > 0) {
                    const jitterTime = time * cfg.jitterFrequency;
                    const rotJitterAmt = cfg.jitterAmplitude * 2;
                    rotX = (noise1D(jitterTime * 1.3 + 200) - 0.5) * rotJitterAmt * effectStrength;
                    rotY = (noise1D(jitterTime * 1.7 + 250) - 0.5) * rotJitterAmt * effectStrength;
                    rotZ = (noise1D(jitterTime * 2.1 + 300) - 0.5) * rotJitterAmt * effectStrength * 0.5;
                } else if (cfg.rotationDrift) {
                    rotY = time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * cfg.scaleFrequency;

                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + breathe * cfg.scaleVibration * effectStrength;
                    if (cfg.scaleGrowth) {
                        scale += cfg.scaleGrowth * effectStrength;
                    }
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * cfg.glowFlickerRate;
                let flickerValue;

                if (isPowered) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                    if (cfg.sparkBursts && hash(Math.floor(time * 10)) < cfg.sparkProbability) {
                        flickerValue = 1.0;
                    }
                } else {
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 5.3 + 1.7);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.7 ? 1 : 0;
                    flickerValue = (flicker1 * 0.4 + flicker2 * 0.3 + flicker3 * 0.5 + 0.5);
                }

                const glowIntensity = cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;
                const glowBoost = (flickerValue * 0.8 + 0.2) * effectStrength * cfg.intensity
                    + (cfg.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // RETURN — with new instanced spawner fields
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    electricOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        charge: effectStrength * cfg.intensity,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        // Pass animation config to ElementSpawner
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth
                    }
                };
            }
        }
    };
}

// Individual electric gestures are in their own files (electricshock.js, electriccrown.js, etc.)
// and import buildElectricEffectGesture from this file. They are aggregated in gestures/index.js.
