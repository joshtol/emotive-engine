// ═══════════════════════════════════════════════════════════════════════════════════════
// VOID EFFECT GESTURE FACTORY
// All void gestures use individual files with buildVoidEffectGesture
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
// MODERN GESTURE FACTORY (config-based — for individual gesture files)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a void effect gesture from a config object.
 * Use this when defining gestures in their own files (crown, vortex, barrage, etc.)
 *
 * Categories:
 * - absorption: draining energy, pulling inward
 * - corruption: spreading darkness, life force being consumed
 * - annihilation: total erasure, collapsing to nothing
 * - manifestation: controlled void energy, rings and spectacles
 *
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildVoidEffectGesture(config) {
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
                curve: config.category === 'manifestation' ? 'smooth' : 'sharp'
            }
        },

        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = progress * cfg.duration / 1000;
                const { category } = cfg;
                const isManifestation = category === 'manifestation';

                // ═══════════════════════════════════════════════════════════════
                // PHASE CALCULATION
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Buildup phase
                if (cfg.buildupPhase && progress < cfg.buildupPhase) {
                    effectStrength = Math.pow(progress / cfg.buildupPhase, 0.7);
                }

                // Absorption: gradual buildup
                if (category === 'absorption' && !cfg.buildupPhase && progress < 0.25) {
                    effectStrength = Math.pow(progress / 0.25, 0.7);
                }

                // Corruption: spreading with pulse
                if (category === 'corruption') {
                    if (!cfg.buildupPhase && progress < 0.3) {
                        effectStrength = progress / 0.3;
                    }
                    if (cfg.spreadPulse) {
                        effectStrength *= (1 + Math.sin(time * Math.PI * 3) * 0.15);
                    }
                }

                // Annihilation: collapse phase
                if (category === 'annihilation' && cfg.collapsePhase) {
                    if (progress < cfg.collapsePhase) {
                        effectStrength = Math.pow(progress / cfg.collapsePhase, 1.5);
                    }
                }

                // Decay in final phase
                const decayRate = cfg.decayRate || 0.2;
                if (progress > (1 - decayRate)) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    effectStrength *= (1 - decayProgress);
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION
                // ═══════════════════════════════════════════════════════════════
                let posX = 0, posY = 0, posZ = 0;

                // Pull toward center (absorption/annihilation)
                if (cfg.pullStrength > 0) {
                    const pullTime = time * (cfg.spiralRate || 1);
                    const pullAmount = cfg.pullStrength * effectStrength * (1 - progress * 0.5);
                    posX += Math.cos(pullTime * Math.PI * 2) * pullAmount;
                    posZ += Math.sin(pullTime * Math.PI * 2) * pullAmount;
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

                // Drift
                if (cfg.driftAmount > 0) {
                    const driftTime = time * cfg.driftSpeed;
                    posX += Math.sin(driftTime * Math.PI) * cfg.driftAmount * effectStrength;
                    posZ += Math.cos(driftTime * Math.PI * 0.7) * cfg.driftAmount * effectStrength * 0.5;
                }

                // Droop (wither — sinking down)
                if (cfg.droopAmount > 0) {
                    posY -= cfg.droopAmount * progress * (1 + cfg.droopAcceleration * progress) * effectStrength;
                }

                // Rise (erase — floating away)
                if (cfg.riseAmount > 0) {
                    posY += cfg.riseAmount * progress * effectStrength;
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
                    const scaleNoise = Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                                      Math.sin(scaleTime * Math.PI * 3.7) * 0.3;
                    scale = 1.0 + scaleNoise * (cfg.scaleVibration || 0.01) * effectStrength;
                }

                if (cfg.scaleShrink > 0) {
                    const shrinkProgress = category === 'annihilation'
                        ? Math.pow(progress, 1.5)
                        : progress;
                    scale -= cfg.scaleShrink * shrinkProgress * effectStrength;
                    scale = Math.max(0.01, scale);
                }

                if (cfg.scaleGrowth) {
                    scale += cfg.scaleGrowth * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // ROTATION
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0, rotY = 0, rotZ = 0;

                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                    if (category === 'annihilation') {
                        rotY *= (1 + progress);
                    }
                }

                if (cfg.rotationWobble > 0) {
                    const wobbleTime = time * cfg.rotationWobbleSpeed;
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ = Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) * cfg.rotationWobble * 0.7 * effectStrength;
                }

                if (cfg.rotationDrift) {
                    rotY += time * cfg.rotationDrift * effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // MESH OPACITY — fade for annihilation
                // ═══════════════════════════════════════════════════════════════
                let meshOpacity = 1.0;

                if (cfg.fadeOut) {
                    const startAt = cfg.fadeStartAt || 0.2;
                    const endAt = cfg.fadeEndAt || 0.9;
                    if (progress >= startAt) {
                        const fadeProgress = Math.min(1, (progress - startAt) / (endAt - startAt));
                        meshOpacity = cfg.fadeCurve === 'accelerating'
                            ? Math.max(0, 1 - Math.pow(fadeProgress, 2))
                            : Math.max(0, 1 - fadeProgress);
                    }
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW — void DIMS rather than brightens
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 2);
                let flickerValue;

                if (isManifestation) {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else if (category === 'absorption') {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                } else if (category === 'corruption') {
                    const flicker1 = Math.sin(flickerTime * Math.PI * 2);
                    const flicker2 = Math.sin(flickerTime * Math.PI * 3.3 + 1);
                    const flicker3 = hash(Math.floor(flickerTime * 2)) > 0.5 ? 0.8 : 1.2;
                    flickerValue = (flicker1 * 0.2 + flicker2 * 0.2 + 0.3) * flicker3;
                } else {
                    // Annihilation: rapid desperate flicker
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.4 + 0.6;
                    flickerValue *= (1 - progress * 0.5);
                }

                // Glow intensity: lerp from 1.0 (neutral) toward dimmed range based on effectStrength.
                // At effectStrength=0 → glowIntensity=1.0 (no dimming, smooth exit).
                // At effectStrength=1 → glowIntensity oscillates between min and max.
                const glowMin = cfg.glowIntensityMin || 0.4;
                const glowMax = cfg.glowIntensityMax || 0.7;
                const glowRange = glowMin + (glowMax - glowMin) * flickerValue;
                const glowIntensity = 1.0 + (glowRange - 1.0) * effectStrength;

                // Negative glow boost — void DIMS
                const glowBoost = -(cfg.dimStrength || 0.3) * effectStrength * cfg.intensity;

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
                    voidOverlay: {
                        enabled: effectStrength > 0.01,
                        strength: effectStrength * cfg.intensity,
                        depth: cfg.depth || 0.5,
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRE-BUILT GESTURES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Absorption variants (becoming void)
// siphon removed — was factory-only

// Corruption variants (being corrupted)
// taint removed — was factory-only
// wither removed — was factory-only

// Annihilation variants (being erased)
// erase removed — was factory-only
// consume, corrupt, drain, hollow, singularity: modern pattern from individual files

// ═══════════════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL GESTURE IMPORTS (modern pattern — each gesture in its own file)
// ═══════════════════════════════════════════════════════════════════════════════════════

// Upgraded character gestures (multi-layer configs in individual files)
import consumeGesture from './voidconsume.js';
import corruptGesture from './voidcorrupt.js';
import drainGesture from './voiddrain.js';
import hollowGesture from './voidhollow.js';

// Ring gestures (void-ring/void-wrap — spectacle effects)
import crownGesture from './voidcrown.js';
import danceGesture from './voiddance.js';
import helixGesture from './voidhelix.js';
import pillarGesture from './voidpillar.js';
import drillGesture from './voiddrill.js';
import flourishGesture from './voidflourish.js';
import vortexGesture from './voidvortex.js';
import barrageGesture from './voidbarrage.js';
import impactGesture from './voidimpact.js';
import singularityGesture from './voidsingularity.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS — Both legacy and new pattern
// ═══════════════════════════════════════════════════════════════════════════════════════

// Modern character gesture exports
export const consume = consumeGesture;
export const corrupt = corruptGesture;
export const drain = drainGesture;
export const hollow = hollowGesture;

// Ring gesture exports
export const voidCrown = crownGesture;
export const voidDance = danceGesture;
export const voidHelix = helixGesture;
export const voidPillar = pillarGesture;
export const voidDrill = drillGesture;
export const voidFlourish = flourishGesture;
export const voidVortex = vortexGesture;
export const voidBarrage = barrageGesture;
export const voidImpact = impactGesture;
export const voidSingularity = singularityGesture;
export const singularity = singularityGesture;  // Backwards compat alias

export default {
    // Character gestures
    drain,
    hollow,
    corrupt,
    consume,
    singularity,
    // Ring gestures
    voidCrown,
    voidDance,
    voidHelix,
    voidPillar,
    voidDrill,
    voidFlourish,
    voidVortex,
    voidBarrage,
    voidImpact,
    voidSingularity,
    // Factory
    buildVoidEffectGesture
};
