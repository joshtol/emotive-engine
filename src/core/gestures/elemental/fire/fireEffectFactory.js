/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Fire Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory utilities for building fire effect gestures
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
 * ## Gesture Files
 *
 * Each fire gesture is defined in its own self-contained file:
 *
 * | Gesture      | File              | Category  | Effect                              |
 * |--------------|-------------------|-----------|-------------------------------------|
 * | burn         | burn.js           | Burning   | Flames flickering across surface    |
 * | scorch       | scorch.js         | Burning   | Intense heat, darkening effect      |
 * | combust      | combust.js        | Burning   | Building pressure, flame burst      |
 * | flame-vortex | flameVortex.js    | Burning   | Fire tornado spiraling              |
 * | firedance    | firedance.js      | Radiating | Vertical flame rings dancing        |
 * | phoenix      | phoenix.js        | Radiating | Rising rebirth, gyroscope rings     |
 * | radiate      | radiate.js        | Radiating | Emitting heat waves, warm glow      |
 * | blaze        | blaze.js          | Radiating | Powerful fire aura, torch-like      |
 * | smolder      | smolder.js        | Radiating | Low simmer, faint ember glow        |
 */

import { hash, noise1D } from '../../../../utils/noise.js';

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a fire effect gesture from a config object (NO shatter - mesh stays intact)
 * Use this when defining gestures in their own files.
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildFireEffectGesture(config) {
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
                onBeat: 1.8,
                offBeat: 1.0,
                curve: config.category === 'radiating' ? 'smooth' : 'sharp',
            },
        },

        /**
         * 3D core transformation for fire effect
         * Handles both burning (victim) and radiating (source) variants
         * If config provides a custom '3d' evaluate, merge its rotation with fire effects
         */
        '3d': {
            evaluate(progress, motion) {
                // Check for custom evaluate in config
                const customEval = config['3d']?.evaluate;
                const customResult = customEval ? customEval(progress, motion) : null;
                const cfg = { ...config, ...motion };
                const time = (progress * cfg.duration) / 1000;
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
                    effectStrength =
                        burstProgress < 0.3
                            ? 1.0 + burstProgress * 3.33 // Ramp to 2.0
                            : 2.0 * (1 - (burstProgress - 0.3) / 0.7); // Decay from 2.0
                }

                // Decay in final phase
                if (progress > 1 - cfg.flickerDecay) {
                    const decayProgress = (progress - (1 - cfg.flickerDecay)) / cfg.flickerDecay;
                    effectStrength *= 1 - decayProgress;
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flicker (burning) or stable (radiating)
                // ═══════════════════════════════════════════════════════════════
                let posX = 0,
                    posY = 0,
                    posZ = 0;

                if (cfg.flickerAmplitude > 0) {
                    const flickerTime = time * cfg.flickerFrequency;

                    // Multi-frequency noise for organic flame flicker
                    posX =
                        (noise1D(flickerTime) -
                            0.5 +
                            (noise1D(flickerTime * 2.1 + 50) - 0.5) * 0.4) *
                        cfg.flickerAmplitude *
                        effectStrength;

                    posY =
                        (noise1D(flickerTime + 33) -
                            0.5 +
                            (noise1D(flickerTime * 1.8 + 83) - 0.5) * 0.5) *
                        cfg.flickerAmplitude *
                        effectStrength;

                    posZ =
                        (noise1D(flickerTime + 66) - 0.5) *
                        cfg.flickerAmplitude *
                        effectStrength *
                        0.5;

                    // Burst jitter for combust
                    if (cfg.burstJitter && progress >= cfg.buildupPhase) {
                        const burstMult = effectStrength > 1.0 ? effectStrength : 0;
                        posX += (noise1D(time * 50) - 0.5) * cfg.burstJitter * burstMult;
                        posY += (noise1D(time * 50 + 100) - 0.5) * cfg.burstJitter * burstMult;
                        posZ +=
                            (noise1D(time * 50 + 200) - 0.5) * cfg.burstJitter * burstMult * 0.5;
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
                    const scaleNoise =
                        Math.sin(scaleTime * Math.PI * 2) * 0.5 +
                        Math.sin(scaleTime * Math.PI * 3.3) * 0.3;
                    scale = 1.0 + scaleNoise * cfg.scaleVibration * effectStrength;
                }

                // Heat expansion
                if (cfg.heatExpansion) {
                    scale += cfg.heatExpansion * effectStrength;
                }

                // Burst expansion for combust
                if (cfg.scaleBurst && progress >= cfg.buildupPhase) {
                    const burstMult = effectStrength > 1.0 ? effectStrength - 1.0 : 0;
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
                    flickerValue = flicker1 * 0.3 + flicker2 * 0.2 + flicker3 * 0.4 + 0.5;
                }

                const glowIntensity =
                    cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * flickerValue * effectStrength;

                const glowBoost =
                    (flickerValue * 0.7 + 0.3) * effectStrength * cfg.intensity +
                    (cfg.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // ROTATION - Use custom rotation if provided
                // ═══════════════════════════════════════════════════════════════
                const customRotation = customResult?.rotation || [0, 0, 0];
                const rotX = customRotation[0] || 0;
                const rotY = customRotation[1] || 0;
                const rotZ = customRotation[2] || 0;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale,
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    fireOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        heat: effectStrength * cfg.intensity,
                        temperature: cfg.temperature,
                        category: cfg.category,
                        spawnMode: cfg.spawnMode || null,
                        duration: cfg.duration,
                        progress,
                        time,
                        // Phase 11: Pass animation config to ElementSpawner
                        // Use config.spawnMode (not cfg.spawnMode) because motion may override with string
                        animation: config.spawnMode?.animation,
                        models: config.spawnMode?.models,
                        count: config.spawnMode?.count,
                        scale: config.spawnMode?.scale,
                        embedDepth: config.spawnMode?.embedDepth,
                    },
                };
            },
        },
    };
}

export default {
    buildFireEffectGesture,
};
