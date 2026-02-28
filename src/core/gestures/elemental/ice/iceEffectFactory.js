// ═══════════════════════════════════════════════════════════════════════════════════════
// ICE EFFECT GESTURE FACTORY
// All ice gestures use individual files with buildIceEffectGesture
// ═══════════════════════════════════════════════════════════════════════════════════════

import { hash, noise1D } from '../../../../utils/noise.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE FACTORY - CONFIG-BASED (for individual gesture files)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build an ice effect gesture from a config object
 * Use this when defining gestures in their own files (like fire/water pattern).
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildIceEffectGesture(config) {
    return {
        name: config.name,
        emoji: config.emoji,
        type: config.type,
        description: config.description,

        config: {
            duration: config.duration,
            beats: config.beats,
            intensity: config.intensity,
            ...config,
        },

        rhythm: {
            enabled: true,
            syncMode: 'beat',
            amplitudeSync: {
                onBeat: config.category === 'transform' ? 1.4 : 1.2,
                offBeat: 1.0,
                curve: 'smooth',
            },
        },

        /**
         * 3D core transformation for ice effect
         * Handles afflicted (freezing), emanating (frost), and transform (crystallize) variants
         */
        '3d': {
            evaluate(progress, motion) {
                const cfg = { ...config, ...motion };
                const time = (progress * cfg.duration) / 1000;
                const { category } = cfg;

                // ═══════════════════════════════════════════════════════════════
                // EFFECT STRENGTH
                // ═══════════════════════════════════════════════════════════════
                let effectStrength = 1.0;

                // Afflicted: gradual buildup
                if (category === 'afflicted') {
                    if (progress < 0.2) {
                        effectStrength = progress / 0.2;
                    }
                    // Thaw decreases over time
                    if (cfg.frostDecay) {
                        effectStrength *= 1 - progress * 0.6;
                    }
                }

                // Emanating: pulse outward
                if (category === 'emanating') {
                    const pulse = Math.sin(time * Math.PI * 2) * 0.2 + 0.8;
                    effectStrength *= pulse;
                }

                // Transform: accelerating or shatter timing
                if (category === 'transform') {
                    if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                        // Post-shatter rapid decay
                        effectStrength = 1 - (progress - cfg.shatterPoint) / (1 - cfg.shatterPoint);
                    } else {
                        effectStrength = Math.min(1, progress / 0.3);
                    }
                }

                // Decay in final phase
                const decayRate = cfg.decayRate || 0.15;
                if (progress > 1 - decayRate) {
                    const decayProgress = (progress - (1 - decayRate)) / decayRate;
                    effectStrength *= 1 - decayProgress;
                }

                // ═══════════════════════════════════════════════════════════════
                // FROST LEVEL - Determines overlay intensity
                // ═══════════════════════════════════════════════════════════════
                let frostLevel = cfg.frost || 0.5;
                if (cfg.frostDecay) {
                    frostLevel *= 1 - progress * 0.7;
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Tremor, shiver, explosion
                // ═══════════════════════════════════════════════════════════════
                let posX = 0,
                    posY = 0,
                    posZ = 0;

                // Tremor (freezing in place)
                if (cfg.tremor > 0) {
                    let tremorStrength = cfg.tremor;
                    if (cfg.tremorDecay) {
                        tremorStrength *= 1 - progress * cfg.tremorDecay;
                    }
                    const tremorTime = time * (cfg.tremorFrequency || 8);
                    posX += (noise1D(tremorTime) - 0.5) * tremorStrength * effectStrength;
                    posY +=
                        (noise1D(tremorTime + 50) - 0.5) * tremorStrength * effectStrength * 0.5;
                    posZ +=
                        (noise1D(tremorTime + 100) - 0.5) * tremorStrength * effectStrength * 0.3;
                }

                // Shivering (chill)
                if (cfg.shiverAmount > 0) {
                    const shiverTime = time * (cfg.shiverFrequency || 12);
                    posX += Math.sin(shiverTime * Math.PI * 2) * cfg.shiverAmount * effectStrength;
                    posY +=
                        Math.cos(shiverTime * Math.PI * 3.1) *
                        cfg.shiverAmount *
                        0.5 *
                        effectStrength;
                }

                // Jitter (frostbite cracking)
                if (cfg.jitterAmount > 0) {
                    const jitterTime = time * (cfg.jitterFrequency || 15);
                    if (hash(Math.floor(jitterTime)) > 0.7) {
                        posX += (hash(jitterTime) - 0.5) * cfg.jitterAmount * effectStrength;
                        posY +=
                            (hash(jitterTime + 10) - 0.5) * cfg.jitterAmount * 0.5 * effectStrength;
                    }
                }

                // Droop (thaw melting)
                if (cfg.droopAmount > 0) {
                    const droopProgress =
                        progress * (1 + (cfg.droopAcceleration || 0.3) * progress);
                    posY -= cfg.droopAmount * droopProgress * effectStrength;
                }

                // Explosion (shatter)
                if (cfg.explosionForce > 0 && cfg.shatterPoint && progress > cfg.shatterPoint) {
                    const explodeProgress = (progress - cfg.shatterPoint) / (1 - cfg.shatterPoint);
                    const explodeStrength = cfg.explosionForce * explodeProgress;
                    posX += (noise1D(time * 20) - 0.5) * explodeStrength;
                    posY += (noise1D(time * 20 + 33) - 0.5) * explodeStrength;
                    posZ += (noise1D(time * 20 + 66) - 0.5) * explodeStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // SCALE - Contraction, expansion, crystalline growth
                // ═══════════════════════════════════════════════════════════════
                let scale = 1.0;
                const scaleTime = time * (cfg.scaleFrequency || 3);

                // Base vibration
                if (cfg.scalePulse) {
                    const breathe = Math.sin(scaleTime * Math.PI * 2) * 0.5 + 0.5;
                    scale = 1.0 + (breathe - 0.5) * (cfg.scaleVibration || 0.015) * effectStrength;
                } else if (cfg.scaleVibration) {
                    const scaleNoise =
                        Math.sin(scaleTime * Math.PI * 2) * 0.6 +
                        Math.sin(scaleTime * Math.PI * 2.7) * 0.4;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Contraction (freezing)
                if (cfg.scaleContract > 0) {
                    scale -= cfg.scaleContract * progress * effectStrength;
                }

                // Expansion (thaw, crystalline growth)
                if (cfg.scaleExpand > 0) {
                    scale += cfg.scaleExpand * progress * effectStrength;
                }
                if (cfg.scaleGrow > 0) {
                    scale += cfg.scaleGrow * progress * effectStrength;
                }

                // Shatter: rapid scale changes
                if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    scale += (noise1D(time * 15) - 0.5) * 0.1;
                }

                scale = Math.max(0.1, scale);

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Crystalline, shatter chaos
                // ═══════════════════════════════════════════════════════════════
                let rotX = 0,
                    rotY = 0,
                    rotZ = 0;

                // Slow rotation (crystallize)
                if (cfg.rotationSpeed > 0) {
                    rotY = time * cfg.rotationSpeed * Math.PI * 2 * effectStrength;
                }

                // Wobble (frostbite, shatter)
                if (cfg.rotationWobble > 0) {
                    const wobbleTime = time * (cfg.rotationWobbleSpeed || 1.5);
                    rotX = Math.sin(wobbleTime * Math.PI * 2) * cfg.rotationWobble * effectStrength;
                    rotZ =
                        Math.sin(wobbleTime * Math.PI * 1.7 + 0.5) *
                        cfg.rotationWobble *
                        0.7 *
                        effectStrength;
                }

                // ═══════════════════════════════════════════════════════════════
                // GLOW - Icy blue emanation
                // ═══════════════════════════════════════════════════════════════
                const flickerTime = time * (cfg.glowFlickerRate || 2);
                let flickerValue;

                if (cfg.shatterPoint && progress > cfg.shatterPoint) {
                    // Shatter: bright flash
                    flickerValue = 1.0 + hash(flickerTime * 5) * 0.5;
                } else {
                    flickerValue = Math.sin(flickerTime * Math.PI * 2) * 0.3 + 0.7;
                }

                const glowIntensity =
                    (cfg.glowIntensityMin || 0.5) +
                    ((cfg.glowIntensityMax || 0.8) - (cfg.glowIntensityMin || 0.5)) *
                        flickerValue *
                        effectStrength;

                // Ice glow boost - cold blue shimmer
                const glowBoost =
                    0.15 * effectStrength * cfg.intensity * frostLevel +
                    (cfg.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    iceOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        frost: frostLevel,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        time,
                        progress,
                        duration: cfg.duration,
                        // Pass animation config to ElementSpawner
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth,
                    },
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                };
            },
        },
    };
}

// Individual ice gestures are in their own files (icecrown.js, icedance.js, etc.)
// and import buildIceEffectGesture from this file. They are aggregated in gestures/index.js.
