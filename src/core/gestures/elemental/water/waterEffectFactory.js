/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Water Effect Gesture Factory
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Factory utilities for building water effect gestures
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
 * ## Gesture Files
 *
 * Each water gesture is defined in its own self-contained file:
 *
 * | Gesture  | File              | Category  | Effect                                   |
 * |----------|-------------------|-----------|------------------------------------------|
 * | splash   | watersplash.js    | Impact    | Geyser with rising rings + radial burst  |
 * | drench   | waterdrench.js    | Impact    | Rain from above with pooling at feet     |
 * | soak     | watersoak.js      | Impact    | Slow orbit buildup, gradual saturation   |
 * | flow     | waterflow.js      | Ambient   | Double helix streams rising              |
 * | ripple   | waterripple.js    | Ambient   | Concentric expanding rings               |
 * | tide     | watertide.js      | Ambient   | Orbiting wave elements with tidal rhythm |
 * | liquefy  | waterliquefy.js   | Transform | Gravity drips with velocity stretch      |
 * | pool     | waterpool.js      | Transform | Expanding pool rings with rising bubbles |
 * | vortex   | watervortex.js    | Transform | Dual counter-rotating water spirals      |
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// SMOOTH NOISE FOR ORGANIC MOTION
// ═══════════════════════════════════════════════════════════════════════════════════════

function smoothNoise(x) {
    // Combination of sine waves at different frequencies for organic motion
    return Math.sin(x * 1.0) * 0.5 + Math.sin(x * 2.3 + 1.3) * 0.3 + Math.sin(x * 4.1 + 2.7) * 0.2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Build a water effect gesture from a config object (NO shatter - mesh stays intact)
 * Use this when defining gestures in their own files.
 * @param {Object} config - Full gesture configuration
 * @returns {Object} Gesture configuration
 */
export function buildWaterEffectGesture(config) {
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
            syncMode: 'phrase',
            amplitudeSync: {
                onBeat: 1.3,
                offBeat: 1.0,
                curve: 'smooth', // Smooth for water, not sharp
            },
        },

        /**
         * 3D core transformation for water effect
         * Handles impact (burst), ambient (flow), and transform (liquefy) variants
         * If config provides a custom '3d' evaluate, merge its result
         */
        '3d': {
            evaluate(progress, motion) {
                // Check for custom evaluate in config
                const customEval = config['3d']?.evaluate;
                const customResult = customEval ? customEval(progress, motion) : null;
                const cfg = { ...config, ...motion };
                const time = (progress * cfg.duration) / 1000; // Convert to seconds
                const { category } = cfg;

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
                    effectStrength *= 1 - fadeProgress;
                }

                // ═══════════════════════════════════════════════════════════════
                // POSITION - Flowing/wobbling motion
                // ═══════════════════════════════════════════════════════════════
                let posX = 0,
                    posY = 0,
                    posZ = 0;

                if (cfg.flowFrequency) {
                    // Flow motion - smooth S-curve
                    const flowTime = time * cfg.flowFrequency * Math.PI * 2;
                    posX = Math.sin(flowTime) * cfg.flowAmplitude * effectStrength;

                    if (cfg.flowPhaseOffset) {
                        // S-curve: Y moves opposite to create wave
                        posY =
                            Math.sin(flowTime + Math.PI * cfg.flowPhaseOffset) *
                            cfg.flowAmplitude *
                            0.5 *
                            effectStrength;
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
                        wobbleStrength *= 1 + progress * Math.abs(cfg.wobbleDecay) * 2;
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
                // ROTATION - Fluid sway, use custom rotation if provided
                // ═══════════════════════════════════════════════════════════════
                const customRotation = customResult?.rotation || [0, 0, 0];
                let rotX = customRotation[0] || 0;
                let rotY = customRotation[1] || 0;
                let rotZ = customRotation[2] || 0;

                if (cfg.rotationFlow) {
                    // Gentle rotation drift
                    rotY += time * cfg.rotationFlow * effectStrength;
                }

                if (cfg.rotationSway) {
                    // Tilt with flow motion
                    const swayTime = time * (cfg.flowFrequency || 1) * Math.PI * 2;
                    rotZ += Math.sin(swayTime) * cfg.rotationSway * effectStrength;
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
                let scaleX = 1.0,
                    scaleY = 1.0,
                    scaleZ = 1.0;

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
                    scaleX =
                        scale +
                        (cfg.scaleStretch || cfg.scaleSquash * 0.5) * progress * effectStrength;
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
                const glowTime = time * (cfg.glowPulseRate || 2) * Math.PI * 2;
                let glowPulse = Math.sin(glowTime) * 0.5 + 0.5; // 0-1

                // Impact burst glow
                if (cfg.impactBurst && progress < cfg.burstDuration) {
                    glowPulse = 1.0;
                }

                // Saturation build
                if (cfg.saturationBuild) {
                    glowPulse = Math.max(glowPulse, progress);
                }

                const glowIntensity =
                    cfg.glowIntensityMin +
                    (cfg.glowIntensityMax - cfg.glowIntensityMin) * glowPulse * effectStrength;

                const glowBoost =
                    glowPulse * 0.6 * effectStrength * cfg.intensity +
                    (cfg.mascotGlow || 0) * effectStrength;

                // ═══════════════════════════════════════════════════════════════
                // RETURN TRANSFORMATION
                // ═══════════════════════════════════════════════════════════════
                return {
                    position: [posX, posY, posZ],
                    rotation: [rotX, rotY, rotZ],
                    scale: (scaleX + scaleY + scaleZ) / 3, // Average for uniform
                    scaleXYZ: [scaleX, scaleY, scaleZ], // Non-uniform if needed
                    glowIntensity,
                    glowBoost,
                    glowColorOverride: cfg.glowColor,
                    waterOverlay: {
                        enabled: effectStrength > 0.1,
                        strength: effectStrength * cfg.intensity,
                        wetness: effectStrength * cfg.intensity,
                        turbulence: cfg.turbulence,
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
    buildWaterEffectGesture,
};
