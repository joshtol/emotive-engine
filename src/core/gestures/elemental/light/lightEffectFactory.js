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
 * Four categories of light gestures:
 *
 * ### Afflicted (overwhelmed by light)
 * - Being blinded by radiance
 * - Purified/cleansed by light
 *
 * ### Emanating (projecting radiance)
 * - Holy aura emanating outward
 * - Glowing with inner light
 *
 * ### Transform (becoming light)
 * - Ascending into pure light
 * - Dissolving into radiance
 *
 * ### Manifestation (ring/spectacle gestures)
 * - Crown, helix, pillar formations
 * - Radial bursts and impacts
 *
 * Each gesture lives in its own file (lightcrown.js, lightdance.js, etc.)
 * and imports buildLightEffectGesture from this factory.
 */

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
// GESTURE FACTORY — buildLightEffectGesture(config)
//
// For individual gesture files (lightcrown.js, lightdance.js, etc.)
// Takes a full config object, returns a complete gesture with 3d.evaluate().
// Same pattern as buildVoidEffectGesture / buildFireEffectGesture.
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a light gesture from a full configuration object.
 * Used by individual gesture files that define their own spawnMode, cutout, grain, etc.
 *
 * @param {Object} config - Full gesture configuration
 * @param {string} config.name - Gesture name (e.g. 'lightcrown')
 * @param {string} config.emoji - Display emoji
 * @param {string} config.type - Gesture type (usually 'blending')
 * @param {string} config.description - Human-readable description
 * @param {number} config.duration - Duration in milliseconds
 * @param {number} config.beats - Beat count
 * @param {number} config.intensity - Effect intensity multiplier
 * @param {string} config.category - 'afflicted', 'emanating', 'transform', or 'manifestation'
 * @param {number} [config.radiance=0.5] - Master parameter 0-1
 * @param {Object} [config.spawnMode] - 3D element spawn configuration
 * @param {Array} [config.glowColor] - RGB glow color [r, g, b]
 * @returns {Object} Gesture configuration
 */
export function buildLightEffectGesture(config) {
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
                onBeat: config.category === 'afflicted' ? 1.5 : 1.3,
                offBeat: 1.0,
                curve: config.category === 'afflicted' ? 'sharp' : 'smooth'
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

                // Buildup phase (custom or default)
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = Math.pow(progress / cfg.buildupPhase, 0.7);
                }

                // Afflicted: flash peak then decay
                if (category === 'afflicted' && !cfg.buildupPhase) {
                    if (cfg.flashPeak) {
                        if (progress < cfg.flashPeak) {
                            effectStrength = Math.pow(progress / cfg.flashPeak, 0.5);
                        } else {
                            effectStrength = 1 - ((progress - cfg.flashPeak) * (cfg.flashDecay || 0.5));
                            effectStrength = Math.max(0.3, effectStrength);
                        }
                    } else if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                }

                // Emanating: sustained with optional beacon pulse
                if (category === 'emanating' && !cfg.buildupPhase) {
                    if (cfg.beaconPulse) {
                        const beaconTime = time * (cfg.pulseRate || 1.5);
                        effectStrength = 0.6 + Math.sin(beaconTime * Math.PI * 2) * 0.4;
                    } else {
                        effectStrength = Math.min(1, progress / 0.15);
                    }
                }

                // Transform: building to transcendence
                if (category === 'transform' && !cfg.buildupPhase && progress < 0.25) {
                    effectStrength = Math.pow(progress / 0.25, 0.7);
                }

                // Manifestation: smooth buildup (ring/spectacle gestures)
                if (category === 'manifestation' && !cfg.buildupPhase && progress < 0.15) {
                    effectStrength = progress / 0.15;
                }

                // Decay in final phase — smooth to zero unless endFlash is set
                const decayRate = cfg.decayRate || 0.2;
                if (progress > (1 - decayRate)) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    if (cfg.endFlash) {
                        // End flash: keep 1% residual for a subtle pop
                        effectStrength *= (1 - decayProgress * 0.99);
                    } else {
                        // Smooth exit: fully fade to zero with eased curve
                        const easedDecay = decayProgress * decayProgress; // Ease-in (slow start, fast finish)
                        effectStrength *= (1 - easedDecay);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Rise (ascend, purify)
                if (cfg.riseAmount > 0) {
                    const riseProgress = Math.pow(progress, 1 + (cfg.ascendAcceleration || 0));
                    posY += cfg.riseAmount * riseProgress * effectStrength;
                }

                // Float (glow, cleanse, illuminate)
                if (cfg.floatAmount > 0) {
                    const floatTime = time * (cfg.floatSpeed || 1);
                    posY += Math.sin(floatTime * Math.PI * 2) * cfg.floatAmount * effectStrength;
                }

                // Recoil (blind)
                if (cfg.recoilAmount > 0) {
                    const recoilTime = time * (cfg.recoilSpeed || 2);
                    const recoilPulse = Math.sin(recoilTime * Math.PI);
                    posZ -= cfg.recoilAmount * recoilPulse * effectStrength;
                }

                // Drift (dissolve)
                if (cfg.driftAmount > 0) {
                    const driftTime = time * (cfg.driftSpeed || 1);
                    posX += (noise1D(driftTime) - 0.5) * cfg.driftAmount * effectStrength;
                    posY += (noise1D(driftTime + 50) - 0.5) * cfg.driftAmount * 0.5 * effectStrength;
                }

                // Tremor (beacon, steady gestures)
                if (cfg.tremor > 0) {
                    const tremorTime = time * (cfg.tremorFrequency || 4);
                    posX += (noise1D(tremorTime) - 0.5) * cfg.tremor * effectStrength;
                    posY += (noise1D(tremorTime + 33) - 0.5) * cfg.tremor * 0.5 * effectStrength;
                }

                // Hover (manifestation — gentle float)
                if (cfg.hover && cfg.hoverAmount) {
                    posY += Math.sin(time * Math.PI * 0.5) * cfg.hoverAmount * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * (cfg.scaleFrequency || 2);

                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * (cfg.scaleVibration || 0.01) * effectStrength;
                } else {
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2);
                    scale = 1.0 + scaleNoise * (cfg.scaleVibration || 0.01) * effectStrength;
                }

                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }
                if (cfg.scaleShrink > 0) {
                    scale -= cfg.scaleShrink * progress * effectStrength;
                    scale = Math.max(0.1, scale);
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                const rotX = 0; let rotY = 0; const rotZ = 0;

                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }
                if (cfg.rotationDrift) {
                    rotY += time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY — fade for transcendence
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.4;
                    const endAt = cfg.fadeEndAt || 0.9;
                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        meshOpacity = cfg.fadeCurve === 'accelerating'
                            ? Math.max(0, 1 - Math.pow(fadeProgress, 2))
                            : Math.max(0, 1 - fadeProgress);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW — light BRIGHTENS (positive glowBoost, opposite of void)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 3);
                let flickerValue;

                if (category === 'afflicted' && cfg.flashPeak) {
                    if (progress < cfg.flashPeak * 2) {
                        flickerValue = 1.0 + Math.sin(flickerTime * Math.PI * 4) * 0.3;
                    } else {
                        flickerValue = 0.7 + Math.sin(flickerTime * Math.PI * 2) * 0.2;
                    }
                } else if (cfg.beaconPulse) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.4 + 0.6;
                } else {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.25 + 0.75;
                }

                const glowMin = cfg.glowIntensityMin || 0.8;
                const glowMax = cfg.glowIntensityMax || 1.4;
                const glowIntensity = glowMin +
                    (glowMax - glowMin) * flickerValue * effectStrength;

                // Positive glow boost — light BRIGHTENS
                const glowBoost = 0.4 * effectStrength * cfg.intensity * (cfg.radiance || 0.5)
                    + (cfg.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    meshOpacity,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: effectStrength > 0.005 ? cfg.glowColor : null,
                    lightOverlay: {
                        enabled: effectStrength > 0.01,
                        strength: effectStrength * cfg.intensity,
                        radiance: cfg.radiance || 0.5,
                        category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth,
                        distortionStrength: config.distortionStrength,
                    }
                };
            }
        }
    };
}

export default {
    buildLightEffectGesture
};
