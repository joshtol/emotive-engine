/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Earth Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory for earth/stone/rock effect gestures
 * @author Emotive Engine Team
 * @module gestures/destruction/elemental/earthEffectFactory
 *
 * ## Earth Effect Gestures
 *
 * Four categories of earth gestures:
 *
 * ### Afflicted (being petrified)
 * - Stone spreading across mascot
 * - Becoming heavy, immobile
 *
 * ### Emanating (projecting seismic energy)
 * - Ground shaking, tremors
 * - Rocks and debris floating
 *
 * ### Transform (becoming/breaking stone)
 * - Crystallizing into solid rock
 * - Cracking, shattering stone
 *
 * ### Manifestation (ring/spectacle gestures)
 * - Crown, helix, pillar formations
 * - Radial bursts and impacts
 *
 * Each gesture lives in its own file (earthcrown.js, earthdance.js, etc.)
 * and imports buildEarthEffectGesture from this factory.
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
// GESTURE FACTORY — buildEarthEffectGesture(config)
//
// For individual gesture files (earthcrown.js, earthdance.js, etc.)
// Takes a full config object, returns a complete gesture with 3d.evaluate().
// Same pattern as buildLightEffectGesture / buildVoidEffectGesture.
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build an earth gesture from a full configuration object.
 * Used by individual gesture files that define their own spawnMode, cutout, grain, etc.
 *
 * @param {Object} config - Full gesture configuration
 * @param {string} config.name - Gesture name (e.g. 'earthcrown')
 * @param {string} config.emoji - Display emoji
 * @param {string} config.type - Gesture type (usually 'blending')
 * @param {string} config.description - Human-readable description
 * @param {number} config.duration - Duration in milliseconds
 * @param {number} config.beats - Beat count
 * @param {number} config.intensity - Effect intensity multiplier
 * @param {string} config.category - 'afflicted', 'emanating', 'transform', or 'manifestation'
 * @param {number} [config.petrification=0.5] - Master parameter 0-1
 * @param {Object} [config.spawnMode] - 3D element spawn configuration
 * @param {Array} [config.glowColor] - RGB glow color [r, g, b]
 * @returns {Object} Gesture configuration
 */
export function buildEarthEffectGesture(config) {
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
                onBeat: config.category === 'emanating' ? 1.5 : 1.2,
                offBeat: 1.0,
                curve: config.category === 'emanating' ? 'sharp' : 'smooth'
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

                // Afflicted: gradual petrification
                if (category === 'afflicted' && !cfg.buildupPhase) {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                }

                // Emanating: sudden onset, sustained
                if (category === 'emanating' && !cfg.buildupPhase) {
                    if (cfg.beaconPulse) {
                        const beaconTime = time * (cfg.pulseRate || 1.0);
                        effectStrength = 0.6 + Math.sin(beaconTime * Math.PI * 2) * 0.4;
                    } else {
                        effectStrength = Math.min(1, progress / 0.1);
                    }
                }

                // Transform: building or sudden (shatter)
                if (category === 'transform' && !cfg.buildupPhase) {
                    if (cfg.shatterPoint) {
                        if (progress < cfg.shatterPoint) {
                            effectStrength = Math.pow(progress / cfg.shatterPoint, 0.5);
                        }
                    } else {
                        effectStrength = Math.min(1, progress / 0.25);
                    }
                }

                // Manifestation: smooth buildup (ring/spectacle gestures)
                if (category === 'manifestation' && !cfg.buildupPhase && progress < 0.15) {
                    effectStrength = progress / 0.15;
                }

                // Decay in final phase
                const decayRate = cfg.decayRate || 0.2;
                if (progress > (1 - decayRate)) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    if (cfg.endFlash) {
                        effectStrength *= (1 - decayProgress * 0.99);
                    } else {
                        const easedDecay = decayProgress * decayProgress;
                        effectStrength *= (1 - easedDecay);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Shake (rumble, quake, shatter)
                if (cfg.shakeAmount > 0) {
                    const shakeTime = time * (cfg.shakeFrequency || 15);
                    let shakeStrength = cfg.shakeAmount * effectStrength;

                    if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                        const explodeProgress = (progress - cfg.shatterPoint) / (1 - cfg.shatterPoint);
                        shakeStrength *= (1 + explodeProgress * (cfg.explosionForce || 0.5));
                    }

                    posX += (noise1D(shakeTime) - 0.5) * shakeStrength;
                    posY += (noise1D(shakeTime + 33) - 0.5) * shakeStrength * 0.7;
                    posZ += (noise1D(shakeTime + 66) - 0.5) * shakeStrength * 0.5;
                }

                // Tremor (petrify, encase — movement stopping)
                if (cfg.tremor > 0) {
                    let tremorStrength = cfg.tremor;
                    if (cfg.tremorDecay) {
                        tremorStrength *= (1 - progress * cfg.tremorDecay);
                    }
                    const tremorTime = time * (cfg.tremorFrequency || 4);
                    posX += (noise1D(tremorTime) - 0.5) * tremorStrength * effectStrength;
                    posY += (noise1D(tremorTime + 50) - 0.5) * tremorStrength * 0.5 * effectStrength;
                }

                // Sink (burden, crumble)
                if (cfg.sinkAmount > 0) {
                    const sinkProgress = progress * (1 + (cfg.sinkAcceleration || 0) * progress);
                    posY -= cfg.sinkAmount * sinkProgress * effectStrength;
                }

                // Drift (erode — like sand in wind)
                if (cfg.driftAmount > 0) {
                    const driftTime = time * (cfg.driftSpeed || 1);
                    posX += (noise1D(driftTime) - 0.5) * cfg.driftAmount * effectStrength;
                    posY += (noise1D(driftTime + 50) - 0.5) * cfg.driftAmount * 0.5 * effectStrength;
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
                if (cfg.scaleContract > 0) {
                    scale -= cfg.scaleContract * progress * effectStrength;
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
                // MESH OPACITY — fade for crumbling/eroding
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.5;
                    const endAt = cfg.fadeEndAt || 0.95;
                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        meshOpacity = cfg.fadeCurve === 'accelerating'
                            ? Math.max(0, 1 - Math.pow(fadeProgress, 2))
                            : Math.max(0, 1 - fadeProgress);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW — Earth DARKENS slightly (negative glowBoost)
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 2);
                let flickerValue;

                if (category === 'emanating') {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                    flickerValue *= (0.8 + hash(Math.floor(flickerTime * 3)) * 0.4);
                } else if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    flickerValue = 1.0 + (noise1D(flickerTime * 5) * 0.5);
                } else {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.2 + 0.8;
                }

                const glowMin = cfg.glowIntensityMin || 0.5;
                const glowMax = cfg.glowIntensityMax || 0.8;
                const glowIntensity = glowMin +
                    (glowMax - glowMin) * flickerValue * effectStrength;

                // Negative glow boost — earth DARKENS (opposite of light)
                const glowBoost = -0.15 * effectStrength * cfg.intensity * (cfg.petrification || 0.5);

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
                    earthOverlay: {
                        enabled: effectStrength > 0.01,
                        strength: effectStrength * cfg.intensity,
                        petrification: cfg.petrification || 0.5,
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
    buildEarthEffectGesture
};
