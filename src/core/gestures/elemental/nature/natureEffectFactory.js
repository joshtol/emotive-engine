// ═══════════════════════════════════════════════════════════════════════════════════════
// NATURE EFFECT GESTURE FACTORY
// All nature gestures use individual files with buildNatureEffectGesture
// ═══════════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPERS
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
// MODERN FACTORY — buildNatureEffectGesture(config)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a nature effect gesture from a full config object.
 * Modern pattern matching buildIceEffectGesture / buildElectricEffectGesture.
 *
 * @param {Object} config - Full gesture configuration
 * @param {string} config.name - Gesture name
 * @param {string} config.emoji - Display emoji
 * @param {string} config.type - Gesture type ('blending')
 * @param {string} config.description - Human-readable description
 * @param {number} config.duration - Duration in ms
 * @param {number} config.beats - Beat count
 * @param {number} config.intensity - Effect intensity
 * @param {string} config.category - 'afflicted' | 'emanating' | 'transform'
 * @param {number} config.growth - Growth level 0-1
 * @param {Object} [config.spawnMode] - 3D element spawn configuration
 * @param {Object} [config.cutout] - Cutout effect configuration
 * @param {Object} [config.grain] - Grain effect configuration
 * @returns {Object} Gesture configuration with 3d.evaluate()
 */
export function buildNatureEffectGesture(config) {
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

        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                if (category === 'afflicted') {
                    if (progress < 0.2) effectStrength = progress / 0.2;
                    if (cfg.pulsingGrip) {
                        effectStrength *= Math.sin(time * Math.PI * 3) * 0.15 + 0.85;
                    }
                }

                if (category === 'emanating') {
                    if (progress < 0.15) effectStrength = progress / 0.15;
                    effectStrength *= Math.sin(time * Math.PI * 2) * 0.1 + 0.9;
                }

                if (category === 'transform') {
                    effectStrength = Math.pow(progress, 0.7);
                }

                const decayRate = cfg.decayRate || 0.18;
                if (progress > (1 - decayRate)) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                if (cfg.floatAmount > 0) {
                    posY += Math.sin(time * (cfg.floatSpeed || 1) * Math.PI * 2) * cfg.floatAmount * effectStrength;
                }
                if (cfg.riseAmount > 0) {
                    posY += cfg.riseAmount * progress * effectStrength;
                }
                if (cfg.droopAmount > 0) {
                    posY -= cfg.droopAmount * progress * (1 + (cfg.droopAcceleration || 0) * progress) * effectStrength;
                }
                if (cfg.sinkAmount > 0) {
                    posY -= cfg.sinkAmount * progress * (1 + (cfg.sinkAcceleration || 0) * progress) * effectStrength;
                }
                if (cfg.tremor > 0) {
                    let tremorStr = cfg.tremor;
                    if (cfg.tremorDecay) tremorStr *= (1 - progress * cfg.tremorDecay);
                    const tTime = time * (cfg.tremorFrequency || 4);
                    posX += (noise1D(tTime) - 0.5) * tremorStr * effectStrength;
                    posY += (noise1D(tTime + 50) - 0.5) * tremorStr * 0.5 * effectStrength;
                    posZ += (noise1D(tTime + 100) - 0.5) * tremorStr * 0.3 * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * (cfg.scaleFrequency || 2);

                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * (cfg.scaleVibration || 0.02) * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.6 +
                                      Math.sin(scaleTime * Math.PI * 2.7) * 0.4;
                    scale = 1.0 + scaleNoise * (cfg.scaleVibration || 0.02) * effectStrength;
                }
                if (cfg.scaleGrow > 0) scale += cfg.scaleGrow * progress * effectStrength;
                if (cfg.scaleContract > 0) scale -= cfg.scaleContract * progress * effectStrength;
                if (cfg.scaleShrink > 0) scale -= cfg.scaleShrink * progress * effectStrength;
                scale = Math.max(0.1, scale);

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }
                if (cfg.rotationTwist > 0) {
                    const twistTime = time * (cfg.rotationTwistSpeed || 0.5);
                    rotZ = Math.sin(twistTime * Math.PI * 2) * cfg.rotationTwist * effectStrength;
                }
                if (cfg.rotationTilt > 0) {
                    const tiltProgress = progress * (cfg.rotationTiltSpeed || 0.3);
                    rotX = cfg.rotationTilt * tiltProgress * effectStrength;
                    rotZ += cfg.rotationTilt * 0.5 * tiltProgress * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;
                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.5;
                    const endAt = cfg.fadeEndAt || 0.95;
                    if (progress >= startAt) {
                        const fadeProg = Math.min(1, (progress - startAt) / (endAt - startAt));
                        meshOpacity = Math.max(0, cfg.fadeCurve === 'accelerating' ? 1 - fadeProg * fadeProg : 1 - fadeProg);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 3);
                let flickerValue;
                if (category === 'emanating') {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.2 + 0.8;
                } else if (cfg.pulsingGrip) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.25 + 0.75;
                } else {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.15 + 0.85;
                }
                const glowIntensity = (cfg.glowIntensityMin || 0.5) +
                    ((cfg.glowIntensityMax || 0.8) - (cfg.glowIntensityMin || 0.5)) * flickerValue * effectStrength;
                // mascotGlow: opt-in additive boost to screen-space glow layer
                // Shared pattern — any elemental factory can use config.mascotGlow
                const baseGlowBoost = 0.2 * effectStrength * (cfg.intensity || 1) * (cfg.growth || 0.5);
                const glowBoost = baseGlowBoost + (config.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // RETURN
                // ═══════════════════════════════════════════════════════════════
                return {
                    natureOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * (cfg.intensity || 1),
                        growth: cfg.growth || 0.5,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        time,
                        progress,
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

// Emanating variants (projecting growth)
// sprout — use individual sprout.js file

// Transform variants (becoming nature)
// wilt — use individual wilt.js file
// overgrow — use individual overgrow.js file

export default {
    buildNatureEffectGesture
};
